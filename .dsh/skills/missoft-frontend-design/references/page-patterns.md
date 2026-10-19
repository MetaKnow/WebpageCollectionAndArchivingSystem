# 页面范式与骨架

先选页面类型，再套结构；结构解决「信息放哪、状态怎么呈现」，组件选择回到 `ng-zorro-components.md` 与 ng-shared 注册表。列表/工具栏/弹窗/图表的 ng-shared 写法见 `ng-shared-patterns.md`。

---

## 0. 通用页面容器

```html
<section class="page">
  <nz-page-header
    nzTitle="采集任务"
    nzSubtitle="共 128 个任务，今日新增 12 个"
    (nzBack)="back()"
  >
    <nz-page-header-extra>
      <button nz-button type="button">导出</button>
      <button nz-button nzType="primary" type="button">
        <nz-icon nzType="plus" />
        新建任务
      </button>
    </nz-page-header-extra>
    <nz-page-header-content>
      <!-- 可选：筛选摘要、统计条 -->
    </nz-page-header-content>
  </nz-page-header>

  <div class="page-body">
    <!-- 查询区 / 工具栏 / 表格 / 卡片 -->
  </div>
</section>
```

```less
.page { display: flex; flex-direction: column; gap: 16px; }
.page-body { display: flex; flex-direction: column; gap: 16px; }
```

规则：

- 页头只放「返回 + 标题 + 一句说明 + 页面级操作」；不要把筛选塞进页头。
- 主操作在页头右侧最外；次操作在左。
- 页面级说明放 subtitle 或 `nz-alert`，不要用大段正文。
- 内容区统一 16px 卡片间距，页面 padding 由布局壳负责（24px）。
- 示例用 Less 主题变量（文件顶部 `@import 'ng-zorro-antd/style/themes/default.less';`）；项目若已有 token 文件，换成项目变量，不要写死 hex。

---

## 1. 列表页

### 结构

```
┌ 页头：标题 + 说明 + [导出] [新建] ┐
├ app-table：工具栏（关键词 / 刷新 / 重置 / 业务按钮） ┤
├ 表头：□ | 名称 | 状态 | 条目数 | 更新时间 | 操作 ┤
└ 底部：已选 N 条 / 批量操作        共 128 条  ‹ 1 2 3 ›  20/页 ┘
```

**有 ng-shared 时，列表页 = 页头 + `app-table`。** 不要自己拼查询区、工具栏、`nz-table`、分页器；
这些都在 `app-table` 内部。列头筛选用 `Column.filter`，关键词用 `searchable` + `QueryParams.keyword`。

### 模板骨架（ng-shared，首选）

```html
<nz-page-header nzTitle="采集任务" nzSubtitle="共 128 个任务，今日新增 12 个">
  <nz-page-header-extra>
    <button nz-button type="button" (click)="exportAll()">导出</button>
    <button nz-button nzType="primary" type="button" (click)="create()">新建任务</button>
  </nz-page-header-extra>
</nz-page-header>

<app-table [options]="options" #table>
  <ng-template #paginationContent>
    @if (selectedCount() > 0) {
      <span>已选 {{ selectedCount() }} 条</span>
      <button nz-button nzSize="small" type="button" (click)="batchArchive()">批量归档</button>
      <button nz-button nzSize="small" nzDanger type="button" (click)="batchDelete()">删除</button>
    }
  </ng-template>
</app-table>
```

