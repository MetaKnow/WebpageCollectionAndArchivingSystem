# ng-shared 落地范式（app-table / StepHandler / 弹窗 / 图标 / 图表）

> **事实来源**：本机源码 `/Users/leckie/002开发项目/ng-shared/ng-shared-master`，
> 组件清单见 [ng-shared-components.md](ng-shared-components.md)（自动扫描生成，31 条声明）。
> 用法契约见源码仓库 `docs/01-app-table-契约.md`、`docs/02-step-handler.md`、
> `docs/03-对话框与图标.md`、`docs/04-图表组件.md`。**本文是浓缩版，冲突时以源码和这四份文档为准。**

## 1. 先决条件：怎么把 ng-shared 用起来

### 1.1 包与版本

| 项 | 值 |
| --- | --- |
| npm 包名 | `ng-shared`（**不是** `@missoft/ng-shared`，没有 scope） |
| 源码版本 | `0.0.1`（源码 `package.json`），构建产物在 `dist/` |
| Angular | **精确 `22.1.6`**；`@angular/*` 必须与宿主**完全同版**，signal input 的 brand 类型跨 patch 不兼容 |
| 宿主依赖 | `ng-zorro-antd ^22.1.0`、`@delon/* ^22.1.1`、`@lucide/angular ^1.45.0`、`@antv/g2 ^5.4.8`、`date-fns ^4.4.0`、`spark-md5 ^3.0.0`、`rxjs ~7.8.0` |

宿主 `package.json` 用本地构建产物：

```json
"ng-shared": "file:../ng-shared/dist"
```

改库后**必须** `npm run build`（ng-packagr）再重启宿主；宿主 `ng serve` 前 `rm -rf .angular/cache`，
否则 Vite 预构建缓存不随 `file:` 内容失效。

### 1.2 宿主必须提供的 provider（缺一个就是静默失效）

```ts
// app.config.ts
import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideNzI18n, zh_CN } from 'ng-zorro-antd/i18n';
import { provideNzIcons } from 'ng-zorro-antd/icon';
import { provideLucideIcons, LucideShieldCheck, LucideRefreshCw } from '@lucide/angular';
import { provideAlain } from '@delon/theme';
import { provideCellWidgets } from '@delon/abc/cell';
import { CELL_WIDGETS } from 'ng-shared';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideNzI18n(zh_CN),
    provideNzIcons([/* ng-zorro 图标名，如 'plus', 'search', 'delete' */]),
    // 按图标组件注册；名字自动转成 kebab-case（LucideShieldCheck -> 'shield-check'）
    provideLucideIcons(LucideShieldCheck, LucideRefreshCw),
    provideAlain({ chart: { libs: ['./assets/@antv/g2/g2.min.js'] } }),
    provideCellWidgets(...CELL_WIDGETS)
  ]
};
```

- **两套图标命名空间独立**：`app-icon` 用 lucide 名（`shield-check`），`nz-icon` / 工具栏 `icon` 用 ng-zorro 名（`eye`、`download`）。写错不报错，只是不显示。
- `angular.json` 的 **build 和 test 两个 target** 都要把 `node_modules/@antv/g2/dist` 拷到 `/assets/@antv/g2/`，否则图表空白。
- `provideLucideIcons(...icons)` 接受**图标组件**（如 `LucideShieldCheck`），不是字符串数组；名字由组件名转 kebab-case。`provideCellWidgets(...CELL_WIDGETS)` 也是展开传参。已有注册方式就沿用，不要重复注册。

## 2. 页面骨架：`app-left-right-layout` + `app-card`

```html
<app-left-right-layout [col]="6" [leftLoading]="treeLoading()" [rightLoading]="false">
  <div name="left" class="h-full">
    <!-- 左：树 / 分组 / 导航 -->
  </div>
  <div name="right" class="h-full">
    <app-table [options]="options" #table />
  </div>
</app-left-right-layout>
```

- `app-left-right-layout` 输入：`leftLoading`、`rightLoading`、`mode: 'main' | 'dialog' | 'tabs'`、`nocard`、`col`（左侧 24 栅格列数，默认 4）。**两个内容槽是 `[name='left']` 和 `[name='right']`**，不是 `ng-content` 位置投影。
- `mode` 只是控制左右卡片的 `nocard`/`hoverable` 外观；`dialog`/`tabs` 下不显示卡片悬浮感。
- 不需要左右分栏时，页面直接放 `app-table` 或 `app-card`，不要为了「有布局」套空壳。

