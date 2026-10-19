---
name: missoft-frontend-design
description: 为 missoft / 网页采集归档类 Angular 中后台项目做前端设计与实现时使用。优先使用私有 ng-shared 组件库（app-table / StepHandler / 弹窗 / 图表），遵循 Ant Design 设计规范，用 NG-ZORRO 落地，ui-ux-pro-max 仅在缺口时兜底。触发词：前端设计、页面设计、后台界面、Angular 页面、NG-ZORRO、ng-shared、app-table、Ant Design、管理后台、列表页、详情页、表单页、弹窗、抽屉、原型设计、UI 评审。
---

# Missoft 前端设计

把「业务需求」翻译成「ng-shared + NG-ZORRO 的 Angular 页面」，并用 Ant Design 规范约束视觉与交互。

## 0. 30 秒决策

| 情况 | 动作 |
| --- | --- |
| 新建/改一个后台页面 | 先读本文第 4 节，列表页优先 `app-table` |
| 不确定用哪个组件 | 先查 `references/ng-shared-components.md`，再查 `ng-zorro-components.md` |
| 要写列表/工具栏/弹窗/图表 | 必读 `references/ng-shared-patterns.md` |
| 项目里没有 ng-shared 注册表 | 按第 3 节扫描；不要凭记忆写组件 |
| 只是问设计原则/规范 | 读 `references/ant-design-spec.md` |
| 需要页面骨架/布局范式 | 读 `references/page-patterns.md` |
| 1–3 层都覆盖不了 | 才加载 `ui-ux-pro-max`，且必须转译回本规范（第 8 节） |

## 1. 优先级铁律

从高到低，**不得跳级**：

1. **ng-shared**（真实私有库，事实来源=注册表 + `public-api.ts` + 源码 `docs/`）
   - 列表/工具栏/分页/勾选用 `app-table`；工具栏按钮用 `StepHandler`/工厂；弹窗继承 `DialogComponent`/`EditDialogComponent`；图标用 `app-icon`；图表用 `chart-*`。
   - 注册表里没有的 selector / `@Input` / `@Output`，**一律视为不存在**，禁止猜。
2. **Ant Design 设计规范**（视觉与交互的裁决者）
   - 颜色、字号、间距、圆角、阴影、动效、状态、文案语气都以它为准。
   - 与 NG-ZORRO 默认值冲突时，改主题 token，不改设计规范。
3. **NG-ZORRO**（原子实现）
   - 库没有合适的页面级组件时，用 `nz-*` 原子组件拼；API 以 `ng-zorro-components.md` 与 llms 全文为准。
4. **ui-ux-pro-max**（兜底）
   - 只在前三层确实无解时使用；产出必须翻译成 AntD token + NG-ZORRO 原子组件，不得引入第二套 UI 框架。

### 冲突裁决

- ng-shared 的**业务行为/数据结构**优先；AntD 的**视觉语言**优先。库组件样式不满足规范时，优先用库暴露的输入/主题变量，其次业务侧薄封装，最后局部覆盖并记录原因。
- AntD 规范 vs NG-ZORRO 默认：**规范赢**。用 Less 变量或 CSS 变量在主题层统一改，禁止每页写 `::ng-deep` 补丁。
- 规范之间矛盾时选「更确定、更易读、更少惊喜」的方案。

### 硬禁止

- 禁止编造组件：**没有 `ms-table`、`ms-button`**；本库真实前缀是 `app-`、`chart-`、`cell-widget-`、`sf-`。
- 禁止写错包名：npm 包是 **`ng-shared`**（无 scope），不是 `@missoft/ng-shared`。
- 禁止引入第二套 UI 体系（Tailwind UI / Bootstrap / Material / Element / Vant…），除非项目已有且用户明确同意。
- 禁止在模板/样式里硬编码十六进制色值；用主题变量或语义 token。
- 禁止 16px 正文基准；后台正文是 **14px**。
- 禁止一屏出现两个以上 primary 实心按钮。
- 禁止用低对比彩色文字表达状态；用浅色底 + 图标 + 文字。
- 禁止省略 loading / empty / error / disabled / 无权限状态。
- 禁止用 `div` 模拟 button/select/checkbox；用真实语义元素或库组件。
- 禁止自造 `cubic-bezier`；只用命名缓动。
- 禁止全局覆盖 `.ant-*` 内部类名；主题变量解决不了时，范围限定到组件宿主并写注释。