```ts
import { Context, Options, createCreateToolbarItemX, createDeleteToolbarItemX } from 'ng-shared';

readonly options: Options = {
  title: '任务列表',
  columns: [
    { title: '任务名称', name: 'name', width: 240, sortable: true, filterable: true,
      filter: { type: 'search', search: { type: 'text' } } },
    { title: '状态', name: 'status', width: 110, widget: { type: 'tags' } },
    { title: '条目数', name: 'total', width: 100 },
    { title: '更新时间', name: 'updatedAt', width: 180, sortable: true }
  ],
  multiple: true,
  keepSelection: true,
  rowKey: 'id',
  searchable: true,                 // 工具栏关键词搜索，值进 QueryParams.keyword
  loadData: (params) => this.api.page(params),
  toolbar: [
    createCreateToolbarItemX({
      content: TaskEditDialogComponent,
      requestFunction: (c: Context) => this.api.create(c.result),
      resultMessage: '创建成功'
    }),
    createDeleteToolbarItemX({
      content: '确定删除选中的任务吗？删除后不可恢复。',
      requestFunction: (c: Context) => this.api.remove({ ids: c.ids! })
    })
  ]
};
```

- 新建/编辑/删除用工厂生成 `steps`，弹窗、确认、请求、刷新都由 `StepHandler` 串起来；**请求成功后表格自动刷新**，不要再调用 `table.refresh()`。
- `createCreateToolbarItemX` 默认 `autoCloseDialog: false`：新建成功后弹窗留在原地并刷新（便于连续录入）；要「保存即关」需手写 `steps` 并设 `autoCloseDialog: true`。
- 单选页面把 `options.multiple` 设为 `false`，删除请求体改用 `ids: [c.id!]`；此时没有 `c.ids`。
- 批量操作依赖 `c.ids`，必须 `options.multiple: true`；工具栏项自身也有 `multiple`，只控制「选中多行时是否置灰」，两者不是一回事。
- `selectedCount()` 可来自 `options.onSelectionChange: selected => this.selectedCount.set(selected.length)`。

### 模板骨架（没有 ng-shared 时的 NG-ZORRO 基线）

只有在库不可用、且已记录 `TODO(ng-shared)` 时才用：

```html
<div class="filter-bar">
  <form nz-form nzLayout="inline" [formGroup]="query">
    <nz-form-item>
      <nz-form-control>
        <input nz-input formControlName="keyword" placeholder="任务名称 / 编号" (keyup.enter)="search()" />
      </nz-form-control>
    </nz-form-item>
    <nz-form-item>
      <nz-form-control>
        <nz-select formControlName="status" nzPlaceHolder="全部状态" nzAllowClear>
          <nz-option nzValue="running" nzLabel="采集中" />
          <nz-option nzValue="done" nzLabel="已完成" />
          <nz-option nzValue="failed" nzLabel="失败" />
        </nz-select>
      </nz-form-control>
    </nz-form-item>
    <nz-form-item>
      <button nz-button nzType="primary" type="button" (click)="search()">查询</button>
      <button nz-button type="button" (click)="reset()">重置</button>
    </nz-form-item>
  </form>
</div>

<nz-table
  [nzData]="rows()"
  [nzLoading]="loading()"
  [nzFrontPagination]="false"
  [nzTotal]="total()"
  [(nzPageIndex)]="pageIndex"
  [(nzPageSize)]="pageSize"
  (nzQueryParams)="load($event)"
  nzShowSizeChanger
  nzShowTotal
>
  <!-- 列定义 -->
</nz-table>
```

### 行为清单

- 查询：条件变化 → 页码重置为 1 → 请求；请求期间工具栏/查询按钮显示 loading。
- 重置：恢复默认值（不是清空到 undefined）并立即查询；`app-table` 的 `reset()` 会回第 1 页并清 keyword/filter/sorter。
- 分页：总数为 0 隐藏分页；切页保留查询条件；切每页条数回到第 1 页。
- 排序：服务端排序只用 `app-table` 的 `QueryParams.sorter`；不要同时开前端排序。
- 选择：跨页选择要明确「已选 N 项」；批量操作后清空选择，换数据源前也要 `clearSelection()`。
- 行操作：≤3 个用文字链接；更多收进「更多」下拉。
- 删除：二次确认写明对象与不可恢复；成功后当前页删空由 `app-table` 自动回退一页，不要自己再写回退。
- 错误：表格区域显示错误态 + 重试，不整页跳错误页。
- 空：区分「从未有数据」与「筛选无结果」，后者给「清除筛选」。

