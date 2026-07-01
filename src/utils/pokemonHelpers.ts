import { Colors } from '../constants/colors';

export function capitalize(name: string): string {
  return name.charAt(0).toUpperCase() + name.slice(1);
}

export function getPokemonIdFromUrl(url: string): number {
  const parts = url.split('/').filter(Boolean);
  return parseInt(parts[parts.length - 1], 10);
}

export function getTypeColor(typeName: string): string {
  return Colors.typeColors[typeName] ?? '#A8A878';
}

export function formatStatName(statName: string): string {
  const map: Record<string, string> = {
    hp: 'HP',
    attack: 'Ataque',
    defense: 'Defensa',
    'special-attack': 'Atq. Esp.',
    'special-defense': 'Def. Esp.',
    speed: 'Velocidad',
  };
  return map[statName] ?? capitalize(statName);
}

export function getPokemonImageUrl(id: number): string {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
}
