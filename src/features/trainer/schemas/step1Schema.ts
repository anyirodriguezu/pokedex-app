import * as yup from 'yup';

export const step1Schema = yup.object({
  fullName: yup
    .string()
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .required('El nombre es requerido'),
  age: yup
    .number()
    .typeError('La edad debe ser un número')
    .min(10, 'Debes tener al menos 10 años')
    .required('La edad es requerida'),
  email: yup
    .string()
    .email('Ingresa un email válido')
    .required('El email es requerido'),
});

export type Step1FormValues = yup.InferType<typeof step1Schema>;
