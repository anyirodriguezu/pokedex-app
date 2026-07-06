import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { fetchPokemonByType, fetchPokemonRange } from '../../../services/pokeApi';
import { getPokemonIdFromUrl } from '../../../utils/pokemonHelpers';
import { PokemonWithId } from '../types/pokemon.types';

export const POKEDEX_TYPES = [
  { label: '🔥 Fuego',     slug: 'fire' },
  { label: '💧 Agua',      slug: 'water' },
  { label: '🌿 Planta',    slug: 'grass' },
  { label: '⚡ Eléctrico', slug: 'electric' },
  { label: '🧠 Psíquico',  slug: 'psychic' },
  { label: '⭐ Normal',    slug: 'normal' },
  { label: '🥊 Lucha',     slug: 'fighting' },
  { label: '🦅 Volador',   slug: 'flying' },
  { label: '☠️ Veneno',    slug: 'poison' },
  { label: '🌍 Tierra',    slug: 'ground' },
  { label: '🪨 Roca',      slug: 'rock' },
  { label: '👻 Fantasma',  slug: 'ghost' },
  { label: '🐛 Bicho',     slug: 'bug' },
  { label: '🐉 Dragón',    slug: 'dragon' },
  { label: '🌑 Siniestro', slug: 'dark' },
  { label: '⚙️ Acero',     slug: 'steel' },
  { label: '🧊 Hielo',     slug: 'ice' },
  { label: '🌸 Hada',      slug: 'fairy' },
] as const;

export type PokedexTypeSlug = (typeof POKEDEX_TYPES)[number]['slug'];

export const GENERATION_RANGES: { label: string; min: number; max: number }[] = [
  { label: 'Gen 1', min: 1,   max: 151  },
  { label: 'Gen 2', min: 152, max: 251  },
  { label: 'Gen 3', min: 252, max: 386  },
  { label: 'Gen 4', min: 387, max: 493  },
  { label: 'Gen 5', min: 494, max: 649  },
  { label: 'Gen 6', min: 650, max: 721  },
  { label: 'Gen 7', min: 722, max: 809  },
  { label: 'Gen 8', min: 810, max: 905  },
  { label: 'Gen 9', min: 906, max: 1025 },
];

export function usePokemonGenerationFilter(genIndex: number | null) {
  const range = genIndex !== null ? GENERATION_RANGES[genIndex] : null;

  const query = useQuery({
    queryKey: ['pokemonByGen', genIndex],
    queryFn: () =>
      fetchPokemonRange(range!.min - 1, range!.max - range!.min + 1),
    enabled: range !== null,
    staleTime: 1000 * 60 * 10,
  });

  const results: PokemonWithId[] = useMemo(() => {
    if (!query.data) return [];
    return query.data.results.map((p) => ({
      name: p.name,
      url: p.url,
      id: getPokemonIdFromUrl(p.url),
    }));
  }, [query.data]);

  return { results, isLoading: query.isLoading, isError: query.isError };
}

export function usePokemonTypeFilter(typeSlug: PokedexTypeSlug | null) {
  const query = useQuery({
    queryKey: ['pokemonByType', typeSlug],
    queryFn: () => fetchPokemonByType(typeSlug!),
    enabled: typeSlug !== null,
    staleTime: 1000 * 60 * 10,
  });

  const results: PokemonWithId[] = useMemo(() => {
    if (!query.data) return [];
    return query.data.pokemon
      .map((entry) => ({
        name: entry.pokemon.name,
        url: entry.pokemon.url,
        id: getPokemonIdFromUrl(entry.pokemon.url),
      }))
      .filter((p) => p.id > 0 && p.id <= 1025)
      .sort((a, b) => a.id - b.id);
  }, [query.data]);

  return {
    results,
    isLoading: query.isLoading,
    isError: query.isError,
  };
}
