import { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useRef, useState } from 'react';
import { Image, ScrollView, StyleSheet, View } from 'react-native';
import { Button } from '../../../components/ui/Button';
import { ErrorState } from '../../../components/ui/ErrorState';
import { ReleaseModal } from '../../../components/ui/ReleaseModal';
import { TeamFullModal } from '../../../components/ui/TeamFullModal';
import { Colors } from '../../../constants/colors';
import { PokedexStackParamList } from '../../../navigation/types';
import { useTrainerStore } from '../../../store/trainerStore';
import { capitalize, getTypeColor, getTextColor } from '../../../utils/pokemonHelpers';
import { Card, Text, XStack, YStack } from 'tamagui';
import { CapturedAura } from '../components/CapturedAura';
import { CaptureEffect } from '../components/CaptureEffect';
import { ReleaseEffect } from '../components/ReleaseEffect';
import { PokemonDetailSkeleton } from '../components/PokemonDetailSkeleton';
import { PokemonStats } from '../components/PokemonStats';
import { usePokemonDetail } from '../hooks/usePokemonDetail';
import { MAX_ACTIVE_TEAM } from '../../../features/trainer/types/trainer.types';

type Props = NativeStackScreenProps<PokedexStackParamList, 'PokemonDetail'>;

export const PokemonDetailScreen: React.FC<Props> = ({ route, navigation }) => {
  const { pokemonId } = route.params;
  const { data, isLoading, isError, refetch } = usePokemonDetail(pokemonId);
  const { capture, captureToBox, release, swapPokemon, activeTeam, box, isCaptured: checkCaptured } =
    useTrainerStore();

  const isCaptured = checkCaptured(pokemonId);
  const isInActiveTeam = activeTeam.some((c) => c.id === pokemonId);

  const [isCapturing, setIsCapturing] = useState(false);
  const [isReleasing, setIsReleasing] = useState(false);
  const [showReleaseModal, setShowReleaseModal] = useState(false);
  const [showTeamFullModal, setShowTeamFullModal] = useState(false);
  const [pendingPokemon, setPendingPokemon] = useState<{
    id: number; name: string; sprite: string;
  } | null>(null);
  const cancellingCaptureRef = useRef(false);

  useEffect(() => {
    if (!data) return;
    const primaryType = data.types[0]?.type.name ?? 'normal';
    const bgColor = getTypeColor(primaryType);
    navigation.setOptions({
      headerStyle: { backgroundColor: bgColor },
      headerTintColor: getTextColor(bgColor),
    });
  }, [data, navigation]);

  if (isLoading) {
    return <PokemonDetailSkeleton />;
  }

  if (isError || !data) {
    return (
      <ErrorState
        message="No se pudo cargar el detalle del Pokémon"
        onRetry={() => refetch()}
      />
    );
  }

  const imageUrl = data.sprites.other['official-artwork'].front_default;

  const handleCaptureToggle = () => {
    if (isCaptured) {
      setShowReleaseModal(true);
    } else if (imageUrl && !isCapturing) {
      setIsCapturing(true);
    }
  };

  const handleConfirmRelease = () => {
    setShowReleaseModal(false);
    setIsReleasing(true);
  };

  const handleReleaseComplete = () => {
    if (cancellingCaptureRef.current) {
      cancellingCaptureRef.current = false;
    } else {
      release(pokemonId);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    setIsReleasing(false);
  };

  const handleCaptureComplete = () => {
    if (!imageUrl) return;
    const pokemon = { id: data.id, name: capitalize(data.name), sprite: imageUrl };

    if (activeTeam.length >= MAX_ACTIVE_TEAM) {
      setPendingPokemon(pokemon);
      setIsCapturing(false);
      setShowTeamFullModal(true);
    } else {
      capture(pokemon);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setIsCapturing(false);
    }
  };

  const handleSendToBox = () => {
    if (!pendingPokemon) return;
    captureToBox(pendingPokemon);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPendingPokemon(null);
    setShowTeamFullModal(false);
  };

  const handleSwapWithTeam = (teamMemberId: number) => {
    if (!pendingPokemon) return;
    captureToBox(pendingPokemon);
    swapPokemon(pendingPokemon.id, teamMemberId);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setPendingPokemon(null);
    setShowTeamFullModal(false);
  };

  const captureLabel = isCaptured
    ? isInActiveTeam
      ? '🔓 Liberar (Equipo)'
      : '🔓 Liberar (Caja)'
    : '🎯 Capturar';

  return (
    <View style={styles.wrapper}>
      <CapturedAura visible={isCaptured} isInTeam={isInActiveTeam} />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <YStack items="center" gap="$2">
          <Text fontSize={16} color="$textSecondary" fontWeight="500">
            #{String(data.id).padStart(3, '0')}
          </Text>
          <Text fontSize={32} fontWeight="800" color="$appText">
            {capitalize(data.name)}
          </Text>
          <XStack gap="$2" flexWrap="wrap" justify="center">
            {data.types.map((t) => (
              <YStack
                key={t.type.name}
                px="$4"
                py="$1.5"
                rounded={20}
                style={{ backgroundColor: getTypeColor(t.type.name) }}
              >
                <Text color="$textLight" fontWeight="600" fontSize={14}>
                  {capitalize(t.type.name)}
                </Text>
              </YStack>
            ))}
          </XStack>
          {isCaptured && (
            <YStack
              px="$3"
              py="$1"
              rounded={20}
              style={{ backgroundColor: isInActiveTeam ? '#22C55E' : '#6366F1' }}
            >
              <Text fontSize={12} fontWeight="700" color="$textLight">
                {isInActiveTeam ? '⚡ En tu equipo' : '📦 En tu Caja PC'}
              </Text>
            </YStack>
          )}
        </YStack>

        {imageUrl && (
          <Card bg="$surface" rounded={20} p="$4" elevation={2} items="center">
            <Image
              source={{ uri: imageUrl }}
              style={styles.image}
              resizeMode="contain"
            />
          </Card>
        )}

        <Button
          label={captureLabel}
          variant={isCaptured ? 'muted' : 'primary'}
          onPress={handleCaptureToggle}
          loading={isCapturing}
        />

        <Card bg="$surface" rounded={16} p="$4" elevation={2}>
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
          </XStack>
        </Card>

        <PokemonStats stats={data.stats} />
      </ScrollView>

      <CaptureEffect visible={isCapturing} onComplete={handleCaptureComplete} />
      <ReleaseEffect visible={isReleasing} onComplete={handleReleaseComplete} />

      <ReleaseModal
        visible={showReleaseModal}
        pokemonName={capitalize(data.name)}
        context="detail"
        onConfirm={handleConfirmRelease}
        onCancel={() => setShowReleaseModal(false)}
      />

      <TeamFullModal
        visible={showTeamFullModal}
        newPokemon={pendingPokemon}
        activeTeam={activeTeam}
        onSendToBox={handleSendToBox}
        onSwap={handleSwapWithTeam}
        onCancel={() => {
          setPendingPokemon(null);
          setShowTeamFullModal(false);
          cancellingCaptureRef.current = true;
          setIsReleasing(true);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  content: {
    padding: 16,
    gap: 16,
    paddingBottom: 32,
  },
  image: {
    width: 220,
    height: 220,
  },
});
