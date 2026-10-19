# Ant Design 设计规范（missoft 版）

来源：Ant Design 官方 `design.md`（https://ant-design.antgroup.com/docs/react/for-agents-cn 指向的机器可读规范，文件标注 version: alpha）与 NG-ZORRO v22.1.2 默认主题变量。
用途：本项目所有页面视觉与交互的**裁决基准**。NG-ZORRO 是执行层，默认值与本规范不一致处，以本文件为准并在主题层覆盖。

---

## 1. 设计价值观

| 原则 | 含义 | 落地检查 |
| --- | --- | --- |
| Natural 自然 | 沿用用户已知的约定，不为了「新」而改变操作位置 | 主操作在右下/右上？返回在左上？符合后台直觉？ |
| Certain 确定 | 每个状态都明确：hover / focus / active / disabled / loading / error | 用户能否一眼看出「能不能点、点了会怎样」？ |
| Meaningful 有意义 | 强调只给真正重要的行动；颜色只表达语义 | 一屏是否只有一个 primary？红色是否只用于危险？ |
| Growing 生长 | 从简单表单长到密集表格、多租户后台仍成立 | 信息密度增加后层级是否还清楚？ |

---

## 2. Design Tokens

### 2.1 颜色

| 语义 | 值 | 用途 |
| --- | --- | --- |
| primary | `#1677FF` | 主操作、选中、链接、进度 |
| primary-hover | `#4096FF` | hover |
| primary-active | `#0958D9` | 按下 |
| primary-bg | `#E6F4FF` | 选中行/菜单项浅底 |
| primary-border | `#91CAFF` | 选中描边、聚焦弱边 |
| success | `#52C41A` | 成功、完成、在线 |
| success-bg / border | `#F6FFED` / `#B7EB8F` | 成功提示底/边 |
| warning | `#FAAD14` | 待处理、风险、即将到期 |
| warning-bg / border | `#FFFBE6` / `#FFE58F` | 警告提示底/边 |
| error | `#FF4D4F` | 失败、删除、严重错误 |
| error-bg / border | `#FFF2F0` / `#FFCCC7` | 错误提示底/边 |
| info | `#1677FF` | 中性信息提示（与 primary 同源） |
| surface | `#FFFFFF` | 卡片、弹窗、输入框 |
| surface-container | `#FAFAFA` | 表头、次级容器、hover 底 |
| surface-layout | `#F5F5F5` | 页面背景 |
| text-primary | `rgba(0,0,0,0.88)` ≈ `#1F1F1F` | 正文、标题 |
| text-secondary | `rgba(0,0,0,0.65)` ≈ `#595959` | 辅助说明、标签 |
| text-tertiary | `rgba(0,0,0,0.45)` ≈ `#8C8C8C` | 占位说明、弱提示 |
| text-disabled | `rgba(0,0,0,0.25)` ≈ `#BFBFBF` | 禁用、placeholder |
| border | `#D9D9D9` | 控件描边、分割线（强） |
| split | `#F0F0F0` | 表格行线、卡片内分割（弱） |

规则：

- 只用**一个** primary seed 派生交互色；语义色不参与主交互。
- 预设色板（blue/purple/cyan/green/magenta/red/orange/yellow/volcano/geekblue/gold/lime）只用于标签、图表、分类编码。
- 中性文字用透明度而非固定灰阶，保证叠在不同表面上仍协调。
- `#1677FF` 上的白字对比度约 3.6:1，**不满足 AA 正文**；正文级链接/按钮文字需加深 primary（如 `#0958D9`）或加大字号/字重，并在验收中标注。
- 禁止在页面里写死 hex；全部走 Less 变量 / CSS 变量 / 组件 token。

### 2.2 字体与排版

- 字体栈：`-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif`
- 代码：`SFMono-Regular, Consolas, 'Liberation Mono', Menlo, Courier, monospace`
- 基准：**14px / 行高 1.5715（22px）**；不是 16px。
- 字重：仅 400 / 600；不用 500/700 制造层级。
- 斜体只用于文档正文，不用于 UI 标签。

