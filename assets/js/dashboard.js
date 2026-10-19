/* ==========================================================================
   工作台渲染（PROTOTYPE — 非生产实现）
   所有数字来自 assets/js/data.js 的示例数据，不请求任何接口。
   ========================================================================== */
(function (global) {
  "use strict";

  var WCR = global.WCR;
  var fmt = WCR.fmt;

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

  function statCard(stat) {
    return (
      '<article class="stat-card">' +
      '<div class="stat-card-head">' +
      '<span class="stat-label">' +
      esc(stat.label) +
      "</span>" +
      '<span class="stat-icon stat-icon--' +
      esc(stat.tint) +
      '"><svg class="icon icon--lg" aria-hidden="true"><use href="#icon-' +
      esc(stat.icon) +
      '"/></svg></span>' +
      "</div>" +
      '<p class="stat-value">' +
      fmt.number(stat.value) +
      '<span class="stat-unit">' +
      esc(stat.unit) +
      "</span></p>" +
      '<p class="stat-meta' +
      (stat.metaIcon ? " stat-meta--up" : "") +
      '">' +
      (stat.metaIcon
        ? '<svg class="icon icon--sm" aria-hidden="true"><use href="#icon-' +
          esc(stat.metaIcon) +
          '"/></svg>'
        : "") +
      esc(stat.meta) +
      "</p>" +
      "</article>"
    );
  }

  function barLegend(data) {
    return (
      '<div class="legend" id="barLegend">' +
      '<span class="legend-item"><span class="legend-dot" style="--legend-color:var(--chart-collect)"></span>采集' +
      '<span class="legend-value">' +
      fmt.number(data.stats[2].value) +
      " 条</span></span>" +
      '<span class="legend-item"><span class="legend-dot" style="--legend-color:var(--chart-archive)"></span>归档' +
      '<span class="legend-value">' +
      fmt.number(data.stats[3].value) +
      " 件</span></span>" +
      "</div>"
    );
  }

  function donutLegend(categories) {
    return (
      '<div class="legend legend--stack" id="donutLegend">' +
      categories
        .map(function (c) {
          return (
            '<span class="legend-row">' +
            '<span class="legend-dot" style="--legend-color:' +
            c.color +
            '"></span>' +
            '<span class="legend-name"><svg class="icon icon--sm" aria-hidden="true"><use href="#icon-' +
            esc(c.icon) +
            '"/></svg>' +
            esc(c.name) +
            "</span>" +
            '<span class="legend-value">' +
            fmt.number(c.value) +
            "</span>" +
            '<span class="legend-pct">' +
            fmt.pct(c.pct) +
            "</span>" +
            "</span>"
          );
        })
        .join("") +
      "</div>"
    );
  }

  function render(main, session) {
    var data = WCR.DASHBOARD[session.roleId] || WCR.DASHBOARD["archive-staff"];

    main.innerHTML =
      '<div class="page-head">' +
      "<div>" +
      "<h1>工作台</h1>" +
      "</div>" +
      '<div class="page-actions">' +
      '<button type="button" class="btn" id="dashRefresh">' +
      '<svg class="icon" aria-hidden="true"><use href="#icon-refresh"/></svg>' +
      "<span>刷新数据</span>" +
      "</button>" +
      "</div>" +
      "</div>" +
      '<section class="stat-grid" aria-label="关键指标">' +
      data.stats.map(statCard).join("") +
      "</section>" +
      '<section class="dash-grid" id="dashGrid" aria-label="采集与归档统计">' +
      '<div class="dash-widget dash-widget--wide">' +
      '<div class="card chart-card">' +
      '<div class="card-head">' +
      "<div><h2>采集与归档数量</h2>" +
      '<p id="barSub" aria-live="polite">按网站 · 单位：条 / 件</p>' +
      "</div>" +
      '<div class="segmented" role="tablist" aria-label="切换统计维度">' +
      '<button type="button" role="tab" id="tabSite" aria-selected="true" data-view="site">按网站</button>' +
      '<button type="button" role="tab" id="tabColumn" aria-selected="false" data-view="column" tabindex="-1">按栏目</button>' +
      "</div>" +
      "</div>" +
      barLegend(data) +
      '<div class="chart-scroll" id="barChart"></div>' +
      '<p class="chart-scroll-hint">左右滑动查看完整图表</p>' +
      '<p class="chart-note">按采集量降序排列；归档数为对应范围内已进入网页档案库的件数。</p>' +
      "</div>" +
      "</div>" +
      '<div class="dash-widget dash-widget--side">' +
      '<div class="card chart-card">' +
      '<div class="card-head"><div><h2>文件类别分布</h2>' +
      '<p>统计范围：' +
      esc(data.scopeLabel) +
      " · 单位：件</p></div></div>" +
      '<div class="chart-scroll" id="donutChart"></div>' +
      donutLegend(data.categories) +
      '<div class="chart-meta">' +
      "<p><span>网页文本</span>HTML 页面与 OFD 版式文件</p>" +
      "<p><span>照片 / 音频 / 视频</span>按单个文件计</p>" +
      '<p><span>统计口径</span>四类合计等于已归档件数</p>' +
      "</div>" +
      "</div>" +
      "</div>" +
      "</section>" +
      '<p class="page-footnote">统计口径：采集按“条”计，归档按“件”计；归档率 = 已归档件数 ÷ 采集网页条数（同一统计范围）。本页数据为原型示例数据，非真实采集结果。</p>';

    var barChart = document.getElementById("barChart");
    var barSub = document.getElementById("barSub");
    var donutChart = document.getElementById("donutChart");
    var grid = document.getElementById("dashGrid");
    var refreshBtn = document.getElementById("dashRefresh");

    function paintBars(view) {
      var rows = view === "column" ? data.byColumn.rows : data.bySite.rows;
      WCR.charts.bar(barChart, {
        rows: rows,
        ariaLabel:
          (view === "column" ? "按栏目" : "按网站") + "采集与归档数量",
        tableCaption:
          (view === "column" ? "按栏目" : "按网站") + "采集与归档数量"
      });
      barSub.textContent =
        (view === "column" ? "按栏目" : "按网站") +
        " · 图中 " +
        rows.length +
        (view === "column" ? " 个栏目" : " 个网站") +
        " · 单位：条 / 件";
    }

    paintBars("site");
    WCR.charts.donut(donutChart, data.categories);

    var tabs = [document.getElementById("tabSite"), document.getElementById("tabColumn")];

    function selectView(view, focusTab) {
      tabs.forEach(function (tab) {
        var selected = tab.getAttribute("data-view") === view;
        tab.setAttribute("aria-selected", String(selected));
        tab.setAttribute("tabindex", selected ? "0" : "-1");
        if (selected && focusTab) tab.focus();
      });
      paintBars(view);
    }

    tabs.forEach(function (tab) {
      tab.addEventListener("click", function () {
        selectView(tab.getAttribute("data-view"), false);
      });
      tab.addEventListener("keydown", function (event) {
        if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
        event.preventDefault();
        var next = tab.getAttribute("data-view") === "site" ? "column" : "site";
        selectView(next, true);
      });
    });

    refreshBtn.addEventListener("click", function () {
      if (refreshBtn.classList.contains("is-loading")) return;
      refreshBtn.classList.add("is-loading");
      refreshBtn.disabled = true;
      grid.classList.add("is-refreshing");
      window.setTimeout(function () {
        refreshBtn.classList.remove("is-loading");
        refreshBtn.disabled = false;
        grid.classList.remove("is-refreshing");
        if (WCR.ui) {
          WCR.ui.toast(
            "已刷新视图。原型为静态示例数据，数值不会变化，也未请求后端接口。",
            "info"
          );
        }
      }, 700);
    });
  }

  WCR.dashboard = { render: render };
})(window);
