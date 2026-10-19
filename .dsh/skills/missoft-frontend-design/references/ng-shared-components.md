# ng-shared 组件注册表（自动生成）

> 本文件由脚本从 **本地源码/构建产物** 生成，是 `ng-shared` 组件事实的唯一来源。
> 表中不存在的 selector、输入输出，**不得臆造**；需要新能力时先查源码或找库维护者确认。

| 项 | 值 |
| --- | --- |
| 生成时间 | 2026-10-17T07:17:59.535Z |
| 源码根 | `/Users/leckie/002开发项目/ng-shared/ng-shared-master` |
| 包 | `ng-shared@0.0.1` |
| peerDependencies | `@antv/g2: ^5.4.8`<br>`@lucide/angular: ^1.45.0`<br>`date-fns: ^4.4.0`<br>`rxjs: ~7.8.0`<br>`spark-md5: ^3.0.0` |
| 声明数 | 31（组件 28 / 指令 3） |
| 服务数 | 9 |
| 生成命令 | `node .dsh/skills/missoft-frontend-design/scripts/scan-ng-shared.mjs --root /Users/leckie/002开发项目/ng-shared/ng-shared-master --out .dsh/skills/missoft-frontend-design/references/ng-shared-components.md` |

## 怎么用这张表

1. 先按**业务语义**找组件（页面骨架、查询区、表格、表单、上传、树、审批流……），不要按 Ant Design 的名字硬套。
2. `inputs` / `outputs` 中 `foo as bar` 表示类属性 `foo`、模板别名 `bar`；模板里写 `[bar]` / `(barChange)`。
3. 选中组件后，必须打开 `file:line` 看真实实现与模板，确认插槽（`ng-content`/模板输入）和样式约束。
4. 表里没有的能力：先用 NG-ZORRO 原子组件组合；仍不满足再走 ui-ux-pro-max 兜底，并记录偏离。

> ⚠️ 数据完整性问题：存在无 selector 的组件声明。

## 目录分布

| 分组 | 组件 | 指令 |
| --- | ---: | ---: |
| cell-widget | 5 | 0 |
| components | 15 | 3 |
| json-schema | 8 | 0 |

## cell-widget

| Selector | Class | 类型 | Inputs | Outputs | 来源 |
| --- | --- | --- | --- | --- | --- |
| `cell-widget-avatar` | `AvatarCellWidget` | Component | - | - | `src/lib/cell-widget/avatar/avatar.widget.ts:9` |
| `cell-widget-color` | `ColorCellWidget` | Component | - | - | `src/lib/cell-widget/color/color.widget.ts:5` |
| `cell-widget-filesize` | `FileSizeCellWidget` | Component | - | - | `src/lib/cell-widget/filesize/filesize.widget.ts:6` |
| `cell-widget-icons` | `IconsCellWidget` | Component | - | - | `src/lib/cell-widget/icons/icons.widget.ts:7` |
| `cell-widget-tags` | `TagsCellWidget` | Component | - | - | `src/lib/cell-widget/tags/tags.widget.ts:6` |

## components

| Selector | Class | 类型 | Inputs | Outputs | 来源 |
| --- | --- | --- | --- | --- | --- |
| `(no selector)` | `BaseComponent` | Directive · abstract | - | - | `src/lib/components/base/base.component.ts:7` |
| `(no selector)` | `DialogComponent` | Directive · abstract | - | - | `src/lib/components/dialog/dialog.component.ts:7` |
| `(no selector)` | `EditDialogComponent` | Directive · abstract | - | - | `src/lib/components/dialog/edit-dialog.component.ts:7` |
| `app-card` | `CardComponent` | Component | `icon`<br>`title`<br>`loading`<br>`bordered`<br>`cardContentClass`<br>`bodyStyle`<br>`refreshable`<br>`hoverable`<br>`bodyCenter`<br>`titleDivider`<br>`bodyXCenter`<br>`bodyYCenter`<br>`mode`<br>`autoFit`<br>`noPadding` | `refresh` | `src/lib/components/card/card.component.ts:9` |
| `app-common-upload` | `CommonUploadDialogComponent` | Component | - | - | `src/lib/components/common-upload/common-upload.component.ts:7` |
| `app-data-export` | `DataExportDialogComponent` | Component · standalone | - | - | `src/lib/components/export/export.component.ts:7` |
| `app-expression` | `ExpressionComponent` | Component | `expressions`<br>`fields` | `expressionChange` | `src/lib/components/expression/expression.component.ts:9` |
| `app-filterx` | `FilterXComponent` | Component | `disableCompare`<br>`fieldMode`<br>`flatFilters` | `filterChange` | `src/lib/components/filter/filter.component.ts:16` |
| `app-icon` | `IconComponent` | Component | `name`<br>`title`<br>`hideTitle`<br>`size`<br>`color`<br>`fill` | - | `src/lib/components/iconfont/icon.component.ts:6` |
| `app-iconfont` | `IconFontComponent` | Component | `icon`<br>`title`<br>`hideTitle` | - | `src/lib/components/iconfont/iconfont.component.ts:6` |
| `app-left-right-layout` | `LeftRightLayoutComponent` | Component | `leftLoading`<br>`rightLoading`<br>`mode`<br>`nocard`<br>`col` | - | `src/lib/components/left-right-layout/left-right-layout.component.ts:7` |
| `app-table` | `TableComponent` | Component | `options` | - | `src/lib/components/table/table.component.ts:58` |
| `app-table-dialog` | `TableDialogComponent` | Component | - | - | `src/lib/components/dialog/table-dialog.component.ts:7` |
| `app-toolbar` | `ToolbarComponent` | Component | `items`<br>`loading`<br>`visible`<br>`toolbarMode`<br>`searchable`<br>`keyword`<br>`refreshable`<br>`resetable`<br>`content` | `search`<br>`refresh`<br>`reset`<br>`keywordChange` | `src/lib/components/toolbar/toolbar.component.ts:32` |
| `chart-bar` | `ChartBarComponent` | Component · standalone | `data`<br>`x`<br>`y`<br>`color`<br>`colors`<br>`xTitle`<br>`yTitle`<br>`unit` | - | `src/lib/components/charts/chart-bar.component.ts:15` |
| `chart-gauge` | `ChartGaugeComponent` | Component · standalone | `value` | - | `src/lib/components/charts/chart-gauge.component.ts:17` |
| `chart-line` | `ChartLineComponent` | Component · standalone | `data`<br>`x`<br>`y`<br>`xTitle`<br>`yTitle`<br>`seriesName`<br>`unit`<br>`color` | - | `src/lib/components/charts/chart-line.component.ts:15` |
| `chart-pie` | `ChartPieComponent` | Component · standalone | `data`<br>`x`<br>`y`<br>`colors`<br>`unit` | - | `src/lib/components/charts/chart-pie.component.ts:15` |

