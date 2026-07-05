import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { Image, ScrollView, StyleSheet } from 'react-native';
import { Button } from '../../../components/ui/Button';
import { ErrorState } from '../../../components/ui/ErrorState';
import { Colors } from '../../../constants/colors';
import { TrainerStackParamList } from '../../../navigation/types';
import { useTrainerStore } from '../../../store/trainerStore';
import { LoadingState } from '../../pokedex/components/LoadingState';
import { StepIndicator } from '../components/StepIndicator';
import { useStarterPokemon } from '../hooks/useStarterPokemon';
import { TYPE_EMOJI } from '../constants/typeEmoji';
import { Card, Text, YStack } from 'tamagui';

type Props = NativeStackScreenProps<TrainerStackParamList, 'StarterPokemon'>;

export const StarterPokemonScreen: React.FC<Props> = ({ navigation }) => {
  const { profile, setStarterPokemon } = useTrainerStore();
  const { data, isLoading, isError, refetch } = useStarterPokemon(
    profile?.favoritePokemonType ?? null
  );

  const handleAccept = () => {
    if (!data) return;
    setStarterPokemon(data);
    navigation.navigate('Summary');
  };

  if (isLoading) {
    return <LoadingState message="Buscando tu Pokémon inicial..." />;
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
          <Image
            source={{ uri: data.sprite }}
            style={styles.image}
            resizeMode="contain"
            accessibilityLabel={`Imagen de ${data.name}`}
          />
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
  image: {
    width: 200,
    height: 200,
  },
});
