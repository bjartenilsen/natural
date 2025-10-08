# Technology Stack & Development Guide

## Core Technologies
- **Framework**: React Native with Expo SDK ~54.0
- **Language**: TypeScript with strict mode enabled
- **Database**: SQLite via expo-sqlite for local persistence
- **API Client**: Axios for HTTP requests to OpenAI ChatGPT API
- **Navigation**: React Navigation 7 with stack navigator
- **State Management**: React Context + useReducer pattern

## Key Dependencies
- **Image Handling**: expo-image-picker, @bam.tech/react-native-image-resizer
- **Location Services**: expo-location for GPS coordinates
- **Permissions**: expo-permissions for camera and location access
- **Security**: expo-crypto for secure data handling
- **UI**: react-native-safe-area-context, react-native-screens

## Development Commands

### Setup & Installation
```bash
npm install                 # Install dependencies
```

### Development
```bash
npm start                   # Start Expo development server
npm run android            # Run on Android device/emulator
npm run ios                # Run on iOS device/simulator (future)
npm run web                # Run in web browser
```

### Code Quality
```bash
npm run lint               # Run ESLint checks
npm run lint:fix           # Auto-fix linting issues
npm run type-check         # TypeScript type checking without emit
```

## Code Style & Linting
- **ESLint**: Configured with TypeScript support and React Native rules
- **Rules**: No console warnings, prefer const, no var, strict TypeScript
- **Ignored**: node_modules, dist, build, .expo directories
- **File Extensions**: .js, .jsx, .ts, .tsx supported

## Build System
- **Expo CLI**: Primary build and development tool
- **TypeScript**: Extends expo/tsconfig.base with strict mode
- **Metro Bundler**: Default React Native bundler via Expo
- **Platform**: Android-first with cross-platform React Native code

## Architecture Patterns
- **Clean Architecture**: UI → Business Logic → Data layers
- **Repository Pattern**: Data access abstraction
- **Service Layer**: External API and device service integrations
- **Custom Hooks**: Reusable business logic and state management
- **Context Providers**: Global state management without external libraries