`app-card`（15 个输入里常用的）：

| 输入 | 说明 |
| --- | --- |
| `title` / `icon` | `icon` 是 **lucide 名**，会渲染成 `<app-icon>`；有 `title` 才显示卡片头 |
| `loading` | 卡片内 `nz-spin` |
| `bordered` / `hoverable` | 边框默认 `false`；悬浮默认 `true` |
| `refreshable` / `(refresh)` | 卡片右上角刷新图标；默认 `true`，点击只发事件，请求要自己接 |
| `noPadding` / `cardContentClass` / `bodyStyle` | `noPadding` 默认 `false`；内容区留白与样式 |
| `bodyCenter` / `bodyXCenter` / `bodyYCenter` | 空态/结果页居中 |
| `mode: 'default' \| 'auto'`、`autoFit` | 高度是否撑满父级；默认 `auto` + `autoFit=true` |

- 默认内容投影；卡片头右侧插槽：`<div name="card-extra">…</div>`（会投进 `nz-card` 的 extra 区，**只有传了 `title` 才渲染**）。
- `app-card` 的 `autoFit` 默认 `true`，会给宿主 `height:100%`；父容器必须有确定高度，否则「撑满」等于 0。`mode: 'default'` 会把 `autoFit` 关掉。

## 3. 列表页核心：`app-table`

`app-table` 只有 **一个输入 `options`**；没有输出。分页、排序、筛选、勾选、工具栏、空态都由它内部处理。

```html
<app-table [options]="options" #table />
```

### 3.1 `Options` 最小可用集

```ts
import { Options, Column } from 'ng-shared';

readonly options: Options = {
  columns: [
    { title: '任务名称', name: 'name', width: 240, sortable: true, filterable: true },
    { title: '状态', name: 'status', width: 110, widget: { type: 'tags' } },
    { title: '创建人', name: 'creatorName', width: 120, widget: { type: 'avatar' } },
    { title: '大小', name: 'size', width: 100, widget: { type: 'fileSize' } }
  ],
  loadData: (params) => this.api.page(params),
  multiple: false,
  toolbar: [/* 见 3.4 */]
};
```

`Options` 常用字段：

| 字段 | 默认 | 说明 |
| --- | --- | --- |
| `columns` | `[]` | 列定义，见 3.2 |
| `loadData` | — | `(params: QueryParams) => Observable<TableResponse> \| false`；返回 `false` 表示本次不加载 |
| `list` | — | 纯前端数据；与 `loadData` 二选一 |
| `multiple` | **`true`** | **选项级**：是否允许多选、决定 `context.ids` 是否存在；单选页面必须显式设 `false` |
| `checkable` / `allCheckEnable` | `true` | 勾选列 / 全选可用 |
| `keepSelection` / `rowKey` | `false` / `'id'` | 跨页勾选；`rowKey` 必须唯一 |
| `onSelectionChange` | — | `(selected: any[]) => void`，跨页时给全集 |
| `onDblClickRow` / `onClickCell` | — | 行双击 / 单元格点击（`onClickCell(row, column, value)`） |
| `processData` / `processParams` | — | 响应/请求映射，后端字段不匹配时用 |
| `pagination` | `true` | `false` 时底部整块（含投射区）不渲染 |
| `pageSize` | — | **不是 Options 字段**：初始页大小取 `settings.app.pageSize`（`@delon/theme` 的 `SettingsService`），无配置时 20 |
| `height` / `virtualScroll` / `virtualItemSize` | — | 固定高 + 虚拟滚动；大表才用 |
| `autoLoadData` | `true` | 首次自动加载；`false` 时手动 `table.refresh()` |
| `toolbar` | `[]` | `ToolbarItem[]` 或返回它的函数 |
| `autoLoadToolbar` | `true` | 是否自动加载 `toolbar`（传函数时用） |
| `refreshable` / `searchable` / `resetable` | `true` / `true` / `false` | 工具栏行为 |
| `title` | — | 表格标题 |

### 3.2 `Column`

