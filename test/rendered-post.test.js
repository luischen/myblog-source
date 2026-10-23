const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const page = path.join(root, 'public', '2026', '10', '23', 'manulism-work',
  '20_Domain_Knowledge', '24 预测性维护', '02 设备健康分设计与实现', 'index.html');
const html = fs.readFileSync(page, 'utf8');

assert.match(html, /class="mermaid-wrap"/);
assert.match(html, /loadMermaid/);
assert.match(html, /class="note danger flat"/);
assert.match(html, /class="note success flat"/);
assert.doesNotMatch(html, /\[!caution\]|\[!tip\]/);
assert.match(html, /MathJax-script/);
assert.match(html, /<script type="math\/tex; mode=display">\s*HI\(t\)=\\operatorname/);
assert.match(html, /<script type="math\/tex">100\\times10\\%\+60\\times45\\%\+80\\times45\\%=73<\/script>/);

console.log('Rendered article contains Mermaid, callouts, and intact math');
