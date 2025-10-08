# GitHub Actions Workflow Fixes

## Problem Resolved
Fixed the `minimatch@10.0.3` Node.js compatibility error that was causing EAS builds to fail.

## Root Cause
- The `expo/expo-github-action@v8` was using Node.js 18.20.8 internally
- Modern dependencies like `minimatch@10.0.3` require Node.js 20+
- This created a version conflict during EAS CLI installation

## Solution Applied

### 1. Removed Problematic Action
- ❌ Removed `expo/expo-github-action@v8` from all workflows
- ✅ Replaced with direct EAS CLI installation using Node.js 20

### 2. Updated All Workflows
**NaturalWineDetector/.github/workflows/:**
- ✅ `ci.yml` - Uses Node.js 20.11.1, runs tests and linting
- ✅ `build-preview.yml` - Uses Node.js 20.11.1, direct EAS CLI installation
- ✅ `test-node-setup.yml` - Verifies Node.js 20 setup and EAS CLI installation

**Root .github/workflows/:**
- ❌ Removed problematic `build.yml` and `release.yml`
- ✅ Added `main.yml` as a redirect/info workflow

### 3. EAS CLI Installation Pattern
```yaml
- name: Setup EAS CLI
  run: |
    npm install -g @expo/cli@latest eas-cli@latest
    echo "EAS CLI version: $(eas --version)"
    echo "Expo CLI version: $(npx expo --version)"

- name: Authenticate with Expo
  run: eas login --non-interactive
  env:
    EXPO_TOKEN: ${{ secrets.EXPO_TOKEN }}
```

### 4. Node.js Version Enforcement
- All workflows use Node.js 20.11.1
- Package.json specifies `"engines": {"node": ">=20.0.0"}`
- EAS.json specifies Node.js 20.11.1 for all build profiles

## Verification Steps

### Local Testing
```bash
# Check Node.js version
npm run check-node

# Test EAS setup
npm run test-eas

# Run type checking
npm run type-check

# Run linting
npm run lint
```

### GitHub Actions
1. **CI Workflow**: Runs on every push/PR, verifies code quality
2. **Build Preview**: Runs EAS builds with proper Node.js 20 setup
3. **Test Node Setup**: Verifies Node.js 20 compatibility

## Expected Results
- ✅ No more `minimatch` version errors
- ✅ EAS builds complete successfully
- ✅ All GitHub Actions workflows pass
- ✅ Consistent Node.js 20 environment across all processes

## Troubleshooting
If you still see the old error:
1. Clear GitHub Actions cache
2. Ensure you've pushed the latest workflow files
3. Check that no other workflows are using the old action
4. Verify EXPO_TOKEN secret is set in repository settings