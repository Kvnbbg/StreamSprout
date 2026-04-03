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
  assert.match(script, /event\.key === 'Escape'/);
  assert.match(script, /navToggle\.focus\(\)/);
});

test('public dashboard forms expose busy states while async requests are in progress', () => {
  const script = readFile('public/script.js');

  assert.match(script, /setButtonBusyState/);
  assert.match(script, /button\.disabled = isBusy/);
  assert.match(script, /setButtonBusyState\(submitButton, true, 'Saving\.\.\.'\)/);
  assert.match(script, /setButtonBusyState\(askButton, true, 'Thinking\.\.\.'\)/);
  assert.match(script, /askInput\.disabled = true/);
  assert.match(script, /askInput\.removeAttribute\('aria-busy'\)/);
});

test('assistant journey preserves user prompt after request failures', () => {
  const script = readFile('public/script.js');

  assert.match(script, /askInput\.value = question/);
  assert.match(script, /askInput\.focus\(\)/);
});

test('roster journey tolerates malformed payloads from API responses', () => {
  const script = readFile('public/script.js');

  assert.match(script, /const toPlayerList = \(value\) => \(Array\.isArray\(value\) \? value : \[\]\)/);
  assert.match(script, /const data = toPlayerList\(await response\.json\(\)\)/);
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
