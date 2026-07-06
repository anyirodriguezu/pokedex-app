import React from 'react';
import { render, RenderOptions } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { TamaguiProvider } from 'tamagui';
import { tamaguiConfig } from '../tamagui.config';

const SAFE_AREA_METRICS = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 0, bottom: 0, left: 0, right: 0 },
};

const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <SafeAreaProvider initialMetrics={SAFE_AREA_METRICS}>
    <TamaguiProvider config={tamaguiConfig} defaultTheme="light">
      {children}
    </TamaguiProvider>
  </SafeAreaProvider>
);

const customRender = (ui: React.ReactElement, options?: Omit<RenderOptions, 'wrapper'>) =>
  render(ui, { wrapper: Wrapper, ...options });

export * from '@testing-library/react-native';
export { customRender as render };