## 2. 开工侦察（必做，30 秒）

```bash
# 1) 技术栈与版本（ng-shared 要求 Angular 精确 22.1.6）
node -p "require('./package.json').dependencies?.['@angular/core']"
node -p "require('./package.json').dependencies?.['ng-zorro-antd']"
node -p "require('./package.json').dependencies?.['ng-shared']"

# 2) ng-shared 是否已安装/已扫描
ls node_modules/ng-shared 2>/dev/null
ls doc/design/ng-shared-registry.md 2>/dev/null

# 3) 项目既有约定
ls AGENTS.md doc/design 2>/dev/null
```

判定：

| 侦察结果 | 下一步 |
| --- | --- |
| 已有注册表 | 直接读它；与 `references/ng-shared-components.md` 对照，以项目实际版本为准 |
| 有安装包/源码，无注册表 | 按第 3 节扫描，提交到 `doc/design/` |
| 无 ng-shared 且无源码 | 询问用户源码/zip/构建产物；**不要假装它存在**。可先用 NG-ZORRO 基线实现，并在 `doc/design/DECISIONS.md` 标记 `ng-shared pending` |
| Angular 版本不是 22.1.6 | 先停下确认：本库的 signal input brand 类型跨 patch 不兼容，不能强装 |
| 非 Angular 项目（静态原型） | 见 `page-patterns.md` 第 10 节，不要硬套 Angular 代码 |

同时确认：包管理器（pnpm/npm/yarn）、是否 standalone、是否有设计 token 文件、是否已有布局壳组件。**不要绕过项目既有布局另起一套。**

## 3. 生成 ng-shared 注册表

本机源码默认在 `/Users/leckie/002开发项目/ng-shared/ng-shared-master`（由 `ng-shared-master.zip` 解出）；路径不同就改 `--root` 或设 `NG_SHARED_ROOT`，不要写死。

```bash
# 源码模式（信息最全）
node .dsh/skills/missoft-frontend-design/scripts/scan-ng-shared.mjs \
  --root "/Users/leckie/002开发项目/ng-shared/ng-shared-master" \
  --out doc/design/ng-shared-registry.md \
  --json doc/design/ng-shared-registry.json

# 只有构建产物（.d.ts）
node .dsh/skills/missoft-frontend-design/scripts/scan-ng-shared.mjs \
  --root node_modules/ng-shared --include-dts \
  --out doc/design/ng-shared-registry.md
```

脚本解析 `@Component/@Directive`、`@Input/@Output`（含 setter/别名）、signal `input()/output()/model()`（含嵌套泛型）、Ivy `d.ts`，输出 selector、类名、输入输出、`file:line`。当前库为 **31 条声明（组件 28 / 指令 3）**；抽象基类会标 `Directive · abstract`，不能实例化。

退出码：`0` 成功，`2` 找不到根目录，`3` 没解析到声明。详细协议、构建、阻断处理见 `references/ng-shared-integration.md`。

## 4. 组件选型流程

按顺序，命中即停：

1. **注册表精确匹配**：按业务语义搜 selector/类名/`file` 路径（「表格」「工具栏」「弹窗」「上传」「图表」）。
2. **注册表组合**：如 `app-left-right-layout`（左树右表）+ `app-table` + `app-card`。
3. **NG-ZORRO 原子组件**：查 `references/ng-zorro-components.md` 的「按任务找组件」表。
4. **NG-ZORRO 组合**：如 `nz-card` + `nz-descriptions` + `nz-tabs` 拼详情页。
5. **ui-ux-pro-max 兜底**：仍无解才加载；产出落成 token/组件，不得引入新框架。

选中后必须回到源码 `file:line` 确认：selector 形态、输入别名、输出事件名、内容投影/模板输入、样式封装、依赖的 ng-zorro 模块。

### 业务 → 组件速查

