import React from 'react';
import { TextInputProps } from 'react-native';
import { Input, Label, Text, YStack } from 'tamagui';

interface FormFieldProps extends TextInputProps {
  label: string;
  error?: string;
}

export const FormField: React.FC<FormFieldProps> = ({ label, error, ...inputProps }) => {
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
        placeholderTextColor={"#757575" as any}
        focusStyle={{ borderColor: '$primary' }}
        value={inputProps.value}
        onChangeText={inputProps.onChangeText}
        onBlur={inputProps.onBlur as any}
        placeholder={inputProps.placeholder}
        keyboardType={inputProps.keyboardType}
        autoCapitalize={inputProps.autoCapitalize}
        autoCorrect={inputProps.autoCorrect}
        returnKeyType={inputProps.returnKeyType}
        secureTextEntry={inputProps.secureTextEntry}
        maxLength={inputProps.maxLength}
      />
      {error ? (
        <Text fontSize={12} color="$error" mt="$0.5">
          {error}
        </Text>
      ) : null}
    </YStack>
  );
};
