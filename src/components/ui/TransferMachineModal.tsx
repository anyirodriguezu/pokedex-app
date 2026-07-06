import * as Haptics from 'expo-haptics';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  FlatList,
  Image,
  Modal,
  PanResponder,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from 'tamagui';
import { CapturedPokemon, MAX_ACTIVE_TEAM } from '../../features/trainer/types/trainer.types';

interface Props {
  visible: boolean;
  labPokemon: CapturedPokemon[];
  activeTeam: CapturedPokemon[];
  onMoveToTeam: (labId: number) => void;
  onSwap: (labId: number, teamMemberId: number) => void;
  onClose: () => void;
}

export const TransferMachineModal: React.FC<Props> = ({
  visible,
  labPokemon,
  activeTeam,
  onMoveToTeam,
  onSwap,
  onClose,
}) => {
  const insets = useSafeAreaInsets();
  const [selectedLabId, setSelectedLabId] = useState<number | null>(null);
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);
  const [transferred, setTransferred] = useState(false);

  const translateY = useRef(new Animated.Value(600)).current;
  // Refs estables para usar dentro del PanResponder sin stale closures
  const onCloseRef = useRef(onClose);
  useEffect(() => { onCloseRef.current = onClose; }, [onClose]);

  useEffect(() => {
    if (visible) {
      translateY.setValue(600);
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        tension: 70,
        friction: 14,
      }).start();
    }
  }, [visible, translateY]);

  const closeSheet = () => {
    Animated.timing(translateY, { toValue: 700, duration: 240, useNativeDriver: true }).start(() => {
      setSelectedLabId(null);
      setSelectedTeamId(null);
      setTransferred(false);
      onCloseRef.current();
      translateY.setValue(600);
    });
  };

  // El PanResponder vive en un View de absoluteFill detrás de todo el contenido.
  // Con onStartShouldSetPanResponder:true, reclama cualquier toque que llegue a él
  // (es decir, toques en áreas sin elementos interactivos que "caen" hacia abajo).
  // Los Pressable y FlatList están en una capa encima y capturan sus propios toques.
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, { dy }) => {
        if (dy > 0) translateY.setValue(dy);
      },
      onPanResponderRelease: (_, { dy, vy }) => {
        if (dy > 100 || vy > 0.5) {
          closeSheet();
        } else {
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
            tension: 80,
            friction: 12,
          }).start();
        }
      },
    })
  ).current;

  const teamFull = activeTeam.length >= MAX_ACTIVE_TEAM;

  const doTransfer = (labId: number, teamMember: CapturedPokemon | null) => {
    if (teamMember === null) {
      onMoveToTeam(labId);
    } else {
      onSwap(labId, teamMember.id);
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setTransferred(true);
    setSelectedLabId(null);
    setSelectedTeamId(null);
  };

  const handleLabSelect = (id: number) => {
    if (selectedTeamId !== null) {
      const teamMember = activeTeam.find((p) => p.id === selectedTeamId) ?? null;
      doTransfer(id, teamMember);
      return;
    }
    setSelectedLabId((prev) => (prev === id ? null : id));
    setTransferred(false);
    Haptics.selectionAsync();
  };

  const handleTeamSlotPress = (teamMember: CapturedPokemon | null, slotIndex: number) => {
    if (selectedLabId !== null) {
      doTransfer(selectedLabId, teamMember);
      return;
    }
    if (teamMember !== null) {
      setSelectedTeamId((prev) => (prev === teamMember.id ? null : teamMember.id));
      setTransferred(false);
      Haptics.selectionAsync();
    }
  };

  const slots = Array.from({ length: MAX_ACTIVE_TEAM }, (_, i) => ({
    index: i,
    pokemon: activeTeam[i] ?? null,
  }));

  const instructionText = () => {
    if (transferred) return '✅ ¡Transferencia completada!';
    if (selectedTeamId && !selectedLabId) return 'Ahora selecciona un Pokémon del Laboratorio';
    if (selectedLabId && !selectedTeamId)
      return teamFull
        ? 'Equipo completo. Toca un miembro para intercambiar'
        : 'Toca un slot vacío o un miembro del equipo para intercambiar';
    return 'Selecciona un Pokémon del Laboratorio o del Equipo';
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={closeSheet}
    >
      <View style={styles.overlay}>
        <Animated.View
          style={[styles.sheet, { transform: [{ translateY }], paddingBottom: insets.bottom + 16 }]}
        >
          <View style={StyleSheet.absoluteFillObject} {...panResponder.panHandlers} />

          <View style={styles.contentLayer} pointerEvents="box-none">

            <View style={styles.dragZone}>
              <View style={styles.handle} />
              <Text style={styles.title}>⚡ Máquina de Transferencias</Text>
              <Text style={styles.subtitle}>Laboratorio ↔ Equipo Activo</Text>
            </View>

            <View style={[styles.instructionBox, transferred && styles.instructionSuccess]}>
              <Text style={styles.instructionText}>{instructionText()}</Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🧪 Laboratorio Pokémon ({labPokemon.length})</Text>
              {labPokemon.length === 0 ? (
                <Text style={styles.emptyHint}>El laboratorio está vacío</Text>
              ) : (
                <FlatList
                  data={labPokemon}
                  keyExtractor={(item) => String(item.id)}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.labList}
                  renderItem={({ item }) => {
                    const isSelected = selectedLabId === item.id;
                    const isTarget = selectedTeamId !== null;
                    return (
                      <Pressable
                        style={[
                          styles.labCard,
                          isSelected && styles.labCardSelected,
                          isTarget && !isSelected && styles.labCardTarget,
                        ]}
                        onPress={() => handleLabSelect(item.id)}
                        accessibilityRole="button"
                        accessibilityLabel={`Seleccionar ${item.name}`}
                        accessibilityState={{ selected: isSelected }}
                      >
                        <Image source={{ uri: item.sprite }} style={styles.labSprite} resizeMode="contain" />
                        <Text style={[styles.labName, isSelected && styles.labNameSelected]} numberOfLines={1}>
                          {item.name}
                        </Text>
                        {isSelected && <Text style={styles.selectedBadge}>✓</Text>}
                        {isTarget && !isSelected && <Text style={styles.targetBadge}>⬆</Text>}
                      </Pressable>
                    );
                  }}
                />
              )}
            </View>

            <View style={styles.machineDivider}>
              <View style={styles.machineLine} />
              <View style={styles.machineIcon}>
                <Text style={styles.machineArrow}>⬆</Text>
                <Text style={styles.machineLabel}>TRANSFERIR</Text>
                <Text style={styles.machineArrow}>⬆</Text>
              </View>
              <View style={styles.machineLine} />
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                Equipo Activo ({activeTeam.length}/{MAX_ACTIVE_TEAM})
              </Text>
              <View style={styles.teamGrid}>
                {slots.map(({ index, pokemon }) => {
                  const isLabPending = selectedLabId !== null;
                  const isTeamSelected = pokemon && selectedTeamId === pokemon.id;
                  return pokemon ? (
                    <Pressable
                      key={pokemon.id}
                      style={[
                        styles.teamSlot,
                        isLabPending && styles.teamSlotTarget,
                        isTeamSelected && styles.teamSlotSelected,
                      ]}
                      onPress={() => handleTeamSlotPress(pokemon, index)}
                      accessibilityRole="button"
                      accessibilityLabel={`${isLabPending ? 'Intercambiar con' : 'Seleccionar'} ${pokemon.name}`}
                    >
                      <Image source={{ uri: pokemon.sprite }} style={styles.teamSprite} resizeMode="contain" />
                      <Text style={styles.teamName} numberOfLines={1}>{pokemon.name}</Text>
                      {isLabPending && <Text style={styles.swapHint}>⇄</Text>}
                      {isTeamSelected && <Text style={styles.selectedBadge}>✓</Text>}
                    </Pressable>
                  ) : (
                    <Pressable
                      key={`empty-${index}`}
                      style={[styles.teamSlot, styles.teamSlotEmpty, isLabPending && styles.teamSlotEmptyTarget]}
                      onPress={() => handleTeamSlotPress(null, index)}
                      accessibilityRole="button"
                      accessibilityLabel={`Slot vacío ${index + 1}`}
                    >
                      <View style={styles.emptyBall} />
                      <Text style={styles.emptyLabel}>Vacío</Text>
                      {isLabPending && <Text style={styles.addHint}>+</Text>}
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <Pressable style={styles.closeBtn} onPress={closeSheet} accessibilityRole="button">
              <Text style={styles.closeBtnText}>Cerrar</Text>
            </Pressable>

          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '92%',
  },
  contentLayer: {
    gap: 0,
  },
  dragZone: {
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 8,
    paddingHorizontal: 24,
    gap: 2,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#ddd',
    marginBottom: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1a1a1a',
  },
  subtitle: {
    fontSize: 13,
    color: '#888',
  },
  instructionBox: {
    marginHorizontal: 16,
    marginBottom: 4,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: '#f0f4ff',
    borderWidth: 1,
    borderColor: '#dde4ff',
  },
  instructionSuccess: {
    backgroundColor: '#f0fdf4',
    borderColor: '#bbf7d0',
  },
  instructionText: {
    fontSize: 13,
    color: '#444',
    textAlign: 'center',
    fontWeight: '500',
  },
  section: {
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#555',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  emptyHint: {
    fontSize: 13,
    color: '#bbb',
    fontStyle: 'italic',
    paddingVertical: 8,
  },
  labList: {
    gap: 8,
    paddingVertical: 4,
  },
  labCard: {
    width: 76,
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 14,
    backgroundColor: '#f5f5f5',
    borderWidth: 2,
    borderColor: 'transparent',
    gap: 4,
    position: 'relative',
  },
  labCardSelected: {
    borderColor: '#6366F1',
    backgroundColor: '#EEF2FF',
  },
  labCardTarget: {
    borderColor: '#22C55E',
    borderStyle: 'dashed',
    backgroundColor: '#f0fdf4',
  },
  labSprite: { width: 52, height: 52 },
  labName: {
    fontSize: 10,
    fontWeight: '600',
    color: '#444',
    textAlign: 'center',
  },
  labNameSelected: { color: '#6366F1' },
  selectedBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    fontSize: 11,
    color: '#6366F1',
    fontWeight: '800',
  },
  targetBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    fontSize: 11,
    color: '#22C55E',
    fontWeight: '800',
  },
  machineDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 14,
    gap: 8,
  },
  machineLine: {
    flex: 1,
    height: 2,
    backgroundColor: '#e8e8e8',
    borderRadius: 1,
  },
  machineIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#1a1a2e',
  },
  machineArrow: { fontSize: 12, color: '#FFD700' },
  machineLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFD700',
    letterSpacing: 1,
  },
  teamGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  teamSlot: {
    width: '30%',
    aspectRatio: 1,
    borderRadius: 14,
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    paddingVertical: 6,
    elevation: 1,
  },
  teamSlotTarget: {
    borderColor: '#6366F1',
    borderStyle: 'dashed',
    backgroundColor: '#f8f7ff',
  },
  teamSlotSelected: {
    borderColor: '#22C55E',
    backgroundColor: '#f0fdf4',
    borderStyle: 'solid',
  },
  teamSlotEmpty: {
    borderStyle: 'dashed',
    borderColor: '#ddd',
    backgroundColor: '#fafafa',
  },
  teamSlotEmptyTarget: {
    borderColor: '#22C55E',
    backgroundColor: '#f0fdf4',
  },
  teamSprite: { width: 52, height: 52 },
  teamName: {
    fontSize: 9,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
    paddingHorizontal: 2,
  },
  swapHint: { fontSize: 14, color: '#6366F1', fontWeight: '800' },
  emptyBall: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#ddd',
    backgroundColor: '#f0f0f0',
  },
  emptyLabel: { fontSize: 9, color: '#bbb', fontWeight: '500' },
  addHint: {
    fontSize: 18,
    color: '#22C55E',
    fontWeight: '800',
    lineHeight: 20,
  },
  closeBtn: {
    marginHorizontal: 16,
    marginTop: 16,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  closeBtnText: {
    fontSize: 15,
    color: '#666',
    fontWeight: '600',
  },
});