| 层级 | 字号/行高 | 字重 | 用途 |
| --- | --- | --- | --- |
| 页面标题 | 20 / 28 | 600 | 页面主标题（`nz-page-header` 标题） |
| 区块标题 | 16 / 24 | 600 | 卡片标题、分组标题 |
| 正文 | 14 / 22 | 400 | 表格、表单、段落 |
| 辅助 | 12 / 20 | 400 | 说明、时间、计数 |
| 大数字 | 24–30 / 32–38 | 600 | 统计卡主值（`nz-statistic`） |

规则：

- 用字号 + 颜色 + 间距建立层级，不靠字重堆叠。
- 数字用等宽数字（`font-variant-numeric: tabular-nums`）保证列对齐。
- 中文与英文/数字之间不强制加空格；省略号用 `…`。
- 单行文本溢出用省略号并提供 `title` 或 tooltip。

### 2.3 间距与栅格

- 一切间距对齐 **4px** 网格。
- 常用档位：`4 / 8 / 12 / 16 / 24 / 32 / 48`。
- 页面内容区：左右 24px，上下 24px；移动端 16px。
- 卡片内边距 24px；卡片之间 16px；卡片内元素组之间 16px。
- 表单：字段纵向 24px；label 与控件 8px；行内多列 gutter 16px。
- 按钮组：主次按钮间距 8px；工具栏与表格间距 16px。
- 表格单元格：default 上下 16px / 左右 16px；middle 12px / 8px；small 8px / 8px。后台列表常用 middle，密集表格用 small。
- 禁止 magic number（11px、13px、18px…）；确有光学修正时写注释。

### 2.4 圆角

| 元素 | 圆角 |
| --- | --- |
| 输入框、按钮、选择器 | `6px` |
| 卡片、弹窗、抽屉、通知 | `8px` |
| 标签、tooltip、小徽标 | `4px` |
| 头像、圆点、胶囊 | `9999px` |
| 表格/分段控件内部 | 可 0，但容器仍需协调 |

相邻元素圆角要协调：外容器 8px 时，内部控件不要再给 8px 形成「双圆角」。

### 2.5 阴影与层级

**flat-first**：优先用边框和表面色差表达层级；阴影只给真正浮起的层。

| 层级 | 阴影 |
| --- | --- |
| 卡片（默认无阴影，仅描边） | `0 0 0 1px #F0F0F0` |
| 悬浮卡片 / 下拉 | `0 1px 2px rgba(0,0,0,.05), 0 1px 6px -1px rgba(0,0,0,.03), 0 2px 4px rgba(0,0,0,.03)` |
| 弹窗 / 抽屉 / 通知 | `0 6px 16px rgba(0,0,0,.08), 0 3px 6px -4px rgba(0,0,0,.12), 0 9px 28px 8px rgba(0,0,0,.05)` |

- 同一表面不要叠两个 primary 阴影。
- 遮罩：`rgba(0,0,0,0.45)`。
- 表格不默认斑马纹；hover 行用 `#FAFAFA`，选中行用 `#E6F4FF`。

### 2.6 动效

| 场景 | 时长 |
| --- | --- |
| 颜色/透明度等状态变化 | `0.1s` |
| 组件内部展开/收起 | `0.2s` |
| 页面级/抽屉/弹窗 | `0.3s` |

- 只用命名缓动：优先主题里的 `motionEaseOut` / `motionEaseInOut` 等 token；纯 CSS 场景用 `ease-out`（进入）、`ease-in`（离开）、`ease-in-out`（位移）。
- 禁止自造 `cubic-bezier`。
- 尊重 `prefers-reduced-motion`；关键信息不依赖动画传达。

---

## 3. 控件与组件规范

### 3.1 Button

- 高度 32（small 24 / large 40），圆角 6，水平内边距 15（AntD 历史例外，不要推广到其他控件）。
- **primary**：实心主色 + 白字；一屏最多一个；hover `#4096FF`，active `#0958D9`。
- **default**：白底 + 1px `#D9D9D9` 边；hover 文字/边框 `#4096FF`。
- **text/link**：用于低优先级或表格行内操作；link 仅用于跳转。
- **danger**：删除/不可逆操作；默认描边 danger，确认弹窗里才用实心。
- loading 时保留原宽度，禁止重复点击。
- 图标按钮必须有 `aria-label` + tooltip。

