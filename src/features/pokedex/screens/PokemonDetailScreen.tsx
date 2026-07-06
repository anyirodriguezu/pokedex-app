import { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useState } from 'react';
import { ReleaseModal } from '../../../components/ui/ReleaseModal';
import { Image, ScrollView, StyleSheet, View } from 'react-native';
import { ErrorState } from '../../../components/ui/ErrorState';
import { Button } from '../../../components/ui/Button';
import { PokedexStackParamList } from '../../../navigation/types';
import { capitalize, getTypeColor, getTextColor } from '../../../utils/pokemonHelpers';
import { Colors } from '../../../constants/colors';
import { useTrainerStore } from '../../../store/trainerStore';
import { Card, Text, XStack, YStack } from 'tamagui';
import { CaptureEffect } from '../components/CaptureEffect';
import { PokemonDetailSkeleton } from '../components/PokemonDetailSkeleton';
import { PokemonStats } from '../components/PokemonStats';
import { usePokemonDetail } from '../hooks/usePokemonDetail';

type Props = NativeStackScreenProps<PokedexStackParamList, 'PokemonDetail'>;

export const PokemonDetailScreen: React.FC<Props> = ({ route, navigation }) => {
  const { pokemonId } = route.params;
  const { data, isLoading, isError, refetch } = usePokemonDetail(pokemonId);
  const { capture, release, captured } = useTrainerStore();
  const isCaptured = captured.some((c) => c.id === pokemonId);

  const [isCapturing, setIsCapturing] = useState(false);
  const [showReleaseModal, setShowReleaseModal] = useState(false);

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
    release(pokemonId);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setShowReleaseModal(false);
  };

  const handleCaptureComplete = () => {
    if (imageUrl) {
      capture({ id: data.id, name: capitalize(data.name), sprite: imageUrl });
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setIsCapturing(false);
  };

  return (
    <View style={styles.wrapper}>
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
          label={isCaptured ? '🔓 Liberar' : '🎯 Capturar'}
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

      <ReleaseModal
        visible={showReleaseModal}
        pokemonName={capitalize(data.name)}
        context="detail"
        onConfirm={handleConfirmRelease}
        onCancel={() => setShowReleaseModal(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.background,
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
