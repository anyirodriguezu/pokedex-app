import { NavigationContainer } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { TamaguiProvider } from 'tamagui';
import { tamaguiConfig } from './tamagui.config';
import { SplashScreen, GenericSplash } from './src/components/ui/SplashScreen';
import { TrainerNameInputScreen } from './src/components/ui/TrainerNameInputScreen';
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
  const { profile, hasSeenSplash, setHasSeenSplash, trainerName } = useTrainerStore();

  // Show generic splash on very first launch (no profile yet)
  const [genericSplashDone, setGenericSplashDone] = useState(
    hasSeenSplash || profile !== null
  );
  // Show personalized splash when profile exists and hasn't been shown this session
  const [splashDone, setSplashDone] = useState(hasSeenSplash || !profile);
  // Skip name input if name was already captured in a previous session or profile exists
  const [nameInputDone, setNameInputDone] = useState(!!(trainerName || profile));

  const handleGenericFinish = () => {
    setHasSeenSplash(true);
    setGenericSplashDone(true);
  };

  const handleProfileSplashFinish = () => {
    setHasSeenSplash(true);
    setSplashDone(true);
  };

  // First-time user: generic splash
  if (!genericSplashDone && !profile) {
    return <GenericSplash onFinish={handleGenericFinish} />;
  }

  // After splash, first-time user: ask for trainer name before entering the app
  if (genericSplashDone && !profile && !nameInputDone) {
    return <TrainerNameInputScreen onFinish={() => setNameInputDone(true)} />;
  }

  // Returning user with profile: show personalized splash
  if (!splashDone && profile) {
    return <SplashScreen profile={profile} onFinish={handleProfileSplashFinish} />;
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