### 3.2 Input / Select / DatePicker

- 高度 32，圆角 6，1px `#D9D9D9` 边。
- placeholder 用 `rgba(0,0,0,.25)`。
- focus：主色边框 + 2px 主色 10% 外发光；error：error 边框 + 错误文案。
- 禁用：底 `#F5F5F5`、文字 `.25`、`cursor: not-allowed`。
- Select 超过 3 个标签折叠为 `+N`；可搜索时保留输入过滤。
- 日期范围默认「最近 7 天」；时间格式 `YYYY-MM-DD HH:mm`。

### 3.3 Table

- 表头底 `#FAFAFA`，文字 14/600，主文字色。
- 正文 14/400；行高舒适（上下 12px）；不默认斑马纹。
- 数字列右对齐、等宽；状态列用 `nz-tag`；操作列固定在右侧。
- 空数据用 `nz-empty` 并给主操作；加载用 `nz-spin` 覆盖表格而非整页。
- 分页默认 10/20/50；总数为 0 时隐藏分页器。
- 横向滚动时固定首列（如名称）与操作列。

### 3.4 Form

- 默认纵向布局；查询区用 `inline`；桌面宽屏可两列（gutter 16/24）。
- label 右对齐或顶对齐，同一页面统一；必填用红色 `*` 前置。
- 校验时机：blur 校验 + 提交时全量校验；错误文案跟在控件下方 12px 内。
- 帮助文本用 `.45` 色 12px；不要与错误文案同时占位造成跳动（预留一行高度）。
- 长表单分组，每组一张卡片 + 组标题；底部操作条吸底（`position: sticky`）。
- 提交中禁用整个表单并显示按钮 loading；成功后 message + 关闭/跳转。

### 3.5 Modal / Drawer

- Modal 宽度：小 480、中 640、大 800；不要超过视口 90%。
- 标题一句话说清动作（「删除采集任务」而不是「提示」）。
- 内容区 padding 24；按钮区右对齐，主操作在最右。
- 危险操作：标题/正文写清对象与不可逆后果；确认按钮用 danger。
- Drawer 宽度 480/640；头部固定、主体滚动、底部操作固定。
- 不在弹窗里再开弹窗；需要多级时改用抽屉或页面。

### 3.6 Tabs / Tag / Alert / Tooltip

- Tabs：选中主色文字 + 2px 主色下划线，无底色；标签 3–7 个，超出用下拉。
- Tag：圆角 4、12px、低饱和浅底 + 深色文字；状态必须有文字，不能只有颜色。
- Alert：浅语义底 + 图标 + 标题/描述；页面级常驻提示用 alert，瞬时反馈用 message。
- Tooltip：反色 `rgba(0,0,0,.85)` + 白字，最多两行；不作为唯一信息来源。

### 3.7 空态 / 错误 / 加载 / 无权限

| 状态 | 呈现 | 必须有 |
| --- | --- | --- |
| 首次空 | 插画/图标 + 一句说明 | 主操作（新建/导入） |
| 筛选空 | 「没有符合条件的记录」 | 「清除筛选」 |
| 加载 | 骨架屏（首屏）或 spin（局部） | 不阻塞导航 |
| 错误 | 错误图标 + 人话 + 错误码（弱化） | 重试按钮 |
| 无权限 | 锁图标 + 说明 | 申请权限/联系管理员 |
| 禁用 | 控件置灰 + tooltip 说明原因 | 不要只置灰不解释 |

---

## 4. 文案

- 中文、简洁、动词开头；按钮 2–4 字（「新建」「保存」「批量归档」）。
- 不用「确定/取消」单独出现而不说明动作；确认按钮写动词（「删除」「提交」）。
- 错误文案说「发生了什么 + 怎么办」，不暴露堆栈。
- 日期 `YYYY-MM-DD HH:mm`；相对时间仅用于 7 天内，超过用绝对时间。
- 数字千分位；单位（条/个/次/MB）紧跟；百分比保留 1 位小数。
- 空态文案给出下一步，而不是「暂无数据」四个字结束。

