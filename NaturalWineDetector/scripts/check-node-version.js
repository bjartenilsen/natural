#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Read package.json
const packageJsonPath = path.join(__dirname, '../package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

const currentVersion = process.version;
const requiredVersion = packageJson.engines.node;

console.log(`Current Node.js version: ${currentVersion}`);
console.log(`Required Node.js version: ${requiredVersion}`);

// Simple version check for >=20.0.0
const currentMajor = parseInt(currentVersion.slice(1).split('.')[0]);
const requiredMajor = 20;

if (currentMajor < requiredMajor) {
  console.error(`❌ Node.js version ${currentVersion} does not satisfy requirement ${requiredVersion}`);
  console.error('Please upgrade to Node.js 20.0.0 or higher');
  console.error('Visit https://nodejs.org/ to download the latest version');
  process.exit(1);
} else {
  console.log('✅ Node.js version is compatible');
}