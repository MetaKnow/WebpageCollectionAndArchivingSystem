/* ==========================================================================
   手写 SVG 图表（PROTOTYPE — 非生产实现）
   不引入图表库：柱状图 / 环形图 / 折线图，颜色全部读取 CSS 变量。
   每张图同时输出一张视觉隐藏的数据表，保证读屏可获取完整数值。
   ========================================================================== */
(function (global) {
  "use strict";

  var fmt = global.WCR.fmt;

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

  function tip(title, rows) {
    return esc(JSON.stringify({ title: title, rows: rows }));
  }

  function empty(message) {
    return (
      '<div class="chart-empty">' +
      '<svg class="icon icon--lg" aria-hidden="true"><use href="#icon-info"/></svg>' +
      "<span>" +
      esc(message || "暂无数据") +
      "</span>" +
      "</div>"
    );
  }

  function niceMax(value) {
    if (!value || value <= 0) return 4;
    var candidates = [1, 1.2, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10];
    var rough = value / 4;
    var mag = Math.pow(10, Math.floor(Math.log(rough) / Math.LN10));
    for (var i = 0; i < candidates.length; i += 1) {
      if (candidates[i] * mag >= rough) return candidates[i] * mag * 4;
    }
    return 10 * mag * 4;
  }

  function axisFormatter(max) {
    if (max >= 10000) {
      return function (v) {
        return v === 0 ? "0" : String(Math.round((v / 10000) * 10) / 10) + "万";
      };
    }
    return function (v) {
      return v === 0 ? "0" : fmt.number(v);
    };
  }

  function hiddenTable(caption, head, rows) {
    var html =
      '<table class="visually-hidden"><caption>' +
      esc(caption) +
      "</caption><thead><tr>";
    head.forEach(function (h) {
      html += "<th scope=\"col\">" + esc(h) + "</th>";
    });
    html += "</tr></thead><tbody>";
    rows.forEach(function (row) {
      html += "<tr>";
      row.forEach(function (cell, i) {
        html +=
          i === 0
            ? "<th scope=\"row\">" + esc(cell) + "</th>"
            : "<td>" + esc(cell) + "</td>";
      });
      html += "</tr>";
    });
    return html + "</tbody></table>";
  }

  /* ---------- 横向分组柱状图 ---------- */
  function bar(container, data) {
    if (!container) return;
    var rows = data.rows || [];
    if (!rows.length) {
      container.innerHTML = empty("暂无采集与归档数据");
      return;
    }

    var W = 820;
    var labelW = 152;
    var valueW = 64;
    var padR = 20;
    var top = 28;
    var rowHeight = 44;
    var bottom = 36;
    var H = top + rows.length * rowHeight + bottom;
    var axisW = W - labelW - valueW - padR;

    var maxValue = 0;
    rows.forEach(function (r) {
      maxValue = Math.max(maxValue, r.collected, r.archived);
    });
    var max = niceMax(maxValue);
    var tick = axisFormatter(max);

    var svg =
      '<svg class="chart-svg" viewBox="0 0 ' +
      W +
      " " +
      H +
      '" role="list" aria-label="' +
      esc(data.ariaLabel || "采集与归档数量") +
      '">';

    for (var g = 0; g <= 4; g += 1) {
      var gx = labelW + (axisW / 4) * g;
      svg +=
        '<line x1="' +
        gx +
        '" y1="' +
        (top - 8) +
        '" x2="' +
        gx +
        '" y2="' +
        (top + rows.length * rowHeight) +
        '" stroke="var(--chart-grid)" stroke-width="1"/>';
      svg +=
        '<text x="' +
        gx +
        '" y="' +
        (top + rows.length * rowHeight + 20) +
        '" text-anchor="middle" font-size="11" fill="var(--chart-axis-text)">' +
        tick((max / 4) * g) +
        "</text>";
    }

    rows.forEach(function (row, i) {
      var y = top + i * rowHeight;
      var center = y + rowHeight / 2;
      var collectW = (row.collected / max) * axisW;
      var archiveW = (row.archived / max) * axisW;
      var label = esc(row.name);
      var tooltip = tip(label, [
        { label: "采集", value: fmt.number(row.collected) + " 条" },
        { label: "归档", value: fmt.number(row.archived) + " 件" }
      ]);

      svg +=
        '<g class="bar-row" tabindex="0" role="listitem" aria-label="' +
        label +
        "：采集 " +
        fmt.number(row.collected) +
        " 条，归档 " +
        fmt.number(row.archived) +
        ' 件" data-tip="' +
        tooltip +
        '">';
      svg +=
        '<rect class="bar-hit" x="2" y="' +
        (y + 3) +
        '" width="' +
        (W - 4) +
        '" height="' +
        (rowHeight - 6) +
        '" rx="6" fill="transparent"/>';
      svg +=
        '<text x="' +
        (labelW - 12) +
        '" y="' +
        (center + 4) +
        '" text-anchor="end" font-size="13" fill="var(--color-text-secondary)">' +
        label +
        "</text>";
      svg +=
        '<rect class="bar" x="' +
        labelW +
        '" y="' +
        (center - 12) +
        '" width="' +
        Math.max(collectW, 2) +
        '" height="10" rx="3" fill="var(--chart-collect)"/>';
      svg +=
        '<rect class="bar" x="' +
        labelW +
        '" y="' +
        (center + 2) +
        '" width="' +
        Math.max(archiveW, 2) +
        '" height="10" rx="3" fill="var(--chart-archive)"/>';
      svg +=
        '<text x="' +
        (labelW + collectW + 6) +
        '" y="' +
        (center - 4) +
        '" font-size="11" fill="var(--color-text-tertiary)">' +
        fmt.wan(row.collected) +
        "</text>";
      svg +=
        '<text x="' +
        (labelW + archiveW + 6) +
        '" y="' +
        (center + 10) +
        '" font-size="11" fill="var(--color-text-tertiary)">' +
        fmt.wan(row.archived) +
        "</text>";
      svg += "</g>";
    });

    svg += "</svg>";
    svg += hiddenTable(
      data.tableCaption || "采集与归档数量",
      ["名称", "采集（条）", "归档（件）"],
      rows.map(function (row) {
        return [row.name, fmt.number(row.collected), fmt.number(row.archived)];
      })
    );
    container.innerHTML = svg;
  }

  /* ---------- 环形图 ---------- */
  function donut(container, categories) {
    if (!container) return;
    var total = categories.reduce(function (sum, c) {
      return sum + c.value;
    }, 0);
    if (!total) {
      container.innerHTML = empty("暂无归档文件类别数据");
      return;
    }

    var size = 208;
    var cx = size / 2;
    var cy = size / 2;
    var r = 74;
    var stroke = 20;
    var C = 2 * Math.PI * r;
    var offset = 0;

    container.classList.add("chart-donut");
    var svg =
      '<svg class="donut-svg" viewBox="0 0 ' +
      size +
      " " +
      size +
      '" role="img" aria-label="归档文件类别分布，共 ' +
      fmt.number(total) +
      ' 件">';
    svg +=
      '<circle cx="' +
      cx +
      '" cy="' +
      cy +
      '" r="' +
      r +
      '" fill="none" stroke="var(--color-split)" stroke-width="' +
      stroke +
      '"/>';
    svg += '<g transform="rotate(-90 ' + cx + " " + cy + ')">';

    categories.forEach(function (c) {
      var len = Math.max((c.value / total) * C - 3, 0);
      var segmentTip = tip(c.name, [
        { label: "件数", value: fmt.number(c.value) + " 件" },
        { label: "占比", value: fmt.pct(c.pct) }
      ]);
      svg +=
        '<circle class="donut-segment" cx="' +
        cx +
        '" cy="' +
        cy +
        '" r="' +
        r +
        '" fill="none" stroke="' +
        c.color +
        '" stroke-width="' +
        stroke +
        '" stroke-dasharray="' +
        len +
        " " +
        (C - len) +
        '" stroke-dashoffset="' +
        -offset +
        '" data-tip="' +
        segmentTip +
        '"/>';
      offset += (c.value / total) * C;
    });

    svg += "</g>";
    svg +=
      '<text class="donut-total" x="' +
      cx +
      '" y="' +
      (cy + 2) +
      '" text-anchor="middle">' +
      fmt.number(total) +
      "</text>";
    svg +=
      '<text class="donut-caption" x="' +
      cx +
      '" y="' +
      (cy + 22) +
      '" text-anchor="middle">已归档 · 件</text>';
    svg += "</svg>";
    svg += hiddenTable(
      "归档文件类别分布",
      ["类别", "件数", "占比"],
      categories.map(function (c) {
        return [c.name, fmt.number(c.value), fmt.pct(c.pct)];
      })
    );
    container.innerHTML = svg;
  }

  /* ---------- 折线图 ---------- */
  function trend(container, data) {
    if (!container) return;
    var months = data.months || [];
    if (!months.length) {
      container.innerHTML = empty("暂无趋势数据");
      return;
    }

    var W = 820;
    var H = 300;
    var padL = 56;
    var padR = 20;
    var padT = 20;
    var padB = 38;
    var plotW = W - padL - padR;
    var plotH = H - padT - padB;
    var maxValue = Math.max.apply(null, data.collected.concat(data.archived));
    var max = niceMax(maxValue);
    var tick = axisFormatter(max);
    var stepX = plotW / (months.length - 1);

    function xAt(i) {
      return padL + stepX * i;
    }
    function yAt(v) {
      return padT + plotH - (v / max) * plotH;
    }
    function linePath(values) {
      return values
        .map(function (v, i) {
          return (i === 0 ? "M" : "L") + xAt(i) + " " + yAt(v);
        })
        .join(" ");
    }

    var svg =
      '<svg class="chart-svg" viewBox="0 0 ' +
      W +
      " " +
      H +
      '" role="list" aria-label="近 12 个月采集与归档趋势">';
    svg +=
      '<defs><linearGradient id="trendAreaFill" x1="0" y1="0" x2="0" y2="1">' +
      '<stop offset="0" style="stop-color:var(--chart-collect);stop-opacity:.22"/>' +
      '<stop offset="1" style="stop-color:var(--chart-collect);stop-opacity:0"/>' +
      "</linearGradient></defs>";

    for (var g = 0; g <= 4; g += 1) {
      var gy = padT + (plotH / 4) * (4 - g);
      svg +=
        '<line x1="' +
        padL +
        '" y1="' +
        gy +
        '" x2="' +
        (W - padR) +
        '" y2="' +
        gy +
        '" stroke="var(--chart-grid)" stroke-width="1"/>';
      svg +=
        '<text x="' +
        (padL - 10) +
        '" y="' +
        (gy + 4) +
        '" text-anchor="end" font-size="11" fill="var(--chart-axis-text)">' +
        tick((max / 4) * g) +
        "</text>";
    }

    var area =
      "M" +
      xAt(0) +
      " " +
      yAt(data.collected[0]) +
      " " +
      data.collected
        .slice(1)
        .map(function (v, i) {
          return "L" + xAt(i + 1) + " " + yAt(v);
        })
        .join(" ") +
      " L" +
      xAt(months.length - 1) +
      " " +
      (padT + plotH) +
      " L" +
      xAt(0) +
      " " +
      (padT + plotH) +
      " Z";

    svg +=
      '<path d="' +
      area +
      '" fill="url(#trendAreaFill)" stroke="none"/>';
    svg +=
      '<path d="' +
      linePath(data.collected) +
      '" fill="none" stroke="var(--chart-collect)" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>';
    svg +=
      '<path d="' +
      linePath(data.archived) +
      '" fill="none" stroke="var(--chart-archive)" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>';

    months.forEach(function (m, i) {
      var x = xAt(i);
      svg +=
        '<circle cx="' +
        x +
        '" cy="' +
        yAt(data.collected[i]) +
        '" r="2.4" fill="var(--color-surface)" stroke="var(--chart-collect)" stroke-width="1.6"/>';
      svg +=
        '<circle cx="' +
        x +
        '" cy="' +
        yAt(data.archived[i]) +
        '" r="2.4" fill="var(--color-surface)" stroke="var(--chart-archive)" stroke-width="1.6"/>';
    });

    months.forEach(function (m, i) {
      var x = xAt(i);
      var left = i === 0 ? x : x - stepX / 2;
      var right = i === months.length - 1 ? x : x + stepX / 2;
      var anchor = i === 0 ? "start" : i === months.length - 1 ? "end" : "middle";
      var full = m.replace("-", " 年 ") + " 月";
      var tooltip = tip(full, [
        { label: "采集", value: fmt.number(data.collected[i]) + " 条" },
        { label: "归档", value: fmt.number(data.archived[i]) + " 件" }
      ]);
      svg +=
        '<g class="trend-month" tabindex="0" role="listitem" aria-label="' +
        esc(full) +
        "：采集 " +
        fmt.number(data.collected[i]) +
        " 条，归档 " +
        fmt.number(data.archived[i]) +
        ' 件" data-tip="' +
        tooltip +
        '">';
      svg +=
        '<g class="trend-focus" opacity="0" aria-hidden="true">' +
        '<line x1="' +
        x +
        '" y1="' +
        padT +
        '" x2="' +
        x +
        '" y2="' +
        (padT + plotH) +
        '" stroke="var(--color-border)" stroke-width="1" stroke-dasharray="4 4"/>' +
        '<circle cx="' +
        x +
        '" cy="' +
        yAt(data.collected[i]) +
        '" r="4.5" fill="var(--color-surface)" stroke="var(--chart-collect)" stroke-width="2"/>' +
        '<circle cx="' +
        x +
        '" cy="' +
        yAt(data.archived[i]) +
        '" r="4.5" fill="var(--color-surface)" stroke="var(--chart-archive)" stroke-width="2"/>' +
        "</g>";
      svg +=
        '<rect class="trend-hit" x="' +
        left +
        '" y="' +
        padT +
        '" width="' +
        (right - left) +
        '" height="' +
        plotH +
        '" fill="transparent"/>';
      svg +=
        '<text x="' +
        x +
        '" y="' +
        (H - 12) +
        '" text-anchor="' +
        anchor +
        '" font-size="11" fill="var(--chart-axis-text)">' +
        esc(m.slice(2)) +
        "</text>";
      svg += "</g>";
    });

    svg += "</svg>";
    svg += hiddenTable(
      "近 12 个月采集与归档趋势",
      ["月份", "采集（条）", "归档（件）"],
      months.map(function (m, i) {
        return [
          m.replace("-", " 年 ") + " 月",
          fmt.number(data.collected[i]),
          fmt.number(data.archived[i])
        ];
      })
    );
    container.innerHTML = svg;
  }

  global.WCR.charts = { bar: bar, donut: donut, trend: trend, empty: empty };
})(window);
