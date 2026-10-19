/* ==========================================================================
   网页档案 — 主办单位 / 网站树 + 已归档数据列表（原型）
   数据只保存在当前页面内存，不请求后端。
   ========================================================================== */
(function (global) {
  "use strict";

  var WCR = global.WCR || {};
  var state = {
    siteId: null,
    expanded: {},
    selected: {},
    archiveStatus: "未归档",
    qualityStatus: "全部",
    filters: blankFilters(),
    reloading: false
  };
  var store = {};
  var updatedAt = {};
  var session = null;
  var els = {};
  var mainClickBound = false;
  var mainClickHandler = null;
  var docClickHandler = null;
  var keydownHandler = null;
  var reloadTimer = null;
  var qualityTimer = null;
  var statusPanel = null;
  var statusDraft = [];
  var ARCHIVE_STATES = ["未归档", "审核中", "已归档", "已退回"];
  var modal = { root: null, returnFocus: null, keyHandler: null };

  function blankFilters() {
    return { statuses: [], title: "", column: "", category: "", dateFrom: "", dateTo: "", keyword: "" };
  }

  function esc(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function pad(value) {
    return value < 10 ? "0" + value : String(value);
  }

  function fmtDateTime(value) {
    var date = value instanceof Date ? value : new Date(value);
    if (isNaN(date.getTime())) return "—";
    return (
      date.getFullYear() +
      "-" +
      pad(date.getMonth() + 1) +
      "-" +
      pad(date.getDate()) +
      " " +
      pad(date.getHours()) +
      ":" +
      pad(date.getMinutes())
    );
  }

  function toast(message, type) {
    if (WCR.ui && WCR.ui.toast) WCR.ui.toast(message, type);
  }

  function sites() {
    var all = (WCR.SITES && WCR.SITES.sites) || [];
    if (!session || session.roleId === "archive-staff") return all;
    return all.filter(function (site) {
      return site.org === session.org;
    });
  }

  function currentSite() {
    return sites().filter(function (site) {
      return site.id === state.siteId;
    })[0] || null;
  }

  function groups() {
    var result = [];
    sites().forEach(function (site) {
      var group = result.filter(function (item) {
        return item.org === site.org;
      })[0];
      if (!group) {
        group = { org: site.org, sites: [] };
        result.push(group);
      }
      group.sites.push(site);
    });
    return result;
  }

  function displayFields() {
    var source =
      WCR.metadata && WCR.metadata.getFields
        ? WCR.metadata.getFields("collection")
        : (WCR.META_SEED && WCR.META_SEED.collection) || [];
    var fields = source.slice();
    if (!fields.length) {
      fields = [
        { code: "site_name", name: "网站名称" },
        { code: "title", name: "标题" },
        { code: "publish_time", name: "发布时间" }
      ];
    }
    return fields;
  }

  function categories() {
    return WCR.CATEGORIES || [];
  }

  function categoryName(code) {
    var found = categories().filter(function (item) {
      return item.code === code;
    })[0];
    return found ? found.name : code;
  }

  function categoryFor(col, index) {
    if (index === 0) return "LMSY";
    var text = [col.channel, col.level1, col.level2].join(" ");
    if (/互动|咨询|信箱|访谈|投诉/.test(text)) return "HDJL";
    if (/服务|办事|办理|大厅|指南/.test(text)) return "BSFW";
    if (/解读|回应|访谈/.test(text)) return "JDHY";
    if (/首页|入口/.test(text)) return "LMSY";
    return "XXFB";
  }

  function retentionFor(code, index) {
    if (code === "LMSY" || code === "JDHY") return "永久";
    if (code === "XXFB") return index % 3 === 0 ? "定期 30 年" : "永久";
    return "定期 10 年";
  }

  function makeRecords(site, collector, collectTime) {
    var cols = (site.columns || []).filter(function (col) {
      return col.status !== "disabled";
    });
    if (!cols.length) {
      cols = [{ channel: "网站首页", level1: "首页", level2: "", url: "https://" + site.domain + "/" }];
    }
    var total = 18;
    var stamp = collectTime || "2026-10-19 08:12";
    var result = [];
    for (var i = 0; i < total; i += 1) {
      var home = i === 0;
      var col = home ? null : cols[(i - 1) % cols.length];
      var category = home ? "LMSY" : categoryFor(col, i);
      var topic = home ? "网站首页" : col.level2 || col.level1 || col.channel;
      var suffixes = ["信息发布", "工作动态", "通知公告", "政策解读", "办事指南", "数据发布", "互动回应", "专题报道", "便民提示"];
      var suffix = suffixes[i % suffixes.length];
      if (i >= suffixes.length) suffix += "（第" + (Math.floor(i / suffixes.length) + 1) + "期）";
      var title = home ? site.name + "首页" : topic + suffix;
      var column = home
        ? "网站首页"
        : col.level1 + (col.level2 ? " / " + col.level2 : "");
      var publish = new Date(2026, 9, 18 - i * 2);
      var publishTime =
        publish.getFullYear() +
        "-" +
        pad(publish.getMonth() + 1) +
        "-" +
        pad(publish.getDate()) +
        " " +
        pad(9 + (i % 8)) +
        ":" +
        pad((10 + i * 3) % 60);
      var baseUrl = home ? "https://" + site.domain + "/" : col.url || "https://" + site.domain + "/";
      result.push({
        id: site.id + "-r" + (i + 1),
        site_name: site.name,
        site_domain: site.domain,
        title: title,
        subtitle: home ? "" : "关于" + topic + "的公开信息",
        column: column,
        publish_time: publishTime,
        source: site.name,
        keywords: "政务;公开;" + topic,
        author: "网站编辑部",
        summary: topic + "相关信息已在" + site.name + "发布，采集归档为网页档案。",
        url: baseUrl + (home ? "" : "content_" + (i + 1) + ".html"),
        fonds_no: site.fonds,
        site_code: site.code,
        year: "2026",
        retention: retentionFor(category, i),
        category_code: category,
        sequence_no: category + "-2026-" + ("000" + (i + 1)).slice(-4),
        collect_time: stamp,
        collector: collector || "张明",
        status: i % 4 === 3 ? "无全文" : "全文",
        archive_status: "已归档",
        quality_status: "检测通过"
      });
    }
    return result;
  }

  function ensureStore() {
    sites().forEach(function (site) {
      if (!store[site.id]) {
        store[site.id] = makeRecords(site, session ? session.name : "张明");
      }
      if (!updatedAt[site.id]) updatedAt[site.id] = "2026-10-19 08:12";
    });
  }

  function records() {
    var site = currentSite();
    return site ? store[site.id] || [] : [];
  }

  function filteredRecords() {
    var f = state.filters;
    var list = records().filter(function (row) {
      if (state.qualityStatus !== "全部" && row.quality_status !== state.qualityStatus) return false;
      if (f.statuses.length && f.statuses.indexOf(row.status || "全文") < 0) return false;
      if (f.title && String(row.title).toLowerCase().indexOf(f.title.toLowerCase()) < 0) return false;
      if (f.column && String(row.column).toLowerCase().indexOf(f.column.toLowerCase()) < 0) return false;
      if (f.category && row.category_code !== f.category) return false;
      var date = String(row.publish_time).slice(0, 10);
      if (f.dateFrom && date < f.dateFrom) return false;
      if (f.dateTo && date > f.dateTo) return false;
      if (f.keyword) {
        var text = [row.title, row.column, row.keywords, row.summary, row.url, row.source].join(" ").toLowerCase();
        if (text.indexOf(f.keyword.toLowerCase()) < 0) return false;
      }
      return true;
    });
    return list.sort(function (a, b) {
      return String(b.publish_time).localeCompare(String(a.publish_time));
    });
  }

  function selectedRecords() {
    var map = state.selected;
    return records().filter(function (row) {
      return map[row.id];
    });
  }

  function selectedCount() {
    return selectedRecords().length;
  }

  function hasFilters() {
    var f = state.filters;
    return !!(f.statuses.length || f.title || f.column || f.category || f.dateFrom || f.dateTo || f.keyword);
  }

  function filterCount() {
    var count = 0;
    var f = state.filters;
    if (f.statuses.length) count += 1;
    ["title", "column", "category", "dateFrom", "dateTo", "keyword"].forEach(function (key) {
      if (f[key]) count += 1;
    });
    return count;
  }

  function closeMenus() {
    if (!els.main) return;
    Array.prototype.forEach.call(els.main.querySelectorAll("[data-menu-btn]"), function (button) {
      button.setAttribute("aria-expanded", "false");
      var panel = button.parentNode.querySelector("[data-menu-panel]");
      if (panel) panel.hidden = true;
    });
  }

  function toggleMenu(button) {
    closeStatusPanel(false);
    var panel = button.parentNode.querySelector("[data-menu-panel]");
    if (!panel) return;
    var open = button.getAttribute("aria-expanded") === "true";
    closeMenus();
    button.setAttribute("aria-expanded", String(!open));
    panel.hidden = open;
  }

  function statusChecks() {
    return Array.prototype.slice.call(statusPanel ? statusPanel.querySelectorAll("[data-status-value]") : []);
  }

  function syncStatusDraft() {
    statusChecks().forEach(function (input) {
      input.checked = statusDraft.indexOf(input.value) >= 0;
    });
  }

  function closeStatusPanel(restoreFocus) {
    if (!statusPanel) return;
    var anchor = statusPanel.getAttribute("data-anchor");
    statusPanel.parentNode.removeChild(statusPanel);
    statusPanel = null;
    var trigger = els.main && els.main.querySelector('[data-status-filter]');
    if (trigger) trigger.setAttribute("aria-expanded", "false");
    if (restoreFocus) {
      var byId = els.main && els.main.querySelector('[data-status-filter]');
      if (byId) byId.focus();
      else if (anchor && document.getElementById(anchor)) document.getElementById(anchor).focus();
    }
  }

  function positionStatusPanel(panel, trigger) {
    var rect = trigger.getBoundingClientRect();
    var width = 240;
    var height = panel.offsetHeight || 220;
    var left = Math.max(8, Math.min(rect.left, window.innerWidth - width - 8));
    var top = rect.bottom + 4;
    if (top + height > window.innerHeight - 8) {
      top = Math.max(8, rect.top - height - 4);
    }
    panel.style.left = left + "px";
    panel.style.top = top + "px";
  }

  function openStatusPanel(trigger) {
    if (statusPanel) {
      var current = statusPanel.getAttribute("data-anchor");
      closeStatusPanel(false);
      if (current === trigger.id) return;
    }
    statusDraft = state.filters.statuses.slice();
    var panel = document.createElement("div");
    panel.id = "collectStatusPanel";
    panel.className = "collect-status-pop";
    panel.setAttribute("role", "dialog");
    panel.setAttribute("aria-label", "档案状态筛选");
    panel.setAttribute("data-anchor", trigger.id);
    panel.innerHTML =
      '<div class="collect-status-head"><span>档案状态</span><svg class="icon icon--sm" aria-hidden="true"><use href="#icon-filter"/></svg></div>' +
      '<div class="collect-status-options">' +
      ["全文", "无全文"]
        .map(function (value) {
          return (
            '<label class="collect-status-option"><input type="checkbox" data-status-value value="' +
            value +
            '"' +
            (statusDraft.indexOf(value) >= 0 ? " checked" : "") +
            ' /><span>' +
            value +
            "</span></label>"
          );
        })
        .join("") +
      "</div>" +
      '<div class="collect-status-foot"><button type="button" class="btn btn--link" data-status-reset>重置</button>' +
      '<button type="button" class="btn btn--primary" data-status-apply>确定</button></div>';
    statusPanel = panel;
    document.body.appendChild(panel);
    positionStatusPanel(panel, trigger);
    trigger.setAttribute("aria-expanded", "true");
    panel.addEventListener("change", function (event) {
      var input = event.target.closest("[data-status-value]");
      if (!input) return;
      statusDraft = statusChecks()
        .filter(function (item) {
          return item.checked;
        })
        .map(function (item) {
          return item.value;
        });
    });
    panel.addEventListener("click", function (event) {
      var reset = event.target.closest("[data-status-reset]");
      if (reset) {
        statusDraft = [];
        syncStatusDraft();
        return;
      }
      var apply = event.target.closest("[data-status-apply]");
      if (!apply) return;
      state.filters.statuses = statusDraft.slice();
      state.selected = {};
      closeStatusPanel(false);
      paintTable();
      var next = els.main && els.main.querySelector('[data-status-filter]');
      if (next) next.focus();
      toast(
        statusDraft.length ? "已按档案状态筛选：" + statusDraft.join("、") : "已清除档案状态筛选。",
        "success"
      );
    });
    var first = panel.querySelector("[data-status-value]");
    if (first) first.focus();
  }

  function treeHtml() {
    var list = groups();
    return (
      '<div class="collect-tree-head"><div><h2>网站分类</h2><p>主办单位 → 网站</p></div>' +
      '<span class="collect-tree-total">' + sites().length + " 个网站</span></div>" +
      '<div class="collect-tree" role="tree" aria-label="主办单位与网站">' +
      list
        .map(function (group) {
          var expanded = !!state.expanded[group.org];
          return (
            '<div class="collect-org-block">' +
            '<button type="button" class="collect-org" data-org="' +
            esc(group.org) +
            '" aria-expanded="' +
            expanded +
            '" title="' +
            esc(group.org) +
            '">' +
            '<svg class="icon icon--sm collect-org-caret" aria-hidden="true"><use href="#icon-chevron-right"/></svg>' +
            '<svg class="icon icon--sm collect-org-icon" aria-hidden="true"><use href="#icon-folder"/></svg>' +
            '<span class="collect-org-name">' +
            esc(group.org) +
            "</span>" +
            '<span class="collect-org-count">' +
            group.sites.length +
            "</span></button>" +
            '<div class="collect-sites"' +
            (expanded ? "" : " hidden") +
            ">" +
            group.sites
              .map(function (site) {
                return (
                  '<button type="button" class="collect-site' +
                  (site.id === state.siteId ? " is-active" : "") +
                  '" data-site="' +
                  esc(site.id) +
                  '"' +
                  (site.id === state.siteId ? ' aria-current="true"' : "") +
                  ' title="' +
                  esc(site.name) +
                  '"><span class="collect-site-name">' +
                  esc(site.name) +
                  "</span></button>"
                );
              })
              .join("") +
            "</div></div>"
          );
        })
        .join("") +
      "</div>" +
      '<div class="collect-tree-foot"><span>共 ' +
      groups().length +
      " 个主办单位</span><span>" +
      sites().length +
      " 个网站</span></div>"
    );
  }

  function actionButtons() {
    return (
      '<div class="collect-actions">' +
      '<div class="collect-action-main">' +
      '<button type="button" class="btn" data-act="query"><svg class="icon icon--sm" aria-hidden="true"><use href="#icon-search"/></svg>综合查询</button>' +
      '<button type="button" class="btn" data-act="reset-query" id="archiveResetQuery">重置查询</button>' +
      '<button type="button" class="btn btn--primary" data-act="info-pack" id="archiveInfoPack"><svg class="icon icon--sm" aria-hidden="true"><use href="#icon-archive"/></svg>信息包导出</button>' +
      '<button type="button" class="btn" data-act="export"><svg class="icon icon--sm" aria-hidden="true"><use href="#icon-download"/></svg>数据导出</button>' +
      '<button type="button" class="btn" data-act="batch-download" id="archiveBatchDownload"><svg class="icon icon--sm" aria-hidden="true"><use href="#icon-download"/></svg>批量下载</button>' +
      '<div class="collect-menu-wrap" data-menu-wrap="more">' +
      '<button type="button" class="btn collect-menu-btn" data-menu-btn aria-expanded="false">更多操作<svg class="icon icon--sm" aria-hidden="true"><use href="#icon-chevron-down"/></svg></button>' +
      '<div class="collect-menu" data-menu-panel hidden>' +
      '<button type="button" data-act="logs">操作日志</button>' +
      '<button type="button" data-act="monitor">任务监控</button>' +
      '<button type="button" data-act="metadata" id="archiveMetaAction">元数据</button>' +
      "</div></div>" +
      "</div>" +
      '<span class="collect-selected" id="collectSelected">未选择</span>' +
      "</div>"
    );
  }

  function archiveFilterHtml() {
    return (
      '<div class="collect-archive-filter">' +
      '<div class="collect-quality-filter" role="group" aria-label="按四性检测状态筛选">' +
      '<label class="collect-archive-label" for="collectQualityStatus">四性检测状态：</label>' +
      '<div class="select-wrap collect-quality-select"><select class="select" id="collectQualityStatus">' +
      ["全部", "未检测", "检测通过", "检测不通过"]
        .map(function (value) {
          return (
            '<option value="' +
            esc(value) +
            '"' +
            (state.qualityStatus === value ? " selected" : "") +
            ">" +
            esc(value) +
            "</option>"
          );
        })
        .join("") +
      '</select><svg class="icon icon--sm" aria-hidden="true"><use href="#icon-chevron-down"/></svg></div></div>' +
      "</div>"
    );
  }

  function syncArchiveFilter() {
    if (!els.main) return;
    Array.prototype.forEach.call(els.main.querySelectorAll("[data-archive-status]"), function (button) {
      var active = button.getAttribute("data-archive-status") === state.archiveStatus;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", active ? "true" : "false");
    });
    var quality = els.main.querySelector("#collectQualityStatus");
    if (quality) quality.value = state.qualityStatus;
  }

  function setArchiveStatus(status) {
    if (ARCHIVE_STATES.indexOf(status) < 0 || state.archiveStatus === status) return;
    state.archiveStatus = status;
    state.selected = {};
    closeStatusPanel(false);
    closeMenus();
    paintTable();
  }

  function shellHtml() {
    var site = currentSite();
    return (
      '<div class="collect-page">' +
      '<h1 class="visually-hidden">网页档案</h1>' +
      '<div class="collect-layout">' +
      '<aside class="card collect-tree-card" id="collectTreeCard">' +
      treeHtml() +
      "</aside>" +
      '<section class="card collect-data-card" id="collectDataCard">' +
      '<div class="collect-data-head">' +
      '<div class="collect-site-heading"><h2 id="collectSiteTitle">' +
      esc(site ? site.name : "网页档案") +
      '</h2><p id="collectSiteMeta">' +
      esc(site ? site.domain + " · " + site.org + " · 全宗号 " + site.fonds : "") +
      "</p></div>" +
      '<div class="collect-head-meta"><span id="collectUpdated">数据截至 —</span><span class="collect-count-badge" id="collectTotal">共 0 条</span></div>' +
      "</div>" +
      actionButtons() +
      '<div class="collect-filter-bar" id="collectFilters" hidden></div>' +
      '<p class="table-scroll-hint collect-scroll-hint" id="collectScrollHint" hidden>左右滑动查看完整档案数据表</p>' +
      '<div id="collectTableWrap" class="collect-table-wrap"></div>' +
      archiveFilterHtml() +
      '<div class="collect-foot" id="collectFoot"></div>' +
      "</section></div></div>"
    );
  }

  function chipsHtml() {
    var f = state.filters;
    var defs = [
      { key: "statuses", label: "状态", value: f.statuses.join("、") },
      { key: "title", label: "标题", value: f.title },
      { key: "column", label: "栏目", value: f.column },
      { key: "category", label: "类别", value: f.category ? categoryName(f.category) : "" },
      { key: "dateFrom", label: "起始日期", value: f.dateFrom },
      { key: "dateTo", label: "截止日期", value: f.dateTo },
      { key: "keyword", label: "关键词", value: f.keyword }
    ].filter(function (item) {
      return item.value;
    });
    if (!defs.length) return "";
    return (
      '<span class="collect-filter-label">已应用 ' +
      defs.length +
      " 个条件</span>" +
      defs
        .map(function (item) {
          return (
            '<button type="button" class="collect-filter-chip" data-clear-filter="' +
            item.key +
            '" aria-label="清除' +
            item.label +
            '筛选">' +
            esc(item.label) +
            "：" +
            esc(item.value) +
            '<span aria-hidden="true">×</span></button>'
          );
        })
        .join("") +
      '<button type="button" class="btn btn--link collect-filter-reset" data-act="reset-query">全部清除</button>'
    );
  }

  function tableHtml() {
    var fields = displayFields();
    var list = filteredRecords();
    if (!list.length) {
      var sourceCount = records().length;
      var constrained = sourceCount > 0;
      return (
        '<div class="collect-empty"><div class="collect-empty-art"><svg class="icon" aria-hidden="true"><use href="#icon-inbox"/></svg></div>' +
        "<h3>" +
        (constrained ? "当前筛选条件下暂无数据" : "当前网站暂无档案数据") +
        "</h3><p>" +
        (constrained ? "可以调整四性检测状态或清空综合查询条件。" : "当前网站下还没有进入网页档案库的数据。") +
        "</p>" +
        (constrained
          ? '<button type="button" class="btn" data-act="reset-all-filters">清空筛选</button>'
          : "") +
        "</div>"
      );
    }
    return (
      '<table class="data-table collect-table" aria-label="网页档案数据列表">' +
      '<caption class="visually-hidden">' +
      esc(currentSite() ? currentSite().name : "") +
      " 网页档案数据</caption><thead><tr>" +
      '<th class="col-check"><input type="checkbox" class="row-check" data-select="all" aria-label="选择当前全部记录" /></th>' +
      '<th class="col-status"><button type="button" id="collectStatusFilter" class="collect-status-trigger' +
      (state.filters.statuses.length ? " is-active" : "") +
      '" data-status-filter aria-haspopup="dialog" aria-controls="collectStatusPanel" aria-expanded="' +
      (statusPanel ? "true" : "false") +
      '"><span>状态</span><svg class="icon icon--sm" aria-hidden="true"><use href="#icon-filter"/></svg></button></th>' +
      '<th class="col-index" scope="col">序号</th>' +
      '<th class="col-browse" scope="col">数据浏览</th>' +
      fields
        .map(function (field) {
          return '<th class="col-' + esc(field.code) + '" scope="col">' + esc(field.name) + "</th>";
        })
        .join("") +
      "</tr></thead><tbody>" +
      list
        .map(function (row, index) {
          return (
            '<tr data-record="' +
            esc(row.id) +
            '" class="' +
            (state.selected[row.id] ? "is-selected" : "") +
            '"><td class="col-check"><input type="checkbox" class="row-check" data-select="row" data-id="' +
            esc(row.id) +
            '"' +
            (state.selected[row.id] ? " checked" : "") +
            ' aria-label="选择记录 ' +
            esc(row.title) +
            '" /></td>' +
            '<td class="col-status"><span class="collect-status-pill ' +
            (row.status === "无全文" ? "is-none" : "is-full") +
            '">' +
            esc(row.status || "全文") +
            "</span></td>" +
            '<td class="col-index">' + (index + 1) + "</td>" +
            '<td class="col-browse"><button type="button" class="collect-browse" data-browse="' +
            esc(row.id) +
            '" aria-label="数据浏览：' +
            esc(row.title) +
            '" title="数据浏览"><svg class="icon" aria-hidden="true"><use href="#icon-list"/></svg></button></td>' +
            fields
              .map(function (field) {
                var value = row[field.code] == null ? "" : String(row[field.code]);
                var displayValue = field.code === "retention" ? value.replace("定期 ", "") : value;
                if (field.code === "sequence_no") displayValue = value.split("-").slice(1).join("-");
                return (
                  '<td class="col-' +
                  esc(field.code) +
                  '"><span class="collect-cell-text" title="' +
                  esc(value) +
                  '">' +
                  esc(displayValue || "—") +
                  "</span></td>"
                );
              })
              .join("") +
            "</tr>"
          );
        })
        .join("") +
      "</tbody></table></div>"
    );
  }

  function syncSelection() {
    if (!els.main) return;
    var list = filteredRecords();
    var all = els.main.querySelector('[data-select="all"]');
    var selected = selectedCount();
    if (all) {
      all.checked = list.length > 0 && selected === list.length;
      all.indeterminate = selected > 0 && selected < list.length;
      all.disabled = list.length === 0;
    }
    Array.prototype.forEach.call(els.main.querySelectorAll('[data-select="row"]'), function (input) {
      var id = input.getAttribute("data-id");
      input.checked = !!state.selected[id];
      var row = input.closest("tr");
      if (row) row.classList.toggle("is-selected", !!state.selected[id]);
    });
    var badge = els.main.querySelector("#collectSelected");
    if (badge) badge.textContent = selected ? "已选 " + selected + " 条" : "未选择";
    var foot = els.main.querySelector("#collectFoot");
    if (foot) {
      foot.innerHTML =
        '<span>共 <strong>' +
        list.length +
        "</strong> 条" +
        (hasFilters() ? "（筛选后）" : "") +
        "</span><span>" +
        (selected ? "已选 " + selected + " 条" : "未选择记录") +
        "</span>";
    }
    syncActions();
  }

  function setDisabled(id, disabled) {
    var button = els.main && els.main.querySelector("#" + id);
    if (button) button.disabled = disabled;
  }

  function syncActions() {
    if (!els.main) return;
    var list = filteredRecords();
    var count = selectedCount();
    setDisabled("archiveInfoPack", count === 0);
    setDisabled("archiveBatchDownload", count === 0);
    setDisabled("archiveMetaAction", count !== 1);
    var reset = els.main.querySelector("#archiveResetQuery");
    if (reset) reset.disabled = !hasFilters();
    var exp = els.main.querySelector('[data-act="export"]');
    if (exp) exp.disabled = list.length === 0;
  }

  function paintHead() {
    var site = currentSite();
    if (!site || !els.main) return;
    var title = els.main.querySelector("#collectSiteTitle");
    var meta = els.main.querySelector("#collectSiteMeta");
    var updated = els.main.querySelector("#collectUpdated");
    var total = els.main.querySelector("#collectTotal");
    if (title) title.textContent = site.name;
    if (meta) meta.textContent = site.domain + " · " + site.org + " · 全宗号 " + site.fonds;
    if (updated) updated.textContent = "数据截至 " + (updatedAt[site.id] || "—");
    if (total) total.textContent = "共 " + records().length + " 条";
  }

  function paintFilters() {
    if (!els.main) return;
    var bar = els.main.querySelector("#collectFilters");
    if (!bar) return;
    bar.innerHTML = chipsHtml();
    bar.hidden = !hasFilters();
  }

  function paintTable() {
    if (!els.main) return;
    var wrap = els.main.querySelector("#collectTableWrap");
    if (!wrap) return;
    wrap.innerHTML = tableHtml();
    var hint = els.main.querySelector("#collectScrollHint");
    if (hint) hint.hidden = wrap.scrollWidth <= wrap.clientWidth + 1;
    syncArchiveFilter();
    paintHead();
    paintFilters();
    syncSelection();
  }

  function paintTree() {
    if (!els.main) return;
    var card = els.main.querySelector("#collectTreeCard");
    if (card) card.innerHTML = treeHtml();
  }

  function renderPage() {
    closeModal(false);
    closeStatusPanel(false);
    closeMenus();
    var main = els.main;
    if (!main) return;
    ensureStore();
    main.innerHTML = shellHtml();
    paintTable();
    paintTree();
  }

  function selectSite(id) {
    var site = sites().filter(function (item) {
      return item.id === id;
    })[0];
    if (!site) return;
    state.siteId = id;
    state.expanded[site.org] = true;
    state.selected = {};
    state.archiveStatus = "未归档";
    state.qualityStatus = "全部";
    state.filters = blankFilters();
    renderPage();
  }

  function clearFilter(key) {
    if (key === "statuses") state.filters.statuses = [];
    else state.filters[key] = "";
    state.selected = {};
    renderPage();
  }

  function resetFilters() {
    if (!hasFilters()) return;
    state.filters = blankFilters();
    state.selected = {};
    renderPage();
    toast("已清除全部查询条件。", "success");
  }

  function reloadSite() {
    var site = currentSite();
    if (!site || state.reloading) return;
    state.reloading = true;
    syncActions();
    var button = els.main.querySelector("#collectReload");
    if (button) {
      button.disabled = true;
      button.innerHTML = '<svg class="icon icon--sm collect-spin" aria-hidden="true"><use href="#icon-refresh"/></svg>抓取中…';
    }
    reloadTimer = setTimeout(function () {
      reloadTimer = null;
      state.reloading = false;
      var now = new Date();
      store[site.id] = makeRecords(site, session ? session.name : "张明", fmtDateTime(now));
      updatedAt[site.id] = fmtDateTime(now);
      state.selected = {};
      renderPage();
      toast("已重新抓取“" + site.name + "”的网页数据（原型模拟，不请求后端）。", "success");
    }, 900);
  }

  function downloadText(filename, text, type) {
    try {
      var blob = new Blob([text], { type: type || "text/plain;charset=utf-8" });
      var url = URL.createObjectURL(blob);
      var link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(function () {
        URL.revokeObjectURL(url);
      }, 1000);
      return true;
    } catch (e) {
      toast("浏览器未允许自动下载，请稍后重试。", "warning");
      return false;
    }
  }

  function csvCell(value) {
    return '"' + String(value == null ? "" : value).replace(/"/g, '""') + '"';
  }

  function exportCsv() {
    var list = filteredRecords();
    if (!list.length) {
      toast("当前没有可导出的数据。", "warning");
      return;
    }
    var fields = displayFields();
    var lines = [["状态", "四性检测状态"].concat(fields.map(function (field) { return field.name; })).map(csvCell).join(",")];
    list.forEach(function (row) {
      lines.push([row.status || "全文", row.quality_status || "未检测"].concat(fields.map(function (field) { return row[field.code]; })).map(csvCell).join(","));
    });
    var site = currentSite();
    var name = "网页档案数据_" + (site ? site.name.replace(/[\\/:*?"<>|]/g, "_") : "网站") + "_20261019.csv";
    if (downloadText(name, "\ufeff" + lines.join("\r\n"), "text/csv;charset=utf-8")) {
      toast("已导出 " + list.length + " 条网页档案数据（CSV）。", "success");
    }
  }

  function exportInfoPack() {
    var list = selectedRecords();
    if (!list.length) {
      toast("请先选择需要导出信息包的记录。", "warning");
      return;
    }
    var site = currentSite();
    var fields = displayFields();
    var pack = {
      schema: "wcr-web-archive-sip/1.0",
      exportedAt: fmtDateTime(new Date()),
      site: site ? { name: site.name, domain: site.domain, org: site.org, fonds: site.fonds, code: site.code } : null,
      recordCount: list.length,
      records: list.map(function (row) {
        var data = {};
        fields.forEach(function (field) { data[field.code] = row[field.code] == null ? "" : row[field.code]; });
        return {
          id: row.id,
          fulltextStatus: row.status || "全文",
          archiveStatus: row.archive_status || "已归档",
          qualityStatus: row.quality_status || "检测通过",
          metadata: data,
          files: [{ name: (row.sequence_no || row.id) + ".ofd", type: "OFD" }]
        };
      })
    };
    var name = "网页档案信息包_" + (site ? site.name.replace(/[\/:*?"<>|]/g, "_") : "网站") + "_20261019.json";
    if (downloadText(name, JSON.stringify(pack, null, 2), "application/json;charset=utf-8")) {
      toast("已生成 " + list.length + " 条记录的信息包清单（JSON 原型，不含真实文件）。", "success");
    }
  }

  function batchDownload() {
    var list = selectedRecords();
    if (!list.length) {
      toast("请先选择需要批量下载的记录。", "warning");
      return;
    }
    var lines = ["网页批量下载清单", "网站：" + (currentSite() ? currentSite().name : ""), "导出时间：" + fmtDateTime(new Date()), ""];
    list.forEach(function (row, index) {
      lines.push(index + 1 + ". " + row.title);
      lines.push("   " + row.url);
    });
    if (downloadText("批量下载清单_" + new Date().getFullYear() + ".txt", lines.join("\n"))) {
      toast("已生成 " + list.length + " 条记录的下载清单；原型不连接文件存储，不会实际打包下载。", "info");
    }
  }

  function openModal(config) {
    closeModal(false);
    var root = document.createElement("div");
    root.className = "modal-layer collect-modal-layer";
    root.innerHTML =
      '<div class="modal-mask" data-collect-close></div>' +
      '<div class="modal collect-modal" role="dialog" aria-modal="true" aria-labelledby="collectModalTitle" tabindex="-1">' +
      '<div class="modal-head"><h2 id="collectModalTitle">' +
      esc(config.title) +
      '</h2><button type="button" class="icon-btn" data-collect-close aria-label="关闭"><svg class="icon" aria-hidden="true"><use href="#icon-x"/></svg></button></div>' +
      '<div class="modal-body" id="collectModalBody">' +
      config.body +
      '</div><div class="modal-foot" id="collectModalFoot">' +
      config.foot +
      "</div></div>";
    document.body.appendChild(root);
    document.body.classList.add("modal-open");
    modal.root = root;
    modal.returnFocus = config.returnFocus || document.activeElement;
    root.addEventListener("click", function (event) {
      if (event.target.closest("[data-collect-close]")) closeModal();
    });
    modal.keyHandler = function (event) {
      if (event.key === "Escape") {
        event.preventDefault();
        closeModal();
        return;
      }
      if (event.key === "Tab") {
        var dialog = root.querySelector(".collect-modal");
        var nodes = Array.prototype.slice.call(
          dialog.querySelectorAll('button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [href], [tabindex]:not([tabindex="-1"])')
        );
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
    };
    document.addEventListener("keydown", modal.keyHandler);
    if (config.onMount) config.onMount(root, root.querySelector("#collectModalBody"), root.querySelector("#collectModalFoot"));
    var focus = config.focus ? root.querySelector(config.focus) : root.querySelector(".modal-body input, .modal-body select, .modal-body textarea");
    (focus || root.querySelector(".collect-modal")).focus();
  }

  function closeModal(restoreFocus) {
    if (qualityTimer) {
      clearTimeout(qualityTimer);
      qualityTimer = null;
    }
    if (!modal.root) return;
    var root = modal.root;
    var returnFocus = modal.returnFocus;
    if (modal.keyHandler) document.removeEventListener("keydown", modal.keyHandler);
    root.parentNode.removeChild(root);
    document.body.classList.remove("modal-open");
    modal.root = null;
    modal.keyHandler = null;
    if (restoreFocus !== false && returnFocus && returnFocus.focus) {
      try {
        returnFocus.focus();
      } catch (e) {
        /* ignore */
      }
    }
  }

  function modalError(id, message) {
    var el = document.getElementById(id);
    if (!el) return;
    el.hidden = !message;
    el.textContent = message || "";
  }

  function fieldError(input, errorId, message) {
    if (input) input.classList.toggle("is-invalid", !!message);
    modalError(errorId, message);
  }

  function openQuery() {
    var f = state.filters;
    var catOptions = '<option value="">全部类别</option>' + categories().map(function (cat) {
      return '<option value="' + esc(cat.code) + '"' + (cat.code === f.category ? " selected" : "") + ">" + esc(cat.name + "（" + cat.code + "）") + "</option>";
    }).join("");
    openModal({
      title: "综合查询",
      body:
        '<p class="collect-modal-intro">按标题、栏目、类别、发布时间或关键词组合筛选当前网站的网页档案数据。</p>' +
        '<form id="collectQueryForm" class="collect-form" novalidate><div class="form-grid">' +
        '<div class="field"><label class="field-label" for="cqTitle">标题</label><input class="input input--lg" id="cqTitle" type="text" value="' + esc(f.title) + '" placeholder="标题包含…" /></div>' +
        '<div class="field"><label class="field-label" for="cqColumn">栏目</label><input class="input input--lg" id="cqColumn" type="text" value="' + esc(f.column) + '" placeholder="栏目包含…" /></div>' +
        '<div class="field"><label class="field-label" for="cqCategory">类别</label><div class="select-wrap"><select class="select" id="cqCategory">' + catOptions + '</select><svg class="icon icon--sm" aria-hidden="true"><use href="#icon-chevron-down"/></svg></div></div>' +
        '<div class="field"><label class="field-label" for="cqDateFrom">发布时间起</label><input class="input input--lg" id="cqDateFrom" type="date" value="' + esc(f.dateFrom) + '" /></div>' +
        '<div class="field"><label class="field-label" for="cqDateTo">发布时间止</label><input class="input input--lg" id="cqDateTo" type="date" value="' + esc(f.dateTo) + '" /></div>' +
        '<div class="field"><label class="field-label" for="cqKeyword">关键词</label><input class="input input--lg" id="cqKeyword" type="text" value="' + esc(f.keyword) + '" placeholder="标题、摘要、来源或网址…" /></div>' +
        "</div><p class=\"field-error\" id=\"cqError\" hidden></p></form>",
      foot:
        '<button type="button" class="btn" data-collect-close>取消</button>' +
        '<button type="button" class="btn btn--primary" id="collectQuerySubmit">查询</button>',
      focus: "#cqTitle",
      onMount: function (root, body, foot) {
        foot.querySelector("#collectQuerySubmit").addEventListener("click", function () {
          var start = body.querySelector("#cqDateFrom").value;
          var end = body.querySelector("#cqDateTo").value;
          if (start && end && start > end) {
            modalError("cqError", "起始日期不能晚于截止日期。");
            return;
          }
          state.filters = {
            statuses: (state.filters.statuses || []).slice(),
            title: body.querySelector("#cqTitle").value.trim(),
            column: body.querySelector("#cqColumn").value.trim(),
            category: body.querySelector("#cqCategory").value,
            dateFrom: start,
            dateTo: end,
            keyword: body.querySelector("#cqKeyword").value.trim()
          };
          state.selected = {};
          closeModal(false);
          renderPage();
          toast(hasFilters() ? "已应用综合查询条件。" : "已清空查询条件。", "success");
        });
      }
    });
  }

  function recordTimeInput(value) {
    return String(value || "").replace(" ", "T").slice(0, 16);
  }

  function editRecord() {
    var list = selectedRecords();
    if (list.length !== 1) {
      toast("请选择一条记录进行数据修改。", "warning");
      return;
    }
    var row = list[0];
    var retentionOptions = (WCR.META_SEED.collection.filter(function (f) { return f.code === "retention"; })[0] || {}).options || ["永久", "定期 30 年", "定期 10 年"];
    var catOptions = categories().map(function (cat) {
      return '<option value="' + esc(cat.code) + '"' + (cat.code === row.category_code ? " selected" : "") + ">" + esc(cat.name) + "</option>";
    }).join("");
    var retain = retentionOptions.map(function (value) {
      return '<option value="' + esc(value) + '"' + (value === row.retention ? " selected" : "") + ">" + esc(value) + "</option>";
    }).join("");
    openModal({
      title: "数据修改",
      body:
        '<p class="collect-modal-intro">修改后仅影响当前会话中的采集数据，不会写回源网站。</p>' +
        '<form id="collectEditForm" class="collect-form" novalidate><div class="form-grid">' +
        '<div class="field field--full"><label class="field-label" for="ceTitle">标题 <span class="required">*</span></label><input class="input input--lg" id="ceTitle" type="text" value="' + esc(row.title) + '" /><p class="field-error" id="ceTitleError" hidden></p></div>' +
        '<div class="field"><label class="field-label" for="ceColumn">栏目 <span class="required">*</span></label><input class="input input--lg" id="ceColumn" type="text" value="' + esc(row.column) + '" /><p class="field-error" id="ceColumnError" hidden></p></div>' +
        '<div class="field"><label class="field-label" for="cePublish">发布时间 <span class="required">*</span></label><input class="input input--lg" id="cePublish" type="datetime-local" value="' + esc(recordTimeInput(row.publish_time)) + '" /><p class="field-error" id="cePublishError" hidden></p></div>' +
        '<div class="field"><label class="field-label" for="ceSource">来源</label><input class="input input--lg" id="ceSource" type="text" value="' + esc(row.source) + '" /></div>' +
        '<div class="field"><label class="field-label" for="ceKeywords">关键词</label><input class="input input--lg" id="ceKeywords" type="text" value="' + esc(row.keywords) + '" /></div>' +
        '<div class="field"><label class="field-label" for="ceRetention">保管期限</label><div class="select-wrap"><select class="select" id="ceRetention">' + retain + '</select><svg class="icon icon--sm" aria-hidden="true"><use href="#icon-chevron-down"/></svg></div></div>' +
        '<div class="field"><label class="field-label" for="ceCategory">类别代码</label><div class="select-wrap"><select class="select" id="ceCategory">' + catOptions + '</select><svg class="icon icon--sm" aria-hidden="true"><use href="#icon-chevron-down"/></svg></div></div>' +
        '<div class="field"><label class="field-label" for="ceSequence">顺序号</label><input class="input input--lg" id="ceSequence" type="text" value="' + esc(row.sequence_no) + '" /></div>' +
        '<div class="field field--full"><label class="field-label" for="ceSummary">摘要</label><textarea class="input textarea" id="ceSummary" rows="3">' + esc(row.summary) + "</textarea></div>" +
        "</div></form>",
      foot:
        '<button type="button" class="btn" data-collect-close>取消</button>' +
        '<button type="button" class="btn btn--primary" id="collectEditSubmit">保存修改</button>',
      focus: "#ceTitle",
      onMount: function (root, body, foot) {
        foot.querySelector("#collectEditSubmit").addEventListener("click", function () {
          var title = body.querySelector("#ceTitle");
          var column = body.querySelector("#ceColumn");
          var publish = body.querySelector("#cePublish");
          var ok = true;
          fieldError(title, "ceTitleError", title.value.trim() ? "" : "请输入标题");
          fieldError(column, "ceColumnError", column.value.trim() ? "" : "请输入栏目");
          fieldError(publish, "cePublishError", publish.value ? "" : "请选择发布时间");
          if (!title.value.trim() || !column.value.trim() || !publish.value) return;
          row.title = title.value.trim();
          row.column = column.value.trim();
          row.publish_time = publish.value.replace("T", " ");
          row.source = body.querySelector("#ceSource").value.trim();
          row.keywords = body.querySelector("#ceKeywords").value.trim();
          row.retention = body.querySelector("#ceRetention").value;
          row.category_code = body.querySelector("#ceCategory").value;
          row.sequence_no = body.querySelector("#ceSequence").value.trim();
          row.summary = body.querySelector("#ceSummary").value.trim();
          closeModal(false);
          renderPage();
          toast("已保存记录修改。", "success");
        });
      }
    });
  }

  function openBatchEdit() {
    var list = selectedRecords();
    if (!list.length) {
      toast("请先选择需要批量修改的记录。", "warning");
      return;
    }
    var catOptions = '<option value="">不修改</option>' + categories().map(function (cat) {
      return '<option value="' + esc(cat.code) + '">' + esc(cat.name) + "</option>";
    }).join("");
    var retainOptions = '<option value="">不修改</option><option value="永久">永久</option><option value="定期 30 年">定期 30 年</option><option value="定期 10 年">定期 10 年</option>';
    openModal({
      title: "批量修改",
      body:
        '<p class="collect-modal-intro">将同时修改已选的 ' + list.length + " 条记录；留空的项目保持不变。</p>" +
        '<form class="collect-form" id="collectBatchForm"><div class="form-grid">' +
        '<div class="field field--full"><label class="field-label" for="cbColumn">栏目</label><input class="input input--lg" id="cbColumn" type="text" placeholder="留空则不修改栏目" /></div>' +
        '<div class="field"><label class="field-label" for="cbRetention">保管期限</label><div class="select-wrap"><select class="select" id="cbRetention">' + retainOptions + '</select><svg class="icon icon--sm" aria-hidden="true"><use href="#icon-chevron-down"/></svg></div></div>' +
        '<div class="field"><label class="field-label" for="cbCategory">类别代码</label><div class="select-wrap"><select class="select" id="cbCategory">' + catOptions + '</select><svg class="icon icon--sm" aria-hidden="true"><use href="#icon-chevron-down"/></svg></div></div>' +
        "</div></form>",
      foot:
        '<button type="button" class="btn" data-collect-close>取消</button>' +
        '<button type="button" class="btn btn--primary" id="collectBatchSubmit">应用到 ' + list.length + " 条</button>",
      onMount: function (root, body, foot) {
        foot.querySelector("#collectBatchSubmit").addEventListener("click", function () {
          var column = body.querySelector("#cbColumn").value.trim();
          var retention = body.querySelector("#cbRetention").value;
          var category = body.querySelector("#cbCategory").value;
          if (!column && !retention && !category) {
            toast("请至少设置一个要修改的字段。", "warning");
            return;
          }
          list.forEach(function (row) {
            if (column) row.column = column;
            if (retention) row.retention = retention;
            if (category) row.category_code = category;
          });
          closeModal(false);
          renderPage();
          toast("已批量修改 " + list.length + " 条记录。", "success");
        });
      }
    });
  }

  function openSimulated(title, intro, confirmText, doneText, extraBody) {
    openModal({
      title: title,
      body:
        '<p class="collect-modal-intro">' + intro + "</p>" +
        (extraBody || "") +
        '<div class="collect-warning"><svg class="icon" aria-hidden="true"><use href="#icon-info"/></svg><span>原型仅演示流程，不连接档案处理服务，也不会生成真实文件。</span></div>',
      foot:
        '<button type="button" class="btn" data-collect-close>取消</button>' +
        '<button type="button" class="btn btn--primary" id="collectSimSubmit">' + confirmText + "</button>",
      onMount: function (root, body, foot) {
        foot.querySelector("#collectSimSubmit").addEventListener("click", function () {
          closeModal(false);
          toast(doneText, "success");
        });
      }
    });
  }

  function combineCodes() {
    var list = selectedRecords();
    if (list.length < 2) {
      toast("请至少选择两条记录进行组合档号。", "warning");
      return;
    }
    openSimulated("组合档号", "将已选的 " + list.length + " 条记录组合为 1 件档案，并生成组合档号。", "组合档号", "已生成组合档号（原型模拟）。");
  }

  function splitCode() {
    var list = selectedRecords();
    if (list.length !== 1) {
      toast("请选择一条记录进行拆分档号。", "warning");
      return;
    }
    openModal({
      title: "拆分档号",
      body:
        '<p class="collect-modal-intro">将记录“' + esc(list[0].title) + "”的档号拆分为多个子档号。</p>" +
        '<div class="field"><label class="field-label" for="csParts">拆分份数</label><input class="input input--lg" id="csParts" type="number" min="2" max="20" value="2" /><p class="field-error" id="csError" hidden></p></div>' +
        '<div class="collect-warning"><svg class="icon" aria-hidden="true"><use href="#icon-info"/></svg><span>原型仅演示拆分流程，不生成真实档号。</span></div>',
      foot:
        '<button type="button" class="btn" data-collect-close>取消</button>' +
        '<button type="button" class="btn btn--primary" id="collectSplitSubmit">确认拆分</button>',
      onMount: function (root, body, foot) {
        foot.querySelector("#collectSplitSubmit").addEventListener("click", function () {
          var value = parseInt(body.querySelector("#csParts").value, 10);
          if (!value || value < 2 || value > 20) {
            fieldError(body.querySelector("#csParts"), "csError", "请输入 2–20 之间的拆分份数");
            return;
          }
          closeModal(false);
          toast("已生成 " + value + " 个子档号（原型模拟）。", "success");
        });
      }
    });
  }

  function convertFormat() {
    var list = selectedRecords();
    if (!list.length) {
      toast("请先选择需要格式转换的记录。", "warning");
      return;
    }
    openModal({
      title: "格式转换",
      body:
        '<p class="collect-modal-intro">将已选的 ' + list.length + " 条网页记录转换为版式文件。</p>" +
        '<div class="field"><label class="field-label" for="cfFormat">目标格式</label><div class="select-wrap"><select class="select" id="cfFormat"><option value="ofd">OFD</option><option value="pdf">PDF</option></select><svg class="icon icon--sm" aria-hidden="true"><use href="#icon-chevron-down"/></svg></div></div>' +
        '<div class="collect-warning"><svg class="icon" aria-hidden="true"><use href="#icon-info"/></svg><span>原型仅演示转换任务创建，不生成真实版式文件。</span></div>',
      foot:
        '<button type="button" class="btn" data-collect-close>取消</button>' +
        '<button type="button" class="btn btn--primary" id="collectConvertSubmit">开始转换</button>',
      onMount: function (root, body, foot) {
        foot.querySelector("#collectConvertSubmit").addEventListener("click", function () {
          var format = body.querySelector("#cfFormat").value.toUpperCase();
          closeModal(false);
          toast("已创建 " + list.length + " 条记录的 " + format + " 转换任务（原型模拟）。", "success");
        });
      }
    });
  }

  function reportRows() {
    var fields = displayFields().slice(0, 4);
    return filteredRecords()
      .map(function (row) {
        return "<tr>" + fields.map(function (field) { return "<td>" + esc(row[field.code]) + "</td>"; }).join("") + "</tr>";
      })
      .join("");
  }

  function printReport() {
    var site = currentSite();
    var list = filteredRecords();
    if (!list.length) {
      toast("当前没有可打印的数据。", "warning");
      return;
    }
    var fields = displayFields().slice(0, 5);
    var win = null;
    try {
      win = window.open("", "_blank", "width=980,height=720");
    } catch (e) {
      win = null;
    }
    if (!win) {
      toast("浏览器拦截了打印窗口，请允许弹出窗口后重试。", "warning");
      return;
    }
    win.document.write(
      '<!doctype html><html><head><meta charset="utf-8"><title>采集数据报表</title>' +
        '<style>body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI","PingFang SC",sans-serif;padding:28px;color:#222}h1{font-size:20px;margin:0 0 6px}p{font-size:12px;color:#666;margin:0 0 18px}table{width:100%;border-collapse:collapse;font-size:12px}th,td{border:1px solid #bbb;padding:6px 8px;text-align:left;vertical-align:top}th{background:#f3f3f3}</style></head><body>' +
        "<h1>采集数据报表</h1><p>" +
        esc(site ? site.name : "") +
        " · 共 " +
        list.length +
        " 条 · 生成时间 " +
        esc(fmtDateTime(new Date())) +
        "</p><table><thead><tr>" +
        fields.map(function (f) { return "<th>" + esc(f.name) + "</th>"; }).join("") +
        "</tr></thead><tbody>" +
        reportRows() +
        "</tbody></table></body></html>"
    );
    win.document.close();
    win.focus();
    setTimeout(function () {
      win.print();
    }, 250);
  }

  function onMainClick(event) {
    var menuButton = event.target.closest("[data-menu-btn]");
    if (menuButton) {
      event.preventDefault();
      toggleMenu(menuButton);
      return;
    }
    var statusButton = event.target.closest("[data-status-filter]");
    if (statusButton) {
      event.preventDefault();
      closeMenus();
      openStatusPanel(statusButton);
      return;
    }
    var archiveButton = event.target.closest("[data-archive-status]");
    if (archiveButton) {
      event.preventDefault();
      setArchiveStatus(archiveButton.getAttribute("data-archive-status"));
      return;
    }
    var browseButton = event.target.closest("[data-browse]");
    if (browseButton) {
      event.preventDefault();
      var record = records().filter(function (item) { return item.id === browseButton.getAttribute("data-browse"); })[0];
      if (record) openPreview(record);
      return;
    }
    var actionButton = event.target.closest("[data-act]");
    if (actionButton) {
      if (actionButton.disabled) return;
      event.preventDefault();
      closeMenus();
      handleAction(actionButton.getAttribute("data-act"));
      return;
    }
    var clear = event.target.closest("[data-clear-filter]");
    if (clear) {
      clearFilter(clear.getAttribute("data-clear-filter"));
      return;
    }
    var org = event.target.closest("[data-org]");
    if (org) {
      var orgName = org.getAttribute("data-org");
      state.expanded[orgName] = !state.expanded[orgName];
      paintTree();
      return;
    }
    var site = event.target.closest("[data-site]");
    if (site) {
      selectSite(site.getAttribute("data-site"));
      return;
    }
  }

  function onMainChange(event) {
    var quality = event.target.closest("#collectQualityStatus");
    if (quality) {
      state.qualityStatus = quality.value;
      state.selected = {};
      paintTable();
      return;
    }
    var check = event.target.closest("[data-select]");
    if (!check) return;
    var scope = check.getAttribute("data-select");
    if (scope === "all") {
      var list = filteredRecords();
      state.selected = {};
      if (check.checked) list.forEach(function (row) { state.selected[row.id] = true; });
    } else {
      var id = check.getAttribute("data-id");
      if (check.checked) state.selected[id] = true;
      else delete state.selected[id];
    }
    syncSelection();
  }

  function onDocumentClick(event) {
    if (statusPanel && !event.target.closest(".collect-status-pop") && !event.target.closest("[data-status-filter]")) {
      closeStatusPanel(false);
    }
    if (!event.target.closest(".collect-menu-wrap")) closeMenus();
  }

  function onKeydown(event) {
    if (event.key !== "Escape") return;
    if (statusPanel) {
      closeStatusPanel(true);
      return;
    }
    if (modal.root) {
      closeModal();
      return;
    }
    closeMenus();
  }

  function runQualityCheck() {
    var list = selectedRecords();
    if (!list.length) {
      toast("请先选择需要检测的记录。", "warning");
      return;
    }
    if (list.every(function (row) { return row.quality_status === "检测通过"; })) {
      toast("所选数据已全部通过四性检测。", "info");
      return;
    }
    list.forEach(function (row) { row.quality_status = "检测通过"; });
    if (state.qualityStatus !== "全部") state.qualityStatus = "全部";
    paintTable();
    toast("四性检测完成，所选 " + list.length + " 条数据已通过。", "success");
  }

  function returnToCollect() {
    var list = selectedRecords();
    if (!list.length) {
      toast("请先选择需要退回的记录。", "warning");
      return;
    }
    var site = currentSite();
    if (!site) return;
    var ids = {};
    list.forEach(function (row) { ids[row.id] = true; });
    store[site.id] = (store[site.id] || []).filter(function (row) { return !ids[row.id]; });
    state.selected = {};
    paintTable();
    toast("已将 " + list.length + " 条记录退回整理库（原型模拟）。", "success");
  }

  function acceptArchive() {
    var list = selectedRecords();
    if (!list.length) {
      toast("请先选择需要接收归档的记录。", "warning");
      return;
    }
    var failed = list.filter(function (row) { return row.quality_status !== "检测通过"; });
    if (failed.length) {
      toast("存在 " + failed.length + " 条未通过四性检测的数据，不能接收归档。", "warning");
      return;
    }
    var site = currentSite();
    if (!site) return;
    var ids = {};
    list.forEach(function (row) { ids[row.id] = true; });
    store[site.id] = (store[site.id] || []).filter(function (row) { return !ids[row.id]; });
    state.selected = {};
    paintTable();
    toast("已接收归档 " + list.length + " 条记录（原型模拟）。", "success");
  }

  function openLogs() {
    var site = currentSite();
    var rows = [
      ["2026-10-19 08:12", "张明", "信息包导出", "导出 3 条网页档案信息包清单"],
      ["2026-10-18 16:40", "张明", "数据导出", "导出当前网站 18 条档案数据"],
      ["2026-10-18 09:05", "系统", "归档入库", "同步 " + records().length + " 条网页档案记录"],
      ["2026-10-17 15:22", "李静", "批量下载", "下载 6 条网页清单"],
      ["2026-10-16 10:30", "张明", "元数据查看", "查看 1 条档案的完整元数据"]
    ];
    openModal({
      title: "操作日志",
      body:
        '<p class="collect-modal-intro">' + esc(site ? site.name : "") + "的近期操作记录（示例数据）。</p>" +
        '<div class="collect-log-list">' +
        rows.map(function (row) {
          return '<div class="collect-log-row"><span class="collect-log-time">' + esc(row[0]) + '</span><strong>' + esc(row[1]) + '</strong><span>' + esc(row[2]) + '</span><span class="collect-log-detail">' + esc(row[3]) + "</span></div>";
        }).join("") +
        "</div>",
      foot: '<button type="button" class="btn" data-collect-close>关闭</button>'
    });
  }

  function openMonitor() {
    var site = currentSite();
    openModal({
      title: "任务监控",
      body:
        '<p class="collect-modal-intro">' + esc(site ? site.name : "") + "相关任务运行状态（原型模拟）。</p>" +
        '<div class="collect-monitor"><div class="collect-monitor-row"><div><strong>网页采集</strong><span>已完成 · 08:12</span></div><div class="progress"><span style="width:100%"></span></div><em>100%</em></div>' +
        '<div class="collect-monitor-row"><div><strong>附件下载</strong><span>已完成 · 08:15</span></div><div class="progress"><span style="width:100%"></span></div><em>100%</em></div>' +
        '<div class="collect-monitor-row"><div><strong>格式转换</strong><span>已完成 · 08:21</span></div><div class="progress"><span style="width:100%"></span></div><em>100%</em></div>' +
        '<div class="collect-monitor-row"><div><strong>档案完整性检测</strong><span>已完成 · 08:31</span></div><div class="progress"><span style="width:100%"></span></div><em>100%</em></div></div>',
      foot: '<button type="button" class="btn" data-collect-close>关闭</button>'
    });
  }

  function recordModal(row, title, intro) {
    var fields = (WCR.META_SEED && WCR.META_SEED.collection) || [];
    openModal({
      title: title,
      body:
        '<p class="collect-modal-intro">' + intro + "</p>" +
        '<div class="collect-meta-table">' +
        '<div class="collect-meta-row"><span>全文状态</span><strong>' + esc(row.status || "全文") + "</strong></div>" +
        '<div class="collect-meta-row"><span>归档状态</span><strong>已归档</strong></div>' +
        '<div class="collect-meta-row"><span>四性检测</span><strong>' + esc(row.quality_status || "未检测") + "</strong></div>" +
        fields.map(function (field) {
          return '<div class="collect-meta-row"><span>' + esc(field.name) + "</span><strong>" + esc(row[field.code] == null || row[field.code] === "" ? "—" : row[field.code]) + "</strong></div>";
        }).join("") +
        "</div>",
      foot: '<button type="button" class="btn" data-collect-close>关闭</button>'
    });
  }

  function openPreview(row) {
    recordModal(row, "数据浏览", "记录“" + esc(row.title) + "”的网页档案数据与完整元数据。");
  }

  function openMetadata() {
    var list = selectedRecords();
    if (list.length !== 1) {
      toast("请选择一条记录查看元数据。", "warning");
      return;
    }
    recordModal(list[0], "元数据", "记录“" + esc(list[0].title) + "”的完整元数据。");
  }

  function openReportModal() {
    var list = filteredRecords();
    if (!list.length) {
      toast("当前没有可打印的数据。", "warning");
      return;
    }
    var fields = displayFields().slice(0, 4);
    openModal({
      title: "报表打印",
      body:
        '<p class="collect-modal-intro">当前筛选结果共 ' + list.length + " 条记录。打印窗口将生成当前网站的网页档案报表。</p>" +
        '<div class="collect-report-preview"><table><thead><tr>' +
        fields.map(function (field) { return "<th>" + esc(field.name) + "</th>"; }).join("") +
        "</tr></thead><tbody>" +
        list.slice(0, 8).map(function (row) {
          return "<tr>" + fields.map(function (field) { return "<td>" + esc(row[field.code]) + "</td>"; }).join("") + "</tr>";
        }).join("") +
        "</tbody></table>" +
        '<div class="collect-warning"><svg class="icon" aria-hidden="true"><use href="#icon-info"/></svg><span>原型将打开浏览器打印窗口，不连接报表服务。</span></div>',
      foot:
        '<button type="button" class="btn" data-collect-close>取消</button>' +
        '<button type="button" class="btn btn--primary" id="collectPrintSubmit">打开打印预览</button>',
      onMount: function (root, body, foot) {
        foot.querySelector("#collectPrintSubmit").addEventListener("click", function () {
          closeModal(false);
          printReport();
        });
      }
    });
  }

  function handleAction(action) {
    if (!action) return;
    if (action === "quality") runQualityCheck();
    else if (action === "return") returnToCollect();
    else if (action === "accept") acceptArchive();
    else if (action === "query") openQuery();
    else if (action === "reset-query") resetFilters();
    else if (action === "reset-all-filters") {
      resetFilters();
      state.qualityStatus = "全部";
      state.selected = {};
      renderPage();
    }
    else if (action === "info-pack") exportInfoPack();
    else if (action === "export") exportCsv();
    else if (action === "batch-download") batchDownload();
    else if (action === "logs") openLogs();
    else if (action === "monitor") openMonitor();
    else if (action === "metadata") openMetadata();
  }

  function render(main, currentSession) {
    destroy();
    session = currentSession;
    els.main = main;
    ensureStore();
    if (!state.siteId || !sites().some(function (site) { return site.id === state.siteId; })) {
      var first = sites()[0];
      state.siteId = first ? first.id : null;
      if (first) state.expanded[first.org] = true;
    }
    if (state.siteId) {
      var active = sites().filter(function (site) { return site.id === state.siteId; })[0];
      if (active) state.expanded[active.org] = true;
    }
    main.innerHTML = shellHtml();
    paintTable();
    paintTree();
    if (!mainClickBound) {
      mainClickHandler = onMainClick;
      main.addEventListener("click", mainClickHandler);
      main.addEventListener("change", onMainChange);
      mainClickBound = true;
    }
    docClickHandler = onDocumentClick;
    keydownHandler = onKeydown;
    document.addEventListener("click", docClickHandler);
    document.addEventListener("keydown", keydownHandler);
  }

  function destroy() {
    if (reloadTimer) {
      clearTimeout(reloadTimer);
      reloadTimer = null;
    }
    if (qualityTimer) {
      clearTimeout(qualityTimer);
      qualityTimer = null;
    }
    state.reloading = false;
    closeStatusPanel(false);
    if (modal.root) closeModal(false);
    if (els.main && mainClickBound && mainClickHandler) {
      els.main.removeEventListener("click", mainClickHandler);
      els.main.removeEventListener("change", onMainChange);
      mainClickBound = false;
      mainClickHandler = null;
    }
    if (docClickHandler) {
      document.removeEventListener("click", docClickHandler);
      docClickHandler = null;
    }
    if (keydownHandler) {
      document.removeEventListener("keydown", keydownHandler);
      keydownHandler = null;
    }
    closeMenus();
  }

  global.WCR = WCR;
  WCR.archiveLibrary = { render: render, destroy: destroy };
})(window);
