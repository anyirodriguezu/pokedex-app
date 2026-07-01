import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import { ErrorState } from '../../../components/ui/ErrorState';
import { Colors } from '../../../constants/colors';
import { PokedexStackParamList } from '../../../navigation/types';
import { PokemonCard } from '../components/PokemonCard';
import { LoadingState } from '../components/LoadingState';
import { usePokemonList } from '../hooks/usePokemonList';
import { PokemonWithId } from '../types/pokemon.types';

type Props = NativeStackScreenProps<PokedexStackParamList, 'PokemonList'>;

export const PokemonListScreen: React.FC<Props> = ({ navigation }) => {
  const { pokemonList, isLoading, isError, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } =
    usePokemonList();

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

  const renderItem = ({ item }: { item: PokemonWithId }) => (
    <PokemonCard
      pokemon={item}
      onPress={() =>
        navigation.navigate('PokemonDetail', {
          pokemonId: item.id,
          pokemonName: item.name,
        })
      }
    />
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={pokemonList}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        numColumns={2}
        contentContainerStyle={styles.list}
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) fetchNextPage();
        }}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          isFetchingNextPage ? (
            <ActivityIndicator style={styles.footer} color={Colors.primary} />
          ) : null
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  list: {
    padding: 6,
    paddingBottom: 16,
  },
  footer: {
    paddingVertical: 20,
  },
});