| 字段 | 说明 |
| --- | --- |
| `title` / `name` | 表头 / 字段名；`name` 同时是筛选、排序的 key |
| `width` / `fixed` | 宽度、固定列（默认左侧固定，中后台常见） |
| `sortable` / `filterable` | 打开排序 / 筛选 |
| `filter: { type: 'search', search: { type: 'text' \| 'NUMBER' \| 'DATE' \| 'DATETIME' \| 'BOOLEAN' \| 'TIME' } }` | 表头搜索；`type: 'search'` 时是输入型筛选 |
| `filter: { items: [{ text, value }] }` | 枚举下拉筛选 |
| `widget` | `@delon` cell 渲染，默认 `{ type: 'string' }` |
| `tooltip` | `(row, column, value) => string` |
| `formatter` / `tooltip` | 单元格格式化函数 / 悬浮提示函数；没有 `className`、`onClick` 字段 |

内置 cell widget（`CELL_WIDGETS`，`widget.type` 直接用）：

| type | 数据形状 | 示例 |
| --- | --- | --- |
| `avatar` | 姓名字符串 | 创建人 |
| `tags` | `string[]`，每项 `"文本:颜色"` | `['通过:green', '异常:red']` |
| `fileSize` | 字节数（number） | 附件大小 |
| `color` | 颜色值 | 色块列 |
| `icons` | ng-zorro 图标名数组 | 操作能力标识 |

> `tags` / `icons` 的 widget 依赖宿主 `provideCellWidgets(...CELL_WIDGETS)`；没注册时渲染为空，不报错。

### 3.3 服务端分页：`loadData` 的请求/响应

```ts
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { QueryParams, TableResponse } from 'ng-shared';

page(params: QueryParams): Observable<TableResponse> {
  return this.http.post<{ total: number; list: Task[] }>('/api/tasks/page', params).pipe(
    map(res => ({ total: res.total, list: res.list }))
  );
}
```

- `QueryParams`：`{ pageIndex, pageSize, keyword?, filter?: Record<string, any>, sorter?: Record<string, any> }`。
  `filter` / `sorter` 为空时组件会删掉；后端协议不同就在 `processParams` 里转换。
- `TableResponse`：`{ total: number; list: any[]; executeTime?: string }`。
- **页码从 1 开始**；组件在「当前页删空」时会自动回退一页并重刷，不要自己再写。
- 不要再用 `nzPageIndexChange` / `nzPageSizeChange` 二次请求；`app-table` 内部已经处理。这不是原生 `nz-table` 的用法。

### 3.4 工具栏：优先用工厂，注意两个 `multiple`

```ts
import {
  Context, Options,
  createCreateToolbarItemX,
  createUpdateToolbarItemX,
  createDeleteToolbarItemX
} from 'ng-shared';

readonly options: Options = {
  columns: this.columns,
  multiple: false,                       // 单选页面
  loadData: (p) => this.api.page(p),
  toolbar: [
    createCreateToolbarItemX({
      content: TaskEditDialogComponent,
      requestFunction: (c: Context) => this.api.create(c.result),
      resultMessage: '创建成功'
    }),
    createUpdateToolbarItemX({
      content: TaskEditDialogComponent,
      requestFunction: (c: Context) => this.api.update(c.result)
    }),
    createDeleteToolbarItemX({
      content: '确定删除该任务吗？',
      multiple: false,                   // 工具栏项级：最多勾一行；不改变 context.ids
      requestFunction: (c: Context) => this.api.remove({ ids: [c.id!] })
    })
  ]
};
```

**必须记住的 `multiple` 区别**：

| 写在哪 | 管什么 |
| --- | --- |
| `options.multiple` | 能否勾多行；**只有它为 `true` 时 `context.ids` 才存在** |
| 工具栏项 `multiple` | 选中多行时该按钮是否置灰（`false` = 最多勾一行） |

- 单选页单份操作：**一律 `context.id` 自己包数组**，例如 `remove({ ids: [c.id!] })`。用 `c.ids` 会得到 `undefined`，请求体变 `{}`，后端报「缺少参数：ids」。
- 批量页才用 `context.ids`，并且 `options.multiple: true`；多选页里选了两行以上时 `context.id` 不存在。
- `selectMode: true` 的按钮没选数据时自动置灰；额外条件用 `isDisabled(context)`，隐藏用 `isHidden(context)`。
- 工厂只透传 `requestFunction / resultMessage / responseFunction / autoRefresh / loadable`；需要 `maximize` / `fullHeight` / `autoCloseDialog` / `refresh` 时**手写 `steps`**（见 4.2），不要指望工厂。
- `http` 步骤成功后**自动刷新表格**（`refresh` 由框架注入），不要再手动 `this.table.refresh()`。
- 删除确认框内容走 `[innerHTML]`：要加粗写 `<b>`，写 `**粗体**` 会把星号原样显示。

