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

## Getting Started

1. Install dependencies:
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

## Dependencies

- **React Native/Expo**: Cross-platform mobile development
- **TypeScript**: Type safety and better developer experience
- **SQLite**: Local data persistence
- **React Navigation**: Navigation between screens
- **Expo Image Picker**: Camera and photo functionality
- **Expo Location**: GPS location services
- **Axios**: HTTP client for API calls