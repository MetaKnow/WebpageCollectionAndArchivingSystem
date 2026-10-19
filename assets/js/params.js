/* ==========================================================================
   系统参数 — 分类导航、参数表格、搜索、编辑与批量恢复
   依赖 data.js（WCR.PARAMS）、app.js（WCR.ui.toast）
   ========================================================================== */
(function (global) {
  "use strict";

  var WCR = global.WCR || {};
  var DATA = WCR.PARAMS;
  var store = null;
  var state = null;
  var els = null;

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
    if (store) return;
    store = {};
    DATA.tabs.forEach(function (tab) {
      if (!tab.rows) return;
      tab.rows.forEach(function (row) {
        store[row.key] = row.value;
      });
    });
  }

  function currentTab() {
    for (var i = 0; i < DATA.tabs.length; i++) {
      if (DATA.tabs[i].key === state.tabKey) return DATA.tabs[i];
    }
    return DATA.tabs[0];
  }

  function currentRows() {
    return currentTab().rows.map(function (row, index) {
      var copy = {};
      Object.keys(row).forEach(function (key) {
        copy[key] = row[key];
      });
      copy.value = store[row.key];
      copy.index = index + 1;
      return copy;
    });
  }

  function visibleRows() {
    var rows = currentRows();
    var query = state.query.toLowerCase();
    if (!query) return rows;
    return rows.filter(function (row) {
      var haystack = [row.desc, row.key, row.type, row.value].join(" ").toLowerCase();
      return haystack.indexOf(query) >= 0;
    });
  }

  function validate(row, value) {
    if (!value) return "参数值不能为空";
    if (row.type === "数字") {
      if (!/^\d+$/.test(value)) return "请输入非负整数";
      var num = parseInt(value, 10);
      if (row.key === "app_port" && (num < 1 || num > 65535)) {
        return "端口范围为 1–65535";
      }
      if (typeof row.min === "number" && num < row.min) {
        return "不能小于 " + row.min;
      }
      if (typeof row.max === "number" && num > row.max) {
        return "不能大于 " + row.max;
      }
    }
    if (row.type === "选择" && row.options && row.options.indexOf(value) < 0) {
      return "请选择有效的参数值";
    }
    return "";
  }

  function tabsHtml() {
    return DATA.tabs
      .map(function (tab) {
        var active = tab.key === state.tabKey;
        return (
          '<button type="button" role="tab" data-tab="' +
          esc(tab.key) +
          '"' +
          (tab.pending ? ' data-pending="true" title="页面暂未生成"' : "") +
          ' aria-selected="' +
          String(active) +
          '" class="' +
          (active ? "is-active" : "") +
          (tab.pending ? " is-pending" : "") +
          '">' +
          esc(tab.title) +
          "</button>"
        );
      })
      .join("");
  }

  function actionsHtml() {
    if (state.editing) {
      return (
        '<button class="btn btn--primary" type="button" id="paramsSaveBtn">' +
        '<svg class="icon icon--sm" aria-hidden="true"><use href="#icon-check"/></svg>' +
        "保存配置" +
        "</button>" +
        '<button class="btn btn--text" type="button" id="paramsCancelBtn">取消</button>'
      );
    }
    return (
      '<button class="btn btn--primary" type="button" id="paramsConfigBtn">' +
      '<svg class="icon icon--sm" aria-hidden="true"><use href="#icon-pencil"/></svg>' +
      "参数配置" +
      "</button>"
    );
  }

  function shellHtml() {
    return (
      '<div class="params-page">' +
      '<h1 class="visually-hidden">系统参数</h1>' +
      '<div class="card params-card">' +
      '<div class="params-layout">' +
      '<nav class="params-nav" aria-label="参数分类" role="tablist">' +
      tabsHtml() +
      "</nav>" +
      '<div class="params-main" role="tabpanel">' +
      '<div class="params-toolbar">' +
      '<div class="params-toolbar-left" id="paramsActions">' +
      actionsHtml() +
      "</div>" +
      '<div class="params-toolbar-right">' +
      '<div class="params-search" id="paramsSearch" hidden>' +
      '<div class="control control--icon control--action">' +
      '<svg class="icon control-icon" aria-hidden="true"><use href="#icon-search"/></svg>' +
      '<input class="input" type="search" id="paramsSearchInput" placeholder="搜索描述、配置项或参数值" aria-label="搜索参数" autocomplete="off" />' +
      '<button class="control-action" type="button" id="paramsSearchClear" aria-label="清空搜索">' +
      '<svg class="icon icon--sm" aria-hidden="true"><use href="#icon-x"/></svg>' +
      "</button>" +
      "</div>" +
      "</div>" +
      '<button class="icon-btn" type="button" id="paramsSearchBtn" aria-label="搜索参数" aria-expanded="false" title="搜索">' +
      '<svg class="icon" aria-hidden="true"><use href="#icon-search"/></svg>' +
      "</button>" +
      '<button class="icon-btn" type="button" id="paramsRefresh" aria-label="刷新参数" title="刷新">' +
      '<svg class="icon" aria-hidden="true"><use href="#icon-refresh"/></svg>' +
      "</button>" +
      '<div class="help-wrap">' +
      '<button class="icon-btn" type="button" id="paramsHelpBtn" aria-label="参数说明" aria-expanded="false" title="参数说明">' +
      '<svg class="icon" aria-hidden="true"><use href="#icon-help-circle"/></svg>' +
      "</button>" +
      '<div class="help-pop" id="paramsHelp" hidden>' +
      "<strong>参数类型说明</strong>" +
      "<ul>" +
      "<li><b>文本</b>：普通字符串，例如系统名称、访问地址。</li>" +
      "<li><b>数字</b>：仅允许非负整数，端口范围为 1–65535。</li>" +
      "<li><b>选择</b>：从预置选项中选择，保存后立即影响对应功能。</li>" +
      "<li><b>本地资源</b>：填写服务器上的文件路径，例如 logo、favicon。</li>" +
      "</ul>" +
      "<p>原型仅模拟保存到当前会话，不写入后端，也不会修改真实配置文件。</p>" +
      "</div>" +
      "</div>" +
      "</div>" +
      "</div>" +
      '<div class="table-wrap">' +
      '<table class="data-table params-table">' +
      "<thead><tr>" +
      '<th class="cell-check" scope="col"><label class="row-check"><input type="checkbox" id="paramsCheckAll" aria-label="全选当前参数" /><span class="visually-hidden">全选</span></label></th>' +
      '<th class="cell-index" scope="col">序号</th>' +
      '<th scope="col">描述</th>' +
      '<th scope="col">配置项</th>' +
      '<th class="cell-type" scope="col">配置类型</th>' +
      "<th scope=\"col\">参数值</th>" +
      "</tr></thead>" +
      '<tbody id="paramsBody"></tbody>' +
      "</table>" +
      "</div>" +
      emptyBlockHtml() +
      '<p class="params-scroll-hint" id="paramsScrollHint">左右滑动查看完整参数表</p>' +
      '<div class="table-foot">' +
      '<span id="paramsCount"></span>' +
      '<span class="table-foot-actions" id="paramsSelection"></span>' +
      "</div>" +
      pendingBlockHtml() +
      "</div>" +
      "</div>" +
      "</div>" +
      "</div>"
    );
  }

  function valueHtml(row, error) {
    var invalid = error ? " is-invalid" : "";
    var describedBy = error
      ? ' aria-describedby="param-error-' + esc(row.key) + '"'
      : "";
    if (!state.editing) {
      var cls =
        row.type === "本地资源" ? "param-value param-value--path" : "param-value";
      return '<span class="' + cls + '">' + esc(row.value) + "</span>";
    }

    var control;
    if (row.type === "选择") {
      var options = (row.options || [])
        .map(function (option) {
          return (
            '<option value="' +
            esc(option) +
            '"' +
            (String(option) === String(row.value) ? " selected" : "") +
            ">" +
            esc(option) +
            "</option>"
          );
        })
        .join("");
      control =
        '<div class="select-wrap">' +
        '<select class="select' +
        invalid +
        '" data-key="' +
        esc(row.key) +
        '" aria-label="' +
        esc(row.desc) +
        '"' +
        describedBy +
        ">" +
        options +
        "</select>" +
        '<svg class="icon icon--sm" aria-hidden="true"><use href="#icon-chevron-down"/></svg>' +
        "</div>";
    } else {
      var type = row.type === "数字" ? "number" : "text";
      var attrs = "";
      if (row.type === "数字") {
        attrs += ' inputmode="numeric" step="1"';
        if (typeof row.min === "number") attrs += ' min="' + row.min + '"';
        if (typeof row.max === "number") attrs += ' max="' + row.max + '"';
      }
      control =
        '<input class="input' +
        invalid +
        '" type="' +
        type +
        '" data-key="' +
        esc(row.key) +
        '" value="' +
        esc(row.value) +
        '" aria-label="' +
        esc(row.desc) +
        '"' +
        attrs +
        describedBy +
        " />";
    }

    var errorHtml = error
      ? '<span class="cell-error" id="param-error-' +
        esc(row.key) +
        '">' +
        esc(error) +
        "</span>"
      : "";
    return control + errorHtml;
  }

  function rowHtml(row) {
    var checked = !!state.selected[row.key];
    var disabled = state.editing ? " disabled" : "";
    var error = state.errors[row.key];
    return (
      '<tr class="' +
      (checked ? "is-selected" : "") +
      '">' +
      '<td class="cell-check"><label class="row-check"><input type="checkbox" data-key="' +
      esc(row.key) +
      '"' +
      (checked ? " checked" : "") +
      disabled +
      ' aria-label="选择 ' +
      esc(row.desc) +
      '" /><span class="visually-hidden">选择</span></label></td>' +
      '<td class="cell-index">' +
      row.index +
      "</td>" +
      "<td>" +
      esc(row.desc) +
      "</td>" +
      '<td class="cell-key">' +
      esc(row.key) +
      "</td>" +
      '<td class="cell-type">' +
      esc(row.type) +
      "</td>" +
      '<td class="cell-value">' +
      valueHtml(row, error) +
      "</td>" +
      "</tr>"
    );
  }

  function emptyBlockHtml() {
    return (
      '<div class="params-empty" id="paramsEmpty" hidden>' +
      '<svg class="icon icon--24" aria-hidden="true"><use href="#icon-search"/></svg>' +
      '<p class="params-empty-title">没有匹配的参数</p>' +
      '<p class="params-empty-hint">尝试更换关键词，或清空搜索条件。</p>' +
      '<button class="btn" type="button" data-empty-clear>清空搜索</button>' +
      "</div>"
    );
  }

  function pendingBlockHtml() {
    return (
      '<div class="params-pending" id="paramsPending" hidden>' +
      '<svg class="icon icon--24" aria-hidden="true"><use href="#icon-clock"/></svg>' +
      '<p class="params-pending-title" id="paramsPendingTitle"></p>' +
      '<p class="params-pending-hint">当前原型仅保留该分类标签，参数列表与配置入口将在后续迭代补充。</p>' +
      '<button class="btn" type="button" id="paramsPendingBack">查看外观参数</button>' +
      "</div>"
    );
  }

  function renderTable() {
    if (currentTab().pending) {
      els.toolbar.hidden = true;
      els.tableWrap.hidden = true;
      els.empty.hidden = true;
      els.scrollHint.hidden = true;
      els.foot.hidden = true;
      els.pending.hidden = false;
      els.pendingTitle.textContent = currentTab().title + "页面暂未生成";
      return;
    }
    els.toolbar.hidden = false;
    els.foot.hidden = false;
    els.pending.hidden = true;
    var rows = visibleRows();
    var hasRows = rows.length > 0;
    els.body.innerHTML = hasRows ? rows.map(rowHtml).join("") : "";
    els.tableWrap.hidden = !hasRows;
    els.empty.hidden = hasRows;
    els.scrollHint.hidden = !hasRows;
    updateCount();
    syncCheckAll();
  }

  function updateCount() {
    var total = currentTab().rows.length;
    var shown = visibleRows().length;
    els.count.textContent = state.query
      ? "筛选出 " + shown + " 项 / 共 " + total + " 项"
      : "共 " + total + " 项";

    var selectedKeys = currentTab()
      .rows.map(function (row) {
        return row.key;
      })
      .filter(function (key) {
        return !!state.selected[key];
      });

    if (state.editing) {
      els.selection.innerHTML =
        '<span class="params-edit-hint">编辑中，保存后仅当前会话生效</span>';
      return;
    }
    if (!selectedKeys.length) {
      els.selection.innerHTML =
        '<span class="params-edit-hint">勾选参数可批量恢复默认值</span>';
      return;
    }
    els.selection.innerHTML =
      "<span>已选 " +
      selectedKeys.length +
      " 项</span>" +
      '<button class="btn btn--link" type="button" data-reset-selected>恢复默认值</button>' +
      '<button class="btn btn--link" type="button" data-clear-selected>取消选择</button>';
  }

  function syncCheckAll() {
    var rows = visibleRows();
    var checked = rows.filter(function (row) {
      return !!state.selected[row.key];
    }).length;
    els.checkAll.checked = rows.length > 0 && checked === rows.length;
    els.checkAll.indeterminate = checked > 0 && checked < rows.length;
    els.checkAll.disabled = state.editing;
  }

  function syncToolbar() {
    els.searchBtn.disabled = state.editing;
    els.refresh.disabled = state.editing;
    Array.prototype.forEach.call(els.nav.querySelectorAll("button"), function (btn) {
      btn.disabled = state.editing;
    });
    if (state.editing) {
      els.search.hidden = true;
      els.searchBtn.setAttribute("aria-expanded", "false");
    }
  }

  function updateTabs() {
    Array.prototype.forEach.call(els.nav.querySelectorAll("button"), function (btn) {
      var active = btn.getAttribute("data-tab") === state.tabKey;
      btn.classList.toggle("is-active", active);
      btn.setAttribute("aria-selected", String(active));
    });
  }

  function syncSearchClear() {
    els.searchClear.hidden = !els.searchInput.value;
  }

  function clearSearch() {
    els.searchInput.value = "";
    state.query = "";
    renderTable();
    syncSearchClear();
    els.searchInput.focus();
  }

  function openSearch() {
    els.search.hidden = false;
    els.searchBtn.setAttribute("aria-expanded", "true");
    syncSearchClear();
    els.searchInput.focus();
  }

  function closeSearch(clear) {
    els.search.hidden = true;
    els.searchBtn.setAttribute("aria-expanded", "false");
    if (clear) {
      els.searchInput.value = "";
      if (state.query) {
        state.query = "";
        renderTable();
      }
    }
    syncSearchClear();
  }

  function enterEdit() {
    state.editing = true;
    state.draft = {};
    state.errors = {};
    state.selected = {};
    state.query = "";
    currentTab().rows.forEach(function (row) {
      state.draft[row.key] = store[row.key];
    });
    closeSearch(false);
    els.searchInput.value = "";
    syncSearchClear();
    els.actions.innerHTML = actionsHtml();
    renderTable();
    syncToolbar();
    var first = els.body.querySelector(".cell-value input[data-key], .cell-value select[data-key]");
    if (first) first.focus();
    toast("已进入参数配置模式，修改后请保存。", "info");
  }

  function cancelEdit() {
    state.editing = false;
    state.draft = null;
    state.errors = {};
    els.actions.innerHTML = actionsHtml();
    renderTable();
    syncToolbar();
    toast("已取消本次修改。", "info");
  }

  function saveEdit() {
    var rows = currentTab().rows;
    var firstError = null;
    state.errors = {};
    rows.forEach(function (row) {
      var value =
        state.draft[row.key] == null ? "" : String(state.draft[row.key]).trim();
      state.draft[row.key] = value;
      var message = validate(row, value);
      if (message) {
        state.errors[row.key] = message;
        if (!firstError) firstError = row.key;
      }
    });

    if (firstError) {
      renderTable();
      var target = els.body.querySelector('.cell-value [data-key="' + firstError + '"]');
      if (target) target.focus();
      toast("有参数未通过校验，请检查后再保存。", "warning");
      return;
    }

    rows.forEach(function (row) {
      store[row.key] = state.draft[row.key];
    });
    var count = rows.length;
    state.editing = false;
    state.draft = null;
    state.errors = {};
    els.actions.innerHTML = actionsHtml();
    renderTable();
    syncToolbar();
    toast("已保存 " + count + " 项参数（仅当前会话生效）。", "success");
  }

  function switchTab(key) {
    if (state.editing || key === state.tabKey) return;
    state.tabKey = key;
    state.query = "";
    state.selected = {};
    state.errors = {};
    closeSearch(false);
    els.searchInput.value = "";
    syncSearchClear();
    updateTabs();
    renderTable();
  }

  function resetSelected() {
    var keys = currentTab()
      .rows.map(function (row) {
        return row.key;
      })
      .filter(function (key) {
        return !!state.selected[key];
      });
    if (!keys.length) return;
    keys.forEach(function (key) {
      var row = currentTab().rows.filter(function (item) {
        return item.key === key;
      })[0];
      if (row) store[key] = row.value;
    });
    state.selected = {};
    renderTable();
    toast("已恢复 " + keys.length + " 项默认值（仅当前会话生效）。", "success");
  }

  function onFieldChange(event) {
    var target = event.target;
    if (!target || !target.closest) return;

    if (target.id === "paramsCheckAll") {
      var rows = visibleRows();
      rows.forEach(function (row) {
        if (target.checked) state.selected[row.key] = true;
        else delete state.selected[row.key];
      });
      renderTable();
      return;
    }

    var checkbox = target.closest('input[type="checkbox"][data-key]');
    if (checkbox) {
      var key = checkbox.getAttribute("data-key");
      if (checkbox.checked) state.selected[key] = true;
      else delete state.selected[key];
      renderTable();
      return;
    }

    if (!state.editing) return;
    var field = target.closest("input[data-key], select[data-key]");
    if (!field) return;
    var fieldKey = field.getAttribute("data-key");
    state.draft[fieldKey] = field.value;
    if (state.errors[fieldKey]) {
      delete state.errors[fieldKey];
      field.classList.remove("is-invalid");
      field.removeAttribute("aria-describedby");
      var errorEl = document.getElementById("param-error-" + fieldKey);
      if (errorEl) errorEl.parentNode.removeChild(errorEl);
    }
  }

  function bind() {
    els.actions.addEventListener("click", function (event) {
      var button = event.target.closest("button");
      if (!button) return;
      if (button.id === "paramsConfigBtn") enterEdit();
      else if (button.id === "paramsSaveBtn") saveEdit();
      else if (button.id === "paramsCancelBtn") cancelEdit();
    });

    els.nav.addEventListener("click", function (event) {
      var button = event.target.closest("button[data-tab]");
      if (!button) return;
      if (state.editing) {
        toast("请先保存或取消当前修改。", "warning");
        return;
      }
      switchTab(button.getAttribute("data-tab"));
    });

    els.pendingBack.addEventListener("click", function () {
      switchTab(DATA.tabs[0].key);
    });

    els.table.addEventListener("change", onFieldChange);
    els.table.addEventListener("input", onFieldChange);

    els.body.addEventListener("click", function (event) {
      if (event.target.closest("[data-empty-clear]")) clearSearch();
    });
    els.empty.addEventListener("click", function (event) {
      if (event.target.closest("[data-empty-clear]")) clearSearch();
    });

    els.selection.addEventListener("click", function (event) {
      var button = event.target.closest("button");
      if (!button) return;
      if (button.hasAttribute("data-reset-selected")) resetSelected();
      else if (button.hasAttribute("data-clear-selected")) {
        state.selected = {};
        renderTable();
      }
    });

    els.searchBtn.addEventListener("click", function () {
      if (state.editing) return;
      if (els.search.hidden) openSearch();
      else closeSearch(true);
    });

    els.searchInput.addEventListener("input", function () {
      state.query = els.searchInput.value.trim();
      syncSearchClear();
      renderTable();
    });

    els.searchClear.addEventListener("click", clearSearch);

    els.refresh.addEventListener("click", function () {
      if (state.editing) return;
      renderTable();
      toast("已刷新当前参数。", "info");
    });

    els.helpBtn.addEventListener("click", function (event) {
      event.stopPropagation();
      var open = els.help.hidden;
      els.help.hidden = !open;
      els.helpBtn.setAttribute("aria-expanded", String(open));
    });

    document.addEventListener("click", function onDocumentClick(event) {
      if (!document.body.contains(els.wrap)) {
        document.removeEventListener("click", onDocumentClick);
        return;
      }
      if (!els.helpWrap.contains(event.target)) {
        els.help.hidden = true;
        els.helpBtn.setAttribute("aria-expanded", "false");
      }
    });

    document.addEventListener("keydown", function onKeydown(event) {
      if (!document.body.contains(els.wrap)) {
        document.removeEventListener("keydown", onKeydown);
        return;
      }
      if (event.key !== "Escape") return;
      if (!els.help.hidden) {
        els.help.hidden = true;
        els.helpBtn.setAttribute("aria-expanded", "false");
      }
      if (!els.search.hidden) closeSearch(true);
    });
  }

  function render(main) {
    ensureStore();
    state = {
      tabKey: DATA.tabs[0].key,
      query: "",
      selected: {},
      editing: false,
      draft: null,
      errors: {}
    };

    var wrap = document.createElement("div");
    wrap.className = "params-page";
    wrap.innerHTML = shellHtml();
    main.innerHTML = "";
    main.appendChild(wrap);

    els = {
      wrap: wrap,
      nav: wrap.querySelector(".params-nav"),
      actions: wrap.querySelector("#paramsActions"),
      toolbar: wrap.querySelector(".params-toolbar"),
      foot: wrap.querySelector(".table-foot"),
      pending: wrap.querySelector("#paramsPending"),
      pendingTitle: wrap.querySelector("#paramsPendingTitle"),
      pendingBack: wrap.querySelector("#paramsPendingBack"),
      table: wrap.querySelector(".params-table"),
      tableWrap: wrap.querySelector(".table-wrap"),
      empty: wrap.querySelector("#paramsEmpty"),
      scrollHint: wrap.querySelector("#paramsScrollHint"),
      body: wrap.querySelector("#paramsBody"),
      count: wrap.querySelector("#paramsCount"),
      selection: wrap.querySelector("#paramsSelection"),
      checkAll: wrap.querySelector("#paramsCheckAll"),
      search: wrap.querySelector("#paramsSearch"),
      searchBtn: wrap.querySelector("#paramsSearchBtn"),
      searchInput: wrap.querySelector("#paramsSearchInput"),
      searchClear: wrap.querySelector("#paramsSearchClear"),
      refresh: wrap.querySelector("#paramsRefresh"),
      helpWrap: wrap.querySelector(".help-wrap"),
      helpBtn: wrap.querySelector("#paramsHelpBtn"),
      help: wrap.querySelector("#paramsHelp")
    };

    bind();
    renderTable();
    syncToolbar();
    syncSearchClear();
  }

  global.WCR = WCR;
  WCR.params = { render: render };
})(window);
