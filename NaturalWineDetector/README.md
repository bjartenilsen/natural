# Natural Wine Detector

An Android mobile application that uses ChatGPT's image analysis capabilities to identify and assess whether a wine is a natural wine based on a photo taken by the user.

## Features

- Take photos of wine bottles for analysis
- AI-powered natural wine detection with confidence scores
- GPS location tracking for wine experiences
- Local data storage for offline functionality
- Wine history and personal notes

## Project Structure

```
src/
├── components/     # Reusable UI components
├── screens/        # Screen components
├── services/       # Business logic and API services
├── repositories/   # Data access layer
├── hooks/          # Custom React hooks
├── types/          # TypeScript type definitions
├── utils/          # Utility functions and constants
└── context/        # React Context providers
```

## Prerequisites

- **Node.js**: Version 20.0.0 or higher (required for compatibility)
- **npm**: Latest version
- **Expo CLI**: `npm install -g @expo/cli`
- **EAS CLI**: `npm install -g eas-cli` (for building)

### Node.js Version Requirements

This project requires Node.js 20+ due to dependency compatibility issues. If you encounter errors like:
```
error minimatch@10.0.3: The engine "node" is incompatible with this module. Expected version "20 || >=22". Got "18.x.x"
```

**Solutions:**
1. **Upgrade Node.js**: Download Node.js 20+ from [nodejs.org](https://nodejs.org/)
2. **Use nvm** (recommended):
   ```bash
   nvm install 20.11.1
   nvm use 20.11.1
   ```
3. **Check version**: `node --version` should show 20.x.x or higher

## Getting Started

1. Ensure you have Node.js 20+ installed:
   ```bash
   node --version  # Should be 20.0.0 or higher
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm start
   ```

3. Run on Android:
   ```bash
   npm run android
   ```

## Development

- **Lint code**: `npm run lint`
- **Fix linting issues**: `npm run lint:fix`
- **Type checking**: `npm run type-check`

## Architecture

This project follows clean architecture principles with clear separation between:
- UI Layer (Components/Screens)
- Business Logic Layer (Services/Hooks)
- Data Layer (Repositories)

## Building with EAS

To build the app for production:

1. **Install EAS CLI**:
   ```bash
   npm install -g eas-cli
   ```

2. **Login to Expo**:
   ```bash
   eas login
   ```

3. **Build for Android**:
   ```bash
   eas build --platform android --profile preview
   ```

### GitHub Actions Setup

For automated builds, add an `EXPO_TOKEN` secret to your repository:
1. Go to your Expo account settings
2. Generate an access token
3. Add it as `EXPO_TOKEN` in GitHub repository secrets

## Dependencies

- **React Native/Expo**: Cross-platform mobile development
- **TypeScript**: Type safety and better developer experience
- **SQLite**: Local data persistence
- **React Navigation**: Navigation between screens
- **Expo Image Picker**: Camera and photo functionality
- **Expo Location**: GPS location services
- **Axios**: HTTP client for API calls