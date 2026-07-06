export type District = 'Ate' | 'Breña' | 'Miraflores' | 'Kanto' | 'Johto';
export type PokemonType = 'Fuego' | 'Agua' | 'Planta';

export const DISTRICTS: District[] = ['Ate', 'Breña', 'Miraflores', 'Kanto', 'Johto'];
export const POKEMON_TYPES: PokemonType[] = ['Fuego', 'Agua', 'Planta'];

export const MAX_ACTIVE_TEAM = 6;

export interface CapturedPokemon {
  id: number;
  name: string;
  sprite: string;
}

export interface Step1Data {
  fullName: string;
  age: number;
  email: string;
}

export interface Step2Data {
  district: District;
  favoritePokemonType: PokemonType;
}

export interface TrainerProfile extends Step1Data, Step2Data {
  starterPokemon: CapturedPokemon | null;
}

export interface TrainerStoreState {
  profile: TrainerProfile | null;
  step1Data: Step1Data | null;
  isEditing: boolean;
  activeTeam: CapturedPokemon[];
  box: CapturedPokemon[];
  hasSeenSplash: boolean;
  trainerName: string | null;
  setTrainerName: (name: string) => void;
  setStep1Data: (data: Step1Data) => void;
  setStep2Data: (data: Step2Data) => void;
  setStarterPokemon: (pokemon: CapturedPokemon) => void;
  resetProfile: () => void;
  startEdit: () => void;
  startCreate: () => void;
  capture: (pokemon: CapturedPokemon) => void;
  captureToBox: (pokemon: CapturedPokemon) => void;
  release: (id: number) => void;
  releaseStarterPokemon: () => void;
  isCaptured: (id: number) => boolean;
  isInActiveTeam: (id: number) => boolean;
  moveToTeam: (id: number) => void;
  moveToBox: (id: number) => void;
  swapPokemon: (boxId: number, teamId: number) => void;
  setHasSeenSplash: (value: boolean) => void;
}
