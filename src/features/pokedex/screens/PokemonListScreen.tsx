import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useCallback, useMemo, useRef, useState, useEffect } from 'react';
import {
  ActivityIndicator,
  Animated,
  FlatList,
  LayoutAnimation,
  Platform,
  Pressable,
  ScrollView,
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
import {
  usePokemonTypeFilter,
  usePokemonGenerationFilter,
  POKEDEX_TYPES,
  GENERATION_RANGES,
  PokedexTypeSlug,
} from '../hooks/usePokemonTypeFilter';
import { PokemonWithId } from '../types/pokemon.types';

type Props = NativeStackScreenProps<PokedexStackParamList, 'PokemonList'>;

const SCROLL_THRESHOLD = 400;

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

  const [selectedType, setSelectedType] = useState<PokedexTypeSlug | null>(null);
  const [selectedGen, setSelectedGen] = useState<number | null>(null);
  const [filtersExpanded, setFiltersExpanded] = useState(false);

  const { results: typeResults, isLoading: isLoadingType } = usePokemonTypeFilter(selectedType);
  const { results: genResults, isLoading: isLoadingGen } = usePokemonGenerationFilter(selectedGen);

  const isLoadingFilter = isLoadingType || isLoadingGen;
  const isFiltering = selectedType !== null || selectedGen !== null;

  // Base list = intersection of type + gen filters (or the full paginated list)
  const baseList = useMemo<PokemonWithId[]>(() => {
    if (selectedType && selectedGen !== null) {
      const range = GENERATION_RANGES[selectedGen];
      return typeResults.filter((p) => p.id >= range.min && p.id <= range.max);
    }
    if (selectedType) return typeResults;
    if (selectedGen !== null) return genResults;
    return pokemonList;
  }, [selectedType, selectedGen, typeResults, genResults, pokemonList]);

  // Pass baseList to the search hook — text search operates within the active filter
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
  } = usePokemonSearch(baseList);

  const flatListRef = useRef<FlatList>(null);
  const showFabAnim = useRef(new Animated.Value(0)).current;
  const fabVisible = useRef(false);

  const handleScroll = useCallback(
    (e: { nativeEvent: { contentOffset: { y: number } } }) => {
      const y = e.nativeEvent.contentOffset.y;
      const shouldShow = y > SCROLL_THRESHOLD;
      if (shouldShow !== fabVisible.current) {
        fabVisible.current = shouldShow;
        Animated.spring(showFabAnim, {
          toValue: shouldShow ? 1 : 0,
          useNativeDriver: true,
          tension: 80,
          friction: 10,
        }).start();
      }
    },
    [showFabAnim]
  );

  const scrollToTop = () => {
    flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
  };

  const handlePress = useCallback(
    (id: number, name: string) => {
      navigation.navigate('PokemonDetail', { pokemonId: id, pokemonName: name });
    },
    [navigation]
  );

  const handleTypeSelect = (slug: PokedexTypeSlug) => {
    setSelectedType((prev) => (prev === slug ? null : slug));
  };

  const handleGenSelect = (index: number) => {
    setSelectedGen((prev) => (prev === index ? null : index));
  };

  const toggleFilters = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setFiltersExpanded((v) => !v);
  };

  // Active filter summary for the collapsed state
  const activeFiltersLabel = [
    selectedType ? POKEDEX_TYPES.find((t) => t.slug === selectedType)?.label : null,
    selectedGen !== null ? GENERATION_RANGES[selectedGen]?.label : null,
  ].filter(Boolean).join(' · ');

  const renderItem = useCallback(
    ({ item }: { item: PokemonWithId }) => (
      <PokemonCard pokemon={item} onPress={handlePress} />
    ),
    [handlePress]
  );

  // Only use infinite scroll when there are no active filters or text search
  const useInfiniteScroll = !isFiltering && !isSearching;

  // API fallback should not show when a type/gen filter is active
  const showApi = showApiResult && !isFiltering && apiResult;

  const apiPokemon: PokemonWithId | null = showApi
    ? {
        id: apiResult!.id,
        name: apiResult!.name,
        url: `https://pokeapi.co/api/v2/pokemon/${apiResult!.id}/`,
      }
    : null;

  const filterChips = (
    <View style={styles.filtersSection}>
      {/* Toggle row */}
      <View style={styles.filterToggleRow}>
        <Pressable
          style={[styles.filterToggleBtn, isFiltering && styles.filterToggleBtnActive]}
          onPress={toggleFilters}
          accessibilityRole="button"
          accessibilityLabel={filtersExpanded ? 'Ocultar filtros' : 'Mostrar filtros'}
        >
          <Text style={[styles.filterToggleText, isFiltering && styles.filterToggleTextActive]}>
            {filtersExpanded ? '▲ Filtros' : '▼ Filtros'}
          </Text>
          {isFiltering && !filtersExpanded && (
            <View style={styles.filterActiveDot} />
          )}
        </Pressable>

        {isFiltering && !filtersExpanded && (
          <Text style={styles.filterActiveSummary} numberOfLines={1}>
            {activeFiltersLabel}
          </Text>
        )}

        {(isFiltering || isSearching) && (
          <Pressable
            style={styles.clearFilters}
            onPress={() => {
              setSelectedType(null);
              setSelectedGen(null);
              clearSearch();
              if (filtersExpanded) {
                LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                setFiltersExpanded(false);
              }
            }}
            accessibilityRole="button"
            accessibilityLabel="Limpiar todos los filtros"
          >
            <Text style={styles.clearFiltersText}>✕ Limpiar</Text>
          </Pressable>
        )}
      </View>

      {/* Expandable filter panel */}
      {filtersExpanded && (
        <View style={styles.filterPanel}>
          <Text style={styles.filterLabel}>Tipo</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipsRow}
          >
            {POKEDEX_TYPES.map((t) => {
              const active = selectedType === t.slug;
              return (
                <Pressable
                  key={t.slug}
                  style={[styles.chip, active && styles.chipActive]}
                  onPress={() => handleTypeSelect(t.slug)}
                  accessibilityRole="button"
                  accessibilityLabel={t.label}
                  accessibilityState={{ selected: active }}
                >
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>
                    {t.label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          <Text style={styles.filterLabel}>Generación</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipsRow}
          >
            {GENERATION_RANGES.map((g, i) => {
              const active = selectedGen === i;
              return (
                <Pressable
                  key={g.label}
                  style={[styles.chip, styles.chipGen, active && styles.chipGenActive]}
                  onPress={() => handleGenSelect(i)}
                  accessibilityRole="button"
                  accessibilityLabel={g.label}
                  accessibilityState={{ selected: active }}
                >
                  <Text style={[styles.chipText, active && styles.chipTextGenActive]}>
                    {g.label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      )}
    </View>
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

  // Combined loading: filter API or search debounce/API
  const showLoading = isLoadingFilter || isDebouncing || (isSearching && isLoadingApi);

  return (
    <View style={styles.root}>
      {/* Barra de búsqueda — siempre visible */}
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

      {/* Filtros — siempre visibles */}
      {filterChips}

      {/* Zona de resultados */}
      <View style={styles.flex1}>

        {/* Loading centralizado en zona de resultados */}
        {showLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        ) : showApi && apiPokemon ? (
          /* Resultado exacto de API (solo sin filtros de tipo/gen activos) */
          <View style={styles.singleResult}>
            <PokemonCard pokemon={apiPokemon} onPress={handlePress} />
            <View style={styles.singleResultSpacer} />
          </View>
        ) : hasNoResults && !isFiltering ? (
          /* Sin resultados y sin filtro de tipo/gen */
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>
              No encontramos ningún Pokémon con ese nombre o número 😕
            </Text>
            <Text style={styles.emptyHint}>
              Intenta con el nombre completo en inglés o su número de Pokédex.
            </Text>
          </View>
        ) : (
          /* Lista unificada */
          <FlatList
            ref={flatListRef}
            data={localResults}
            keyExtractor={(item) => String(item.id)}
            renderItem={renderItem}
            numColumns={2}
            contentContainerStyle={styles.listContent}
            initialNumToRender={10}
            maxToRenderPerBatch={10}
            windowSize={5}
            scrollEventThrottle={100}
            onScroll={handleScroll}
            onEndReached={() => {
              if (useInfiniteScroll && hasNextPage && !isFetchingNextPage) fetchNextPage();
            }}
            onEndReachedThreshold={0.5}
            ListEmptyComponent={<EmptyState message="No se encontraron Pokémon" />}
            ListFooterComponent={
              isFetchingNextPage && useInfiniteScroll ? (
                <ActivityIndicator style={styles.footer} color={Colors.primary} />
              ) : null
            }
            accessibilityLabel="Lista de Pokémon"
          />
        )}

        {/* FAB back-to-top */}
        <Animated.View
          style={[styles.fab, { opacity: showFabAnim, transform: [{ scale: showFabAnim }] }]}
          pointerEvents="box-none"
        >
          <Pressable
            onPress={scrollToTop}
            style={styles.fabInner}
            accessibilityRole="button"
            accessibilityLabel="Volver al inicio"
          >
            <Text style={styles.fabIcon}>↑</Text>
          </Pressable>
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  flex1: {
    flex: 1,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 4,
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
  filtersSection: {
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#ececec',
  },
  filterToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 6,
    gap: 8,
  },
  filterToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  filterToggleBtnActive: {
    backgroundColor: Colors.primary + '18',
    borderColor: Colors.primary,
  },
  filterToggleText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#666',
  },
  filterToggleTextActive: {
    color: Colors.primary,
  },
  filterActiveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
  filterActiveSummary: {
    flex: 1,
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '600',
  },
  filterPanel: {
    gap: 2,
    paddingBottom: 6,
  },
  filterLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginLeft: 16,
    marginTop: 6,
  },
  chipsRow: {
    paddingHorizontal: 16,
    gap: 6,
    paddingVertical: 4,
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  chipActive: {
    backgroundColor: Colors.primary + '18',
    borderColor: Colors.primary,
  },
  chipGen: {
    backgroundColor: '#f0f4ff',
  },
  chipGenActive: {
    backgroundColor: '#6366F1' + '18',
    borderColor: '#6366F1',
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#555',
  },
  chipTextActive: {
    color: Colors.primary,
  },
  chipTextGenActive: {
    color: '#6366F1',
  },
  clearFilters: {
    marginLeft: 'auto',
  },
  clearFiltersText: {
    fontSize: 13,
    color: '#E53935',
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
    paddingBottom: 80,
  },
  footer: {
    paddingVertical: 20,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 20,
  },
  fabInner: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  fabIcon: {
    fontSize: 22,
    color: '#fff',
    fontWeight: '800',
    lineHeight: 26,
  },
});
