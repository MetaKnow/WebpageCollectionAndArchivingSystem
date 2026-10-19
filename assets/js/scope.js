/* ==========================================================================
   归档范围 — 归档范围与保管期限表（原型，会话内存）
   ========================================================================== */
(function (global) {
  "use strict";

  var WCR = global.WCR || {};
  var seed = WCR.SCOPE_ROWS || [];
  var store = null;
  var dirty = false;
  var els = {};
  var RETENTIONS = ["永久", "30 年", "10 年"];

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

  function rows() {
    if (!store) store = clone(seed);
    return store;
  }

  function countText(list) {
    var groups = list.filter(function (row) {
      return row.group;
    }).length;
    return (
      "共 " +
      list.length +
      " 条 · " +
      groups +
      " 个大类 / " +
      (list.length - groups) +
      " 个明细"
    );
  }

  function retentionOptions(value) {
    return (
      '<option value=""' +
      (value ? "" : " selected") +
      ">—</option>" +
      RETENTIONS.map(function (item) {
        return (
          '<option value="' +
          esc(item) +
          '"' +
          (item === value ? " selected" : "") +
          ">" +
          esc(item) +
          "</option>"
        );
      }).join("")
    );
  }

  function rowHtml(row) {
    var control = row.group
      ? '<span class="scope-dash" aria-label="不适用">—</span>'
      : '<select class="scope-retention" data-field="retention" aria-label="保管期限">' +
        retentionOptions(row.retention) +
        "</select>";
    return (
      '<tr data-id="' +
      esc(row.id) +
      '" data-group="' +
      (row.group ? "1" : "0") +
      '"' +
      (row.group ? ' class="scope-group"' : "") +
      ">" +
      '<td class="scope-seq"><input class="scope-seq-input' +
      (row.group ? " scope-seq-input--group" : "") +
      '" data-field="seq" type="text" value="' +
      esc(row.seq) +
      '" aria-label="序号" /></td>' +
      '<td><textarea class="scope-range' +
      (row.group ? " scope-range--group" : "") +
      '" data-field="range" rows="1" aria-label="归档范围">' +
      esc(row.range) +
      "</textarea></td>" +
      "<td>" +
      control +
      "</td></tr>"
    );
  }

  function autoGrow(textarea) {
    textarea.style.height = "auto";
    textarea.style.height = textarea.scrollHeight + "px";
  }

  function growAll() {
    Array.prototype.forEach.call(
      els.body.querySelectorAll("textarea.scope-range"),
      autoGrow
    );
  }

  function paintRows() {
    var list = rows();
    els.body.innerHTML = list.map(rowHtml).join("");
    els.count.textContent = countText(list);
    els.foot.textContent = countText(list);
    growAll();
  }

  function markDirty() {
    dirty = true;
    if (els.save) els.save.disabled = false;
    if (els.dirty) els.dirty.hidden = false;
  }

  function clearDirty() {
    dirty = false;
    if (els.save) els.save.disabled = true;
    if (els.dirty) els.dirty.hidden = true;
  }

  function collectRows() {
    return Array.prototype.map.call(els.body.querySelectorAll("tr"), function (tr) {
      var seqInput = tr.querySelector('[data-field="seq"]');
      var range = tr.querySelector('[data-field="range"]');
      var retention = tr.querySelector('[data-field="retention"]');
      var group = tr.getAttribute("data-group") === "1";
      return {
        id: tr.getAttribute("data-id"),
        seq: seqInput ? seqInput.value.trim() : "",
        range: range ? range.value.trim() : "",
        retention: group || !retention ? "" : retention.value,
        group: group
      };
    });
  }

  function save() {
    var list = collectRows();
    var invalid = null;
    var invalidField = "";
    list.forEach(function (row, index) {
      if (!invalidField && !row.seq) {
        invalid = index;
        invalidField = "seq";
      }
      if (!invalidField && !row.range) {
        invalid = index;
        invalidField = "range";
      }
    });
    if (invalid !== null) {
      var input = els.body.querySelectorAll("tr")[invalid].querySelector(
        '[data-field="' + invalidField + '"]'
      );
      if (input) {
        input.focus();
        input.classList.add("is-invalid");
        setTimeout(function () {
          input.classList.remove("is-invalid");
        }, 1600);
      }
      toast(
        "第 " +
          (invalid + 1) +
          " 行" +
          (invalidField === "seq" ? "序号" : "归档范围") +
          "不能为空。",
        "warning"
      );
      return;
    }
    store = list;
    clearDirty();
    toast("已保存归档范围与保管期限（仅当前会话）。", "success");
  }

  function csvCell(value) {
    return '"' + String(value == null ? "" : value).replace(/"/g, '""') + '"';
  }

  function exportCsv() {
    var list = collectRows();
    var lines = ["序号,归档范围,保管期限"];
    list.forEach(function (row) {
      lines.push(
        [csvCell(row.seq), csvCell(row.range), csvCell(row.retention)].join(",")
      );
    });
    var blob = new Blob(["\ufeff" + lines.join("\r\n")], {
      type: "text/csv;charset=utf-8"
    });
    var url = URL.createObjectURL(blob);
    var link = document.createElement("a");
    link.href = url;
    link.download = "归档范围与保管期限表.csv";
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(function () {
      URL.revokeObjectURL(url);
    }, 1000);
    toast("已导出 " + list.length + " 行，可用 Excel 打开。", "success");
  }

  function parseCsv(text) {
    var list = [];
    var row = [];
    var value = "";
    var quoted = false;
    var index = 0;
    while (index < text.length) {
      var char = text[index];
      if (quoted) {
        if (char === '"') {
          if (text[index + 1] === '"') {
            value += '"';
            index += 2;
            continue;
          }
          quoted = false;
          index += 1;
          continue;
        }
        value += char;
        index += 1;
        continue;
      }
      if (char === '"') {
        quoted = true;
        index += 1;
      } else if (char === ",") {
        row.push(value);
        value = "";
        index += 1;
      } else if (char === "\n") {
        row.push(value);
        list.push(row);
        row = [];
        value = "";
        index += 1;
      } else if (char === "\r") {
        index += 1;
      } else {
        value += char;
        index += 1;
      }
    }
    row.push(value);
    if (row.length > 1 || row[0] !== "") list.push(row);
    return list;
  }

  function normalizeRetention(value) {
    var text = String(value == null ? "" : value)
      .replace(/\s+/g, " ")
      .trim();
    if (text === "永久") return "永久";
    if (/^30\s*年$/.test(text)) return "30 年";
    if (/^10\s*年$/.test(text)) return "10 年";
    return "";
  }

  function normalizeRows(list) {
    var normalized = list
      .map(function (row, index) {
        var seq = String(row.seq == null ? "" : row.seq).trim();
        var range = String(row.range == null ? "" : row.range).trim();
        var retention = normalizeRetention(row.retention);
        var group =
          row.group === true ||
          (!!seq && /^\d+$/.test(seq) && !retention);
        return {
          id: "scope-import-" + Date.now() + "-" + index,
          seq: seq,
          range: range,
          retention: group ? "" : retention,
          group: group
        };
      })
      .filter(function (row) {
        return !!row.range;
      });
    normalized.forEach(function (row, index) {
      if (!row.seq) row.seq = String(index + 1);
    });
    return normalized;
  }

  function importJson(text) {
    var data = JSON.parse(text);
    if (!Array.isArray(data)) throw new Error("JSON 需要是行数组");
    return normalizeRows(
      data.map(function (row) {
        return {
          seq: row.seq || row["序号"],
          range: row.range || row["归档范围"],
          retention: row.retention || row["保管期限"],
          group: row.group
        };
      })
    );
  }

  function importCsv(text) {
    var table = parseCsv(text.replace(/^\ufeff/, ""));
    if (!table.length) throw new Error("CSV 内容为空");
    var header = table.shift().map(function (cell) {
      return String(cell).replace(/^\ufeff/, "").trim();
    });
    var seqIndex = header.indexOf("序号");
    var rangeIndex = header.indexOf("归档范围");
    var retentionIndex = header.indexOf("保管期限");
    if (rangeIndex < 0) {
      throw new Error("CSV 缺少“归档范围”列");
    }
    return normalizeRows(
      table.map(function (cells) {
        return {
          seq: seqIndex >= 0 ? cells[seqIndex] : "",
          range: cells[rangeIndex],
          retention: retentionIndex >= 0 ? cells[retentionIndex] : ""
        };
      })
    );
  }

  function applyImportFile(file) {
    if (!file) return;
    if (/\.(xlsx|xls)$/i.test(file.name)) {
      toast("原型暂不解析 Excel，请将三合一表另存为 CSV 后导入。", "warning");
      els.file.value = "";
      return;
    }
    var reader = new FileReader();
    reader.onload = function () {
      try {
        var text = String(reader.result || "");
        var list = /\.json$/i.test(file.name) ? importJson(text) : importCsv(text);
        if (!list.length) throw new Error("没有可导入的有效行");
        store = list;
        paintRows();
        clearDirty();
        toast("已导入 " + list.length + " 行并写入当前会话。", "success");
      } catch (error) {
        toast("导入失败：" + error.message, "error");
      } finally {
        els.file.value = "";
      }
    };
    reader.onerror = function () {
      toast("文件读取失败，请重试。", "error");
      els.file.value = "";
    };
    reader.readAsText(file, "UTF-8");
  }

  function shellHtml() {
    return (
      '<div class="scope-page">' +
      '<div class="page-head"><div><h1>归档范围</h1></div>' +
      '<div class="page-actions">' +
      '<button type="button" class="btn" id="scopeImport"><svg class="icon icon--sm" aria-hidden="true"><use href="#icon-upload"/></svg>导入三合一表</button>' +
      '<button type="button" class="btn" id="scopeExport"><svg class="icon icon--sm" aria-hidden="true"><use href="#icon-download"/></svg>导出三合一表</button>' +
      '<button type="button" class="btn btn--primary" id="scopeSave" disabled><svg class="icon icon--sm" aria-hidden="true"><use href="#icon-check"/></svg>保存修改</button>' +
      '<input type="file" id="scopeFile" class="visually-hidden" accept=".csv,.json,.xlsx,.xls" />' +
      "</div></div>" +
      '<section class="card scope-card" aria-labelledby="scopeTitle">' +
      '<div class="scope-toolbar"><div class="scope-heading">' +
      '<h2 id="scopeTitle">归档范围与保管期限表</h2>' +
      '<p id="scopeCount" class="scope-count"></p></div>' +
      '<span class="scope-edit-hint">单元格可直接编辑</span>' +
      '<span class="scope-dirty" id="scopeDirty" hidden>有未保存修改</span>' +
      "</div>" +
      '<p class="table-scroll-hint scope-scroll-hint">左右滑动查看完整表格</p>' +
      '<div class="table-wrap" id="scopeTableWrap">' +
      '<table class="data-table scope-table">' +
      '<caption class="visually-hidden">归档范围与保管期限表</caption>' +
      '<thead><tr><th scope="col">序号</th><th scope="col">归档范围</th><th scope="col">保管期限</th></tr></thead>' +
      '<tbody id="scopeBody"></tbody>' +
      "</table></div>" +
      '<div class="table-foot"><span id="scopeFoot"></span><span>直接编辑单元格后点击“保存修改”</span></div>' +
      "</section>" +
      '<p class="page-footnote">可导入 CSV / JSON（Excel 文件请先另存为 CSV）；导出文件可直接用 Excel 打开。单元格修改仅在当前会话生效。</p>' +
      "</div>"
    );
  }

  function bind(main) {
    els = {
      body: main.querySelector("#scopeBody"),
      count: main.querySelector("#scopeCount"),
      foot: main.querySelector("#scopeFoot"),
      dirty: main.querySelector("#scopeDirty"),
      save: main.querySelector("#scopeSave"),
      importBtn: main.querySelector("#scopeImport"),
      exportBtn: main.querySelector("#scopeExport"),
      file: main.querySelector("#scopeFile")
    };
    els.body.addEventListener("input", function (event) {
      if (event.target.matches('[data-field="range"]')) {
        autoGrow(event.target);
        event.target.classList.remove("is-invalid");
        markDirty();
      }
      if (event.target.matches('[data-field="seq"]')) {
        event.target.classList.remove("is-invalid");
        markDirty();
      }
    });
    els.body.addEventListener("change", function (event) {
      if (event.target.matches('[data-field="retention"]')) markDirty();
    });
    els.save.addEventListener("click", save);
    els.importBtn.addEventListener("click", function () {
      els.file.click();
    });
    els.file.addEventListener("change", function () {
      applyImportFile(els.file.files && els.file.files[0]);
    });
    els.exportBtn.addEventListener("click", exportCsv);
  }

  function render(main) {
    rows();
    main.innerHTML = shellHtml();
    bind(main);
    dirty = false;
    paintRows();
    clearDirty();
  }

  function destroy() {
    if (els.file) els.file.value = "";
  }

  WCR.scope = { render: render, destroy: destroy };
  global.WCR = WCR;
})(window);
