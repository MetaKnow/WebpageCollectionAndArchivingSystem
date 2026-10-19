# NG-ZORRO 落地指南（v22.1.2 / Angular 22）

本文覆盖「在 missoft 项目里把 Ant Design 规范用 NG-ZORRO 实现」的最小闭环：安装、全局配置、主题、布局、表单、表格、反馈、常见坑。
组件精确 API 以 `ng-zorro-components.md` 为准；完整官方说明用 `ng-zorro-llms-full-cn.txt` 检索。

---

## 1. 版本与前置

| 项 | 值 |
| --- | --- |
| NG-ZORRO | `22.1.2`（当前 latest，对应 Angular 22） |
| Angular | `^22.0.0`（NG-ZORRO 主版本与 Angular 同步） |
| 渲染模式 | 支持 Zoneless、OnPush、SSR、Electron |
| 样式 | Less（默认）或 CSS 变量版（实验性） |
| 包体 | npm tarball 约 26MB；按 secondary entry 导入，不要根导入 |

检查项目：

```bash
node -p "require('./package.json').dependencies['@angular/core']"
node -p "require('./package.json').dependencies['ng-zorro-antd']"
```

若版本不是 22.x：先确认项目 Angular 主版本，**不要跨主版本混用 API**；本文的 v22 写法在低版本可能不适用。

---

## 2. 安装与接入

推荐 CLI：

```bash
ng add ng-zorro-antd
```

会完成：安装依赖、在 `angular.json` 加样式、在 `styles.less` 引入主题、注册图标与动画。

手工接入（standalone，`src/main.ts`）：

```ts
import { bootstrapApplication } from '@angular/platform-browser';
import { provideHttpClient } from '@angular/common/http';
import { provideNzI18n, zh_CN } from 'ng-zorro-antd/i18n';
import { provideNzIcons } from 'ng-zorro-antd/icon';
import { provideNzConfig } from 'ng-zorro-antd/core/config';
import {
  PlusOutline, SearchOutline, ReloadOutline, DeleteOutline, ExportOutline,
} from '@ant-design/icons-angular/icons';
import { AppComponent } from './app/app.component';

bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(),
    provideNzI18n(zh_CN),
    provideNzIcons([PlusOutline, SearchOutline, ReloadOutline, DeleteOutline, ExportOutline]),
    provideNzConfig({
      message: { nzTop: 64, nzDuration: 3000 },
      notification: { nzTop: 64 },
      // theme.primaryColor 仅在 CSS 变量版样式下生效；
      // 用 Less 版时改 @primary-color（见 3.1），不要靠这里。
    }),
  ],
});
```

要点：

- `provideNzI18n(zh_CN)` 一次即可；不配会出现英文分页/日期文案。
- 图标默认不打包，**用到才注册**；懒加载路由用 `provideNzIconsPatch([...])` 在路由级增量注册。
- `provideNzConfig` 是全局默认值；`NzConfigService.set` 可运行时改。
- 动画：按当前 Angular 版本提供 `provideAnimations()` 或 `provideAnimationsAsync()`；Angular 22 若已内置动画，按官方迁移说明去掉显式 provider。
- 不要 `import { NzButtonModule } from 'ng-zorro-antd'` 根导入；用 `ng-zorro-antd/button`。

组件内导入：

```ts
import { Component } from '@angular/core';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzSpaceModule } from 'ng-zorro-antd/space';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [NzButtonModule, NzTableModule, NzTagModule, NzSpaceModule],
  templateUrl: './task-list.component.html',
  styleUrl: './task-list.component.less',
})
export class TaskListComponent {}
```

---

## 3. 主题

### 3.1 Less 变量（默认方案）

`src/styles.less`：

```less
@import 'ng-zorro-antd/ng-zorro-antd.less';

// 与 references/ant-design-spec.md 第 6 节保持一致
@primary-color: #1677ff;
@success-color: #52c41a;
@warning-color: #faad14;
@error-color: #ff4d4f;

@text-color: fade(#000, 88%);
@text-color-secondary: fade(#000, 65%);
@heading-color: fade(#000, 88%);
@disabled-color: fade(#000, 25%);

@border-color-base: #d9d9d9;
@border-color-split: #f0f0f0;
@background-color-base: #fafafa;
@component-background: #ffffff;
@layout-body-background: #f5f5f5;

@border-radius-base: 6px;
@border-radius-sm: 4px;
@font-size-base: 14px;
@height-base: 32px;
@line-height-base: 1.5715;
```

