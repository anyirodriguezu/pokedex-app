import * as Haptics from 'expo-haptics';
import React, { useState } from 'react';
import { FlatList, Image, Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import { MoveToBoxModal } from '../../../components/ui/MoveToBoxModal';
import { ReleaseModal } from '../../../components/ui/ReleaseModal';
import { Card, Text, XStack, YStack } from 'tamagui';
import { EmptyState } from '../../../components/ui/EmptyState';
import { Colors } from '../../../constants/colors';
import { getTrainerTypeColor, getTextColor } from '../../../utils/pokemonHelpers';
import { useTrainerStore } from '../../../store/trainerStore';
import { TYPE_EMOJI } from '../../trainer/constants/typeEmoji';
import { CapturedPokemon, MAX_ACTIVE_TEAM } from '../../trainer/types/trainer.types';
import { ReleaseEffect } from '../../pokedex/components/ReleaseEffect';

// Slot vacío con pokébola outline
const EmptySlot: React.FC<{ index: number; slotSize: number }> = ({ index, slotSize }) => (
  <View
    style={[styles.emptySlot, { width: slotSize, height: slotSize + 24 }]}
    accessibilityLabel={`Espacio vacío ${index + 1}`}
    accessibilityRole="none"
  >
    <View style={styles.emptyBall}>
      <View style={styles.emptyBallTop} />
      <View style={styles.emptyBallBottom} />
      <View style={styles.emptyBallDivider} />
      <View style={styles.emptyBallCenter} />
    </View>
    <Text style={styles.emptySlotLabel}>Vacío</Text>
  </View>
);

interface TeamSlotProps {
  pokemon: CapturedPokemon;
  onRelease: (id: number) => void;
  onMoveToBox: (id: number) => void;
}

interface SlotMenuProps {
  pokemon: CapturedPokemon;
  onRelease: (id: number) => void;
  onMoveToBox: (id: number) => void;
  menuOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  slotSize: number;
}

const TeamSlot: React.FC<SlotMenuProps> = ({
  pokemon,
  onRelease,
  onMoveToBox,
  menuOpen,
  onToggle,
  onClose,
  slotSize,
}) => (
  <View style={[styles.teamSlot, { width: slotSize }]}>
    <Pressable
      onPress={onToggle}
      style={[styles.teamSlotInner, { width: slotSize, height: slotSize + 24 }]}
      accessibilityRole="button"
      accessibilityLabel={pokemon.name}
      accessibilityHint="Toca para opciones"
    >
      <Image
        source={{ uri: pokemon.sprite }}
        style={styles.teamSprite}
        resizeMode="contain"
        accessibilityLabel={`Imagen de ${pokemon.name}`}
      />
      <Text style={styles.teamMemberName} numberOfLines={1}>
        {pokemon.name}
      </Text>
    </Pressable>

    {menuOpen && (
      <>
        <Pressable style={styles.slotMenuOverlay} onPress={onClose} />
        <View style={styles.slotMenu}>
          <Pressable
            style={styles.slotMenuBtn}
            onPress={() => { onClose(); onMoveToBox(pokemon.id); }}
            accessibilityRole="button"
            accessibilityLabel="Mover a Caja PC"
          >
            <Text style={styles.slotMenuText}>📦 A la Caja</Text>
          </Pressable>
          <Pressable
            style={[styles.slotMenuBtn, styles.slotMenuBtnDanger]}
            onPress={() => { onClose(); onRelease(pokemon.id); }}
            accessibilityRole="button"
            accessibilityLabel="Liberar"
          >
            <Text style={[styles.slotMenuText, styles.slotMenuTextDanger]}>🔓 Liberar</Text>
          </Pressable>
        </View>
      </>
    )}
  </View>
);

interface BoxCardProps {
  pokemon: CapturedPokemon;
  onMoveToTeam: (id: number) => void;
  onRelease: (id: number) => void;
  teamFull: boolean;
}

const BoxCard: React.FC<BoxCardProps> = ({ pokemon, onMoveToTeam, onRelease, teamFull }) => (
  <View style={styles.boxCard}>
    <Image
      source={{ uri: pokemon.sprite }}
      style={styles.boxSprite}
      resizeMode="contain"
      accessibilityLabel={pokemon.name}
    />
    <Text style={styles.boxName} numberOfLines={1}>{pokemon.name}</Text>
    <Pressable
      style={[styles.boxBtn, teamFull && styles.boxBtnDisabled]}
      onPress={() => !teamFull && onMoveToTeam(pokemon.id)}
      accessibilityRole="button"
      accessibilityLabel={teamFull ? 'Equipo lleno' : `Mover ${pokemon.name} al equipo`}
    >
      <Text style={[styles.boxBtnText, teamFull && styles.boxBtnTextDisabled]}>
        {teamFull ? '🔒' : '⚡'}
      </Text>
    </Pressable>
    <Pressable
      style={styles.boxReleaseBtn}
      onPress={() => onRelease(pokemon.id)}
      accessibilityRole="button"
      accessibilityLabel={`Liberar a ${pokemon.name}`}
    >
      <Text style={styles.boxReleaseBtnText}>🔓</Text>
    </Pressable>
  </View>
);

const TEAM_COLS = 3;
const TEAM_GAP = 8;
const CONTENT_PADDING = 32; // 16px each side

export const TeamScreen: React.FC = () => {
  const { profile, activeTeam, box, release, moveToTeam, moveToBox } = useTrainerStore();
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [releasingId, setReleasingId] = useState<number | null>(null);
  const [movingToBoxId, setMovingToBoxId] = useState<number | null>(null);
  const [releaseAnimId, setReleaseAnimId] = useState<number | null>(null);
  const { width: screenWidth } = useWindowDimensions();

  const slotSize = Math.floor(
    (screenWidth - CONTENT_PADDING - TEAM_GAP * (TEAM_COLS - 1)) / TEAM_COLS
  );

  const allPokemon = [...activeTeam, ...box];
  const releasingPokemon = releasingId !== null
    ? allPokemon.find((c) => c.id === releasingId) ?? null
    : null;
  const movingToBoxPokemon = movingToBoxId !== null
    ? allPokemon.find((c) => c.id === movingToBoxId) ?? null
    : null;

  const typeColor = profile ? getTrainerTypeColor(profile.favoritePokemonType) : Colors.primary;
  const typeTextColor = getTextColor(typeColor);
  const teamFull = activeTeam.length >= MAX_ACTIVE_TEAM;

  // Build 6-slot grid + invisible fillers to complete the last row
  const teamSlots = Array.from({ length: MAX_ACTIVE_TEAM }, (_, i) => ({
    index: i,
    pokemon: activeTeam[i] ?? null,
    isFiller: false,
  }));
  const fillerCount = (TEAM_COLS - (MAX_ACTIVE_TEAM % TEAM_COLS)) % TEAM_COLS;
  const gridItems = [
    ...teamSlots,
    ...Array.from({ length: fillerCount }, (_, i) => ({ index: -(i + 1), pokemon: null, isFiller: true })),
  ];

  return (
    <View style={styles.screenRoot}>
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.content}
      data={box}
      keyExtractor={(item) => String(item.id)}
      ListHeaderComponent={
        <YStack gap="$4">
          {/* Trainer summary */}
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
                  <Text style={[styles.avatarLetter, { color: typeTextColor }]}>
                    {profile.fullName.charAt(0).toUpperCase()}
                  </Text>
                </YStack>
                <YStack flex={1}>
                  <Text style={styles.trainerName}>{profile.fullName}</Text>
                  <Text style={styles.trainerType}>
                    {TYPE_EMOJI[profile.favoritePokemonType]} {profile.favoritePokemonType}
                  </Text>
                </YStack>
              </XStack>
              {profile.starterPokemon && (
                <XStack items="center" gap="$3" bg="$appBackground" rounded={12} p="$3">
                  <Image
                    source={{ uri: profile.starterPokemon.sprite }}
                    style={styles.starterSprite}
                    resizeMode="contain"
                    accessibilityLabel={`Pokémon inicial: ${profile.starterPokemon.name}`}
                  />
                  <YStack>
                    <Text style={styles.starterLabel}>Pokémon Inicial</Text>
                    <Text style={styles.starterName}>{profile.starterPokemon.name}</Text>
                  </YStack>
                </XStack>
              )}
            </Card>
          ) : (
            <Card bg="$surface" rounded={16} p="$4" elevation={2}>
              <Text style={styles.noProfileText}>
                Completa tu registro de entrenador para ver tu perfil aquí
              </Text>
            </Card>
          )}

          {/* Active team — 7 slots */}
          <YStack gap="$3">
            <XStack justify="space-between" items="center">
              <Text style={styles.sectionTitle}>Equipo Activo</Text>
              <Text style={styles.sectionCount}>
                {activeTeam.length}/{MAX_ACTIVE_TEAM}
              </Text>
            </XStack>

            <View style={styles.teamGrid}>
              {gridItems.map(({ index, pokemon, isFiller }) =>
                isFiller ? (
                  <View key={`filler-${index}`} style={{ width: slotSize }} />
                ) : pokemon ? (
                  <TeamSlot
                    key={pokemon.id}
                    pokemon={pokemon}
                    slotSize={slotSize}
                    menuOpen={openMenuId === pokemon.id}
                    onToggle={() => setOpenMenuId((prev) => (prev === pokemon.id ? null : pokemon.id))}
                    onClose={() => setOpenMenuId(null)}
                    onRelease={(id) => setReleasingId(id)}
                    onMoveToBox={(id) => setMovingToBoxId(id)}
                  />
                ) : (
                  <EmptySlot key={`empty-${index}`} index={index} slotSize={slotSize} />
                )
              )}
            </View>
          </YStack>

          {/* PC Box header */}
          {box.length > 0 && (
            <YStack gap="$2">
              <XStack justify="space-between" items="center">
                <Text style={styles.sectionTitle}>📦 Caja PC</Text>
                <Text style={styles.sectionCount}>{box.length} pokémon</Text>
              </XStack>
              <Text style={styles.boxHint}>
                {teamFull
                  ? 'Tu equipo está lleno. Libera un slot para mover pokémon al equipo.'
                  : 'Toca ⚡ para mover un pokémon al equipo activo.'}
              </Text>
            </YStack>
          )}
        </YStack>
      }
      renderItem={({ item }) => (
        <BoxCard
          pokemon={item}
          teamFull={teamFull}
          onMoveToTeam={(id) => {
            moveToTeam(id);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          }}
          onRelease={(id) => setReleasingId(id)}
        />
      )}
      numColumns={3}
      columnWrapperStyle={styles.boxRow}
      ListEmptyComponent={
        activeTeam.length === 0 ? (
          <EmptyState message="No has capturado ningún Pokémon todavía" />
        ) : null
      }
      ListFooterComponent={<View style={{ height: 32 }} />}
    />

    <MoveToBoxModal
      visible={movingToBoxId !== null}
      pokemonName={movingToBoxPokemon?.name ?? ''}
      onConfirm={() => {
        if (movingToBoxId !== null) {
          moveToBox(movingToBoxId);
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        setMovingToBoxId(null);
      }}
      onCancel={() => setMovingToBoxId(null)}
    />

    <ReleaseModal
      visible={releasingId !== null}
      pokemonName={releasingPokemon?.name ?? ''}
      context="team"
      onConfirm={() => {
        setReleaseAnimId(releasingId);
        setReleasingId(null);
      }}
      onCancel={() => setReleasingId(null)}
    />

    <ReleaseEffect
      visible={releaseAnimId !== null}
      onComplete={() => {
        if (releaseAnimId !== null) {
          release(releaseAnimId);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        }
        setReleaseAnimId(null);
      }}
    />
    </View>
  );
};

