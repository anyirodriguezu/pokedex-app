import * as Haptics from 'expo-haptics';
import React, { useState } from 'react';
import { FlatList, Image, Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import { MoveToBoxModal } from '../../../components/ui/MoveToBoxModal';
import { ReleaseModal } from '../../../components/ui/ReleaseModal';
import { TransferMachineModal } from '../../../components/ui/TransferMachineModal';
import { Text, XStack, YStack } from 'tamagui';
import { EmptyState } from '../../../components/ui/EmptyState';
import { Colors } from '../../../constants/colors';
import { useTrainerStore } from '../../../store/trainerStore';
import { CapturedPokemon, MAX_ACTIVE_TEAM } from '../../trainer/types/trainer.types';
import { ReleaseEffect } from '../../pokedex/components/ReleaseEffect';

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

interface SlotMenuProps {
  pokemon: CapturedPokemon;
  onRelease: (id: number) => void;
  onMoveToBox: (id: number) => void;
  menuOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  slotSize: number;
  menuBelow?: boolean;
}

const TeamSlot: React.FC<SlotMenuProps> = ({
  pokemon,
  onRelease,
  onMoveToBox,
  menuOpen,
  onToggle,
  onClose,
  slotSize,
  menuBelow = false,
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
        <View style={[styles.slotMenu, menuBelow ? styles.slotMenuBelow : styles.slotMenuAbove]}>
          <Pressable
            style={styles.slotMenuBtn}
            onPress={() => { onClose(); onMoveToBox(pokemon.id); }}
            accessibilityRole="button"
            accessibilityLabel="Mover al Laboratorio"
          >
            <Text style={styles.slotMenuText}>🧪 Al Laboratorio</Text>
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

interface LabCardProps {
  pokemon: CapturedPokemon;
  onRelease: (id: number) => void;
  teamFull: boolean;
}

const LabCard: React.FC<LabCardProps> = ({ pokemon, onRelease, teamFull }) => (
  <View style={styles.boxCard}>
    <Image
      source={{ uri: pokemon.sprite }}
      style={styles.boxSprite}
      resizeMode="contain"
      accessibilityLabel={pokemon.name}
    />
    <Text style={styles.boxName} numberOfLines={1}>{pokemon.name}</Text>
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
const CONTENT_PADDING = 32;

export const TeamScreen: React.FC = () => {
  const { activeTeam, box, release, moveToTeam, moveToBox, swapPokemon } = useTrainerStore();
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [releasingId, setReleasingId] = useState<number | null>(null);
  const [movingToBoxId, setMovingToBoxId] = useState<number | null>(null);
  const [releaseAnimId, setReleaseAnimId] = useState<number | null>(null);
  const [showTransfer, setShowTransfer] = useState(false);
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

  const teamFull = activeTeam.length >= MAX_ACTIVE_TEAM;

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
            {/* Equipo activo */}
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
                      menuBelow={index < TEAM_COLS}
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

            {/* Laboratorio header */}
            {box.length > 0 && (
              <YStack gap="$2">
                <XStack justify="space-between" items="center">
                  <Text style={styles.sectionTitle}>🧪 Laboratorio Pokémon</Text>
                  <Text style={styles.sectionCount}>{box.length} pokémon</Text>
                </XStack>
                <Pressable
                  style={styles.transferBtn}
                  onPress={() => setShowTransfer(true)}
                  accessibilityRole="button"
                  accessibilityLabel="Abrir Máquina de Transferencias"
                >
                  <Text style={styles.transferBtnText}>⚡ Máquina de Transferencias</Text>
                </Pressable>
                <Text style={styles.boxHint}>
                  {teamFull
                    ? 'Equipo completo. Usa la Máquina de Transferencias para intercambiar.'
                    : 'Usa la Máquina de Transferencias para mover pokémon al equipo.'}
                </Text>
              </YStack>
            )}
          </YStack>
        }
        renderItem={({ item }) => (
          <LabCard
            pokemon={item}
            teamFull={teamFull}
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

      <TransferMachineModal
        visible={showTransfer}
        labPokemon={box}
        activeTeam={activeTeam}
        onMoveToTeam={(labId) => {
          moveToTeam(labId);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }}
        onSwap={(labId, teamMemberId) => {
          swapPokemon(labId, teamMemberId);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }}
        onClose={() => setShowTransfer(false)}
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
  slotMenuAbove: {
    bottom: '100%',
    marginBottom: 4,
  },
  slotMenuBelow: {
    top: '100%',
    marginTop: 4,
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  sectionCount: {
    fontSize: 13,
    color: '#999',
  },
  transferBtn: {
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  transferBtnText: {
    color: '#FFD700',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  boxHint: {
    fontSize: 12,
    color: '#aaa',
    fontStyle: 'italic',
  },
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
  boxReleaseBtn: {
    paddingVertical: 2,
    paddingHorizontal: 6,
  },
  boxReleaseBtnText: {
    fontSize: 12,
  },
});
