import { useInfiniteQuery } from '@tanstack/react-query';
import { fetchPokemonList } from '../../../services/pokeApi';
import { getPokemonIdFromUrl } from '../../../utils/pokemonHelpers';
import { POKEMON_LIST_LIMIT } from '../../../constants/api';
import { PokemonWithId } from '../types/pokemon.types';

export function usePokemonList() {
  const query = useInfiniteQuery({
    queryKey: ['pokemonList'],
    queryFn: ({ pageParam = 0 }) => fetchPokemonList(pageParam as number),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage.next) return undefined;
      return allPages.length * POKEMON_LIST_LIMIT;
    },
  });

  const pokemonList: PokemonWithId[] =
    query.data?.pages.flatMap((page) =>
      page.results.map((p) => ({
        ...p,
        id: getPokemonIdFromUrl(p.url),
      }))
    ) ?? [];

  return {
    pokemonList,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    fetchNextPage: query.fetchNextPage,
    hasNextPage: query.hasNextPage,
    isFetchingNextPage: query.isFetchingNextPage,
  };
}