### 代码要点（ng-shared）

```ts
import { signal, inject, ViewChild } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { TableComponent } from 'ng-shared';

readonly selectedCount = signal(0);
private readonly message = inject(NzMessageService);
@ViewChild('table') table!: TableComponent;

readonly options: Options = {
  columns: this.columns,
  multiple: true,
  searchable: true,
  keepSelection: true,
  onSelectionChange: selected => this.selectedCount.set(selected.length),
  loadData: params => this.api.page(params),
  toolbar: [/* 见上 */]
};

batchArchive(): void {
  const selected = this.table.getSelectedMultipleData(false) ?? [];
  const ids = selected.map(row => row.id);
  if (ids.length === 0) {
    this.message.warning('请先选择要归档的任务');
    return;
  }
  this.api.archive({ ids }).subscribe(() => {
    this.table.clearSelection();
    this.table.refresh();
  });
}
```

---

## 2. 详情页

### 结构

```
┌ ← 返回  任务详情  [编辑] [归档] ┐
├ 摘要卡：状态 | 来源 | 创建人 | 创建时间 ┤
├ Tabs：概览 | 采集范围 | 归档记录 | 操作日志 ┤
│ 概览：nz-descriptions 两/三列            │
│ 记录：小表格 + 分页                       │
│ 日志：nz-timeline                         │
└ 底部：最近更新时间 / 关联对象 ┘
```

```html
<nz-page-header nzTitle="市政府门户 2026-06 归档" nzSubtitle="任务编号 TASK-20260612-0031" (nzBack)="back()">
  <nz-page-header-tags>
    <nz-tag nzColor="success">已完成</nz-tag>
    <nz-tag>网站</nz-tag>
  </nz-page-header-tags>
  <nz-page-header-extra>
    <button nz-button type="button">导出报告</button>
    <button nz-button nzType="primary" type="button">重新采集</button>
  </nz-page-header-extra>
</nz-page-header>

<nz-card>
  <nz-descriptions nzTitle="基本信息" nzBordered [nzColumn]="{ xs: 1, sm: 2, lg: 3 }">
    <nz-descriptions-item nzTitle="采集来源">市政府门户</nz-descriptions-item>
    <nz-descriptions-item nzTitle="创建人">李敏</nz-descriptions-item>
    <nz-descriptions-item nzTitle="创建时间">2026-06-12 09:20</nz-descriptions-item>
    <nz-descriptions-item nzTitle="条目数">1,284</nz-descriptions-item>
    <nz-descriptions-item nzTitle="存储占用">3.2 GB</nz-descriptions-item>
    <nz-descriptions-item nzTitle="最近更新">2026-06-12 11:05</nz-descriptions-item>
  </nz-descriptions>
</nz-card>

<nz-card>
  <nz-tabs nzType="line" [(nzSelectedIndex)]="tabIndex">
    <nz-tab nzTitle="概览">…</nz-tab>
    <nz-tab nzTitle="采集范围">…</nz-tab>
    <nz-tab nzTitle="归档记录">…</nz-tab>
    <nz-tab nzTitle="操作日志"><nz-timeline>…</nz-timeline></nz-tab>
  </nz-tabs>
</nz-card>
```

规则：

- 页头返回明确去哪（列表），不要用浏览器返回。
- 状态、来源等短字段放页头 tags；长字段放 descriptions。
- 字段 ≤8 个用 descriptions；更多分组或分 Tab。
- 空字段显示 `--`，不要留空或写 `null`。
- 长文本（描述/备注）单独一块，限制宽度 72ch。
- 操作日志按时间倒序，显示操作人 + 动作 + 时间；敏感字段脱敏。
- 详情页默认只读；编辑走独立页或抽屉，避免误改。

---

## 3. 新建 / 编辑页

