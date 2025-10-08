# Natural Wine Detector - Installation Guide

## Quick Install

### Android (Recommended)

1. **Download APK**
   - Go to [Releases](https://github.com/yourusername/natural-wine-detector/releases)
   - Download `natural-wine-detector-android.apk`

2. **Enable Unknown Sources**
   - Open Settings > Security
   - Enable "Install from Unknown Sources" or "Allow from this source"

3. **Install**
   - Open the downloaded APK file
   - Tap "Install" and follow prompts
   - Grant camera and location permissions

4. **Setup**
   - Launch the app
   - Enter your OpenAI API key when prompted
   - Start analyzing wines!

### iOS (Advanced Users)

iOS installation requires additional steps due to Apple's security model:

#### Option 1: Developer Installation
1. Requires Apple Developer account or enterprise certificate
2. Download `natural-wine-detector-ios.ipa`
3. Install using Xcode, Apple Configurator, or MDM solution
4. Trust the developer certificate in Settings > General > Device Management

#### Option 2: Wait for App Store
We're working on App Store approval. Check back soon!

## Getting Your OpenAI API Key

1. Go to [OpenAI Platform](https://platform.openai.com)
2. Sign up or log in to your account
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key (starts with `sk-`)
6. Enter it in the app when prompted

**Note**: You'll need to add credit to your OpenAI account for API usage. Wine analysis typically costs $0.01-0.03 per image.

## Permissions

The app requires these permissions:

- **Camera**: To take photos of wine bottles
- **Location** (Optional): To tag where you discovered wines
- **Storage**: To save wine history locally

## Troubleshooting

### Android Issues

**"App not installed"**
- Enable "Install from Unknown Sources"
- Check available storage space
- Try redownloading the APK

**"Parse error"**
- Ensure you downloaded the correct APK
- Check Android version (requires 7.0+)

**Camera not working**
- Grant camera permission in app settings
- Restart the app after granting permissions

### iOS Issues

**"Untrusted Developer"**
- Go to Settings > General > Device Management
- Find the developer profile and tap "Trust"

**App crashes on startup**
- Ensure iOS 12.0 or later
- Restart device and try again

### API Issues

**"Invalid API Key"**
- Double-check your OpenAI API key
- Ensure you have credits in your OpenAI account
- Try generating a new API key

**"Analysis failed"**
- Check internet connection
- Ensure good lighting for wine bottle photos
- Try taking a clearer photo

## Support

Need help? 

1. Check [GitHub Issues](https://github.com/yourusername/natural-wine-detector/issues)
2. Create a new issue with:
   - Device model and OS version
   - App version
   - Description of the problem
   - Screenshots if applicable

## Privacy & Security

- All wine data stays on your device
- Images are only sent to OpenAI for analysis
- No personal information is collected
- API key is stored securely on your device
- Location data (if enabled) is only stored locally

## What's Next?

After installation:

1. **Take your first photo** - Point camera at any wine bottle
2. **Review the analysis** - See AI confidence and explanation  
3. **Log your experience** - Add notes about taste and consumption
4. **Build your collection** - Browse your wine history anytime

Happy wine discovering! 🍷