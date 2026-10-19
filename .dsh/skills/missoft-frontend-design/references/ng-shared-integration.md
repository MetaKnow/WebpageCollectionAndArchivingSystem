# ng-shared 接入协议（真实库版）

`ng-shared` 是 missoft 前端体系的 **Angular 22 私有组件库**，不是 Ant Design 的封装壳。
本文件只解决「如何拿到、构建、接入、验证」；组件用法见
[ng-shared-patterns.md](ng-shared-patterns.md)，组件清单见
[ng-shared-components.md](ng-shared-components.md)。

## 1. 事实卡片

| 项 | 值 |
| --- | --- |
| 源码位置（本机） | `/Users/leckie/002开发项目/ng-shared/ng-shared-master`（由用户提供的 zip 解出） |
| 原始仓库 | `https://gitee.com/i-android/ng-shared.git`（私有；本机无凭据，不要假设能 clone） |
| npm 包名 | **`ng-shared`**（无 scope；`@missoft/ng-shared`、`@flusys/ng-shared` 都不是它） |
| package 版本 | `0.0.1` |
| Angular | **精确 `22.1.6`**；宿主 `@angular/*` 必须完全同版 |
| 构建 | ng-packagr，产物 `dist/` |
| 公开入口 | `src/public-api.ts`（禁深链内部文件） |
| 声明数 | 31（组件 28 / 指令 3，含 3 个 `@Directive()` 抽象基类） |
| 注册表 | [ng-shared-components.md](ng-shared-components.md)，由脚本扫描生成 |
| 源码契约文档 | 源码仓库 `docs/01-app-table-契约.md`、`docs/02-step-handler.md`、`docs/03-对话框与图标.md`、`docs/04-图表组件.md` |

**铁律：注册表 + `public-api.ts` 里没有的 selector / 输入 / 输出，一律不得使用。**
尤其不要用 `ms-*` 的旧命名习惯去猜；`app-*` / `chart-*` / `cell-widget-*` / `sf-*` 也必须是注册表里真实存在的 selector。

## 2. 获取与构建

### 2.1 已有源码（本机默认）

```bash
cd /Users/leckie/002开发项目/ng-shared/ng-shared-master
npm install            # 或 pnpm install
npm run build          # 产出 dist/
```

### 2.2 只有 zip

```bash
# macOS 的 unzip 对中文文件名可能报错；用 Python 解压更稳
python3 - <<'PY'
import zipfile
with zipfile.ZipFile('/Users/leckie/Downloads/ng-shared-master.zip') as z:
    for info in z.infolist():
        info.filename = info.filename.encode('cp437').decode('utf-8', 'replace')
        z.extract(info, '/Users/leckie/002开发项目/ng-shared')
PY
```

解压后确认 `ng-shared-master/package.json` 的 `name` 为 `ng-shared`。

### 2.3 宿主接入

```json
// 宿主的 package.json
"ng-shared": "file:../ng-shared/dist"
```

```bash
npm install
rm -rf .angular/cache
npm start
```

- **改库后必须 `npm run build`**，否则宿主拿到的还是旧 `.d.ts`。
- 宿主 `ng serve` 前清 `.angular/cache`：Vite 预构建缓存不随 `file:` 内容失效。
- 若宿主用 pnpm，确认 `file:` 指向 `dist/` 而不是源码根目录（源码根没有可发布的 `package.json` 入口）。

### 2.4 宿主依赖

| 依赖 | 版本 |
| --- | --- |
| `@angular/*` | `22.1.6`（精确） |
| `ng-zorro-antd` | `^22.1.0` |
| `@delon/*`（`@delon/theme`、`@delon/abc`、`@delon/form`、`@delon/chart`、`@delon/acl` 等） | `^22.1.1` |
| `@lucide/angular` | `^1.45.0` |
| `@antv/g2` | `^5.4.8` |
| `date-fns` | `^4.4.0` |
| `spark-md5` | `^3.0.0` |
| `rxjs` | `~7.8.0` |