### 结构

```
┌ ← 返回  新建采集任务 ┐
├ 卡片 1：基本信息（名称、来源、责任人） ┤
├ 卡片 2：采集配置（范围、深度、频率）   ┤
├ 卡片 3：归档策略（格式、保留期）       ┤
└ 吸底：[取消]                         [保存] ┘
```

```html
<form nz-form nzLayout="vertical" [formGroup]="form" (ngSubmit)="submit()" class="form-page">
  <nz-card nzTitle="基本信息">
    <div nz-row [nzGutter]="24">
      <div nz-col [nzXs]="24" [nzMd]="12">
        <nz-form-item>
          <nz-form-label nzRequired nzFor="name">任务名称</nz-form-label>
          <nz-form-control nzErrorTip="请输入 2–64 个字符">
            <input id="name" nz-input formControlName="name" />
          </nz-form-control>
        </nz-form-item>
      </div>
      <div nz-col [nzXs]="24" [nzMd]="12">
        <nz-form-item>
          <nz-form-label nzRequired nzFor="source">采集来源</nz-form-label>
          <nz-form-control nzErrorTip="请选择来源">
            <nz-select id="source" formControlName="source">…</nz-select>
          </nz-form-control>
        </nz-form-item>
      </div>
    </div>
  </nz-card>

  <div class="form-footer">
    <button nz-button type="button" (click)="cancel()">取消</button>
    <button nz-button nzType="primary" type="submit" [nzLoading]="saving">保存</button>
  </div>
</form>
```

```less
@import 'ng-zorro-antd/style/themes/default.less';

.form-page { display: flex; flex-direction: column; gap: 16px; padding-bottom: 72px; }
.form-footer {
  position: sticky; bottom: 0; z-index: 10;
  display: flex; justify-content: flex-end; gap: 8px;
  padding: 16px 24px; background: @component-background;
  border-top: 1px solid @border-color-split;
}
```

规则：

- 分组用卡片，组标题用名词短语；每组 ≤8 个字段。
- 两列仅桌面；<768px 单列。
- 必填与选填比例要合理；选填字段给「(选填)」而不是全部标必填。
- 校验：blur 校验 + 提交全量；错误定位并滚动到第一个错误字段。
- 保存中禁用表单与取消；成功 toast + 返回列表/详情；失败保留输入并提示可重试。
- 离开拦截：有改动且未保存时确认；保存成功后解除。
- 编辑页预填数据要有 loading 骨架，避免空表单闪烁。

---

## 4. 弹窗 vs 抽屉 vs 独立页

| 场景 | 选择 | 理由 |
| --- | --- | --- |
| 确认删除/提交/启停 | Modal（confirm） | 轻量、聚焦、阻断 |
| ≤7 字段的快速新建/编辑 | Modal | 不离开列表上下文 |
| 多段表单、需要对照列表 | Drawer | 保留上下文、可滚动 |
| 复杂表单、需深链接/刷新保留 | 独立页 | 可路由、可分享、可恢复 |
| 详情查看 | Drawer（简）或独立页（复杂） | 避免弹窗内滚动嵌套 |
| 二次确认里再选对象 | 不要嵌套；先选对象再确认 | 降低认知负担 |

- 弹窗宽度：480 / 640 / 800；内容多时加 `nzBodyStyle` 限制高度并内部滚动。
- 抽屉宽度：480 / 640；头部与底部固定，主体滚动。
- 关闭前有未保存内容必须拦截；Esc 与点遮罩的行为要与产品确认。
- 弹窗标题 = 动作 + 对象；不要让用户猜「确定」会发生什么。

---

## 5. 仪表盘 / 概览页

```
┌ 页头：概览 + 时间范围 [近7天 ▾] ┐
├ 统计卡 ×4：任务数 | 成功率 | 归档量 | 存储占用 ┤
├ 趋势图（左 2/3） | 状态分布（右 1/3） ┤
├ 最近任务表格（Top 10） ┤
└ 快捷入口 ┘
```