### 3.5 勾选、跨页与底部投射区

```html
<app-table [options]="options" #table>
  <ng-template #paginationContent>
    <button nz-button nzSize="small" nzType="primary" (click)="exportSelected()">批量导出</button>
    <span class="ml-2">已选 {{ selectedCount() }} 条</span>
  </ng-template>
</app-table>
```

- `keepSelection: true` + `rowKey` 才能翻页不丢勾选；`getSelectedMultipleData()` 返回**跨页全集**。
- 清空用 `table.clearSelection()`；换数据源（切树节点/换筛选）前要清，否则旧勾选会误导。
- `getSelectedMultipleData(false)` 在空选时不弹红字，由调用方判空。
- `#paginationContent` 槽常驻（空数据也在），但 `pagination: false` 时整个 footer 都不渲染。

### 3.6 列表页 HTML 骨架

```html
<app-table [options]="options" #table />
```

列表页不要自己再包 `nz-card` + `nz-table` + `nz-pagination`；`app-table` 已经含工具栏、表头筛选、分页、空态。
需要标题/卡片外观时用 `Options.title`，或在页面级套 `app-card`（注意高度）。

## 4. 工具栏按钮背后的步骤机：`StepHandler`

每个工具栏按钮 = 一串 `steps`，**顺序执行**；成功 `next`，失败 `back`。

### 4.1 五种步骤

| `type` | 作用 | 关键字段 |
| --- | --- | --- |
| `simple` | 执行一次 `requestFunction(context)`，**必须返回 Observable** | `requestFunction` |
| `confirm` | 弹确认框；内容是 **HTML** | `content` |
| `dialog` | 打开弹窗组件 | `content`（组件类）/ `params` / `okText` / `cancelText` / `autoCloseDialog` / `maximize` / `fullHeight` / `width` / `hasFooter` / `closable` / `nullResultEnable` / `dialogBodyStyle` / `key` |
| `http` | 请求 + 成功提示 + 自动刷新 | `requestFunction` / `resultMessage` / `responseFunction` / `autoRefresh` / `loadable` |
| `navigate` | 路由跳转 | `url` |

- 步骤数组**不用自己写 `next`**，`handle()` 会串。
- `simple` 常用 `context.nextFunction(fn)` / `context.nextValue(v)` 返回 Observable。
- `confirm` 点「确定」**立刻关窗**，不等下一步结果（源码里「等请求成功再关」是注释掉的）。
- 步骤机失败时**自己不弹错误**；HTTP 业务错误由平台拦截器弹红字，403 和 `next` 回调里抛异常可能完全静默。排查先看 Network，别先怀疑按钮没绑上。

### 4.2 弹窗步骤：最后一步 vs 中间一步

```ts
steps: [
  { type: 'dialog', content: TaskEditDialogComponent, params: (c) => ({ id: c.id }) },
  { type: 'http', requestFunction: (c) => this.api.update(c.result), resultMessage: '保存成功' }
]
```

- **中间一步**：有「确定」按钮；点确定调 `getResult()`，写入 `context.result`（无 `key`）或 `context.results[key]`（有 `key`），再执行下一步。请求失败时**弹窗留在原地**，供用户修改。
- **最后一步**：只有「关闭」按钮，无「确定」。只读弹窗（详情、报告）放最后。
- 写了 `key` 结果进 `results[key]`，**不会进 `context.result`**；「弹窗 → 下一步 http 用上一步结果」两边必须同 `key`。**优先写对象字面量、不写 `key`**。
- `nullResultEnable`：`getResult()` 返回 `null`/`undefined` 时默认不继续；允许空结果才打开。
- `maximize` / `fullHeight` / `autoCloseDialog` 只能写在 step 上，工厂搬不进去。
- ⚠️ `createCreateToolbarItemX` 内部把 `autoCloseDialog` 设为 `false`：**新建保存成功后弹窗不会自动关**，而是留在原地并刷新。需要「保存即关」时手写 `steps` 并设 `autoCloseDialog: true`（或覆盖工厂产出的 step）。
- `createUpdateToolbarItemX` / `createDeleteToolbarItemX` 未设该字段，按默认 `true`，成功后关窗。

