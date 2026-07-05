import React from 'react';
import { ActivityIndicator } from 'react-native';
import { Text, YStack } from 'tamagui';
import { Colors } from '../../../constants/colors';

interface LoadingStateProps {
  message?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ message = 'Cargando...' }) => {
  return (
    <YStack
      flex={1}
      items="center"
      justify="center"
      gap="$3"
      accessibilityLabel={message}
      accessibilityLiveRegion="polite"
    >
      <ActivityIndicator size="large" color={Colors.primary} />
      <Text fontSize={16} color="$textSecondary">
        {message}
      </Text>
    </YStack>
  );
};