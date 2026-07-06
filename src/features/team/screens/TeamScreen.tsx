import * as Haptics from 'expo-haptics';
import React, { useState } from 'react';
import { Image, ScrollView, StyleSheet, View } from 'react-native';
import { ReleaseModal } from '../../../components/ui/ReleaseModal';
import { Button } from '../../../components/ui/Button';
import { Card, Text, XStack, YStack } from 'tamagui';
import { EmptyState } from '../../../components/ui/EmptyState';
import { Colors } from '../../../constants/colors';
import { getTrainerTypeColor, getTextColor } from '../../../utils/pokemonHelpers';
import { useTrainerStore } from '../../../store/trainerStore';
import { TYPE_EMOJI } from '../../trainer/constants/typeEmoji';
import { CapturedPokemon } from '../../trainer/types/trainer.types';

const MAX_TEAM_SIZE = 6;

interface TeamMemberCardProps {
  pokemon: CapturedPokemon;
  onRelease: (id: number) => void;
}

const TeamMemberCard: React.FC<TeamMemberCardProps> = ({ pokemon, onRelease }) => (
  <Card
    bg="$surface"
    rounded={16}
    p="$3"
    elevation={2}
    items="center"
    gap="$2"
    style={styles.memberCard}
    accessibilityLabel={pokemon.name}
  >
    <Image
      source={{ uri: pokemon.sprite }}
      style={styles.memberSprite}
      resizeMode="contain"
      accessibilityLabel={`Imagen de ${pokemon.name}`}
    />
    <Text fontSize={12} fontWeight="700" color="$appText" style={{ textAlign: 'center' }}>
      {pokemon.name}
    </Text>
    <Button
      label="🔓"
      variant="muted"
      onPress={() => onRelease(pokemon.id)}
    />
  </Card>
);

export const TeamScreen: React.FC = () => {
  const { profile, captured, release } = useTrainerStore();
  const [releasingId, setReleasingId] = useState<number | null>(null);

  const activeTeam = [...captured].reverse().slice(0, MAX_TEAM_SIZE);
  const releasingPokemon = releasingId !== null
    ? captured.find((c) => c.id === releasingId) ?? null
    : null;
  const typeColor = profile ? getTrainerTypeColor(profile.favoritePokemonType) : Colors.primary;
  const typeTextColor = getTextColor(typeColor);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <YStack gap="$5">
        <Text fontSize={26} fontWeight="800" color="$appText">
          Mi Equipo
        </Text>

        {/* Trainer summary card */}
        {profile ? (
          <Card bg="$surface" rounded={20} p="$4" elevation={4} gap="$3">
            <XStack items="center" gap="$3">
              <YStack
                width={52}
                height={52}
                rounded={26}
                items="center"
                justify="center"
                style={{ backgroundColor: typeColor }}
              >
                <Text fontSize={22} fontWeight="800" style={{ color: typeTextColor }}>
                  {profile.fullName.charAt(0).toUpperCase()}
                </Text>
              </YStack>
              <YStack flex={1}>
                <Text fontSize={18} fontWeight="800" color="$appText">
                  {profile.fullName}
                </Text>
                <Text fontSize={13} color="$textSecondary">
                  {TYPE_EMOJI[profile.favoritePokemonType]} {profile.favoritePokemonType}
                </Text>
              </YStack>
            </XStack>

            {profile.starterPokemon && (
              <XStack
                items="center"
                gap="$3"
                bg="$appBackground"
                rounded={12}
                p="$3"
              >
                <Image
                  source={{ uri: profile.starterPokemon.sprite }}
                  style={styles.starterSprite}
                  resizeMode="contain"
                  accessibilityLabel={`Pokémon inicial: ${profile.starterPokemon.name}`}
                />
                <YStack>
                  <Text fontSize={12} color="$textSecondary">
                    Pokémon Inicial
                  </Text>
                  <Text fontSize={15} fontWeight="700" color="$appText">
                    {profile.starterPokemon.name}
                  </Text>
                </YStack>
              </XStack>
            )}
          </Card>
        ) : (
          <Card bg="$surface" rounded={16} p="$4" elevation={2}>
            <Text fontSize={14} color="$textSecondary" style={{ textAlign: 'center' }}>
              Completa tu registro de entrenador para ver tu perfil aquí
            </Text>
          </Card>
        )}

        {/* Active team */}
        <YStack gap="$3">
          <XStack justify="space-between" items="center">
            <Text fontSize={18} fontWeight="700" color="$appText">
              Equipo Activo
            </Text>
            <Text fontSize={13} color="$textSecondary">
              {activeTeam.length}/{MAX_TEAM_SIZE}
            </Text>
          </XStack>

          {activeTeam.length === 0 ? (
            <EmptyState message="No has capturado ningún Pokémon todavía" />
          ) : (
            <View style={styles.teamGrid}>
              {activeTeam.map((pokemon) => (
                <TeamMemberCard
                  key={pokemon.id}
                  pokemon={pokemon}
                  onRelease={(id) => setReleasingId(id)}
                />
              ))}
            </View>
          )}
        </YStack>
      </YStack>
      <ReleaseModal
        visible={releasingId !== null}
        pokemonName={releasingPokemon?.name ?? ''}
        context="team"
        onConfirm={() => {
          if (releasingId !== null) {
            release(releasingId);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          }
          setReleasingId(null);
        }}
        onCancel={() => setReleasingId(null)}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  teamGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  memberCard: {
    width: '30%',
  },
  memberSprite: {
    width: 72,
    height: 72,
  },
  starterSprite: {
    width: 56,
    height: 56,
  },
});
