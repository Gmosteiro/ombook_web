#!/usr/bin/env node
const { spawn } = require('child_process');
const path = require('path');

function quoted(arg) {
  if (!arg) return '""';
  // simple quoting for windows cmd and posix
  if (process.platform === 'win32') {
    return '"' + String(arg).replace(/"/g, '""') + '"';
  }
  return String(arg);
}

const args = process.argv.slice(2);
const cwd = process.cwd();
const binDir = path.join(cwd, 'node_modules', 'allure-commandline', 'dist', 'bin');

if (process.platform === 'win32') {
  const bat = path.join(binDir, 'allure.bat');
  // Build a single cmd /c invocation with properly quoted parts
  const quotedBat = quoted(bat);
  const quotedArgs = args.map(a => quoted(a)).join(' ');
  const cmd = `${quotedBat} ${quotedArgs}`;
  const child = spawn('cmd', ['/c', cmd], { stdio: 'inherit' });
  child.on('close', code => process.exit(code));
} else {
  const exe = path.join(binDir, 'allure');
  const child = spawn(exe, args, { stdio: 'inherit' });
  child.on('close', code => process.exit(code));
}
