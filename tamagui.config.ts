import { defaultConfig } from '@tamagui/config/v4';
import { createTamagui } from 'tamagui';

const customTokens = {
  primary: '#E3350D',
  primaryDark: '#B02A0A',
  primarySubtle: '#FFF0EE',
  secondary: '#30A7D7',
  appBackground: '#F5F5F5',
  surface: '#FFFFFF',
  appText: '#212121',
  textSecondary: '#757575',
  textLight: '#FFFFFF',
  appBorder: '#E0E0E0',
  error: '#D32F2F',
  success: '#388E3C',
};

export const tamaguiConfig = createTamagui({
  ...defaultConfig,
  themes: {
    ...(defaultConfig.themes as object),
    light: {
      ...((defaultConfig.themes as Record<string, object>).light ?? {}),
      ...customTokens,
    },
  } as typeof defaultConfig.themes,
});

export default tamaguiConfig;

export type AppConfig = typeof tamaguiConfig;

declare module 'tamagui' {
  interface TamaguiCustomConfig extends AppConfig {}
}
