import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../constants/colors';
import { useTrainerStore } from '../store/trainerStore';
import { PokedexStack } from './PokedexStack';
import { TrainerStack } from './TrainerStack';
import { RootTabParamList } from './types';

const Tab = createBottomTabNavigator<RootTabParamList>();

interface TabIconProps {
  emoji: string;
  focused: boolean;
  accessibilityLabel: string;
}

const TabIcon: React.FC<TabIconProps> = ({ emoji, focused, accessibilityLabel }) => (
  <Text
    style={[styles.tabIcon, focused ? styles.tabIconFocused : styles.tabIconUnfocused]}
    accessibilityLabel={accessibilityLabel}
    accessibilityRole="image"
  >
    {emoji}
  </Text>
);

export const RootNavigator: React.FC = () => {
  const insets = useSafeAreaInsets();
  const paddingBottom = insets.bottom > 0 ? insets.bottom : 8;

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.tabBarActive,
        tabBarInactiveTintColor: Colors.tabBarInactive,
        tabBarStyle: {
          backgroundColor: Colors.tabBar,
          borderTopWidth: 1,
          borderTopColor: Colors.border,
          paddingBottom,
          height: 60 + paddingBottom,
        },
        tabBarLabelStyle: styles.tabLabel,
      }}
    >
      <Tab.Screen
        name="Pokedex"
        component={PokedexStack}
        options={{
          tabBarLabel: 'Pokédex',
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="📖" focused={focused} accessibilityLabel="Pokédex" />
          ),
        }}
      />
      <Tab.Screen
        name="Trainer"
        component={TrainerStack}
        options={{
          tabBarLabel: 'Entrenador',
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="🎒" focused={focused} accessibilityLabel="Entrenador" />
          ),
        }}
        listeners={() => ({
          tabPress: () => {
            const { step1Data, isEditing } = useTrainerStore.getState();
            if (!step1Data && !isEditing) {
              useTrainerStore.getState().startCreate();
            }
          },
        })}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabIcon: { opacity: 1 },
  tabIconFocused: { fontSize: 26, opacity: 1 },
  tabIconUnfocused: { fontSize: 22, opacity: 0.6 },
  tabLabel: { fontSize: 12, fontWeight: '600', marginBottom: 4 },
});