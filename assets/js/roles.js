/* ==========================================================================
   角色权限 — 角色列表、数据范围与菜单权限（PROTOTYPE — 非生产实现）
   数据：WCR.ADMIN.roles / WCR.ADMIN.users（与用户管理页共享）
   ========================================================================== */
(function (global) {
  "use strict";

  var WCR = global.WCR || {};
  var ADMIN = WCR.ADMIN;
  var BUSINESS = WCR.BUSINESS || [];
  var SYSTEM = WCR.SYSTEM || { children: [] };
  var state = null;
  var els = null;
  var modal = null;
  var modalKeyHandler = null;
  var modalReturnFocus = null;

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

  function roles() {
    return ADMIN.roles;
  }

  function users() {
    return ADMIN.users;
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

  function usersForRole(id) {
    return users().filter(function (user) {
      return user.roleId === id;
    });
  }

  function menuItems() {
    return {
      business: BUSINESS,
      system: SYSTEM.children || []
    };
  }

  function allMenuKeys() {
    var items = menuItems();
    return items.business
      .map(function (item) {
        return item.key;
      })
      .concat(
        items.system.map(function (item) {
          return item.key;
        })
      );
  }

  function statusPill(status) {
    return (
      '<span class="pill ' +
      (status === "disabled" ? "pill--muted" : "pill--success") +
      '">' +
      (status === "disabled" ? "停用" : "启用") +
      "</span>"
    );
  }

  function scopeLabel(scope) {
    return scope === "own" ? "本单位网站" : "全部网站";
  }

  function nextRoleId() {
    var max = 0;
    roles().forEach(function (role) {
      var match = /^custom-(\d+)$/.exec(role.id);
      if (match) max = Math.max(max, parseInt(match[1], 10));
    });
    return "custom-" + (max + 1);
  }

  /* ---------- 页面骨架 ---------- */
  function shellHtml() {
    return (
      '<div class="page roles-page">' +
      '<div class="page-head"><div><h1>角色权限</h1></div>' +
      '<div class="page-actions">' +
      '<button class="btn" type="button" id="rolesAdd">' +
      '<svg class="icon icon--sm" aria-hidden="true"><use href="#icon-plus"/></svg>' +
      "新增角色</button></div></div>" +
      '<div class="role-layout">' +
      '<section class="card role-list-card" aria-labelledby="roleListTitle">' +
      '<div class="card-head"><div><h2 id="roleListTitle">角色列表</h2>' +
      '<p class="card-sub" id="rolesCount"></p></div></div>' +
      '<div class="control control--icon role-search">' +
      '<svg class="icon control-icon" aria-hidden="true"><use href="#icon-search"/></svg>' +
      '<input class="input" id="roleSearch" type="search" placeholder="搜索角色名称或编码" aria-label="搜索角色" autocomplete="off" />' +
      "</div>" +
      '<div class="role-list" id="roleList" role="listbox" aria-label="角色列表"></div>' +
      '<p class="role-list-empty" id="roleListEmpty" hidden>没有匹配的角色</p>' +
      "</section>" +
      '<section class="card role-detail-card" aria-labelledby="roleDetailTitle">' +
      '<div class="card-head role-detail-head">' +
      '<div><h2 id="roleDetailTitle"></h2><p class="card-sub" id="roleDetailSub"></p></div>' +
      '<div class="role-head-actions" id="roleHeadActions"></div>' +
      "</div>" +
      '<div id="roleDetailBody"></div>' +
      "</section></div>" +
      '<div class="modal-layer" id="rolesModal" hidden>' +
      '<div class="modal-mask" data-modal-close></div>' +
      '<div class="modal" id="rolesDialog" role="dialog" aria-modal="true" aria-labelledby="rolesModalTitle" tabindex="-1">' +
      '<div class="modal-head"><h2 id="rolesModalTitle"></h2>' +
      '<button class="icon-btn" type="button" data-modal-close aria-label="关闭">' +
      '<svg class="icon" aria-hidden="true"><use href="#icon-x"/></svg></button></div>' +
      '<div class="modal-body" id="rolesModalBody"></div>' +
      '<div class="modal-foot" id="rolesModalFoot"></div>' +
      "</div></div></div>"
    );
  }

  /* ---------- 角色列表 ---------- */
  function visibleRoles() {
    var query = state.query.trim().toLowerCase();
    if (!query) return roles();
    return roles().filter(function (role) {
      return (role.name + " " + role.code).toLowerCase().indexOf(query) >= 0;
    });
  }

  function paintList() {
    var list = visibleRoles();
    els.count.textContent = state.query
      ? "筛选出 " + list.length + " / " + roles().length + " 个"
      : "共 " + roles().length + " 个角色";
    els.list.innerHTML = list
      .map(function (role) {
        var active = role.id === state.selectedId;
        var count = usersForRole(role.id).length;
        return (
          '<button class="role-item' +
          (active ? " is-active" : "") +
          '" type="button" role="option" aria-selected="' +
          String(active) +
          '" data-role="' +
          esc(role.id) +
          '">' +
          '<span class="role-item-top"><span class="role-item-name">' +
          esc(role.name) +
          "</span>" +
          '<span class="pill ' +
          (role.builtin ? "pill--neutral" : "pill--info") +
          '">' +
          (role.builtin ? "内置" : "自定义") +
          "</span></span>" +
          '<span class="role-item-meta"><span>' +
          esc(role.code) +
          "</span><span>" +
          count +
          " 个用户 · " +
          (role.status === "disabled" ? "停用" : "启用") +
          "</span></span></button>"
        );
      })
      .join("");
    els.empty.hidden = list.length > 0;
    els.empty.textContent = roles().length ? "没有匹配的角色" : "暂无角色";
    els.list.hidden = !list.length;
  }

  /* ---------- 权限表单 ---------- */
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
    } else if (opts.type === "textarea") {
      control =
        '<textarea class="textarea" id="' +
        opts.id +
        '" rows="3"' +
        (opts.placeholder ? ' placeholder="' + esc(opts.placeholder) + '"' : "") +
        (opts.disabled ? " disabled" : "") +
        ">" +
        esc(opts.value || "") +
        "</textarea>";
    } else {
      control =
        '<input class="input" id="' +
        opts.id +
        '" type="text" value="' +
        esc(opts.value || "") +
        '"' +
        (opts.placeholder ? ' placeholder="' + esc(opts.placeholder) + '"' : "") +
        (opts.disabled ? " disabled" : "") +
        " />";
    }
    return (
      '<div class="field' +
      (opts.full ? " field--full" : "") +
      '" data-field="' +
      opts.id +
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

  function permissionGroupHtml(key, title, items, selected) {
    var chosen = items.filter(function (item) {
      return selected.indexOf(item.key) >= 0;
    }).length;
    return (
      '<div class="perm-group" data-perm-group-wrap="' +
      key +
      '">' +
      '<label class="perm-group-head"><input class="checkbox" type="checkbox" data-perm-group="' +
      key +
      '" /> <span>' +
      title +
      '</span><span class="perm-group-count" data-perm-group-count="' +
      key +
      '">' +
      chosen +
      " / " +
      items.length +
      "</span></label>" +
      '<div class="perm-grid" data-perm-group-items="' +
      key +
      '">' +
      items
        .map(function (item) {
          return (
            '<label class="perm-item"><input class="checkbox" type="checkbox" value="' +
            esc(item.key) +
            '" data-perm="' +
            esc(item.key) +
            '"' +
            (selected.indexOf(item.key) >= 0 ? " checked" : "") +
            " /> <span>" +
            esc(item.title) +
            "</span></label>"
          );
        })
        .join("") +
      "</div></div>"
    );
  }

  function permissionHtml(role) {
    var items = menuItems();
    return (
      '<section class="perm-section" aria-labelledby="permTitle">' +
      '<div class="perm-title-row"><div><h3 id="permTitle">菜单权限</h3>' +
      '<p class="field-hint">勾选该角色可访问的菜单；主办单位账号请按岗位勾选所需业务菜单及网站管理、用户管理。</p></div>' +
      '<span class="perm-total" id="permTotal"></span></div>' +
      permissionGroupHtml("business", "业务功能", items.business, role.menus) +
      permissionGroupHtml("system", "系统管理", items.system, role.menus) +
      '<p class="field-error" id="rolePermError" hidden></p>' +
      "</section>"
    );
  }

  function detailHtml(role) {
    var count = usersForRole(role.id).length;
    return (
      '<form id="roleForm" class="role-form" novalidate>' +
      '<div class="form-grid role-basic-grid">' +
      fieldHtml({
        id: "roleName",
        label: "角色名称",
        value: role.name,
        required: true,
        disabled: role.builtin,
        hint: role.builtin ? "内置角色名称不可修改。" : ""
      }) +
      fieldHtml({
        id: "roleCode",
        label: "角色编码",
        value: role.code,
        required: true,
        disabled: role.builtin,
        hint: role.builtin ? "内置角色编码不可修改。" : "3–32 位小写字母、数字或下划线。"
      }) +
      fieldHtml({
        id: "roleScope",
        label: "数据范围",
        type: "select",
        options:
          '<option value="all"' +
          (role.scope === "all" ? " selected" : "") +
          ">全部网站</option>" +
          '<option value="own"' +
          (role.scope === "own" ? " selected" : "") +
          ">本单位网站</option>",
        disabled: role.builtin,
        hint: role.builtin ? "内置角色的数据范围固定。" : ""
      }) +
      fieldHtml({
        id: "roleStatus",
        label: "角色状态",
        type: "select",
        options:
          '<option value="active"' +
          (role.status === "active" ? " selected" : "") +
          ">启用</option>" +
          '<option value="disabled"' +
          (role.status === "disabled" ? " selected" : "") +
          ">停用</option>",
        disabled: role.builtin,
        hint: role.builtin ? "内置角色不可停用。" : ""
      }) +
      fieldHtml({
        id: "roleDesc",
        label: "角色描述",
        type: "textarea",
        value: role.desc,
        placeholder: "说明该角色的职责与使用范围",
        full: true
      }) +
      "</div>" +
      permissionHtml(role) +
      '<div class="role-form-foot">' +
      '<span class="role-user-note" id="roleUserNote">' +
      count +
      " 个用户使用该角色</span>" +
      '<div class="role-form-actions">' +
      '<button class="btn" type="button" data-role-reset>撤销修改</button>' +
      '<button class="btn btn--primary" type="submit" data-role-save>保存权限</button>' +
      "</div></div></form>"
    );
  }

  function syncPermissionState() {
    var body = els.detailBody;
    if (!body) return;
    var totalChecked = 0;
    var totalItems = 0;
    Array.prototype.forEach.call(
      body.querySelectorAll("[data-perm-group-wrap]"),
      function (wrap) {
        var key = wrap.getAttribute("data-perm-group-wrap");
        var group = wrap.querySelector("[data-perm-group]");
        var items = wrap.querySelectorAll("[data-perm-group-items] input[data-perm]");
        var checked = 0;
        Array.prototype.forEach.call(items, function (item) {
          if (item.checked) checked++;
        });
        totalChecked += checked;
        totalItems += items.length;
        group.checked = checked === items.length;
        group.indeterminate = checked > 0 && checked < items.length;
        var count = wrap.querySelector("[data-perm-group-count]");
        if (count) count.textContent = checked + " / " + items.length;
      }
    );
    var total = body.querySelector("#permTotal");
    if (total) total.textContent = "已选 " + totalChecked + " / " + totalItems + " 项";
  }

  function paintDetail() {
    var role = roleById(state.selectedId);
    if (!role) {
      role = roles()[0];
      state.selectedId = role ? role.id : null;
    }
    if (!role) {
      els.title.textContent = "角色权限";
      els.sub.textContent = "暂无角色";
      els.headActions.innerHTML = "";
      els.detailBody.innerHTML =
        '<div class="empty role-empty"><p class="empty-title">暂无角色</p>' +
        '<p class="empty-hint">点击“新增角色”创建第一个角色。</p></div>';
      return;
    }
    var count = usersForRole(role.id).length;
    els.title.textContent = role.name;
    els.sub.textContent =
      role.code + " · " + count + " 个用户 · " + scopeLabel(role.scope);
    els.headActions.innerHTML =
      '<span class="pill ' +
      (role.builtin ? "pill--neutral" : "pill--info") +
      '">' +
      (role.builtin ? "内置角色" : "自定义角色") +
      "</span>" +
      '<span class="pill ' +
      (role.status === "disabled" ? "pill--muted" : "pill--success") +
      '">' +
      (role.status === "disabled" ? "停用" : "启用") +
      "</span>" +
      '<button class="btn btn--link link-danger" type="button" data-role-delete' +
      (role.builtin || count > 0 ? " disabled" : "") +
      ' title="' +
      (role.builtin
        ? "内置角色不可删除"
        : count > 0
          ? "该角色下仍有用户，暂不可删除"
          : "删除角色") +
      '">删除角色</button>';
    els.detailBody.innerHTML = detailHtml(role);
    syncPermissionState();
    var deleteBtn = els.detailBody.querySelector("[data-role-delete]");
    if (deleteBtn) deleteBtn.disabled = role.builtin || count > 0;
  }

  /* ---------- 弹窗基础 ---------- */
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
    if (restoreFocus !== false && target && target.isConnected && target.focus) target.focus();
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

  /* ---------- 新增 / 删除角色 ---------- */
  function openRoleCreate(source) {
    var body =
      '<form id="roleCreateForm" class="form-grid" novalidate>' +
      fieldHtml({
        id: "newRoleName",
        label: "角色名称",
        value: "",
        required: true,
        placeholder: "例如：档案编研员"
      }) +
      fieldHtml({
        id: "newRoleCode",
        label: "角色编码",
        value: "",
        required: true,
        placeholder: "例如：archive_editor",
        hint: "3–32 位小写字母、数字或下划线，创建后可修改。"
      }) +
      fieldHtml({
        id: "newRoleScope",
        label: "数据范围",
        type: "select",
        full: true,
        options:
          '<option value="all" selected>全部网站</option><option value="own">本单位网站</option>'
      }) +
      fieldHtml({
        id: "newRoleDesc",
        label: "角色描述",
        type: "textarea",
        value: "",
        placeholder: "说明该角色的职责与使用范围",
        full: true
      }) +
      "</form>" +
      '<p class="modal-note">新角色默认拥有“工作台”菜单权限，创建后可在右侧继续配置。</p>';
    showModal({
      type: "role-create",
      returnFocus: source || null,
      title: "新增角色",
      body: body,
      foot:
        '<button class="btn" type="button" data-modal-close>取消</button>' +
        '<button class="btn btn--primary" type="submit" form="roleCreateForm">创建角色</button>',
      focus: "#newRoleName"
    });
  }

  function setError(field, message) {
    if (!modal) return;
    var wrap = els.modalBody.querySelector('[data-field="' + field + '"]');
    if (!wrap) return;
    wrap.classList.add("field--error");
    var input = wrap.querySelector(".input, .select, .textarea");
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
        var input = wrap.querySelector(".input, .select, .textarea");
        if (input) input.removeAttribute("aria-invalid");
        var error = wrap.querySelector(".field-error");
        if (error) {
          error.hidden = true;
          error.textContent = "";
        }
      }
    );
  }

  function createRole() {
    if (!modal || modal.type !== "role-create") return;
    clearErrors();
    var name = els.modalBody.querySelector("#newRoleName").value.trim();
    var code = els.modalBody.querySelector("#newRoleCode").value.trim();
    var scope = els.modalBody.querySelector("#newRoleScope").value;
    var desc = els.modalBody.querySelector("#newRoleDesc").value.trim();
    var valid = true;
    if (!name) {
      setError("newRoleName", "请输入角色名称");
      valid = false;
    }
    if (!code) {
      setError("newRoleCode", "请输入角色编码");
      valid = false;
    } else if (!/^[a-z][a-z0-9_]{2,31}$/.test(code)) {
      setError("newRoleCode", "编码需为 3–32 位小写字母、数字或下划线，且以字母开头");
      valid = false;
    } else if (
      roles().some(function (role) {
        return role.code.toLowerCase() === code.toLowerCase();
      })
    ) {
      setError("newRoleCode", "该角色编码已存在");
      valid = false;
    }
    if (!valid) return;
    var role = {
      id: nextRoleId(),
      name: name,
      code: code,
      builtin: false,
      status: "active",
      scope: scope === "own" ? "own" : "all",
      desc: desc,
      menus: ["workbench"]
    };
    roles().push(role);
    state.selectedId = role.id;
    closeModal(false);
    paint();
    toast("已创建角色“" + name + "”（仅当前会话）。", "success");
  }

  function openRoleDelete(role, source) {
    var count = usersForRole(role.id).length;
    showModal({
      type: "role-delete",
      roleId: role.id,
      returnFocus: source || null,
      title: "删除角色",
      body:
        '<p class="modal-intro">确认删除角色“<strong>' +
        esc(role.name) +
        "”吗？</p>" +
        '<div class="modal-entity"><span class="modal-entity-name">' +
        esc(role.name) +
        "</span><span class=\"modal-entity-meta\">" +
        esc(role.code) +
        " · " +
        count +
        " 个用户</span></div>" +
        '<div class="modal-warning"><svg class="icon icon--sm" aria-hidden="true"><use href="#icon-alert-triangle"/></svg><span>删除后该角色的菜单权限配置将一并移除，当前会话中不可撤销。</span></div>' +
        '<p class="modal-note">仅影响当前会话数据；刷新页面可恢复示例角色。</p>',
      foot:
        '<button class="btn" type="button" id="roleDeleteCancel" data-modal-close>取消</button>' +
        '<button class="btn btn--danger" type="button" data-role-delete-confirm>删除角色</button>',
      focus: "#roleDeleteCancel"
    });
  }

  function confirmRoleDelete() {
    if (!modal || modal.type !== "role-delete") return;
    var index = -1;
    var role = null;
    roles().some(function (item, i) {
      if (item.id !== modal.roleId) return false;
      index = i;
      role = item;
      return true;
    });
    if (index < 0 || !role || role.builtin || usersForRole(role.id).length) return;
    roles().splice(index, 1);
    state.selectedId = roles()[0] ? roles()[0].id : null;
    closeModal(false);
    paint();
    toast("已删除角色“" + role.name + "”（仅当前会话）。", "success");
  }

  /* ---------- 保存 / 事件 ---------- */
  function collectMenus() {
    var menus = [];
    Array.prototype.forEach.call(
      els.detailBody.querySelectorAll("[data-perm]:checked"),
      function (input) {
        menus.push(input.getAttribute("data-perm"));
      }
    );
    return menus;
  }

  function saveRole() {
    var role = roleById(state.selectedId);
    if (!role) return;
    var nameInput = els.detailBody.querySelector("#roleName");
    var codeInput = els.detailBody.querySelector("#roleCode");
    var scopeInput = els.detailBody.querySelector("#roleScope");
    var statusInput = els.detailBody.querySelector("#roleStatus");
    var descInput = els.detailBody.querySelector("#roleDesc");
    var name = nameInput.value.trim();
    var code = codeInput.value.trim();
    var valid = true;
    Array.prototype.forEach.call(
      els.detailBody.querySelectorAll(".field--error"),
      function (wrap) {
        wrap.classList.remove("field--error");
        var error = wrap.querySelector(".field-error");
        if (error) {
          error.hidden = true;
          error.textContent = "";
        }
      }
    );
    var permError = els.detailBody.querySelector("#rolePermError");
    if (permError) permError.hidden = true;

    if (!name) {
      setDetailError("roleName", "请输入角色名称");
      valid = false;
    }
    if (!role.builtin) {
      if (!code) {
        setDetailError("roleCode", "请输入角色编码");
        valid = false;
      } else if (!/^[a-z][a-z0-9_]{2,31}$/.test(code)) {
        setDetailError("roleCode", "编码需为 3–32 位小写字母、数字或下划线，且以字母开头");
        valid = false;
      } else if (
        roles().some(function (item) {
          return item.id !== role.id && item.code.toLowerCase() === code.toLowerCase();
        })
      ) {
        setDetailError("roleCode", "该角色编码已存在");
        valid = false;
      }
    }
    var menus = collectMenus();
    if (!menus.length) {
      if (permError) {
        permError.hidden = false;
        permError.textContent = "请至少勾选一个菜单权限";
      }
      valid = false;
    }
    if (!valid) return;
    role.name = role.builtin ? role.name : name;
    role.code = role.builtin ? role.code : code;
    role.scope = role.builtin ? role.scope : scopeInput.value === "own" ? "own" : "all";
    role.status = role.builtin ? role.status : statusInput.value === "disabled" ? "disabled" : "active";
    role.desc = descInput.value.trim();
    role.menus = menus;
    paint();
    toast("角色权限已保存（仅当前会话）。", "success");
  }

  function setDetailError(id, message) {
    var wrap = els.detailBody.querySelector('[data-field="' + id + '"]');
    if (!wrap) return;
    wrap.classList.add("field--error");
    var input = wrap.querySelector(".input, .select, .textarea");
    if (input) input.setAttribute("aria-invalid", "true");
    var error = wrap.querySelector(".field-error");
    if (error) {
      error.hidden = false;
      error.textContent = message;
    }
  }

  function paint() {
    var totalUsers = users().length;
    paintList();
    paintDetail();
  }

  function bind() {
    els.search.addEventListener("input", function () {
      state.query = els.search.value;
      paintList();
    });
    els.list.addEventListener("click", function (event) {
      var item = event.target.closest("[data-role]");
      if (!item) return;
      state.selectedId = item.getAttribute("data-role");
      paintList();
      paintDetail();
    });
    els.add.addEventListener("click", function () {
      openRoleCreate(els.add);
    });
    els.headActions.addEventListener("click", function (event) {
      var remove = event.target.closest("[data-role-delete]");
      if (remove && !remove.disabled) {
        var role = roleById(state.selectedId);
        if (role) openRoleDelete(role, remove);
      }
    });
    els.detail.addEventListener("click", function (event) {
      var reset = event.target.closest("[data-role-reset]");
      if (reset) {
        paintDetail();
        toast("已撤销未保存的修改。", "info");
      }
    });
    els.detail.addEventListener("change", function (event) {
      var group = event.target.closest("[data-perm-group]");
      if (group) {
        var wrap = group.closest("[data-perm-group-wrap]");
        var items = wrap.querySelectorAll("[data-perm-group-items] input[data-perm]");
        Array.prototype.forEach.call(items, function (item) {
          item.checked = group.checked;
        });
        syncPermissionState();
        var permError = els.detailBody.querySelector("#rolePermError");
        if (permError) permError.hidden = true;
        return;
      }
      if (event.target.closest("[data-perm]")) {
        syncPermissionState();
        var permError = els.detailBody.querySelector("#rolePermError");
        if (permError) permError.hidden = true;
      }
    });
    els.detail.addEventListener("submit", function (event) {
      event.preventDefault();
      saveRole();
    });
    els.modalRoot.addEventListener("click", function (event) {
      if (event.target.closest("[data-role-delete-confirm]")) {
        confirmRoleDelete();
        return;
      }
      if (event.target.closest("[data-modal-close]")) closeModal();
    });
    els.modalBody.addEventListener("submit", function (event) {
      event.preventDefault();
      if (modal && modal.type === "role-create") createRole();
    });
  }

  function render(main) {
    state = { query: "", selectedId: "archive-staff" };
    main.innerHTML = shellHtml();
    els = {
      search: main.querySelector("#roleSearch"),
      list: main.querySelector("#roleList"),
      empty: main.querySelector("#roleListEmpty"),
      count: main.querySelector("#rolesCount"),
      add: main.querySelector("#rolesAdd"),
      title: main.querySelector("#roleDetailTitle"),
      sub: main.querySelector("#roleDetailSub"),
      headActions: main.querySelector("#roleHeadActions"),
      detail: main.querySelector("#roleDetailBody"),
      detailBody: main.querySelector("#roleDetailBody"),
      modalRoot: main.querySelector("#rolesModal"),
      modal: main.querySelector("#rolesDialog"),
      modalTitle: main.querySelector("#rolesModalTitle"),
      modalBody: main.querySelector("#rolesModalBody"),
      modalFoot: main.querySelector("#rolesModalFoot")
    };
    bind();
    paint();
  }

  function destroy() {
    closeModal(false);
    els = null;
  }

  WCR.roles = { render: render, destroy: destroy };
  global.WCR = WCR;
})(window);
