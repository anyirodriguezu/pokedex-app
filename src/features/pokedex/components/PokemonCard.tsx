import React from 'react';
import { Image } from 'react-native';
import { Card, Text, YStack } from 'tamagui';
import { capitalize, getPokemonImageUrl } from '../../../utils/pokemonHelpers';
import { PokemonWithId } from '../types/pokemon.types';

interface PokemonCardProps {
  pokemon: PokemonWithId;
  onPress: (id: number, name: string) => void;
}

export const PokemonCard = React.memo(function PokemonCard({ pokemon, onPress }: PokemonCardProps) {
  const imageUrl = getPokemonImageUrl(pokemon.id);

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
    >
      <YStack bg="$appBackground" items="center" pt="$3" pb="$1">
        <Image
          source={{ uri: imageUrl }}
          style={{ width: 100, height: 100 }}
          resizeMode="contain"
        />
      </YStack>
      <YStack p="$2.5" items="center">
        <Text fontSize={12} color="$textSecondary" fontWeight="500">
          #{String(pokemon.id).padStart(3, '0')}
        </Text>
        <Text fontSize={14} fontWeight="700" color="$appText" mt="$0.5">
          {capitalize(pokemon.name)}
        </Text>
      </YStack>
    </Card>
  );
});