| 需求 | 首选 | 说明 |
| --- | --- | --- |
| 应用骨架 | `nz-layout` + `nz-sider` + `nz-header` + `nz-content` | 侧栏可折叠，<992px 自动收起 |
| 左树右表 | `app-left-right-layout` + `app-table` | 内容槽 `[name='left']` / `[name='right']` |
| 数据列表 | **`app-table`** | 分页/排序/筛选/勾选/工具栏/空态一体；不要自己拼 `nz-table + nz-pagination` |
| 查询条件 | `app-table` 的表头筛选，或 `nz-form[nzLayout="inline"]` + `input[nz-input]` | 超过 4 项折叠；回车触发查询 |
| 新建/编辑 | `EditDialogComponent` + `SFSchema` | 弹窗保存失败会留在原地 |
| 只读详情弹窗 | `DialogComponent`，放 `steps` 最后一步 | 只有「关闭」按钮 |
| 选择数据弹窗 | `app-table-dialog` | `nzData: { options, forceSelected }` |
| 上传 | `app-common-upload` | `mode: 'temp' \| 'file'`、`suffixList`、`multiple` |
| 导出 | `app-data-export` | 继承 `EditDialogComponent` |
| 业务图标 | `app-icon`（lucide 名） | 上色用 `text-*`，不要用 `color` |
| 通用图标 | `nz-icon` / `app-iconfont`（ng-zorro 名） | 两套命名空间独立 |
| 图表 | `chart-bar` / `chart-line` / `chart-pie` / `chart-gauge` | 长表数据；外层必须有高度+空态 |
| 轻量确认 | `NzModalService.confirm()` 或 `confirm` 步骤 | 内容走 HTML，不是 markdown |
| 全局反馈 | `NzMessageService` | 成功/失败 3s 自动消失 |
| 空/异常 | `nz-empty` / `nz-result` | 必须给下一步动作；图表空态自己判 |

## 5. 设计规范速查

完整版见 `references/ant-design-spec.md`。实现时至少守住：

| 维度 | 规则 |
| --- | --- |
| 主色 | `#1677FF`；hover `#4096FF`；active `#0958D9`；浅底 `#E6F4FF` |
| 语义色 | success `#52C41A` / warning `#FAAD14` / error `#FF4D4F`；浅底分别为 `#F6FFED` `#FFFBE6` `#FFF2F0` |
| 文字 | 主 `rgba(0,0,0,.88)`；次 `.65`；三级 `.45`；禁用 `.25` |
| 表面 | 页面底 `#F5F5F5`；卡片 `#FFFFFF`；浮层 `#FFFFFF` + 阴影 |
| 字号 | 正文 14/22；辅助 12；卡片标题 16/24；页面标题 20/28；大标题 24/32 |
| 字重 | 只用 400 / 600 |
| 间距 | 4px 网格：4 / 8 / 12 / 16 / 24 / 32 / 48 |
| 圆角 | 控件 6；卡片/弹窗/抽屉 8；标签 4；胶囊仅头像/圆点 |
| 控件高 | 默认 32；小 24；大 40 |
| 阴影 | flat-first；只有真正浮起的层才加阴影 |
| 动效 | 状态 0.1s；组件内部 0.2s；页面级 0.3s；只用命名缓动 |
| 焦点 | 键盘可见焦点环，不允许 `outline: none` 无替代 |

**布局基线**：页面内容区左右 24px、上下 24px；卡片内边距 24px；卡片间距 16px；表单项纵向间距 24px；按钮组间距 8px。移动端内容区 16px。

## 6. NG-ZORRO 落地（原子层）

完整版见 `references/ng-zorro-guide.md`，API 索引见 `references/ng-zorro-components.md`，原文见 `references/ng-zorro-llms-full-cn.txt`。

最低要求：

```ts
import { Component } from '@angular/core';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzTableModule } from 'ng-zorro-antd/table';
```

- standalone 组件逐个导入所需模块；不要从 `ng-zorro-antd` 根路径整体导入。
- 全局只配一次：`provideNzI18n(zh_CN)`、`provideNzConfig(...)`、`provideNzIcons([...])`；懒加载模块用 `provideNzIconsPatch`。
- 主题在 `styles.less` 用 Less 变量统一覆盖（`@primary-color`、`@border-radius-base` 等），不要在页面里散落覆盖。
- **有 ng-shared 时列表页用 `app-table`**；只有库不可用或做纯原子页面时才用原生 `nz-table` + `nzFrontPagination=false` + `(nzQueryParams)`。
- 表单用 Typed Reactive Forms；`nz-form-control` 配 `nzErrorTip` 才会显示校验信息。
- 表单里的按钮显式写 `type="button"`，避免触发提交。
- 图标必须注册，否则渲染空白。
- 服务式 `NzMessageService` / `NzModalService` 的弹层不继承局部主题，需要全局 `provideNzConfig` 或主题变量。

