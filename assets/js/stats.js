/* ==========================================================================
   档案统计渲染（PROTOTYPE — 非生产实现）
   数据来自 assets/js/data.js 的工作台示例数据；不请求接口。
   ========================================================================== */
(function (global) {
  "use strict";

  var WCR = global.WCR;
  var fmt = WCR.fmt;

  var YEARS = ["2026", "2025", "2024", "2023"];
  var YEAR_WEIGHTS = [0.46, 0.31, 0.15, 0.08];

  var WEB_CATEGORIES = [
    { name: "网站及栏目首页", code: "LMSY", weight: 0.27 },
    { name: "信息发布类", code: "XXFB", weight: 0.34 },
    { name: "解读回应类", code: "JDHY", weight: 0.12 },
    { name: "办事服务类", code: "BSFW", weight: 0.11 },
    { name: "互动交流类", code: "HDJL", weight: 0.09 },
    { name: "其他类", code: "QT", weight: 0.07 }
  ];

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

  function allocate(total, weights) {
    var used = 0;
    var values = weights.map(function (weight, index) {
      if (index === weights.length - 1) return total - used;
      var value = Math.round(total * weight);
      used += value;
      return value;
    });
    return values;
  }

  function sumAt(rows, key) {
    return rows.reduce(function (sum, row) {
      return sum + row[key];
    }, 0);
  }

  function fileLegend(categories) {
    return (
      '<div class="legend legend--stack">' +
      categories.map(function (item) {
        return (
          '<span class="legend-row">' +
          '<span class="legend-dot" style="--legend-color:' + item.color + '"></span>' +
          '<span class="legend-name"><svg class="icon icon--sm" aria-hidden="true"><use href="#icon-' +
          esc(item.icon) + '"/></svg>' + esc(item.name) + "</span>" +
          '<span class="legend-value">' + fmt.number(item.value) + "</span>" +
          '<span class="legend-pct">' + fmt.pct(item.pct) + "</span>" +
          "</span>"
        );
      }).join("") +
      "</div>"
    );
  }

  function todoList(todos) {
    if (!todos || !todos.length) return "";
    return (
      '<div class="todo-list">' +
      todos.map(function (t) {
        return (
          '<div class="todo-item"><a href="' + esc(t.href) + '">' +
          '<svg class="icon icon--sm" aria-hidden="true"><use href="#icon-' +
          esc(t.icon) + '"/></svg>' +
          '<span class="todo-label">' + esc(t.label) + "</span>" +
          '<span class="todo-value">' + esc(t.value) + "</span>" +
          '<svg class="icon icon--sm" aria-hidden="true"><use href="#icon-chevron-right"/></svg>' +
          "</a></div>"
        );
      }).join("") +
      "</div>"
    );
  }

  function render(main, session) {
    var data = WCR.DASHBOARD[session.roleId] || WCR.DASHBOARD["archive-staff"];
    var totalArchived = sumAt(data.bySite.rows, "archived");
    var fileWeights = data.categories.map(function (item) {
      return item.value / totalArchived;
    });

    var sites = data.bySite.rows.map(function (row) {
      return {
        name: row.name,
        archived: row.archived,
        years: allocate(row.archived, YEAR_WEIGHTS),
        categories: allocate(row.archived, WEB_CATEGORIES.map(function (item) { return item.weight; })),
        files: allocate(row.archived, fileWeights)
      };
    });

    var state = { site: -1, dim: "site" };

    function selectedSite() {
      return state.site >= 0 ? sites[state.site] : null;
    }

    function scopeTotal() {
      var site = selectedSite();
      return site ? site.archived : totalArchived;
    }

    function aggregateYears() {
      return YEARS.map(function (_, index) {
        var site = selectedSite();
        return site ? site.years[index] : sumAt(sites.map(function (row) { return { value: row.years[index] }; }), "value");
      });
    }

    function aggregateCategories() {
      return WEB_CATEGORIES.map(function (_, index) {
        var site = selectedSite();
        return site ? site.categories[index] : sumAt(sites.map(function (row) { return { value: row.categories[index] }; }), "value");
      });
    }

    function scopeLabel() {
      var site = selectedSite();
      return site ? site.name : data.scopeLabel;
    }

    function dimensionRows() {
      var total = scopeTotal();
      if (state.dim === "year") {
        var years = aggregateYears();
        return YEARS.map(function (year, index) {
          return { name: year, count: years[index], total: total };
        });
      }
      if (state.dim === "category") {
        var cats = aggregateCategories();
        return WEB_CATEGORIES.map(function (cat, index) {
          return { name: cat.name, code: cat.code, count: cats[index], total: total };
        });
      }
      var list = selectedSite() ? [selectedSite()] : sites;
      return list.map(function (site) {
        return { name: site.name, count: site.archived, total: total };
      });
    }

    function tableHtml() {
      var rows = dimensionRows();
      var first = state.dim === "site" ? "网站名称" : state.dim === "year" ? "年度" : "类别";
      var head =
        "<tr><th scope=\"col\">" + first + "</th><th scope=\"col\">档案件数</th><th scope=\"col\">占比</th><th scope=\"col\">分布</th></tr>";
      var body = rows.map(function (row) {
        var pct = row.total ? row.count / row.total : 0;
        return (
          "<tr>" +
          "<td><span class=\"stats-name\">" + esc(row.name) + "</span>" +
          (row.code ? '<span class="stats-code">' + esc(row.code) + "</span>" : "") +
          "</td>" +
          "<td class=\"stats-count\">" + fmt.number(row.count) + "</td>" +
          "<td class=\"stats-pct\">" + fmt.pct(pct) + "</td>" +
          '<td class="stats-bar-cell"><span class="stats-bar"><span style="width:' +
          Math.round(pct * 100) + '%"></span></span></td>' +
          "</tr>"
        );
      }).join("");
      return { head: head, body: body, rows: rows };
    }

    function filesForScope() {
      var site = selectedSite();
      if (!site) {
        return data.categories.map(function (item) { return item; });
      }
      return data.categories.map(function (item, index) {
        return {
          name: item.name,
          icon: item.icon,
          color: item.color,
          value: site.files[index],
          pct: site.files[index] / site.archived
        };
      });
    }

    main.innerHTML =
      '<div class="stats-page">' +
      '<h1 class="visually-hidden">档案统计</h1>' +
      '<div class="stats-scope">' +
      '<div class="stats-scope-field">' +
      '<label class="stats-scope-label" for="statsSite">统计范围</label>' +
      '<div class="select-wrap stats-scope-select">' +
      '<select class="select" id="statsSite">' +
      '<option value="">' + esc(data.scopeLabel) + '</option>' +
      sites.map(function (site, index) {
        return '<option value="' + index + '">' + esc(site.name) + "</option>";
      }).join("") +
      "</select>" +
      '<svg class="icon icon--sm" aria-hidden="true"><use href="#icon-chevron-down"/></svg>' +
      "</div></div>" +
      '<p class="stats-updated">数据截至 <span>' + esc(data.updatedAt) + "</span></p>" +
      "</div>" +
      '<section class="stats-grid" aria-label="网页档案统计">' +
      '<div class="dash-widget dash-widget--wide">' +
      '<div class="card stats-card stats-card--table">' +
      '<div class="card-head"><div><h2>网页档案件数统计</h2>' +
      '<p id="statsDimSub">按网站名称 · 全部网站</p></div>' +
      '<div class="segmented" role="tablist" aria-label="切换统计维度" id="statsDims">' +
      '<button type="button" role="tab" data-dim="site" aria-selected="true">按网站</button>' +
      '<button type="button" role="tab" data-dim="year" aria-selected="false" tabindex="-1">按年度</button>' +
      '<button type="button" role="tab" data-dim="category" aria-selected="false" tabindex="-1">按类别</button>' +
      "</div></div>" +
      '<div class="table-wrap">' +
      '<table class="data-table stats-table" aria-label="网页档案件数统计">' +
      '<thead id="statsHead">' + tableHtml().head + "</thead>" +
      '<tbody id="statsBody">' + tableHtml().body + "</tbody>" +
      "</table></div>" +
      '<div class="stats-foot"><span id="statsFoot"></span><span>单位：件</span></div>' +
      "</div></div>" +
      '<div class="dash-widget dash-widget--side">' +
      '<div class="card stats-card file-stats-card">' +
      '<div class="card-head"><div><h2>文件类别数量</h2><p>按已归档文件统计 · 单位：件</p></div></div>' +
      '<div class="chart-scroll" id="statsDonut"></div>' +
      '<div id="statsFileLegend">' + fileLegend(filesForScope()) + "</div>" +
      '<div class="stats-foot"><span id="statsFileFoot"></span><span>四类合计等于档案件数</span></div>' +
      "</div></div>" +
      "</section>" +
      '<section class="stats-grid stats-grid--secondary" aria-label="采集与归档趋势及概览">' +
      '<div class="dash-widget dash-widget--wide">' +
      '<div class="card chart-card">' +
      '<div class="card-head"><div><h2>采集与归档趋势</h2><p>近 12 个月 · ' +
      esc(data.scopeLabel) + " · 单位：条 / 件</p></div></div>" +
      '<div class="legend">' +
      '<span class="legend-item"><span class="legend-dot" style="--legend-color:var(--chart-collect)"></span>采集（条）</span>' +
      '<span class="legend-item"><span class="legend-dot" style="--legend-color:var(--chart-archive)"></span>归档（件）</span>' +
      "</div>" +
      '<div class="chart-scroll" id="statsTrend"></div>' +
      '<p class="chart-scroll-hint">左右滑动查看完整图表</p>' +
      '<p class="chart-note">按采集时间统计当月新增数量；2026 年 10 月为截至 18 日的部分月份。</p>' +
      "</div></div>" +
      '<div class="dash-widget dash-widget--side">' +
      '<div class="card chart-card overview-card">' +
      '<div class="card-head"><div><h2>归档概览</h2><p>本年度 · ' +
      esc(data.scopeLabel) + "</p></div></div>" +
      '<div class="metric"><div class="metric-head"><span>本年归档完成度</span><strong>' +
      data.overview.archiveRate + "%</strong></div>" +
      '<div class="progress" role="progressbar" aria-label="本年归档完成度" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' +
      data.overview.archiveRate + '"><span style="width:' + data.overview.archiveRate + '%"></span></div>' +
      '<p class="metric-sub">' + esc(data.overview.archiveRateSub) + "</p></div>" +
      '<div class="metric"><div class="metric-head"><span>四性检测通过率</span><strong>' +
      data.overview.qualityRate + "%</strong></div>" +
      '<div class="progress progress--success" role="progressbar" aria-label="四性检测通过率" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' +
      data.overview.qualityRate + '"><span style="width:' + data.overview.qualityRate + '%"></span></div>' +
      '<p class="metric-sub">' + esc(data.overview.qualityRateSub) + "</p></div>" +
      todoList(data.overview.todos) +
      "</div></div>" +
      "</section>" +
      '<p class="page-footnote">件数统计与文件类别统计按上方统计范围计算；采集与归档趋势、归档概览按当前角色的全部统计范围展示，不随网站筛选变化。归档按“件”计，本页数据为原型示例数据。</p>' +
      "</div>";

    var select = document.getElementById("statsSite");
    var dimSub = document.getElementById("statsDimSub");
    var head = document.getElementById("statsHead");
    var body = document.getElementById("statsBody");
    var foot = document.getElementById("statsFoot");
    var fileFoot = document.getElementById("statsFileFoot");
    var dims = document.getElementById("statsDims");

    function scopeName() {
      return state.site >= 0 ? sites[state.site].name : data.scopeLabel;
    }

    function paintTable() {
      var result = tableHtml();
      head.innerHTML = result.head;
      body.innerHTML = result.body;
      var label = state.dim === "site" ? "按网站名称" : state.dim === "year" ? "按年度" : "按类别";
      dimSub.textContent = label + " · " + scopeName() + "（" + result.rows.length + " 项）";
      foot.textContent = "共 " + fmt.number(scopeTotal()) + " 件";
    }

    function paintFiles() {
      var files = filesForScope();
      WCR.charts.donut(document.getElementById("statsDonut"), files);
      document.getElementById("statsFileLegend").innerHTML = fileLegend(files);
      fileFoot.textContent = "合计 " + fmt.number(scopeTotal()) + " 件";
    }

    function paintAll() {
      paintTable();
      paintFiles();
    }

    function setDim(dim, focus) {
      state.dim = dim;
      Array.prototype.forEach.call(dims.querySelectorAll("[data-dim]"), function (button) {
        var active = button.getAttribute("data-dim") === dim;
        button.setAttribute("aria-selected", String(active));
        button.setAttribute("tabindex", active ? "0" : "-1");
        if (active && focus) button.focus();
      });
      paintTable();
    }

    dims.addEventListener("click", function (event) {
      var button = event.target.closest("button[data-dim]");
      if (button) setDim(button.getAttribute("data-dim"), false);
    });

    dims.addEventListener("keydown", function (event) {
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
      var order = ["site", "year", "category"];
      var index = order.indexOf(state.dim);
      index = event.key === "ArrowRight" ? (index + 1) % order.length : (index + order.length - 1) % order.length;
      setDim(order[index], true);
    });

    select.addEventListener("change", function () {
      state.site = select.value === "" ? -1 : Number(select.value);
      paintAll();
    });

    paintAll();
    WCR.charts.trend(document.getElementById("statsTrend"), data.trend);
  }

  function destroy() {}

  WCR.stats = { render: render, destroy: destroy };
})(window);
