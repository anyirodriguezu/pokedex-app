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

export function getPokemonSpriteUrl(id: number): string {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;
}

export function getTextColor(bgHex: string): string {
  const r = parseInt(bgHex.slice(1, 3), 16);
  const g = parseInt(bgHex.slice(3, 5), 16);
  const b = parseInt(bgHex.slice(5, 7), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? '#1a1a1a' : '#ffffff';
}

export function getTrainerTypeColor(spanishType: string): string {
  const map: Record<string, string> = {
    Fuego: Colors.typeColors.fire ?? '#F08030',
    Agua: Colors.typeColors.water ?? '#6890F0',
    Planta: Colors.typeColors.grass ?? '#78C850',
  };
  return map[spanishType] ?? Colors.primary;
}
