import { useQuery } from '@tanstack/react-query';
import { fetchPokemonSpecies } from '../../../services/pokeApi';

export function usePokemonSpecies(id: number) {
  return useQuery({
    queryKey: ['pokemonSpecies', id],
    queryFn: () => fetchPokemonSpecies(id),
    enabled: id > 0,
    staleTime: 10 * 60 * 1000,
  });
}
