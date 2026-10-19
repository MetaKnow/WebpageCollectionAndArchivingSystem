/* ==========================================================================
   用户管理 — 系统账号、角色与主办单位（PROTOTYPE — 非生产实现）
   数据：WCR.ADMIN.users / WCR.ADMIN.roles（与角色权限页共享）
   ========================================================================== */
(function (global) {
  "use strict";

  var WCR = global.WCR || {};
  var ADMIN = WCR.ADMIN;
  var state = null;
  var session = null;
  var els = null;
  var modal = null;
  var modalKeyHandler = null;
  var modalReturnFocus = null;
  var scope = { own: false, org: "" };

  function esc(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, function (ch) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
      }[ch];
    });
  }

  function toast(message, type) {
    if (WCR.ui && WCR.ui.toast) WCR.ui.toast(message, type);
  }

  function allUsers() {
    return ADMIN.users;
  }

  function users() {
    if (!scope.own) return ADMIN.users;
    return ADMIN.users.filter(function (user) {
      return user.org === scope.org;
    });
  }

  function roles() {
    return ADMIN.roles;
  }

  function availableRoles() {
    if (!scope.own) return roles();
    return roles().filter(function (role) {
      return role.scope === "own" || role.id === "site-admin" || role.id === "site-clerk";
    });
  }

  function roleById(id) {
    var found = null;
    roles().some(function (role) {
      if (role.id !== id) return false;
      found = role;
      return true;
    });
    return found;
  }

  function isSelf(user) {
    return !!(session && user && user.username === session.username);
  }

  function nextUserId() {
    var max = 0;
    allUsers().forEach(function (user) {
      var match = /^u(\d+)$/.exec(user.id);
      if (match) max = Math.max(max, parseInt(match[1], 10));
    });
    return "u" + (max + 1);
  }

  function orgList() {
    if (scope.own) return [scope.org];
    var values = [];
    allUsers().forEach(function (user) {
      if (values.indexOf(user.org) < 0) values.push(user.org);
    });
    return values.sort();
  }

  function statusLabel(status) {
    return status === "disabled" ? "停用" : "启用";
  }

  function statusPill(status) {
    return (
      '<span class="pill ' +
      (status === "disabled" ? "pill--muted" : "pill--success") +
      '">' +
      statusLabel(status) +
      "</span>"
    );
  }

  function roleName(id) {
    var role = roleById(id);
    return role ? role.name : "未分配";
  }

  function roleOptionsHtml(selectedId, includeDisabled) {
    return availableRoles()
      .map(function (role) {
        var disabled = !includeDisabled && role.status !== "active" && role.id !== selectedId;
        return (
          '<option value="' +
          esc(role.id) +
          '"' +
          (role.id === selectedId ? " selected" : "") +
          (disabled ? " disabled" : "") +
          ">" +
          esc(role.name) +
          (role.status !== "active" ? "（已停用）" : "") +
          "</option>"
        );
      })
      .join("");
  }

  function orgOptionsHtml() {
    return orgList()
      .map(function (org) {
        return '<option value="' + esc(org) + '"></option>';
      })
      .join("");
  }

  /* ---------- 页面骨架 ---------- */
  function shellHtml() {
    return (
      '<div class="page users-page">' +
      '<div class="page-head">' +
      "<div><h1>用户管理</h1></div>" +
      '<div class="page-actions">' +
      '<button class="btn btn--primary" type="button" id="usersAdd">' +
      '<svg class="icon icon--sm" aria-hidden="true"><use href="#icon-plus"/></svg>' +
      "新增用户</button>" +
      "</div></div>" +
      '<section class="card users-card" aria-labelledby="usersTitle">' +
      '<div class="users-toolbar">' +
      '<div class="control control--icon users-search">' +
      '<svg class="icon control-icon" aria-hidden="true"><use href="#icon-search"/></svg>' +
      '<input class="input" id="userSearch" type="search" placeholder="搜索用户名、姓名或主办单位" aria-label="搜索用户" autocomplete="off" />' +
      "</div>" +
      '<div class="users-filters">' +
      '<div class="select-wrap users-filter">' +
      '<select class="select" id="userRoleFilter" aria-label="按角色筛选">' +
      '<option value="">全部角色</option>' +
      roleOptionsHtml("", true) +
      "</select>" +
      '<svg class="icon icon--sm" aria-hidden="true"><use href="#icon-chevron-down"/></svg>' +
      "</div>" +
      '<div class="select-wrap users-filter">' +
      '<select class="select" id="userStatusFilter" aria-label="按状态筛选">' +
      '<option value="">全部状态</option><option value="active">启用</option><option value="disabled">停用</option>' +
      "</select>" +
      '<svg class="icon icon--sm" aria-hidden="true"><use href="#icon-chevron-down"/></svg>' +
      "</div>" +
      '<span class="users-count" id="usersCount" aria-live="polite"></span>' +
      "</div></div>" +
      '<div class="table-wrap" id="usersTableWrap">' +
      '<table class="data-table users-table">' +
      "<caption class=\"visually-hidden\">系统用户列表</caption>" +
      "<thead><tr>" +
      "<th scope=\"col\">用户名</th><th scope=\"col\">姓名</th><th scope=\"col\">角色</th>" +
      "<th scope=\"col\">主办单位</th><th scope=\"col\">状态</th><th scope=\"col\">最近登录</th>" +
      "<th scope=\"col\">操作</th>" +
      "</tr></thead>" +
      '<tbody id="usersBody"></tbody>' +
      "</table></div>" +
      '<p class="table-scroll-hint">左右滑动查看完整用户表</p>' +
      '<div class="empty users-empty" id="usersEmpty" hidden>' +
      '<svg class="empty-art" aria-hidden="true"><use href="#icon-user"/></svg>' +
      '<p class="empty-title" id="usersEmptyTitle"></p>' +
      '<p class="empty-hint" id="usersEmptyHint"></p>' +
      '<button class="btn" type="button" id="usersEmptyAction" data-empty-action="clear"></button>' +
      "</div>" +
      '<div class="table-foot"><span id="usersFoot"></span><span>修改仅当前会话生效</span></div>' +
      "</section>" +
      '<div class="modal-layer" id="usersModal" hidden>' +
      '<div class="modal-mask" data-modal-close></div>' +
      '<div class="modal" id="usersDialog" role="dialog" aria-modal="true" aria-labelledby="usersModalTitle" tabindex="-1">' +
      '<div class="modal-head"><h2 id="usersModalTitle"></h2>' +
      '<button class="icon-btn" type="button" data-modal-close aria-label="关闭">' +
      '<svg class="icon" aria-hidden="true"><use href="#icon-x"/></svg></button></div>' +
      '<div class="modal-body" id="usersModalBody"></div>' +
      '<div class="modal-foot" id="usersModalFoot"></div>' +
      "</div></div>" +
      "</div>"
    );
  }

  /* ---------- 列表 ---------- */
  function filteredUsers() {
    var query = state.query.trim().toLowerCase();
    return users().filter(function (user) {
      if (state.role && user.roleId !== state.role) return false;
      if (state.status && user.status !== state.status) return false;
      if (!query) return true;
      return [user.username, user.name, user.org, roleName(user.roleId)]
        .join(" ")
        .toLowerCase()
        .indexOf(query) >= 0;
    });
  }

  function rowHtml(user) {
    var self = isSelf(user);
    var toggleLabel = user.status === "active" ? "停用" : "启用";
    var toggleTitle = self ? "当前登录账号不可停用" : "切换账号状态";
    var deleteTitle = self ? "当前登录账号不可删除" : "删除用户";
    return (
      '<tr data-user-row="' +
      esc(user.id) +
      '">' +
      '<td><span class="user-account">' +
      esc(user.username) +
      "</span></td>" +
      '<td><span class="user-name">' +
      esc(user.name) +
      (self ? '<span class="pill pill--neutral user-self">本人</span>' : "") +
      "</span></td>" +
      "<td>" +
      esc(roleName(user.roleId)) +
      "</td>" +
      "<td>" +
      esc(user.org) +
      "</td>" +
      "<td>" +
      statusPill(user.status) +
      "</td>" +
      '<td class="cell-time">' +
      esc(user.lastLogin || "—") +
      "</td>" +
      '<td class="cell-actions">' +
      '<button class="btn btn--link" type="button" data-user-edit="' +
      esc(user.id) +
      '">编辑</button>' +
      '<button class="btn btn--link" type="button" data-user-reset="' +
      esc(user.id) +
      '">重置密码</button>' +
      '<button class="btn btn--link" type="button" data-user-toggle="' +
      esc(user.id) +
      '"' +
      (self ? " disabled" : "") +
      (self ? ' title="当前登录账号不可停用"' : "") +
      ">" +
      toggleLabel +
      "</button>" +
      '<button class="btn btn--link link-danger" type="button" data-user-del="' +
      esc(user.id) +
      '"' +
      (self ? " disabled" : "") +
      ' title="' +
      esc(deleteTitle) +
      '">删除</button>' +
      "</td></tr>"
    );
  }

  function paint() {
    var list = filteredUsers();
    var total = users().length;
    var active = users().filter(function (user) {
      return user.status === "active";
    }).length;
    els.body.innerHTML = list.map(rowHtml).join("");
    els.count.textContent = state.query || state.role || state.status
      ? "筛选出 " + list.length + " / " + total + " 个用户"
      : "共 " + total + " 个用户";
    els.tableWrap.hidden = !list.length;
    els.foot.textContent =
      "共 " + total + " 个用户 · 启用 " + active + " 个 · 停用 " + (total - active) + " 个";

    els.empty.hidden = !!list.length;
    if (!list.length) {
      var filtering = !!(state.query || state.role || state.status);
      if (!total) {
        els.emptyTitle.textContent = "暂无用户";
        els.emptyHint.textContent = "创建第一个系统账号，并为其分配角色与主办单位。";
        els.emptyAction.textContent = "新增用户";
        els.emptyAction.setAttribute("data-empty-action", "add");
      } else if (filtering) {
        els.emptyTitle.textContent = "没有匹配的用户";
        els.emptyHint.textContent = "尝试更换关键词，或清空角色与状态筛选条件。";
        els.emptyAction.textContent = "清空筛选";
        els.emptyAction.setAttribute("data-empty-action", "clear");
      } else {
        els.emptyTitle.textContent = "暂无用户";
        els.emptyHint.textContent = "创建第一个系统账号，并为其分配角色与主办单位。";
        els.emptyAction.textContent = "新增用户";
        els.emptyAction.setAttribute("data-empty-action", "add");
      }
    }
  }

  /* ---------- 弹窗基础 ---------- */
  function fieldHtml(opts) {
    var required = opts.required
      ? '<span class="required" aria-hidden="true">*</span>'
      : "";
    var control;
    if (opts.type === "select") {
      control =
        '<div class="select-wrap"><select class="select" id="' +
        opts.id +
        '"' +
        (opts.disabled ? " disabled" : "") +
        ">" +
        opts.options +
        "</select>" +
        '<svg class="icon icon--sm" aria-hidden="true"><use href="#icon-chevron-down"/></svg></div>';
    } else {
      control =
        '<input class="input" id="' +
        opts.id +
        '" type="' +
        (opts.type || "text") +
        '" value="' +
        esc(opts.value || "") +
        '"' +
        (opts.placeholder ? ' placeholder="' + esc(opts.placeholder) + '"' : "") +
        (opts.autocomplete ? ' autocomplete="' + opts.autocomplete + '"' : ' autocomplete="off"') +
        (opts.disabled ? " disabled" : "") +
        (opts.list ? ' list="' + opts.list + '"' : "") +
        " />";
    }
    return (
      '<div class="field' +
      (opts.full ? " field--full" : "") +
      '" data-field="' +
      opts.field +
      '">' +
      '<label class="field-label" for="' +
      opts.id +
      '">' +
      opts.label +
      required +
      "</label>" +
      control +
      (opts.hint ? '<p class="field-hint">' + esc(opts.hint) + "</p>" : "") +
      '<p class="field-error" id="' +
      opts.id +
      'Error" hidden></p></div>'
    );
  }

  function setError(field, message) {
    if (!modal) return;
    var wrap = els.modalBody.querySelector('[data-field="' + field + '"]');
    if (!wrap) return;
    wrap.classList.add("field--error");
    var input = wrap.querySelector(".input, .select");
    if (input) input.setAttribute("aria-invalid", "true");
    var error = wrap.querySelector(".field-error");
    if (error) {
      error.hidden = false;
      error.textContent = message;
    }
  }

  function clearErrors() {
    if (!modal) return;
    Array.prototype.forEach.call(
      els.modalBody.querySelectorAll(".field--error"),
      function (wrap) {
        wrap.classList.remove("field--error");
        var input = wrap.querySelector(".input, .select");
        if (input) input.removeAttribute("aria-invalid");
        var error = wrap.querySelector(".field-error");
        if (error) {
          error.hidden = true;
          error.textContent = "";
        }
      }
    );
  }

  function showModal(config) {
    var wasOpen = !!modal;
    if (!wasOpen) modalReturnFocus = config.returnFocus || document.activeElement;
    modal = config;
    els.modalRoot.hidden = false;
    els.modalTitle.textContent = config.title;
    els.modalBody.innerHTML = config.body;
    els.modalFoot.innerHTML = config.foot;
    document.body.classList.add("modal-open");
    if (!modalKeyHandler) {
      modalKeyHandler = onModalKeydown;
      document.addEventListener("keydown", modalKeyHandler, true);
    }
    var target = config.focus ? els.modal.querySelector(config.focus) : null;
    if (!target) target = els.modal;
    target.focus();
  }

  function closeModal(restoreFocus) {
    if (!modal && !document.body.classList.contains("modal-open")) return;
    if (els && els.modalRoot) {
      els.modalRoot.hidden = true;
      els.modalBody.innerHTML = "";
      els.modalFoot.innerHTML = "";
      els.modalTitle.textContent = "";
    }
    document.body.classList.remove("modal-open");
    if (modalKeyHandler) {
      document.removeEventListener("keydown", modalKeyHandler, true);
      modalKeyHandler = null;
    }
    modal = null;
    var target = modalReturnFocus;
    modalReturnFocus = null;
    if (restoreFocus !== false && target && target.isConnected && target.focus) {
      target.focus();
    }
  }

  function focusableNodes() {
    if (!els || !els.modal) return [];
    var nodes = els.modal.querySelectorAll(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    return Array.prototype.filter.call(nodes, function (node) {
      return node.offsetParent !== null;
    });
  }

  function onModalKeydown(event) {
    if (event.key === "Escape") {
      event.preventDefault();
      closeModal();
      return;
    }
    if (event.key !== "Tab") return;
    var nodes = focusableNodes();
    if (!nodes.length) return;
    var first = nodes[0];
    var last = nodes[nodes.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  /* ---------- 用户表单 ---------- */
  function userFormBody(user, create) {
    var self = user && isSelf(user);
    var roleDisabled = self;
    var statusDisabled = self;
    return (
      '<form id="userForm" class="form-grid" novalidate>' +
      fieldHtml({
        field: "username",
        id: "uUsername",
        label: "用户名",
        value: user ? user.username : "",
        placeholder: "例如：site_admin",
        required: true,
        disabled: !create,
        hint: create ? "4–32 位小写字母、数字或下划线，创建后不可修改。" : "用户名创建后不可修改。"
      }) +
      fieldHtml({
        field: "name",
        id: "uName",
        label: "姓名",
        value: user ? user.name : "",
        placeholder: "请输入真实姓名",
        required: true
      }) +
      fieldHtml({
        field: "role",
        id: "uRole",
        label: "角色",
        type: "select",
        options: roleOptionsHtml(
          user
            ? user.roleId
            : scope.own
              ? (availableRoles().filter(function (role) {
                  return role.id === "site-clerk";
                })[0] || availableRoles()[0] || {}).id
              : roles()[0]
                ? roles()[0].id
                : "",
          !!user
        ),
        required: true,
        disabled: roleDisabled,
        hint: self ? "当前登录账号不可修改自身角色。" : scope.own ? "仅可分配本单位的角色。" : ""
      }) +
      fieldHtml({
        field: "org",
        id: "uOrg",
        label: "主办单位",
        value: user ? user.org : scope.own ? scope.org : "",
        placeholder: "例如：市教育局",
        required: true,
        disabled: scope.own,
        list: scope.own ? "" : "userOrgOptions",
        hint: scope.own ? "本站账号只能维护本单位用户，主办单位不可修改。" : "档案馆工作人员可填写所属档案馆；主办单位用户填写本单位名称。"
      }) +
      '<datalist id="userOrgOptions">' +
      orgOptionsHtml() +
      "</datalist>" +
      fieldHtml({
        field: "password",
        id: "uPassword",
        label: create ? "初始密码" : "新密码",
        type: "password",
        placeholder: create ? "至少 8 位" : "留空则不修改密码",
        required: create,
        autocomplete: "new-password",
        full: true,
        hint: create ? "原型不保存明文密码，仅校验长度。" : "如需修改密码，请输入至少 8 位的新密码。"
      }) +
      fieldHtml({
        field: "status",
        id: "uStatus",
        label: "账号状态",
        type: "select",
        options:
          '<option value="active"' +
          (!user || user.status === "active" ? " selected" : "") +
          ">启用</option>" +
          '<option value="disabled"' +
          (user && user.status === "disabled" ? " selected" : "") +
          ">停用</option>",
        disabled: statusDisabled,
        hint: self ? "当前登录账号不可停用。" : "停用后该账号不能登录，历史操作记录保留。"
      }) +
      "</form>"
    );
  }

  function openUserForm(mode, user, source) {
    var create = mode === "create";
    showModal({
      type: "user-form",
      userId: user ? user.id : null,
      returnFocus: source || null,
      title: create ? "新增用户" : "编辑用户",
      body: userFormBody(user, create),
      foot:
        '<button class="btn" type="button" data-modal-close>取消</button>' +
        '<button class="btn btn--primary" type="submit" form="userForm">' +
        (create ? "创建用户" : "保存修改") +
        "</button>",
      focus: create ? "#uUsername" : "#uName"
    });
  }

  function saveUser() {
    if (!modal || modal.type !== "user-form") return;
    clearErrors();
    var create = !modal.userId;
    var user = null;
    users().some(function (item) {
      if (item.id !== modal.userId) return false;
      user = item;
      return true;
    });
    if (!create && !user) return;
    var username = els.modalBody.querySelector("#uUsername").value.trim();
    var name = els.modalBody.querySelector("#uName").value.trim();
    var roleId = els.modalBody.querySelector("#uRole").value;
    var org = els.modalBody.querySelector("#uOrg").value.trim();
    var password = els.modalBody.querySelector("#uPassword").value;
    var status = els.modalBody.querySelector("#uStatus").value;
    if (scope.own) org = scope.org;
    if (user && isSelf(user)) {
      roleId = user.roleId;
      status = user.status;
    }
    var valid = true;
    if (create) {
      if (!username) {
        setError("username", "请输入用户名");
        valid = false;
      } else if (!/^[a-z0-9_]{4,32}$/.test(username)) {
        setError("username", "用户名需为 4–32 位小写字母、数字或下划线");
        valid = false;
      } else if (
        allUsers().some(function (item) {
          return item.username.toLowerCase() === username.toLowerCase();
        })
      ) {
        setError("username", "该用户名已存在");
        valid = false;
      }
    }
    if (!name) {
      setError("name", "请输入姓名");
      valid = false;
    }
    var allowedRole = availableRoles().filter(function (role) {
      return role.id === roleId && role.status === "active";
    })[0];
    if (!allowedRole) {
      setError("role", scope.own ? "请选择本单位的启用角色" : "请选择启用中的角色");
      valid = false;
    }
    if (!org) {
      setError("org", "请输入主办单位");
      valid = false;
    }
    if (create && !password) {
      setError("password", "请输入初始密码");
      valid = false;
    } else if (password && password.length < 8) {
      setError("password", "密码至少 8 位");
      valid = false;
    }
    if (!valid) return;

    if (create) {
      allUsers().push({
        id: nextUserId(),
        username: username,
        name: name,
        roleId: roleId,
        org: org,
        status: status === "disabled" ? "disabled" : "active",
        lastLogin: "—"
      });
      closeModal(false);
      paint();
      toast("已创建用户“" + username + "”（仅当前会话）。", "success");
      return;
    }
    user.name = name;
    user.roleId = roleId;
    user.org = org;
    user.status = status === "disabled" ? "disabled" : "active";
    closeModal(false);
    paint();
    toast(
      password
        ? "用户信息与密码已更新（仅当前会话）。"
        : "用户信息已保存（仅当前会话）。",
      "success"
    );
  }

  function passwordFormBody(user) {
    return (
      '<p class="modal-intro">为用户“<strong>' +
      esc(user.name) +
      "</strong>”设置新的登录密码。</p>" +
      '<form id="userPasswordForm" class="form-grid" novalidate>' +
      fieldHtml({
        field: "newPassword",
        id: "uNewPassword",
        label: "新密码",
        type: "password",
        placeholder: "至少 8 位",
        required: true,
        autocomplete: "new-password",
        full: true
      }) +
      fieldHtml({
        field: "confirmPassword",
        id: "uConfirmPassword",
        label: "确认新密码",
        type: "password",
        placeholder: "再次输入新密码",
        required: true,
        autocomplete: "new-password",
        full: true
      }) +
      "</form>" +
      '<p class="modal-note">重置后该账号需使用新密码登录；原型不保存明文密码。</p>'
    );
  }

  function openUserPassword(user, source) {
    showModal({
      type: "user-password",
      userId: user.id,
      returnFocus: source || null,
      title: "重置密码",
      body: passwordFormBody(user),
      foot:
        '<button class="btn" type="button" id="userPasswordCancel" data-modal-close>取消</button>' +
        '<button class="btn btn--primary" type="submit" form="userPasswordForm">确认重置</button>',
      focus: "#uNewPassword"
    });
  }

  function savePassword() {
    if (!modal || modal.type !== "user-password") return;
    clearErrors();
    var user = null;
    users().some(function (item) {
      if (item.id !== modal.userId) return false;
      user = item;
      return true;
    });
    if (!user) return;
    var password = els.modalBody.querySelector("#uNewPassword").value;
    var confirm = els.modalBody.querySelector("#uConfirmPassword").value;
    var valid = true;
    if (!password || password.length < 8) {
      setError("newPassword", "密码至少 8 位");
      valid = false;
    }
    if (confirm !== password) {
      setError("confirmPassword", "两次输入的密码不一致");
      valid = false;
    }
    if (!valid) return;
    closeModal(false);
    toast("已重置用户“" + user.username + "”的登录密码（仅当前会话）。", "success");
  }

  function statusBody(user, activate) {
    return (
      '<p class="modal-intro">' +
      (activate ? "确认启用账号“" : "确认停用账号“") +
      "<strong>" +
      esc(user.username) +
      "</strong>”吗？</p>" +
      '<div class="modal-entity"><span class="modal-entity-name">' +
      esc(user.name) +
      "</span><span class=\"modal-entity-meta\">" +
      esc(roleName(user.roleId)) +
      " · " +
      esc(user.org) +
      "</span></div>" +
      (activate
        ? '<p class="modal-note">启用后该账号可以重新登录系统。</p>'
        : '<div class="modal-warning"><svg class="icon icon--sm" aria-hidden="true"><use href="#icon-alert-triangle"/></svg><span>停用后该账号将无法登录，已产生的操作日志保留；可在本页重新启用。</span></div>')
    );
  }

  function openUserStatus(user, source) {
    var activate = user.status === "disabled";
    showModal({
      type: "user-status",
      userId: user.id,
      activate: activate,
      returnFocus: source || null,
      title: activate ? "启用账号" : "停用账号",
      body: statusBody(user, activate),
      foot:
        '<button class="btn" type="button" id="userStatusCancel" data-modal-close>取消</button>' +
        '<button class="btn ' +
        (activate ? "btn--primary" : "btn--danger") +
        '" type="button" data-user-status-confirm>' +
        (activate ? "启用账号" : "停用账号") +
        "</button>",
      focus: "#userStatusCancel"
    });
  }

  function confirmUserStatus() {
    if (!modal || modal.type !== "user-status") return;
    var user = null;
    users().some(function (item) {
      if (item.id !== modal.userId) return false;
      user = item;
      return true;
    });
    if (!user) return;
    user.status = modal.activate ? "active" : "disabled";
    var activate = modal.activate;
    closeModal(false);
    paint();
    var row = els.body.querySelector('[data-user-row="' + user.id + '"]');
    if (row) {
      var trigger = row.querySelector("[data-user-toggle]");
      if (trigger) trigger.focus();
    }
    toast(activate ? "账号已启用（仅当前会话）。" : "账号已停用（仅当前会话）。", "success");
  }

  function openUserDelete(user, source) {
    showModal({
      type: "user-delete",
      userId: user.id,
      returnFocus: source || null,
      title: "删除用户",
      body:
        '<p class="modal-intro">确认删除用户“<strong>' +
        esc(user.username) +
        "”吗？</p>" +
        '<div class="modal-entity"><span class="modal-entity-name">' +
        esc(user.name) +
        "</span><span class=\"modal-entity-meta\">" +
        esc(roleName(user.roleId)) +
        " · " +
        esc(user.org) +
        "</span></div>" +
        '<div class="modal-warning"><svg class="icon icon--sm" aria-hidden="true"><use href="#icon-alert-triangle"/></svg><span>删除后该账号将无法登录，当前会话中不可撤销；历史操作日志不受影响。</span></div>' +
        '<p class="modal-note">仅影响当前会话数据；刷新页面可恢复示例账号。</p>',
      foot:
        '<button class="btn" type="button" id="userDeleteCancel" data-modal-close>取消</button>' +
        '<button class="btn btn--danger" type="button" data-user-del-confirm>删除用户</button>',
      focus: "#userDeleteCancel"
    });
  }

  function confirmUserDelete() {
    if (!modal || modal.type !== "user-delete") return;
    var index = -1;
    var user = null;
    users().some(function (item, i) {
      if (item.id !== modal.userId) return false;
      index = i;
      user = item;
      return true;
    });
    if (index < 0 || !user || isSelf(user)) return;
    users().splice(index, 1);
    closeModal(false);
    paint();
    var next = els.body.querySelector("[data-user-edit]");
    if (next) next.focus();
    toast("已删除用户“" + user.username + "”（仅当前会话）。", "success");
  }

  /* ---------- 事件 ---------- */
  function findUser(id) {
    var found = null;
    users().some(function (user) {
      if (user.id !== id) return false;
      found = user;
      return true;
    });
    return found;
  }

  function bind() {
    els.search.addEventListener("input", function () {
      state.query = els.search.value;
      paint();
    });
    els.roleFilter.addEventListener("change", function () {
      state.role = els.roleFilter.value;
      paint();
    });
    els.statusFilter.addEventListener("change", function () {
      state.status = els.statusFilter.value;
      paint();
    });
    els.add.addEventListener("click", function () {
      openUserForm("create", null, els.add);
    });
    els.emptyAction.addEventListener("click", function () {
      if (els.emptyAction.getAttribute("data-empty-action") === "add") {
        openUserForm("create", null, els.add);
        return;
      }
      state.query = "";
      state.role = "";
      state.status = "";
      els.search.value = "";
      els.roleFilter.value = "";
      els.statusFilter.value = "";
      paint();
      els.search.focus();
    });
    els.body.addEventListener("click", function (event) {
      var edit = event.target.closest("[data-user-edit]");
      if (edit) {
        var user = findUser(edit.getAttribute("data-user-edit"));
        if (user) openUserForm("edit", user, edit);
        return;
      }
      var reset = event.target.closest("[data-user-reset]");
      if (reset) {
        var resetUser = findUser(reset.getAttribute("data-user-reset"));
        if (resetUser) openUserPassword(resetUser, reset);
        return;
      }
      var toggle = event.target.closest("[data-user-toggle]");
      if (toggle && !toggle.disabled) {
        var toggleUser = findUser(toggle.getAttribute("data-user-toggle"));
        if (toggleUser) openUserStatus(toggleUser, toggle);
        return;
      }
      var remove = event.target.closest("[data-user-del]");
      if (remove && !remove.disabled) {
        var removeUser = findUser(remove.getAttribute("data-user-del"));
        if (removeUser) openUserDelete(removeUser, remove);
      }
    });
    els.modalRoot.addEventListener("click", function (event) {
      if (event.target.closest("[data-user-status-confirm]")) {
        confirmUserStatus();
        return;
      }
      if (event.target.closest("[data-user-del-confirm]")) {
        confirmUserDelete();
        return;
      }
      if (event.target.closest("[data-modal-close]")) closeModal();
    });
    els.modalBody.addEventListener("submit", function (event) {
      event.preventDefault();
      if (modal && modal.type === "user-form") saveUser();
      else if (modal && modal.type === "user-password") savePassword();
    });
  }

  function render(main, activeSession) {
    session = activeSession || null;
    scope.own = !!(session && session.roleId !== "archive-staff");
    scope.org = session && session.org ? session.org : "";
    state = { query: "", role: "", status: "" };
    main.innerHTML = shellHtml();
    els = {
      search: main.querySelector("#userSearch"),
      roleFilter: main.querySelector("#userRoleFilter"),
      statusFilter: main.querySelector("#userStatusFilter"),
      count: main.querySelector("#usersCount"),
      tableWrap: main.querySelector("#usersTableWrap"),
      body: main.querySelector("#usersBody"),
      empty: main.querySelector("#usersEmpty"),
      emptyTitle: main.querySelector("#usersEmptyTitle"),
      emptyHint: main.querySelector("#usersEmptyHint"),
      emptyAction: main.querySelector("#usersEmptyAction"),
      foot: main.querySelector("#usersFoot"),
      add: main.querySelector("#usersAdd"),
      modalRoot: main.querySelector("#usersModal"),
      modal: main.querySelector("#usersDialog"),
      modalTitle: main.querySelector("#usersModalTitle"),
      modalBody: main.querySelector("#usersModalBody"),
      modalFoot: main.querySelector("#usersModalFoot")
    };
    bind();
    paint();
  }

  function destroy() {
    closeModal(false);
    els = null;
  }

  WCR.users = { render: render, destroy: destroy };
  global.WCR = WCR;
})(window);
