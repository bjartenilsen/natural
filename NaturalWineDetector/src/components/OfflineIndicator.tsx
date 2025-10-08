/**
 * Offline indicator component to show network connectivity status
 */

import React from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useNetworkState } from '../services/NetworkService';

interface OfflineIndicatorProps {
  showWhenOnline?: boolean;
  position?: 'top' | 'bottom';
}

export const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({
  showWhenOnline = false,
  position = 'top'
}) => {
  const { isOffline, networkState } = useNetworkState();
  const [slideAnim] = React.useState(new Animated.Value(isOffline ? 0 : -50));
  const [wasOffline, setWasOffline] = React.useState(isOffline);

  React.useEffect(() => {
    if (isOffline && !wasOffline) {
      // Going offline - slide in
      setWasOffline(true);
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else if (!isOffline && wasOffline) {
      // Coming back online - show briefly then slide out
      setWasOffline(false);
      
      if (showWhenOnline) {
        // Show "Back online" message briefly
        Animated.sequence([
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.delay(2000),
          Animated.timing(slideAnim, {
            toValue: -50,
            duration: 300,
            useNativeDriver: true,
          })
        ]).start();
      } else {
        // Hide immediately
        Animated.timing(slideAnim, {
          toValue: -50,
          duration: 300,
          useNativeDriver: true,
        }).start();
      }
    }
  }, [isOffline, wasOffline, slideAnim, showWhenOnline]);

  const shouldShow = isOffline || (showWhenOnline && !wasOffline && !isOffline);

  if (!shouldShow && wasOffline === isOffline) {
    return null;
  }

  const getStatusText = () => {
    if (isOffline) {
      return 'No internet connection';
    }
    return 'Back online';
  };

  const getStatusColor = () => {
    if (isOffline) {
      return '#ff6b6b';
    }
    return '#51cf66';
  };

  const containerStyle = [
    styles.container,
    position === 'bottom' ? styles.bottom : styles.top,
    { backgroundColor: getStatusColor() }
  ];

  return (
    <Animated.View
      style={[
        containerStyle,
        {
          transform: [{ translateY: slideAnim }]
        }
      ]}
    >
      <View style={styles.content}>
        <View style={styles.indicator}>
          <Text style={styles.indicatorText}>
            {isOffline ? '📵' : '📶'}
          </Text>
        </View>
        
        <View style={styles.textContainer}>
          <Text style={styles.statusText}>
            {getStatusText()}
          </Text>
          
          {isOffline && (
            <Text style={styles.subText}>
              You can still view your wine history
            </Text>
          )}
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 1000,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  top: {
    top: 0,
    paddingTop: 50, // Account for status bar
  },
  bottom: {
    bottom: 0,
    paddingBottom: 20,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  indicator: {
    marginRight: 12,
  },
  indicatorText: {
    fontSize: 20,
  },
  textContainer: {
    flex: 1,
  },
  statusText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  subText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    marginTop: 2,
  },
});