import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { WineAnalysisResult, LocationData } from '../types/WineTypes';
import { ChatGPTService } from '../services/ChatGPTService';

interface WineAnalysisProps {
  imageUri: string;
  location?: LocationData;
  onAnalysisComplete: (result: WineAnalysisResult) => void;
  onError: (error: string) => void;
}

export const WineAnalysisComponent: React.FC<WineAnalysisProps> = ({
  imageUri,
  location,
  onAnalysisComplete,
  onError,
}) => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<WineAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (imageUri) {
      analyzeWine();
    }
  }, [imageUri]);

  const analyzeWine = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const analysisResult = await ChatGPTService.analyzeWineImage(imageUri);
      setResult(analysisResult);
      onAnalysisComplete(analysisResult);
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to analyze wine image';
      setError(errorMessage);
      onError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    analyzeWine();
  };

  const getConfidenceColor = (score: number): string => {
    if (score >= 80) return '#4CAF50'; // Green for high confidence
    if (score >= 60) return '#FF9800'; // Orange for medium confidence
    return '#F44336'; // Red for low confidence
  };

  const getConfidenceText = (score: number): string => {
    if (score >= 80) return 'High Confidence';
    if (score >= 60) return 'Medium Confidence';
    return 'Low Confidence';
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.imageContainer}>
          <Image source={{ uri: imageUri }} style={styles.image} />
        </View>
        
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6B46C1" />
          <Text style={styles.loadingText}>Analyzing wine...</Text>
          <Text style={styles.loadingSubtext}>
            Using AI to determine if this is a natural wine
          </Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.imageContainer}>
          <Image source={{ uri: imageUri }} style={styles.image} />
        </View>
        
        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorTitle}>Analysis Failed</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          
          <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (result) {
    return (
      <View style={styles.container}>
        <View style={styles.imageContainer}>
          <Image source={{ uri: imageUri }} style={styles.image} />
        </View>
        
        <View style={styles.resultContainer}>
          <View style={styles.resultHeader}>
            <Text style={styles.resultIcon}>
              {result.isNaturalWine ? '🍷' : '🍾'}
            </Text>
            <Text style={styles.resultTitle}>
              {result.isNaturalWine ? 'Natural Wine' : 'Not Natural Wine'}
            </Text>
          </View>
          
          <View style={styles.confidenceContainer}>
            <View style={styles.confidenceBar}>
              <View 
                style={[
                  styles.confidenceFill, 
                  { 
                    width: `${result.confidenceScore}%`,
                    backgroundColor: getConfidenceColor(result.confidenceScore)
                  }
                ]} 
              />
            </View>
            <View style={styles.confidenceInfo}>
              <Text style={styles.confidenceScore}>
                {result.confidenceScore}%
              </Text>
              <Text 
                style={[
                  styles.confidenceLabel,
                  { color: getConfidenceColor(result.confidenceScore) }
                ]}
              >
                {getConfidenceText(result.confidenceScore)}
              </Text>
            </View>
          </View>
          
          <View style={styles.explanationContainer}>
            <Text style={styles.explanationTitle}>Analysis</Text>
            <Text style={styles.explanationText}>{result.explanation}</Text>
          </View>
          
          {location && (
            <View style={styles.locationContainer}>
              <Text style={styles.locationIcon}>📍</Text>
              <Text style={styles.locationText}>
                Location captured: {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
              </Text>
            </View>
          )}
          
          <Text style={styles.timestamp}>
            Analyzed on {result.timestamp.toLocaleDateString()} at {result.timestamp.toLocaleTimeString()}
          </Text>
        </View>
      </View>
    );
  }

  return null;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  imageContainer: {
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: '#F8F9FA',
  },
  image: {
    width: 200,
    height: 300,
    borderRadius: 12,
    resizeMode: 'cover',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 16,
  },
  loadingSubtext: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 8,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#DC2626',
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  retryButton: {
    backgroundColor: '#6B46C1',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  resultContainer: {
    flex: 1,
    padding: 20,
  },
  resultHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  resultIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  resultTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
  },
  confidenceContainer: {
    marginBottom: 24,
  },
  confidenceBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    marginBottom: 8,
  },
  confidenceFill: {
    height: '100%',
    borderRadius: 4,
  },
  confidenceInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  confidenceScore: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  confidenceLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  explanationContainer: {
    marginBottom: 20,
  },
  explanationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  explanationText: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
  },
  locationIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  locationText: {
    fontSize: 12,
    color: '#6B7280',
    flex: 1,
  },
  timestamp: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});