### 4.3 手写 http/confirm（需要工厂没暴露的能力时）

```ts
import { Step } from 'ng-shared';

readonly steps: Step[] = [
  { type: 'confirm', content: '确定要作废该记录吗？' },
  {
    type: 'http',
    requestFunction: (c) => this.api.invalidate({ id: c.id }),
    resultMessage: '作废成功',
    loadable: true,
    autoRefresh: true
  }
];
```

## 5. 弹窗：`DialogComponent` / `EditDialogComponent`

### 5.1 通用弹窗

```ts
import { Component } from '@angular/core';
import { DialogComponent } from 'ng-shared';

@Component({ /* standalone + imports */ })
export class TaskDetailDialogComponent extends DialogComponent {
  readonly task = this.getInputData()?.task;
  // 只读详情：不重写 getResult，放在 steps 最后一步
}
```

- 参数从 `getInputData()` 拿；**里面一定混着 `autoCloseDialog`**，不要假设只有你传的字段。
- 要参与下一步（保存/选择）**必须重写 `getResult()`**；默认返回 `undefined`，中间步骤会被 `nullResultEnable` 挡下。
- `close()` / `handleCancel()` / `handleOk()` 可用。
- **`loadData()` 只在 `next` 复位 loading，失败会永久转圈**。弹窗里自己接错误：

```ts
import { signal } from '@angular/core';
import { catchError, of } from 'rxjs';

readonly task = signal<any>(null);

constructor() {
  this.loadData(this.api.detail(id).pipe(
    catchError(() => {
      this.message.error('加载详情失败，请关闭后重试');
      return of(null);
    })
  )).subscribe(data => this.task.set(data));
}
```

### 5.2 表单弹窗：`EditDialogComponent`

```ts
@Component({ /* standalone + DelonFormModule */ })
export class TaskEditDialogComponent extends EditDialogComponent {
  schema: SFSchema = {
    properties: {
      name: { type: 'string', title: '任务名称', maxLength: 64 },
      enabled: { type: 'boolean', title: '启用', default: true }
    },
    required: ['name']
  };

  override getFormData(id: number) {
    if (id <= 0) {
      return of({});
    }
    return this.api.detail(id).pipe(
      catchError(() => {
        this.message.error('加载详情失败，请关闭后重试');
        return of({});
      })
    );
  }

  override parseResponse(res: any) {
    return res;
  }
}
```

- `id = getInputData()?.id || 0`；`id > 0 || id === -1` 才取详情，否则按新建。
- `getResult()` 校验通过后**自动把 `id` 塞进表单值**（编辑场景请求体不用自己写 `id`）；校验不过返回 `null` 并弹「表单验证未通过」。
- 新建/编辑共用一个弹窗是常态；「复制」这类 `id` 语义不同的场景不要依赖自动补 `id`。

## 6. 图标：`app-icon` 与 `app-iconfont`

```html
<app-icon name="shield-check" />
<app-icon name="refresh-cw" [size]="'14px'" />
<app-icon name="user" title="负责人" />
<app-icon name="user" title="负责人" [hideTitle]="true" />
```

- `name`（必填，lucide kebab-case）、`title`、`hideTitle`、`size`、`color`、`fill`。
- **有 `title` 就自动「图标 + 文字」**；只要图标就 `hideTitle` 或不传 `title`。
- 上色用 `text-*` 类（svg 描边是 `currentColor`）；**不要用 `color`** —— 它会把图标变成实心块并把描边设 0。`fill` 声明了但模板没用，传了没效果。
- `app-iconfont` 用 ng-zorro 图标名或 iconfont class：`<app-iconfont icon="eye" />`、`<app-iconfont icon="icon-xxx" title="查看" />`。
- 工具栏项 `icon` 走 `app-iconfont`，填 ng-zorro 名；页面里 `app-card [icon]` 填 lucide 名。两套不要混。

## 7. 图表：`chart-bar` / `chart-line` / `chart-pie` / `chart-gauge`

