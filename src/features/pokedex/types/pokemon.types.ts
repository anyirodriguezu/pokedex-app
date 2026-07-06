export interface PokemonListItem {
  name: string;
  url: string;
}

export interface PokemonListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: PokemonListItem[];
}

export interface PokemonType {
  slot: number;
  type: {
    name: string;
    url: string;
  };
}

export interface PokemonStat {
  base_stat: number;
  effort: number;
  stat: {
    name: string;
    url: string;
  };
}

export interface PokemonAbility {
  ability: { name: string; url: string };
  is_hidden: boolean;
  slot: number;
}

export interface EvolutionDetail {
  trigger: { name: string };
  min_level: number | null;
  min_happiness: number | null;
  min_beauty: number | null;
  min_affection: number | null;
  item: { name: string } | null;
  held_item: { name: string } | null;
  known_move: { name: string } | null;
  known_move_type: { name: string } | null;
  location: { name: string } | null;
  time_of_day: string;
  trade_species: { name: string } | null;
  turn_upside_down: boolean;
  needs_overworld_rain: boolean;
}

export interface EvolutionChainLink {
  species: { name: string; url: string };
  evolution_details: EvolutionDetail[];
  evolves_to: EvolutionChainLink[];
}

export interface EvolutionChainResponse {
  id: number;
  chain: EvolutionChainLink;
}

export interface PokemonSpecies {
  id: number;
  name: string;
  flavor_text_entries: {
    flavor_text: string;
    language: { name: string };
    version: { name: string };
  }[];
  genera: {
    genus: string;
    language: { name: string };
  }[];
  gender_rate: number;
  capture_rate: number;
  base_happiness: number | null;
  is_baby: boolean;
  is_legendary: boolean;
  is_mythical: boolean;
  egg_groups: { name: string; url: string }[];
  generation: { name: string; url: string };
  evolution_chain: { url: string };
  color: { name: string };
  growth_rate: { name: string };
  habitat: { name: string } | null;
}

export interface PokemonSprites {
  front_default: string | null;
  back_default: string | null;
  front_shiny: string | null;
  back_shiny: string | null;
  other: {
    'official-artwork': {
      front_default: string | null;
      front_shiny: string | null;
    };
    showdown?: {
      front_default?: string | null;
      back_default?: string | null;
      front_shiny?: string | null;
      back_shiny?: string | null;
    };
    home?: {
      front_default?: string | null;
      front_shiny?: string | null;
    };
  };
}

export interface PokemonDetail {
  id: number;
  name: string;
  height: number;
  weight: number;
  base_experience: number | null;
  types: PokemonType[];
  stats: PokemonStat[];
  sprites: PokemonSprites;
  abilities: PokemonAbility[];
}

export interface PokemonWithId extends PokemonListItem {
  id: number;
}

export interface PokemonTypeEntry {
  pokemon: {
    name: string;
    url: string;
  };
  slot: number;
}

export interface PokemonTypeResponse {
  pokemon: PokemonTypeEntry[];
}