`angular.json` 的 `styles` 指向该文件；若用 SCSS，保持一个 `.less` 入口专门给 NG-ZORRO，SCSS 通过 `@import` 引入编译产物或改用 CSS 变量方案。

### 3.2 CSS 变量（实验性）

- 样式入口换成 `ng-zorro-antd.variable.min.css`；
- 全局 `provideNzConfig({ theme: { primaryColor: '#1677ff' } })`；
- 运行时 `configService.set('theme', { primaryColor })`；
- 首屏要在 HTML 上同步主题 class，避免闪烁；
- 自定义前缀：`lessc --modify-var="ant-prefix=custom"` 重新生成。

### 3.3 暗色/紧凑

用 `.themeMixin(@rules)` 包裹组件样式；暗色与紧凑不是简单反色，表格/卡片/边框都要单独校验对比度。

---

## 4. 布局骨架

```html
<nz-layout class="app-shell">
  <nz-sider nzCollapsible [(nzCollapsed)]="collapsed" [nzWidth]="232" [nzCollapsedWidth]="64" nzBreakpoint="lg">
    <div class="brand">Missoft</div>
    <ul nz-menu nzMode="inline">
      <li nz-menu-item nzMatchRouter routerLink="/tasks" routerLinkActive="ant-menu-item-selected">
        <nz-icon nzType="inbox" />
        <span>采集任务</span>
      </li>
      <li nz-menu-item nzMatchRouter routerLink="/archives" routerLinkActive="ant-menu-item-selected">
        <nz-icon nzType="archive" />
        <span>归档管理</span>
      </li>
    </ul>
  </nz-sider>

  <nz-layout>
    <nz-header class="app-header">
      <nz-breadcrumb>
        <nz-breadcrumb-item>采集归档</nz-breadcrumb-item>
        <nz-breadcrumb-item>任务列表</nz-breadcrumb-item>
      </nz-breadcrumb>
      <div class="header-actions">
        <button nz-button nzType="text" aria-label="帮助"><nz-icon nzType="question-circle" /></button>
        <nz-avatar nzText="李" />
      </div>
    </nz-header>

    <nz-content class="app-content">
      <router-outlet />
    </nz-content>
  </nz-layout>
</nz-layout>
```

```less
.app-shell { min-height: 100vh; }
.app-header {
  height: 64px; padding: 0 24px; background: @component-background;
  display: flex; align-items: center; justify-content: space-between;
  border-bottom: 1px solid @border-color-split;
}
.app-content { padding: 24px; background: @layout-body-background; }
```

规则：

- 侧栏 232 / 收起 64；<992px 自动收起（`nzBreakpoint="lg"`）。
- v22 的 `nz-menu` 没有 `nzSelectedKeys` / `nzSelectChange`：选中态用菜单项的 `nzSelected`，或用 `routerLink` + `nzMatchRouter` 自动匹配路由。
- 顶栏 64 高，白底 + 1px 分割线，不加阴影。
- 内容区 24 padding；移动端 16。
- 菜单选中项用浅主色底 + 主色文字（主题自动处理）；不要自己写死。

---

## 5. 表单

### 5.1 Typed Reactive Forms

```ts
import { Component, inject } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzButtonModule } from 'ng-zorro-antd/button';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, NzFormModule, NzInputModule, NzSelectModule, NzButtonModule],
  template: `
    <form nz-form nzLayout="vertical" [formGroup]="form" (ngSubmit)="submit()">
      <nz-form-item>
        <nz-form-label nzRequired nzFor="name">任务名称</nz-form-label>
        <nz-form-control nzErrorTip="请输入 2–64 个字符">
          <input id="name" nz-input formControlName="name" maxlength="64" placeholder="例如：市政府门户 2026-06 归档" />
        </nz-form-control>
      </nz-form-item>

      <nz-form-item>
        <nz-form-label nzRequired nzFor="source">采集来源</nz-form-label>
        <nz-form-control nzErrorTip="请选择来源">
          <nz-select id="source" formControlName="source" nzPlaceHolder="请选择">
            <nz-option nzValue="web" nzLabel="网站" />
            <nz-option nzValue="wechat" nzLabel="微信公众号" />
          </nz-select>
        </nz-form-control>
      </nz-form-item>

      <button nz-button nzType="primary" type="submit" [nzLoading]="saving">保存</button>
      <button nz-button type="button" (click)="cancel()">取消</button>
    </form>
  `,
})
export class TaskFormComponent {
  private readonly fb = inject(NonNullableFormBuilder);
  saving = false;

  readonly form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(64)]],
    source: ['', Validators.required],
  });

  submit(): void {
    if (this.form.invalid) {
      Object.values(this.form.controls).forEach((c) => {
        c.markAsDirty();
        c.updateValueAndValidity({ onlySelf: true });
      });
      return;
    }
    this.saving = true;
    // this.service.create(this.form.getRawValue()).subscribe(...)
  }
}
```

