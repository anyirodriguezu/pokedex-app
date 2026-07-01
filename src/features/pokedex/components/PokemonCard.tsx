import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Colors } from '../../../constants/colors';
import { capitalize, getPokemonImageUrl } from '../../../utils/pokemonHelpers';
import { PokemonWithId } from '../types/pokemon.types';

interface PokemonCardProps {
  pokemon: PokemonWithId;
  onPress: () => void;
}

export const PokemonCard: React.FC<PokemonCardProps> = ({ pokemon, onPress }) => {
  const imageUrl = getPokemonImageUrl(pokemon.id);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: imageUrl }}
          style={styles.image}
          resizeMode="contain"
        />
      </View>
      <View style={styles.info}>
        <Text style={styles.number}>#{String(pokemon.id).padStart(3, '0')}</Text>
        <Text style={styles.name}>{capitalize(pokemon.name)}</Text>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    margin: 6,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.97 }],
  },
  imageContainer: {
    backgroundColor: Colors.background,
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 4,
  },
  image: {
    width: 100,
    height: 100,
  },
  info: {
    padding: 10,
    alignItems: 'center',
  },
  number: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  name: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
    marginTop: 2,
  },
});
