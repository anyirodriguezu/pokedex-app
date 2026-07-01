import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ErrorState } from '../../../components/ui/ErrorState';
import { Colors } from '../../../constants/colors';
import { PokedexStackParamList } from '../../../navigation/types';
import { capitalize, getTypeColor } from '../../../utils/pokemonHelpers';
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
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.number}>#{String(data.id).padStart(3, '0')}</Text>
        <Text style={styles.name}>{capitalize(data.name)}</Text>
        <View style={styles.typesRow}>
          {data.types.map((t) => (
            <View
              key={t.type.name}
              style={[styles.typeBadge, { backgroundColor: getTypeColor(t.type.name) }]}
            >
              <Text style={styles.typeText}>{capitalize(t.type.name)}</Text>
            </View>
          ))}
        </View>
      </View>

      {imageUrl && (
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: imageUrl }}
            style={styles.image}
            resizeMode="contain"
          />
        </View>
      )}

      <View style={styles.infoRow}>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Altura</Text>
          <Text style={styles.infoValue}>{(data.height / 10).toFixed(1)} m</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Peso</Text>
          <Text style={styles.infoValue}>{(data.weight / 10).toFixed(1)} kg</Text>
        </View>
      </View>

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
  header: {
    alignItems: 'center',
    gap: 8,
  },
  number: {
    fontSize: 16,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  name: {
    fontSize: 32,
    fontWeight: '800',
    color: Colors.text,
  },
  typesRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  typeBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  typeText: {
    color: Colors.textLight,
    fontWeight: '600',
    fontSize: 14,
  },
  imageContainer: {
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  image: {
    width: 220,
    height: 220,
  },
  infoRow: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    justifyContent: 'space-around',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  infoItem: {
    alignItems: 'center',
    gap: 4,
  },
  infoLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  infoValue: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
  },
  divider: {
    width: 1,
    backgroundColor: Colors.border,
  },
});
