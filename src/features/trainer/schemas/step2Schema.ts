import * as yup from 'yup';
import { District, PokemonType } from '../types/trainer.types';

const districts: District[] = ['Ate', 'Breña', 'Miraflores', 'Kanto', 'Johto'];
const pokemonTypes: PokemonType[] = ['Fuego', 'Agua', 'Planta'];

export const step2Schema = yup.object({
  district: yup
    .mixed<District>()
    .oneOf(districts, 'Selecciona un distrito válido')
    .required('El distrito es requerido'),
  favoritePokemonType: yup
    .mixed<PokemonType>()
    .oneOf(pokemonTypes, 'Selecciona un tipo válido')
    .required('El tipo favorito es requerido'),
});

export type Step2FormValues = yup.InferType<typeof step2Schema>;
