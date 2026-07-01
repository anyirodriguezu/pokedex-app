export type District = 'Ate' | 'Breña' | 'Miraflores' | 'Kanto' | 'Johto';
export type PokemonType = 'Fuego' | 'Agua' | 'Planta';

export interface Step1Data {
  fullName: string;
  age: number;
  email: string;
}

export interface Step2Data {
  district: District;
  favoritePokemonType: PokemonType;
}

export interface TrainerProfile extends Step1Data, Step2Data {}

export interface TrainerStoreState {
  profile: TrainerProfile | null;
  step1Data: Step1Data | null;
  setStep1Data: (data: Step1Data) => void;
  setStep2Data: (data: Step2Data) => void;
  resetProfile: () => void;
}
