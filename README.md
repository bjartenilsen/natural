# Natural Wine Detector 🍷

An AI-powered mobile app that uses ChatGPT's image analysis to identify natural wines from photos. Built with React Native and Expo.

## Features

- 📸 **AI Wine Analysis**: Take photos of wine bottles and get AI-powered natural wine detection
- 🎯 **Confidence Scoring**: Get confidence levels for each analysis
- 📍 **Location Tagging**: Automatically tag where you discovered wines
- 📚 **Wine History**: Keep track of all your analyzed wines
- 📝 **Personal Notes**: Add tasting notes and consumption tracking
- 🔒 **Local Storage**: All data stored locally on your device using SQLite
- ♿ **Accessibility**: Full screen reader support and accessibility features

## Installation

### Prerequisites

- OpenAI API key (for wine analysis)
- Android device (Android 7.0+) or iOS device (iOS 12.0+)

### Download

1. Go to the [Releases](https://github.com/yourusername/natural-wine-detector/releases) page
2. Download the latest version:
   - **Android**: Download `natural-wine-detector-android.apk`
   - **iOS**: Download `natural-wine-detector-ios.ipa`

### Android Installation

1. Enable "Install from Unknown Sources" in your Android settings
2. Download the APK file
3. Open the APK file and follow installation prompts
4. Grant camera and location permissions when prompted

### iOS Installation

iOS installation requires a developer account or enterprise distribution:

1. Install using Xcode or a mobile device management solution
2. Trust the developer certificate in Settings > General > Device Management
3. Grant camera and location permissions when prompted

## Setup

1. Launch the app
2. You'll be prompted to enter your OpenAI API key on first use
3. Grant camera permissions for wine bottle photography
4. Grant location permissions for wine discovery tracking (optional)

## Usage

1. **Take a Photo**: Point your camera at a wine bottle and tap the capture button
2. **AI Analysis**: The app will analyze the image using ChatGPT's vision capabilities
3. **View Results**: See if the wine is natural with confidence scoring and explanation
4. **Log Experience**: Add notes about whether you drank it and your thoughts
5. **Browse History**: View all your past wine analyses and details

## Development

### Prerequisites

- Node.js 18+
- npm or yarn
- Expo CLI
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)

### Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/natural-wine-detector.git
cd natural-wine-detector

# Install dependencies
cd NaturalWineDetector
npm install --legacy-peer-deps

# Start development server
npm start
```

### Building

The app uses Expo Application Services (EAS) for building:

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Build for Android
eas build --platform android --profile production

# Build for iOS
eas build --platform ios --profile production
```

## Architecture

- **Frontend**: React Native with Expo
- **Navigation**: React Navigation 6
- **Database**: SQLite with expo-sqlite
- **State Management**: React Context + useReducer
- **AI Integration**: OpenAI ChatGPT API
- **Image Processing**: expo-image-picker + image compression
- **Location**: expo-location

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Privacy

- All wine data is stored locally on your device
- Images are sent to OpenAI for analysis but not stored
- Location data is only stored locally if you grant permission
- No personal data is collected or transmitted to third parties

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

If you encounter any issues:

1. Check the [Issues](https://github.com/yourusername/natural-wine-detector/issues) page
2. Create a new issue with detailed information
3. Include your device type, OS version, and app version

## Acknowledgments

- OpenAI for ChatGPT API
- Expo team for the excellent development platform
- React Native community for the robust ecosystem