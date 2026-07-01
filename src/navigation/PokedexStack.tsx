import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { PokemonDetailScreen } from '../features/pokedex/screens/PokemonDetailScreen';
import { PokemonListScreen } from '../features/pokedex/screens/PokemonListScreen';
import { Colors } from '../constants/colors';
import { capitalize } from '../utils/pokemonHelpers';
import { PokedexStackParamList } from './types';

const Stack = createNativeStackNavigator<PokedexStackParamList>();

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
        options={{ title: 'Pokédex' }}
      />
      <Stack.Screen
        name="PokemonDetail"
        component={PokemonDetailScreen}
        options={({ route }) => ({ title: capitalize(route.params.pokemonName) })}
      />
    </Stack.Navigator>
  );
};