```html
<div class="h-80">
  @if (rows().length === 0) {
    <nz-empty nzNotFoundContent="暂无数据" />
  } @else {
    <chart-bar
      [data]="rows()"
      x="month"
      y="count"
      [colors]="barColors"
      xTitle="月份"
      yTitle="数量"
      unit="条" />
  }
</div>
```

- 数据是**长表**（一行一个对象，一个分类字段 + 一个数值字段），不是 `{x,y}` 配对。
- `chart-bar`：`data/x/y/color(分组)/colors/xTitle/yTitle/unit`；`chart-line`：单系列，`data/x/y/xTitle/yTitle/seriesName/unit/color`；`chart-pie`：`data/x/y/colors/unit`；`chart-gauge`：`value`（0–100）。
- `colors` 传 **对象** `{ '通过': 'green', '不通过': 'red' }` 才能语义固定；数组按域值顺序取色。
- **不要改库里的 `CHART_PRIMARY`**（默认 `#0b5790` 是旧宿主主色）；新宿主显式传 `colors` / `color`。
- 图表不画 `@delon/chart` 的 bar/line/gauge（v22 没有），用本库四个组件。
- **空数据时组件沿用旧图**（看起来完全正常）。必须像上面那样在外层判空并盖 `nz-empty`。
- 外层必须有确定高度，且 `angular.json` 拷贝 G2 资源、`provideAlain` 配 `chart.libs`；三条缺一条就是空白画布。

## 8. 其余组件速查

| 选择器 | 用途 | 关键点 |
| --- | --- | --- |
| `app-toolbar` | 独立工具栏 | 输入 `items: ToolbarItemUI[]`（与 `Options.toolbar` 的 `ToolbarItem` 不是同一个类型）；通常由 `app-table` 内部使用，只有自定义页面才直接用 |
| `app-filterx` | 条件筛选器 | 输入 `flatFilters`（`{ filters, fields }`）、`fieldMode: 'id' \| 'name'`、`disableCompare`；输出 `(filterChange)`；`filters`/`fields` 是内部 signal，不是输入 |
| `app-expression` | 统计表达式 | `expressions` / `fields`；输出 `(expressionChange)` |
| `app-data-export` | 导出弹窗 | 继承 `EditDialogComponent`；作为 dialog 步骤使用 |
| `app-common-upload` | 上传弹窗 | 继承 `DialogComponent`；`getInputData()` 支持 `mode: 'temp' \| 'file'`、`suffixList`、`multiple`；结果取上传响应 |
| `app-table-dialog` | 列表选数据弹窗 | `nzData: { options, forceSelected }`；结果单选行 / 多选行数组 |
| `app-dict` | 字典选择 | `list`；输出 `(dictValuesChange)` |
| `sf-dict` / `sf-dictionary` / `sf-expression` / `sf-filter` / `sf-chunk-upload` / `sf-normal-upload` | SF 表单控件 | 在 `SFSchema` 的 `ui.widget` 里用，不直接写标签 |

`app-filterx` / `app-expression` / `app-data-export` 的完整输入输出见 [ng-shared-components.md](ng-shared-components.md) 与源码；不要凭 Ant Design 的 `Filter`/`Expression` 经验猜 API。

## 9. 交付前自检（ng-shared 专项）

- [ ] 列表页用 `app-table`，没有自己拼 `nz-table + nz-pagination`。
- [ ] 单选页的单份操作使用 `[context.id!]`；批量操作才用 `context.ids`，且 `options.multiple: true`。
- [ ] `options.multiple` 与工具栏项 `multiple` 没有被混为一谈。
- [ ] 没有在 http 步骤后再手动 `table.refresh()`。
- [ ] 弹窗参数从 `getInputData()` 取，且没有把 `autoCloseDialog` 当业务字段。
- [ ] 中间弹窗重写了 `getResult()`；只读弹窗放在 `steps` 最后。
- [ ] `EditDialogComponent` 的请求体没有重复拼 `id`。
- [ ] 弹窗内 `loadData` 有 `catchError`，不会永久转圈。
- [ ] `app-icon` 用 lucide 名、`nz-icon`/工具栏用 ng-zorro 名；上色用 `text-*` 而不是 `color`。
- [ ] 图表有外层高度和空态；`colors` 对语义色传对象；没有改 `CHART_PRIMARY`。
- [ ] 没有导入 `@delon/chart` 的 bar/line/gauge 来画图。
