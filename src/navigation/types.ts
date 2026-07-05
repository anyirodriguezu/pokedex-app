import { NavigatorScreenParams } from '@react-navigation/native';

export type PokedexStackParamList = {
  PokemonList: undefined;
  PokemonDetail: { pokemonId: number; pokemonName: string };
};

export type WizardMode = 'create' | 'edit';

export type TrainerStackParamList = {
  Step1PersonalData: { mode?: WizardMode };
  Step2Preferences: { mode?: WizardMode };
  StarterPokemon: { mode?: WizardMode };
  Summary: undefined;
};

export type RootTabParamList = {
  Pokedex: NavigatorScreenParams<PokedexStackParamList>;
  Trainer: NavigatorScreenParams<TrainerStackParamList>;
  Team: undefined;
};
