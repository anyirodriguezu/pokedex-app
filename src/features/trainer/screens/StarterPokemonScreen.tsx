import { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';
import React, { useState } from 'react';
import { Image, ScrollView, StyleSheet, View } from 'react-native';
import { Button } from '../../../components/ui/Button';
import { ErrorState } from '../../../components/ui/ErrorState';
import { Colors } from '../../../constants/colors';
import { TrainerStackParamList } from '../../../navigation/types';
import { useTrainerStore } from '../../../store/trainerStore';
import { SkeletonBlock } from '../../pokedex/components/SkeletonBlock';
import { StepIndicator } from '../components/StepIndicator';
import { useStarterPokemon } from '../hooks/useStarterPokemon';
import { TYPE_EMOJI } from '../constants/typeEmoji';
import { Card, Text, YStack } from 'tamagui';

type Props = NativeStackScreenProps<TrainerStackParamList, 'StarterPokemon'>;

const StarterSkeleton: React.FC = () => (
  <YStack flex={1} bg="$appBackground" p="$5" gap="$5">
    <StepIndicator currentStep={3} totalSteps={3} />
    <YStack gap="$1">
      <SkeletonBlock width={200} height={30} borderRadius={10} />
      <SkeletonBlock width={160} height={18} borderRadius={8} />
    </YStack>
    <View style={styles.skeletonCard}>
      <SkeletonBlock width={200} height={200} borderRadius={100} />
      <SkeletonBlock width={140} height={28} borderRadius={10} />
      <SkeletonBlock width={200} height={16} borderRadius={8} />
    </View>
    <SkeletonBlock width="100%" height={44} borderRadius={10} />
  </YStack>
);

export const StarterPokemonScreen: React.FC<Props> = ({ navigation }) => {
  const { profile, setStarterPokemon, isEditing } = useTrainerStore();
  const { data, isLoading, isError, refetch } = useStarterPokemon(
    profile?.favoritePokemonType ?? null
  );
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleAccept = () => {
    if (!data) return;
    const wasEditing = isEditing;
    setStarterPokemon(data);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    navigation.navigate('Summary', { fromEdit: wasEditing });
  };

  if (isLoading) {
    return <StarterSkeleton />;
  }

  if (isError || !data) {
    return (
      <ErrorState
        message="No se pudo asignar tu Pokémon inicial"
        onRetry={() => refetch()}
      />
    );
  }

  const typeEmoji = profile?.favoritePokemonType
    ? TYPE_EMOJI[profile.favoritePokemonType]
    : '';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <YStack gap="$5">
        <StepIndicator currentStep={3} totalSteps={3} />

        <YStack gap="$1">
          <Text fontSize={26} fontWeight="800" color="$appText">
            Tu Pokémon Inicial
          </Text>
          <Text fontSize={15} color="$textSecondary">
            {typeEmoji} Basado en tu tipo favorito
          </Text>
        </YStack>

        <Card bg="$surface" rounded={20} p="$6" elevation={4} items="center" gap="$3">
          <View style={styles.imageContainer}>
            {!imageLoaded && (
              <View style={styles.skeletonOverlay}>
                <SkeletonBlock width={200} height={200} borderRadius={100} />
              </View>
            )}
            <Image
              source={{ uri: data.sprite }}
              style={[styles.image, !imageLoaded && styles.imageHidden]}
              resizeMode="contain"
              onLoad={() => setImageLoaded(true)}
              accessibilityLabel={`Imagen de ${data.name}`}
            />
          </View>
          <Text
            fontSize={28}
            fontWeight="800"
            color="$appText"
            style={{ textAlign: 'center' }}
          >
            {data.name}
          </Text>
          <Text fontSize={14} color="$textSecondary" style={{ textAlign: 'center' }}>
            ¡Este Pokémon te acompañará en tu aventura!
          </Text>
        </Card>

        <Button label="¡Lo acepto!" onPress={handleAccept} />
      </YStack>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  imageContainer: {
    width: 200,
    height: 200,
  },
  image: {
    width: 200,
    height: 200,
  },
  imageHidden: {
    opacity: 0,
  },
  skeletonOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  skeletonCard: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    gap: 16,
    elevation: 4,
  },
});
