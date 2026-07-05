import * as yup from 'yup';
import { District, PokemonType, DISTRICTS, POKEMON_TYPES } from '../types/trainer.types';

export const step2Schema = yup.object({
  district: yup
    .mixed<District>()
    .oneOf(DISTRICTS, 'Selecciona un distrito válido')
    .required('El distrito es requerido')
    .defined(),
  favoritePokemonType: yup
    .mixed<PokemonType>()
    .oneOf(POKEMON_TYPES, 'Selecciona un tipo válido')
    .required('El tipo favorito es requerido')
    .defined(),
});

export type Step2FormValues = yup.InferType<typeof step2Schema>;
