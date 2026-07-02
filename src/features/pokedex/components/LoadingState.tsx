import React from 'react';
import { ActivityIndicator } from 'react-native';
import { Text, YStack } from 'tamagui';

interface LoadingStateProps {
  message?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ message = 'Cargando...' }) => {
  return (
    <YStack flex={1} items="center" justify="center" gap="$3">
      <ActivityIndicator size="large" color="#E3350D" />
      <Text fontSize={16} color="$textSecondary">
        {message}
      </Text>
    </YStack>
  );
};
