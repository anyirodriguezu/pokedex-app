import React from 'react';
import { StyleSheet } from 'react-native';
import { Text, YStack } from 'tamagui';
import { Button } from './Button';

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  message = 'Ocurrió un error inesperado',
  onRetry,
}) => {
  return (
    <YStack flex={1} items="center" justify="center" p="$6" gap="$4">
      <Text style={styles.emoji}>⚠️</Text>
      <Text fontSize={16} color="$error" style={{ textAlign: 'center' }}>
        {message}
      </Text>
      {onRetry && <Button label="Reintentar" onPress={onRetry} />}
    </YStack>
  );
};

const styles = StyleSheet.create({
  emoji: {
    fontSize: 48,
  },
});
