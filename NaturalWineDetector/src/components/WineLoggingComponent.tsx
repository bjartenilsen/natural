import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { WineAnalysisResult, WineRecord, LocationData } from '../types/WineTypes';

interface WineLoggingProps {
  analysisResult: WineAnalysisResult;
  imageUri: string;
  capturedLocation?: LocationData;
  onSave: (wineRecord: WineRecord) => void;
  onError: (error: string) => void;
}

export const WineLoggingComponent: React.FC<WineLoggingProps> = ({
  analysisResult,
  imageUri,
  capturedLocation,
  onSave,
  onError,
}) => {
  const [consumed, setConsumed] = useState<boolean | null>(null);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const handleConsumptionChoice = (didConsume: boolean) => {
    setConsumed(didConsume);
  };

  const validateInput = (): boolean => {
    if (consumed === null) {
      Alert.alert(
        'Selection Required',
        'Please indicate whether you drank this wine or not.',
        [{ text: 'OK' }]
      );
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateInput()) {
      return;
    }

    try {
      setSaving(true);

      const wineRecord: WineRecord = {
        id: `wine_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
        imageUri,
        analysisResult,
        consumed: consumed!,
        location: capturedLocation,
        notes: notes.trim() || undefined,
        createdAt: new Date(),
      };

      onSave(wineRecord);
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to save wine record';
      onError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const getConfidenceColor = (score: number): string => {
    if (score >= 80) return '#4CAF50';
    if (score >= 60) return '#FF9800';
    return '#F44336';
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Wine Analysis Summary */}
        <View style={styles.summaryContainer}>
          <View style={styles.imageContainer}>
            <Image source={{ uri: imageUri }} style={styles.image} />
          </View>
          
          <View style={styles.analysisInfo}>
            <Text style={styles.analysisTitle}>
              {analysisResult.isNaturalWine ? '🍷 Natural Wine' : '🍾 Not Natural Wine'}
            </Text>
            <View style={styles.confidenceContainer}>
              <Text style={styles.confidenceText}>
                Confidence: {analysisResult.confidenceScore}%
              </Text>
              <View 
                style={[
                  styles.confidenceDot, 
                  { backgroundColor: getConfidenceColor(analysisResult.confidenceScore) }
                ]} 
              />
            </View>
          </View>
        </View>

        {/* Consumption Question */}
        <View style={styles.questionContainer}>
          <Text style={styles.questionTitle}>Did you drink this wine?</Text>
          <Text style={styles.questionSubtitle}>
            Help us track your natural wine experiences
          </Text>
          
          <View style={styles.choiceContainer}>
            <TouchableOpacity
              style={[
                styles.choiceButton,
                consumed === true && styles.choiceButtonSelected,
              ]}
              onPress={() => handleConsumptionChoice(true)}
            >
              <Text style={styles.choiceIcon}>🍷</Text>
              <Text 
                style={[
                  styles.choiceText,
                  consumed === true && styles.choiceTextSelected,
                ]}
              >
                Yes, I drank it
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.choiceButton,
                consumed === false && styles.choiceButtonSelected,
              ]}
              onPress={() => handleConsumptionChoice(false)}
            >
              <Text style={styles.choiceIcon}>📷</Text>
              <Text 
                style={[
                  styles.choiceText,
                  consumed === false && styles.choiceTextSelected,
                ]}
              >
                Just analyzed it
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Notes Section */}
        <View style={styles.notesContainer}>
          <Text style={styles.notesTitle}>Personal Notes</Text>
          <Text style={styles.notesSubtitle}>
            Add your thoughts about this wine (optional)
          </Text>
          
          <TextInput
            style={styles.notesInput}
            placeholder="How did it taste? Where did you get it? Any other thoughts..."
            placeholderTextColor="#9CA3AF"
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            maxLength={500}
          />
          <Text style={styles.characterCount}>
            {notes.length}/500 characters
          </Text>
        </View>

        {/* Location Info */}
        {capturedLocation && (
          <View style={styles.locationContainer}>
            <Text style={styles.locationTitle}>📍 Location Captured</Text>
            <Text style={styles.locationText}>
              Lat: {capturedLocation.latitude.toFixed(6)}
            </Text>
            <Text style={styles.locationText}>
              Lng: {capturedLocation.longitude.toFixed(6)}
            </Text>
            <Text style={styles.locationAccuracy}>
              Accuracy: ±{capturedLocation.accuracy.toFixed(0)}m
            </Text>
          </View>
        )}

        {/* Analysis Details */}
        <View style={styles.detailsContainer}>
          <Text style={styles.detailsTitle}>Analysis Details</Text>
          <Text style={styles.detailsText}>{analysisResult.explanation}</Text>
          <Text style={styles.timestamp}>
            Analyzed on {analysisResult.timestamp.toLocaleDateString()} at{' '}
            {analysisResult.timestamp.toLocaleTimeString()}
          </Text>
        </View>
      </ScrollView>

      {/* Save Button */}
      <View style={styles.saveContainer}>
        <TouchableOpacity
          style={[
            styles.saveButton,
            consumed === null && styles.saveButtonDisabled,
            saving && styles.saveButtonDisabled,
          ]}
          onPress={handleSave}
          disabled={consumed === null || saving}
        >
          <Text style={styles.saveButtonText}>
            {saving ? 'Saving...' : 'Save Wine Record'}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  summaryContainer: {
    flexDirection: 'row',
    padding: 20,
    backgroundColor: '#F8F9FA',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  imageContainer: {
    marginRight: 16,
  },
  image: {
    width: 80,
    height: 120,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  analysisInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  analysisTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  confidenceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  confidenceText: {
    fontSize: 14,
    color: '#6B7280',
    marginRight: 8,
  },
  confidenceDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  questionContainer: {
    padding: 20,
  },
  questionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  questionSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  choiceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  choiceButton: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  choiceButtonSelected: {
    borderColor: '#6B46C1',
    backgroundColor: '#F3F4F6',
  },
  choiceIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  choiceText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6B7280',
    textAlign: 'center',
  },
  choiceTextSelected: {
    color: '#6B46C1',
    fontWeight: '600',
  },
  notesContainer: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  notesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  notesSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
  },
  notesInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1F2937',
    minHeight: 100,
    backgroundColor: '#FFFFFF',
  },
  characterCount: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'right',
    marginTop: 4,
  },
  locationContainer: {
    padding: 20,
    backgroundColor: '#F9FAFB',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  locationTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  locationText: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: 'monospace',
  },
  locationAccuracy: {
    fontSize: 12,
    color: '#9CA3AF',
    fontStyle: 'italic',
    marginTop: 4,
  },
  detailsContainer: {
    padding: 20,
  },
  detailsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  detailsText: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
    marginBottom: 12,
  },
  timestamp: {
    fontSize: 12,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
  saveContainer: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  saveButton: {
    backgroundColor: '#6B46C1',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});