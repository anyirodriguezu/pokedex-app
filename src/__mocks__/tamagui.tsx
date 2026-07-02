import React from 'react';
import { View, Text as RNText, TextInput, Pressable } from 'react-native';

export const YStack = ({ children, style, ...props }: any) => (
  <View style={style}>{children}</View>
);
export const XStack = ({ children, style, ...props }: any) => (
  <View style={style}>{children}</View>
);
export const Card = ({ children, style, ...props }: any) => (
  <View style={style}>{children}</View>
);
export const Separator = ({ style, ...props }: any) => <View style={style} />;

export const Text = ({ children, ...props }: any) => <RNText>{children}</RNText>;
export const Label = ({ children, ...props }: any) => <RNText>{children}</RNText>;

export const Input = ({ style, value, onChangeText, onBlur, placeholder, keyboardType, autoCapitalize, autoCorrect, returnKeyType, secureTextEntry, maxLength, ...props }: any) => (
  <TextInput
    style={style}
    value={value}
    onChangeText={onChangeText}
    onBlur={onBlur}
    placeholder={placeholder}
    keyboardType={keyboardType}
    autoCapitalize={autoCapitalize}
    autoCorrect={autoCorrect}
    returnKeyType={returnKeyType}
    secureTextEntry={secureTextEntry}
    maxLength={maxLength}
  />
);

export const Button = ({ children, onPress, disabled, icon, ...props }: any) => (
  <Pressable onPress={onPress} disabled={disabled}>
    {icon}
    {children}
  </Pressable>
);

export const styled = (_Component: any, _config: any) => {
  function StyledComponent({ children, onPress, disabled, icon, ...props }: any) {
    return (
      <Pressable onPress={onPress} disabled={disabled}>
        {icon}
        {typeof children === 'string' ? <RNText>{children}</RNText> : children}
      </Pressable>
    );
  }
  return StyledComponent;
};

export const TamaguiProvider = ({ children }: any) => <>{children}</>;
export const createTamagui = (config: any) => config;
