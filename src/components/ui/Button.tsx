import React from 'react';
import { ActivityIndicator } from 'react-native';
import { Button as TamaguiButton, styled } from 'tamagui';
import { Colors } from '../../constants/colors';

const BaseButton = styled(TamaguiButton, {
  height: 50,
  rounded: 12,
  px: '$5',
  fontWeight: '600',
  fontSize: 16,
  pressStyle: { opacity: 0.8 },
  disabledStyle: { opacity: 0.5 },

  variants: {
    variant: {
      primary: {
        bg: '$primary',
        color: '$textLight',
      },
      secondary: {
        bg: '$secondary',
        color: '$textLight',
      },
      outline: {
        bg: 'transparent',
        borderWidth: 2,
        borderColor: '$primary',
        color: '$primary',
      },
      muted: {
        bg: 'transparent',
        borderWidth: 1.5,
        borderColor: '#D4895A',
        color: '#D4895A',
      },
    },
  } as const,
});

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'muted';
  loading?: boolean;
  disabled?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  label,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
}) => {
  return (
    <BaseButton
      onPress={onPress}
      disabled={disabled || loading}
      variant={variant}
      accessibilityRole="button"
      accessibilityLabel={loading ? 'Cargando' : label}
      accessibilityState={{ disabled: disabled || loading, busy: loading }}
      icon={loading ? <ActivityIndicator testID="loading-indicator" color={variant === 'muted' ? '#D4895A' : variant === 'outline' ? Colors.primary : Colors.textLight} /> : undefined}
    >
      {loading ? null : label}
    </BaseButton>
  );
};
