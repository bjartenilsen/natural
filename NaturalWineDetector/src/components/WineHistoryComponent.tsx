/**
 * Wine History Component - Displays a list of all analyzed wines
 * Implements requirements 4.1, 4.2, 4.5
 */
import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { WineRecord } from '../types/WineTypes';
import { useNetworkState } from '../hooks/useNetworkState';

/** Estimated item height (content + padding + margins) for getItemLayout */
const ITEM_HEIGHT = 120;

interface WineHistoryProps {
  wines: WineRecord[];
  onWineSelect: (wine: WineRecord) => void;
  loading?: boolean;
  onRefresh?: () => void;
  refreshing?: boolean;
}

interface WineListItemProps {
  wine: WineRecord;
  onPress: (wine: WineRecord) => void;
}

const WineListItem: React.FC<WineListItemProps> = ({ wine, onPress }) => {
  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatLocation = (wine: WineRecord): string => {
    if (!wine.location) return '';
    return `📍 ${wine.location.latitude.toFixed(4)}, ${wine.location.longitude.toFixed(4)}`;
  };

  return (
    <TouchableOpacity
      style={styles.wineItem}
      onPress={() => onPress(wine)}
      activeOpacity={0.7}
    >
      <View style={styles.wineItemContent}>
        {/* Wine Image */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: wine.imageUri }}
            style={styles.wineImage}
            resizeMode="cover"
          />
        </View>

        {/* Wine Details */}
        <View style={styles.wineDetails}>
          <View style={styles.wineHeader}>
            <Text style={styles.wineStatus}>
              {wine.analysisResult.isNaturalWine ? '🍃 Natural Wine' : '🍷 Conventional Wine'}
            </Text>
            <Text style={styles.confidenceScore}>
              {wine.analysisResult.confidenceScore}%
            </Text>
          </View>

          <Text style={styles.wineDate}>
            Analyzed on {formatDate(wine.createdAt)}
          </Text>

          {wine.consumed && (
            <Text style={styles.consumedStatus}>✓ Consumed</Text>
          )}

          {wine.location && (
            <Text style={styles.locationText} numberOfLines={1}>
              {formatLocation(wine)}
            </Text>
          )}

          {wine.notes && (
            <Text style={styles.notesPreview} numberOfLines={2}>
              "{wine.notes}"
            </Text>
          )}
        </View>

        {/* Chevron */}
        <View style={styles.chevronContainer}>
          <Text style={styles.chevron}>›</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const EmptyState: React.FC = () => (
  <View style={styles.emptyState}>
    <Text style={styles.emptyStateIcon}>🍷</Text>
    <Text style={styles.emptyStateTitle}>No wines analyzed yet</Text>
    <Text style={styles.emptyStateSubtitle}>
      Start by taking a photo of a wine bottle to analyze whether it's a natural wine
    </Text>
  </View>
);

const LoadingState: React.FC = () => (
  <View style={styles.loadingState}>
    <ActivityIndicator size="large" color="#8B5A3C" />
    <Text style={styles.loadingText}>Loading your wine collection...</Text>
  </View>
);

export const WineHistoryComponent: React.FC<WineHistoryProps> = ({
  wines,
  onWineSelect,
  loading = false,
  onRefresh,
  refreshing = false,
}) => {
  const { isOffline } = useNetworkState();
  const renderWineItem = ({ item }: { item: WineRecord }) => (
    <WineListItem wine={item} onPress={onWineSelect} />
  );

  const keyExtractor = (item: WineRecord) => item.id;

  if (loading && wines.length === 0) {
    return <LoadingState />;
  }

  return (
    <View style={styles.container}>
      {wines.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Wine Collection</Text>
            <Text style={styles.headerSubtitle}>
              {wines.length} wine{wines.length !== 1 ? 's' : ''} analyzed
              {isOffline && ' • Offline Mode'}
            </Text>
          </View>
          <FlatList
            data={wines}
            renderItem={renderWineItem}
            keyExtractor={keyExtractor}
            style={styles.list}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            getItemLayout={(_data, index) => ({
              length: ITEM_HEIGHT,
              offset: ITEM_HEIGHT * index,
              index,
            })}
            initialNumToRender={10}
            maxToRenderPerBatch={10}
            windowSize={5}
            refreshControl={
              onRefresh ? (
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  colors={['#8B5A3C']}
                  tintColor="#8B5A3C"
                />
              ) : undefined
            }
          />
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C2C2C',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666666',
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingVertical: 8,
  },
  wineItem: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  wineItemContent: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
  },
  imageContainer: {
    marginRight: 16,
  },
  wineImage: {
    width: 60,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#F0F0F0',
  },
  wineDetails: {
    flex: 1,
  },
  wineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  wineStatus: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C2C2C',
    flex: 1,
  },
  confidenceScore: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#8B5A3C',
    backgroundColor: '#F0E6D2',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  wineDate: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  consumedStatus: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '500',
    marginBottom: 4,
  },
  locationText: {
    fontSize: 12,
    color: '#888888',
    marginBottom: 4,
  },
  notesPreview: {
    fontSize: 14,
    color: '#555555',
    fontStyle: 'italic',
    marginTop: 4,
  },
  chevronContainer: {
    marginLeft: 8,
  },
  chevron: {
    fontSize: 20,
    color: '#CCCCCC',
    fontWeight: 'bold',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyStateIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C2C2C',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateSubtitle: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 24,
  },
  loadingState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#666666',
    marginTop: 16,
    textAlign: 'center',
  },
});