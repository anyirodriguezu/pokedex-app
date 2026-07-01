import { useQuery } from '@tanstack/react-query';
import { fetchPokemonDetail } from '../../../services/pokeApi';

export function usePokemonDetail(id: number) {
  return useQuery({
    queryKey: ['pokemonDetail', id],
    queryFn: () => fetchPokemonDetail(id),
    enabled: id > 0,
  });
}
