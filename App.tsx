import { NavigationContainer } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { TamaguiProvider } from 'tamagui';
import { tamaguiConfig } from './tamagui.config';
import { SplashScreen } from './src/components/ui/SplashScreen';
import { RootNavigator } from './src/navigation/RootNavigator';
import { useTrainerStore } from './src/store/trainerStore';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60 * 5,
    },
  },
});

function AppContent() {
  const { profile, hasSeenSplash, setHasSeenSplash } = useTrainerStore();
  const [splashDone, setSplashDone] = useState(hasSeenSplash || !profile);

  if (!splashDone && profile) {
    return (
      <SplashScreen
        profile={profile}
        onFinish={() => {
          setHasSeenSplash(true);
          setSplashDone(true);
        }}
      />
    );
  }

  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <RootNavigator />
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <TamaguiProvider config={tamaguiConfig} defaultTheme="light">
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <AppContent />
        </QueryClientProvider>
      </SafeAreaProvider>
    </TamaguiProvider>
  );
}
