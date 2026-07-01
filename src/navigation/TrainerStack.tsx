import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { Step1PersonalDataScreen } from '../features/trainer/screens/Step1PersonalDataScreen';
import { Step2PreferencesScreen } from '../features/trainer/screens/Step2PreferencesScreen';
import { SummaryScreen } from '../features/trainer/screens/SummaryScreen';
import { Colors } from '../constants/colors';
import { TrainerStackParamList } from './types';

const Stack = createNativeStackNavigator<TrainerStackParamList>();

export const TrainerStack: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: Colors.primary },
        headerTintColor: Colors.textLight,
        headerTitleStyle: { fontWeight: '700' },
      }}
    >
      <Stack.Screen
        name="Step1PersonalData"
        component={Step1PersonalDataScreen}
        options={{ title: 'Paso 1 de 2' }}
      />
      <Stack.Screen
        name="Step2Preferences"
        component={Step2PreferencesScreen}
        options={{ title: 'Paso 2 de 2' }}
      />
      <Stack.Screen
        name="Summary"
        component={SummaryScreen}
        options={{ title: 'Tu Perfil', headerBackVisible: false }}
      />
    </Stack.Navigator>
  );
};
