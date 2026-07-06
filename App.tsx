import { NavigationContainer } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
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

// Renders only after Zustand has read AsyncStorage — guarantees useState sees real values.
function AppContent() {
  const { profile, hasSeenSplash, setHasSeenSplash, trainerName } = useTrainerStore();

  const [genericSplashDone, setGenericSplashDone] = useState(
    hasSeenSplash || profile !== null
  );
  const [splashDone, setSplashDone] = useState(hasSeenSplash || !profile);
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

// Waits for the Zustand persist middleware to finish reading AsyncStorage before
// mounting AppContent, so useState initializers always see the real persisted values.
// On a fresh install AsyncStorage is empty → profile/trainerName stay null → new-user flow.
function AppShell() {
  const [hydrated, setHydrated] = useState(useTrainerStore.persist.hasHydrated());

  useEffect(() => {
    if (hydrated) return;
    return useTrainerStore.persist.onFinishHydration(() => setHydrated(true));
  }, [hydrated]);

  if (!hydrated) return null;
  return <AppContent />;
}

export default function App() {
  return (
    <TamaguiProvider config={tamaguiConfig} defaultTheme="light">
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <AppShell />
        </QueryClientProvider>
      </SafeAreaProvider>
    </TamaguiProvider>
  );
}
