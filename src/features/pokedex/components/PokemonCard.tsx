import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { Card, Text, YStack } from 'tamagui';
import { Colors } from '../../../constants/colors';
import { useTrainerStore } from '../../../store/trainerStore';
import { capitalize, getPokemonImageUrl } from '../../../utils/pokemonHelpers';
import { PokemonWithId } from '../types/pokemon.types';

interface PokemonCardProps {
  pokemon: PokemonWithId;
  onPress: (id: number, name: string) => void;
}

const PokeballBadge: React.FC = () => (
  <View style={styles.pokeballBadge} accessibilityLabel="Pokémon capturado">
    <View style={styles.pokeballTop} />
    <View style={styles.pokeballBar} />
    <View style={styles.pokeballCenter} />
  </View>
);

export const PokemonCard = React.memo(function PokemonCard({
  pokemon,
  onPress,
}: PokemonCardProps) {
  const imageUrl = getPokemonImageUrl(pokemon.id);
  const paddedId = String(pokemon.id).padStart(3, '0');
  const isCaptured = useTrainerStore(
    (state) =>
      state.activeTeam.some((c) => c.id === pokemon.id) ||
      state.box.some((c) => c.id === pokemon.id)
  );

  return (
    <Card
      flex={1}
      m="$1.5"
      bg="$surface"
      rounded={16}
      overflow="hidden"
      elevation={3}
      pressStyle={{ opacity: 0.85, scale: 0.97 }}
      onPress={() => onPress(pokemon.id, pokemon.name)}
      accessibilityRole="button"
      accessibilityLabel={capitalize(pokemon.name) + ', número ' + paddedId}
      accessibilityHint="Toca para ver los detalles"
    >
      <YStack bg="$appBackground" items="center" pt="$3" pb="$1">
        <Image
          source={{ uri: imageUrl }}
          style={{ width: 100, height: 100 }}
          resizeMode="contain"
          accessibilityLabel={'Imagen de ' + capitalize(pokemon.name)}
        />
        {isCaptured && <PokeballBadge />}
      </YStack>
      <YStack p="$2.5" items="center">
        <Text fontSize={12} color="$textSecondary" fontWeight="500">
          #{paddedId}
        </Text>
        <Text fontSize={14} fontWeight="700" color="$appText" mt="$0.5">
          {capitalize(pokemon.name)}
        </Text>
      </YStack>
    </Card>
  );
});

const styles = StyleSheet.create({
  pokeballBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 22,
    height: 22,
    borderRadius: 11,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#fff',
  },
  pokeballTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '50%',
    backgroundColor: Colors.primary,
  },
  pokeballBar: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    height: 2,
    marginTop: -1,
    backgroundColor: '#333',
    zIndex: 1,
  },
  pokeballCenter: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#333',
    marginTop: -4,
    marginLeft: -4,
    zIndex: 2,
  },
});