要点：

- `nz-form-control` 没有 `nzErrorTip` 时不会显示错误；错误插槽可用模板。
- 校验时机：`updateOn: 'blur'` 或提交时统一标脏；不要一进页面就飘红。
- 表单里的按钮必须 `type="button"`（取消/次要）或 `type="submit"`（主提交），避免隐式提交。
- label 用 `nzFor` 绑定控件 id；必填加 `nzRequired`。
- 长表单拆卡片分组；底部操作条 `position: sticky; bottom: 0`，白底 + 上边框。
- 离开未保存：`canDeactivate` 守卫 + `NzModalService.confirm`。

### 5.2 查询区

```html
<form nz-form nzLayout="inline" [formGroup]="query">
  <nz-form-item>
    <nz-form-control>
      <input nz-input formControlName="keyword" placeholder="任务名称 / 编号" (keyup.enter)="search()" />
    </nz-form-control>
  </nz-form-item>
  <nz-form-item>
    <nz-form-control>
      <nz-range-picker formControlName="range" />
    </nz-form-control>
  </nz-form-item>
  <nz-form-item>
    <button nz-button nzType="primary" type="button" (click)="search()">查询</button>
    <button nz-button type="button" (click)="reset()">重置</button>
  </nz-form-item>
</form>
```

- 查询项 >4 个时折叠，保留「查询/重置」在首行。
- 查询条件变化必须 `pageIndex = 1`。
- 查询关键词用 `<input nz-input>` + 查询按钮即可；需要回车触发时加 `(keyup.enter)="search()"`。
- `nz-input-search` 在 v22 是包装组件（`nz-input-wrapper` 系列），`formControlName` 要放在它内部的 `<input nz-input>` 上；若同时需要 `nz-form-control` 的错误提示，直接用普通 input 更稳。

---

## 6. 表格（服务端分页标准写法）

