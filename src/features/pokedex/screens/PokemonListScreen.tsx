import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useCallback } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { Text } from 'tamagui';
import { EmptyState } from '../../../components/ui/EmptyState';
import { ErrorState } from '../../../components/ui/ErrorState';
import { Colors } from '../../../constants/colors';
import { usePokemonSearch } from '../../../hooks/usePokemonSearch';
import { PokedexStackParamList } from '../../../navigation/types';
import { PokemonCard } from '../components/PokemonCard';
import { PokemonListSkeleton } from '../components/PokemonListSkeleton';
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

  const {
    rawTerm,
    handleSearchChange,
    clearSearch,
    localResults,
    apiResult,
    isLoadingApi,
    hasNoResults,
    showApiResult,
    isSearching,
    isDebouncing,
  } = usePokemonSearch(pokemonList);

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
    return <PokemonListSkeleton />;
  }

  if (isError) {
    return (
      <ErrorState
        message="No se pudo cargar la lista de Pokémon"
        onRetry={() => refetch()}
      />
    );
  }

  const apiPokemon: PokemonWithId | null = apiResult
    ? {
        id: apiResult.id,
        name: apiResult.name,
        url: `https://pokeapi.co/api/v2/pokemon/${apiResult.id}/`,
      }
    : null;

  return (
    <YStack flex={1} bg="$appBackground">
      <View style={styles.searchRow}>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por nombre o número…"
          placeholderTextColor="#999"
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
          value={rawTerm}
          onChangeText={handleSearchChange}
          accessibilityLabel="Buscar Pokémon"
        />
        {isSearching && (
          <Pressable
            onPress={clearSearch}
            style={styles.cancelButton}
            accessibilityLabel="Cancelar búsqueda"
            accessibilityRole="button"
          >
            <Text style={styles.cancelText}>Cancelar</Text>
          </Pressable>
        )}
      </View>

      {isSearching ? (
        <>
          {(isDebouncing || isLoadingApi) && (
            <ActivityIndicator
              style={styles.spinner}
              color={Colors.primary}
            />
          )}

          {showApiResult && apiPokemon && (
            <View style={styles.singleResult}>
              <PokemonCard pokemon={apiPokemon} onPress={handlePress} />
              <View style={styles.singleResultSpacer} />
            </View>
          )}

          {hasNoResults && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>
                No encontramos ningún Pokémon con ese nombre o número 😕
              </Text>
              <Text style={styles.emptyHint}>
                Intenta con el nombre completo en inglés o su número de Pokédex.
              </Text>
            </View>
          )}

          {!isDebouncing && !isLoadingApi && !showApiResult && !hasNoResults && (
            <FlatList
              data={localResults}
              keyExtractor={(item) => String(item.id)}
              renderItem={renderItem}
              numColumns={2}
              contentContainerStyle={styles.listContent}
              initialNumToRender={10}
              maxToRenderPerBatch={10}
              windowSize={5}
              ListEmptyComponent={
                <EmptyState message="No se encontraron Pokémon" />
              }
              accessibilityLabel="Resultados de búsqueda"
            />
          )}
        </>
      ) : (
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
          ListEmptyComponent={
            <EmptyState message="No se encontraron Pokémon" />
          }
          ListFooterComponent={
            isFetchingNextPage ? (
              <ActivityIndicator
                style={styles.footer}
                color={Colors.primary}
              />
            ) : null
          }
          accessibilityLabel="Lista de Pokémon"
        />
      )}
    </YStack>
  );
};

const styles = StyleSheet.create({
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginVertical: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    fontSize: 15,
    backgroundColor: '#f9f9f9',
  },
  cancelButton: {
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  cancelText: {
    fontSize: 15,
    color: Colors.primary,
    fontWeight: '500',
  },
  spinner: {
    marginTop: 32,
  },
  singleResult: {
    flexDirection: 'row',
    paddingHorizontal: 6,
  },
  singleResultSpacer: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingTop: 48,
    gap: 8,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
    color: '#333',
  },
  emptyHint: {
    fontSize: 13,
    textAlign: 'center',
    color: '#999',
  },
  listContent: {
    padding: 6,
    paddingBottom: 16,
  },
  footer: {
    paddingVertical: 20,
  },
});
