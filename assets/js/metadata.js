(function (global) {
  "use strict";

  var TYPES = [
    { key: "text", label: "文本" },
    { key: "textarea", label: "长文本" },
    { key: "number", label: "数字" },
    { key: "date", label: "日期" },
    { key: "datetime", label: "日期时间" },
    { key: "select", label: "选择" },
    { key: "url", label: "链接" }
  ];

  var TABS = [
    { key: "collection", label: "收集库" },
    { key: "archive", label: "归档库" }
  ];

  var RULES = [
    { key: "archive-number", label: "档号规则" },
    { key: "form", label: "表单规则" },
    { key: "list", label: "列表规则" },
    { key: "sort", label: "排序规则" },
    { key: "name", label: "名称规则" },
    { key: "category", label: "分类规则" },
    { key: "report", label: "报表规则" },
    { key: "storage", label: "存储规则" },
    { key: "serial", label: "流水号规则" },
    { key: "keyword", label: "关键字规则" },
    { key: "stamp", label: "归档章配置" },
    { key: "group", label: "字段分组规则" },
    { key: "filter", label: "批量筛选规则" },
    { key: "search", label: "检索字段规则" }
  ];

  var ruleState = { archiveNumber: "format1" };
  var ruleDraft = { archiveNumber: "format1" };

  var DICTIONARY_OPTIONS = [
    { key: "", label: "无" },
    { key: "retention", label: "保管期限" },
    { key: "security", label: "密级" },
    { key: "category", label: "档案类别" },
    { key: "openness", label: "开放状态" }
  ];

  var DEFAULT_TYPE_OPTIONS = [
    { key: "", label: "无" },
    { key: "fixed", label: "固定值" },
    { key: "currentDate", label: "当前日期" },
    { key: "currentYear", label: "当前年度" },
    { key: "currentUser", label: "当前用户" }
  ];

  var state = { tabKey: "collection", query: "" };
  var store = null;
  var els = {};
  var modal = null;
  var modalReturnFocus = null;
  var modalKeyHandler = null;

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function esc(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function ensureStore() {
    if (!store) store = clone(global.WCR.META_SEED);
  }

  function library() {
    return store[state.tabKey] || [];
  }

  function tabMeta(key) {
    for (var i = 0; i < TABS.length; i += 1) {
      if (TABS[i].key === key) return TABS[i];
    }
    return TABS[0];
  }

  function typeLabel(type) {
    for (var i = 0; i < TYPES.length; i += 1) {
      if (TYPES[i].key === type) return TYPES[i].label;
    }
    return type;
  }

  function metadataChoices() {
    var seen = {};
    var list = [{ key: "", label: "请选择元数据" }];
    (global.WCR.META_SEED.collection || []).forEach(function (field) {
      if (!field.code || seen[field.code]) return;
      seen[field.code] = true;
      list.push({ key: field.code, label: field.name });
    });
    return list;
  }

  function metadataLabel(key) {
    var list = metadataChoices();
    for (var i = 0; i < list.length; i += 1) {
      if (list[i].key === key) return list[i].key ? list[i].label : "—";
    }
    return "—";
  }

  function dictionaryLabel(key) {
    for (var i = 0; i < DICTIONARY_OPTIONS.length; i += 1) {
      if (DICTIONARY_OPTIONS[i].key === key) return DICTIONARY_OPTIONS[i].label;
    }
    return "—";
  }

  function defaultTypeLabel(key) {
    for (var i = 0; i < DEFAULT_TYPE_OPTIONS.length; i += 1) {
      if (DEFAULT_TYPE_OPTIONS[i].key === key) return DEFAULT_TYPE_OPTIONS[i].label;
    }
    return "无";
  }

  function visibleFields() {
    var query = state.query.trim().toLowerCase();
    if (!query) return library();
    return library().filter(function (field) {
      return (
        String(field.name || "").toLowerCase().indexOf(query) >= 0 ||
        String(field.hint || "").toLowerCase().indexOf(query) >= 0 ||
        String(field.code || "").toLowerCase().indexOf(query) >= 0 ||
        metadataLabel(field.metadata).toLowerCase().indexOf(query) >= 0
      );
    });
  }

  function counts() {
    var list = library();
    var builtin = list.filter(function (field) { return field.builtin; }).length;
    var readonly = list.filter(function (field) { return field.readonly; }).length;
    return {
      total: list.length,
      builtin: builtin,
      custom: list.length - builtin,
      readonly: readonly
    };
  }

  function switchButton(field, key, label) {
    return (
      '<button type="button" class="switch" role="switch" aria-checked="' +
      (field[key] ? "true" : "false") +
      '" data-toggle="' +
      key +
      '" data-field="' +
      esc(field.id) +
      '" aria-label="' +
      esc(field.name) +
      " " +
      label +
      '"><span></span></button>'
    );
  }

  function rowHtml(field, index, total) {
    return (
      '<tr data-field="' +
      esc(field.id) +
      '">' +
      '<td><div class="meta-order"><span class="meta-seq">' +
      String(index + 1).padStart(2, "0") +
      "</span>" +
      '<span class="meta-move">' +
      '<button type="button" class="meta-move-btn" data-move="up" data-field="' +
      esc(field.id) +
      '" aria-label="上移 ' +
      esc(field.name) +
      '"' +
      (index === 0 ? " disabled" : "") +
      '><svg class="icon icon--sm" aria-hidden="true"><use href="#icon-arrow-up"/></svg></button>' +
      '<button type="button" class="meta-move-btn" data-move="down" data-field="' +
      esc(field.id) +
      '" aria-label="下移 ' +
      esc(field.name) +
      '"' +
      (index === total - 1 ? " disabled" : "") +
      '><svg class="icon icon--sm" aria-hidden="true"><use href="#icon-arrow-down"/></svg></button>' +
      "</span></div></td>" +
      '<td><div class="meta-name-cell"><div class="meta-name-line"><strong>' +
      esc(field.name) +
      '</strong><span class="meta-source meta-source--' +
      (field.builtin ? "builtin" : "custom") +
      '">' +
      (field.builtin ? "内置" : "自定义") +
      "</span></div>" +
      (field.hint ? '<p class="meta-hint">' + esc(field.hint) + "</p>" : "") +
      "</div></td>" +
      '<td class="meta-type">' +
      esc(typeLabel(field.type)) +
      "</td>" +
      '<td class="meta-length">' +
      esc(field.length || "—") +
      "</td>" +
      "<td>" +
      switchButton(field, "required", "必填") +
      "</td>" +
      "<td>" +
      switchButton(field, "readonly", "只读") +
      "</td>" +
      "<td>" +
      esc(metadataLabel(field.metadata)) +
      "</td>" +
      "<td>" +
      esc(dictionaryLabel(field.dictionary)) +
      "</td>" +
      "<td>" +
      esc(defaultTypeLabel(field.defaultType)) +
      "</td>" +
      '<td><div class="meta-actions">' +
      '<button type="button" class="btn btn--link meta-action" data-edit="' +
      esc(field.id) +
      '">编辑</button>' +
      '<button type="button" class="btn btn--link meta-action meta-action--danger" data-delete="' +
      esc(field.id) +
      '">删除</button>' +
      "</div></td></tr>"
    );
  }

  function emptyRowHtml() {
    return (
      '<tr><td colspan="10"><div class="meta-empty">' +
      '<span class="meta-empty-icon"><svg class="icon icon--lg" aria-hidden="true"><use href="#icon-search"/></svg></span>' +
      "<strong>没有匹配的著录项</strong>" +
      "<p>尝试更换关键词，或清空搜索条件。</p>" +
      '<button type="button" class="btn" id="metaEmptyClear">清空搜索</button>' +
      "</div></td></tr>"
    );
  }

  function tabsHtml() {
    return TABS.map(function (tab) {
      var active = state.tabKey === tab.key;
      return (
        '<button type="button" class="meta-tab' +
        (active ? " is-active" : "") +
        '" role="tab" aria-selected="' +
        active +
        '" data-meta-tab="' +
        tab.key +
        '">' +
        tab.label +
        '<span class="meta-tab-count" id="metaCount-' +
        tab.key +
        '">' +
        (store[tab.key] || []).length +
        "</span></button>"
      );
    }).join("");
  }

  function shellHtml() {
    return (
      '<div class="page-head"><div><h1>元数据配置</h1></div>' +
      '<div class="page-actions">' +
      '<button type="button" class="btn" id="metaRules"><svg class="icon icon--sm" aria-hidden="true"><use href="#icon-settings"/></svg>规则设置</button>' +
      '<button type="button" class="btn btn--primary" id="metaAdd"><svg class="icon icon--sm" aria-hidden="true"><use href="#icon-plus"/></svg>新增著录项</button>' +
      "</div></div>" +
      '<section class="card meta-card" aria-labelledby="metaTitle">' +
      '<h2 class="visually-hidden" id="metaTitle">元数据著录项配置</h2>' +
      '<div class="meta-tabs" role="tablist" aria-label="元数据库">' +
      tabsHtml() +
      "</div>" +
      '<div class="meta-toolbar">' +
      '<div class="control control--icon meta-search"><svg class="icon control-icon" aria-hidden="true"><use href="#icon-search"/></svg>' +
      '<input class="input" id="metaSearch" type="search" placeholder="搜索著录项名称、提示语或元数据" aria-label="搜索元数据著录项" autocomplete="off" /></div>' +
      '<p class="meta-stats" id="metaStats" aria-live="polite"></p>' +
      "</div>" +
      '<p class="table-scroll-hint" id="metaScrollHint">左右滑动查看完整著录项表</p>' +
      '<div class="table-wrap">' +
      '<table class="data-table meta-table" aria-label="元数据著录项配置表">' +
      '<thead><tr><th scope="col">排序</th><th scope="col">著录项名称</th><th scope="col">数据类型</th><th scope="col">总长度</th>' +
      '<th scope="col">必填</th><th scope="col">只读</th><th scope="col">元数据</th><th scope="col">字典类型</th><th scope="col">默认值类型</th><th scope="col">操作</th></tr></thead>' +
      '<tbody id="metaBody"></tbody>' +
      "</table></div>" +
      '<div class="meta-foot"><span id="metaFoot"></span><span>修改仅当前会话生效</span></div>' +
      "</section>" +
      '<p class="page-footnote">收集库与归档库相互独立；内置与自定义著录项均可删除，删除与调整仅影响当前会话。著录项顺序会同步到采集列表、档案列表与详情页。</p>' +
      '<div class="modal-layer" id="metaModalRoot" hidden>' +
      '<div class="modal-mask" data-modal-close></div>' +
      '<div class="modal meta-modal" id="metaDialog" role="dialog" aria-modal="true" aria-labelledby="metaModalTitle" tabindex="-1">' +
      '<div class="modal-head"><h2 id="metaModalTitle"></h2>' +
      '<button type="button" class="icon-btn" data-modal-close aria-label="关闭"><svg class="icon" aria-hidden="true"><use href="#icon-x"/></svg></button></div>' +
      '<div class="modal-body" id="metaModalBody"></div>' +
      '<div class="modal-foot" id="metaModalFoot"></div>' +
      "</div></div>"
    );
  }

  function paintTabs() {
    Array.prototype.forEach.call(els.tabs.querySelectorAll("[data-meta-tab]"), function (button) {
      var key = button.getAttribute("data-meta-tab");
      var active = key === state.tabKey;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-selected", String(active));
      var count = button.querySelector(".meta-tab-count");
      if (count) count.textContent = String((store[key] || []).length);
    });
  }

  function paintTable() {
    var list = library();
    var visible = visibleFields();
    var c = counts();
    els.body.innerHTML = visible.length
      ? visible.map(function (field) {
          return rowHtml(field, list.indexOf(field), list.length);
        }).join("")
      : emptyRowHtml();
    els.stats.textContent =
      "共 " + c.total + " 个著录项 · 内置 " + c.builtin + " · 自定义 " + c.custom + " · 只读 " + c.readonly;
    els.foot.textContent = "共 " + c.total + " 个著录项";
    els.search.value = state.query;
    paintTabs();
  }

  function paintAll() {
    paintTable();
  }

  function cache(main) {
    els = {
      main: main,
      tabs: main.querySelector(".meta-tabs"),
      body: main.querySelector("#metaBody"),
      stats: main.querySelector("#metaStats"),
      foot: main.querySelector("#metaFoot"),
      search: main.querySelector("#metaSearch"),
      add: main.querySelector("#metaAdd"),
      rules: main.querySelector("#metaRules"),
      modalRoot: main.querySelector("#metaModalRoot"),
      modalTitle: main.querySelector("#metaModalTitle"),
      modalBody: main.querySelector("#metaModalBody"),
      modalFoot: main.querySelector("#metaModalFoot"),
      modal: main.querySelector("#metaDialog")
    };
  }

  function findField(id) {
    var list = library();
    for (var i = 0; i < list.length; i += 1) {
      if (list[i].id === id) return list[i];
    }
    return null;
  }

  function fieldIndex(id) {
    var list = library();
    for (var i = 0; i < list.length; i += 1) {
      if (list[i].id === id) return i;
    }
    return -1;
  }

  function toast(message, type) {
    if (global.WCR.ui && global.WCR.ui.toast) global.WCR.ui.toast(message, type);
  }

  function toggle(field, key, button) {
    field[key] = !field[key];
    button.setAttribute("aria-checked", String(field[key]));
    paintTable();
    var selector = '[data-toggle="' + key + '"][data-field="' + field.id + '"]';
    var next = els.body.querySelector(selector);
    if (next) next.focus();
  }

  function move(field, direction) {
    var list = library();
    var index = fieldIndex(field.id);
    if (index < 0) return;
    var target = direction === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= list.length) return;
    var moved = list.splice(index, 1)[0];
    list.splice(target, 0, moved);
    paintTable();
    var next = els.body.querySelector('[data-move="' + direction + '"][data-field="' + field.id + '"]');
    if (!next || next.disabled) {
      next = els.body.querySelector('[data-move="' + (direction === "up" ? "down" : "up") + '"][data-field="' + field.id + '"]');
    }
    if (next) next.focus();
  }

  function optionsHtml(list, value) {
    return list
      .map(function (option) {
        return (
          '<option value="' +
          esc(option.key) +
          '"' +
          (option.key === value ? " selected" : "") +
          ">" +
          esc(option.label) +
          "</option>"
        );
      })
      .join("");
  }

  function formRow(opts) {
    var required = opts.required ? '<span class="meta-form-required">*</span> ' : "";
    var label = opts.switch
      ? '<span class="meta-form-label" id="' + opts.labelId + '">' + required + opts.label + "：</span>"
      : '<label class="meta-form-label" for="' + opts.id + '">' + required + opts.label + "：</label>";
    return (
      '<div class="meta-form-row" data-row="' +
      opts.name +
      '">' +
      label +
      '<div class="meta-form-control">' +
      opts.control +
      (opts.hint ? '<p class="meta-form-hint">' + opts.hint + "</p>" : "") +
      '<p class="meta-row-error" id="mf' +
      opts.name.charAt(0).toUpperCase() +
      opts.name.slice(1) +
      'Error" hidden></p>' +
      "</div></div>"
    );
  }

  function switchControl(name, value) {
    var cap = name.charAt(0).toUpperCase() + name.slice(1);
    return (
      '<div class="meta-switch-control">' +
      '<button type="button" class="switch meta-form-switch" role="switch" data-form-switch="' +
      name +
      '" aria-checked="' +
      (value ? "true" : "false") +
      '" aria-labelledby="mf' +
      cap +
      'Label"><span></span></button>' +
      '<span class="meta-switch-state" id="mf' +
      cap +
      'State">' +
      (value ? "是" : "否") +
      "</span></div>"
    );
  }

  function formBody(field, create) {
    var builtin = !create && field.builtin;
    var f = field || {
      name: "",
      hint: "",
      type: "text",
      length: 30,
      required: false,
      readonly: false,
      metadata: "",
      dictionary: "",
      defaultType: "",
      defaultValue: "",
      searchable: false,
      display: true,
      options: []
    };
    var typeOptions = TYPES.map(function (type) { return { key: type.key, label: type.label }; });
    var metadata = metadataChoices();
    return (
      '<p class="meta-modal-intro">' +
      (create
        ? "新增著录项会追加到当前库末尾；元数据会根据著录项名称自动匹配，也可手动选择。"
        : builtin
          ? "内置著录项的名称与数据类型固定；可调整长度、必填、只读、元数据映射与列表设置。"
          : "可调整著录项的名称、数据类型、长度、映射和展示设置。") +
      "</p>" +
      '<form id="metaFieldForm" class="meta-form" novalidate>' +
      formRow({
        name: "name",
        id: "mfName",
        label: "著录项名称",
        required: true,
        control:
          '<input class="input input--lg" id="mfName" type="text" value="' +
          esc(f.name) +
          '" placeholder="请输入著录项名称"' +
          (builtin ? " disabled" : "") +
          " />"
      }) +
      formRow({
        name: "hint",
        id: "mfHint",
        label: "著录项提示语",
        control:
          '<input class="input input--lg" id="mfHint" type="text" value="' +
          esc(f.hint || f.desc || "") +
          '" placeholder="请输入著录项提示语" />'
      }) +
      formRow({
        name: "type",
        id: "mfType",
        label: "著录项数据类型",
        control:
          '<div class="select-wrap"><select class="select" id="mfType"' +
          (builtin ? " disabled" : "") +
          ">" +
          optionsHtml(typeOptions, f.type) +
          '</select><svg class="icon icon--sm" aria-hidden="true"><use href="#icon-chevron-down"/></svg></div>',
        hint: builtin ? "内置著录项的数据类型不可修改。" : ""
      }) +
      formRow({
        name: "length",
        id: "mfLength",
        label: "总长度",
        control:
          '<input class="input input--lg" id="mfLength" type="number" min="1" max="2000" step="1" value="' +
          esc(f.length || 30) +
          '" />',
        hint: "允许 1–2000 个字符。"
      }) +
      formRow({
        name: "required",
        label: "是否必填",
        labelId: "mfRequiredLabel",
        switch: true,
        control: switchControl("required", !!f.required)
      }) +
      formRow({
        name: "readonly",
        label: "是否只读",
        labelId: "mfReadonlyLabel",
        switch: true,
        control: switchControl("readonly", !!f.readonly)
      }) +
      formRow({
        name: "metadata",
        id: "mfMetadata",
        label: "元数据",
        control:
          '<div class="select-wrap"><select class="select" id="mfMetadata">' +
          optionsHtml(metadata, f.metadata || "") +
          '</select><svg class="icon icon--sm" aria-hidden="true"><use href="#icon-chevron-down"/></svg></div>',
        hint: "元数据会根据著录项名称自动匹配关联，也可手动选择。"
      }) +
      formRow({
        name: "dictionary",
        id: "mfDictionary",
        label: "字典类型",
        control:
          '<div class="select-wrap"><select class="select" id="mfDictionary">' +
          optionsHtml(DICTIONARY_OPTIONS, f.dictionary || "") +
          '</select><svg class="icon icon--sm" aria-hidden="true"><use href="#icon-chevron-down"/></svg></div>'
      }) +
      formRow({
        name: "defaultType",
        id: "mfDefaultType",
        label: "默认值类型",
        control:
          '<div class="select-wrap"><select class="select" id="mfDefaultType">' +
          optionsHtml(DEFAULT_TYPE_OPTIONS, f.defaultType || "") +
          '</select><svg class="icon icon--sm" aria-hidden="true"><use href="#icon-chevron-down"/></svg></div>'
      }) +
      '<div class="meta-form-row" id="mfDefaultValueRow"' +
      (f.defaultType === "fixed" ? "" : " hidden") +
      ">" +
      '<label class="meta-form-label" for="mfDefaultValue">默认值：</label>' +
      '<div class="meta-form-control"><input class="input input--lg" id="mfDefaultValue" type="text" value="' +
      esc(f.defaultValue || "") +
      '" placeholder="请输入默认值" /></div></div>' +
      formRow({
        name: "searchable",
        label: "是否可检索",
        labelId: "mfSearchableLabel",
        switch: true,
        control: switchControl("searchable", !!f.searchable)
      }) +
      formRow({
        name: "display",
        label: "列表显示",
        labelId: "mfDisplayLabel",
        switch: true,
        control: switchControl("display", !!f.display)
      }) +
      formRow({
        name: "options",
        id: "mfOptions",
        label: "选项配置",
        control:
          '<textarea class="input textarea" id="mfOptions" rows="3" placeholder="仅选择类型需要，多个选项用逗号分隔">' +
          esc((f.options || []).join("，")) +
          "</textarea>",
        hint: "仅著录项数据类型为“选择”时填写。"
      }) +
      '<p class="field-error meta-form-error" id="metaFormError" hidden><svg class="icon icon--sm" aria-hidden="true"><use href="#icon-alert-triangle"/></svg><span></span></p>' +
      "</form>"
    );
  }

  function onModalKeydown(event) {
    if (!modal) return;
    if (event.key === "Escape") {
      event.preventDefault();
      closeModal(true);
      return;
    }
    if (event.key !== "Tab") return;
    var focusables = els.modal.querySelectorAll(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    if (!focusables.length) return;
    var first = focusables[0];
    var last = focusables[focusables.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  function openModal(options) {
    modalReturnFocus = options.returnFocus || document.activeElement;
    modal = options;
    els.modalRoot.hidden = false;
    els.modal.classList.toggle("meta-rules-modal", !!options.wide);
    els.modalTitle.textContent = options.title;
    els.modalBody.innerHTML = options.body;
    els.modalFoot.innerHTML = options.foot;
    els.modalFoot.onclick = null;
    document.body.classList.add("modal-open");
    if (!modalKeyHandler) {
      modalKeyHandler = onModalKeydown;
      document.addEventListener("keydown", modalKeyHandler, true);
    }
    var target = options.focus ? els.modalBody.querySelector(options.focus) : null;
    if (!target) target = els.modal;
    target.focus();
    if (options.onMount) options.onMount();
  }

  function closeModal(restoreFocus) {
    if (!modal) return;
    var target = modalReturnFocus;
    modal = null;
    els.modalRoot.hidden = true;
    els.modal.classList.remove("meta-rules-modal");
    els.modalBody.innerHTML = "";
    els.modalFoot.innerHTML = "";
    document.body.classList.remove("modal-open");
    if (modalKeyHandler) {
      document.removeEventListener("keydown", modalKeyHandler, true);
      modalKeyHandler = null;
    }
    if (restoreFocus && target && document.contains(target)) target.focus();
  }

  function showFormError(message) {
    var error = els.modalBody.querySelector("#metaFormError");
    if (!error) return;
    error.hidden = false;
    error.querySelector("span").textContent = message;
    error.scrollIntoView({ block: "nearest" });
  }

  function clearFormErrors() {
    var error = els.modalBody.querySelector("#metaFormError");
    if (error) error.hidden = true;
    Array.prototype.forEach.call(els.modalBody.querySelectorAll(".meta-form-row.is-error"), function (row) {
      row.classList.remove("is-error");
    });
    Array.prototype.forEach.call(els.modalBody.querySelectorAll(".meta-row-error"), function (rowError) {
      rowError.hidden = true;
    });
  }

  function setRowError(name, message) {
    var row = els.modalBody.querySelector('[data-row="' + name + '"]');
    if (!row) {
      showFormError(message);
      return;
    }
    row.classList.add("is-error");
    var error = row.querySelector(".meta-row-error");
    if (error) {
      error.textContent = message;
      error.hidden = false;
    }
    var focusTarget = row.querySelector("input, select, textarea");
    if (focusTarget) focusTarget.focus();
  }

  function switchValue(name) {
    var button = els.modalBody.querySelector('[data-form-switch="' + name + '"]');
    return !!button && button.getAttribute("aria-checked") === "true";
  }

  function readForm() {
    var get = function (id) {
      var node = els.modalBody.querySelector(id);
      return node ? node.value : "";
    };
    return {
      name: get("#mfName").trim(),
      hint: get("#mfHint").trim(),
      type: get("#mfType"),
      length: Number(get("#mfLength")),
      required: switchValue("required"),
      readonly: switchValue("readonly"),
      metadata: get("#mfMetadata"),
      dictionary: get("#mfDictionary"),
      defaultType: get("#mfDefaultType"),
      defaultValue: get("#mfDefaultValue").trim(),
      searchable: switchValue("searchable"),
      display: switchValue("display"),
      options: get("#mfOptions")
        .split(/[,，\n]/)
        .map(function (item) { return item.trim(); })
        .filter(Boolean)
    };
  }

  function submitFieldForm(mode, field, source) {
    clearFormErrors();
    var values = readForm();
    if (!values.name) {
      setRowError("name", "必填项");
      return;
    }
    if (!values.length || values.length < 1 || values.length > 2000 || Math.floor(values.length) !== values.length) {
      setRowError("length", "请输入 1–2000 的整数");
      return;
    }
    if (values.type === "select" && !values.options.length) {
      setRowError("options", "选择类型至少需要一个选项");
      return;
    }
    if (values.defaultType === "fixed" && !values.defaultValue) {
      setRowError("defaultType", "默认值类型为固定值时必须填写默认值");
      return;
    }
    var target = field;
    if (mode === "create") {
      var code = "m-" + Date.now().toString(36);
      while (library().some(function (item) { return item.code === code; })) {
        code += "x";
      }
      target = {
        id: code,
        code: code,
        name: values.name,
        hint: values.hint,
        desc: values.hint,
        type: values.type,
        length: values.length,
        required: values.required,
        readonly: values.readonly,
        metadata: values.metadata,
        dictionary: values.dictionary,
        defaultType: values.defaultType,
        defaultValue: values.defaultType === "fixed" ? values.defaultValue : "",
        searchable: values.searchable,
        display: values.display,
        options: values.type === "select" ? values.options : [],
        builtin: false
      };
      library().push(target);
    } else {
      if (!target.builtin) {
        target.name = values.name;
        target.type = values.type;
      }
      target.hint = values.hint;
      target.desc = values.hint;
      target.length = values.length;
      target.required = values.required;
      target.readonly = values.readonly;
      target.metadata = values.metadata;
      target.dictionary = values.dictionary;
      target.defaultType = values.defaultType;
      target.defaultValue = values.defaultType === "fixed" ? values.defaultValue : "";
      target.searchable = values.searchable;
      target.display = values.display;
      target.options = values.type === "select" ? values.options : [];
    }
    closeModal(false);
    paintTable();
    var button = els.body.querySelector('[data-field="' + target.id + '"] [data-edit]');
    if (button) button.focus();
    toast(
      mode === "create" ? "已新增著录项“" + target.name + "”。" : "已保存著录项“" + target.name + "”。",
      "success"
    );
  }

  function ruleTokenHtml(tokens) {
    return tokens
      .map(function (token) {
        return '<span class="rule-token">' + esc(token) + "</span>";
      })
      .join('<span class="rule-sep">-</span>');
  }

  function archiveRuleTokens(second) {
    return [
      "全宗号",
      "WY",
      "网站代码",
      "年度",
      second ? "类别代码" : "保管期限代码",
      second ? "保管期限代码" : "类别代码",
      "顺序号"
    ];
  }

  function ruleOptionHtml(value, title, desc, selected) {
    return (
      '<label class="rule-option' +
      (selected ? " is-selected" : "") +
      '">' +
      '<input type="radio" name="archiveRule" value="' +
      value +
      '"' +
      (selected ? " checked" : "") +
      " />" +
      '<span class="rule-option-copy">' +
      '<span class="rule-option-title">' +
      title +
      "</span>" +
      '<span class="rule-code">' +
      ruleTokenHtml(archiveRuleTokens(value === "format2")) +
      "</span>" +
      '<span class="rule-option-desc">' +
      desc +
      "</span></span></label>"
    );
  }

  function ruleMainHtml(key) {
    var rule = null;
    RULES.forEach(function (item) {
      if (item.key === key) rule = item;
    });
    if (!rule) rule = RULES[0];
    if (key === "archive-number") {
      var selected = ruleDraft.archiveNumber;
      return (
        '<div class="rule-head"><h3>档号规则</h3>' +
        "<p>档号由以下字段按顺序以“-”连接生成，请选择一种组合方式。</p></div>" +
        '<div class="rule-options" role="radiogroup" aria-label="档号组合方式">' +
        ruleOptionHtml(
          "format1",
          "组合方式一",
          "保管期限代码位于类别代码之前。",
          selected === "format1"
        ) +
        ruleOptionHtml(
          "format2",
          "组合方式二",
          "类别代码位于保管期限代码之前。",
          selected === "format2"
        ) +
        "</div>" +
        '<div class="rule-note"><svg class="icon icon--sm" aria-hidden="true"><use href="#icon-info"/></svg>' +
        "<span>保存仅写入当前会话，用于规则预览，不会重算已有档号。</span></div>"
      );
    }
    return (
      '<div class="rule-head"><h3>' +
      esc(rule.label) +
      "</h3><p>本次原型仅生成档号规则配置，其他规则保留入口。</p></div>" +
      '<div class="rule-placeholder"><svg class="icon" aria-hidden="true"><use href="#icon-clock"/></svg>' +
      "<strong>" +
      esc(rule.label) +
      "配置暂未生成</strong>" +
      "<p>可继续切换左侧规则查看，档号规则已提供两种组合方式。</p></div>"
    );
  }

  function ruleFootHtml(key) {
    return (
      '<button type="button" class="btn" data-modal-close>关闭</button>' +
      (key === "archive-number"
        ? '<button type="button" class="btn btn--primary" id="rulesSave">保存规则</button>'
        : "")
    );
  }

  function openRules(source) {
    ruleDraft = { archiveNumber: ruleState.archiveNumber };
    openModal({
      title: "规则设置",
      wide: true,
      body:
        '<div class="rules-layout">' +
        '<nav class="rules-nav" role="tablist" aria-label="规则列表" aria-orientation="vertical">' +
        RULES.map(function (rule, index) {
          return (
            '<button type="button" class="rules-nav-item' +
            (index === 0 ? " is-active" : "") +
            '" role="tab" data-rule="' +
            rule.key +
            '" aria-selected="' +
            (index === 0 ? "true" : "false") +
            '" tabindex="' +
            (index === 0 ? "0" : "-1") +
            '">' +
            '<span>' +
            esc(rule.label) +
            "</span>" +
            '<svg class="icon icon--sm" aria-hidden="true"><use href="#icon-chevron-right"/></svg></button>'
          );
        }).join("") +
        "</nav>" +
        '<div class="rules-main" id="rulesMain" role="tabpanel">' +
        ruleMainHtml("archive-number") +
        "</div></div>",
      foot: ruleFootHtml("archive-number"),
      focus: ".rules-nav-item.is-active",
      returnFocus: source,
      onMount: bindRules
    });
  }

  function bindRules() {
    var nav = els.modalBody.querySelector(".rules-nav");
    var main = els.modalBody.querySelector("#rulesMain");
    var activeKey = "archive-number";

    function switchRule(key) {
      activeKey = key;
      Array.prototype.forEach.call(nav.querySelectorAll("[data-rule]"), function (button) {
        var active = button.getAttribute("data-rule") === key;
        button.classList.toggle("is-active", active);
        button.setAttribute("aria-selected", String(active));
        button.setAttribute("tabindex", active ? "0" : "-1");
      });
      main.innerHTML = ruleMainHtml(key);
      els.modalFoot.innerHTML = ruleFootHtml(key);
    }

    nav.addEventListener("click", function (event) {
      var button = event.target.closest("[data-rule]");
      if (!button) return;
      switchRule(button.getAttribute("data-rule"));
    });

    nav.addEventListener("keydown", function (event) {
      if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
      var buttons = Array.prototype.slice.call(nav.querySelectorAll("[data-rule]"));
      var current = buttons.indexOf(document.activeElement);
      if (current < 0) return;
      event.preventDefault();
      var next = (current + (event.key === "ArrowDown" ? 1 : -1) + buttons.length) % buttons.length;
      buttons[next].focus();
      switchRule(buttons[next].getAttribute("data-rule"));
    });

    main.addEventListener("change", function (event) {
      if (!event.target.matches('input[name="archiveRule"]')) return;
      ruleDraft.archiveNumber = event.target.value;
      Array.prototype.forEach.call(main.querySelectorAll(".rule-option"), function (option) {
        option.classList.toggle(
          "is-selected",
          option.querySelector('input[name="archiveRule"]').checked
        );
      });
    });

    els.modalFoot.onclick = function (event) {
      if (!event.target.closest("#rulesSave")) return;
      ruleState.archiveNumber = ruleDraft.archiveNumber;
      closeModal(true);
      toast("档号规则已保存（仅当前会话生效）。", "success");
    };
  }

  function openFieldForm(mode, field, source) {
    var create = mode === "create";
    var builtin = !create && field.builtin;
    openModal({
      title: create ? "新增著录项" : "编辑著录项",
      body: formBody(create ? null : field, create),
      foot:
        '<button type="button" class="btn" data-modal-close>取消</button>' +
        '<button type="button" class="btn btn--primary" id="metaFormSave">' +
        (create ? "创建著录项" : "保存修改") +
        "</button>",
      focus: create || !builtin ? "#mfName" : "#mfLength",
      returnFocus: source,
      onMount: function () {
        var form = els.modalBody.querySelector("#metaFieldForm");
        if (form) {
          form.addEventListener("submit", function (event) {
            event.preventDefault();
            submitFieldForm(mode, create ? null : field, source);
          });
          form.addEventListener("input", function (event) {
            var row = event.target.closest(".meta-form-row");
            if (row) {
              row.classList.remove("is-error");
              var error = row.querySelector(".meta-row-error");
              if (error) error.hidden = true;
            }
            var formError = els.modalBody.querySelector("#metaFormError");
            if (formError) formError.hidden = true;
          });
        }
        var save = els.modalBody.parentNode.querySelector("#metaFormSave");
        if (save) {
          save.addEventListener("click", function () {
            submitFieldForm(mode, create ? null : field, source);
          });
        }
        Array.prototype.forEach.call(els.modalBody.querySelectorAll("[data-form-switch]"), function (button) {
          button.addEventListener("click", function () {
            var next = button.getAttribute("aria-checked") !== "true";
            button.setAttribute("aria-checked", String(next));
            var stateText = els.modalBody.querySelector("#mf" + button.getAttribute("data-form-switch").charAt(0).toUpperCase() + button.getAttribute("data-form-switch").slice(1) + "State");
            if (stateText) stateText.textContent = next ? "是" : "否";
          });
        });
        var type = els.modalBody.querySelector("#mfType");
        var optionsRow = els.modalBody.querySelector('[data-row="options"]');
        if (type && optionsRow) {
          var syncOptions = function () {
            optionsRow.hidden = type.value !== "select";
          };
          type.addEventListener("change", syncOptions);
          syncOptions();
        }
        var defaultType = els.modalBody.querySelector("#mfDefaultType");
        var defaultRow = els.modalBody.querySelector("#mfDefaultValueRow");
        if (defaultType && defaultRow) {
          defaultType.addEventListener("change", function () {
            defaultRow.hidden = defaultType.value !== "fixed";
          });
        }
        var nameInput = els.modalBody.querySelector("#mfName");
        var metadataSelect = els.modalBody.querySelector("#mfMetadata");
        if (nameInput && metadataSelect && !builtin) {
          nameInput.addEventListener("input", function () {
            if (metadataSelect.value) return;
            var choices = metadataChoices();
            for (var i = 1; i < choices.length; i += 1) {
              if (choices[i].label === nameInput.value.trim()) {
                metadataSelect.value = choices[i].key;
                break;
              }
            }
          });
        }
      }
    });
  }

  function openDelete(field, source) {
    openModal({
      title: "删除著录项",
      body:
        '<p class="meta-modal-intro">确认删除著录项“<strong>' +
        esc(field.name) +
        "</strong>”" +
        (field.metadata ? "（元数据：" + esc(metadataLabel(field.metadata)) + "）" : "") +
        "吗？</p>" +
        '<div class="meta-warning"><svg class="icon" aria-hidden="true"><use href="#icon-alert-triangle"/></svg><span>删除后，该著录项的采集映射、检索条件与列表配置需要一并调整；当前会话内不可撤销。</span></div>',
      foot:
        '<button type="button" class="btn" data-modal-close>取消</button>' +
        '<button type="button" class="btn btn--danger" id="metaDeleteConfirm">删除著录项</button>',
      returnFocus: source,
      onMount: function () {
        var button = els.modalBody.parentNode.querySelector("#metaDeleteConfirm");
        if (button) {
          button.addEventListener("click", function () {
            var list = library();
            var index = list.indexOf(field);
            if (index >= 0) list.splice(index, 1);
            closeModal(false);
            paintTable();
            if (els.add) els.add.focus();
            toast("已删除著录项“" + field.name + "”。", "success");
          });
        }
      }
    });
  }

  function bind() {
    els.tabs.addEventListener("click", function (event) {
      var button = event.target.closest("[data-meta-tab]");
      if (!button) return;
      state.tabKey = button.getAttribute("data-meta-tab");
      state.query = "";
      paintTable();
      els.search.focus();
    });

    els.search.addEventListener("input", function () {
      state.query = els.search.value;
      paintTable();
    });

    els.add.addEventListener("click", function () {
      openFieldForm("create", null, els.add);
    });

    if (els.rules) {
      els.rules.addEventListener("click", function () {
        openRules(els.rules);
      });
    }

    els.body.addEventListener("click", function (event) {
      var moveBtn = event.target.closest("[data-move]");
      if (moveBtn) {
        var moveField = findField(moveBtn.getAttribute("data-field"));
        if (moveField) move(moveField, moveBtn.getAttribute("data-move"));
        return;
      }
      var toggleBtn = event.target.closest("[data-toggle]");
      if (toggleBtn) {
        var toggleField = findField(toggleBtn.getAttribute("data-field"));
        if (toggleField) toggle(toggleField, toggleBtn.getAttribute("data-toggle"), toggleBtn);
        return;
      }
      var editBtn = event.target.closest("[data-edit]");
      if (editBtn) {
        var edit = findField(editBtn.getAttribute("data-edit"));
        if (edit) openFieldForm("edit", edit, editBtn);
        return;
      }
      var deleteBtn = event.target.closest("[data-delete]");
      if (deleteBtn) {
        var removed = findField(deleteBtn.getAttribute("data-delete"));
        if (removed) openDelete(removed, deleteBtn);
        return;
      }
      if (event.target.closest("#metaEmptyClear")) {
        state.query = "";
        els.search.value = "";
        paintTable();
        els.search.focus();
      }
    });

    els.modalRoot.addEventListener("click", function (event) {
      if (event.target.closest("[data-modal-close]")) closeModal(true);
    });
  }

  function render(main) {
    ensureStore();
    state.tabKey = "collection";
    state.query = "";
    main.innerHTML = shellHtml();
    cache(main);
    bind();
    paintAll();
  }

  function destroy() {
    if (modal) closeModal(false);
    if (modalKeyHandler) {
      document.removeEventListener("keydown", modalKeyHandler, true);
      modalKeyHandler = null;
    }
    document.body.classList.remove("modal-open");
  }

  global.WCR = global.WCR || {};
  global.WCR.metadata = { render: render, destroy: destroy };
})(window);
