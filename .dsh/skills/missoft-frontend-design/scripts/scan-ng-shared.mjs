#!/usr/bin/env node
/**
 * scan-ng-shared.mjs
 *
 * 扫描本地 ng-shared 源码或构建产物，生成可被 AI/人直接检索的组件注册表。
 *
 * 支持两种输入：
 *   1. Angular 库源码（*.ts，含 @Component / @Directive 装饰器）
 *   2. Angular Ivy 构建产物（*.d.ts，含 ɵɵComponentDeclaration / ɵɵDirectiveDeclaration）
 *
 * 用法：
 *   node scan-ng-shared.mjs --root ../ng-shared --out doc/design/ng-shared-registry.md
 *   node scan-ng-shared.mjs --root node_modules/ng-shared --json /tmp/ng-shared.json
 *   node scan-ng-shared.mjs --root . --filter "page|table|form"
 *
 * 退出码：0 成功；2 找不到根目录；3 找到目录但没有解析到任何声明。
 */

import {
  existsSync,
  readFileSync,
  readdirSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import path from 'node:path';

const SKIP_DIRS = new Set(['node_modules', '.git', '.angular', '.cache']);

const args = parseArgs(process.argv.slice(2));
if (args.help) {
  printHelp();
  process.exit(0);
}

const cwd = process.cwd();
const root = resolveRoot(args.root, cwd);
if (!root) {
  console.error(
    '[ng-shared] 找不到 ng-shared。请用 --root 指定本地源码/安装包路径，' +
      '或设置 NG_SHARED_ROOT 环境变量。',
  );
  process.exit(2);
}

const pkg = readPackage(root);
const declarations = [];
const services = [];
const files = walk(root);
const sourceFiles = files.filter((f) => /\.ts$/.test(f) && !/\.spec\.ts$/.test(f));
const dtsFiles = sourceFiles.filter((f) => /\.d\.ts$/.test(f));
const tsFiles = sourceFiles.filter((f) => !/\.d\.ts$/.test(f));

for (const file of tsFiles) {
  const text = readFileSync(file, 'utf8');
  if (!/@(Component|Directive|Injectable)\s*\(/.test(text)) continue;
  parseDecoratedFile(file, text, root, declarations, services);
}

// 只在没有源码时解析 d.ts，避免同一组件出现两份。
if (tsFiles.length === 0 || args.includeDts) {
  for (const file of dtsFiles) {
    const text = readFileSync(file, 'utf8');
    if (!/ɵɵ(Component|Directive)Declaration</.test(text)) continue;
    parseIvyDtsFile(file, text, root, declarations);
  }
}

const filter = args.filter ? new RegExp(args.filter, 'i') : null;
const seen = new Set();
const merged = declarations.filter((d) => {
  const key = `${d.cls}|${d.selector}`;
  if (seen.has(key)) return false;
  seen.add(key);
  return true;
});
const filtered = merged
  .filter((d) => !filter || filter.test(d.selector) || filter.test(d.cls))
  .sort(
    (a, b) =>
      a.group.localeCompare(b.group) ||
      a.selector.localeCompare(b.selector) ||
      a.cls.localeCompare(b.cls),
  );

if (filtered.length === 0) {
  console.error(
    `[ng-shared] 已扫描 ${root}，但没有解析到组件/指令声明。` +
      '该目录可能只是编译后的 fesm 包；请提供源码，或改用 --include-dts。',
  );
  process.exit(3);
}

const publicApi = findPublicApi(root);
const git = gitInfo(root);
const markdown = renderMarkdown({
  root,
  pkg,
  git,
  declarations: filtered,
  services,
  publicApi,
  command: buildCommand(args),
});
const json = {
  generatedAt: new Date().toISOString(),
  root,
  package: pkg,
  git,
  counts: {
    components: filtered.filter((d) => d.kind === 'Component').length,
    directives: filtered.filter((d) => d.kind === 'Directive').length,
    services: services.length,
  },
  declarations: filtered,
  services,
  publicApi,
};

if (args.out) {
  const outPath = path.resolve(cwd, args.out);
  writeFileSync(outPath, markdown, 'utf8');
  console.log(`[ng-shared] 已写入 ${displayPath(cwd, outPath)}（${filtered.length} 条声明）`);
}
if (args.json) {
  const jsonPath = path.resolve(cwd, args.json);
  writeFileSync(jsonPath, JSON.stringify(json, null, 2), 'utf8');
  console.log(`[ng-shared] 已写入 ${displayPath(cwd, jsonPath)}`);
}
if (!args.out && !args.json) console.log(markdown);

/* ------------------------------------------------------------------ */
/* 参数与根目录                                                        */
/* ------------------------------------------------------------------ */

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--help' || a === '-h') out.help = true;
    else if (a === '--root') out.root = argv[++i];
    else if (a === '--out') out.out = argv[++i];
    else if (a === '--json') out.json = argv[++i];
    else if (a === '--filter') out.filter = argv[++i];
    else if (a === '--include-dts') out.includeDts = true;
    else if (a === '--quiet') out.quiet = true;
  }
  return out;
}