## 7. 页面类型 → 范式

详细骨架与代码见 `references/page-patterns.md`；ng-shared 组合见 `references/ng-shared-patterns.md`。

| 页面类型 | 关键结构 | 常见错误 |
| --- | --- | --- |
| 列表页 | `app-table`（工具栏+表格+分页一体）+ 页面头 | 自己拼 `nz-table + nz-pagination`；单选页用 `context.ids` |
| 左树右表 | `app-left-right-layout` + `app-table` | 槽名写错（必须 `[name='left']` / `[name='right']`） |
| 详情页 | 页头（返回/标题/操作）+ `nz-descriptions`/`app-card` + 分组 Tab | 字段堆成一张大表，无层级 |
| 表单页 | `nz-form` 分组卡片 + 吸底操作条 | 校验失败无汇总；离开不提示 |
| 弹窗表单 | `EditDialogComponent` + `SFSchema` | 弹窗里再套弹窗；宽度过大 |
| 抽屉 | 头部 + 可滚动主体 + 吸底操作 | 内容超长无滚动区 |
| 仪表盘 | `app-card` + `chart-*` + 近期列表 | 图表无单位/时间范围/空态 |
| 结果/异常 | `nz-result` + 主次操作 | 只显示错误码，无解决动作 |

## 8. 兜底协议（ui-ux-pro-max）

只有同时满足才允许加载：

1. ng-shared 注册表无可用组件；
2. NG-ZORRO 原子组件组合也无法满足交互/布局；
3. 已确认不是「没查到」而是「确实没有」。

使用规则：

- 只取它的**布局思路、视觉层级、交互模式**，不取它的技术栈与配色体系。
- 所有颜色/字号/间距映射回 AntD token；所有控件落成 NG-ZORRO 组件或原生语义元素。
- 在 `doc/design/DECISIONS.md` 写一条 ADR：问题、尝试过的 1–3 层方案、为何不足、兜底产出、偏离项。
- 不得因为它建议而新增 UI 依赖。

## 9. 交付自检（Definition of Done）

实现完成前逐条打勾：

### 通用

- [ ] 页面主操作唯一且明确；次操作是 default/text。
- [ ] 所有异步区有 loading；列表有空态；请求失败有可重试的错误态。
- [ ] 无权限/禁用状态可见且有原因提示（tooltip 或说明文案）。
- [ ] 表单：必填标记、校验时机、错误文案、提交中禁用、成功/失败反馈齐全。
- [ ] 列表：分页/排序/筛选与后端参数一致；查询变更重置到第 1 页。
- [ ] 删除/批量等破坏性操作有二次确认，文案写清对象与后果。
- [ ] 键盘可完成主流程；焦点可见；图标按钮有 `aria-label`。
- [ ] 颜色全部来自 token/变量；无硬编码 hex；无 `::ng-deep` 滥用。
- [ ] 响应式：<992px 侧栏收起；表格横向滚动；<576px 表单转纵向。
- [ ] 文案：中文、动词开头、按钮 2–4 字；日期 `YYYY-MM-DD HH:mm`；空态说清下一步。
- [ ] 数字：千分位、单位、精度一致；统计口径有说明。
- [ ] 已运行项目 lint/build；无新增 console 报错。
- [ ] 偏离规范处已记录在 `doc/design/DECISIONS.md`。

### ng-shared 专项

- [ ] 列表页用 `app-table`；单选页单份操作用 `[context.id!]`，批量才用 `context.ids` 且 `options.multiple: true`。
- [ ] 没有在 `http` 步骤后再手动 `table.refresh()`。
- [ ] 弹窗从 `getInputData()` 取参；中间弹窗重写了 `getResult()`；只读弹窗在 `steps` 最后。
- [ ] 弹窗内 `loadData` 有 `catchError`，不会永久转圈。
- [ ] `app-icon` 用 lucide 名，`nz-icon`/工具栏用 ng-zorro 名；上色用 `text-*`。
- [ ] 图表有外层高度和空态；语义色用对象 `colors`；没有改 `CHART_PRIMARY`。

