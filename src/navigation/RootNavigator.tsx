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

const TabIcon = ({ emoji, focused }: { emoji: string; focused: boolean }) => (
  <Text style={[styles.tabIcon, focused ? styles.tabIconFocused : styles.tabIconUnfocused]}>
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
          tabBarIcon: ({ focused }) => <TabIcon emoji="📖" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Trainer"
        component={TrainerStack}
        options={{
          tabBarLabel: 'Entrenador',
          tabBarIcon: ({ focused }) => <TabIcon emoji="🎒" focused={focused} />,
        }}
        listeners={() => ({
          tabPress: () => {
            useTrainerStore.getState().startCreate();
          },
        })}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabIcon: {
    opacity: 1,
  },
  tabIconFocused: {
    fontSize: 26,
    opacity: 1,
  },
  tabIconUnfocused: {
    fontSize: 22,
    opacity: 0.6,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
});
