import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useCallback } from 'react';
import { ActivityIndicator, FlatList, StyleSheet } from 'react-native';
import { EmptyState } from '../../../components/ui/EmptyState';
import { ErrorState } from '../../../components/ui/ErrorState';
import { Colors } from '../../../constants/colors';
import { PokedexStackParamList } from '../../../navigation/types';
import { PokemonCard } from '../components/PokemonCard';
import { LoadingState } from '../components/LoadingState';
import { usePokemonList } from '../hooks/usePokemonList';
import { PokemonWithId } from '../types/pokemon.types';
import { YStack } from 'tamagui';

type Props = NativeStackScreenProps<PokedexStackParamList, 'PokemonList'>;

export const PokemonListScreen: React.FC<Props> = ({ navigation }) => {
  const {
    pokemonList,
    isLoading,
    isError,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = usePokemonList();

  const handlePress = useCallback(
    (id: number, name: string) => {
      navigation.navigate('PokemonDetail', { pokemonId: id, pokemonName: name });
    },
    [navigation]
  );

  const renderItem = useCallback(
    ({ item }: { item: PokemonWithId }) => (
      <PokemonCard pokemon={item} onPress={handlePress} />
    ),
    [handlePress]
  );

  if (isLoading) {
    return <LoadingState message="Cargando Pokémon..." />;
  }

  if (isError) {
    return (
      <ErrorState
        message="No se pudo cargar la lista de Pokémon"
        onRetry={() => refetch()}
      />
    );
  }

  return (
    <YStack flex={1} bg="$appBackground">
      <FlatList
        data={pokemonList}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        numColumns={2}
        contentContainerStyle={styles.listContent}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={5}
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) fetchNextPage();
        }}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={<EmptyState message="No se encontraron Pokémon" />}
        ListFooterComponent={
          isFetchingNextPage ? (
            <ActivityIndicator style={styles.footer} color={Colors.primary} />
          ) : null
        }
        accessibilityLabel="Lista de Pokémon"
      />
    </YStack>
  );
};

const styles = StyleSheet.create({
  listContent: {
    padding: 6,
    paddingBottom: 16,
  },
  footer: {
    paddingVertical: 20,
  },
});