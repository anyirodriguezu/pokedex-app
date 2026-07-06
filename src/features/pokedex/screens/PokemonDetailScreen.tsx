import { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ErrorState } from '../../../components/ui/ErrorState';
import { PokeballIcon } from '../../../components/ui/PokeballIcon';
import { ReleaseModal } from '../../../components/ui/ReleaseModal';
import { Colors } from '../../../constants/colors';
import { PokedexStackParamList } from '../../../navigation/types';
import { useTrainerStore } from '../../../store/trainerStore';
import { capitalize, getTypeColor, getTextColor } from '../../../utils/pokemonHelpers';
import { Card, Text, XStack, YStack } from 'tamagui';
import { CapturedAura } from '../components/CapturedAura';
import { CaptureEffect } from '../components/CaptureEffect';
import { PokemonEvolutionChain } from '../components/PokemonEvolutionChain';
import { PokemonDetailSkeleton } from '../components/PokemonDetailSkeleton';
import { PokemonStats } from '../components/PokemonStats';
import { ReleaseEffect } from '../components/ReleaseEffect';
import { useEvolutionChain } from '../hooks/useEvolutionChain';
import { usePokemonDetail } from '../hooks/usePokemonDetail';
import { usePokemonSpecies } from '../hooks/usePokemonSpecies';
import { MAX_ACTIVE_TEAM } from '../../trainer/types/trainer.types';

type Props = NativeStackScreenProps<PokedexStackParamList, 'PokemonDetail'>;

interface SpriteOption { uri: string; label: string }

// ── Helpers ────────────────────────────────────────────────────────────────

function getFlavorText(
  entries: { flavor_text: string; language: { name: string } }[]
): string {
  const pick = entries.find((e) => e.language.name === 'es') ??
               entries.find((e) => e.language.name === 'en');
  return (pick?.flavor_text ?? '').replace(/[\f\n\r]/g, ' ').replace(/\s+/g, ' ').trim();
}

function getGenus(genera: { genus: string; language: { name: string } }[]): string {
  return genera.find((g) => g.language.name === 'es')?.genus ??
         genera.find((g) => g.language.name === 'en')?.genus ?? '';
}

function formatGeneration(name: string): string {
  return `Gen ${name.split('-')[1]?.toUpperCase() ?? ''}`;
}

function formatGenderRate(rate: number) {
  if (rate === -1) return { label: 'Asexuado', male: null, female: null };
  const female = (rate / 8) * 100;
  const male = 100 - female;
  return { label: `♂ ${male.toFixed(0)}%  ♀ ${female.toFixed(0)}%`, male, female };
}

function formatCaptureRate(rate: number) {
  if (rate >= 200) return { label: 'Muy fácil', color: '#22C55E' };
  if (rate >= 100) return { label: 'Fácil',     color: '#4ADE80' };
  if (rate >= 45)  return { label: 'Normal',     color: '#F59E0B' };
  if (rate >= 10)  return { label: 'Difícil',    color: '#F97316' };
  return                  { label: 'Muy difícil',color: '#EF4444' };
}

const EGG_GROUP_ES: Record<string, string> = {
  monster: 'Monstruo',   water1: 'Agua 1',     water2: 'Agua 2',   water3: 'Agua 3',
  bug: 'Bicho',          flying: 'Volador',     field: 'Terrestre', fairy: 'Hada',
  grass: 'Planta',       'human-like': 'Humanoide', mineral: 'Mineral',
  amorphous: 'Amorfo',   ditto: 'Ditto',        dragon: 'Dragón',   'no-eggs': 'Sin grupo',
};

const GROWTH_RATE_ES: Record<string, string> = {
  slow: 'Lento',           medium: 'Medio',        fast: 'Rápido',
  'medium-slow': 'Medio-Lento', 'slow-then-very-fast': 'Fluctuante',
  'fast-then-very-slow': 'Errático',
};

// ── Subcomponentes ────────────────────────────────────────────────────────

