import { useQuery } from '@tanstack/react-query';
import { fetchPokemonByType } from '../../../services/pokeApi';
import { getPokemonIdFromUrl, getPokemonImageUrl, capitalize } from '../../../utils/pokemonHelpers';
import { PokemonType, CapturedPokemon } from '../types/trainer.types';

const TYPE_SLUG: Record<PokemonType, string> = {
  Fuego: 'fire',
  Agua: 'water',
  Planta: 'grass',
};

export function useStarterPokemon(favoritePokemonType: PokemonType | null | undefined) {
  return useQuery<CapturedPokemon>({
    queryKey: ['starter-pokemon', favoritePokemonType],
    queryFn: async () => {
      if (!favoritePokemonType) throw new Error('No hay tipo seleccionado');
      const typeSlug = TYPE_SLUG[favoritePokemonType];
      const typeData = await fetchPokemonByType(typeSlug);

      const pool = typeData.pokemon.slice(0, 20);
      const random = pool[Math.floor(Math.random() * pool.length)];
      const id = getPokemonIdFromUrl(random.pokemon.url);

      return {
        id,
        name: capitalize(random.pokemon.name),
        sprite: getPokemonImageUrl(id),
      };
    },
    enabled: !!favoritePokemonType,
    staleTime: 0,
    gcTime: 0,
  });
}