```html
<div nz-row [nzGutter]="16">
  <div nz-col [nzXs]="24" [nzSm]="12" [nzXl]="6">
    <nz-card nzTitle="今日采集">
      <nz-statistic [nzValue]="todayCount()" nzSuffix="条" />
      <div class="stat-trend up">较昨日 +12%</div>
    </nz-card>
  </div>
  <!-- 其余统计卡 -->
</div>

<nz-card nzTitle="采集趋势" [nzExtra]="rangeTpl">
  <div class="chart" [class.is-loading]="loading()">
    <!-- 使用项目既有图表库（如 ECharts）；不要为图表新增框架 -->
  </div>
</nz-card>
```

规则：

- 统计卡：标题 12–14px 次色；主值 24–30px 600；单位小一号；趋势标注比较基。
- 图表必须有：标题、时间范围、单位、图例、空态；无数据不要画一条 0 线冒充。
- 颜色用语义色 + 预设分类色；同一图表 ≤6 个系列。
- 刷新/时间范围切换时保持布局稳定，不要整页闪。
- 数字口径写清（今日 = 自然日 00:00 起）。

---

## 6. 状态设计

### 6.1 加载

| 场景 | 呈现 |
| --- | --- |
| 首屏/详情 | 骨架屏（`nz-skeleton`）保持布局 |
| 表格刷新 | `[nzLoading]`，保留旧数据 |
| 按钮提交 | 按钮 loading + 禁用 |
| 图表 | 局部 spin + 固定高度 |

禁止：整页白屏 spinner、按钮 loading 时宽度跳变、重复点击。

### 6.2 空

```html
<nz-empty nzNotFoundImage="simple" nzNotFoundContent="还没有采集任务" [nzNotFoundFooter]="footer"></nz-empty>
<ng-template #footer>
  <button nz-button nzType="primary" (click)="create()">新建任务</button>
</ng-template>
```

- 首次空：说明 + 主操作。
- 筛选空：说明 + 「清除筛选」。
- 无权限空：说明 + 「申请权限」。

### 6.3 错误

```html
<nz-result nzStatus="error" nzTitle="加载失败" nzSubTitle="网络超时，请稍后重试（错误码 NET-504）">
  <div nz-result-extra>
    <button nz-button nzType="primary" (click)="load()">重试</button>
    <button nz-button>联系管理员</button>
  </div>
</nz-result>
```

- 人话在前，错误码弱化在后；不显示堆栈。
- 可重试的给重试；不可重试的给下一步（联系管理员/返回）。
- 局部失败不要升级为整页失败。

### 6.4 无权限 / 禁用

- 403：`nz-result nzStatus="403"` + 申请权限入口。
- 单按钮禁用：tooltip 说明原因（「仅创建人可归档」），不要只置灰。
- 字段脱敏：显示 `***` 并说明权限，不要假装为空。

### 6.5 进行中 / 部分成功

- 长任务显示进度、已处理/总数、预计剩余；提供取消。
- 部分成功要分别列出成功/失败数量与失败原因，支持重试失败项。
- 轮询要有上限与退避，页面隐藏时暂停。

---

## 7. 响应式

NG-ZORRO 断点：`xs <576`、`sm ≥576`、`md ≥768`、`lg ≥992`、`xl ≥1200`、`xxl ≥1600`。

| 宽度 | 布局 |
| --- | --- |
| <576 | 单列；页头操作换行；表格横向滚动；隐藏次要列 |
| 576–991 | 侧栏收起为图标；查询区 2 列；表单单列 |
| 992–1199 | 侧栏展开；查询区 3–4 列；表单两列 |
| ≥1200 | 完整布局；详情三列；仪表盘 4 卡 |

规则：

