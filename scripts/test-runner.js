#!/usr/bin/env node

const { spawn } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const unsupportedArgs = new Set(['--runInBand']);
const incomingArgs = process.argv.slice(2);
const forwardedArgs = incomingArgs.filter((arg) => !unsupportedArgs.has(arg));
const removedArgs = incomingArgs.filter((arg) => unsupportedArgs.has(arg));

if (removedArgs.length > 0) {
  process.stderr.write(
    `[test-runner] Ignoring unsupported Node test flag(s): ${removedArgs.join(', ')}\n`
  );
}

const testsDir = path.join(process.cwd(), 'server', '__tests__');
const defaultTestFiles = fs
  .readdirSync(testsDir)
  .filter((name) => name.endsWith('.test.js'))
  .map((name) => path.join('server', '__tests__', name));

const child = spawn(process.execPath, ['--test', ...forwardedArgs, ...defaultTestFiles], {
  stdio: 'inherit',
  env: process.env,
});

child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 1);
});
