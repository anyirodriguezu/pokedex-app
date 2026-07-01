import { API_BASE_URL, POKEMON_LIST_LIMIT } from '../constants/api';
import { PokemonDetail, PokemonListResponse } from '../features/pokedex/types/pokemon.types';

export async function fetchPokemonList(offset: number = 0): Promise<PokemonListResponse> {
  const response = await fetch(
    `${API_BASE_URL}/pokemon?limit=${POKEMON_LIST_LIMIT}&offset=${offset}`
  );
  if (!response.ok) throw new Error('Error al obtener la lista de Pokémon');
  return response.json();
}

export async function fetchPokemonDetail(id: number): Promise<PokemonDetail> {
  const response = await fetch(`${API_BASE_URL}/pokemon/${id}`);
  if (!response.ok) throw new Error('Error al obtener el detalle del Pokémon');
  return response.json();
}
