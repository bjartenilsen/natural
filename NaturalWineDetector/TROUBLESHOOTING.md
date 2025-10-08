# Troubleshooting Guide

## Node.js Version Issues

### Problem: EAS Build Fails with minimatch Error

**Error Message:**
```
error minimatch@10.0.3: The engine "node" is incompatible with this module. 
Expected version "20 || >=22". Got "18.x.x"
```

**Root Cause:**
- Modern dependencies require Node.js 20+
- GitHub Actions or local environment using Node.js 18

**Solutions:**

#### 1. Local Development
```bash
# Check current version
node --version

# Install Node.js 20+ from nodejs.org
# OR use nvm (recommended)
nvm install 20.11.1
nvm use 20.11.1

# Verify fix
npm run check-node
```

#### 2. GitHub Actions
The workflows are configured to use Node.js 20.11.1 automatically.

#### 3. EAS Builds
The `eas.json` configuration specifies Node.js 20.11.1 for all build profiles.

## EAS Build Setup

### Prerequisites
1. **Node.js 20+** (required)
2. **EAS CLI**: `npm install -g eas-cli`
3. **Expo account** with access token

### Testing EAS Setup
```bash
# Test your local setup
npm run test-eas

# Check Node.js compatibility
npm run check-node
```

### Manual EAS Build
```bash
# Login to Expo
eas login

# Build Android APK
eas build --platform android --profile preview

# Build for production
eas build --platform android --profile production
```

## GitHub Actions Setup

### Required Secrets
- `EXPO_TOKEN`: Your Expo access token

### Workflows
1. **CI** (`.github/workflows/ci.yml`): Runs tests and linting
2. **Build Preview** (`.github/workflows/build-preview.yml`): Builds APK with EAS
3. **Test Node Setup** (`.github/workflows/test-node-setup.yml`): Verifies Node.js 20 setup

## Common Issues

### 1. "expo-cli is deprecated" Warning
**Solution:** Use `npx expo` instead of global `expo-cli`

### 2. EAS CLI Not Found
**Solution:** 
```bash
npm install -g eas-cli@latest
```

### 3. Authentication Issues
**Solution:**
```bash
eas logout
eas login
```

### 4. Build Fails on GitHub Actions
**Checklist:**
- [ ] EXPO_TOKEN secret is set
- [ ] Node.js 20.11.1 is specified in workflow
- [ ] Dependencies install successfully
- [ ] TypeScript compilation passes
- [ ] ESLint passes

## Getting Help

1. **Check logs**: Review GitHub Actions logs for specific errors
2. **Test locally**: Run `npm run test-eas` to verify setup
3. **Verify versions**: Ensure Node.js 20+ is being used
4. **EAS documentation**: https://docs.expo.dev/build/introduction/