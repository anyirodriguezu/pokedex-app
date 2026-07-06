import React, { useEffect, useRef } from 'react';
import { Animated, DimensionValue } from 'react-native';

interface Props {
  width?: DimensionValue;
  height?: number;
  borderRadius?: number;
}

export const SkeletonBlock: React.FC<Props> = ({ width = '100%', height = 16, borderRadius = 8 }) => {
  const pulse = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.3, duration: 800, useNativeDriver: true }),
      ])
    ).start();
  }, [pulse]);

  return (
    <Animated.View
      style={{ width, height, borderRadius, backgroundColor: '#E0E0E0', opacity: pulse }}
    />
  );
};
