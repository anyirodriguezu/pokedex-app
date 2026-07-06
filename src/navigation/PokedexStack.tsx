import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'tamagui';
import { PokemonDetailScreen } from '../features/pokedex/screens/PokemonDetailScreen';
import { PokemonListScreen } from '../features/pokedex/screens/PokemonListScreen';
import { Colors } from '../constants/colors';
import { capitalize } from '../utils/pokemonHelpers';
import { PokedexStackParamList } from './types';

const Stack = createNativeStackNavigator<PokedexStackParamList>();

const PokedexHeaderTitle: React.FC = () => (
  <View style={headerStyles.row}>
    <View style={headerStyles.ball}>
      <View style={headerStyles.ballTop} />
      <View style={headerStyles.ballDivider} />
      <View style={headerStyles.ballBottom} />
      <View style={headerStyles.ballCenter} />
    </View>
    <Text style={headerStyles.title}>Pokédex</Text>
  </View>
);

const headerStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  ball: {
    width: 26,
    height: 26,
    borderRadius: 13,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.6)',
    position: 'relative',
  },
  ballTop: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    height: '50%',
    backgroundColor: '#EF4444',
  },
  ballBottom: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    height: '50%',
    backgroundColor: '#fff',
  },
  ballDivider: {
    position: 'absolute',
    top: '50%',
    left: 0, right: 0,
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.6)',
    marginTop: -1,
  },
  ballCenter: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.6)',
    top: '50%',
    left: '50%',
    marginTop: -4,
    marginLeft: -4,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.5,
  },
});

export const PokedexStack: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: Colors.primary },
        headerTintColor: Colors.textLight,
        headerTitleStyle: { fontWeight: '700' },
      }}
    >
      <Stack.Screen
        name="PokemonList"
        component={PokemonListScreen}
        options={{ headerTitle: () => <PokedexHeaderTitle /> }}
      />
      <Stack.Screen
        name="PokemonDetail"
        component={PokemonDetailScreen}
        options={({ route }) => ({ title: capitalize(route.params.pokemonName) })}
      />
    </Stack.Navigator>
  );
};
