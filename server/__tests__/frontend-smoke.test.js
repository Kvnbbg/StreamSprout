const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const readFile = (relativePath) =>
  fs.readFileSync(path.join(process.cwd(), relativePath), 'utf8');

test('public dashboard exposes primary navigation sections', () => {
  const html = readFile('public/index.html');

  const requiredLinks = ['Dashboard', 'Roster', 'Analytics', 'Scouting', 'Settings'];
  for (const link of requiredLinks) {
    assert.match(html, new RegExp(`>${link}<`), `Missing nav link: ${link}`);
  }
});

test('public dashboard mobile menu can open and close through nav toggle script', () => {
  const script = readFile('public/script.js');

  assert.match(script, /navToggle\.addEventListener\('click'/);
  assert.match(script, /document\.body\.classList\.toggle\('nav-open'\)/);
  assert.match(script, /navToggle\.setAttribute\('aria-expanded', String\(isOpen\)\)/);
  assert.match(script, /navLinks\.forEach\(/);
  assert.match(script, /document\.body\.classList\.remove\('nav-open'\)/);
});

test('legacy page keeps popup entry point and associated trigger interactions', () => {
  const legacyHtml = readFile('index2.html');
  const legacyScript = readFile('script.js');

  assert.match(legacyHtml, /id="chat-box"/);
  assert.match(legacyHtml, /id="chat-trigger"/);
  assert.match(legacyScript, /\$\('#chat-trigger'\)\.on\('click'/);
  assert.match(legacyScript, /chatBox\.toggle\(\)/);
  assert.match(legacyScript, /userInput\.focus\(\)/);
});