## 10. 反模式

| 反模式 | 后果 | 正确做法 |
| --- | --- | --- |
| 凭记忆写 `ms-xxx` / `app-xxx` 组件 | 编译失败/行为不符 | 查注册表；查不到就问 |
| 用 `@missoft/ng-shared` 安装 | 包不存在 | 用 `ng-shared` + `file:.../dist` |
| 自己拼 `nz-table + nz-pagination` | 重复实现工具栏/分页/勾选 | 用 `app-table` |
| 单选页读 `context.ids` | 请求体 `{}`，后端报缺少 ids | 用 `[context.id!]`，批量才 `ids` |
| 用 AntD 文档的 React API 直接套 | NG-ZORRO 参数名不同 | 查 `ng-zorro-components.md` |
| 每个页面覆盖 `.ant-table` 样式 | 全局漂移、升级困难 | 主题变量或业务侧封装 |
| 查询条件变化不重置页码 | 空页/错页 | `pageIndex = 1` 后请求 |
| 弹窗里放整页表单 | 信息过载 | 改用抽屉或独立页 |
| 成功也用红色 toast | 语义混乱 | 成功绿/中性，失败红 |
| 空表只写「暂无数据」 | 用户不知道下一步 | 空态 + 主操作按钮 |
| 图表不判空 | 筛选为空仍显示上一次的图 | 外层 `@if (data.length === 0) { <nz-empty /> }` |
| `app-icon` 用 `color` 上色 | 图标变实心块 | 用 `text-red-600` 等类 |
| 引入 Tailwind 快速搭页面 | 两套体系冲突 | 用 NG-ZORRO + 少量布局 CSS |

## 11. 参考文件路由

| 文件 | 何时读 | 内容 |
| --- | --- | --- |
| `references/ng-shared-components.md` | 查 ng-shared 的 selector / 输入输出 / 来源 | 31 条声明（组件 28 / 指令 3），自动生成 |
| `references/ng-shared-patterns.md` | 写列表页/工具栏/弹窗/图标/图表 | app-table 契约、StepHandler、Dialog、图表、空态与坑 |
| `references/ng-shared-integration.md` | 获取/构建/接入/升级私有库 | 真实路径、版本、扫描命令、阻断协议 |
| `references/ant-design-spec.md` | 定颜色/字号/间距/状态/组件规范 | AntD 官方规范（design.md）浓缩 + NG-ZORRO 变量映射 |
| `references/ng-zorro-guide.md` | 搭工程、配主题、写表单/表格/弹层 | 安装、Provider、主题、范式、坑 |
| `references/ng-zorro-components.md` | 查 nz-* selector / 模块 / 输入输出 | 287 条公开声明索引（v22.1.2） |
| `references/page-patterns.md` | 需要页面骨架与代码模板 | 8 类页面 + 响应式 + 可访问性 + 静态原型 |
| `references/ng-zorro-llms-full-cn.txt` | 需要组件完整示例/属性说明 | 官方 77 组件全文（约 526KB），用 grep 查 |

## 12. 常用命令

```bash
# 生成/更新 ng-shared 注册表（源码模式）
node .dsh/skills/missoft-frontend-design/scripts/scan-ng-shared.mjs \
  --root "/Users/leckie/002开发项目/ng-shared/ng-shared-master" \
  --out doc/design/ng-shared-registry.md

# 检查注册表里的 app-table / 图表
grep -nE "app-table|chart-" .dsh/skills/missoft-frontend-design/references/ng-shared-components.md

# 查 NG-ZORRO 组件
grep -n "nz-table" .dsh/skills/missoft-frontend-design/references/ng-zorro-llms-full-cn.txt | head
grep -n "NzTableComponent" .dsh/skills/missoft-frontend-design/references/ng-zorro-components.md

# 检查硬编码色值（示例）
grep -rnE "#[0-9a-fA-F]{3,8}" src/app --include=*.html --include=*.less --include=*.scss
```

---

**一句话总结**：列表页先 `app-table`，弹窗先 `DialogComponent`，图标先 `app-icon`，图表先 `chart-*`；按 AntD 规范设计，用 NG-ZORRO 补原子；查不到就不写，兜底要留痕。
