const fs = require('fs');
const path = require('path');

const blogRoot = path.resolve(__dirname, '..');
const knowledgeRoot = process.env.MANULISM_WORK_DIR || 'D:\\knowledgebase\\Manulism Work';
const outputRoot = path.join(blogRoot, 'source', '_posts', 'manulism-work');
const categoryName = '工作笔记';
const includeDirs = ['10_Architecture', '20_Domain_Knowledge'];
const ignoredDirs = new Set(['.git', '.obsidian', '.agents', '.codex', 'node_modules']);

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function removeDir(dir) {
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if (ignoredDirs.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walk(full));
    } else if (entry.isFile() && entry.name.toLowerCase().endsWith('.md')) {
      files.push(full);
    }
  }
  return files;
}

function parseFrontMatter(text) {
  text = text.replace(/^\uFEFF/, '');
  if (!text.startsWith('---')) return { data: {}, body: text };
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!match) return { data: {}, body: text };
  const data = {};
  for (const line of match[1].split(/\r?\n/)) {
    const simple = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (simple) {
      data[simple[1]] = simple[2].replace(/^['"]|['"]$/g, '').trim();
    }
  }
  return { data, body: text.slice(match[0].length) };
}

function yamlString(value) {
  const escaped = String(value).replace(/"/g, '\\"');
  return `"${escaped}"`;
}

function formatDate(date) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

function titleFrom(file, frontMatter, body) {
  if (frontMatter.title) return frontMatter.title;
  const heading = body.match(/^#\s+(.+)$/m);
  if (heading) return heading[1].trim();
  return path.basename(file, '.md');
}

function cleanTagName(name) {
  return name
    .replace(/^\d+[_\s-]*/, '')
    .replace(/_/g, ' ')
    .trim();
}

function tagsFromRelativePath(relative) {
  const dirs = path.dirname(relative).split(path.sep).filter(Boolean);
  const contentDirs = dirs.slice(1);
  if (contentDirs.length === 0) return [];
  const selectedDirs = contentDirs.length >= 2 ? contentDirs.slice(-2) : contentDirs;
  return Array.from(new Set(selectedDirs.map(cleanTagName).filter(Boolean)));
}

function normalizeLinkTarget(target) {
  return target
    .replace(/\\/g, '/')
    .replace(/\.md$/i, '')
    .replace(/^\/+/, '')
    .trim();
}

function convertObsidianLinks(body) {
  return body.replace(/!?(\[\[([^\]]+)\]\])/g, (full, bracketed, inner) => {
    if (full.startsWith('!')) return full;
    const [rawTarget, rawAlias] = inner.split('|');
    const label = (rawAlias || rawTarget).trim();
    const target = normalizeLinkTarget(rawTarget);
    if (!target || target.startsWith('#')) return label;
    return `[${label}](/${target}/)`;
  });
}

function stripUnsupportedHtml(body) {
  // Hexo allows inline HTML. Keep authored diagrams as-is.
  return body;
}

function buildPost(file) {
  const raw = fs.readFileSync(file, 'utf8');
  const parsed = parseFrontMatter(raw);
  const relative = path.relative(knowledgeRoot, file);
  const stat = fs.statSync(file);
  const title = titleFrom(file, parsed.data, parsed.body);
  const tags = tagsFromRelativePath(relative);
  const frontMatter = [
    '---',
    `title: ${yamlString(title)}`,
    `date: ${formatDate(stat.birthtime || stat.mtime)}`,
    `updated: ${formatDate(stat.mtime)}`,
    'categories:',
    `  - ${categoryName}`,
    'tags:',
    ...tags.map((tag) => `  - ${yamlString(tag)}`),
    `source_path: ${yamlString(relative.replace(/\\/g, '/'))}`,
    '---',
    ''
  ].join('\n');
  const body = stripUnsupportedHtml(convertObsidianLinks(parsed.body)).trimStart();
  return frontMatter + body + (body.endsWith('\n') ? '' : '\n');
}

function main() {
  if (!fs.existsSync(knowledgeRoot)) {
    throw new Error(`Knowledge root not found: ${knowledgeRoot}`);
  }

  removeDir(outputRoot);
  ensureDir(outputRoot);

  let count = 0;
  for (const dir of includeDirs) {
    const fullDir = path.join(knowledgeRoot, dir);
    if (!fs.existsSync(fullDir)) continue;
    for (const file of walk(fullDir)) {
      const relative = path.relative(knowledgeRoot, file);
      const outputFile = path.join(outputRoot, relative);
      ensureDir(path.dirname(outputFile));
      fs.writeFileSync(outputFile, buildPost(file), 'utf8');
      count += 1;
    }
  }

  console.log(`Synced ${count} Manulism Work notes to ${path.relative(blogRoot, outputRoot)}`);
}

main();
