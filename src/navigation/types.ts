import { NavigatorScreenParams } from '@react-navigation/native';

export type PokedexStackParamList = {
  PokemonList: undefined;
  PokemonDetail: { pokemonId: number; pokemonName: string };
};

export type WizardMode = 'create' | 'edit-basic' | 'edit-preferences';

export type TrainerStackParamList = {
  Step1PersonalData: { mode?: WizardMode };
  Step2Preferences: { mode?: WizardMode };
  StarterPokemon: { mode?: WizardMode };
  Summary: { fromEdit?: boolean };
};

export type RootTabParamList = {
  Pokedex: NavigatorScreenParams<PokedexStackParamList>;
  Trainer: NavigatorScreenParams<TrainerStackParamList>;
  Team: undefined;
};
