import React from 'react';
import { TextInputProps } from 'react-native';
import { Input, Label, Text, YStack } from 'tamagui';
import { Colors } from '../../../constants/colors';

interface FormFieldProps {
  label: string;
  error?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  onBlur?: () => void;
  onFocus?: () => void;
  placeholder?: string;
  keyboardType?: TextInputProps['keyboardType'];
  autoCapitalize?: TextInputProps['autoCapitalize'];
  autoCorrect?: boolean;
  returnKeyType?: TextInputProps['returnKeyType'];
  secureTextEntry?: boolean;
  maxLength?: number;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  error,
  value,
  onChangeText,
  onBlur,
  onFocus,
  placeholder,
  keyboardType,
  autoCapitalize,
  autoCorrect,
  returnKeyType,
  secureTextEntry,
  maxLength,
}) => {
  return (
    <YStack gap="$1.5">
      <Label fontSize={14} fontWeight="600" color="$appText">
        {label}
      </Label>
      <Input
        borderWidth={1.5}
        borderColor={error ? '$error' : '$appBorder'}
        rounded={10}
        px="$3.5"
        py="$3"
        fontSize={16}
        color="$appText"
        bg="$surface"
        placeholderTextColor="$textSecondary"
        focusStyle={{ borderColor: '$primary' }}
        value={value}
        onChangeText={onChangeText}
        onBlur={onBlur}
        onFocus={onFocus}
        placeholder={placeholder}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        autoCorrect={autoCorrect}
        returnKeyType={returnKeyType}
        secureTextEntry={secureTextEntry}
        maxLength={maxLength}
        accessibilityLabel={label}
        accessibilityHint={error ?? undefined}
      />
      {error ? (
        <Text
          fontSize={12}
          color="$error"
          mt="$0.5"
          accessibilityLiveRegion="polite"
          accessibilityRole="alert"
        >
          {error}
        </Text>
      ) : null}
    </YStack>
  );
};