const styles = StyleSheet.create({
  screenRoot: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: 16,
    gap: 16,
  },
  // Team grid
  teamGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  teamSlot: {
    position: 'relative',
  },
  teamSlotInner: {
    borderRadius: 14,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
    overflow: 'hidden',
    elevation: 2,
    gap: 4,
    paddingVertical: 6,
  },
  teamSprite: {
    width: 64,
    height: 64,
  },
  teamMemberName: {
    fontSize: 11,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
    paddingHorizontal: 4,
  },
  slotMenuOverlay: {
    position: 'absolute',
    top: -1000,
    left: -1000,
    right: -1000,
    bottom: -1000,
  },
  slotMenu: {
    position: 'absolute',
    bottom: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 12,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    zIndex: 10,
    overflow: 'hidden',
  },
  slotMenuBtn: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  slotMenuBtnDanger: {
    borderBottomWidth: 0,
  },
  slotMenuText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
  },
  slotMenuTextDanger: {
    color: '#E53935',
  },
  // Empty slot
  emptySlot: {
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#ddd',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  emptyBall: {
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#ccc',
    position: 'relative',
  },
  emptyBallTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '50%',
    backgroundColor: '#e8e8e8',
  },
  emptyBallBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
    backgroundColor: '#f5f5f5',
  },
  emptyBallDivider: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    height: 2,
    marginTop: -1,
    backgroundColor: '#ccc',
  },
  emptyBallCenter: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#f5f5f5',
    borderWidth: 2,
    borderColor: '#ccc',
    marginTop: -5,
    marginLeft: -5,
  },
  emptySlotLabel: {
    fontSize: 10,
    color: '#bbb',
    fontWeight: '500',
  },
  // Trainer card
  avatarLetter: {
    fontSize: 22,
    fontWeight: '800',
  },
  trainerName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1a1a1a',
  },
  trainerType: {
    fontSize: 13,
    color: '#666',
  },
  starterSprite: {
    width: 56,
    height: 56,
  },
  starterLabel: {
    fontSize: 12,
    color: '#999',
  },
  starterName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  noProfileText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  // Sections
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  sectionCount: {
    fontSize: 13,
    color: '#999',
  },
  boxHint: {
    fontSize: 12,
    color: '#aaa',
    fontStyle: 'italic',
  },
  // PC Box
  boxRow: {
    gap: 8,
    marginBottom: 8,
  },
  boxCard: {
    flex: 1,
    backgroundColor: '#f0f4ff',
    borderRadius: 14,
    padding: 8,
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: '#dde4ff',
    minWidth: 80,
  },
  boxSprite: {
    width: 56,
    height: 56,
  },
  boxName: {
    fontSize: 11,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
  },
  boxBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#22C55E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxBtnDisabled: {
    backgroundColor: '#e0e0e0',
  },
  boxBtnText: {
    fontSize: 14,
  },
  boxBtnTextDisabled: {
    opacity: 0.4,
  },
  boxReleaseBtn: {
    paddingVertical: 2,
    paddingHorizontal: 6,
  },
  boxReleaseBtnText: {
    fontSize: 12,
  },
});
