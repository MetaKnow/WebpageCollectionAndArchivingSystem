/* ==========================================================================
   应用壳脚本（PROTOTYPE — 非生产实现）
   hash 路由、角色视角、导航、下拉、图表提示与 toast。
   没有接口请求；角色切换仅改变前端可见范围与示例数据。
   ========================================================================== */
(function (global) {
  "use strict";

  var WCR = global.WCR;
  if (!WCR) return;

  var ROLES = WCR.ROLES;
  var MODULES = WCR.MODULES;
  var BUSINESS = WCR.BUSINESS;
  var SYSTEM = WCR.SYSTEM;

  var els = {};
  var state = { session: null, route: null };
  var dropdowns = [];
  var tipEl = null;

  document.addEventListener("DOMContentLoaded", init);

  function esc(value) {
    return String(value).replace(/[&<>"']/g, function (c) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
      }[c];
    });
  }

  /* ---------- 会话 ---------- */
  function resolveSession() {
    var session = WCR.session.read();
    var params = new URLSearchParams(global.location.search);
    var roleParam = params.get("role");
    if (!session && roleParam && ROLES[roleParam]) {
      session = WCR.session.forRole(roleParam, ROLES[roleParam].account);
      session.account = ROLES[roleParam].account;
      WCR.session.write(session);
    }
    return session;
  }

  function init() {
    els.main = document.getElementById("main");
    if (!els.main) return;

    els.appShell = document.getElementById("appShell");
    els.nav = document.getElementById("siderNav");
    els.breadcrumb = document.getElementById("breadcrumb");
    els.roleSelect = document.getElementById("roleSelect");
    els.siderToggle = document.getElementById("siderToggle");
    els.siderMask = document.getElementById("siderMask");
    els.toastStack = document.getElementById("toastStack");
    els.userAvatar = document.getElementById("userAvatar");
    els.userName = document.getElementById("userName");
    els.userOrg = document.getElementById("userOrg");
    els.panelAvatar = document.getElementById("panelAvatar");
    els.panelName = document.getElementById("panelName");
    els.panelOrg = document.getElementById("panelOrg");
    els.panelRole = document.getElementById("panelRole");

    var session = resolveSession();
    if (!session) {
      global.location.replace("index.html");
      return;
    }
    state.session = session;

    fillRoleSelect();
    applyUser();
    buildNav();
    bindChrome();
    initDropdowns();
    initTooltip();

    if (!global.location.hash || global.location.hash === "#") {
      history.replaceState(null, "", "#/workbench");
    }

    global.addEventListener("hashchange", function () {
      route();
    });
    route();
  }

  function fillRoleSelect() {
    if (!els.roleSelect) return;
    els.roleSelect.innerHTML = WCR.ROLE_ORDER.map(function (id) {
      return (
        '<option value="' + id + '">' + esc(ROLES[id].label) + "</option>"
      );
    }).join("");
  }

  function applyUser() {
    var role = ROLES[state.session.roleId];
    var person = role.person;
    var name = state.session.name || person.name;
    var initials = state.session.initials || person.initials;
    var roleText = role.label + " · " + person.scope;

    if (els.userAvatar) els.userAvatar.textContent = initials;
    if (els.userName) els.userName.textContent = name;
    if (els.userOrg) els.userOrg.textContent = person.org;
    if (els.panelAvatar) els.panelAvatar.textContent = initials;
    if (els.panelName) els.panelName.textContent = name;
    if (els.panelOrg) els.panelOrg.textContent = person.org;
    if (els.panelRole) els.panelRole.textContent = roleText;
    if (els.roleSelect) els.roleSelect.value = role.id;
  }

  /* ---------- 侧栏导航 ---------- */
  function buildNav() {
    if (!els.nav) return;
    var role = ROLES[state.session.roleId];
    var systemChildren = SYSTEM.children.filter(function (child) {
      return role.menus.indexOf("system") >= 0 || role.menus.indexOf(child.key) >= 0;
    });
    var businessKeys = BUSINESS.map(function (item) {
      return item.key;
    });
    var businessMenus = role.menus.filter(function (key) {
      return businessKeys.indexOf(key) >= 0;
    });
    var html = "";

    if (businessMenus.length) {
      html += '<div class="nav-group-label">业务</div>';
      businessMenus.forEach(function (key) {
        var mod = MODULES[key];
        html +=
          '<a class="nav-item" data-nav="' +
          key +
          '" href="' +
          mod.hash +
          '">' +
          '<svg class="icon" aria-hidden="true"><use href="#icon-' +
          esc(mod.icon) +
          '"/></svg>' +
          "<span>" +
          esc(mod.title) +
          "</span></a>";
      });
    }

    if (systemChildren.length) {
      html += '<div class="nav-group-label">系统</div>';
      html +=
        '<button type="button" class="nav-sub-btn" id="systemBtn" aria-expanded="false" aria-controls="systemSub">' +
        '<svg class="icon" aria-hidden="true"><use href="#icon-settings"/></svg>' +
        "<span>系统管理</span>" +
        '<svg class="icon icon--sm caret" aria-hidden="true"><use href="#icon-chevron-down"/></svg>' +
        "</button>";
      html += '<ul class="nav-sub-list" id="systemSub" hidden>';
      systemChildren.forEach(function (child) {
        html +=
          '<li><a class="nav-sub-link" data-nav="system" data-child="' +
          child.key +
          '" href="' +
          child.hash +
          '">' +
          esc(child.title) +
          "</a></li>";
      });
      html += "</ul>";
    }

    els.nav.innerHTML = html;

    var systemBtn = document.getElementById("systemBtn");
    if (systemBtn) {
      systemBtn.addEventListener("click", function () {
        setSystemOpen(systemBtn.getAttribute("aria-expanded") !== "true");
      });
    }

    Array.prototype.forEach.call(els.nav.querySelectorAll("a"), function (a) {
      a.addEventListener("click", closeNav);
    });
  }

  function setSystemOpen(open) {
    var btn = document.getElementById("systemBtn");
    var list = document.getElementById("systemSub");
    if (!btn || !list) return;
    btn.setAttribute("aria-expanded", String(open));
    list.hidden = !open;
  }

  /* ---------- 路由 ---------- */
  function parseHash() {
    var raw = (global.location.hash || "").replace(/^#\/?/, "");
    var parts = raw.split("/").filter(Boolean);
    if (!parts.length) return { type: "module", key: "workbench" };
    if (parts[0] === "system") {
      var child = parts[1] ? MODULES[parts[1]] : null;
      return {
        type: "system",
        key: "system",
        childKey: child ? parts[1] : null,
        module: child
      };
    }
    var mod = MODULES[parts[0]];
    if (!mod || parts[0] === "system") return null;
    return { type: "module", key: parts[0], module: mod };
  }

  function roleCan(roleId, info) {
    var role = ROLES[roleId];
    if (!role) return false;
    if (info.type === "system") {
      if (info.childKey) {
        return role.menus.indexOf("system") >= 0 || role.menus.indexOf(info.childKey) >= 0;
      }
      return (
        role.menus.indexOf("system") >= 0 ||
        SYSTEM.children.some(function (child) {
          return role.menus.indexOf(child.key) >= 0;
        })
      );
    }
    return role.menus.indexOf(info.key) >= 0;
  }

  function route(options) {
    var silent = options && options.silent;
    var info = parseHash();
    var denied = false;

    if (!info) {
      history.replaceState(null, "", "#/workbench");
      info = { type: "module", key: "workbench", module: MODULES.workbench };
      if (!silent) {
        toast("该地址不存在，已返回工作台。", "warning");
      }
    }

    if (info.type === "system" && !info.childKey) {
      if (roleCan(state.session.roleId, info)) {
        var role = ROLES[state.session.roleId];
        var first = SYSTEM.children.filter(function (child) {
          return role.menus.indexOf("system") >= 0 || role.menus.indexOf(child.key) >= 0;
        })[0];
        if (!first) {
          denied = true;
        } else {
          info = {
            type: "system",
            key: "system",
            childKey: first.key,
            module: first
          };
          history.replaceState(null, "", first.hash);
        }
      } else {
        denied = true;
      }
    }

    if (!denied && !roleCan(state.session.roleId, info)) {
      denied = true;
    }

    if (denied) {
      history.replaceState(null, "", "#/workbench");
      info = { type: "module", key: "workbench", module: MODULES.workbench };
      if (!silent) {
        toast("当前角色无权访问该模块，已返回工作台。", "warning");
      }
    }

    state.route = info;
    hideTip();
    closeNav();
    closeDropdowns();
    renderView(info);
    updateNav(info);
    updateBreadcrumb(info);
    global.scrollTo(0, 0);
  }

  var BLANK_SYSTEM_PAGES = ["dict", "quality", "storage", "backup", "logs"];

  function renderView(info) {
    ["sites", "users", "roles", "metadata", "categories", "scope"].forEach(function (key) {
      if (WCR[key] && WCR[key].destroy) WCR[key].destroy();
    });
    els.main.innerHTML = "";
    if (info.type === "module" && info.key === "workbench") {
      if (WCR.dashboard) {
        WCR.dashboard.render(els.main, state.session);
      }
      document.title = "工作台 · 网页采集归档系统";
      return;
    }
    if (
      info.type === "system" &&
      info.childKey === "metadata" &&
      WCR.metadata
    ) {
      WCR.metadata.render(els.main, state.session);
      document.title = "元数据配置 · 网页采集归档系统";
      return;
    }
    if (
      info.type === "system" &&
      BLANK_SYSTEM_PAGES.indexOf(info.childKey) >= 0
    ) {
      var blank = info.module || MODULES[info.key];
      var blankTitle = blank ? blank.title : "模块";
      els.main.innerHTML =
        '<h1 class="visually-hidden">' + blankTitle + "</h1>";
      document.title = blankTitle + " · 网页采集归档系统";
      return;
    }
    if (
      info.type === "system" &&
      info.childKey === "scope" &&
      WCR.scope
    ) {
      WCR.scope.render(els.main, state.session);
      document.title = "归档范围 · 网页采集归档系统";
      return;
    }
    if (
      info.type === "system" &&
      info.childKey === "category" &&
      WCR.categories
    ) {
      WCR.categories.render(els.main, state.session);
      document.title = "分类库维护 · 网页采集归档系统";
      return;
    }
    if (
      info.type === "system" &&
      info.childKey === "params" &&
      WCR.params
    ) {
      WCR.params.render(els.main, state.session);
      document.title = "系统参数 · 网页采集归档系统";
      return;
    }
    if (
      info.type === "system" &&
      info.childKey === "sites" &&
      WCR.sites
    ) {
      WCR.sites.render(els.main, state.session);
      document.title = "网站管理 · 网页采集归档系统";
      return;
    }
    if (
      info.type === "system" &&
      info.childKey === "users" &&
      WCR.users
    ) {
      WCR.users.render(els.main, state.session);
      document.title = "用户管理 · 网页采集归档系统";
      return;
    }
    if (
      info.type === "system" &&
      info.childKey === "roles" &&
      WCR.roles
    ) {
      WCR.roles.render(els.main, state.session);
      document.title = "角色权限 · 网页采集归档系统";
      return;
    }
    renderStub(info.module || MODULES[info.key]);
    document.title =
      (info.module ? info.module.title : "模块") + " · 网页采集归档系统";
  }

  function renderStub(module) {
    if (!module) return;
    var planned = (module.planned || [])
      .map(function (item) {
        return (
          '<li><svg class="icon icon--sm" aria-hidden="true"><use href="#icon-check"/></svg>' +
          "<span>" +
          esc(item) +
          "</span></li>"
        );
      })
      .join("");

    els.main.innerHTML =
      '<div class="module-page">' +
      '<div class="page-head">' +
      "<div>" +
      "<h1>" +
      esc(module.title) +
      "</h1>" +
      "</div>" +
      '<div class="page-actions"><span class="pill pill--neutral">模块规划中</span></div>' +
      "</div>" +
      '<div class="card module-stub">' +
      '<div class="empty">' +
      '<svg class="empty-art" aria-hidden="true"><use href="#art-module"/></svg>' +
      "<h2>" +
      esc(module.title) +
      "模块尚未建设</h2>" +
      "<p>当前原型已完成登录、工作台与系统管理核心页面。本模块将按需求文档在后续迭代实现，以下为已规划的能力范围。</p>" +
      '<div class="empty-actions"><a class="btn btn--primary" href="#/workbench">返回工作台</a></div>' +
      "</div>" +
      '<div class="planned"><h3>已规划能力</h3><ul>' +
      planned +
      "</ul></div>" +
      "</div>" +
      '<p class="stub-tip"><svg class="icon icon--sm" aria-hidden="true"><use href="#icon-info"/></svg>' +
      "<span>占位页说明：本页未接入数据，页面中的入口与操作均不会产生真实结果。</span></p>" +
      "</div>";
  }

  function updateNav(info) {
    if (!els.nav) return;
    Array.prototype.forEach.call(
      els.nav.querySelectorAll("[data-nav]"),
      function (el) {
        var child = el.getAttribute("data-child");
        var active;
        if (child) {
          active = info.type === "system" && info.childKey === child;
        } else if (el.getAttribute("data-nav") === "system") {
          active = info.type === "system";
        } else {
          active =
            info.type === "module" &&
            info.key === el.getAttribute("data-nav");
        }
        el.classList.toggle("is-active", Boolean(active));
        if (active) {
          el.setAttribute("aria-current", "page");
        } else {
          el.removeAttribute("aria-current");
        }
      }
    );

    var systemBtn = document.getElementById("systemBtn");
    if (systemBtn) {
      systemBtn.classList.toggle("is-active", info.type === "system");
      setSystemOpen(info.type === "system");
    }
  }

  function updateBreadcrumb(info) {
    if (!els.breadcrumb) return;
    var html = '<a href="#/workbench">首页</a>';
    if (info.type === "system") {
      html +=
        '<span class="sep" aria-hidden="true">/</span><span>系统管理</span>' +
        '<span class="sep" aria-hidden="true">/</span><span class="current">' +
        esc(info.module.title) +
        "</span>";
    } else {
      html +=
        '<span class="sep" aria-hidden="true">/</span><span class="current">' +
        esc(info.module.title) +
        "</span>";
    }
    els.breadcrumb.innerHTML = html;
  }

  /* ---------- 顶部栏交互 ---------- */
  function bindChrome() {
    if (els.roleSelect) {
      els.roleSelect.addEventListener("change", function () {
        switchRole(els.roleSelect.value);
      });
    }

    if (els.siderToggle) {
      els.siderToggle.addEventListener("click", function () {
        if (els.appShell.classList.contains("app-shell--nav-open")) {
          closeNav();
        } else {
          openNav();
        }
      });
    }

    if (els.siderMask) {
      els.siderMask.addEventListener("click", closeNav);
    }

    var skips = document.querySelectorAll("[data-skip]");
    Array.prototype.forEach.call(skips, function (skip) {
      skip.addEventListener("click", function (event) {
        event.preventDefault();
        els.main.focus();
        els.main.scrollIntoView({ block: "start" });
      });
    });

    var noticeAll = document.getElementById("noticeAll");
    if (noticeAll) {
      noticeAll.addEventListener("click", function () {
        var badge = document.querySelector("#noticeBtn .badge");
        var trigger = document.getElementById("noticeBtn");
        var count = document.getElementById("noticeCount");
        if (badge) badge.remove();
        if (trigger) trigger.setAttribute("aria-label", "通知");
        if (count) count.textContent = "0 条未读";
        noticeAll.disabled = true;
        noticeAll.setAttribute("aria-disabled", "true");
        closeDropdowns();
        toast("已将示例通知标记为已读（仅界面状态，不写入后端）。", "success");
      });
    }

    var logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", function () {
        WCR.session.clear();
        global.location.replace("index.html");
      });
    }

    global.addEventListener("resize", function () {
      if (global.innerWidth > 991) closeNav();
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        closeDropdowns();
        closeNav();
        hideTip();
      }
    });
  }

  function switchRole(roleId) {
    var role = ROLES[roleId];
    if (!role) return;
    state.session = WCR.session.forRole(role.id, role.account);
    state.session.account = role.account;
    WCR.session.write(state.session);
    applyUser();
    buildNav();
    route({ silent: true });
    toast(
      "已切换为“" +
        role.label +
        "”视角。菜单与数据范围随角色变化；该切换仅用于原型演示。",
      "info"
    );
  }

  /* ---------- 移动端侧栏 ---------- */
  function openNav() {
    if (!els.appShell) return;
    els.appShell.classList.add("app-shell--nav-open");
    if (els.siderToggle) els.siderToggle.setAttribute("aria-expanded", "true");
  }

  function closeNav() {
    if (!els.appShell) return;
    els.appShell.classList.remove("app-shell--nav-open");
    if (els.siderToggle) els.siderToggle.setAttribute("aria-expanded", "false");
  }

  /* ---------- 下拉 ---------- */
  function initDropdowns() {
    dropdowns = Array.prototype.slice.call(
      document.querySelectorAll("[data-dropdown]")
    );
    dropdowns.forEach(function (dd) {
      var trigger = dd.querySelector("[data-dd-trigger]");
      var panel = dd.querySelector(".dropdown-panel");
      if (!trigger || !panel) return;
      trigger.addEventListener("click", function (event) {
        event.stopPropagation();
        var willOpen = panel.hidden;
        closeDropdowns();
        panel.hidden = !willOpen;
        trigger.setAttribute("aria-expanded", String(willOpen));
      });
      panel.addEventListener("click", function (event) {
        event.stopPropagation();
      });
    });
    document.addEventListener("click", function () {
      closeDropdowns();
    });
  }

  function closeDropdowns() {
    dropdowns.forEach(function (dd) {
      var trigger = dd.querySelector("[data-dd-trigger]");
      var panel = dd.querySelector(".dropdown-panel");
      if (!trigger || !panel) return;
      panel.hidden = true;
      trigger.setAttribute("aria-expanded", "false");
    });
  }

  /* ---------- 图表 tooltip ---------- */
  function initTooltip() {
    tipEl = document.createElement("div");
    tipEl.className = "chart-tooltip";
    tipEl.setAttribute("role", "tooltip");
    tipEl.hidden = true;
    document.body.appendChild(tipEl);

    document.addEventListener("mouseover", function (event) {
      var target = event.target.closest
        ? event.target.closest("[data-tip]")
        : null;
      if (!target) return;
      if (event.relatedTarget && target.contains(event.relatedTarget)) return;
      showTip(target, event.clientX, event.clientY);
    });

    document.addEventListener("mousemove", function (event) {
      if (tipEl && !tipEl.hidden) positionTip(event.clientX, event.clientY);
    });

    document.addEventListener("mouseout", function (event) {
      var target = event.target.closest
        ? event.target.closest("[data-tip]")
        : null;
      if (!target) return;
      if (event.relatedTarget && target.contains(event.relatedTarget)) return;
      hideTip();
    });

    document.addEventListener("focusin", function (event) {
      var target = event.target.closest
        ? event.target.closest("[data-tip]")
        : null;
      if (!target) return;
      var rect = target.getBoundingClientRect();
      showTip(target, rect.left + rect.width / 2, rect.top + rect.height / 2);
    });

    document.addEventListener("focusout", function () {
      hideTip();
    });

    global.addEventListener("scroll", hideTip, true);
  }

  function showTip(target, x, y) {
    var raw = target.getAttribute("data-tip");
    if (!raw) return;
    var data;
    try {
      data = JSON.parse(raw);
    } catch (e) {
      return;
    }
    tipEl.innerHTML = "";
    var title = document.createElement("strong");
    title.textContent = data.title || "";
    tipEl.appendChild(title);
    (data.rows || []).forEach(function (row) {
      var span = document.createElement("span");
      span.textContent = row.label + "：" + row.value;
      tipEl.appendChild(span);
    });
    tipEl.hidden = false;
    positionTip(x, y);
  }

  function positionTip(x, y) {
    if (!tipEl || tipEl.hidden) return;
    var rect = tipEl.getBoundingClientRect();
    var left = x + 14;
    var top = y + 16;
    if (left + rect.width > global.innerWidth - 8) {
      left = x - rect.width - 14;
    }
    if (top + rect.height > global.innerHeight - 8) {
      top = y - rect.height - 14;
    }
    tipEl.style.left = Math.max(8, left) + "px";
    tipEl.style.top = Math.max(8, top) + "px";
  }

  function hideTip() {
    if (tipEl) tipEl.hidden = true;
  }

  /* ---------- Toast ---------- */
  function toast(message, type) {
    if (!els.toastStack) return;
    var el = document.createElement("div");
    el.className = "toast" + (type ? " toast--" + type : "");
    el.setAttribute("role", "status");
    el.innerHTML =
      '<svg class="icon" aria-hidden="true"><use href="#icon-' +
      (type === "warning"
        ? "alert-triangle"
        : type === "success"
          ? "check-circle"
          : "info") +
      '"/></svg><span></span>';
    el.lastChild.textContent = message;
    els.toastStack.appendChild(el);
    while (els.toastStack.children.length > 3) {
      els.toastStack.removeChild(els.toastStack.firstChild);
    }
    global.setTimeout(function () {
      el.remove();
    }, 3600);
  }

  WCR.ui = { toast: toast };
})(window);
