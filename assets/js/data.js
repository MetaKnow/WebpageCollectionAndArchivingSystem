/* ==========================================================================
   原型数据（PROTOTYPE — 非生产实现）
   本文件内的账号、统计数字、网站/栏目名称均为演示用示例数据，
   不代表真实采集结果，也不对接任何后端接口。
   ========================================================================== */
(function (global) {
  "use strict";

  /* ---------- 数字格式 ---------- */
  function number(n) {
    return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  function wan(n) {
    if (n >= 10000) {
      var v = n / 10000;
      var s = v >= 100 ? Math.round(v) : Math.round(v * 10) / 10;
      return String(s).replace(/\.0$/, "") + "万";
    }
    return number(n);
  }

  function pct(fraction, digits) {
    var d = typeof digits === "number" ? digits : 1;
    var value = fraction * 100;
    return (
      (Math.round(value * Math.pow(10, d)) / Math.pow(10, d)).toFixed(d) + "%"
    );
  }

  /* ---------- 角色 ---------- */
  var ROLES = {
    "archive-staff": {
      id: "archive-staff",
      label: "档案馆工作人员",
      account: "archive_admin",
      password: "Archive@2026",
      person: {
        name: "张明",
        initials: "张",
        org: "示例市国家综合档案馆",
        scope: "全部网站",
        scopeDetail: "示例市 · 本级政府网站及部门网站"
      },
      menus: [
        "workbench",
        "collect",
        "transfer",
        "archive",
        "search",
        "statistics",
        "system"
      ]
    },
    "site-admin": {
      id: "site-admin",
      label: "网站主办单位系统管理员",
      account: "site_admin",
      password: "Site@2026",
      person: {
        name: "李静",
        initials: "李",
        org: "示例市大数据管理局",
        scope: "本单位网站",
        scopeDetail: "示例市大数据管理局 · 4 个网站"
      },
      menus: ["workbench", "search", "sites", "users"]
    },
    "site-clerk": {
      id: "site-clerk",
      label: "网站主办单位档案员",
      account: "site_clerk",
      password: "Clerk@2026",
      person: {
        name: "王芳",
        initials: "王",
        org: "示例市大数据管理局",
        scope: "本单位网站",
        scopeDetail: "示例市大数据管理局 · 4 个网站"
      },
      menus: ["workbench", "collect", "transfer", "archive", "search", "statistics", "sites", "users"]
    }
  };

  var ROLE_ORDER = ["archive-staff", "site-admin", "site-clerk"];

  var ACCOUNTS = {};
  ROLE_ORDER.forEach(function (id) {
    ACCOUNTS[ROLES[id].account] = id;
  });

  /* ---------- 菜单与模块 ---------- */
  var BUSINESS = [
    { key: "workbench", title: "工作台", icon: "dashboard", hash: "#/workbench" },
    {
      key: "collect",
      title: "收集整理",
      icon: "inbox",
      hash: "#/collect",
      desc: "采集网页结构化数据、OFD 版式文件与照片、音频、视频等原始文件，整理后关联为可归档的网页记录。",
      planned: [
        "采集任务与网站/栏目范围配置",
        "网页结构化元数据采集与预览",
        "OFD 网页及照片、音频、视频文件关联",
        "列表字段与元数据配置保持一致",
        "整理完成后的四性检测发起",
        "批量移交至移交库"
      ]
    },
    {
      key: "transfer",
      title: "移交审核",
      icon: "send",
      hash: "#/transfer",
      desc: "对主办单位移交的批次进行四性检测与内容审核，通过后归档进入网页档案库。",
      planned: [
        "移交批次与批次内文件清单",
        "逐件/批量审核与退回意见",
        "四性检测报告与检测项抽样复核",
        "审核通过后归档入库",
        "归档交接凭证生成",
        "审核与操作留痕"
      ]
    },
    {
      key: "archive",
      title: "网页档案",
      icon: "archive",
      hash: "#/archive",
      desc: "保管正式归档的网页档案，支撑长期可读、可验证、可追溯。",
      planned: [
        "网页档案库案卷/文件级列表",
        "档案与 OFD、照片、音视频关联",
        "分类库、年度、保管期限管理",
        "四性检测记录与封装信息",
        "档案导出与交接凭证",
        "长期保存格式与存储状态"
      ]
    },
    {
      key: "search",
      title: "检索利用",
      icon: "search",
      hash: "#/search",
      desc: "对收集整理库与网页档案库提供目录检索与全文检索。",
      planned: [
        "目录检索（网站、栏目、年度、类别）",
        "全文检索与关键词高亮",
        "跨收集库/档案库检索",
        "结果筛选与排序",
        "原文与版式文件预览",
        "借阅、下载与利用登记"
      ]
    },
    {
      key: "statistics",
      title: "档案统计",
      icon: "bar-chart",
      hash: "#/statistics",
      desc: "按网站、年度、类别统计档案件数，按文件类别统计数量，支撑年报与业务分析。",
      planned: [
        "按网站名称统计件数",
        "按年度统计件数",
        "按类别统计件数",
        "按文件类别统计数量",
        "全部网站/单个网站切换",
        "统计报表导出"
      ]
    }
  ];

  var SYSTEM = {
    key: "system",
    title: "系统管理",
    icon: "settings",
    children: [
      {
        key: "params",
        title: "系统参数",
        icon: "settings",
        hash: "#/system/params",
        desc: "维护系统运行所需的全局参数。",
        planned: [
          "系统访问地址与端口",
          "数据库根目录",
          "系统名称与 Logo",
          "参数修改审计留痕"
        ]
      },
      {
        key: "sites",
        title: "网站管理",
        icon: "globe",
        hash: "#/system/sites",
        desc: "维护纳入采集范围的网站及其栏目结构。",
        planned: [
          "网站基本信息：域名、主办单位、全宗号",
          "左侧网站、右侧栏目分级管理",
          "栏目：频道、一级/二级栏目、访问地址",
          "采集范围启用/停用",
          "网站与栏目变更记录"
        ]
      },
      {
        key: "users",
        title: "用户管理",
        icon: "user",
        hash: "#/system/users",
        desc: "维护系统用户及其所属角色、主办单位。",
        planned: [
          "用户名、密码与状态",
          "角色分配",
          "主办单位归属",
          "重置密码与停用",
          "登录账号操作留痕"
        ]
      },
      {
        key: "roles",
        title: "角色权限",
        icon: "shield-check",
        hash: "#/system/roles",
        desc: "内置三类角色，并支持扩展角色与菜单权限配置。",
        planned: [
          "内置：档案馆工作人员",
          "内置：网站主办单位系统管理员",
          "内置：网站主办单位档案员",
          "自定义角色新增与停用",
          "菜单与操作权限配置",
          "数据范围（全部/本单位）"
        ]
      },
      {
        key: "metadata",
        title: "元数据配置",
        icon: "layers",
        hash: "#/system/metadata",
        desc: "分别配置收集库与归档库的元数据字段。",
        planned: [
          "收集库字段配置",
          "归档库字段配置",
          "内置字段启停与排序",
          "自定义字段与字典绑定",
          "必填、长度与校验规则",
          "列表字段同步预览"
        ]
      },
      {
        key: "category",
        title: "分类库维护",
        icon: "folder",
        hash: "#/system/category",
        desc: "维护网页档案分类库，支撑分类号与档号生成。",
        planned: ["分类树维护", "分类代码与名称", "与归档范围关联", "档号规则预览"]
      },
      {
        key: "tasks",
        title: "任务管理",
        icon: "clock",
        hash: "#/system/tasks",
        desc: "管理采集任务的执行时间、周期与启停，支持手动立即执行。",
        planned: [
          "采集任务新建、修改与删除",
          "执行时间与周期配置",
          "启动、停止与手动执行",
          "自动调度与执行状态"
        ]
      },
      {
        key: "scope",
        title: "归档范围",
        icon: "file-text",
        hash: "#/system/scope",
        desc: "维护归档范围与保管期限表，指导采集与鉴定。",
        planned: [
          "归档范围条目维护",
          "保管期限：永久 / 定期 30 年 / 10 年",
          "按网站或类别适用",
          "版本与生效时间"
        ]
      },
      {
        key: "dict",
        title: "字典配置",
        icon: "book-open",
        hash: "#/system/dict",
        desc: "维护系统内各类下拉与枚举字典。",
        planned: ["字典类型与字典项", "排序与启停", "元数据字段引用", "导入/导出"]
      },
      {
        key: "quality",
        title: "四性检测",
        icon: "check-circle",
        hash: "#/system/quality",
        desc: "配置真实性、完整性、可用性、安全性四性检测方案。",
        planned: [
          "检测项与检测规则",
          "按批次/按件检测策略",
          "失败处理与重检",
          "检测报告模板"
        ]
      },
      {
        key: "storage",
        title: "存储配置",
        icon: "database",
        hash: "#/system/storage",
        desc: "配置档案文件与数据库的存储位置及容量策略。",
        planned: ["存储根目录", "容量阈值与预警", "存储位置迁移", "占用统计"]
      },
      {
        key: "backup",
        title: "备份恢复",
        icon: "refresh",
        hash: "#/system/backup",
        desc: "数据库与文件的备份、恢复管理。",
        planned: [
          "备份策略与周期",
          "手动备份/立即备份",
          "备份记录与校验",
          "恢复演练与恢复记录"
        ]
      },
      {
        key: "logs",
        title: "日志管理",
        icon: "clock",
        hash: "#/system/logs",
        desc: "记录登录、操作与异常日志，支撑审计。",
        planned: ["登录日志", "操作日志", "异常日志", "检索与导出", "保留期限"]
      }
    ]
  };

  var MODULES = {};
  BUSINESS.concat(SYSTEM.children).forEach(function (m) {
    MODULES[m.key] = m;
  });
  MODULES.system = SYSTEM;

  /* ---------- 用户与角色权限示例数据 ---------- */
  var ALL_MENUS = BUSINESS.map(function (m) { return m.key; }).concat(
    SYSTEM.children.map(function (m) { return m.key; })
  );

  var ADMIN_SEED = {
    roles: [
      {
        id: "archive-staff",
        name: "档案馆工作人员",
        code: "archive_staff",
        builtin: true,
        status: "active",
        scope: "all",
        desc: "负责网页采集、整理、移交审核、归档与全馆统计。",
        menus: ALL_MENUS.slice()
      },
      {
        id: "site-admin",
        name: "网站主办单位系统管理员",
        code: "site_admin",
        builtin: true,
        status: "active",
        scope: "own",
        desc: "维护本单位网站、栏目与用户，可查询本单位网页档案。",
        menus: ["workbench", "search", "sites", "users"]
      },
      {
        id: "site-clerk",
        name: "网站主办单位档案员",
        code: "site_clerk",
        builtin: true,
        status: "active",
        scope: "own",
        desc: "负责本单位网页采集、整理、移交审核、归档、检索与统计，并可维护本单位网站与用户。",
        menus: ["workbench", "collect", "transfer", "archive", "search", "statistics", "sites", "users"]
      }
    ],
    users: [
      {
        id: "u1",
        username: "archive_admin",
        name: "张明",
        roleId: "archive-staff",
        org: "示例市国家综合档案馆",
        status: "active",
        lastLogin: "2026-10-18 08:12"
      },
      {
        id: "u2",
        username: "archive_li",
        name: "李娜",
        roleId: "archive-staff",
        org: "示例市国家综合档案馆",
        status: "active",
        lastLogin: "2026-10-17 16:40"
      },
      {
        id: "u3",
        username: "site_admin",
        name: "李静",
        roleId: "site-admin",
        org: "示例市大数据管理局",
        status: "active",
        lastLogin: "2026-10-18 08:05"
      },
      {
        id: "u4",
        username: "site_clerk",
        name: "王芳",
        roleId: "site-clerk",
        org: "示例市大数据管理局",
        status: "active",
        lastLogin: "2026-10-18 07:58"
      },
      {
        id: "u5",
        username: "edu_admin",
        name: "赵强",
        roleId: "site-admin",
        org: "市教育局",
        status: "active",
        lastLogin: "2026-10-16 14:22"
      },
      {
        id: "u6",
        username: "edu_clerk",
        name: "陈晨",
        roleId: "site-clerk",
        org: "市教育局",
        status: "disabled",
        lastLogin: "—"
      }
    ]
  };

  var ADMIN = JSON.parse(JSON.stringify(ADMIN_SEED));

  /* ---------- 工作台数据 ---------- */
  var MONTHS = [
    "2025-11",
    "2025-12",
    "2026-01",
    "2026-02",
    "2026-03",
    "2026-04",
    "2026-05",
    "2026-06",
    "2026-07",
    "2026-08",
    "2026-09",
    "2026-10"
  ];

  var CATEGORY_META = [
    { key: "text", name: "网页文本", icon: "file-text", color: "var(--chart-1)" },
    { key: "photo", name: "照片", icon: "image", color: "var(--chart-2)" },
    { key: "audio", name: "音频", icon: "music", color: "var(--chart-3)" },
    { key: "video", name: "视频", icon: "video", color: "var(--chart-4)" }
  ];

  function buildCategories(values) {
    var total = values.reduce(function (a, b) {
      return a + b;
    }, 0);
    return CATEGORY_META.map(function (meta, i) {
      return {
        key: meta.key,
        name: meta.name,
        icon: meta.icon,
        color: meta.color,
        value: values[i],
        pct: values[i] / total
      };
    });
  }

  var ARCHIVE_DASHBOARD = {
    scopeLabel: "全部网站",
    scopeDetail: "示例市 · 本级政府网站及部门网站",
    updatedAt: "2026-10-18 08:00",
    stats: [
      {
        label: "采集网站",
        value: 128,
        unit: "个",
        icon: "globe",
        tint: "blue",
        meta: "本月新增 6 个",
        metaIcon: "trending-up"
      },
      {
        label: "采集栏目",
        value: 3642,
        unit: "个",
        icon: "layout-grid",
        tint: "cyan",
        meta: "本月新增 128 个",
        metaIcon: "trending-up"
      },
      {
        label: "采集网页",
        value: 1284530,
        unit: "条",
        icon: "file-text",
        tint: "purple",
        meta: "近 7 天新增 9,840 条",
        metaIcon: "trending-up"
      },
      {
        label: "已归档",
        value: 1102417,
        unit: "件",
        icon: "archive",
        tint: "green",
        meta: "归档率 85.8%",
        metaIcon: "check-circle"
      }
    ],
    bySite: {
      unitCollected: "条",
      unitArchived: "件",
      rows: [
        { name: "市政府门户网站", collected: 286400, archived: 251300 },
        { name: "市教育局", collected: 168200, archived: 149600 },
        { name: "市公安局", collected: 210300, archived: 193700 },
        { name: "市发展和改革委员会", collected: 142800, archived: 128400 },
        { name: "市文化和旅游局", collected: 167330, archived: 109817 },
        { name: "市生态环境局", collected: 124600, archived: 108500 },
        { name: "市科学技术局", collected: 96500, archived: 84200 },
        { name: "市民政局", collected: 88400, archived: 76900 }
      ]
    },
    byColumn: {
      unitCollected: "条",
      unitArchived: "件",
      rows: [
        { name: "要闻动态", collected: 316820, archived: 288400 },
        { name: "政务公开", collected: 245600, archived: 221300 },
        { name: "政策文件", collected: 198420, archived: 186900 },
        { name: "政务服务", collected: 156300, archived: 132700 },
        { name: "互动交流", collected: 128940, archived: 104200 },
        { name: "数据发布", collected: 96210, archived: 78600 },
        { name: "专题专栏", collected: 78400, archived: 62100 },
        { name: "机构职能", collected: 63840, archived: 28217 }
      ]
    },
    categories: buildCategories([986420, 78615, 12480, 24902]),
    trend: {
      months: MONTHS,
      collected: [
        42180, 38640, 51320, 33760, 58940, 62310, 66480, 71250, 69120, 63540,
        67890, 51700
      ],
      archived: [
        35800, 32900, 43900, 28600, 50100, 53200, 56900, 61000, 59300, 54100,
        58000, 43900
      ]
    },
    overview: {
      archiveRate: 85.8,
      archiveRateSub: "较上月 +1.2 个百分点 · 目标 90%",
      qualityRate: 96.4,
      qualityRateSub: "本月检测 2,846 件，未通过 103 件",
      todos: [
        {
          label: "移交审核待办",
          value: "8 批",
          href: "#/transfer",
          icon: "send"
        },
        {
          label: "四性检测未通过",
          value: "3 批",
          href: "#/transfer",
          icon: "alert-triangle"
        },
        {
          label: "存储空间预警",
          value: "1 项",
          href: "#/system/storage",
          icon: "database"
        }
      ]
    }
  };

  var SITE_DASHBOARD = {
    scopeLabel: "本单位网站",
    scopeDetail: "示例市大数据管理局 · 4 个网站",
    updatedAt: "2026-10-18 08:00",
    stats: [
      {
        label: "采集网站",
        value: 4,
        unit: "个",
        icon: "globe",
        tint: "blue",
        meta: "本月无新增",
        metaIcon: "check-circle"
      },
      {
        label: "采集栏目",
        value: 126,
        unit: "个",
        icon: "layout-grid",
        tint: "cyan",
        meta: "本月新增 8 个",
        metaIcon: "trending-up"
      },
      {
        label: "采集网页",
        value: 58420,
        unit: "条",
        icon: "file-text",
        tint: "purple",
        meta: "近 7 天新增 1,240 条",
        metaIcon: "trending-up"
      },
      {
        label: "已归档",
        value: 46913,
        unit: "件",
        icon: "archive",
        tint: "green",
        meta: "归档率 80.3%",
        metaIcon: "check-circle"
      }
    ],
    bySite: {
      unitCollected: "条",
      unitArchived: "件",
      rows: [
        { name: "市大数据管理局门户", collected: 28640, archived: 23180 },
        { name: "数字政府专栏", collected: 14220, archived: 11640 },
        { name: "政务数据开放平台", collected: 9860, archived: 7940 },
        { name: "数据安全专题", collected: 5700, archived: 4153 }
      ]
    },
    byColumn: {
      unitCollected: "条",
      unitArchived: "件",
      rows: [
        { name: "工作动态", collected: 14280, archived: 12400 },
        { name: "通知公告", collected: 9640, archived: 8900 },
        { name: "政策文件", collected: 8220, archived: 7600 },
        { name: "数据目录", collected: 7480, archived: 6210 },
        { name: "开放接口", collected: 6300, archived: 4820 },
        { name: "安全专题", collected: 5760, archived: 4153 },
        { name: "互动问答", collected: 3940, archived: 2360 },
        { name: "机构概况", collected: 2800, archived: 470 }
      ]
    },
    categories: buildCategories([42175, 3190, 469, 1079]),
    trend: {
      months: MONTHS,
      collected: [
        2480, 2120, 2960, 1840, 3180, 3420, 3610, 3980, 3760, 3510, 3780, 2690
      ],
      archived: [
        1960, 1690, 2390, 1470, 2560, 2750, 2900, 3200, 3020, 2820, 3040, 2160
      ]
    },
    overview: {
      archiveRate: 80.3,
      archiveRateSub: "较上月 +0.8 个百分点 · 目标 90%",
      qualityRate: 94.1,
      qualityRateSub: "本月检测 1,186 件，未通过 70 件",
      todos: [
        {
          label: "待移交审核",
          value: "2 批",
          href: "#/transfer",
          icon: "send"
        },
        {
          label: "四性检测未通过",
          value: "1 批",
          href: "#/transfer",
          icon: "alert-triangle"
        },
        {
          label: "待完善元数据",
          value: "6 条",
          href: "#/collect",
          icon: "file-text"
        }
      ]
    }
  };

  var DASHBOARD = {
    "archive-staff": ARCHIVE_DASHBOARD,
    "site-admin": SITE_DASHBOARD,
    "site-clerk": SITE_DASHBOARD
  };

  /* ---------- 网站与栏目 ---------- */
  function siteColumns(prefix, rows) {
    return rows.map(function (row, index) {
      return {
        id: prefix + "-c" + (index + 1),
        channel: row[0],
        level1: row[1],
        level2: row[2],
        url: row[3],
        status: row[4] || "active"
      };
    });
  }

  var SITES = {
    sites: [
      {
        id: "s1",
        name: "市政府门户网站",
        domain: "www.shi.gov.cn",
        code: "shi_gov",
        org: "示例市人民政府办公室",
        fonds: "J001",
        status: "active",
        columns: siteColumns("s1", [
          ["要闻动态", "要闻", "市政府要闻", "https://www.shi.gov.cn/yw/szfyw/"],
          ["要闻动态", "要闻", "部门动态", "https://www.shi.gov.cn/yw/bmdt/"],
          ["政务公开", "政策文件", "市政府文件", "https://www.shi.gov.cn/zfxxgk/zcwj/"],
          ["政务服务", "个人服务", "户籍办理", "https://www.shi.gov.cn/zwfw/grfw/"],
          ["互动交流", "在线访谈", "", "https://www.shi.gov.cn/hdjl/zxft/"],
          ["数据发布", "统计公报", "", "https://www.shi.gov.cn/sjtj/tjgb/", "disabled"]
        ])
      },
      {
        id: "s2",
        name: "市教育局",
        domain: "jyj.shi.gov.cn",
        code: "jyj",
        org: "示例市教育局",
        fonds: "J002",
        status: "active",
        columns: siteColumns("s2", [
          ["教育资讯", "通知公告", "", "https://jyj.shi.gov.cn/jyzx/tzgg/"],
          ["政务公开", "招生考试", "义务教育", "https://jyj.shi.gov.cn/zsks/ywjy/"],
          ["政务服务", "教师资格", "", "https://jyj.shi.gov.cn/zwfw/jszg/"],
          ["互动交流", "局长信箱", "", "https://jyj.shi.gov.cn/hdjl/jzxx/"]
        ])
      },
      {
        id: "s3",
        name: "市公安局",
        domain: "gaj.shi.gov.cn",
        code: "gaj",
        org: "示例市公安局",
        fonds: "J003",
        status: "active",
        columns: siteColumns("s3", [
          ["警务资讯", "警方提示", "", "https://gaj.shi.gov.cn/jwzx/jfts/"],
          ["政务公开", "户籍管理", "迁入迁出", "https://gaj.shi.gov.cn/zfxxgk/hjgl/"],
          ["办事服务", "出入境", "护照办理", "https://gaj.shi.gov.cn/bsfw/crj/"],
          ["互动交流", "在线咨询", "", "https://gaj.shi.gov.cn/hdjl/zxzx/"]
        ])
      },
      {
        id: "s4",
        name: "市发展和改革委员会",
        domain: "fgw.shi.gov.cn",
        code: "fgw",
        org: "示例市发展和改革委员会",
        fonds: "J004",
        status: "active",
        columns: siteColumns("s4", [
          ["发改动态", "工作动态", "", "https://fgw.shi.gov.cn/fgdt/gzdt/"],
          ["政策文件", "规划计划", "专项规划", "https://fgw.shi.gov.cn/zcwj/ghjh/"],
          ["政务服务", "项目审批", "企业投资", "https://fgw.shi.gov.cn/zwfw/xmsp/"],
          ["价格信息", "商品价格", "", "https://fgw.shi.gov.cn/jgxx/spjg/"]
        ])
      },
      {
        id: "s5",
        name: "市文化和旅游局",
        domain: "wlj.shi.gov.cn",
        code: "wlj",
        org: "示例市文化和旅游局",
        fonds: "J005",
        status: "active",
        columns: siteColumns("s5", [
          ["文旅资讯", "文旅动态", "", "https://wlj.shi.gov.cn/wlzx/wldt/"],
          ["政务公开", "非遗保护", "项目名录", "https://wlj.shi.gov.cn/zfxxgk/fywb/"],
          ["公共服务", "场馆预约", "图书馆", "https://wlj.shi.gov.cn/ggfw/cgyy/"],
          ["互动交流", "在线投诉", "", "https://wlj.shi.gov.cn/hdjl/zxts/"]
        ])
      },
      {
        id: "s6",
        name: "市生态环境局",
        domain: "sthjj.shi.gov.cn",
        code: "sthjj",
        org: "示例市生态环境局",
        fonds: "J006",
        status: "active",
        columns: siteColumns("s6", [
          ["环保动态", "工作动态", "", "https://sthjj.shi.gov.cn/hbdt/gzdt/"],
          ["政务公开", "环境质量", "空气质量", "https://sthjj.shi.gov.cn/zfxxgk/hjzl/"],
          ["政务服务", "排污许可", "", "https://sthjj.shi.gov.cn/zwfw/pwxk/"],
          ["互动交流", "环保举报", "", "https://sthjj.shi.gov.cn/hdjl/hbjb/"]
        ])
      },
      {
        id: "s7",
        name: "市科学技术局",
        domain: "kjj.shi.gov.cn",
        code: "kjj",
        org: "示例市科学技术局",
        fonds: "J007",
        status: "active",
        columns: siteColumns("s7", [
          ["科技动态", "工作动态", "", "https://kjj.shi.gov.cn/kjdt/gzdt/"],
          ["政策法规", "科技计划", "重点研发", "https://kjj.shi.gov.cn/zcfg/kjjh/"],
          ["办事服务", "高企认定", "", "https://kjj.shi.gov.cn/bsfw/gqrd/"],
          ["互动交流", "意见征集", "", "https://kjj.shi.gov.cn/hdjl/yjzj/"]
        ])
      },
      {
        id: "s8",
        name: "市民政局",
        domain: "mzj.shi.gov.cn",
        code: "mzj",
        org: "示例市民政局",
        fonds: "J008",
        status: "disabled",
        columns: siteColumns("s8", [
          ["民政动态", "工作动态", "", "https://mzj.shi.gov.cn/mzdt/gzdt/"],
          ["政务公开", "社会救助", "低保信息", "https://mzj.shi.gov.cn/zfxxgk/shjz/"],
          ["办事服务", "婚姻登记", "", "https://mzj.shi.gov.cn/bsfw/hydj/"]
        ])
      },
      {
        id: "s9",
        name: "市大数据管理局门户网站",
        domain: "dsj.shi.gov.cn",
        code: "dsj",
        org: "示例市大数据管理局",
        fonds: "J006",
        status: "active",
        columns: siteColumns("s9", [
          ["工作动态", "工作动态", "", "https://dsj.shi.gov.cn/xwdt/gzdt/"],
          ["通知公告", "通知公告", "", "https://dsj.shi.gov.cn/tzgg/"]
        ])
      },
      {
        id: "s10",
        name: "数字政府专栏",
        domain: "szzf.shi.gov.cn",
        code: "szzf",
        org: "示例市大数据管理局",
        fonds: "J006",
        status: "active",
        columns: siteColumns("s10", [
          ["数字政府", "政策文件", "", "https://szzf.shi.gov.cn/zcwj/"],
          ["数字政府", "工作动态", "", "https://szzf.shi.gov.cn/gzdt/"]
        ])
      },
      {
        id: "s11",
        name: "政务数据开放平台",
        domain: "data.shi.gov.cn",
        code: "data",
        org: "示例市大数据管理局",
        fonds: "J006",
        status: "active",
        columns: siteColumns("s11", [
          ["数据开放", "数据目录", "", "https://data.shi.gov.cn/mulu/"],
          ["数据开放", "开放接口", "", "https://data.shi.gov.cn/api/"]
        ])
      },
      {
        id: "s12",
        name: "数据安全专题",
        domain: "safety.shi.gov.cn",
        code: "safety",
        org: "示例市大数据管理局",
        fonds: "J006",
        status: "active",
        columns: siteColumns("s12", [
          ["数据安全", "安全动态", "", "https://safety.shi.gov.cn/aqdt/"]
        ])
      }
    ]
  };

  /* ---------- 系统参数 ---------- */
  var PARAMS = {
    tabs: [
      {
        key: "appearance",
        title: "外观参数",
        rows: [
          {
            key: "app_name",
            desc: "【系统外观】管理系统的名称",
            type: "文本",
            value: "网页采集归档系统"
          },
          {
            key: "app_description",
            desc: "【系统外观】管理系统的描述",
            type: "文本",
            value: "面向各级国家综合档案馆的网页采集、整理与长期保存平台"
          },
          {
            key: "menu_position",
            desc: "【系统外观】系统菜单显示位置",
            type: "选择",
            value: "系统左侧",
            options: ["系统左侧", "系统顶部"]
          },
          {
            key: "captcha",
            desc: "【系统外观】登录验证码类型",
            type: "选择",
            value: "不启用",
            options: ["智能验证码", "图形验证码", "不启用"]
          },
          {
            key: "app_logo_white",
            desc: "【系统外观】公司白色 logo，在系统首页展示",
            type: "本地资源",
            value: "./assets/logo-white.png"
          },
          {
            key: "app_favicon",
            desc: "【系统外观】浏览器标签页系统的图标",
            type: "本地资源",
            value: "static/favicon.ico"
          },
          {
            key: "empty_placeholder",
            desc: "【系统外观】列表空值占位符",
            type: "文本",
            value: "/"
          }
        ]
      },
      {
        key: "application",
        title: "应用参数",
        pending: true
      },
      {
        key: "business",
        title: "业务参数",
        pending: true
      }
    ]
  };

  /* ---------- 会话 ---------- */
  var SESSION_KEY = "wcr.session";

  function readSession() {
    try {
      var raw = global.sessionStorage.getItem(SESSION_KEY);
      if (!raw) return null;
      var data = JSON.parse(raw);
      if (!data || !ROLES[data.roleId]) return null;
      return data;
    } catch (e) {
      return null;
    }
  }

  function writeSession(data) {
    try {
      global.sessionStorage.setItem(SESSION_KEY, JSON.stringify(data));
    } catch (e) {
      /* 隐私模式下忽略 */
    }
  }

  function clearSession() {
    try {
      global.sessionStorage.removeItem(SESSION_KEY);
    } catch (e) {
      /* ignore */
    }
  }

  function sessionForRole(roleId, username) {
    var role = ROLES[roleId] || ROLES["archive-staff"];
    return {
      roleId: role.id,
      username: username || role.account,
      name: role.person.name,
      initials: role.person.initials,
      org: role.person.org,
      loginAt: new Date().toISOString()
    };
  }

  /* ---------- 元数据配置 ---------- */
  function metaField(code, name, type, required, searchable, display, desc, options) {
    return {
      code: code,
      name: name,
      type: type,
      required: required,
      searchable: searchable,
      display: display,
      hint: desc,
      desc: desc,
      options: options || []
    };
  }

  var META_BASE = [
    metaField("site_name", "网站名称", "text", true, true, true, "采集网站的规范名称"),
    metaField("site_domain", "网站域名", "text", true, false, false, "网站主域名，不含协议与路径"),
    metaField("title", "标题", "text", true, true, true, "网页主标题"),
    metaField("subtitle", "副标题", "text", false, false, false, "网页副标题或引题"),
    metaField("column", "栏目", "text", true, true, true, "网页所属栏目名称"),
    metaField("publish_time", "发布时间", "datetime", true, true, true, "网页在网站上发布的日期时间"),
    metaField("source", "来源", "text", false, false, false, "网页内容的来源或转载出处"),
    metaField("keywords", "关键词", "text", false, true, false, "多个关键词以分号分隔"),
    metaField("author", "作者", "text", false, false, false, "网页作者或责任编辑"),
    metaField("summary", "摘要", "textarea", false, true, false, "网页内容摘要"),
    metaField("url", "网址", "url", true, false, false, "网页原始访问地址"),
    metaField("fonds_no", "全宗号", "text", true, true, true, "归档全宗号"),
    metaField("site_code", "网站代码", "text", true, false, false, "网站唯一代码"),
    metaField("year", "年度", "number", true, true, true, "归档年度，四位数"),
    metaField("retention", "保管期限", "select", true, true, true, "网页档案的保管期限", ["永久", "定期 30 年", "定期 10 年"]),
    metaField("category_code", "类别代码", "text", true, true, true, "档案类别代码"),
    metaField("sequence_no", "顺序号", "text", true, false, true, "同一分类下的顺序号"),
    metaField("collect_time", "采集时间", "datetime", true, false, false, "系统采集入库时间"),
    metaField("collector", "采集人", "text", true, false, false, "执行采集的账号或姓名")
  ];

  var META_EXTRA = {
    site_name: { length: 100 },
    site_domain: { length: 100 },
    title: { length: 200 },
    subtitle: { length: 200 },
    column: { length: 100 },
    publish_time: { length: 20 },
    source: { length: 100 },
    keywords: { length: 200 },
    author: { length: 50 },
    summary: { length: 2000 },
    url: { length: 500 },
    fonds_no: { length: 50 },
    site_code: { length: 50 },
    year: { length: 4, defaultType: "currentYear" },
    retention: { length: 20, dictionary: "retention" },
    category_code: { length: 50, dictionary: "category" },
    sequence_no: { length: 50 },
    collect_time: { length: 20, readonly: true, defaultType: "currentDate" },
    collector: { length: 50, readonly: true, defaultType: "currentUser" }
  };

  function metaLibrary(prefix) {
    return META_BASE.map(function (field, index) {
      var copy = JSON.parse(JSON.stringify(field));
      var extra = META_EXTRA[field.code] || {};
      copy.id = prefix + "-" + (index + 1);
      copy.builtin = true;
      copy.hint = field.desc;
      copy.length = extra.length || 100;
      copy.readonly = !!extra.readonly;
      copy.metadata = extra.metadata || field.code;
      copy.dictionary = extra.dictionary || "";
      copy.defaultType = extra.defaultType || "";
      copy.defaultValue = extra.defaultValue || "";
      return copy;
    });
  }

  var CATEGORIES = [
    { id: "cat1", name: "网站及栏目首页", code: "LMSY", note: "网站首页、栏目首页等入口页面", builtin: true },
    { id: "cat2", name: "信息发布类", code: "XXFB", note: "新闻、通知、公告等信息发布页面", builtin: true },
    { id: "cat3", name: "解读回应类", code: "JDHY", note: "政策解读、回应关切等信息页面", builtin: true },
    { id: "cat4", name: "办事服务类", code: "BSFW", note: "办事指南、在线服务等页面", builtin: true },
    { id: "cat5", name: "互动交流类", code: "HDJL", note: "咨询、建议、投诉等互动页面", builtin: true },
    { id: "cat6", name: "其他类", code: "QT", note: "未归入上述类别的网页", builtin: true }
  ];

  var SCOPE_ROWS = [
    { id: "scope-1", seq: "1", range: "网站及栏目首页页面", retention: "", group: true },
    { id: "scope-1-1", seq: "1.1", range: "网站首页", retention: "永久" },
    { id: "scope-1-2", seq: "1.2", range: "一级栏目首页", retention: "30 年" },
    { id: "scope-1-3", seq: "1.3", range: "二级栏目首页", retention: "10 年" },
    { id: "scope-2", seq: "2", range: "“信息发布”类页面", retention: "", group: true },
    { id: "scope-2-1", seq: "2.1", range: "经济、社会、历史、地理、人文、行政区划等介绍性信息", retention: "永久" },
    { id: "scope-2-2", seq: "2.2", range: "机构设置、主要职责和联系方式等机构职能信息", retention: "永久" },
    { id: "scope-2-3", seq: "2.3", range: "本地区、本部门、本机构的负责人信息以及重要讲话文稿", retention: "永久" },
    { id: "scope-2-4", seq: "2.4", range: "本地区、本部门出台的法规、规章、应主动公开的政府文件以及相关法律法规等", retention: "永久" },
    { id: "scope-2-5", seq: "2.5", range: "本地区、本部门政务要闻、通知公告、工作动态等需要社会公众广泛知晓的信息", retention: "30 年" },
    { id: "scope-2-6", seq: "2.6", range: "转载上级政府网站、本级政府门户网站发布的重要信息", retention: "10 年" },
    { id: "scope-2-7", seq: "2.7", range: "政府信息公开指南、政府信息公开目录和政府信息公开工作年度报告", retention: "永久" },
    { id: "scope-2-8", seq: "2.8", range: "人口、自然资源、经济、农业、工业、服务业、财政金融、民生保障等社会关注度高的本地区、本行业统计数据", retention: "永久" },
    { id: "scope-2-9", seq: "2.9", range: "行政权力清单、财政资金、公共资源配置、重大建设项目、公共服务、国有企业、环境保护、食品药品安全、推进社会组织、中介机构等信息", retention: "永久" },
    { id: "scope-3", seq: "3", range: "“解读回应”类页面", retention: "", group: true },
    { id: "scope-3-1", seq: "3.1", range: "由文件制发部门、牵头或起草部门提供的重要政策文件的解读材料，包括各种形式的解读、评论、专访等", retention: "永久" },
    { id: "scope-3-2", seq: "3.2", range: "公布涉及本地区、本部门的重大突发事件的客观事实，并根据事件发展和工作进展发布的动态信息", retention: "永久" },
    { id: "scope-3-3", seq: "3.3", range: "相关业务部门对社会公众关注的热点问题作出权威、正面的回应", retention: "30 年" },
    { id: "scope-3-4", seq: "3.4", range: "相关部门针对涉及本地区、本部门的网络谣言发布的辟谣信息", retention: "30 年" },
    { id: "scope-4", seq: "4", range: "“办事服务”类页面", retention: "", group: true },
    { id: "scope-4-1", seq: "4.1", range: "发布本地区、本部门政务服务事项目录的网站在线服务资源清单", retention: "永久" },
    { id: "scope-4-2", seq: "4.2", range: "细化的规范办事指南，包括依据条件、流程时限、收费标准、注意事项、办理机构、联系方式等信息", retention: "30 年" },
    { id: "scope-5", seq: "5", range: "“互动交流”类页面", retention: "", group: true },
    { id: "scope-5-1", seq: "5.1", range: "网民意见建议和问题咨询的审看、处理和反馈信息", retention: "10 年" },
    { id: "scope-5-2", seq: "5.2", range: "开展专项意见建议征集活动并在网站上公布采用情况的信息", retention: "30 年" },
    { id: "scope-5-3", seq: "5.3", range: "针对近期社会热点和本部门重点工作开展访谈活动的音视频、图片、文字记录等信息", retention: "10 年" }
  ];

  var META_SEED = {
    collection: metaLibrary("c"),
    archive: metaLibrary("a")
  };

  global.WCR = {
    ROLES: ROLES,
    ROLE_ORDER: ROLE_ORDER,
    ACCOUNTS: ACCOUNTS,
    BUSINESS: BUSINESS,
    SYSTEM: SYSTEM,
    MODULES: MODULES,
    DASHBOARD: DASHBOARD,
    PARAMS: PARAMS,
    SITES: SITES,
    CATEGORIES: CATEGORIES,
    SCOPE_ROWS: SCOPE_ROWS,
    META_SEED: META_SEED,
    ADMIN: ADMIN,
    ADMIN_SEED: ADMIN_SEED,
    MONTHS: MONTHS,
    fmt: { number: number, wan: wan, pct: pct },
    session: {
      read: readSession,
      write: writeSession,
      clear: clearSession,
      forRole: sessionForRole
    }
  };
})(window);
