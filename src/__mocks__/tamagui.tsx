import React from 'react';
import {
  View,
  Text as RNText,
  TextInput,
  Pressable,
  StyleProp,
  ViewStyle,
  TextInputProps,
  GestureResponderEvent,
} from 'react-native';

type LayoutProps = {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  [key: string]: unknown;
};

type TextProps = {
  children?: React.ReactNode;
  [key: string]: unknown;
};

type MockInputProps = TextInputProps & {
  [key: string]: unknown;
};

type PressableComponentProps = {
  children?: React.ReactNode;
  onPress?: ((event: GestureResponderEvent) => void) | null;
  disabled?: boolean | null;
  icon?: React.ReactNode;
  [key: string]: unknown;
};

export const YStack = ({ children, style, onPress, accessibilityRole, accessibilityLabel, accessibilityState }: LayoutProps) => {
  if (typeof onPress === 'function') {
    return (
      <Pressable
        onPress={onPress as (event: GestureResponderEvent) => void}
        accessibilityRole={accessibilityRole as React.ComponentProps<typeof Pressable>['accessibilityRole']}
        accessibilityLabel={typeof accessibilityLabel === 'string' ? accessibilityLabel : undefined}
        accessibilityState={accessibilityState as React.ComponentProps<typeof Pressable>['accessibilityState']}
        style={style as StyleProp<ViewStyle>}
      >
        {children}
      </Pressable>
    );
  }
  return <View style={style as StyleProp<ViewStyle>}>{children}</View>;
};
export const XStack = ({ children, style }: LayoutProps) => (
  <View style={style as StyleProp<ViewStyle>}>{children}</View>
);
export const Card = ({ children, style }: LayoutProps) => (
  <View style={style as StyleProp<ViewStyle>}>{children}</View>
);
export const Separator = ({ style }: { style?: StyleProp<ViewStyle> }) => (
  <View style={style} />
);

export const Text = ({ children }: TextProps) => <RNText>{children}</RNText>;
export const Label = ({ children }: TextProps) => <RNText>{children}</RNText>;

export const Input = ({
  style,
  value,
  onChangeText,
  onBlur,
  placeholder,
  keyboardType,
  autoCapitalize,
  autoCorrect,
  returnKeyType,
  secureTextEntry,
  maxLength,
}: MockInputProps) => (
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

export const Button = ({ children, onPress, disabled, icon }: PressableComponentProps) => (
  <Pressable onPress={onPress} disabled={disabled}>
    {icon}
    {children}
  </Pressable>
);

export const styled = (
  _Component: React.ComponentType,
  _config: Record<string, unknown>
) => {
  function StyledComponent({ children, onPress, disabled, icon }: PressableComponentProps) {
    return (
      <Pressable onPress={onPress} disabled={disabled}>
        {icon}
        {typeof children === 'string' ? <RNText>{children}</RNText> : children}
      </Pressable>
    );
  }
  return StyledComponent;
};

export const TamaguiProvider = ({ children }: React.PropsWithChildren) => <>{children}</>;
export const createTamagui = (config: Record<string, unknown>) => config;