function printHelp() {
  console.log(`scan-ng-shared.mjs —— 生成 ng-shared 组件注册表

用法:
  node scan-ng-shared.mjs [--root <dir>] [--out <file.md>] [--json <file.json>]
                          [--filter <regex>] [--include-dts]

不传 --root 时按以下顺序探测:
  $NG_SHARED_ROOT
  ./node_modules/ng-shared
  ./node_modules/@<scope>/ng-shared
  ./libs/ng-shared, ./projects/ng-shared, ./src/ng-shared
  ../ng-shared, ../../ng-shared
`);
}

function resolveRoot(explicit, base) {
  const candidates = [];
  if (explicit) candidates.push(path.resolve(base, explicit));
  if (process.env.NG_SHARED_ROOT) candidates.push(path.resolve(process.env.NG_SHARED_ROOT));
  candidates.push(
    path.resolve(base, 'node_modules/ng-shared'),
    path.resolve(base, 'libs/ng-shared'),
    path.resolve(base, 'projects/ng-shared'),
    path.resolve(base, 'src/ng-shared'),
    path.resolve(base, '..', 'ng-shared'),
    path.resolve(base, '..', '..', 'ng-shared'),
  );
  const scoped = globScopedNgShared(path.resolve(base, 'node_modules'));
  candidates.push(...scoped);
  const pnpm = globPnPmNgShared(path.resolve(base, 'node_modules/.pnpm'));
  candidates.push(...pnpm);

  for (const c of candidates) {
    if (c && existsSync(c) && statSync(c).isDirectory()) return c;
  }
  return null;
}

function globScopedNgShared(nm) {
  if (!existsSync(nm)) return [];
  const out = [];
  for (const scope of readdirSync(nm)) {
    if (!scope.startsWith('@')) continue;
    const scopeDir = path.join(nm, scope);
    if (!safeIsDir(scopeDir)) continue;
    for (const name of readdirSync(scopeDir)) {
      if (name === 'ng-shared' || name.includes('ng-shared')) {
        const p = path.join(scopeDir, name);
        if (safeIsDir(p)) out.push(p);
      }
    }
  }
  return out;
}

function globPnPmNgShared(pnpm) {
  if (!existsSync(pnpm)) return [];
  const out = [];
  for (const entry of readdirSync(pnpm)) {
    if (!entry.includes('ng-shared')) continue;
    const p = path.join(pnpm, entry, 'node_modules/ng-shared');
    if (safeIsDir(p)) out.push(p);
  }
  return out;
}

function safeIsDir(p) {
  try {
    return statSync(p).isDirectory();
  } catch {
    return false;
  }
}

/* ------------------------------------------------------------------ */
/* 文件遍历与包信息                                                    */
/* ------------------------------------------------------------------ */

function walk(dir, acc = []) {
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return acc;
  }
  for (const e of entries) {
    if (e.name.startsWith('.') && e.name !== '.d.ts') continue;
    if (e.isDirectory()) {
      if (SKIP_DIRS.has(e.name)) continue;
      walk(path.join(dir, e.name), acc);
    } else if (e.isFile() && /\.(ts|d\.ts)$/.test(e.name) && !/\.spec\.ts$/.test(e.name)) {
      acc.push(path.join(dir, e.name));
    }
  }
  return acc;
}

function readPackage(root) {
  const p = path.join(root, 'package.json');
  if (!existsSync(p)) return { name: path.basename(root), version: null, peers: {} };
  try {
    const j = JSON.parse(readFileSync(p, 'utf8'));
    return {
      name: j.name,
      version: j.version,
      peers: j.peerDependencies || {},
      typings: j.typings || j.types || null,
    };
  } catch {
    return { name: path.basename(root), version: null, peers: {} };
  }
}

