/* ==========================================================================
   网站管理 — 网站列表、弹窗表单、栏目分级配置
   依赖 data.js（WCR.SITES）、app.js（WCR.ui.toast）
   ========================================================================== */
(function (global) {
  "use strict";

  var WCR = global.WCR || {};
  var DATA = WCR.SITES;
  var store = null;
  var state = null;
  var els = null;
  var lastSiteId = null;
  var deleteTimer = null;
  var scope = { own: false, org: "" };

  var modal = null;
  var modalKeyHandler = null;
  var modalReturnFocus = null;

  /* ---------- 基础工具 ---------- */
  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

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

  function ensureStore() {
    if (!store) store = clone(DATA);
  }

  function allSites() {
    return store.sites;
  }

  function sites() {
    if (!scope.own) return allSites();
    return allSites().filter(function (site) {
      return site.org === scope.org;
    });
  }

  function findSite(id) {
    var found = null;
    allSites().some(function (site) {
      if (site.id !== id) return false;
      found = site;
      return true;
    });
    return found;
  }

  function currentSite() {
    if (!state || !state.siteId) return null;
    var site = findSite(state.siteId);
    if (!site) return null;
    if (scope.own && site.org !== scope.org) return null;
    return site;
  }

  function totalColumns() {
    var total = 0;
    sites().forEach(function (site) {
      total += site.columns.length;
    });
    return total;
  }

  function initialState() {
    var list = sites();
    var id = lastSiteId;
    var exists = list.some(function (site) {
      return site.id === id;
    });
    if (!list.length) id = null;
    else if (!exists) id = list[0].id;
    return { siteId: id, colQuery: "", deleteId: null };
  }

  function nextSiteId() {
    var max = 0;
    allSites().forEach(function (site) {
      var match = /^s(\d+)$/.exec(site.id);
      if (match) max = Math.max(max, parseInt(match[1], 10));
    });
    return "s" + (max + 1);
  }

  function nextColumnId(site) {
    var max = 0;
    site.columns.forEach(function (col) {
      var match = /-c(\d+)$/.exec(col.id);
      if (match) max = Math.max(max, parseInt(match[1], 10));
    });
    return site.id + "-c" + (max + 1);
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

  function clearDeleteTimer() {
    if (deleteTimer) {
      clearTimeout(deleteTimer);
      deleteTimer = null;
    }
  }

  /* ---------- 页面骨架 ---------- */
  function shellHtml() {
    return (
      '<div class="page sites-page">' +
      '<div class="page-head">' +
      '<div><h1>网站管理</h1></div>' +
      '<div class="page-actions">' +
      '<button class="btn" type="button" id="sitesAdd">' +
      '<svg class="icon icon--sm" aria-hidden="true"><use href="#icon-plus"/></svg>' +
      "新增网站</button>" +
      "</div>" +
      "</div>" +
      '<div class="sites-layout">' +
      '<div class="sites-side">' +
      '<section class="card site-list-card" aria-labelledby="siteListTitle">' +
      '<div class="card-head">' +
      '<div><h2 id="siteListTitle">网站列表</h2><p class="card-sub" id="sitesCount"></p></div>' +
      "</div>" +
      '<div class="control control--icon site-search">' +
      '<svg class="icon control-icon" aria-hidden="true"><use href="#icon-search"/></svg>' +
      '<input class="input" id="siteSearch" type="search" placeholder="搜索名称、域名或主办单位" aria-label="搜索网站" autocomplete="off" />' +
      "</div>" +
      '<div class="site-list-wrap" id="siteListWrap">' +
      '<div class="site-list" id="siteList" role="list" aria-label="网站列表"></div>' +
      '<p class="site-list-empty" id="siteListEmpty" hidden></p>' +
      "</div>" +
      "</section>" +
      "</div>" +
      '<section class="card columns-card" aria-labelledby="columnsTitle">' +
      '<div class="card-head columns-head">' +
      '<div><h2 id="columnsTitle">栏目管理</h2><p class="card-sub" id="columnsSub"></p></div>' +
      '<div class="columns-head-actions">' +
      '<button class="btn" type="button" id="siteViewBtn" disabled>' +
      '<svg class="icon icon--sm" aria-hidden="true"><use href="#icon-info"/></svg>' +
      "网站信息</button>" +
      '<button class="btn" type="button" id="siteEditBtn" disabled>' +
      '<svg class="icon icon--sm" aria-hidden="true"><use href="#icon-pencil"/></svg>' +
      "编辑网站</button>" +
      '<button class="btn" type="button" id="columnsAdd" disabled>' +
      '<svg class="icon icon--sm" aria-hidden="true"><use href="#icon-plus"/></svg>' +
      "新增栏目</button>" +
      "</div>" +
      "</div>" +
      '<div class="columns-toolbar">' +
      '<div class="control control--icon columns-search">' +
      '<svg class="icon control-icon" aria-hidden="true"><use href="#icon-search"/></svg>' +
      '<input class="input" id="columnSearch" type="search" placeholder="搜索频道、栏目或地址" aria-label="搜索栏目" autocomplete="off" />' +
      "</div>" +
      '<span class="columns-toolbar-meta" id="columnsMeta"></span>' +
      "</div>" +
      '<p class="columns-scroll-hint" id="columnsScrollHint">左右滑动查看完整栏目表</p>' +
      '<div class="table-wrap" id="columnsTableWrap">' +
      '<table class="data-table columns-table">' +
      "<thead><tr>" +
      '<th class="cell-index" scope="col">序号</th>' +
      '<th scope="col">频道名称</th>' +
      '<th scope="col">一级栏目</th>' +
      '<th scope="col">二级栏目</th>' +
      '<th scope="col">访问地址</th>' +
      '<th class="cell-type" scope="col">状态</th>' +
      '<th class="cell-actions" scope="col">操作</th>' +
      "</tr></thead>" +
      '<tbody id="columnsBody"></tbody>' +
      "</table>" +
      "</div>" +
      '<div class="columns-empty" id="columnsEmpty" hidden>' +
      '<svg class="icon icon--24" aria-hidden="true"><use href="#icon-folder"/></svg>' +
      '<p class="columns-empty-title" id="columnsEmptyTitle"></p>' +
      '<p class="columns-empty-hint" id="columnsEmptyHint"></p>' +
      '<button class="btn" type="button" id="columnsEmptyAction" hidden></button>' +
      "</div>" +
      '<div class="table-foot" id="columnsFoot">' +
      '<span id="columnsCount"></span>' +
      '<span id="columnsStatus"></span>' +
      "</div>" +
      "</section>" +
      "</div>" +
      '<div class="modal-layer" id="sitesModal" hidden>' +
      '<div class="modal-mask" data-modal-close></div>' +
      '<div class="modal" id="sitesDialog" role="dialog" aria-modal="true" aria-labelledby="sitesModalTitle" tabindex="-1">' +
      '<div class="modal-head">' +
      '<h2 id="sitesModalTitle"></h2>' +
      '<button class="icon-btn" type="button" data-modal-close aria-label="关闭">' +
      '<svg class="icon icon--sm" aria-hidden="true"><use href="#icon-x"/></svg>' +
      "</button>" +
      "</div>" +
      '<div class="modal-body" id="sitesModalBody"></div>' +
      '<div class="modal-foot" id="sitesModalFoot"></div>' +
      "</div>" +
      "</div>" +
      "</div>"
    );
  }

  /* ---------- 弹窗 ---------- */
  function focusables() {
    return Array.prototype.slice
      .call(
        els.modal.querySelectorAll(
          'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])'
        )
      )
      .filter(function (node) {
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
    var items = focusables();
    if (!items.length) {
      event.preventDefault();
      els.modal.focus();
      return;
    }
    var first = items[0];
    var last = items[items.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  function showModal(config) {
    closeModal(false);
    modal = {
      type: config.type,
      mode: config.mode || null,
      siteId: config.siteId || null,
      columnId: config.columnId || null
    };
    modalReturnFocus = config.returnFocus || null;
    els.modalTitle.textContent = config.title || "";
    els.modalBody.innerHTML = config.body || "";
    els.modalFoot.innerHTML = config.foot || "";
    els.modalRoot.hidden = false;
    document.body.classList.add("modal-open");
    modalKeyHandler = onModalKeydown;
    document.addEventListener("keydown", modalKeyHandler);
    if (config.onMount) config.onMount();
    var target = config.focus ? els.modalBody.querySelector(config.focus) : null;
    (target || els.modal).focus();
  }

  function closeModal(restoreFocus) {
    if (!modal && els.modalRoot.hidden) return;
    modal = null;
    if (els && els.modalRoot) els.modalRoot.hidden = true;
    document.body.classList.remove("modal-open");
    if (modalKeyHandler) {
      document.removeEventListener("keydown", modalKeyHandler);
      modalKeyHandler = null;
    }
    var target = modalReturnFocus;
    modalReturnFocus = null;
    if (restoreFocus !== false && target && document.contains(target)) target.focus();
  }

  function fieldError(id) {
    return els.modalBody.querySelector("#" + id + "Error");
  }

  function setFieldError(id, message) {
    var input = els.modalBody.querySelector("#" + id);
    var error = fieldError(id);
    if (!input || !error) return;
    var field = input.closest(".field");
    if (field) field.classList.toggle("field--error", !!message);
    error.hidden = !message;
    error.textContent = message || "";
    input.setAttribute("aria-invalid", message ? "true" : "false");
  }

  function clearFieldErrors() {
    Array.prototype.forEach.call(els.modalBody.querySelectorAll(".field"), function (field) {
      field.classList.remove("field--error");
    });
    Array.prototype.forEach.call(els.modalBody.querySelectorAll(".field-error"), function (error) {
      error.hidden = true;
      error.textContent = "";
    });
  }

  function detailRow(label, value) {
    return (
      '<div class="detail-row"><span class="detail-label">' +
      esc(label) +
      '</span><span class="detail-value">' +
      value +
      "</span></div>"
    );
  }

  function openSiteView(site, source) {
    if (!site) return;
    showModal({
      type: "site-view",
      title: "网站基本信息",
      body:
        '<p class="modal-intro">网站信息用于工作台统计与档案元数据；修改仅在当前会话生效。</p>' +
        '<div class="detail-list">' +
        detailRow("网站名称", esc(site.name)) +
        detailRow("网站域名", esc(site.domain)) +
        detailRow("网站代码", esc(site.code || "—")) +
        detailRow("主办单位名称", esc(site.org)) +
        detailRow("主办单位全宗号", esc(site.fonds)) +
        detailRow("采集状态", statusPill(site.status)) +
        detailRow("栏目数量", site.columns.length + " 个") +
        "</div>",
      foot:
        '<button type="button" class="btn" data-modal-close>关闭</button>' +
        '<button type="button" class="btn btn--primary" data-site-view-edit>编辑信息</button>',
      returnFocus: source,
      onMount: function () {
        var edit = els.modalFoot.querySelector("[data-site-view-edit]");
        if (edit) {
          edit.addEventListener("click", function () {
            openSiteForm("edit", site, source);
          });
        }
      }
    });
  }

  function siteFormHtml(site, create) {
    var value = site || {
      name: "",
      domain: "",
      code: "",
      org: scope.own ? scope.org : "",
      fonds: "",
      status: "active"
    };
    var orgLocked = scope.own;
    return (
      '<p class="modal-intro">' +
      (create ? "保存后即可在栏目管理中为该网站添加采集栏目。" : "保存后立即更新左侧列表与栏目区标题。") +
      "</p>" +
      '<form id="siteForm" class="site-form-grid" novalidate>' +
      '<div class="field field--full"><label class="field-label" for="sfName">网站名称 <span class="field-required">*</span></label>' +
      '<input class="input" id="sfName" type="text" value="' + esc(value.name) + '" placeholder="例如：市政府门户网站" autocomplete="off" />' +
      '<p class="field-hint">用于工作台统计与档案元数据。</p><p class="field-error" id="sfNameError" hidden></p></div>' +
      '<div class="field field--full"><label class="field-label" for="sfDomain">网站域名 <span class="field-required">*</span></label>' +
      '<input class="input" id="sfDomain" type="text" value="' + esc(value.domain) + '" placeholder="www.example.gov.cn" autocomplete="off" />' +
      '<p class="field-hint">只填写域名，不含 http:// 或路径。</p><p class="field-error" id="sfDomainError" hidden></p></div>' +
      '<div class="field field--full"><label class="field-label" for="sfCode">网站代码 <span class="field-required">*</span></label>' +
      '<input class="input" id="sfCode" type="text" value="' + esc(value.code || "") + '" placeholder="例如：shi_gov" autocomplete="off" />' +
      '<p class="field-hint">用于档号组合与元数据映射；2–40 位小写字母、数字或下划线，以字母开头。</p>' +
      '<p class="field-error" id="sfCodeError" hidden></p></div>' +
      '<div class="field field--full"><label class="field-label" for="sfOrg">主办单位名称 <span class="field-required">*</span></label>' +
      '<input class="input" id="sfOrg" type="text" value="' + esc(value.org) + '" placeholder="例如：市人民政府办公室"' +
      (orgLocked ? " disabled" : "") +
      ' /><p class="field-hint">' +
      (orgLocked ? "本站账号只能维护本单位网站，主办单位不可修改。" : "填写网站的主办单位全称。") +
      '</p><p class="field-error" id="sfOrgError" hidden></p></div>' +
      '<div class="field"><label class="field-label" for="sfFonds">主办单位全宗号 <span class="field-required">*</span></label>' +
      '<input class="input" id="sfFonds" type="text" value="' + esc(value.fonds) + '" placeholder="例如：J001" autocomplete="off" />' +
      '<p class="field-error" id="sfFondsError" hidden></p></div>' +
      '<div class="field"><label class="field-label" for="sfStatus">采集状态</label>' +
      '<div class="select-wrap"><select class="select" id="sfStatus">' +
      '<option value="active"' + (value.status !== "disabled" ? " selected" : "") + '>启用</option>' +
      '<option value="disabled"' + (value.status === "disabled" ? " selected" : "") + '>停用</option>' +
      '</select><svg class="icon icon--sm" aria-hidden="true"><use href="#icon-chevron-down"/></svg></div>' +
      '<p class="field-hint">停用后不再发起新的采集任务。</p></div>' +
      "</form>"
    );
  }

  function openSiteForm(mode, site, source) {
    var create = mode === "create";
    var title = create ? "新增网站" : "编辑网站";
    showModal({
      type: "site-form",
      mode: mode,
      siteId: create ? null : site.id,
      title: title,
      body: siteFormHtml(create ? null : site, create),
      foot:
        '<button type="button" class="btn" data-modal-close>取消</button>' +
        '<button type="submit" class="btn btn--primary" form="siteForm">' +
        (create ? "创建网站" : "保存修改") +
        "</button>",
      focus: "#sfName",
      returnFocus: source,
      onMount: function () {
        if (scope.own) {
          var org = els.modalBody.querySelector("#sfOrg");
          if (org) org.value = scope.org;
        }
      }
    });
  }

  function validateSite(values, ownSiteId) {
    var errors = {};
    if (!values.name) errors.sfName = "请输入网站名称";
    if (!values.domain) errors.sfDomain = "请输入网站域名";
    else if (!/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]*[a-z0-9])?)+$/i.test(values.domain))
      errors.sfDomain = "请输入有效域名，例如 www.example.gov.cn";
    else if (
      allSites().some(function (site) {
        return site.id !== ownSiteId && site.domain.toLowerCase() === values.domain.toLowerCase();
      })
    )
      errors.sfDomain = "该域名已被其他网站使用";
    if (!values.code) errors.sfCode = "请输入网站代码";
    else if (!/^[a-z][a-z0-9_]{1,39}$/.test(values.code))
      errors.sfCode = "请输入 2–40 位小写字母、数字或下划线，并以字母开头";
    else if (
      allSites().some(function (site) {
        return (
          site.id !== ownSiteId &&
          String(site.code || "").toLowerCase() === values.code.toLowerCase()
        );
      })
    )
      errors.sfCode = "该网站代码已被其他网站使用";
    if (!values.org) errors.sfOrg = "请输入主办单位名称";
    if (!values.fonds) errors.sfFonds = "请输入主办单位全宗号";
    return errors;
  }

  function submitSiteForm() {
    if (!modal || modal.type !== "site-form") return;
    clearFieldErrors();
    var values = {
      name: els.modalBody.querySelector("#sfName").value.trim(),
      domain: els.modalBody.querySelector("#sfDomain").value.trim(),
      code: els.modalBody.querySelector("#sfCode").value.trim(),
      org: scope.own ? scope.org : els.modalBody.querySelector("#sfOrg").value.trim(),
      fonds: els.modalBody.querySelector("#sfFonds").value.trim(),
      status: els.modalBody.querySelector("#sfStatus").value
    };
    var errors = validateSite(values, modal.siteId);
    var first = null;
    Object.keys(errors).forEach(function (key) {
      setFieldError(key, errors[key]);
      if (!first) first = key;
    });
    if (first) {
      var input = els.modalBody.querySelector("#" + first);
      if (input) input.focus();
      return;
    }
    var create = modal.mode === "create";
    var site = create ? null : findSite(modal.siteId);
    if (create) {
      site = {
        id: nextSiteId(),
        name: values.name,
        domain: values.domain,
        code: values.code,
        org: values.org,
        fonds: values.fonds,
        status: values.status,
        columns: []
      };
      allSites().push(site);
    } else {
      site.name = values.name;
      site.domain = values.domain;
      site.code = values.code;
      site.org = values.org;
      site.fonds = values.fonds;
      site.status = values.status;
    }
    state.siteId = site.id;
    lastSiteId = site.id;
    closeModal(false);
    paintAll();
    toast(create ? "已新增网站“" + site.name + "”。" : "已保存网站“" + site.name + "”。", "success");
  }

  function openSiteDelete(site, source) {
    if (!site) return;
    showModal({
      type: "site-delete",
      siteId: site.id,
      title: "删除网站",
      body:
        '<p class="modal-intro">确认删除网站“<strong>' + esc(site.name) + "</strong>”吗？</p>" +
        '<div class="modal-entity"><span class="modal-entity-name">' + esc(site.name) +
        '</span><span class="modal-entity-meta">' + esc(site.domain) + " · 全宗号 " + esc(site.fonds) + "</span></div>" +
        '<div class="modal-warning"><svg class="icon icon--sm" aria-hidden="true"><use href="#icon-alert-triangle"/></svg><span>' +
        (site.columns.length
          ? "该网站下的 <strong>" + site.columns.length + " 个栏目</strong>会一并移除，当前会话中不可撤销。"
          : "该网站暂无栏目，删除后将从网站列表移除，当前会话中不可撤销。") +
        "</span></div>" +
        '<p class="modal-note">仅影响当前会话数据，不会删除任何真实归档文件；刷新页面可恢复示例。</p>',
      foot:
        '<button type="button" class="btn" data-modal-close>取消</button>' +
        '<button type="button" class="btn btn--danger" data-site-delete-confirm>删除网站</button>',
      focus: ".modal-foot .btn:not(.btn--danger)"
    });
  }

  function confirmSiteDelete() {
    if (!modal || modal.type !== "site-delete") return;
    var site = findSite(modal.siteId);
    if (!site) return;
    var list = allSites();
    var index = list.indexOf(site);
    if (index >= 0) list.splice(index, 1);
    if (state.siteId === site.id) {
      state.siteId = sites().length ? sites()[0].id : null;
    }
    lastSiteId = state.siteId;
    if (els.siteSearch) els.siteSearch.value = "";
    closeModal(false);
    paintAll();
    toast("已删除网站“" + site.name + "”。", "success");
    if (els.sitesAdd) els.sitesAdd.focus();
  }

  /* ---------- 栏目弹窗 ---------- */
  function columnFormHtml(column, create) {
    var value = column || {
      channel: "",
      level1: "",
      level2: "",
      url: "",
      status: "active"
    };
    var site = currentSite();
    return (
      '<p class="modal-intro">当前网站：' + esc(site ? site.name : "") + "</p>" +
      '<form id="columnForm" class="site-form-grid" novalidate>' +
      '<div class="field field--full"><label class="field-label" for="cfChannel">频道名称 <span class="field-required">*</span></label>' +
      '<input class="input" id="cfChannel" type="text" value="' + esc(value.channel) + '" placeholder="例如：要闻动态" autocomplete="off" />' +
      '<p class="field-hint">频道是栏目的上级分组，例如“政务公开”。</p><p class="field-error" id="cfChannelError" hidden></p></div>' +
      '<div class="field"><label class="field-label" for="cfLevel1">一级栏目 <span class="field-required">*</span></label>' +
      '<input class="input" id="cfLevel1" type="text" value="' + esc(value.level1) + '" placeholder="例如：政策文件" autocomplete="off" />' +
      '<p class="field-error" id="cfLevel1Error" hidden></p></div>' +
      '<div class="field"><label class="field-label" for="cfLevel2">二级栏目</label>' +
      '<input class="input" id="cfLevel2" type="text" value="' + esc(value.level2 || "") + '" placeholder="选填，例如：市政府文件" autocomplete="off" />' +
      '<p class="field-error" id="cfLevel2Error" hidden></p></div>' +
      '<div class="field field--full"><label class="field-label" for="cfUrl">访问地址 <span class="field-required">*</span></label>' +
      '<input class="input" id="cfUrl" type="text" value="' + esc(value.url) + '" placeholder="https://www.example.gov.cn/column/" autocomplete="off" />' +
      '<p class="field-hint">需以 http:// 或 https:// 开头。</p><p class="field-error" id="cfUrlError" hidden></p></div>' +
      '<div class="field"><label class="field-label" for="cfStatus">状态</label>' +
      '<div class="select-wrap"><select class="select" id="cfStatus">' +
      '<option value="active"' + (value.status !== "disabled" ? " selected" : "") + '>启用</option>' +
      '<option value="disabled"' + (value.status === "disabled" ? " selected" : "") + '>停用</option>' +
      '</select><svg class="icon icon--sm" aria-hidden="true"><use href="#icon-chevron-down"/></svg></div>' +
      '<p class="field-hint">停用后不再发起该栏目的采集任务。</p></div>' +
      "</form>"
    );
  }

  function openColumnForm(mode, id, source) {
    var site = currentSite();
    if (!site) return;
    var column = null;
    if (mode === "edit") {
      site.columns.some(function (item) {
        if (item.id !== id) return false;
        column = item;
        return true;
      });
      if (!column) return;
    }
    showModal({
      type: "column-form",
      mode: mode,
      siteId: site.id,
      columnId: id || null,
      title: mode === "create" ? "新增栏目" : "编辑栏目",
      body: columnFormHtml(column, mode === "create"),
      foot:
        '<button type="button" class="btn" data-modal-close>取消</button>' +
        '<button type="submit" class="btn btn--primary" form="columnForm">' +
        (mode === "create" ? "创建栏目" : "保存栏目") +
        "</button>",
      focus: "#cfChannel",
      returnFocus: source,
      onMount: function () {}
    });
  }

  function submitColumnForm() {
    if (!modal || modal.type !== "column-form") return;
    var site = findSite(modal.siteId);
    if (!site) return;
    clearFieldErrors();
    var values = {
      channel: els.modalBody.querySelector("#cfChannel").value.trim(),
      level1: els.modalBody.querySelector("#cfLevel1").value.trim(),
      level2: els.modalBody.querySelector("#cfLevel2").value.trim(),
      url: els.modalBody.querySelector("#cfUrl").value.trim(),
      status: els.modalBody.querySelector("#cfStatus").value
    };
    var errors = {};
    if (!values.channel) errors.cfChannel = "请输入频道名称";
    if (!values.level1) errors.cfLevel1 = "请输入一级栏目";
    if (!values.url) errors.cfUrl = "请输入访问地址";
    else if (!/^https?:\/\/\S+$/i.test(values.url)) errors.cfUrl = "请输入以 http:// 或 https:// 开头的地址";
    var first = null;
    Object.keys(errors).forEach(function (key) {
      setFieldError(key, errors[key]);
      if (!first) first = key;
    });
    if (first) {
      var input = els.modalBody.querySelector("#" + first);
      if (input) input.focus();
      return;
    }
    if (modal.mode === "create") {
      site.columns.push({
        id: nextColumnId(site),
        channel: values.channel,
        level1: values.level1,
        level2: values.level2,
        url: values.url,
        status: values.status
      });
    } else {
      var column = null;
      site.columns.some(function (item) {
        if (item.id !== modal.columnId) return false;
        column = item;
        return true;
      });
      if (!column) return;
      column.channel = values.channel;
      column.level1 = values.level1;
      column.level2 = values.level2;
      column.url = values.url;
      column.status = values.status;
    }
    var created = modal.mode === "create";
    closeModal(false);
    paintAll();
    toast(created ? "已新增栏目。" : "已保存栏目。", "success");
  }

  function startColumnDelete(id) {
    clearDeleteTimer();
    state.deleteId = id;
    paintColumns();
    deleteTimer = setTimeout(function () {
      state.deleteId = null;
      paintColumns();
    }, 4000);
  }

  function confirmColumnDelete(id) {
    var site = currentSite();
    if (!site) return;
    var index = -1;
    site.columns.some(function (item, i) {
      if (item.id !== id) return false;
      index = i;
      return true;
    });
    if (index < 0) return;
    var removed = site.columns.splice(index, 1)[0];
    state.deleteId = null;
    clearDeleteTimer();
    paintAll();
    toast("已删除栏目“" + removed.level1 + "”。", "success");
  }

  /* ---------- 渲染 ---------- */
  function paintSiteList() {
    var list = sites();
    var query = els.siteSearch.value.trim().toLowerCase();
    var filtered = query
      ? list.filter(function (site) {
          return [site.name, site.domain, site.org]
            .join(" ")
            .toLowerCase()
            .indexOf(query) >= 0;
        })
      : list;

    els.sitesCount.textContent = "共 " + list.length + " 个网站";
    els.siteList.innerHTML = filtered
      .map(function (site) {
        return (
          '<div class="site-item-row">' +
          '<button type="button" class="site-item' + (site.id === state.siteId ? " is-active" : "") + '" data-site="' + esc(site.id) + '"' +
          (site.id === state.siteId ? ' aria-current="true"' : "") +
          ">" +
          '<span class="site-item-top"><span class="site-item-name">' + esc(site.name) + "</span>" + statusPill(site.status) + "</span>" +
          '<span class="site-item-domain">' + esc(site.domain) + "</span>" +
          '<span class="site-item-meta"><span>全宗号 ' + esc(site.fonds) + "</span><span>" + site.columns.length + " 个栏目</span></span>" +
          "</button>" +
          '<button type="button" class="site-item-delete" data-site-del="' + esc(site.id) + '" aria-label="删除 ' + esc(site.name) + '">' +
          '<svg class="icon icon--sm" aria-hidden="true"><use href="#icon-trash"/></svg></button>' +
          "</div>"
        );
      })
      .join("");

    var empty = els.siteListEmpty;
    empty.hidden = filtered.length > 0;
    if (!filtered.length) {
      empty.textContent = query ? "没有匹配的网站" : "暂无网站，点击“新增网站”创建第一个网站。";
    }
    requestAnimationFrame(function () {
      els.siteListWrap.classList.toggle(
        "is-scrollable",
        els.siteList.scrollHeight > els.siteList.clientHeight + 2
      );
    });
  }

  function columnRowHtml(column, index) {
    var confirming = state.deleteId === column.id;
    return (
      '<tr data-column="' + esc(column.id) + '">' +
      "<td>" + String(index + 1).padStart(2, "0") + "</td>" +
      '<td class="cell-channel" title="' + esc(column.channel) + '">' + esc(column.channel) + "</td>" +
      '<td class="cell-level1" title="' + esc(column.level1) + '">' + esc(column.level1) + "</td>" +
      '<td class="cell-level2" title="' + esc(column.level2) + '">' + (column.level2 ? esc(column.level2) : '<span class="cell-muted">—</span>') + "</td>" +
      '<td><span class="col-url" title="' + esc(column.url) + '">' + esc(column.url) + "</span></td>" +
      "<td>" + statusPill(column.status) + "</td>" +
      '<td class="cell-actions">' +
      (confirming
        ? '<button type="button" class="btn btn--link link-danger" data-col-delete-confirm="' + esc(column.id) + '">确认</button>' +
          '<button type="button" class="btn btn--link" data-col-delete-cancel="' + esc(column.id) + '">取消</button>'
        : '<button type="button" class="btn btn--link" data-col-edit="' + esc(column.id) + '">编辑</button>' +
          '<button type="button" class="btn btn--link link-danger" data-col-delete="' + esc(column.id) + '">删除</button>') +
      "</td></tr>"
    );
  }

  function paintColumns() {
    var site = currentSite();
    var hasSite = !!site;
    els.siteViewBtn.disabled = !hasSite;
    els.siteEditBtn.disabled = !hasSite;
    els.columnsAdd.disabled = !hasSite;
    els.columnSearch.disabled = !hasSite;

    if (!site) {
      els.columnsSub.textContent = "选择网站后管理栏目";
      els.columnsMeta.textContent = "";
      els.columnsBody.innerHTML = "";
      els.columnsTableWrap.hidden = true;
      els.columnsEmpty.hidden = false;
      els.columnsEmptyTitle.textContent = "尚未选择网站";
      els.columnsEmptyHint.textContent = "从左侧列表选择网站，查看并维护其采集栏目。";
      els.columnsEmptyAction.hidden = true;
      els.columnsCount.textContent = "";
      els.columnsStatus.textContent = "";
      return;
    }

    var query = state.colQuery.toLowerCase();
    var filtered = query
      ? site.columns.filter(function (column) {
          return [column.channel, column.level1, column.level2, column.url]
            .join(" ")
            .toLowerCase()
            .indexOf(query) >= 0;
        })
      : site.columns;
    var active = site.columns.filter(function (column) {
      return column.status !== "disabled";
    }).length;

    els.columnsSub.textContent = site.name + " · 共 " + site.columns.length + " 个栏目";
    els.columnsMeta.textContent = "启用 " + active + " · 停用 " + (site.columns.length - active);
    els.columnsBody.innerHTML = filtered.map(columnRowHtml).join("");
    els.columnsTableWrap.hidden = !filtered.length;
    els.columnsEmpty.hidden = !!filtered.length;
    if (!filtered.length) {
      if (query) {
        els.columnsEmptyTitle.textContent = "没有匹配的栏目";
        els.columnsEmptyHint.textContent = "尝试更换关键词，或清空搜索条件。";
        els.columnsEmptyAction.hidden = false;
        els.columnsEmptyAction.textContent = "清空搜索";
        els.columnsEmptyAction.setAttribute("data-empty-action", "clear");
      } else {
        els.columnsEmptyTitle.textContent = "暂无栏目";
        els.columnsEmptyHint.textContent = "点击“新增栏目”添加该网站的第一个采集栏目。";
        els.columnsEmptyAction.hidden = false;
        els.columnsEmptyAction.textContent = "新增栏目";
        els.columnsEmptyAction.setAttribute("data-empty-action", "add");
      }
    }
    els.columnsCount.textContent = "共 " + site.columns.length + " 个栏目";
    els.columnsStatus.textContent = "启用 " + active + " 个 · 停用 " + (site.columns.length - active) + " 个";
    requestAnimationFrame(function () {
      els.columnsScrollHint.hidden =
        els.columnsTableWrap.scrollWidth <= els.columnsTableWrap.clientWidth + 2;
    });
  }

  function paintAll() {
    paintSiteList();
    paintColumns();
  }

  function selectSite(id) {
    if (state.siteId === id) return;
    clearDeleteTimer();
    state.siteId = id;
    state.deleteId = null;
    state.colQuery = "";
    lastSiteId = id;
    els.columnSearch.value = "";
    paintAll();
  }

  /* ---------- 事件 ---------- */
  function bind() {
    els.siteSearch.addEventListener("input", paintSiteList);
    els.siteList.addEventListener("click", function (event) {
      var del = event.target.closest("[data-site-del]");
      if (del) {
        var delSite = findSite(del.getAttribute("data-site-del"));
        if (delSite) openSiteDelete(delSite, del);
        return;
      }
      var item = event.target.closest("[data-site]");
      if (item) selectSite(item.getAttribute("data-site"));
    });
    els.sitesAdd.addEventListener("click", function () {
      openSiteForm("create", null, els.sitesAdd);
    });
    els.siteViewBtn.addEventListener("click", function () {
      openSiteView(currentSite(), els.siteViewBtn);
    });
    els.siteEditBtn.addEventListener("click", function () {
      var site = currentSite();
      if (site) openSiteForm("edit", site, els.siteEditBtn);
    });
    els.columnsAdd.addEventListener("click", function () {
      openColumnForm("create", null, els.columnsAdd);
    });
    els.columnSearch.addEventListener("input", function () {
      state.colQuery = els.columnSearch.value;
      state.deleteId = null;
      clearDeleteTimer();
      paintColumns();
    });
    els.columnsBody.addEventListener("click", function (event) {
      var edit = event.target.closest("[data-col-edit]");
      if (edit) {
        openColumnForm("edit", edit.getAttribute("data-col-edit"), edit);
        return;
      }
      var del = event.target.closest("[data-col-delete]");
      if (del) {
        startColumnDelete(del.getAttribute("data-col-delete"));
        return;
      }
      var confirm = event.target.closest("[data-col-delete-confirm]");
      if (confirm) {
        confirmColumnDelete(confirm.getAttribute("data-col-delete-confirm"));
        return;
      }
      var cancel = event.target.closest("[data-col-delete-cancel]");
      if (cancel) {
        state.deleteId = null;
        clearDeleteTimer();
        paintColumns();
        els.columnSearch.focus();
      }
    });
    els.columnsEmptyAction.addEventListener("click", function () {
      if (els.columnsEmptyAction.getAttribute("data-empty-action") === "add") {
        openColumnForm("create", null, els.columnsEmptyAction);
        return;
      }
      state.colQuery = "";
      els.columnSearch.value = "";
      paintColumns();
      els.columnSearch.focus();
    });
    els.modalRoot.addEventListener("click", function (event) {
      if (event.target.closest("[data-site-delete-confirm]")) {
        confirmSiteDelete();
        return;
      }
      if (event.target.closest("[data-modal-close]")) closeModal();
    });
    els.modalBody.addEventListener("submit", function (event) {
      event.preventDefault();
      if (event.target.id === "siteForm") submitSiteForm();
      else if (event.target.id === "columnForm") submitColumnForm();
    });
  }

  /* ---------- 生命周期 ---------- */
  function destroy() {
    if (els && !els.modalRoot.hidden) closeModal(false);
    clearDeleteTimer();
    if (modalKeyHandler) {
      document.removeEventListener("keydown", modalKeyHandler);
      modalKeyHandler = null;
    }
    document.body.classList.remove("modal-open");
    if (els) els.modalRoot.hidden = true;
    els = null;
    modal = null;
  }

  function render(main, session) {
    destroy();
    scope.own = !!(session && session.roleId !== "archive-staff");
    scope.org = session && session.org ? session.org : "";
    ensureStore();
    state = initialState();
    lastSiteId = state.siteId;
    main.innerHTML = shellHtml();
    els = {
      siteSearch: main.querySelector("#siteSearch"),
      siteList: main.querySelector("#siteList"),
      siteListWrap: main.querySelector("#siteListWrap"),
      siteListEmpty: main.querySelector("#siteListEmpty"),
      sitesCount: main.querySelector("#sitesCount"),
      sitesAdd: main.querySelector("#sitesAdd"),
      siteViewBtn: main.querySelector("#siteViewBtn"),
      siteEditBtn: main.querySelector("#siteEditBtn"),
      columnsAdd: main.querySelector("#columnsAdd"),
      columnsSub: main.querySelector("#columnsSub"),
      columnSearch: main.querySelector("#columnSearch"),
      columnsTableWrap: main.querySelector("#columnsTableWrap"),
      columnsBody: main.querySelector("#columnsBody"),
      columnsEmpty: main.querySelector("#columnsEmpty"),
      columnsEmptyTitle: main.querySelector("#columnsEmptyTitle"),
      columnsEmptyHint: main.querySelector("#columnsEmptyHint"),
      columnsEmptyAction: main.querySelector("#columnsEmptyAction"),
      columnsScrollHint: main.querySelector("#columnsScrollHint"),
      columnsCount: main.querySelector("#columnsCount"),
      columnsStatus: main.querySelector("#columnsStatus"),
      columnsMeta: main.querySelector("#columnsMeta"),
      modalRoot: main.querySelector("#sitesModal"),
      modal: main.querySelector("#sitesDialog"),
      modalTitle: main.querySelector("#sitesModalTitle"),
      modalBody: main.querySelector("#sitesModalBody"),
      modalFoot: main.querySelector("#sitesModalFoot")
    };
    bind();
    paintAll();
  }

  WCR.sites = { render: render, destroy: destroy };
  global.WCR = WCR;
})(window);