---

## 5. 可访问性

- 正文对比度 ≥ 4.5:1，大字 ≥ 3:1；主色白字不达标时加深或加大。
- 所有交互元素可 Tab 到达，焦点可见（2px 主色环），禁止裸 `outline: none`。
- 图标按钮、纯图标链接必须有 `aria-label`；装饰图标 `aria-hidden="true"`。
- 表格表头用 `<th scope="col">`；表单 label 关联 `for`/`id`。
- 弹窗打开后焦点进入弹窗，Esc 关闭，关闭后焦点回到触发元素。
- 不单独用颜色传达状态（红/绿 + 文案/图标）。
- 支持 200% 缩放不破版；移动端点击目标 ≥ 44×44。

---

## 6. NG-ZORRO 主题映射（v22.1.2）

NG-ZORRO 22 默认仍是 Ant Design 4 代取值（primary `#1890ff`、圆角 `2px`、正文 85%/45%、页面底 `#f0f2f5`），**与本规范不一致**，必须在主题层覆盖。

在 `src/styles.less`（或 `styles.scss` 中 `@import` 的 less 文件）里：

```less
@import 'ng-zorro-antd/ng-zorro-antd.less';

// —— Ant Design 语义映射 ——
@primary-color: #1677ff;
@success-color: #52c41a;
@warning-color: #faad14;
@error-color: #ff4d4f;
@info-color: #1677ff;

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

// 主色阶（hover/active/浅底）
@blue-6: #1677ff;
@blue-5: #4096ff;
@blue-7: #0958d9;
@blue-1: #e6f4ff;
@blue-3: #91caff;
```

> 注意：`@blue-*` 覆盖会影响所有派生色；只在确认不需要 AntD 4 蓝阶时改。更稳妥的是只改 `@primary-color` 及 `@primary-*` 派生变量（若版本支持）。

CSS 变量方案（实验性，v22 可用）：

```ts
provideNzConfig({ theme: { primaryColor: '#1677ff' } });
// 运行时
configService.set('theme', { primaryColor: '#1677ff' });
```

- CSS 变量版需把样式入口换成 `ng-zorro-antd.variable.min.css`。
- 静态 `NzMessageService` / `NzModalService` 不继承局部主题，必须全局配置。
- 组件级差异优先用 `[nzSize]`、`[nzVariant]`、`[nzStatus]` 等公开输入，不要 `::ng-deep`。
- 主题覆盖集中在一个文件；页面里再出现 hex 视为缺陷。

---

## 7. Do / Don't

| Do | Don't |
| --- | --- |
| 用 token/变量表达颜色 | 页面里写 `#1677FF` |
| 一屏一个 primary | 每个卡片都放实心主按钮 |
| 用浅底 + 图标 + 文字表达状态 | 用高饱和色块/彩色正文 |
| 4px 栅格推间距 | 11/13/18px 随手写 |
| 先边框后阴影 | 所有卡片都加投影 |
| 只用命名缓动 | 自造 `cubic-bezier(.2,.8,.2,1)` |
| 图标 + 文字 | 只有图标没有说明 |
| 空态给下一步 | 「暂无数据」结束 |
| 破坏性操作用 danger + 二次确认 | 删除按钮用 primary |
| 表格数字右对齐 | 数字左对齐、无千分位 |
| 14px 正文 | 16px 起跳 |
| 组件公开输入定制 | 覆盖 `.ant-*` 内部类 |

---

## 8. 评审清单（视觉/交互）

1. 主操作是否唯一、位置是否符合后台直觉？
2. 所有状态（hover/active/focus/disabled/loading/error/empty）是否都有设计？
3. 颜色是否全部语义化、对比度是否达标？
4. 间距是否落在 4px 网格、层级是否靠边框而非阴影？
5. 表格：对齐、固定列、分页、空态、加载是否完整？
6. 表单：必填、校验、错误文案、提交反馈是否完整？
7. 弹层：标题是否说清动作、危险操作是否二次确认？
8. 文案是否动词开头、无歧义、给出下一步？
9. 键盘与读屏能否完成主流程？
10. 是否引入了第二套 UI 体系或未登记的自定义样式？