function gitInfo(root) {
  const gitDir = path.join(root, '.git');
  if (!existsSync(gitDir)) return null;
  try {
    const head = readFileSync(path.join(gitDir, 'HEAD'), 'utf8').trim();
    if (head.startsWith('ref: ')) {
      const ref = head.slice(5);
      const refFile = path.join(gitDir, ref);
      if (existsSync(refFile)) {
        return { commit: readFileSync(refFile, 'utf8').trim().slice(0, 12), branch: ref.replace('refs/heads/', '') };
      }
    }
    return { commit: head.slice(0, 12), branch: null };
  } catch {
    return null;
  }
}

function findPublicApi(root) {
  const candidates = [
    'public-api.ts',
    'src/public-api.ts',
    'lib/public-api.ts',
    'index.ts',
  ].map((p) => path.join(root, p));
  for (const p of candidates) {
    if (existsSync(p)) {
      const text = readFileSync(p, 'utf8');
      const lines = text
        .split('\n')
        .map((l) => l.trim())
        .filter((l) => l.startsWith('export '));
      return { path: path.relative(root, p), exports: lines };
    }
  }
  return null;
}

/* ------------------------------------------------------------------ */
/* 源码装饰器解析                                                      */
/* ------------------------------------------------------------------ */

function parseDecoratedFile(file, text, root, declarations, services) {
  for (const kind of ['Component', 'Directive', 'Injectable']) {
    const re = new RegExp(`@${kind}\\s*\\(`, 'g');
    let m;
    while ((m = re.exec(text))) {
      const open = m.index + m[0].length - 1;
      const body = readBalanced(text, open, '(', ')');
      if (!body) continue;
      const after = text.slice(body.end + 1);
      const classMatch = after.match(/^\s*(?:export\s+)?(?:default\s+)?(?:abstract\s+)?class\s+([A-Za-z_$][\w$]*)/);
      if (!classMatch) continue;
      const cls = classMatch[1];
      const clsStart = body.end + 1 + after.indexOf(classMatch[0]) + classMatch[0].indexOf(cls);
      const classBody = readBalanced(text, text.indexOf('{', clsStart), '{', '}');
      const meta = extractMeta(body.text);
      const doc = precedingDoc(text, m.index);
      const line = lineOf(text, m.index);

      if (kind === 'Injectable') {
        services.push({
          cls,
          providedIn: matchString(body.text, /providedIn\s*:\s*['"`]([^'"`]*)['"`]/),
          file: path.relative(root, file),
          line,
          doc,
        });
        continue;
      }

      const members = classBody ? parseClassMembers(classBody.text) : { inputs: [], outputs: [] };
      const metaInputs = parseMetaInputs(body.text);
      const isAbstract = /\babstract\s+class\b/.test(after.slice(0, after.indexOf('{') + 1));
      declarations.push({
        kind,
        cls,
        abstract: isAbstract,
        selector: meta.selector || '(no selector)',
        exportAs: meta.exportAs || null,
        standalone: meta.standalone,
        inputs: unique([...members.inputs, ...metaInputs]),
        outputs: unique(members.outputs),
        group: groupOf(path.relative(root, file)),
        file: path.relative(root, file),
        line,
        doc,
        source: 'source',
      });
    }
  }
}

function extractMeta(metaText) {
  const selector = matchString(metaText, /selector\s*:\s*(['"`])([\s\S]*?)\1/);
  const exportAs = matchString(metaText, /exportAs\s*:\s*(['"`])([\s\S]*?)\1/);
  const standalone = /standalone\s*:\s*(true|false)/.exec(metaText);
  return {
    selector,
    exportAs,
    standalone: standalone ? standalone[1] === 'true' : undefined,
  };
}

function parseMetaInputs(metaText) {
  const out = [];
  const m = /inputs\s*:\s*\[([\s\S]*?)\]/.exec(metaText);
  if (m) {
    for (const raw of m[1].split(',')) {
      const s = raw.trim().replace(/^['"`]|['"`]$/g, '');
      if (!s) continue;
      const [prop, alias] = s.split(':').map((x) => x.trim());
      out.push(alias ? `${prop} as ${alias}` : prop);
    }
  }
  return out;
}

function parseClassMembers(body) {
  const inputs = [];
  const outputs = [];

  // @Input() / @Input('alias') / @Input({ alias: 'x' })
  const inputRe = /@Input\s*\(([^)]*)\)\s*(?:(?:readonly|set)\s+)?([A-Za-z_$][\w$]*)/g;
  let m;
  while ((m = inputRe.exec(body))) {
    const args = m[1].trim();
    const alias =
      matchString(args, /['"`]([^'"`]+)['"`]/) ||
      matchString(args, /alias\s*:\s*['"`]([^'"`]+)['"`]/);
    inputs.push(alias && alias !== m[2] ? `${m[2]} as ${alias}` : m[2]);
  }

  const outputRe = /@Output\s*\(([^)]*)\)\s*(?:readonly\s+)?([A-Za-z_$][\w$]*)/g;
  while ((m = outputRe.exec(body))) {
    const alias = matchString(m[1], /['"`]([^'"`]+)['"`]/);
    outputs.push(alias && alias !== m[2] ? `${m[2]} as ${alias}` : m[2]);
  }

  // Angular signal inputs/outputs/models（支持泛型里再嵌套泛型，如 input<string[] | Record<string, string>>）
  const signalStart = /([A-Za-z_$][\w$]*)\s*=\s*(input|output|model)(\.required)?\s*/g;
  while ((m = signalStart.exec(body))) {
    let cursor = signalStart.lastIndex;
    if (body[cursor] === '<') {
      const generic = readBalanced(body, cursor, '<', '>');
      if (!generic) continue;
      cursor = generic.end + 1;
    }
    while (cursor < body.length && /\s/.test(body[cursor])) cursor++;
    if (body[cursor] !== '(') continue;
    if (m[2] === 'output') outputs.push(m[1]);
    else if (m[2] === 'model') {
      inputs.push(m[1]);
      outputs.push(`${m[1]}Change`);
    } else inputs.push(m[1]);
  }

  return { inputs: unique(inputs), outputs: unique(outputs) };
}

/* ------------------------------------------------------------------ */
/* Ivy d.ts 解析                                                       */
/* ------------------------------------------------------------------ */

function parseIvyDtsFile(file, text, root, declarations) {
  const marker = /ɵɵ(Component|Directive)Declaration</g;
  let m;
  while ((m = marker.exec(text))) {
    const kind = m[1];
    const open = text.indexOf('<', m.index);
    const generic = readBalanced(text, open, '<', '>');
    if (!generic) continue;
    const argsList = splitTopLevel(generic.text);
    if (argsList.length < 5) continue;
    const cls = (argsList[0].match(/[A-Za-z_$][\w$]*/g) || []).pop();
    if (!cls) continue;
    const selector = stripQuotes(argsList[1]);
    if (!selector || selector === 'never') continue;

    const inputs = parseIvyMap(argsList[3]);
    const outputs = parseIvyMap(argsList[4]);
    const line = lineOf(text, m.index);
    const classIdx = text.lastIndexOf(`class ${cls}`, m.index);
    const doc = classIdx === -1 ? '' : precedingDoc(text, classIdx);
    // Component: type, selector, exportAs, inputs, outputs, queries,
    //            ngContentSelectors, isStandalone, ...
    // Directive: type, selector, exportAs, inputs, outputs, queries, isStandalone, ...
    const standaloneIndex = kind === 'Component' ? 7 : 6;
    const standalone =
      argsList.length > standaloneIndex ? argsList[standaloneIndex].trim() === 'true' : undefined;

    declarations.push({
      kind,
      cls,
      selector,
      exportAs: null,
      standalone,
      inputs,
      outputs,
      group: groupOf(path.relative(root, file)),
      file: path.relative(root, file),
      line,
      doc,
      source: 'd.ts',
    });
  }
}

function parseIvyMap(arg) {
  if (!arg || !arg.trim().startsWith('{')) return [];
  const out = [];
  const re =
    /["']([^"']+)["']\s*:\s*(?:\{\s*["']alias["']\s*:\s*["']([^"']*)["'][^}]*\}|["']([^"']*)["'])/g;
  let m;
  while ((m = re.exec(arg))) {
    const prop = m[1];
    const alias = m[2] ?? m[3] ?? prop;
    out.push(alias && alias !== prop ? `${prop} as ${alias}` : prop);
  }
  return unique(out);
}

/* ------------------------------------------------------------------ */
/* 文本工具                                                            */
/* ------------------------------------------------------------------ */

/** 读取从 open 处的开括号到匹配闭括号之间的内容，忽略字符串/注释内的括号。 */
function readBalanced(text, open, openChar, closeChar) {
  if (open < 0 || text[open] !== openChar) return null;
  let depth = 0;
  let i = open;
  let quote = null;
  while (i < text.length) {
    const c = text[i];
    if (quote) {
      if (c === '\\') i += 2;
      else {
        if (c === quote) quote = null;
        i++;
      }
      continue;
    }
    if (c === '"' || c === "'" || c === '`') {
      quote = c;
      i++;
      continue;
    }
    if (c === '/' && text[i + 1] === '/') {
      while (i < text.length && text[i] !== '\n') i++;
      continue;
    }
    if (c === '/' && text[i + 1] === '*') {
      i += 2;
      while (i < text.length && !(text[i] === '*' && text[i + 1] === '/')) i++;
      i += 2;
      continue;
    }
    if (c === openChar) depth++;
    else if (c === closeChar) {
      depth--;
      if (depth === 0) return { text: text.slice(open + 1, i), end: i };
    }
    i++;
  }
  return null;
}

function splitTopLevel(s) {
  const out = [];
  let depth = 0;
  let quote = null;
  let buf = '';
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (quote) {
      buf += c;
      if (c === '\\') {
        buf += s[++i] || '';
      } else if (c === quote) quote = null;
      continue;
    }
    if (c === '"' || c === "'" || c === '`') {
      quote = c;
      buf += c;
      continue;
    }
    if ('{[<('.includes(c)) depth++;
    else if ('}])>'.includes(c)) depth--;
    if (c === ',' && depth === 0) {
      out.push(buf.trim());
      buf = '';
    } else buf += c;
  }
  if (buf.trim()) out.push(buf.trim());
  return out;
}

function matchString(text, re) {
  const m = re.exec(text);
  if (!m) return null;
  return m[2] ?? m[1];
}

function stripQuotes(s) {
  if (!s) return null;
  return s.trim().replace(/^['"`]|['"`]$/g, '');
}

function unique(arr) {
  return [...new Set(arr.filter(Boolean))];
}

function lineOf(text, index) {
  let line = 1;
  for (let i = 0; i < index; i++) if (text[i] === '\n') line++;
  return line;
}

function precedingDoc(text, index) {
  const before = text.slice(0, index);
  const m = /\/\*\*([\s\S]*?)\*\/\s*$/.exec(before);
  if (!m) return '';
  return m[1]
    .split('\n')
    .map((l) => l.replace(/^\s*\*\s?/, '').trim())
    .filter(Boolean)
    .slice(0, 2)
    .join(' ');
}

function groupOf(relFile) {
  const noise = new Set(['src', 'lib', 'dist', 'fesm2020', 'fesm2022', 'types', 'esm2022']);
  const dirs = relFile.split(path.sep).slice(0, -1).filter((p) => !noise.has(p));
  return dirs[0] || 'root';
}

function buildCommand(args) {
  const parts = ['node', '.dsh/skills/missoft-frontend-design/scripts/scan-ng-shared.mjs'];
  if (args.root) parts.push('--root', args.root);
  if (args.out) parts.push('--out', args.out);
  return parts.join(' ');
}

/* ------------------------------------------------------------------ */
/* 渲染                                                                */
/* ------------------------------------------------------------------ */

function renderMarkdown({ root, pkg, git, declarations, services, publicApi, command }) {
  const components = declarations.filter((d) => d.kind === 'Component');
  const directives = declarations.filter((d) => d.kind === 'Directive');
  const groups = [...new Set(declarations.map((d) => d.group))].sort();
  const blockers = [];
  if (!pkg.version) blockers.push('未读取到 package.json 版本');
  if (declarations.some((d) => d.selector === '(no selector)' && d.kind === 'Component' && !d.abstract)) blockers.push('存在无 selector 的组件声明');

  const lines = [];
  lines.push('# ng-shared 组件注册表（自动生成）');
  lines.push('');
  lines.push('> 本文件由脚本从 **本地源码/构建产物** 生成，是 `ng-shared` 组件事实的唯一来源。');
  lines.push('> 表中不存在的 selector、输入输出，**不得臆造**；需要新能力时先查源码或找库维护者确认。');
  lines.push('');
  lines.push('| 项 | 值 |');
  lines.push('| --- | --- |');
  lines.push(`| 生成时间 | ${new Date().toISOString()} |`);
  lines.push(`| 源码根 | \`${root}\` |`);
  lines.push(`| 包 | \`${pkg.name ?? 'unknown'}${pkg.version ? '@' + pkg.version : ''}\` |`);
  if (pkg.peers && Object.keys(pkg.peers).length) {
    lines.push(
      `| peerDependencies | ${Object.entries(pkg.peers)
        .map(([k, v]) => `\`${k}: ${v}\``)
        .join('<br>')} |`,
    );
  }
  if (git?.commit) lines.push(`| Git | \`${git.branch ?? 'detached'}@${git.commit}\` |`);
  lines.push(`| 声明数 | ${declarations.length}（组件 ${components.length} / 指令 ${directives.length}） |`);
  lines.push(`| 服务数 | ${services.length} |`);
  lines.push(`| 生成命令 | \`${command}\` |`);
  lines.push('');
  lines.push('## 怎么用这张表');
  lines.push('');
  lines.push('1. 先按**业务语义**找组件（页面骨架、查询区、表格、表单、上传、树、审批流……），不要按 Ant Design 的名字硬套。');
  lines.push('2. `inputs` / `outputs` 中 `foo as bar` 表示类属性 `foo`、模板别名 `bar`；模板里写 `[bar]` / `(barChange)`。');
  lines.push('3. 选中组件后，必须打开 `file:line` 看真实实现与模板，确认插槽（`ng-content`/模板输入）和样式约束。');
  lines.push('4. 表里没有的能力：先用 NG-ZORRO 原子组件组合；仍不满足再走 ui-ux-pro-max 兜底，并记录偏离。');
  lines.push('');
  if (blockers.length) {
    lines.push('> ⚠️ 数据完整性问题：' + blockers.join('；') + '。');
    lines.push('');
  }
  lines.push('## 目录分布');
  lines.push('');
  lines.push('| 分组 | 组件 | 指令 |');
  lines.push('| --- | ---: | ---: |');
  for (const g of groups) {
    const inGroup = declarations.filter((d) => d.group === g);
    lines.push(
      `| ${g} | ${inGroup.filter((d) => d.kind === 'Component').length} | ${
        inGroup.filter((d) => d.kind === 'Directive').length
      } |`,
    );
  }
  lines.push('');
  for (const g of groups) {
    const items = declarations.filter((d) => d.group === g);
    lines.push(`## ${g}`);
    lines.push('');
    lines.push('| Selector | Class | 类型 | Inputs | Outputs | 来源 |');
    lines.push('| --- | --- | --- | --- | --- | --- |');
    for (const d of items) {
      lines.push(
        `| \`${escapeCell(d.selector)}\` | \`${d.cls}\` | ${d.kind}${
          d.standalone === true ? ' · standalone' : ''
        }${d.abstract ? ' · abstract' : ''} | ${listCell(d.inputs)} | ${listCell(d.outputs)} | \`${escapeCell(d.file)}:${d.line}\` |`,
      );
    }
    lines.push('');
  }
  if (services.length) {
    lines.push('## 服务');
    lines.push('');
    lines.push('| Class | providedIn | 来源 |');
    lines.push('| --- | --- | --- |');
    for (const s of services) {
      lines.push(`| \`${s.cls}\` | ${s.providedIn ? `\`${s.providedIn}\`` : '-'} | \`${s.file}:${s.line}\` |`);
    }
    lines.push('');
  }
  if (publicApi) {
    lines.push('## 公共入口导出');
    lines.push('');
    lines.push(`来源：\`${publicApi.path}\``);
    lines.push('');
    lines.push('```ts');
    lines.push(...publicApi.exports.slice(0, 120));
    if (publicApi.exports.length > 120) lines.push(`// …共 ${publicApi.exports.length} 行导出，已截断`);
    lines.push('```');
    lines.push('');
  }
  lines.push('---');
  lines.push('');
  lines.push('### 维护');
  lines.push('');
  lines.push('```bash');
  lines.push('# 源码更新后重新生成（推荐输出到项目文档目录）');
  lines.push(command);
  lines.push('```');
  return lines.join('\n');
}

function displayPath(cwd, p) {
  const rel = path.relative(cwd, p);
  return rel.startsWith('..') ? p : rel;
}

function listCell(items) {
  if (!items?.length) return '-';
  const shown = items.slice(0, 20).map((x) => `\`${escapeCell(x)}\``).join('<br>');
  return items.length > 20 ? `${shown}<br>…共 ${items.length} 项` : shown;
}

function escapeCell(s) {
  return String(s).replace(/\|/g, '\\|').replace(/`/g, '\\`');
}
