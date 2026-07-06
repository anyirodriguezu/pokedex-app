import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'tamagui';
import { Colors } from '../constants/colors';
import { Step1PersonalDataScreen } from '../features/trainer/screens/Step1PersonalDataScreen';
import { Step2PreferencesScreen } from '../features/trainer/screens/Step2PreferencesScreen';
import { StarterPokemonScreen } from '../features/trainer/screens/StarterPokemonScreen';
import { SummaryScreen } from '../features/trainer/screens/SummaryScreen';
import { TrainerStackParamList } from './types';
import { useTrainerStore } from '../store/trainerStore';

const Stack = createNativeStackNavigator<TrainerStackParamList>();

const ProfileHeaderTitle: React.FC = () => (
  <View style={headerStyles.row}>
    <View style={[headerStyles.badge, { backgroundColor: Colors.violet }]}>
      <Text style={headerStyles.badgeIcon}>🎒</Text>
    </View>
    <Text style={headerStyles.title}>Tu Perfil</Text>
  </View>
);

const headerStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  badge: {
    width: 26, height: 26, borderRadius: 13,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.5)',
  },
  badgeIcon: { fontSize: 13, lineHeight: 16 },
  title: { fontSize: 18, fontWeight: '800', color: Colors.textLight, letterSpacing: 0.5 },
});

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
        options={{ headerTitle: () => <ProfileHeaderTitle />, headerBackVisible: false }}
      />
    </Stack.Navigator>
  );
};