```ts
import { DecimalPipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { NzTableModule, NzTableQueryParams } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzEmptyModule } from 'ng-zorro-antd/empty';

interface TaskRow {
  id: string;
  name: string;
  status: 'running' | 'done' | 'failed';
  total: number;
  updatedAt: string;
}

@Component({
  standalone: true,
  imports: [DecimalPipe, NzTableModule, NzTagModule, NzButtonModule, NzEmptyModule],
  template: `
    <nz-table
      #table
      nzSize="middle"
      [nzData]="rows()"
      [nzLoading]="loading()"
      [nzFrontPagination]="false"
      [nzTotal]="total()"
      [nzPageIndex]="pageIndex()"
      [nzPageSize]="pageSize()"
      [nzPageSizeOptions]="[10, 20, 50]"
      [nzShowSizeChanger]="true"
      [nzShowQuickJumper]="true"
      [nzShowTotal]="totalTpl"
      [nzNoResult]="emptyTpl"
      [nzScroll]="{ x: '960px' }"
      (nzQueryParams)="onQuery($event)"
    >
      <thead>
        <tr>
          <th nzWidth="220px">任务名称</th>
          <th nzWidth="120px">状态</th>
          <th nzWidth="120px" nzAlign="right">条目数</th>
          <th nzWidth="180px">更新时间</th>
          <th nzWidth="160px" nzRight="0px">操作</th>
        </tr>
      </thead>
      <tbody>
        @for (row of rows(); track row.id) {
          <tr>
            <td>{{ row.name }}</td>
            <td>
              <nz-tag [nzColor]="row.status === 'done' ? 'success' : row.status === 'failed' ? 'error' : 'processing'">
                {{ row.status === 'done' ? '已完成' : row.status === 'failed' ? '失败' : '采集中' }}
              </nz-tag>
            </td>
            <td nzAlign="right">{{ row.total | number }}</td>
            <td>{{ row.updatedAt }}</td>
            <td nzRight="0px">
              <a nz-button nzType="link" (click)="detail(row)">详情</a>
              <a nz-button nzType="link" nzDanger (click)="remove(row)">删除</a>
            </td>
          </tr>
        }
      </tbody>
    </nz-table>

    <ng-template #totalTpl let-total>共 {{ total }} 条</ng-template>

    <!-- 空态用 nzNoResult 交给表格渲染，避免“暂无数据”和 nz-empty 同时出现 -->
    <ng-template #emptyTpl>
      <nz-empty
        nzNotFoundImage="simple"
        nzNotFoundContent="还没有采集任务"
        [nzNotFoundFooter]="emptyFooter"
      ></nz-empty>
      <ng-template #emptyFooter>
        <button nz-button nzType="primary" (click)="create()">新建任务</button>
      </ng-template>
    </ng-template>
  `,
})
export class TaskListComponent {
  private readonly api = inject(TaskApi);

  readonly rows = signal<TaskRow[]>([]);
  readonly total = signal(0);
  readonly loading = signal(false);
  readonly pageIndex = signal(1);
  readonly pageSize = signal(20);

  // 只监听 nzQueryParams：分页、排序、筛选都会走这里。
  // 不要再同时监听 nzPageIndexChange / nzPageSizeChange，否则会重复请求。
  onQuery(params: NzTableQueryParams): void {
    this.pageIndex.set(params.pageIndex);
    this.pageSize.set(params.pageSize);
    this.load(params.sort, params.filter);
  }

  load(
    sort: NzTableQueryParams['sort'] = [],
    filter: NzTableQueryParams['filter'] = [],
  ): void {
    this.loading.set(true);
    this.api.list({ page: this.pageIndex(), size: this.pageSize(), sort, filter }).subscribe({
      next: (res) => {
        this.rows.set(res.items);
        this.total.set(res.total);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}
```

要点：

- 服务端分页三件套：`[nzFrontPagination]="false"`、`[nzTotal]`、`(nzQueryParams)`；`nzQueryParams` 已包含分页、排序、筛选，**不要再叠加 `nzPageIndexChange`**，否则重复请求。
- `nzQueryParams` 初始化时可能先触发一次；不要在 `ngOnInit` 再调一次 `load()`，否则首屏重复请求。
- `nzData` 用不可变数组（信号 set 新数组）；原地 push 不会触发变更检测。
- 空态不要只靠表格内置「暂无数据」；用 `[nzNoResult]` 模板换成 `nz-empty`（主操作通过 `nzNotFoundFooter` 传入，`nz-empty` 不做默认内容投影）。
- 数字列右对齐并 `| number`；状态用 `nz-tag` + 文案。
- 操作列 `nzRight="0px"` 固定；横向滚动时首列也可固定。
- 批量操作放工具栏，选中项数量实时显示；删除前 `NzModalService.confirm`。
- 列表页加载时不要整页 spinner；局部 `nzLoading` 或骨架屏。

---

## 7. 反馈与弹层

### 7.1 Message / Notification

```ts
private readonly message = inject(NzMessageService);
private readonly notify = inject(NzNotificationService);

this.message.success('已保存');
this.message.error('保存失败，请重试');
this.notify.warning('归档即将到期', '请在 3 天内完成审批');
```

- v22 的 `NzMessageService` / `NzNotificationService` 都是 `providedIn: 'root'`，注入即用；容器由服务动态创建，**没有** `NzMessageModule` 可导入。
- 成功/警告/错误语义严格对应；不要成功也用 error。
- 同一错误不要连续弹 5 条；做去重或汇总。

### 7.2 Modal

模板式：

```html
<nz-modal
  [(nzVisible)]="visible"
  nzTitle="删除采集任务"
  nzOkText="删除"
  nzOkType="primary"
  nzOkDanger
  [nzOkLoading]="deleting"
  (nzOnOk)="confirmDelete()"
  (nzOnCancel)="visible = false"
>
  <ng-container *nzModalContent>
    <p>将删除「{{ target?.name }}」及其 {{ target?.total }} 条归档记录，且不可恢复。</p>
  </ng-container>
</nz-modal>
```