## json-schema

| Selector | Class | 类型 | Inputs | Outputs | 来源 |
| --- | --- | --- | --- | --- | --- |
| `(no selector)` | `PasswordWidget` | Component | - | - | `src/lib/json-schema/password-widget.component.ts:8` |
| `app-dict` | `DictComponent` | Component | `list` | `dictValuesChange` | `src/lib/json-schema/dict/dict.component.ts:10` |
| `sf-chunk-upload` | `ChunkUploadWidget` | Component | - | - | `src/lib/json-schema/chunk-upload/chunk-upload-widget.component.ts:66` |
| `sf-dict` | `DictWidget` | Component | - | - | `src/lib/json-schema/dict/dict-widget.ts:6` |
| `sf-dictionary` | `DictionaryWidget` | Component | - | - | `src/lib/json-schema/dictionary-widget.component.ts:9` |
| `sf-expression` | `ExpressionWidget` | Component | - | - | `src/lib/json-schema/expressions-widget.ts:7` |
| `sf-filter` | `FilterWidget` | Component | - | - | `src/lib/json-schema/filters-widget.ts:7` |
| `sf-normal-upload` | `NormalUploadWidget` | Component | - | - | `src/lib/json-schema/normal-upload-widget.component.ts:11` |

## 服务

| Class | providedIn | 来源 |
| --- | --- | --- |
| `DialogService` | `root` | `src/lib/services/dialog.service.ts:5` |
| `DirtyHelper` | `root` | `src/lib/services/dirty-helper.ts:8` |
| `DynamicFormHelper` | `root` | `src/lib/services/dynamic-form-helper.ts:32` |
| `LoadingService` | `root` | `src/lib/services/loading.service.ts:4` |
| `ReuseRouterService` | `root` | `src/lib/services/reuse-router.service.ts:4` |
| `RouterHelper` | `root` | `src/lib/services/router-helper.ts:4` |
| `RouterService` | `root` | `src/lib/services/router.service.ts:6` |
| `SimpleReuseStrategy` | `root` | `src/lib/services/simple-reuse-strategy.ts:6` |
| `StepHandler` | `root` | `src/lib/services/step-handler.ts:77` |

## 公共入口导出

来源：`src/public-api.ts`

```ts
export * from './lib/components/base/base.component';
export * from './lib/components/card/card.component';
export * from './lib/components/iconfont/icon.component';
export * from './lib/components/iconfont/iconfont.component';
export * from './lib/components/dialog/dialog.component';
export * from './lib/components/dialog/edit-dialog.component';
export * from './lib/components/dialog/table-dialog.component';
export * from './lib/components/left-right-layout/left-right-layout.component';
export * from './lib/components/expression/expression.component';
export * from './lib/components/toolbar/toolbar.component';
export * from './lib/components/export/export.component';
export * from './lib/components/filter/filter.component';
export * from './lib/components/table/table.component';
export * from './lib/components/table/public';
export * from './lib/components/charts/chart-bar.component';
export * from './lib/components/charts/chart-gauge.component';
export * from './lib/components/charts/chart-line.component';
export * from './lib/components/charts/chart-pie.component';
export * from './lib/components/charts/chart-colors';
export * from './lib/components/common-upload/common-upload.component';
export * from './lib/utils/utils';
export * from './lib/utils/dom-utils';
export * from './lib/pipes/format-count.pipe';
export * from './lib/cell-widget/index';
export * from './lib/services/dialog.service';
export * from './lib/services/step-handler';
export * from './lib/services/router-helper';
export * from './lib/services/api-tokens';
export * from './lib/services/dirty-helper';
export * from './lib/services/dynamic-form-helper';
export * from './lib/services/dynamic-table-helper';
export * from './lib/services/loading.service';
export * from './lib/services/reuse-router.service';
export * from './lib/services/router.service';
export * from './lib/services/simple-reuse-strategy';
export * from './lib/json-schema/index';
```

---

### 维护

```bash
# 源码更新后重新生成（推荐输出到项目文档目录）
node .dsh/skills/missoft-frontend-design/scripts/scan-ng-shared.mjs --root /Users/leckie/002开发项目/ng-shared/ng-shared-master --out .dsh/skills/missoft-frontend-design/references/ng-shared-components.md
```