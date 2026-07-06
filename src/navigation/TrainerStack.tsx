import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { Step1PersonalDataScreen } from '../features/trainer/screens/Step1PersonalDataScreen';
import { Step2PreferencesScreen } from '../features/trainer/screens/Step2PreferencesScreen';
import { StarterPokemonScreen } from '../features/trainer/screens/StarterPokemonScreen';
import { SummaryScreen } from '../features/trainer/screens/SummaryScreen';
import { Colors } from '../constants/colors';
import { TrainerStackParamList } from './types';
import { useTrainerStore } from '../store/trainerStore';

const Stack = createNativeStackNavigator<TrainerStackParamList>();

export const TrainerStack: React.FC = () => {
  const profile = useTrainerStore((state) => state.profile);
  const initialRoute: keyof TrainerStackParamList = profile ? 'Summary' : 'Step1PersonalData';

  return (
    <Stack.Navigator
      initialRouteName={initialRoute}
      screenOptions={{
        headerStyle: { backgroundColor: Colors.primary },
        headerTintColor: Colors.textLight,
        headerTitleStyle: { fontWeight: '700' },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen
        name="Step1PersonalData"
        component={Step1PersonalDataScreen}
        options={{ title: 'Paso 1 de 3' }}
        initialParams={{ mode: 'create' }}
      />
      <Stack.Screen
        name="Step2Preferences"
        component={Step2PreferencesScreen}
        options={{ title: 'Paso 2 de 3' }}
      />
      <Stack.Screen
        name="StarterPokemon"
        component={StarterPokemonScreen}
        options={{ title: 'Paso 3 de 3' }}
      />
      <Stack.Screen
        name="Summary"
        component={SummaryScreen}
        options={{ title: 'Tu Perfil', headerBackVisible: false }}
      />
    </Stack.Navigator>
  );
};