服务式确认：

```ts
this.modal.confirm({
  nzTitle: '删除该任务？',
  nzContent: `将同时删除 ${row.total} 条归档记录，且不可恢复。`,
  nzOkText: '删除',
  nzOkDanger: true,
  nzOnOk: () => this.api.remove(row.id),
});
```

规则：

- 标题写动作，不写「提示」。
- 危险操作 `nzOkDanger`，确认文案包含对象与后果。
- 弹窗内表单 ≤7 字段；更多用抽屉或独立页。
- 关闭前如有未保存内容，拦截并确认。

### 7.3 Drawer

```html
<nz-drawer
  [nzVisible]="open"
  nzTitle="任务详情"
  nzWidth="640"
  (nzOnClose)="open = false"
>
  <ng-container *nzDrawerContent>
    <div class="drawer-body"><!-- 可滚动内容 --></div>
    <div class="drawer-footer">
      <button nz-button type="button" (click)="open = false">关闭</button>
      <button nz-button nzType="primary" type="button" (click)="save()">保存</button>
    </div>
  </ng-container>
</nz-drawer>
```

```less
@import 'ng-zorro-antd/style/themes/default.less';

.drawer-body { height: calc(100vh - 128px); overflow: auto; padding: 24px; }
.drawer-footer {
  position: sticky; bottom: 0; display: flex; justify-content: flex-end; gap: 8px;
  padding: 16px 24px; background: @component-background; border-top: 1px solid @border-color-split;
}
```

---

## 8. 图标

```ts
import { NzIconModule } from 'ng-zorro-antd/icon';
// 静态注册（main.ts）
provideNzIcons([PlusOutline, SearchOutline]);
```

```html
<nz-icon nzType="search" nzTheme="outline" />
<button nz-button nzType="text" aria-label="搜索"><nz-icon nzType="search" /></button>
```

- 默认 `outline`；`fill`/`twotone` 按需。
- 未注册的图标渲染为空白，不报错——这是最常见的「图标不见了」原因。
- 图标按钮必须 `aria-label`；纯装饰图标 `aria-hidden="true"`。
- 加载中可 `[nzSpin]="true"`。

---

## 9. 常见坑

| 现象 | 原因 | 处理 |
| --- | --- | --- |
| 图标空白 | 未注册 | `provideNzIcons` / `provideNzIconsPatch` |
| 分页/日期是英文 | 未配 i18n | `provideNzI18n(zh_CN)` |
| 表单错误不显示 | 缺 `nzErrorTip` 或控件未绑定 | 补插槽 + `formControlName` |
| 点击按钮页面刷新 | 表单内按钮默认 submit | 显式 `type="button"` |
| 表格数据变了不刷新 | 原地修改数组 | 用新数组 set |
| 服务端分页失效 | 仍走前端分页 | `[nzFrontPagination]="false"` + `nzTotal` |
| 弹窗不继承主题 | 服务式弹层在根节点 | 全局 `provideNzConfig`（Less 变量或 CSS 变量） |
| 样式覆盖无效 | 视图封装 | 用公开输入/主题变量，或 `:host ::ng-deep` 限定范围 |
| 构建体积暴涨 | 根路径导入 | 按 `ng-zorro-antd/xxx` 导入 |
| 表格横向滚动错位 | 未设 `nzScroll.x` / 固定列宽度 | 设总宽 + 列宽 + `nzRight` |
| 动画报错 | 缺动画 provider | 按 Angular 版本提供 animations |
| SSR 首屏闪烁 | 主题/尺寸在客户端才算 | 首屏同步 class/尺寸，避免布局抖动 |

---

## 10. 提交前检查

```bash
# 类型检查 + 构建
pnpm exec ng build --configuration development

# 查根导入与硬编码色
grep -rn "from 'ng-zorro-antd'" src/app
grep -rnE "#[0-9a-fA-F]{3,8}" src/app --include=*.html --include=*.less
```

- [ ] 所有组件按 secondary entry 导入。
- [ ] 主题覆盖集中在一个 less 文件，页面无 hex。
- [ ] 表格/表单/弹层三类的 loading、empty、error、disabled 都有。
- [ ] 图标已注册且有 aria-label。
- [ ] 键盘可完成主流程，焦点可见。
