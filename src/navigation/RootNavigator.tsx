import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React, { useEffect, useRef } from 'react';
import { Dimensions, PanResponder, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from 'tamagui';
import { Colors } from '../constants/colors';
import { useTrainerStore } from '../store/trainerStore';
import { PokedexStack } from './PokedexStack';
import { TeamStack } from './TeamStack';
import { TrainerStack } from './TrainerStack';
import { RootTabParamList } from './types';

const Tab = createBottomTabNavigator<RootTabParamList>();

const TAB_ORDER: (keyof RootTabParamList)[] = ['Pokedex', 'Team', 'Trainer'];

interface SwipeNavigation {
  navigate(name: keyof RootTabParamList): void;
}

const EDGE_ZONE = 32;

function makeSwipeWrapper<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  tabIndex: number,
): React.ComponentType<P> {
  const SwipeWrapper: React.FC<P & { navigation: SwipeNavigation }> = (props) => {
    const navRef = useRef(props.navigation);
    useEffect(() => { navRef.current = props.navigation; }, [props.navigation]);

    const pan = useRef(
      PanResponder.create({
        // Capture before children (FlatList, ScrollView) only when the gesture
        // starts at a screen edge and is clearly horizontal.
        onMoveShouldSetPanResponderCapture: (_, gs) => {
          const { width } = Dimensions.get('window');
          const startedAtLeft  = gs.x0 < EDGE_ZONE;
          const startedAtRight = gs.x0 > width - EDGE_ZONE;
          const isHorizontal   = Math.abs(gs.dx) > 10 && Math.abs(gs.dx) > Math.abs(gs.dy) * 2;
          return (startedAtLeft || startedAtRight) && isHorizontal;
        },
        onPanResponderTerminationRequest: () => true,
        onPanResponderRelease: (_, gs) => {
          const isFastSwipe  = Math.abs(gs.vx) > 0.3;
          const isLongSwipe  = Math.abs(gs.dx) > 50;
          const isHorizontal = Math.abs(gs.dx) > Math.abs(gs.dy) * 1.5;
          if ((!isFastSwipe && !isLongSwipe) || !isHorizontal) return;

          if (gs.dx < 0 && tabIndex < TAB_ORDER.length - 1) {
            const next = TAB_ORDER[tabIndex + 1];
            if (next === 'Trainer') {
              const { step1Data, isEditing } = useTrainerStore.getState();
              if (!step1Data && !isEditing) useTrainerStore.getState().startCreate();
            }
            navRef.current.navigate(next);
          } else if (gs.dx > 0 && tabIndex > 0) {
            navRef.current.navigate(TAB_ORDER[tabIndex - 1]);
          }
        },
      })
    ).current;

    return (
      <View style={{ flex: 1 }} {...pan.panHandlers}>
        <WrappedComponent {...props} />
      </View>
    );
  };
  return SwipeWrapper as React.ComponentType<P>;
}

const PokedexSwipeable = makeSwipeWrapper(PokedexStack, 0);
const TeamSwipeable    = makeSwipeWrapper(TeamStack,    1);
const TrainerSwipeable = makeSwipeWrapper(TrainerStack, 2);

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
        component={PokedexSwipeable}
        options={{
          tabBarLabel: 'Pokédex',
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="📖" focused={focused} accessibilityLabel="Pokédex" />
          ),
        }}
        listeners={({ navigation }) => ({
          tabPress: () => {
            navigation.navigate('Pokedex', { screen: 'PokemonList' });
          },
        })}
      />
      <Tab.Screen
        name="Team"
        component={TeamSwipeable}
        options={{
          tabBarLabel: 'Mi Equipo',
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="⚡" focused={focused} accessibilityLabel="Mi Equipo" />
          ),
        }}
      />
      <Tab.Screen
        name="Trainer"
        component={TrainerSwipeable}
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
  tabIcon:         { opacity: 1 },
  tabIconFocused:  { fontSize: 26, opacity: 1 },
  tabIconUnfocused:{ fontSize: 22, opacity: 0.6 },
  tabLabel:        { fontSize: 12, fontWeight: '600', marginBottom: 4 },
});
