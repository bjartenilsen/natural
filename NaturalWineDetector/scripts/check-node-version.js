#!/usr/bin/env node

const semver = require('semver');
const packageJson = require('../package.json');

const currentVersion = process.version;
const requiredVersion = packageJson.engines.node;

console.log(`Current Node.js version: ${currentVersion}`);
console.log(`Required Node.js version: ${requiredVersion}`);

if (!semver.satisfies(currentVersion, requiredVersion)) {
  console.error(`❌ Node.js version ${currentVersion} does not satisfy requirement ${requiredVersion}`);
  console.error('Please upgrade to Node.js 20.0.0 or higher');
  console.error('Visit https://nodejs.org/ to download the latest version');
  process.exit(1);
} else {
  console.log('✅ Node.js version is compatible');
}