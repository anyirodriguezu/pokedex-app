import React from 'react';
import { render, RenderOptions } from '@testing-library/react-native';
import { TamaguiProvider } from 'tamagui';
import { tamaguiConfig } from '../tamagui.config';

const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <TamaguiProvider config={tamaguiConfig} defaultTheme="light">
    {children}
  </TamaguiProvider>
);

const customRender = (ui: React.ReactElement, options?: Omit<RenderOptions, 'wrapper'>) =>
  render(ui, { wrapper: Wrapper, ...options });

export * from '@testing-library/react-native';
export { customRender as render };
