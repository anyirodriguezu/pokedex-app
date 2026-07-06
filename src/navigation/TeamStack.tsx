import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'tamagui';
import { TeamScreen } from '../features/team/screens/TeamScreen';
import { Colors } from '../constants/colors';
import { TeamStackParamList } from './types';

const Stack = createNativeStackNavigator<TeamStackParamList>();

const TeamHeaderTitle: React.FC = () => (
  <View style={headerStyles.row}>
    <View style={[headerStyles.badge, { backgroundColor: '#F59E0B' }]}>
      <Text style={headerStyles.badgeIcon}>⚡</Text>
    </View>
    <Text style={headerStyles.title}>Mi Equipo</Text>
  </View>
);

const headerStyles = StyleSheet.create({
  row:       { flexDirection: 'row', alignItems: 'center', gap: 10 },
  badge:     { width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'rgba(255,255,255,0.5)' },
  badgeIcon: { fontSize: 13, lineHeight: 16 },
  title:     { fontSize: 18, fontWeight: '800', color: '#fff', letterSpacing: 0.5 },
});

export const TeamStack: React.FC = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: { backgroundColor: Colors.primary },
      headerTintColor: Colors.textLight,
      headerTitleStyle: { fontWeight: '700' },
    }}
  >
    <Stack.Screen
      name="TeamMain"
      component={TeamScreen}
      options={{ headerTitle: () => <TeamHeaderTitle /> }}
    />
  </Stack.Navigator>
);
