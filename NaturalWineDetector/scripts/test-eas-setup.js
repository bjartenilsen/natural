#!/usr/bin/env node

const { execSync } = require('child_process');

console.log('🔍 Testing EAS CLI setup...\n');

try {
  // Check Node.js version
  const nodeVersion = process.version;
  console.log(`Node.js version: ${nodeVersion}`);
  
  const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
  if (majorVersion < 20) {
    console.error('❌ Node.js 20+ is required for EAS CLI');
    process.exit(1);
  }
  console.log('✅ Node.js version is compatible\n');

  // Test EAS CLI installation
  console.log('📦 Testing EAS CLI installation...');
  try {
    const easVersion = execSync('eas --version', { encoding: 'utf8' }).trim();
    console.log(`✅ EAS CLI is installed: ${easVersion}`);
  } catch (error) {
    console.log('⚠️  EAS CLI not found. Installing...');
    execSync('npm install -g eas-cli@latest', { stdio: 'inherit' });
    const easVersion = execSync('eas --version', { encoding: 'utf8' }).trim();
    console.log(`✅ EAS CLI installed: ${easVersion}`);
  }

  // Test Expo CLI
  console.log('\n📦 Testing Expo CLI...');
  try {
    const expoVersion = execSync('npx expo --version', { encoding: 'utf8' }).trim();
    console.log(`✅ Expo CLI is available: ${expoVersion}`);
  } catch (error) {
    console.log('⚠️  Expo CLI not found. Installing...');
    execSync('npm install -g @expo/cli@latest', { stdio: 'inherit' });
    const expoVersion = execSync('npx expo --version', { encoding: 'utf8' }).trim();
    console.log(`✅ Expo CLI installed: ${expoVersion}`);
  }

  console.log('\n🎉 EAS setup test completed successfully!');
  console.log('\nNext steps:');
  console.log('1. Run: eas login');
  console.log('2. Run: eas build --platform android --profile preview');

} catch (error) {
  console.error('❌ EAS setup test failed:', error.message);
  process.exit(1);
}