宿主还必须提供 `provideNzI18n`、`provideNzIcons`、`provideLucideIcons`、`provideAlain({ chart: { libs } })`、
`provideCellWidgets(CELL_WIDGETS)`，并把 G2 资源拷进 `assets/@antv/g2/`；缺一个就是静默失效。
完整 `app.config.ts` 见 [ng-shared-patterns.md](ng-shared-patterns.md) 第 1.2 节。

## 3. 扫描与注册表

脚本：`.dsh/skills/missoft-frontend-design/scripts/scan-ng-shared.mjs`（Node ESM，零依赖）。

### 3.1 源码模式（推荐）

```bash
node .dsh/skills/missoft-frontend-design/scripts/scan-ng-shared.mjs \
  --root "/Users/leckie/002开发项目/ng-shared/ng-shared-master" \
  --out .dsh/skills/missoft-frontend-design/references/ng-shared-components.md \
  --json /tmp/ng-shared-components.json
```

### 3.2 安装包模式

```bash
node .dsh/skills/missoft-frontend-design/scripts/scan-ng-shared.mjs \
  --root node_modules/ng-shared --include-dts \
  --out doc/design/ng-shared-registry.md \
  --json doc/design/ng-shared-registry.json
```

`--include-dts` 用于只有构建产物的宿主；源码模式信息更全（含 signal `input()/output()/model()`、`inputs` 元数据）。

### 3.3 参数与退出码

| 参数 | 说明 |
| --- | --- |
| `--root <dir>` | 库根目录；省略时依次探测 `$NG_SHARED_ROOT`、`node_modules/ng-shared`、scoped/pnpm、`libs/projects/src`、上级目录 |
| `--out <file.md>` | Markdown 输出 |
| `--json <file.json>` | 结构化输出，供 CI/diff |
| `--filter <regex>` | 只输出 selector/类名匹配的声明 |
| `--include-dts` | 同时扫 `.d.ts` |
| `--quiet` | 减少日志 |

| 退出码 | 含义 | 处理 |
| --- | --- | --- |
| 0 | 成功 | 核对声明数是否接近 31，异常就查根目录是否指错 |
| 2 | 找不到根目录 | 让用户给路径，或确认是否已安装 |
| 3 | 有目录但无声明 | 可能只有 `fesm`；换源码或确认 `types` |

### 3.4 解析能力与局限

- 能解析：`@Component/@Directive` 的 selector / exportAs / standalone / `inputs` 元数据；`@Input/@Output`（含别名与 setter）；signal `input()/output()/model()`（含嵌套泛型）；Ivy d.ts；`@Injectable` 的 `providedIn`。
- 不能解析：运行时动态拼的 selector；**继承自基类的输入输出不会出现在子类条目里**（看到 `extends` 要打开基类）；`input()` 的 `alias` 选项需回源码确认。
- 抽象基类（`DialogComponent`、`EditDialogComponent`、`BaseComponent`）会以 `Directive · abstract` 出现在注册表，**它们不是可实例化的组件**，只用于 extends。
- 注册表里的 `(no selector)` 可能是 SF 自定义控件（如 `PasswordWidget`），由 `ui.widget` 动态创建，不是页面标签。

## 4. 注册表怎么读

```md
| `app-table` | `TableComponent` | Component | `options` | - | `src/lib/components/table/table.component.ts:58` |
```

1. **Selector**：直接作为标签/属性使用；本库多数是元素选择器（`app-table`、`chart-bar`）。
2. **类型**：`Component` 可实例化；`Directive · abstract` 只能 `extends`。
3. **Inputs/Outputs**：`prop as alias` 表示类属性 `prop`、模板名 `alias`；模板写 `[alias]`。
4. **来源**：必须打开 `file:line` 看模板，确认内容投影（`ng-content select=`）、模板输入、依赖的 ng-zorro 模块。
5. **服务**：注册表末尾 9 个 `@Injectable`（`DialogService`、`StepHandler`、`RouterService` 等），注入前确认 `providedIn: 'root'`。

## 5. 导入与使用规则

```ts
// ✅ 从包入口导入
import { TableComponent, Options, StepHandler, Context } from 'ng-shared';

// ❌ 不要深链
import { TableComponent } from 'ng-shared/lib/components/table/table.component';
```

