/**
 * Accessibility utilities for Natural Wine Detector
 */

export interface AccessibilityProps {
  accessible?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  accessibilityRole?: 
    | 'button'
    | 'header'
    | 'image'
    | 'text'
    | 'textbox'
    | 'list'
    | 'listitem'
    | 'none';
  accessibilityState?: {
    disabled?: boolean;
    selected?: boolean;
    checked?: boolean;
    busy?: boolean;
    expanded?: boolean;
  };
  accessibilityValue?: {
    min?: number;
    max?: number;
    now?: number;
    text?: string;
  };
}

/**
 * Create accessibility props for buttons
 */
export const createButtonAccessibility = (
  label: string,
  hint?: string,
  disabled?: boolean
): AccessibilityProps => ({
  accessible: true,
  accessibilityRole: 'button',
  accessibilityLabel: label,
  accessibilityHint: hint,
  accessibilityState: {
    disabled: disabled || false,
  },
});

/**
 * Create accessibility props for images
 */
export const createImageAccessibility = (
  label: string,
  hint?: string
): AccessibilityProps => ({
  accessible: true,
  accessibilityRole: 'image',
  accessibilityLabel: label,
  accessibilityHint: hint,
});

/**
 * Create accessibility props for text inputs
 */
export const createTextInputAccessibility = (
  label: string,
  hint?: string,
  value?: string
): AccessibilityProps => ({
  accessible: true,
  accessibilityRole: 'textbox',
  accessibilityLabel: label,
  accessibilityHint: hint,
  accessibilityValue: value ? { text: value } : undefined,
});

/**
 * Create accessibility props for headers
 */
export const createHeaderAccessibility = (
  label: string
): AccessibilityProps => ({
  accessible: true,
  accessibilityRole: 'header',
  accessibilityLabel: label,
});

/**
 * Create accessibility props for lists
 */
export const createListAccessibility = (
  label: string,
  itemCount?: number
): AccessibilityProps => ({
  accessible: true,
  accessibilityRole: 'list',
  accessibilityLabel: itemCount 
    ? `${label}, ${itemCount} items`
    : label,
});

/**
 * Create accessibility props for list items
 */
export const createListItemAccessibility = (
  label: string,
  hint?: string,
  position?: { index: number; total: number }
): AccessibilityProps => ({
  accessible: true,
  accessibilityRole: 'listitem',
  accessibilityLabel: position 
    ? `${label}, item ${position.index + 1} of ${position.total}`
    : label,
  accessibilityHint: hint,
});

/**
 * Create accessibility props for progress indicators
 */
export const createProgressAccessibility = (
  label: string,
  current: number,
  total: number
): AccessibilityProps => ({
  accessible: true,
  accessibilityLabel: label,
  accessibilityValue: {
    min: 0,
    max: total,
    now: current,
    text: `${current} of ${total}`,
  },
});

/**
 * Create accessibility props for confidence scores
 */
export const createConfidenceAccessibility = (
  score: number,
  isNaturalWine: boolean
): AccessibilityProps => {
  const confidenceLevel = score >= 80 ? 'high' : score >= 60 ? 'medium' : 'low';
  const wineType = isNaturalWine ? 'natural wine' : 'not natural wine';
  
  return {
    accessible: true,
    accessibilityLabel: `Analysis result: ${wineType} with ${confidenceLevel} confidence`,
    accessibilityValue: {
      min: 0,
      max: 100,
      now: score,
      text: `${score} percent confidence`,
    },
  };
};

/**
 * Create accessibility props for wine records
 */
export const createWineRecordAccessibility = (
  isNaturalWine: boolean,
  confidenceScore: number,
  consumed: boolean,
  date: Date
): AccessibilityProps => {
  const wineType = isNaturalWine ? 'Natural wine' : 'Not natural wine';
  const consumedStatus = consumed ? 'consumed' : 'analyzed only';
  const dateString = date.toLocaleDateString();
  
  return {
    accessible: true,
    accessibilityRole: 'button',
    accessibilityLabel: `${wineType}, ${confidenceScore}% confidence, ${consumedStatus}, ${dateString}`,
    accessibilityHint: 'Double tap to view details',
  };
};

/**
 * Announce important changes to screen readers
 */
export const announceForAccessibility = (message: string) => {
  // This would typically use AccessibilityInfo.announceForAccessibility
  // but we'll implement a simple version for now
  console.log(`Accessibility announcement: ${message}`);
};

/**
 * Common accessibility labels
 */
export const AccessibilityLabels = {
  // Navigation
  BACK_BUTTON: 'Go back',
  CLOSE_BUTTON: 'Close',
  MENU_BUTTON: 'Open menu',
  
  // Camera
  CAMERA_CAPTURE: 'Take photo of wine bottle',
  CAMERA_SWITCH: 'Switch camera',
  CAMERA_FLASH: 'Toggle flash',
  
  // Wine Analysis
  WINE_IMAGE: 'Wine bottle photo',
  ANALYSIS_LOADING: 'Analyzing wine image',
  CONFIDENCE_SCORE: 'Analysis confidence score',
  
  // Wine Logging
  CONSUMPTION_YES: 'Mark as consumed',
  CONSUMPTION_NO: 'Mark as analyzed only',
  NOTES_INPUT: 'Personal notes about wine',
  SAVE_WINE: 'Save wine record',
  
  // History
  WINE_HISTORY: 'Wine history list',
  WINE_RECORD: 'Wine record',
  REFRESH_HISTORY: 'Refresh wine history',
  
  // Common
  LOADING: 'Loading',
  ERROR: 'Error occurred',
  SUCCESS: 'Success',
  RETRY: 'Retry action',
} as const;