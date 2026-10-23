const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const scriptPath = path.join(root, 'scripts', 'sync-manulism-work.js');
const source = fs.readFileSync(scriptPath, 'utf8').replace(/\nmain\(\);\s*$/, '\n');
const sandbox = {
  require,
  __dirname: path.dirname(scriptPath),
  process: { env: { MANULISM_WORK_DIR: path.join(root, 'missing-knowledge-root') } },
  console,
  module: { exports: {} },
  exports: {}
};
vm.runInNewContext(source, sandbox, { filename: scriptPath });

const { convertObsidianSyntax } = sandbox.module.exports;

assert.equal(typeof convertObsidianSyntax, 'function', 'blog sync must expose its Obsidian conversion');

const input = [
  '```mermaid',
  'flowchart LR',
  '  A --> B',
  '```',
  '',
  '> [!caution] 线性外推的边界',
  '> 斜率不足时应显示 **无法推算**。',
  '',
  '行内公式 $d_i=1$。',
  '百分比 $10\\%$。',
  '',
  '$$',
  'HI(t)=\\frac{\\sum_i s_i(t)w_i}{\\sum_i w_i}',
  '$$',
  '',
  '```nginx',
  'return 301 https://$host$request_uri;',
  '```'
].join('\n');

const output = convertObsidianSyntax(input);
assert.match(output, /\{% mermaid %\}\nflowchart LR\n  A --> B\n\{% endmermaid %\}/);
assert.match(output, /\{% note danger %\}\n\*\*线性外推的边界\*\*\n斜率不足时应显示 \*\*无法推算\*\*。\n\{% endnote %\}/);
assert.match(output, /行内公式 <script type="math\/tex">d_i=1<\/script>。/);
assert.match(output, /百分比 <script type="math\/tex">10\\\\%<\/script>。/);
assert.match(output, /<script type="math\/tex; mode=display">\nHI\(t\)=\\frac\{\\sum_i s_i\(t\)w_i\}\{\\sum_i w_i\}\n<\/script>/);
assert.match(output, /```nginx\nreturn 301 https:\/\/\$host\$request_uri;\n```/);

console.log('Obsidian rendering conversion tests passed');
