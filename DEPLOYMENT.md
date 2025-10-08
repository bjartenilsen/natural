# Deployment Guide

This guide explains how to set up automated builds and releases for the Natural Wine Detector app.

## GitHub Actions Setup

### Required Secrets

Add these secrets to your GitHub repository (Settings > Secrets and variables > Actions):

#### Expo Secrets
```
EXPO_TOKEN=your_expo_access_token
EXPO_USERNAME=your_expo_username  
EXPO_PASSWORD=your_expo_password
```

To get these values:
1. Create an Expo account at [expo.dev](https://expo.dev)
2. Install EAS CLI: `npm install -g eas-cli`
3. Login: `eas login`
4. Create access token: `eas build:configure`

### Workflows

The repository includes two GitHub Actions workflows:

#### 1. Build Workflow (`.github/workflows/build.yml`)
- **Triggers**: Push to `main` or `develop` branches, Pull Requests to `main`
- **Actions**:
  - Runs linting and type checking
  - Builds preview APK for Android on pushes
  - Comments on PRs with build status

#### 2. Release Workflow (`.github/workflows/release.yml`)
- **Triggers**: Push of version tags (e.g., `v1.0.0`)
- **Actions**:
  - Creates GitHub release with changelog
  - Builds production APK for Android
  - Builds production IPA for iOS
  - Uploads binaries to GitHub release

## Creating a Release

### 1. Prepare Release

1. Update version in `NaturalWineDetector/package.json`
2. Update `CHANGELOG.md` with new version details
3. Commit changes:
   ```bash
   git add .
   git commit -m "Prepare release v1.0.0"
   git push origin main
   ```

### 2. Create Release Tag

```bash
# Create and push tag
git tag v1.0.0
git push origin v1.0.0
```

### 3. Monitor Build

1. Go to GitHub Actions tab in your repository
2. Watch the "Release" workflow progress
3. Builds typically take:
   - Android: 5-10 minutes
   - iOS: 10-20 minutes

### 4. Download Artifacts

Once complete, the release page will have:
- `natural-wine-detector-android.apk` - Android installation file
- `natural-wine-detector-ios.ipa` - iOS installation file

## Manual Building

### Prerequisites

1. Install dependencies:
   ```bash
   npm install -g @expo/cli eas-cli
   ```

2. Login to Expo:
   ```bash
   eas login
   ```

### Android Build

```bash
cd NaturalWineDetector

# Development build
eas build --platform android --profile development

# Production build
eas build --platform android --profile production
```

### iOS Build

```bash
cd NaturalWineDetector

# Development build  
eas build --platform ios --profile development

# Production build
eas build --platform ios --profile production
```

### Download Builds

```bash
# List recent builds
eas build:list

# Download specific build
eas build:download [BUILD_ID]
```

## Distribution

### Android Distribution

#### Option 1: Direct APK Installation
1. Enable "Install from Unknown Sources" on Android device
2. Download APK from GitHub release
3. Install directly on device

#### Option 2: Google Play Store
1. Create Google Play Console account
2. Upload APK/AAB to Play Console
3. Follow Play Store review process

### iOS Distribution

#### Option 1: Developer Installation
1. Requires Apple Developer account ($99/year)
2. Install via Xcode or Apple Configurator
3. Trust developer certificate on device

#### Option 2: App Store
1. Requires Apple Developer account
2. Upload IPA to App Store Connect
3. Follow App Store review process

#### Option 3: TestFlight (Beta)
1. Upload to App Store Connect
2. Add beta testers
3. Distribute via TestFlight app

## Environment Configuration

### Development
- Uses development Expo profile
- Includes debugging tools
- Hot reloading enabled

### Preview
- Internal distribution
- Production-like build
- No debugging tools

### Production
- App store ready
- Optimized bundle
- Code signing for distribution

## Troubleshooting

### Build Failures

1. **Dependency Issues**:
   ```bash
   rm -rf node_modules package-lock.json
   npm install --legacy-peer-deps
   ```

2. **EAS Authentication**:
   ```bash
   eas logout
   eas login
   ```

3. **Build Timeout**:
   - Check Expo dashboard for detailed logs
   - Increase build timeout in `eas.json`

### Common Issues

- **Android**: Ensure Java 17 is installed
- **iOS**: Requires macOS for local builds
- **Permissions**: Check camera/location permissions in app.json

## Monitoring

### Build Status
- Monitor builds at [expo.dev](https://expo.dev)
- Check GitHub Actions for CI/CD status
- Review build logs for errors

### App Performance
- Use Expo Analytics for crash reporting
- Monitor user feedback on app stores
- Check GitHub Issues for bug reports

## Security

### API Keys
- Store OpenAI API key securely in app
- Never commit API keys to repository
- Use environment variables for sensitive data

### Code Signing
- iOS requires Apple Developer certificates
- Android uses Expo's signing service
- Keep signing keys secure and backed up