const Divider: React.FC = () => <View style={styles.divider} />;

const SectionTitle: React.FC<{ label: string; color?: string }> = ({ label, color = '#6366F1' }) => (
  <XStack items="center" gap="$2">
    <View style={[styles.sectionBar, { backgroundColor: color }]} />
    <Text fontSize={16} fontWeight="700" color="$appText" letterSpacing={0.3}>{label}</Text>
  </XStack>
);;

const GenderBar: React.FC<{ male: number; female: number }> = ({ male, female }) => (
  <View style={styles.genderBar}>
    <View style={[styles.genderMale, { flex: male }]} />
    <View style={[styles.genderFemale, { flex: female }]} />
  </View>
);

// ── Pantalla ───────────────────────────────────────────────────────────────

export const PokemonDetailScreen: React.FC<Props> = ({ route, navigation }) => {
  const { pokemonId } = route.params;
  const { data, isLoading, isError, refetch } = usePokemonDetail(pokemonId);
  const { data: species } = usePokemonSpecies(pokemonId);
  const { data: evoChain } = useEvolutionChain(species?.evolution_chain.url);
  const insets = useSafeAreaInsets();

  const { capture, captureToBox, release, activeTeam, isCaptured: checkCaptured } = useTrainerStore();
  const isCaptured      = checkCaptured(pokemonId);
  const isInActiveTeam  = activeTeam.some((c) => c.id === pokemonId);

  const [isCapturing,      setIsCapturing]      = useState(false);
  const [isReleasing,      setIsReleasing]      = useState(false);
  const [showReleaseModal, setShowReleaseModal] = useState(false);
  const [spriteIndex,      setSpriteIndex]      = useState(0);
  const cancelRef = useRef(false);

  const fabScale = useRef(new Animated.Value(1)).current;
  const fabSpin  = useRef(new Animated.Value(0)).current;
  const fabPrev  = useRef(isCaptured);
  const isBusy   = isCapturing || isReleasing;

  useEffect(() => {
    if (!data) return;
    const bg = getTypeColor(data.types[0]?.type.name ?? 'normal');
    navigation.setOptions({ headerStyle: { backgroundColor: bg }, headerTintColor: getTextColor(bg) });
  }, [data, navigation]);

  useEffect(() => { setSpriteIndex(0); }, [pokemonId]);

  useEffect(() => {
    if (fabPrev.current !== isCaptured) {
      fabPrev.current = isCaptured;
      Animated.sequence([
        Animated.spring(fabScale, { toValue: 1.25, useNativeDriver: true, tension: 200, friction: 5 }),
        Animated.spring(fabScale, { toValue: 1, useNativeDriver: true, tension: 150, friction: 8 }),
      ]).start();
    }
  }, [isCaptured, fabScale]);

  useEffect(() => {
    if (isBusy) {
      fabSpin.setValue(0);
      Animated.loop(
        Animated.timing(fabSpin, { toValue: 1, duration: 700, useNativeDriver: true })
      ).start();
    } else {
      fabSpin.stopAnimation();
      fabSpin.setValue(0);
    }
  }, [isBusy, fabSpin]);

  if (isLoading) return <PokemonDetailSkeleton />;
  if (isError || !data) {
    return <ErrorState message="No se pudo cargar el detalle del Pokémon" onRetry={() => refetch()} />;
  }

  // ── Sprites ───────────────────────────────────────────────────────────────
  const artwork = data.sprites.other['official-artwork'].front_default;
  const artworkShiny = data.sprites.other['official-artwork'].front_shiny;

  const sprites: SpriteOption[] = [
    artwork         ? { uri: artwork,                                         label: 'Oficial'   } : null,
    artworkShiny    ? { uri: artworkShiny,                                    label: '✨ Shiny'  } : null,
    data.sprites.other?.home?.front_default
                    ? { uri: data.sprites.other.home.front_default!,          label: 'HOME'      } : null,
    data.sprites.other?.home?.front_shiny
                    ? { uri: data.sprites.other.home.front_shiny!,            label: 'HOME ✨'   } : null,
    data.sprites.other?.showdown?.front_default
                    ? { uri: data.sprites.other.showdown.front_default!,      label: '▶ Anim.'   } : null,
    data.sprites.other?.showdown?.front_shiny
                    ? { uri: data.sprites.other.showdown.front_shiny!,        label: '▶ Shiny'   } : null,
    data.sprites.front_default ? { uri: data.sprites.front_default,           label: 'Frente'    } : null,
    data.sprites.back_default  ? { uri: data.sprites.back_default,            label: 'Espalda'   } : null,
    data.sprites.front_shiny   ? { uri: data.sprites.front_shiny,             label: 'Shiny ↑'   } : null,
    data.sprites.back_shiny    ? { uri: data.sprites.back_shiny,              label: 'Shiny ↓'   } : null,
  ].filter((s): s is SpriteOption => s !== null);

  const currentSprite = sprites[spriteIndex] ?? sprites[0];
  const typeColor = getTypeColor(data.types[0]?.type.name ?? 'normal');

  // ── Species ───────────────────────────────────────────────────────────────
  const flavorText  = species ? getFlavorText(species.flavor_text_entries) : '';
  const genus       = species ? getGenus(species.genera) : '';
  const generation  = species ? formatGeneration(species.generation.name) : '';
  const genderInfo  = species ? formatGenderRate(species.gender_rate) : null;
  const captureInfo = species ? formatCaptureRate(species.capture_rate) : null;
  const eggGroups   = (species?.egg_groups ?? []).map((g) => EGG_GROUP_ES[g.name] ?? capitalize(g.name));
  const growthRate  = species ? (GROWTH_RATE_ES[species.growth_rate.name] ?? capitalize(species.growth_rate.name)) : '';

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleCaptureToggle = () => {
    if (isCaptured) { setShowReleaseModal(true); }
    else if (currentSprite && !isCapturing) { setIsCapturing(true); }
  };

  const handleCaptureComplete = () => {
    if (!artwork) return;
    const pokemon = { id: data.id, name: capitalize(data.name), sprite: artwork };
    if (activeTeam.length >= MAX_ACTIVE_TEAM) {
      captureToBox(pokemon);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } else {
      capture(pokemon);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    setIsCapturing(false);
  };

  const handleReleaseComplete = () => {
    if (cancelRef.current) { cancelRef.current = false; }
    else { release(pokemonId); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); }
    setIsReleasing(false);
  };

  const fabBg    = isCaptured ? '#EF4444' : typeColor;
  const fabLabel = isBusy
    ? (isCapturing ? 'Capturando...' : 'Liberando...')
    : (isCaptured ? 'Liberar' : 'Capturar');
  const spinDeg  = fabSpin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  return (
    <View style={styles.wrapper}>
      <CapturedAura visible={isCaptured} isInTeam={isInActiveTeam} />

      <ScrollView
        style={styles.container}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 96 }]}
      >

        {/* ── Cabecera: número, nombre, categoría, tipos, badges ──────── */}
        <YStack items="center" gap="$2">
          <XStack gap="$2" items="center">
            <Text fontSize={16} color="$textSecondary" fontWeight="500">
              #{String(data.id).padStart(3, '0')}
            </Text>
            {generation ? (
              <YStack px="$2" py="$0.5" rounded={12} style={{ backgroundColor: '#334155' }}>
                <Text fontSize={11} fontWeight="700" color="$textLight">{generation}</Text>
              </YStack>
            ) : null}
          </XStack>

          <Text fontSize={32} fontWeight="800" color="$appText">{capitalize(data.name)}</Text>

          {genus ? (
            <Text fontSize={14} color="$textSecondary" style={{ fontStyle: 'italic' }}>{genus}</Text>
          ) : null}

          <XStack gap="$2" flexWrap="wrap" justify="center">
            {data.types.map((t) => (
              <YStack key={t.type.name} px="$4" py="$1.5" rounded={20}
                style={{ backgroundColor: getTypeColor(t.type.name) }}>
                <Text color="$textLight" fontWeight="600" fontSize={14}>{capitalize(t.type.name)}</Text>
              </YStack>
            ))}
          </XStack>

          <XStack gap="$2" flexWrap="wrap" justify="center">
            {species?.is_legendary && (
              <YStack px="$3" py="$1" rounded={20} style={{ backgroundColor: '#F59E0B' }}>
                <Text fontSize={12} fontWeight="700" color="$textLight">⭐ Legendario</Text>
              </YStack>
            )}
            {species?.is_mythical && (
              <YStack px="$3" py="$1" rounded={20} style={{ backgroundColor: '#8B5CF6' }}>
                <Text fontSize={12} fontWeight="700" color="$textLight">✨ Mítico</Text>
              </YStack>
            )}
            {species?.is_baby && (
              <YStack px="$3" py="$1" rounded={20} style={{ backgroundColor: '#EC4899' }}>
                <Text fontSize={12} fontWeight="700" color="$textLight">🍼 Bebé</Text>
              </YStack>
            )}
            {isCaptured && (
              <YStack px="$3" py="$1" rounded={20}
                style={{ backgroundColor: isInActiveTeam ? '#22C55E' : '#6366F1' }}>
                <Text fontSize={12} fontWeight="700" color="$textLight">
                  {isInActiveTeam ? '⚡ En tu equipo' : '🧪 En el Laboratorio'}
                </Text>
              </YStack>
            )}
          </XStack>
        </YStack>

        {/* ── Descripción Pokédex ─────────────────────────────────────── */}
        {flavorText ? (
          <Card bg="$surface" rounded={16} p="$4" elevation={2}>
            <Text fontSize={14} color="$appText" lineHeight={22} style={{ fontStyle: 'italic' }}>
              {flavorText}
            </Text>
          </Card>
        ) : null}

        {/* ── Galería de sprites ──────────────────────────────────────── */}
        {currentSprite && (
          <Card bg="$surface" rounded={20} p="$4" elevation={2} items="center" gap="$3">
            <Image source={{ uri: currentSprite.uri }} style={styles.image}
              resizeMode="contain" accessibilityLabel={`Sprite: ${currentSprite.label}`} />

            {sprites.length > 1 && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.spriteThumbnailRow}>
                {sprites.map((sprite, index) => {
                  const isSelected = index === spriteIndex;
                  return (
                    <Pressable key={sprite.label + index}
                      style={[styles.spriteThumbnail, isSelected && { borderColor: typeColor }]}
                      onPress={() => setSpriteIndex(index)}
                      accessibilityRole="button" accessibilityLabel={sprite.label}
                      accessibilityState={{ selected: isSelected }}>
                      <Image source={{ uri: sprite.uri }} style={styles.thumbnailImg} resizeMode="contain" />
                      <Text style={[styles.thumbnailLabel, isSelected && { color: typeColor }]}>
                        {sprite.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            )}
          </Card>
        )}

        {/* ── Cadena de evolución ─────────────────────────────────────── */}
        {evoChain && (
          <PokemonEvolutionChain
            chain={evoChain.chain}
            currentId={pokemonId}
            onPress={(id, name) =>
              navigation.push('PokemonDetail', { pokemonId: id, pokemonName: name })
            }
          />
        )}

        {/* ── Datos físicos + género + captura + felicidad ─────────────── */}
        <Card bg="$surface" rounded={16} p="$4" elevation={2} gap="$3">
          <SectionTitle label="Datos físicos" color={typeColor} />

          <XStack justify="space-around" items="center">
            <YStack items="center" gap="$1">
              <Text fontSize={13} color="$textSecondary">Altura</Text>
              <Text fontSize={18} fontWeight="700" color="$appText">
                {(data.height / 10).toFixed(1)} m
              </Text>
            </YStack>
            <YStack width={1} bg="$appBorder" self="stretch" />
            <YStack items="center" gap="$1">
              <Text fontSize={13} color="$textSecondary">Peso</Text>
              <Text fontSize={18} fontWeight="700" color="$appText">
                {(data.weight / 10).toFixed(1)} kg
              </Text>
            </YStack>
            {data.base_experience !== null && (
              <>
                <YStack width={1} bg="$appBorder" self="stretch" />
                <YStack items="center" gap="$1">
                  <Text fontSize={13} color="$textSecondary">Exp. base</Text>
                  <Text fontSize={18} fontWeight="700" color="$appText">{data.base_experience}</Text>
                </YStack>
              </>
            )}
          </XStack>

          {genderInfo && (
            <>
              <Divider />
              <YStack gap="$1.5">
                <Text fontSize={13} color="$textSecondary">Género</Text>
                {genderInfo.male !== null && genderInfo.female !== null ? (
                  <YStack gap="$1">
                    <GenderBar male={genderInfo.male} female={genderInfo.female} />
                    <Text fontSize={12} color="$textSecondary" style={{ textAlign: 'center' }}>
                      {genderInfo.label}
                    </Text>
                  </YStack>
                ) : (
                  <Text fontSize={14} fontWeight="600" color="$appText">{genderInfo.label}</Text>
                )}
              </YStack>
            </>
          )}

          {captureInfo && species && (
            <>
              <Divider />
              <XStack justify="space-between" items="center">
                <YStack gap="$0.5">
                  <Text fontSize={13} color="$textSecondary">Tasa de captura</Text>
                  <Text fontSize={14} fontWeight="700" color="$appText">
                    {species.capture_rate}
                    <Text fontSize={12} color="$textSecondary"> / 255</Text>
                  </Text>
                </YStack>
                <YStack px="$3" py="$1.5" rounded={20} style={{
                  backgroundColor: captureInfo.color + '22',
                  borderWidth: 1, borderColor: captureInfo.color,
                }}>
                  <Text fontSize={12} fontWeight="700" style={{ color: captureInfo.color }}>
                    {captureInfo.label}
                  </Text>
                </YStack>
              </XStack>
            </>
          )}

          {species?.base_happiness != null && (
            <>
              <Divider />
              <XStack justify="space-between" items="center">
                <Text fontSize={13} color="$textSecondary">Felicidad base</Text>
                <Text fontSize={14} fontWeight="700" color="$appText">
                  {species.base_happiness}
                  <Text fontSize={12} color="$textSecondary"> / 255</Text>
                </Text>
              </XStack>
            </>
          )}
        </Card>

        {/* ── Habilidades ─────────────────────────────────────────────── */}
        {data.abilities.length > 0 && (
          <Card bg="$surface" rounded={16} p="$4" elevation={2} gap="$3">
            <SectionTitle label="Habilidades" color={typeColor} />
            <XStack flexWrap="wrap" gap="$2">
              {data.abilities.map((a) => (
                <YStack key={a.ability.name} px="$3" py="$1.5" rounded={20} gap="$0.5"
                  items="center" style={{ backgroundColor: a.is_hidden ? '#7C3AED' : typeColor }}>
                  <Text fontSize={13} fontWeight="600" color="$textLight">
                    {capitalize(a.ability.name.replace(/-/g, ' '))}
                  </Text>
                  {a.is_hidden && (
                    <Text fontSize={10} color="$textLight" style={{ opacity: 0.85 }}>
                      Habilidad Oculta
                    </Text>
                  )}
                </YStack>
              ))}
            </XStack>
          </Card>
        )}

        {/* ── Crianza ─────────────────────────────────────────────────── */}
        {species && (eggGroups.length > 0 || growthRate) && (
          <Card bg="$surface" rounded={16} p="$4" elevation={2} gap="$3">
            <SectionTitle label="Crianza" color={typeColor} />

            {eggGroups.length > 0 && (
              <XStack justify="space-between" items="flex-start">
                <Text fontSize={13} color="$textSecondary">Grupos huevo</Text>
                <XStack gap="$1.5" flexWrap="wrap" justify="flex-end" style={{ flex: 1, marginLeft: 8 }}>
                  {eggGroups.map((g) => (
                    <YStack key={g} px="$2" py="$0.5" rounded={10}
                      style={{ backgroundColor: '#F0F4FF', borderWidth: 1, borderColor: '#C7D2FE' }}>
                      <Text fontSize={12} fontWeight="600" style={{ color: '#4338CA' }}>{g}</Text>
                    </YStack>
                  ))}
                </XStack>
              </XStack>
            )}

            {growthRate ? (
              <>
                {eggGroups.length > 0 && <Divider />}
                <XStack justify="space-between" items="center">
                  <Text fontSize={13} color="$textSecondary">Tasa de crecimiento</Text>
                  <Text fontSize={14} fontWeight="700" color="$appText">{growthRate}</Text>
                </XStack>
              </>
            ) : null}
          </Card>
        )}

        {/* ── Estadísticas ─────────────────────────────────────────────── */}
        <PokemonStats stats={data.stats} />

      </ScrollView>

      {/* ── FAB Capturar / Liberar ─────────────────────────────────── */}
      <Animated.View
        style={[
          styles.fab,
          { bottom: insets.bottom + 24, transform: [{ scale: fabScale }] },
        ]}
        pointerEvents="box-none"
      >
        <Pressable
          style={[styles.fabInner, { backgroundColor: fabBg }, isBusy && styles.fabDisabled]}
          onPress={handleCaptureToggle}
          disabled={isBusy}
          accessibilityRole="button"
          accessibilityLabel={fabLabel}
        >
          <Animated.View style={isBusy ? { transform: [{ rotate: spinDeg }] } : undefined}>
            <PokeballIcon size={22} open={isCaptured && !isBusy} />
          </Animated.View>
          <Text style={styles.fabLabel}>{fabLabel}</Text>
        </Pressable>
      </Animated.View>

      <CaptureEffect visible={isCapturing} onComplete={handleCaptureComplete} />
      <ReleaseEffect visible={isReleasing} onComplete={handleReleaseComplete} />

      <ReleaseModal
        visible={showReleaseModal}
        pokemonName={capitalize(data.name)}
        context="detail"
        onConfirm={() => { setShowReleaseModal(false); setIsReleasing(true); }}
        onCancel={() => setShowReleaseModal(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper:    { flex: 1, backgroundColor: Colors.background },
  container:  { flex: 1, backgroundColor: 'transparent' },
  content:    { padding: 16, gap: 16 },
  fab: {
    position: 'absolute',
    right: 20,
    zIndex: 99,
  },
  fabInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 22,
    borderRadius: 32,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  fabDisabled: {
    opacity: 0.6,
  },
  fabLabel: {
    fontSize: 16,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.3,
  },
  image:      { width: 220, height: 220 },
  spriteThumbnailRow: { gap: 8, paddingHorizontal: 4 },
  spriteThumbnail: {
    alignItems: 'center', gap: 2, padding: 6,
    borderRadius: 12, borderWidth: 2, borderColor: 'transparent', backgroundColor: '#f5f5f5',
  },
  thumbnailImg:   { width: 52, height: 52 },
  thumbnailLabel: { fontSize: 10, fontWeight: '600', color: '#888', textAlign: 'center' },
  divider:        { height: 1, backgroundColor: '#f0f0f0', marginVertical: 2 },
  sectionBar:     { width: 4, height: 18, borderRadius: 2 },
  genderBar:      { flexDirection: 'row', height: 10, borderRadius: 5, overflow: 'hidden' },
  genderMale:     { backgroundColor: '#60A5FA' },
  genderFemale:   { backgroundColor: '#F472B6' },
});
