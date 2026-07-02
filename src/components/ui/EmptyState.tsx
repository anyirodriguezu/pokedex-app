import React from 'react';
import { StyleSheet, Text as RNText } from 'react-native';
import { Text, YStack } from 'tamagui';

interface EmptyStateProps {
  message?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  message = 'No hay datos disponibles',
}) => {
  return (
    <YStack flex={1} items="center" justify="center" p="$6" gap="$3">
      <RNText style={styles.emoji}>📭</RNText>
      <Text fontSize={16} color="$textSecondary" style={{ textAlign: 'center' }}>
        {message}
      </Text>
    </YStack>
  );
};

const styles = StyleSheet.create({
  emoji: {
    fontSize: 48,
  },
});
