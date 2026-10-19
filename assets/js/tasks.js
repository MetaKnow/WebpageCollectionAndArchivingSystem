/* ==========================================================================
   任务管理 — 采集任务（原型，自动调度仅页面内模拟）
   ========================================================================== */
(function (global) {
  "use strict";

  var WCR = global.WCR || {};
  var TABS = [
    { key: "collection", label: "采集任务" },
    { key: "scheduled", label: "定时任务" },
    { key: "ordinary", label: "普通任务" }
  ];
  var CYCLES = [
    { key: "daily", label: "每天" },
    { key: "weekly", label: "每周" },
    { key: "monthly", label: "每月" },
    { key: "quarterly", label: "每季度" },
    { key: "halfYear", label: "每半年" },
    { key: "yearly", label: "每年" }
  ];
  var state = { tab: "collection" };
  var store = null;
  var els = {};
  var intervalId = null;
  var runTimers = {};
  var modal = { root: null, title: null, body: null, foot: null, returnFocus: null };

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function toast(message, type) {
    if (WCR.ui && WCR.ui.toast) WCR.ui.toast(message, type);
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
    if (!value) return "—";
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

  function timeParts(value) {
    var parts = String(value || "02:00").split(":");
    return {
      hours: Math.max(0, Math.min(23, parseInt(parts[0], 10) || 0)),
      minutes: Math.max(0, Math.min(59, parseInt(parts[1], 10) || 0))
    };
  }

  function cycleLabel(key) {
    var found = CYCLES.filter(function (item) {
      return item.key === key;
    })[0];
    return found ? found.label : key;
  }

  function addMonthsClamped(base, months) {
    var day = base.getDate();
    var candidate = new Date(base.getFullYear(), base.getMonth() + months, 1, base.getHours(), base.getMinutes(), 0, 0);
    var lastDay = new Date(candidate.getFullYear(), candidate.getMonth() + 1, 0).getDate();
    candidate.setDate(Math.min(day, lastDay));
    return candidate;
  }

  function nextOccurrence(task, from) {
    var parts = timeParts(task.time);
    var now = from || new Date();
    var candidate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), parts.hours, parts.minutes, 0, 0);
    var key = task.cycle;
    if (candidate.getTime() > now.getTime()) return candidate;
    if (key === "daily") {
      candidate.setDate(candidate.getDate() + 1);
      return candidate;
    }
    if (key === "weekly") {
      candidate.setDate(candidate.getDate() + 7);
      return candidate;
    }
    if (key === "monthly") return addMonthsClamped(candidate, 1);
    if (key === "quarterly") return addMonthsClamped(candidate, 3);
    if (key === "halfYear") return addMonthsClamped(candidate, 6);
    if (key === "yearly") return addMonthsClamped(candidate, 12);
    candidate.setDate(candidate.getDate() + 1);
    return candidate;
  }

  function seedTasks() {
    return [
      {
        id: "task-1",
        name: "市政府门户网站日常采集",
        site: "s1",
        time: "02:00",
        cycle: "daily",
        enabled: true,
        lastRun: "2026-10-19 02:00",
        runs: 124,
        nextAt: null,
        running: false
      },
      {
        id: "task-2",
        name: "市教育局政务公开栏目采集",
        site: "s2",
        time: "06:30",
        cycle: "weekly",
        enabled: false,
        lastRun: "2026-10-13 06:30",
        runs: 52,
        nextAt: null,
        running: false
      },
      {
        id: "task-3",
        name: "市公安局要闻动态采集",
        site: "s3",
        time: "08:00",
        cycle: "daily",
        enabled: true,
        lastRun: "2026-10-19 08:00",
        runs: 88,
        nextAt: null,
        running: false
      }
    ];
  }

  function tasks() {
    if (!store) {
      store = clone(seedTasks());
      store.forEach(function (task) {
        if (task.enabled) task.nextAt = nextOccurrence(task, new Date()).getTime();
      });
    }
    return store;
  }

  function siteName(key) {
    if (key === "all" || !key) return "全部网站";
    var site = ((WCR.SITES && WCR.SITES.sites) || []).filter(function (item) {
      return item.id === key;
    })[0];
    return site ? site.name : key;
  }

  function siteOptions(value) {
    var list = [{ id: "all", name: "全部网站" }].concat((WCR.SITES && WCR.SITES.sites) || []);
    return list
      .map(function (site) {
        return (
          '<option value="' +
          esc(site.id) +
          '"' +
          (site.id === value ? " selected" : "") +
          ">" +
          esc(site.name) +
          "</option>"
        );
      })
      .join("");
  }

  function cycleOptions(value) {
    return CYCLES.map(function (cycle) {
      return (
        '<option value="' +
        esc(cycle.key) +
        '"' +
        (cycle.key === value ? " selected" : "") +
        ">" +
        esc(cycle.label) +
        "</option>"
      );
    }).join("");
  }

  function taskCount() {
    var active = tasks().filter(function (task) {
      return task.enabled;
    }).length;
    return "共 " + tasks().length + " 个采集任务 · 已启动 " + active + " 个";
  }

  function statusPill(task) {
    if (task.running) return '<span class="task-status task-status--running">执行中</span>';
    if (task.enabled) return '<span class="task-status task-status--enabled">已启动</span>';
    return '<span class="task-status task-status--stopped">已停止</span>';
  }

  function rowHtml(task) {
    var disabled = task.running ? " disabled" : "";
    return (
      '<tr data-id="' +
      esc(task.id) +
      '"' +
      (task.running ? ' class="task-row--running"' : "") +
      ">" +
      '<td><div class="task-name"><strong title="' +
      esc(task.name) +
      '">' +
      esc(task.name) +
      '</strong><span class="task-runs">已执行 ' +
      (task.runs || 0) +
      " 次</span></div></td>" +
      '<td title="' +
      esc(siteName(task.site)) +
      '">' +
      esc(siteName(task.site)) +
      "</td>" +
      "<td>" +
      esc(task.time) +
      "</td>" +
      "<td>" +
      esc(cycleLabel(task.cycle)) +
      "</td>" +
      '<td class="task-datetime">' +
      esc(task.running ? "执行中" : task.enabled ? fmtDateTime(task.nextAt) : "—") +
      "</td>" +
      '<td class="task-datetime">' +
      esc(fmtDateTime(task.lastRun)) +
      "</td>" +
      "<td>" +
      statusPill(task) +
      "</td>" +
      '<td><div class="task-actions">' +
      '<button type="button" class="btn btn--link" data-task-act="edit" data-id="' +
      esc(task.id) +
      '"' +
      disabled +
      ">编辑</button>" +
      (task.enabled
        ? '<button type="button" class="btn btn--link" data-task-act="stop" data-id="' +
          esc(task.id) +
          '"' +
          disabled +
          ">停止</button>"
        : '<button type="button" class="btn btn--link" data-task-act="start" data-id="' +
          esc(task.id) +
          '"' +
          disabled +
          ">启动</button>") +
      '<button type="button" class="btn btn--link" data-task-act="run" data-id="' +
      esc(task.id) +
      '"' +
      disabled +
      ">立即执行</button>" +
      '<button type="button" class="btn btn--link task-action--danger" data-task-act="delete" data-id="' +
      esc(task.id) +
      '"' +
      disabled +
      ">删除</button>" +
      "</div></td></tr>"
    );
  }

  function emptyHtml() {
    return (
      '<div class="task-empty">' +
      '<div class="task-empty-art"><svg class="icon" aria-hidden="true"><use href="#icon-clock"/></svg></div>' +
      "<h3>暂无采集任务</h3>" +
      '<p>点击右上角“新建采集任务”创建第一条任务。</p>' +
      '<button type="button" class="btn btn--primary" id="taskEmptyAdd"><svg class="icon icon--sm" aria-hidden="true"><use href="#icon-plus"/></svg>新建采集任务</button>' +
      "</div>"
    );
  }

  function collectionHtml() {
    var list = tasks();
    return (
      '<div class="task-toolbar"><div class="task-heading"><h2>采集任务</h2>' +
      '<p id="taskCount" class="task-count">' +
      esc(taskCount()) +
      "</p></div>" +
      '<span class="task-auto"><span class="task-auto-dot"></span>自动调度运行中</span>' +
      "</div>" +
      '<p class="table-scroll-hint task-scroll-hint">左右滑动查看完整任务表</p>' +
      (list.length
        ? '<div class="table-wrap"><table class="data-table task-table" aria-label="采集任务列表">' +
          '<caption class="visually-hidden">采集任务列表</caption>' +
          '<thead><tr><th scope="col">任务名称</th><th scope="col">采集网站</th><th scope="col">执行时间</th><th scope="col">执行周期</th><th scope="col">下次执行</th><th scope="col">最近执行</th><th scope="col">状态</th><th scope="col">操作</th></tr></thead>' +
          '<tbody id="taskBody">' +
          list.map(rowHtml).join("") +
          "</tbody></table></div>"
        : emptyHtml()) +
      (list.length
        ? '<div class="table-foot"><span id="taskFoot">' +
          esc(taskCount()) +
          '</span><span>自动执行由页面内定时器模拟</span></div>'
        : "") +
      '<p class="page-footnote">自动调度仅在当前页面打开时由浏览器定时器模拟，关闭或刷新页面后停止；执行结果与采集数量为原型演示，不请求后端接口。</p>'
    );
  }

  function headHtml() {
    return (
      '<div class="page-head"><div><h1>任务管理</h1></div>' +
      '<div class="page-actions">' +
      '<button type="button" class="btn" id="taskStartAll">全部开启</button>' +
      '<button type="button" class="btn" id="taskStopAll">全部停止</button>' +
      '<button type="button" class="btn" id="taskRunAll">全部立即执行</button>' +
      '<button type="button" class="btn btn--primary" id="taskAdd"><svg class="icon icon--sm" aria-hidden="true"><use href="#icon-plus"/></svg>新建采集任务</button>' +
      "</div></div>"
    );
  }

  function shellHtml() {
    return (
      '<div class="task-page">' +
      headHtml() +
      '<section class="card task-card" aria-labelledby="taskTitle">' +
      '<div class="task-layout">' +
      '<nav class="task-nav" role="tablist" aria-label="任务分类">' +
      TABS.map(function (tab, index) {
        return (
          '<button type="button" role="tab" data-task-tab="' +
          tab.key +
          '" aria-selected="' +
          (index === 0) +
          '" class="' +
          (index === 0 ? "is-active" : "") +
          '">' +
          esc(tab.label) +
          (tab.key === "collection"
            ? '<span class="task-nav-count" id="taskNavCount">' +
              tasks().length +
              "</span>"
            : "") +
          "</button>"
        );
      }).join("") +
      "</nav>" +
      '<div class="task-main" id="taskMain" role="tabpanel"></div>' +
      "</div></section>" +
      '<div class="modal-layer" id="taskModalRoot" hidden>' +
      '<div class="modal-mask" data-task-close></div>' +
      '<div class="modal task-modal" id="taskDialog" role="dialog" aria-modal="true" aria-labelledby="taskModalTitle" tabindex="-1">' +
      '<div class="modal-head"><h2 id="taskModalTitle"></h2>' +
      '<button type="button" class="icon-btn" data-task-close aria-label="关闭"><svg class="icon" aria-hidden="true"><use href="#icon-x"/></svg></button></div>' +
      '<div class="modal-body" id="taskModalBody"></div>' +
      '<div class="modal-foot" id="taskModalFoot"></div>' +
      "</div></div>" +
      "</div>"
    );
  }

  function paintNav() {
    Array.prototype.forEach.call(els.mainRoot.querySelectorAll("[data-task-tab]"), function (button) {
      var active = button.getAttribute("data-task-tab") === state.tab;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-selected", String(active));
    });
    var count = els.mainRoot.querySelector("#taskNavCount");
    if (count) count.textContent = tasks().length;
  }

  function paintContent() {
    var head = els.mainRoot.querySelector(".page-head");
    if (head) head.hidden = state.tab !== "collection";
    if (state.tab !== "collection") {
      els.mainRoot.querySelector("#taskMain").innerHTML = "";
      els.mainRoot.querySelector("#taskMain").classList.add("task-main--blank");
      return;
    }
    els.mainRoot.querySelector("#taskMain").classList.remove("task-main--blank");
    els.mainRoot.querySelector("#taskMain").innerHTML = collectionHtml();
    bindContent();
    paintNav();
  }

  function paint() {
    if (!els.mainRoot) return;
    paintContent();
    paintNav();
    syncBulkButtons();
  }

  function syncBulkButtons() {
    if (!els.mainRoot) return;
    var list = tasks();
    var start = els.mainRoot.querySelector("#taskStartAll");
    var stop = els.mainRoot.querySelector("#taskStopAll");
    var run = els.mainRoot.querySelector("#taskRunAll");
    if (!start || !stop || !run) return;
    var allEnabled = list.length > 0 && list.every(function (task) { return task.enabled || task.running; });
    var allStopped = list.length > 0 && list.every(function (task) { return !task.enabled && !task.running; });
    var allRunning = list.length > 0 && list.every(function (task) { return task.running; });
    start.disabled = !list.length || allEnabled;
    stop.disabled = !list.length || allStopped;
    run.disabled = !list.length || allRunning;
  }

  function findTask(id) {
    return tasks().filter(function (task) {
      return task.id === id;
    })[0];
  }

  function closeModal(restoreFocus) {
    if (!modal.root) return;
    modal.root.hidden = true;
    document.body.classList.remove("modal-open");
    document.removeEventListener("keydown", onModalKeydown);
    if (restoreFocus !== false && modal.returnFocus && modal.returnFocus.focus) {
      modal.returnFocus.focus();
    }
    modal.returnFocus = null;
  }

  function focusables() {
    return Array.prototype.slice.call(
      modal.root.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')
    ).filter(function (element) {
      return !element.disabled && element.offsetParent !== null;
    });
  }

  function onModalKeydown(event) {
    if (event.key === "Escape") {
      event.preventDefault();
      closeModal();
      return;
    }
    if (event.key !== "Tab") return;
    var list = focusables();
    if (!list.length) return;
    var first = list[0];
    var last = list[list.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  function openModal(config) {
    modal.root = els.mainRoot.querySelector("#taskModalRoot");
    modal.title = modal.root.querySelector("#taskModalTitle");
    modal.body = modal.root.querySelector("#taskModalBody");
    modal.foot = modal.root.querySelector("#taskModalFoot");
    modal.returnFocus = config.returnFocus || document.activeElement;
    modal.title.textContent = config.title;
    modal.body.innerHTML = config.body;
    modal.foot.innerHTML = config.foot;
    modal.root.hidden = false;
    document.body.classList.add("modal-open");
    document.addEventListener("keydown", onModalKeydown);
    var target = config.focus ? modal.body.querySelector(config.focus) : modal.root.querySelector("#taskDialog");
    if (target) {
      window.requestAnimationFrame(function () {
        target.focus();
      });
    }
    if (config.onMount) config.onMount();
  }

  function formBody(task) {
    return (
      '<p class="task-modal-intro">' +
      (task ? "修改保存后，启用中的任务会按新的执行时间与周期重新计算下次执行时间。" : "新建任务默认停止，创建后可点击“启动”按周期自动执行。") +
      "</p>" +
      '<form id="taskForm" class="task-form" novalidate>' +
      '<div class="field"><label class="field-label" for="tfName">任务名称 <span class="required">*</span></label><input class="input" id="tfName" type="text" maxlength="60" value="' +
      esc(task ? task.name : "") +
      '" placeholder="例如：市政府门户网站日常采集" /><p class="field-error" id="tfNameError" hidden></p></div>' +
      '<div class="form-grid">' +
      '<div class="field"><label class="field-label" for="tfSite">采集网站</label><div class="select-wrap"><select class="select" id="tfSite">' +
      siteOptions(task ? task.site : "all") +
      '</select><svg class="icon icon--sm" aria-hidden="true"><use href="#icon-chevron-down"/></svg></div></div>' +
      '<div class="field"><label class="field-label" for="tfTime">执行时间 <span class="required">*</span></label><input class="input" id="tfTime" type="time" value="' +
      esc(task ? task.time : "02:00") +
      '" /><p class="field-error" id="tfTimeError" hidden></p></div>' +
      '<div class="field field--full"><label class="field-label" for="tfCycle">执行周期 <span class="required">*</span></label><div class="select-wrap"><select class="select" id="tfCycle">' +
      cycleOptions(task ? task.cycle : "daily") +
      '</select><svg class="icon icon--sm" aria-hidden="true"><use href="#icon-chevron-down"/></svg></div><p class="field-hint">可选每天 / 每周 / 每月 / 每季度 / 每半年 / 每年；周期以保存/开启日期为基准计算，页面打开时自动检查并执行。</p></div>' +
      "</div></form>"
    );
  }

  function setError(field, error, message) {
    if (field) field.classList.toggle("is-invalid", !!message);
    if (error) {
      error.hidden = !message;
      error.textContent = message || "";
    }
  }

  function saveTask(id) {
    var task = id ? findTask(id) : null;
    var name = modal.body.querySelector("#tfName");
    var time = modal.body.querySelector("#tfTime");
    var cycle = modal.body.querySelector("#tfCycle");
    var site = modal.body.querySelector("#tfSite");
    var nameError = modal.body.querySelector("#tfNameError");
    var timeError = modal.body.querySelector("#tfTimeError");
    setError(name, nameError, "");
    setError(time, timeError, "");
    if (!name.value.trim()) {
      setError(name, nameError, "请输入任务名称。");
      name.focus();
      return;
    }
    if (!time.value) {
      setError(time, timeError, "请选择执行时间。");
      time.focus();
      return;
    }
    if (task) {
      task.name = name.value.trim();
      task.site = site.value;
      task.time = time.value;
      task.cycle = cycle.value;
      if (task.enabled) task.nextAt = nextOccurrence(task, new Date()).getTime();
      closeModal(false);
      paint();
      toast("已保存采集任务“" + task.name + "”。", "success");
    } else {
      var created = {
        id: "task-" + Date.now(),
        name: name.value.trim(),
        site: site.value,
        time: time.value,
        cycle: cycle.value,
        enabled: false,
        lastRun: null,
        runs: 0,
        nextAt: null,
        running: false
      };
      tasks().push(created);
      closeModal(false);
      paint();
      toast("已创建采集任务“" + created.name + "”，点击“启动”后生效。", "success");
    }
    var add = els.mainRoot.querySelector("#taskAdd");
    if (add) add.focus();
  }

  function openForm(task, source) {
    openModal({
      title: task ? "编辑采集任务" : "新建采集任务",
      body: formBody(task),
      foot:
        '<button type="button" class="btn" data-task-close>取消</button>' +
        '<button type="button" class="btn btn--primary" id="taskSave">' +
        (task ? "保存修改" : "创建任务") +
        "</button>",
      returnFocus: source,
      focus: "#tfName",
      onMount: function () {
        var form = modal.body.querySelector("#taskForm");
        var button = modal.foot.querySelector("#taskSave");
        form.addEventListener("submit", function (event) {
          event.preventDefault();
          saveTask(task ? task.id : null);
        });
        button.addEventListener("click", function () {
          saveTask(task ? task.id : null);
        });
        ["#tfName", "#tfTime"].forEach(function (selector) {
          var input = modal.body.querySelector(selector);
          input.addEventListener("input", function () {
            setError(
              input,
              modal.body.querySelector(selector + "Error"),
              ""
            );
          });
        });
      }
    });
  }

  function openDelete(task, source) {
    openModal({
      title: "删除采集任务",
      body:
        '<p class="task-modal-intro">确认删除采集任务“<strong>' +
        esc(task.name) +
        "</strong>”吗？</p>" +
        '<div class="task-warning"><svg class="icon" aria-hidden="true"><use href="#icon-alert-triangle"/></svg><span>删除后该任务的执行配置与运行记录将从当前会话移除，刷新页面可恢复示例任务。</span></div>',
      foot:
        '<button type="button" class="btn" data-task-close>取消</button>' +
        '<button type="button" class="btn btn--danger" id="taskDeleteConfirm">删除任务</button>',
      returnFocus: source,
      onMount: function () {
        modal.foot.querySelector("#taskDeleteConfirm").addEventListener("click", function () {
          var index = tasks().indexOf(task);
          if (index >= 0) tasks().splice(index, 1);
          if (runTimers[task.id]) {
            clearTimeout(runTimers[task.id]);
            delete runTimers[task.id];
          }
          closeModal(false);
          paint();
          toast("已删除采集任务“" + task.name + "”。", "success");
          var add = els.mainRoot.querySelector("#taskAdd");
          if (add) add.focus();
        });
      }
    });
  }

  function startTask(task) {
    task.enabled = true;
    task.nextAt = nextOccurrence(task, new Date()).getTime();
    paint();
    toast("已启动“" + task.name + "”，下次执行 " + fmtDateTime(task.nextAt) + "。", "success");
  }

  function stopTask(task) {
    task.enabled = false;
    task.nextAt = null;
    paint();
    toast("已停止采集任务“" + task.name + "”。", "info");
  }

  function execute(task, mode, silent) {
    if (task.running) return;
    task.running = true;
    paint();
    if (!silent) {
      toast(
        (mode === "auto" ? "定时调度触发：" : "已开始执行：") +
          "“" +
          task.name +
          "”（原型模拟，不请求后端）。",
        "info"
      );
    }
    runTimers[task.id] = setTimeout(function () {
      task.running = false;
      task.lastRun = fmtDateTime(new Date());
      task.runs = (task.runs || 0) + 1;
      if (task.enabled) {
        task.nextAt = nextOccurrence(task, new Date()).getTime();
      } else {
        task.nextAt = null;
      }
      delete runTimers[task.id];
      paint();
      if (!silent) toast("采集任务“" + task.name + "”执行完成（模拟）。", "success");
    }, 2200);
  }

  function startAll() {
    var list = tasks();
    list.forEach(function (task) {
      task.enabled = true;
      if (!task.running) task.nextAt = nextOccurrence(task, new Date()).getTime();
    });
    paint();
    toast("已开启全部 " + list.length + " 个采集任务。", "success");
  }

  function stopAll() {
    var list = tasks();
    var cancelled = 0;
    list.forEach(function (task) {
      if (runTimers[task.id]) {
        clearTimeout(runTimers[task.id]);
        delete runTimers[task.id];
        task.running = false;
        cancelled += 1;
      }
      task.enabled = false;
      task.nextAt = null;
    });
    paint();
    toast(
      "已停止全部采集任务" + (cancelled ? "，并取消 " + cancelled + " 个执行中的任务。" : "。"),
      "info"
    );
  }

  function runAll() {
    var list = tasks();
    var started = 0;
    list.forEach(function (task) {
      if (!task.running) {
        execute(task, "manual", true);
        started += 1;
      }
    });
    if (started) {
      toast("已开始执行全部 " + started + " 个采集任务（模拟，不请求后端）。", "info");
    } else {
      toast("所有采集任务正在执行中。", "info");
    }
  }

  function checkDue() {
    var now = Date.now();
    tasks().forEach(function (task) {
      if (task.enabled && !task.running && task.nextAt && now >= task.nextAt) {
        execute(task, "auto");
      }
    });
  }

  function bindContent() {
    var body = els.mainRoot.querySelector("#taskBody");
    if (body) {
      body.addEventListener("click", function (event) {
        var button = event.target.closest("[data-task-act]");
        if (!button || button.disabled) return;
        var task = findTask(button.getAttribute("data-id"));
        if (!task) return;
        var action = button.getAttribute("data-task-act");
        if (action === "edit") openForm(task, button);
        if (action === "delete") openDelete(task, button);
        if (action === "start") startTask(task);
        if (action === "stop") stopTask(task);
        if (action === "run") execute(task, "manual");
      });
    }
    var emptyAdd = els.mainRoot.querySelector("#taskEmptyAdd");
    if (emptyAdd) {
      emptyAdd.addEventListener("click", function () {
        openForm(null, emptyAdd);
      });
    }
  }

  function bind(main) {
    els.mainRoot = main;
    var add = main.querySelector("#taskAdd");
    if (add) add.addEventListener("click", function () {
      openForm(null, add);
    });
    var startAllBtn = main.querySelector("#taskStartAll");
    var stopAllBtn = main.querySelector("#taskStopAll");
    var runAllBtn = main.querySelector("#taskRunAll");
    if (startAllBtn) startAllBtn.addEventListener("click", startAll);
    if (stopAllBtn) stopAllBtn.addEventListener("click", stopAll);
    if (runAllBtn) runAllBtn.addEventListener("click", runAll);
    var nav = main.querySelector(".task-nav");
    nav.addEventListener("click", function (event) {
      var button = event.target.closest("[data-task-tab]");
      if (!button) return;
      state.tab = button.getAttribute("data-task-tab");
      paint();
    });
    modal.root = main.querySelector("#taskModalRoot");
    modal.root.addEventListener("click", function (event) {
      if (event.target.closest("[data-task-close]")) closeModal();
    });
  }

  function render(main) {
    tasks();
    state.tab = "collection";
    main.innerHTML = shellHtml();
    bind(main);
    paint();
    if (intervalId) clearInterval(intervalId);
    intervalId = setInterval(checkDue, 10000);
  }

  function destroy() {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
    Object.keys(runTimers).forEach(function (key) {
      clearTimeout(runTimers[key]);
    });
    runTimers = {};
    tasks().forEach(function (task) {
      task.running = false;
    });
    closeModal(false);
    document.removeEventListener("keydown", onModalKeydown);
  }

  WCR.tasks = { render: render, destroy: destroy };
  global.WCR = WCR;
})(window);
