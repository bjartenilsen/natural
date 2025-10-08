import React, { useRef, useEffect } from 'react';
import {
  Animated,
  TouchableOpacity,
  ViewStyle,
  GestureResponderEvent,
} from 'react-native';

interface AnimatedTouchableProps {
  children: React.ReactNode;
  onPress: (event: GestureResponderEvent) => void;
  style?: ViewStyle;
  disabled?: boolean;
  scaleValue?: number;
  duration?: number;
}

/**
 * Touchable component with scale animation on press
 */
export const AnimatedTouchable: React.FC<AnimatedTouchableProps> = ({
  children,
  onPress,
  style,
  disabled = false,
  scaleValue = 0.95,
  duration = 100,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.timing(scaleAnim, {
      toValue: scaleValue,
      duration,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.timing(scaleAnim, {
      toValue: 1,
      duration,
      useNativeDriver: true,
    }).start();
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      activeOpacity={1}
      style={style}
    >
      <Animated.View
        style={{
          transform: [{ scale: scaleAnim }],
        }}
      >
        {children}
      </Animated.View>
    </TouchableOpacity>
  );
};

interface FadeInViewProps {
  children: React.ReactNode;
  duration?: number;
  delay?: number;
  style?: ViewStyle;
}

/**
 * Component that fades in when mounted
 */
export const FadeInView: React.FC<FadeInViewProps> = ({
  children,
  duration = 500,
  delay = 0,
  style,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration,
        useNativeDriver: true,
      }).start();
    }, delay);

    return () => clearTimeout(timer);
  }, [fadeAnim, duration, delay]);

  return (
    <Animated.View
      style={[
        style,
        {
          opacity: fadeAnim,
        },
      ]}
    >
      {children}
    </Animated.View>
  );
};

interface SlideInViewProps {
  children: React.ReactNode;
  direction?: 'left' | 'right' | 'up' | 'down';
  duration?: number;
  delay?: number;
  distance?: number;
  style?: ViewStyle;
}

/**
 * Component that slides in from specified direction when mounted
 */
export const SlideInView: React.FC<SlideInViewProps> = ({
  children,
  direction = 'up',
  duration = 500,
  delay = 0,
  distance = 50,
  style,
}) => {
  const slideAnim = useRef(new Animated.Value(distance)).current;

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration,
        useNativeDriver: true,
      }).start();
    }, delay);

    return () => clearTimeout(timer);
  }, [slideAnim, duration, delay]);

  const getTransform = () => {
    switch (direction) {
      case 'left':
        return [{ translateX: slideAnim }];
      case 'right':
        return [{ translateX: Animated.multiply(slideAnim, -1) }];
      case 'up':
        return [{ translateY: slideAnim }];
      case 'down':
        return [{ translateY: Animated.multiply(slideAnim, -1) }];
      default:
        return [{ translateY: slideAnim }];
    }
  };

  return (
    <Animated.View
      style={[
        style,
        {
          transform: getTransform(),
        },
      ]}
    >
      {children}
    </Animated.View>
  );
};

interface PulseViewProps {
  children: React.ReactNode;
  duration?: number;
  minScale?: number;
  maxScale?: number;
  style?: ViewStyle;
}

/**
 * Component that pulses continuously
 */
export const PulseView: React.FC<PulseViewProps> = ({
  children,
  duration = 1000,
  minScale = 0.95,
  maxScale = 1.05,
  style,
}) => {
  const pulseAnim = useRef(new Animated.Value(minScale)).current;

  useEffect(() => {
    const pulse = () => {
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: maxScale,
          duration: duration / 2,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: minScale,
          duration: duration / 2,
          useNativeDriver: true,
        }),
      ]).start(() => pulse());
    };

    pulse();
  }, [pulseAnim, duration, minScale, maxScale]);

  return (
    <Animated.View
      style={[
        style,
        {
          transform: [{ scale: pulseAnim }],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
};

interface ShakeViewProps {
  children: React.ReactNode;
  trigger: boolean;
  duration?: number;
  intensity?: number;
  style?: ViewStyle;
}

/**
 * Component that shakes when triggered (useful for errors)
 */
export const ShakeView: React.FC<ShakeViewProps> = ({
  children,
  trigger,
  duration = 500,
  intensity = 10,
  style,
}) => {
  const shakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (trigger) {
      const shake = () => {
        Animated.sequence([
          Animated.timing(shakeAnim, {
            toValue: intensity,
            duration: duration / 8,
            useNativeDriver: true,
          }),
          Animated.timing(shakeAnim, {
            toValue: -intensity,
            duration: duration / 8,
            useNativeDriver: true,
          }),
          Animated.timing(shakeAnim, {
            toValue: intensity,
            duration: duration / 8,
            useNativeDriver: true,
          }),
          Animated.timing(shakeAnim, {
            toValue: -intensity,
            duration: duration / 8,
            useNativeDriver: true,
          }),
          Animated.timing(shakeAnim, {
            toValue: 0,
            duration: duration / 2,
            useNativeDriver: true,
          }),
        ]).start();
      };

      shake();
    }
  }, [trigger, shakeAnim, duration, intensity]);

  return (
    <Animated.View
      style={[
        style,
        {
          transform: [{ translateX: shakeAnim }],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
};