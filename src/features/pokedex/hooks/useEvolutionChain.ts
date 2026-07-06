import { useQuery } from '@tanstack/react-query';
import { fetchEvolutionChain } from '../../../services/pokeApi';

export function useEvolutionChain(url: string | undefined) {
  return useQuery({
    queryKey: ['evolutionChain', url],
    queryFn: () => fetchEvolutionChain(url!),
    enabled: !!url,
    staleTime: 10 * 60 * 1000,
  });
}
