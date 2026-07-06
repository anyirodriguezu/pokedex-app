import React from 'react';
import { Image, StyleSheet } from 'react-native';
import { Card, Separator, Text, XStack, YStack } from 'tamagui';
import { getTrainerTypeColor, getTextColor } from '../../../utils/pokemonHelpers';
import { TYPE_EMOJI } from '../constants/typeEmoji';
import { TrainerProfile } from '../types/trainer.types';

interface TrainerCardProps {
  profile: TrainerProfile;
}

const InfoRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <XStack justify="space-between" items="center" py="$2">
    <Text fontSize={14} color="$textSecondary" fontWeight="500">
      {label}
    </Text>
    <Text
      fontSize={15}
      color="$appText"
      fontWeight="600"
      shrink={1}
      style={{ textAlign: 'right' }}
      ml="$2"
    >
      {value}
    </Text>
  </XStack>
);

export const TrainerCard: React.FC<TrainerCardProps> = ({ profile }) => {
  const typeColor = getTrainerTypeColor(profile.favoritePokemonType);
  const typeTextColor = getTextColor(typeColor);

  return (
    <Card bg="$surface" rounded={20} p="$5" elevation={4}>
      <XStack items="center" gap="$4" mb="$4">
        <YStack
          width={64}
          height={64}
          rounded={32}
          items="center"
          justify="center"
          style={{ backgroundColor: typeColor }}
        >
          <Text fontSize={28} fontWeight="800" style={{ color: typeTextColor }}>
            {profile.fullName.charAt(0).toUpperCase()}
          </Text>
        </YStack>
        <YStack flex={1}>
          <Text fontSize={20} fontWeight="800" color="$appText">
            {profile.fullName}
          </Text>
          <Text fontSize={13} color="$textSecondary" mt="$0.5">
            Entrenador Pokémon
          </Text>
        </YStack>
      </XStack>

      <Separator mb="$2" borderColor="$appBorder" />

      <YStack gap="$0.5">
        <InfoRow label="Edad" value={`${profile.age} años`} />
        <InfoRow label="Email" value={profile.email} />
        <InfoRow label="Distrito" value={profile.district} />
        <InfoRow
          label="Tipo favorito"
          value={`${TYPE_EMOJI[profile.favoritePokemonType] ?? ''} ${profile.favoritePokemonType}`}
        />
      </YStack>

      {profile.starterPokemon && (
        <>
          <Separator mt="$2" mb="$3" borderColor="$appBorder" />
          <XStack items="center" gap="$3" bg="$appBackground" rounded={12} p="$3">
            <Image
              source={{ uri: profile.starterPokemon.sprite }}
              style={styles.starterImage}
              resizeMode="contain"
              accessibilityLabel={`Pokémon inicial: ${profile.starterPokemon.name}`}
            />
            <YStack>
              <Text fontSize={12} color="$textSecondary">
                Pokémon Inicial
              </Text>
              <Text fontSize={16} fontWeight="700" color="$appText">
                {profile.starterPokemon.name}
              </Text>
            </YStack>
          </XStack>
        </>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  starterImage: {
    width: 56,
    height: 56,
  },
});
