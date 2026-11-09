const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { createRequire } = require('module');

function loadSyncModule() {
  const scriptDir = path.resolve(__dirname, '..', 'scripts');
  const scriptPath = path.join(scriptDir, 'sync-manulism-work.js');
  const source = fs.readFileSync(scriptPath, 'utf8').replace(/\nmain\(\);\s*$/, '\n');
  const sandbox = {
    require: createRequire(scriptPath),
    __dirname: scriptDir,
    process,
    console,
    module: { exports: {} },
    exports: {}
  };
  vm.runInNewContext(source, sandbox, { filename: scriptPath });
  return sandbox.module.exports;
}

function testOnlyPublicNotesAreSyncable() {
  const { parseFrontMatter, shouldSyncNote } = loadSyncModule();
  assert.strictEqual(typeof shouldSyncNote, 'function');

  const publicNote = parseFrontMatter('---\ntitle: Public\nstatus: public\n---\nBody');
  const privateNote = parseFrontMatter('---\ntitle: Draft\nstatus: draft\n---\nBody');
  const missingStatusNote = parseFrontMatter('---\ntitle: Missing\n---\nBody');
  const quotedStatusNote = parseFrontMatter('---\ntitle: Quoted\nstatus: "public"\n---\nBody');

  assert.strictEqual(shouldSyncNote(publicNote.data), true);
  assert.strictEqual(shouldSyncNote(quotedStatusNote.data), true);
  assert.strictEqual(shouldSyncNote(privateNote.data), false);
  assert.strictEqual(shouldSyncNote(missingStatusNote.data), false);
}

function testScheduledPublicationDateSurvivesSync() {
  const { buildPost } = loadSyncModule();
  const note = path.resolve(__dirname, '..', '..', 'knowledgebase', 'Manulism Work',
    '20_Domain_Knowledge', '24 预测性维护', '00 PDM业务领域知识笔记.md');
  const post = buildPost(note);
  assert.match(post, /^date: 2025-06-23 17:07:58$/m);
}

function testPublicNoteLinksUsePublishedPermalinks() {
  const { convertObsidianLinks } = loadSyncModule();
  assert.strictEqual(
    convertObsidianLinks('详见[[02 设备健康分设计与实现|健康指数设计笔记]]'),
    '详见[健康指数设计笔记](/2026/10/23/manulism-work/20_Domain_Knowledge/24%20%E9%A2%84%E6%B5%8B%E6%80%A7%E7%BB%B4%E6%8A%A4/02%20%E8%AE%BE%E5%A4%87%E5%81%A5%E5%BA%B7%E5%88%86%E8%AE%BE%E8%AE%A1%E4%B8%8E%E5%AE%9E%E7%8E%B0/)'
  );
}

function testPrivateNoteLinksBecomePlainText() {
  const { convertObsidianLinks } = loadSyncModule();
  assert.strictEqual(
    convertObsidianLinks('详见[[01 曲线分析系统领域知识扩展|业务扩展笔记]]'),
    '详见业务扩展笔记'
  );
}

testOnlyPublicNotesAreSyncable();
testScheduledPublicationDateSurvivesSync();
testPublicNoteLinksUsePublishedPermalinks();
testPrivateNoteLinksBecomePlainText();
console.log('sync-manulism-work tests passed');
