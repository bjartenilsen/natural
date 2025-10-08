/**
 * Wine Detail Component - Displays detailed information about a specific wine record
 * Implements requirements 4.3, 4.4
 */
import React from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { WineRecord } from '../types/WineTypes';

interface WineDetailProps {
  wine: WineRecord;
  onEdit?: (wine: WineRecord) => void;
  onDelete?: (wine: WineRecord) => void;
}

const { width: screenWidth } = Dimensions.get('window');

export const WineDetailComponent: React.FC<WineDetailProps> = ({
  wine,
  onEdit,
  onDelete,
}) => {
  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatLocation = (wine: WineRecord): string => {
    if (!wine.location) return 'Location not available';
    return `${wine.location.latitude.toFixed(6)}, ${wine.location.longitude.toFixed(6)}`;
  };

  const getLocationAccuracy = (wine: WineRecord): string => {
    if (!wine.location?.accuracy) return '';
    return `±${wine.location.accuracy.toFixed(0)}m accuracy`;
  };

  const getConfidenceColor = (score: number): string => {
    if (score >= 80) return '#4CAF50'; // Green for high confidence
    if (score >= 60) return '#FF9800'; // Orange for medium confidence
    return '#F44336'; // Red for low confidence
  };

  const getConfidenceLabel = (score: number): string => {
    if (score >= 80) return 'High Confidence';
    if (score >= 60) return 'Medium Confidence';
    return 'Low Confidence';
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Wine Image */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: wine.imageUri }}
          style={styles.wineImage}
          resizeMode="contain"
        />
      </View>

      {/* Wine Analysis Results */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Analysis Results</Text>
        
        <View style={styles.analysisCard}>
          <View style={styles.analysisHeader}>
            <Text style={styles.wineTypeLabel}>
              {wine.analysisResult.isNaturalWine ? '🍃 Natural Wine' : '🍷 Conventional Wine'}
            </Text>
            <View style={[
              styles.confidenceBadge,
              { backgroundColor: getConfidenceColor(wine.analysisResult.confidenceScore) }
            ]}>
              <Text style={styles.confidenceScore}>
                {wine.analysisResult.confidenceScore}%
              </Text>
            </View>
          </View>
          
          <Text style={styles.confidenceLabel}>
            {getConfidenceLabel(wine.analysisResult.confidenceScore)}
          </Text>
          
          <Text style={styles.explanation}>
            {wine.analysisResult.explanation}
          </Text>
        </View>
      </View>

      {/* Consumption Status */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Consumption Status</Text>
        <View style={styles.consumptionCard}>
          <Text style={[
            styles.consumptionStatus,
            { color: wine.consumed ? '#4CAF50' : '#666666' }
          ]}>
            {wine.consumed ? '✓ You drank this wine' : '○ Not consumed yet'}
          </Text>
        </View>
      </View>

      {/* Personal Notes */}
      {wine.notes && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Notes</Text>
          <View style={styles.notesCard}>
            <Text style={styles.notesText}>"{wine.notes}"</Text>
          </View>
        </View>
      )}

      {/* Location Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Location Information</Text>
        <View style={styles.locationCard}>
          {wine.location ? (
            <>
              <View style={styles.locationRow}>
                <Text style={styles.locationLabel}>📍 Coordinates:</Text>
                <Text style={styles.locationValue}>
                  {formatLocation(wine)}
                </Text>
              </View>
              {wine.location.accuracy && (
                <View style={styles.locationRow}>
                  <Text style={styles.locationLabel}>🎯 Accuracy:</Text>
                  <Text style={styles.locationValue}>
                    {getLocationAccuracy(wine)}
                  </Text>
                </View>
              )}
              <Text style={styles.locationNote}>
                Location captured when photo was taken
              </Text>
            </>
          ) : (
            <Text style={styles.noLocationText}>
              📍 Location data not available for this wine
            </Text>
          )}
        </View>
      </View>

      {/* Timestamps */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Timeline</Text>
        <View style={styles.timestampCard}>
          <View style={styles.timestampRow}>
            <Text style={styles.timestampLabel}>📅 Analyzed on:</Text>
            <Text style={styles.timestampValue}>
              {formatDate(wine.createdAt)}
            </Text>
          </View>
          <View style={styles.timestampRow}>
            <Text style={styles.timestampLabel}>🕐 Time:</Text>
            <Text style={styles.timestampValue}>
              {formatTime(wine.createdAt)}
            </Text>
          </View>
          <View style={styles.timestampRow}>
            <Text style={styles.timestampLabel}>🤖 AI Analysis:</Text>
            <Text style={styles.timestampValue}>
              {formatTime(wine.analysisResult.timestamp)}
            </Text>
          </View>
        </View>
      </View>

      {/* Action Buttons */}
      {(onEdit || onDelete) && (
        <View style={styles.actionSection}>
          <Text style={styles.sectionTitle}>Actions</Text>
          <View style={styles.actionButtons}>
            {onEdit && (
              <TouchableOpacity
                style={[styles.actionButton, styles.editButton]}
                onPress={() => onEdit(wine)}
              >
                <Text style={styles.editButtonText}>✏️ Edit Notes</Text>
              </TouchableOpacity>
            )}
            {onDelete && (
              <TouchableOpacity
                style={[styles.actionButton, styles.deleteButton]}
                onPress={() => onDelete(wine)}
              >
                <Text style={styles.deleteButtonText}>🗑️ Delete</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      {/* Bottom Spacing */}
      <View style={styles.bottomSpacing} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  imageContainer: {
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    paddingVertical: 20,
    marginBottom: 8,
  },
  wineImage: {
    width: screenWidth * 0.6,
    height: screenWidth * 0.8,
    borderRadius: 12,
    backgroundColor: '#F0F0F0',
  },
  section: {
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C2C2C',
    marginHorizontal: 16,
    marginBottom: 8,
    marginTop: 8,
  },
  analysisCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  analysisHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  wineTypeLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C2C2C',
    flex: 1,
  },
  confidenceBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  confidenceScore: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  confidenceLabel: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 12,
  },
  explanation: {
    fontSize: 16,
    color: '#2C2C2C',
    lineHeight: 24,
  },
  consumptionCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  consumptionStatus: {
    fontSize: 16,
    fontWeight: '600',
  },
  notesCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  notesText: {
    fontSize: 16,
    color: '#2C2C2C',
    lineHeight: 24,
    fontStyle: 'italic',
  },
  locationCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  locationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationLabel: {
    fontSize: 14,
    color: '#666666',
    flex: 1,
  },
  locationValue: {
    fontSize: 14,
    color: '#2C2C2C',
    fontWeight: '500',
    flex: 2,
    textAlign: 'right',
  },
  locationNote: {
    fontSize: 12,
    color: '#888888',
    fontStyle: 'italic',
    marginTop: 8,
  },
  noLocationText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  timestampCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  timestampRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  timestampLabel: {
    fontSize: 14,
    color: '#666666',
    flex: 1,
  },
  timestampValue: {
    fontSize: 14,
    color: '#2C2C2C',
    fontWeight: '500',
    flex: 2,
    textAlign: 'right',
  },
  actionSection: {
    marginTop: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    marginHorizontal: 16,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: '#2196F3',
  },
  editButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: '#F44336',
  },
  deleteButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomSpacing: {
    height: 20,
  },
});