- 表格始终给 `[nzScroll]="{ x: '...' }"`，避免挤爆。
- 操作列固定右侧；名称列可固定左侧。
- 查询项 >4 个折叠；折叠状态不丢已选条件。
- 弹窗宽度用 `min(640px, 92vw)`；抽屉同理。
- 触摸目标 ≥44×44；不要只靠 hover 展示操作。

---

## 8. 可访问性与键盘

- 页面有唯一 `h1`（页头标题）；区块用 `h2`。
- Tab 顺序 = 视觉顺序；不要用正数 `tabindex`。
- 跳过导航链接（可选）：`<a class="skip-link" href="#main">跳到主内容</a>`。
- 表格：`<th scope="col">`；行操作按钮有可读名称（「删除 任务A」）。
- 图标按钮：`aria-label`；装饰图标 `aria-hidden="true"`。
- 异步结果用 `aria-live="polite"` 播报「已加载 20 条」。
- 弹窗：焦点进入、Esc 关闭、关闭后回到触发按钮。
- 错误提示与控件用 `aria-describedby` 关联。
- 支持 `prefers-reduced-motion`。

---

## 9. 文案与格式

| 类型 | 规则 | 示例 |
| --- | --- | --- |
| 按钮 | 动词 2–4 字 | 新建、保存、批量归档 |
| 确认标题 | 动作 + 对象 | 删除采集任务？ |
| 确认正文 | 对象 + 后果 + 不可逆 | 将删除「X」及其 1,284 条记录，且不可恢复。 |
| 空态 | 现状 + 下一步 | 还没有任务，先新建一个吧。 |
| 错误 | 发生了什么 + 怎么办 | 网络超时，请检查网络后重试。 |
| 时间 | `YYYY-MM-DD HH:mm` | 2026-06-12 09:20 |
| 相对时间 | 仅 7 天内 | 3 小时前 |
| 数字 | 千分位 + 单位 | 1,284 条 / 3.2 GB |
| 百分比 | 1 位小数 | 98.6% |
| 省略 | `…` + tooltip | 很长的任务名称… |

- 中英文混排不加空格；专有名词大小写统一（NG-ZORRO、Ant Design）。
- 不用「您」；统一「你」或省略主语。
- 不写「操作成功」；写「已保存」「已归档」。

---

## 10. 静态原型模式

仅当项目**没有 Angular 工程**、只需要可点击原型时使用（家族旧原型常见）：

- 单文件 HTML + CSS 变量，变量值抄 `ant-design-spec.md`，不要引 Tailwind/Bootstrap。
- 顶部或页脚标注 `PROTOTYPE — 非生产实现`。
- 交互可以模拟（展开、弹窗、切 Tab），但不要伪造接口成功/失败数据而不说明。
- 组件形态对齐 NG-ZORRO 视觉：32 高控件、6px 圆角、14px 正文、24px 卡片内边距。
- 图标用内联 SVG（lucide/antd 风格），不要引整套图标库。
- 交付时说明：真实实现需迁移到 Angular + NG-ZORRO + ng-shared。

> 若用户目标是把原型变成产品页面，**优先搭真实 Angular 工程**，不要用静态 HTML 冒充。

---

## 11. 页面验收清单

- [ ] 页面类型明确，结构符合本文对应范式。
- [ ] 页头、查询、工具栏、内容、分页的位置符合后台直觉。
- [ ] 主操作唯一；危险操作有确认与后果说明。
- [ ] loading / empty / error / 403 / disabled 全部覆盖。
- [ ] 窄屏（375px）与 1440px 都不破版。
- [ ] 键盘可完成主流程；焦点可见；图标有 aria-label。
- [ ] 表格数字右对齐、状态有文字、操作列固定。
- [ ] 表单校验完整、错误可定位、提交有反馈、离开有拦截。
- [ ] 文案符合第 9 节；日期/数字格式统一。
- [ ] 颜色/间距/圆角全部来自 token，无硬编码。
- [ ] 用到的 ng-shared 组件均已在注册表核对。