- 本库组件全部 standalone，直接进宿主组件的 `imports`；没有 `NgModule` 需要声明。
- 优先用公开输入/工厂；不要 `ViewChild` 改库内部状态、不要 `::ng-deep` 打库内部结构。
- 库已封装的空态、加载、分页、工具栏逻辑不要重复实现；先读 [ng-shared-patterns.md](ng-shared-patterns.md)。
- 业务间距用外层容器控制，仍遵守 4px 网格；不要在库组件上写 `margin` 覆盖内部布局。
- 表单类（`sf-*`）在 `SFSchema.ui.widget` 里用，不要当普通标签写。

## 6. 升级与回归

```bash
# 升级库后
npm run build
rm -rf .angular/cache
node .dsh/skills/missoft-frontend-design/scripts/scan-ng-shared.mjs \
  --root "/Users/leckie/002开发项目/ng-shared/ng-shared-master" \
  --out .dsh/skills/missoft-frontend-design/references/ng-shared-components.md \
  --json /tmp/ng-shared-components.json

git diff .dsh/skills/missoft-frontend-design/references/ng-shared-components.md
```

- 注册表与库版本一起提交；diff 里出现 selector/输入删除就是破坏性变更。
- 不要手改注册表；改库源码后重新生成。
- 建议 CI 校验「重新生成后 diff 为空」，防止注册表过期。

## 7. 阻断协议（确实拿不到源码时）

1. **告知事实**：说明未找到 `ng-shared` 源码/安装包，列出已尝试的路径与错误，不要编造组件。
2. **请求输入**：源码路径、zip、已安装的 `node_modules`、或可用的构建产物。
3. **记录 ADR**：在 `doc/design/DECISIONS.md` 追加，标记 `ng-shared: pending`。
4. **基线实现**：用 NG-ZORRO 原子组件 + AntD 规范先做，涉及库的位置加 `TODO(ng-shared)`；**不要写假的 `app-table` 用法**。
5. **回归计划**：拿到库后重新扫描、替换基线、跑视觉与交互回归，ADR 改 `resolved`。

ADR 模板：

```md
## ADR-YYYYMMDD-01：ng-shared 不可用时的基线实现

- 状态：pending / resolved
- 背景：需要实现「采集任务列表」，预期复用 ng-shared 的 app-table。
- 已尝试：ls node_modules/ng-shared（不存在）；zip 未提供；gitee 无凭据。
- 决策：先用 NG-ZORRO nz-table + nz-pagination 实现，标记 TODO(ng-shared)。
- 影响：视觉按 AntD 规范；库到位后替换列表、工具栏、分页三处。
- 后续：拿到源码后重新生成注册表并替换。
```

## 8. 禁止事项

- ❌ 从公开 npm 安装名为 `ng-shared` 的包（那是无关老包）。
- ❌ 使用 `@missoft/ng-shared` 等猜测的 scope。
- ❌ 编造 `ms-table` / `ms-button` / `app-xxx` 组件或输入。
- ❌ 把 Ant Design / NG-ZORRO 的 API 直接套到本库组件上（例如给 `app-table` 加 `nzData`）。
- ❌ 为补缺口 fork 私有库或复制其内部实现。
- ❌ 让 `ui-ux-pro-max` 建议的第二套组件框架进入项目。

## 9. 接入验收清单

- [ ] 注册表已重新生成，声明数为 31（或与当前源码一致），来源路径正确。
- [ ] 用到的每个 selector 都能在注册表找到，并已打开 `file:line` 核对插槽与依赖。
- [ ] 导入路径来自 `ng-shared` 包入口，无深链。
- [ ] 宿主 provider（i18n / icons / lucide / alain chart / cell widgets）齐全。
- [ ] `ng-shared` 指向 `dist/`，且库已 build、宿主缓存已清。
- [ ] 没有假组件名、没有复制库代码、没有第二套 UI 框架。
- [ ] 阻断场景有 ADR + `TODO(ng-shared)`，并已告知用户。
