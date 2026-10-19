/* ==========================================================================
   分类库维护 — 原型实现（会话内存，不连接后端）
   ========================================================================== */
(function (global) {
  "use strict";

  var WCR = global.WCR || {};
  var seed = WCR.CATEGORIES || [];
  var store = null;
  var state = { query: "" };
  var els = {};
  var modal = {
    root: null,
    dialog: null,
    title: null,
    body: null,
    foot: null,
    returnFocus: null,
    keyHandler: null
  };

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function esc(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function categories() {
    if (!store) store = clone(seed);
    return store;
  }

  function visible() {
    var query = state.query.trim().toLowerCase();
    if (!query) return categories().slice();
    return categories().filter(function (item) {
      return (
        item.name.toLowerCase().indexOf(query) >= 0 ||
        item.code.toLowerCase().indexOf(query) >= 0 ||
        String(item.note || "").toLowerCase().indexOf(query) >= 0
      );
    });
  }

  function rowHtml(item, index) {
    return (
      '<tr data-id="' +
      esc(item.id) +
      '">' +
      '<td class="category-seq">' +
      String(index + 1).padStart(2, "0") +
      "</td>" +
      '<td><div class="category-name">' +
      esc(item.name) +
      (item.builtin ? '<span class="pill pill--neutral">内置</span>' : "") +
      "</div></td>" +
      '<td><span class="category-code">' +
      esc(item.code) +
      "</span></td>" +
      '<td class="category-note" title="' +
      esc(item.note || "") +
      '">' +
      esc(item.note || "—") +
      "</td>" +
      '<td><div class="category-actions">' +
      '<button type="button" class="btn btn--link category-action" data-edit="' +
      esc(item.id) +
      '">编辑</button>' +
      '<button type="button" class="btn btn--link category-action category-action--danger" data-delete="' +
      esc(item.id) +
      '">删除</button>' +
      "</div></td></tr>"
    );
  }

  function paint() {
    var list = visible();
    var total = categories().length;
    var filtering = state.query.trim().length > 0;

    els.body.innerHTML = list.map(rowHtml).join("");
    els.count.textContent = filtering
      ? "筛选出 " + list.length + " 个 / 共 " + total + " 个"
      : "共 " + total + " 个分类";
    els.foot.textContent = "共 " + total + " 个分类";

    var empty = list.length === 0;
    els.tableWrap.hidden = empty;
    els.empty.hidden = !empty;
    if (empty) {
      var noData = total === 0;
      els.emptyTitle.textContent = noData ? "分类库为空" : "没有匹配的分类";
      els.emptyHint.textContent = noData
        ? "点击“新增分类”创建第一个分类。"
        : "尝试更换关键词，或清空搜索条件。";
      els.emptyAction.textContent = noData ? "新增分类" : "清空搜索";
      els.emptyAction.setAttribute("data-empty-action", noData ? "add" : "clear");
    }
  }

  function setError(input, error, message) {
    if (input) {
      input.classList.toggle("is-invalid", !!message);
      input.setAttribute("aria-invalid", message ? "true" : "false");
    }
    if (error) {
      error.hidden = !message;
      error.textContent = message || "";
    }
  }

  function clearErrors() {
    setError(els.modalBody.querySelector("#cfName"), els.modalBody.querySelector("#cfNameError"), "");
    setError(els.modalBody.querySelector("#cfCode"), els.modalBody.querySelector("#cfCodeError"), "");
  }

  function openModal(config) {
    modal.returnFocus = config.returnFocus || null;
    modal.title.textContent = config.title;
    modal.body.innerHTML = config.body;
    modal.foot.innerHTML = config.foot || "";
    modal.root.hidden = false;
    document.body.classList.add("modal-open");
    modal.keyHandler = function (event) {
      if (event.key === "Escape") {
        event.preventDefault();
        closeModal(true);
        return;
      }
      if (event.key !== "Tab") return;
      var focusable = modal.dialog.querySelectorAll(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (!focusable.length) return;
      var first = focusable[0];
      var last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", modal.keyHandler);
    var focusTarget = config.focus
      ? modal.body.querySelector(config.focus)
      : null;
    (focusTarget || modal.dialog).focus();
    if (config.onMount) config.onMount();
  }

  function closeModal(restoreFocus) {
    if (!modal.root || modal.root.hidden) return;
    modal.root.hidden = true;
    document.body.classList.remove("modal-open");
    if (modal.keyHandler) {
      document.removeEventListener("keydown", modal.keyHandler);
      modal.keyHandler = null;
    }
    var target = modal.returnFocus;
    modal.returnFocus = null;
    if (restoreFocus && target && document.contains(target)) target.focus();
  }

  function formBody(item) {
    var isEdit = !!item;
    var value = item || { name: "", code: "", note: "" };
    return (
      '<p class="category-modal-intro">' +
      (isEdit
        ? "修改后立即更新分类名称、类别代码与备注。"
        : "新增分类会追加到分类库末尾，保存后可用于网页档案分类。") +
      "</p>" +
      '<form id="categoryForm" class="form-grid" novalidate>' +
      '<div class="field"><label class="field-label" for="cfName">分类名称 <span class="required">*</span></label>' +
      '<input class="input" id="cfName" type="text" value="' +
      esc(value.name) +
      '" placeholder="请输入分类名称" autocomplete="off" />' +
      '<p class="field-error" id="cfNameError" hidden></p></div>' +
      '<div class="field"><label class="field-label" for="cfCode">类别代码 <span class="required">*</span></label>' +
      '<input class="input category-code-input" id="cfCode" type="text" value="' +
      esc(value.code) +
      '" placeholder="例如：LMSY" autocomplete="off" />' +
      '<p class="field-help">2–20 位大写字母或数字，以字母开头；保存后用于分类映射。</p>' +
      '<p class="field-error" id="cfCodeError" hidden></p></div>' +
      '<div class="field field--full"><label class="field-label" for="cfNote">备注</label>' +
      '<textarea class="textarea" id="cfNote" rows="3" maxlength="200" placeholder="选填，说明该分类的适用范围或划分口径">' +
      esc(value.note || "") +
      "</textarea>" +
      '<p class="field-help">选填，最多 200 字。</p></div>' +
      "</form>"
    );
  }

  function validate(values, ownId) {
    var errors = {};
    var name = values.name.trim();
    var code = values.code.trim().toUpperCase();
    if (!name) errors.cfName = "请输入分类名称";
    if (!code) {
      errors.cfCode = "请输入类别代码";
    } else if (!/^[A-Z][A-Z0-9]{1,19}$/.test(code)) {
      errors.cfCode = "请输入 2–20 位大写字母或数字，并以字母开头";
    } else if (
      categories().some(function (item) {
        return item.id !== ownId && item.code.toUpperCase() === code;
      })
    ) {
      errors.cfCode = "该类别代码已被其他分类使用";
    }
    return errors;
  }

  function openForm(item, source) {
    openModal({
      title: item ? "编辑分类" : "新增分类",
      body: formBody(item),
      foot:
        '<button type="button" class="btn" data-modal-close>取消</button>' +
        '<button type="button" class="btn btn--primary" id="categorySave">' +
        (item ? "保存修改" : "创建分类") +
        "</button>",
      returnFocus: source,
      focus: "#cfName",
      onMount: function () {
        var form = modal.body.querySelector("#categoryForm");
        var codeInput = modal.body.querySelector("#cfCode");
        var nameInput = modal.body.querySelector("#cfName");
        var noteInput = modal.body.querySelector("#cfNote");
        function submit() {
          clearErrors();
          var values = {
            name: nameInput.value,
            code: codeInput.value,
            note: noteInput.value
          };
          var errors = validate(values, item ? item.id : null);
          var firstInput = null;
          if (errors.cfName) {
            setError(nameInput, modal.body.querySelector("#cfNameError"), errors.cfName);
            firstInput = firstInput || nameInput;
          }
          if (errors.cfCode) {
            setError(codeInput, modal.body.querySelector("#cfCodeError"), errors.cfCode);
            firstInput = firstInput || codeInput;
          }
          if (firstInput) {
            firstInput.focus();
            return;
          }
          var payload = {
            name: values.name.trim(),
            code: values.code.trim().toUpperCase(),
            note: values.note.trim()
          };
          if (item) {
            item.name = payload.name;
            item.code = payload.code;
            item.note = payload.note;
            closeModal(false);
            paint();
            if (els.add) els.add.focus();
            toast("已保存分类“" + payload.name + "”。", "success");
          } else {
            categories().push({
              id: "cat-" + Date.now().toString(36),
              name: payload.name,
              code: payload.code,
              note: payload.note,
              builtin: false
            });
            closeModal(false);
            state.query = "";
            if (els.search) els.search.value = "";
            paint();
            if (els.add) els.add.focus();
            toast("已新增分类“" + payload.name + "”。", "success");
          }
        }
        form.addEventListener("submit", function (event) {
          event.preventDefault();
          submit();
        });
        modal.foot.querySelector("#categorySave").addEventListener("click", submit);
        nameInput.addEventListener("input", function () {
          setError(nameInput, modal.body.querySelector("#cfNameError"), "");
        });
        codeInput.addEventListener("input", function () {
          var start = codeInput.selectionStart;
          codeInput.value = codeInput.value.toUpperCase();
          codeInput.setSelectionRange(start, start);
          setError(codeInput, modal.body.querySelector("#cfCodeError"), "");
        });
      }
    });
  }

  function openDelete(item, source) {
    openModal({
      title: "删除分类",
      body:
        '<p class="category-modal-intro">确认删除分类“<strong>' +
        esc(item.name) +
        '</strong>”（类别代码：' +
        esc(item.code) +
        "）吗？</p>" +
        '<div class="category-warning">' +
        '<svg class="icon" aria-hidden="true"><use href="#icon-alert-triangle"/></svg>' +
        "<span>删除后，使用该分类的网页档案将失去分类映射；当前会话内不可撤销。</span>" +
        "</div>",
      foot:
        '<button type="button" class="btn" data-modal-close>取消</button>' +
        '<button type="button" class="btn btn--danger" id="categoryDelete">删除分类</button>',
      returnFocus: source,
      onMount: function () {
        var button = modal.foot.querySelector("#categoryDelete");
        button.addEventListener("click", function () {
          var list = categories();
          var index = list.indexOf(item);
          if (index >= 0) list.splice(index, 1);
          closeModal(false);
          paint();
          if (els.add) els.add.focus();
          toast("已删除分类“" + item.name + "”。", "success");
        });
      }
    });
  }

  function toast(message, type) {
    if (WCR.ui && WCR.ui.toast) WCR.ui.toast(message, type);
  }

  function bind(main) {
    els = {
      body: main.querySelector("#categoryBody"),
      tableWrap: main.querySelector("#categoryTableWrap"),
      count: main.querySelector("#categoryCount"),
      foot: main.querySelector("#categoryFoot"),
      empty: main.querySelector("#categoryEmpty"),
      emptyTitle: main.querySelector("#categoryEmptyTitle"),
      emptyHint: main.querySelector("#categoryEmptyHint"),
      emptyAction: main.querySelector("#categoryEmptyAction"),
      search: main.querySelector("#categorySearch"),
      add: main.querySelector("#categoryAdd"),
      root: main.querySelector("#categoryModal"),
      dialog: main.querySelector("#categoryDialog"),
      title: main.querySelector("#categoryModalTitle"),
      modalBody: main.querySelector("#categoryModalBody"),
      modalFoot: main.querySelector("#categoryModalFoot")
    };
    modal.root = els.root;
    modal.dialog = els.dialog;
    modal.title = els.title;
    modal.body = els.modalBody;
    modal.foot = els.modalFoot;

    els.add.addEventListener("click", function () {
      openForm(null, els.add);
    });
    els.search.addEventListener("input", function () {
      state.query = els.search.value;
      paint();
    });
    els.body.addEventListener("click", function (event) {
      var edit = event.target.closest("[data-edit]");
      var del = event.target.closest("[data-delete]");
      if (edit) {
        var item = categories().filter(function (entry) {
          return entry.id === edit.getAttribute("data-edit");
        })[0];
        if (item) openForm(item, edit);
      } else if (del) {
        var target = categories().filter(function (entry) {
          return entry.id === del.getAttribute("data-delete");
        })[0];
        if (target) openDelete(target, del);
      }
    });
    els.emptyAction.addEventListener("click", function () {
      if (els.emptyAction.getAttribute("data-empty-action") === "add") {
        openForm(null, els.emptyAction);
      } else {
        state.query = "";
        els.search.value = "";
        paint();
        els.search.focus();
      }
    });
    els.root.addEventListener("click", function (event) {
      if (event.target.closest("[data-modal-close]")) closeModal(true);
    });
  }

  function shellHtml() {
    return (
      '<div class="category-page">' +
      '<div class="page-head"><div><h1>分类库维护</h1></div>' +
      '<div class="page-actions">' +
      '<button type="button" class="btn btn--primary" id="categoryAdd">' +
      '<svg class="icon icon--sm" aria-hidden="true"><use href="#icon-plus"/></svg>新增分类</button>' +
      "</div></div>" +
      '<section class="card category-card" aria-labelledby="categoryTitle">' +
      '<h2 class="visually-hidden" id="categoryTitle">分类库列表</h2>' +
      '<div class="category-toolbar">' +
      '<div class="control control--icon category-search">' +
      '<svg class="icon control-icon" aria-hidden="true"><use href="#icon-search"/></svg>' +
      '<input class="input" id="categorySearch" type="search" placeholder="搜索分类名称、类别代码或备注" aria-label="搜索分类" autocomplete="off" />' +
      "</div>" +
      '<p class="category-count" id="categoryCount" aria-live="polite"></p>' +
      "</div>" +
      '<div class="table-wrap" id="categoryTableWrap">' +
      '<table class="data-table category-table">' +
      '<caption class="visually-hidden">分类库列表</caption>' +
      '<thead><tr><th scope="col">序号</th><th scope="col">分类名称</th><th scope="col">类别代码</th><th scope="col">备注</th><th scope="col">操作</th></tr></thead>' +
      '<tbody id="categoryBody"></tbody>' +
      "</table></div>" +
      '<p class="table-scroll-hint category-scroll-hint">左右滑动查看完整分类表</p>' +
      '<div class="empty category-empty" id="categoryEmpty" hidden>' +
      '<svg class="empty-art" aria-hidden="true"><use href="#icon-layers"/></svg>' +
      '<p class="empty-title" id="categoryEmptyTitle"></p>' +
      '<p class="empty-hint" id="categoryEmptyHint"></p>' +
      '<button class="btn" type="button" id="categoryEmptyAction" data-empty-action="add"></button>' +
      "</div>" +
      '<div class="table-foot"><span id="categoryFoot"></span><span>修改仅当前会话生效</span></div>' +
      "</section>" +
      '<div class="modal-layer" id="categoryModal" hidden>' +
      '<div class="modal-mask" data-modal-close></div>' +
      '<div class="modal category-modal" id="categoryDialog" role="dialog" aria-modal="true" aria-labelledby="categoryModalTitle" tabindex="-1">' +
      '<div class="modal-head"><h2 id="categoryModalTitle"></h2>' +
      '<button type="button" class="icon-btn" data-modal-close aria-label="关闭"><svg class="icon" aria-hidden="true"><use href="#icon-x"/></svg></button></div>' +
      '<div class="modal-body" id="categoryModalBody"></div>' +
      '<div class="modal-foot" id="categoryModalFoot"></div>' +
      "</div></div>" +
      "</div>"
    );
  }

  function render(main) {
    categories();
    state.query = "";
    main.innerHTML = shellHtml();
    bind(main);
    paint();
  }

  function destroy() {
    if (modal.root && !modal.root.hidden) closeModal(false);
    modal.root = null;
  }

  WCR.categories = { render: render, destroy: destroy };
  global.WCR = WCR;
})(window);
