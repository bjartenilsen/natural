import { NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../types/AppTypes';
import { WineAnalysisResult, LocationData } from '../types/WineTypes';

/**
 * Type-safe navigation helpers with parameter validation
 */
export class NavigationUtils {
  /**
   * Navigate to Analysis screen with required parameters
   */
  static navigateToAnalysis(
    navigation: NavigationProp<RootStackParamList>,
    imageUri: string,
    location?: LocationData
  ) {
    if (!imageUri || imageUri.trim() === '') {
      throw new Error('Image URI is required for analysis navigation');
    }

    navigation.navigate('Analysis', {
      imageUri,
      location,
    });
  }

  /**
   * Navigate to Wine Logging screen with required parameters
   */
  static navigateToWineLogging(
    navigation: NavigationProp<RootStackParamList>,
    analysisResult: WineAnalysisResult,
    imageUri: string,
    capturedLocation?: LocationData
  ) {
    if (!analysisResult) {
      throw new Error('Analysis result is required for wine logging navigation');
    }
    if (!imageUri || imageUri.trim() === '') {
      throw new Error('Image URI is required for wine logging navigation');
    }

    navigation.navigate('WineLogging', {
      analysisResult,
      imageUri,
      capturedLocation,
    });
  }

  /**
   * Navigate to Wine Detail screen with required parameters
   */
  static navigateToWineDetail(
    navigation: NavigationProp<RootStackParamList>,
    wineId: string
  ) {
    if (!wineId || wineId.trim() === '') {
      throw new Error('Wine ID is required for wine detail navigation');
    }

    navigation.navigate('WineDetail', {
      wineId,
    });
  }

  /**
   * Navigate to History screen
   */
  static navigateToHistory(navigation: NavigationProp<RootStackParamList>) {
    navigation.navigate('History');
  }

  /**
   * Navigate to Camera screen (main screen)
   */
  static navigateToCamera(navigation: NavigationProp<RootStackParamList>) {
    navigation.navigate('Camera');
  }

  /**
   * Go back with validation
   */
  static goBack(navigation: NavigationProp<RootStackParamList>) {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      // If can't go back, navigate to main screen
      NavigationUtils.navigateToCamera(navigation);
    }
  }
}