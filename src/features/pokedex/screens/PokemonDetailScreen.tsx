import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { Image, ScrollView, StyleSheet } from 'react-native';
import { ErrorState } from '../../../components/ui/ErrorState';
import { PokedexStackParamList } from '../../../navigation/types';
import { capitalize, getTypeColor } from '../../../utils/pokemonHelpers';
import { Colors } from '../../../constants/colors';
import { Card, Text, XStack, YStack } from 'tamagui';
import { LoadingState } from '../components/LoadingState';
import { PokemonStats } from '../components/PokemonStats';
import { usePokemonDetail } from '../hooks/usePokemonDetail';

type Props = NativeStackScreenProps<PokedexStackParamList, 'PokemonDetail'>;

export const PokemonDetailScreen: React.FC<Props> = ({ route }) => {
  const { pokemonId } = route.params;
  const { data, isLoading, isError, refetch } = usePokemonDetail(pokemonId);

  if (isLoading) {
    return <LoadingState message="Cargando detalle..." />;
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

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
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
              bg={getTypeColor(t.type.name) as any}
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
  );
};

const styles = StyleSheet.create({
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
