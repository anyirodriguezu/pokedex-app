import { NavigatorScreenParams } from '@react-navigation/native';

export type PokedexStackParamList = {
  PokemonList: undefined;
  PokemonDetail: { pokemonId: number; pokemonName: string };
};

export type TrainerStackParamList = {
  Step1PersonalData: undefined;
  Step2Preferences: undefined;
  Summary: undefined;
};

export type RootTabParamList = {
  Pokedex: NavigatorScreenParams<PokedexStackParamList>;
  Trainer: NavigatorScreenParams<TrainerStackParamList>;
};
