import React, { useEffect, useRef } from 'react';
import {
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';

interface ScreenTransitionProps {
  children: React.ReactNode;
  isVisible: boolean;
  animationType?: 'fade' | 'slide' | 'scale';
  duration?: number;
}

const { width: screenWidth } = Dimensions.get('window');

export const ScreenTransition: React.FC<ScreenTransitionProps> = ({
  children,
  isVisible,
  animationType = 'fade',
  duration = 300,
}) => {
  const fadeAnim = useRef(new Animated.Value(isVisible ? 1 : 0)).current;
  const slideAnim = useRef(new Animated.Value(isVisible ? 0 : screenWidth)).current;
  const scaleAnim = useRef(new Animated.Value(isVisible ? 1 : 0.8)).current;

  useEffect(() => {
    if (animationType === 'fade') {
      Animated.timing(fadeAnim, {
        toValue: isVisible ? 1 : 0,
        duration,
        useNativeDriver: true,
      }).start();
    } else if (animationType === 'slide') {
      Animated.timing(slideAnim, {
        toValue: isVisible ? 0 : screenWidth,
        duration,
        useNativeDriver: true,
      }).start();
    } else if (animationType === 'scale') {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: isVisible ? 1 : 0,
          duration,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: isVisible ? 1 : 0.8,
          duration,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isVisible, animationType, duration, fadeAnim, slideAnim, scaleAnim]);

  const getAnimatedStyle = () => {
    switch (animationType) {
      case 'fade':
        return {
          opacity: fadeAnim,
        };
      case 'slide':
        return {
          transform: [{ translateX: slideAnim }],
        };
      case 'scale':
        return {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        };
      default:
        return {};
    }
  };

  if (!isVisible && animationType === 'fade') {
    return null;
  }

  return (
    <Animated.View style={[styles.container, getAnimatedStyle()]}>
      {children}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});