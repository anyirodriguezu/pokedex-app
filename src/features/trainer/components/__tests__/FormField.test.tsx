import React from 'react';
import { render } from '../../../../test-utils';
import { FormField } from '../FormField';

describe('FormField', () => {
  it('muestra el label correctamente', async () => {
    const { getByText } = await render(<FormField label="Nombre completo" />);
    expect(getByText('Nombre completo')).toBeTruthy();
  });

  it('muestra el placeholder en el input', async () => {
    const { getByPlaceholderText } = await render(
      <FormField label="Email" placeholder="Ej: ash@pokemon.com" />
    );
    expect(getByPlaceholderText('Ej: ash@pokemon.com')).toBeTruthy();
  });

  it('muestra el mensaje de error cuando error tiene valor', async () => {
    const { getByText } = await render(
      <FormField label="Nombre" error="El nombre es requerido" />
    );
    expect(getByText('El nombre es requerido')).toBeTruthy();
  });

  it('no muestra mensaje de error cuando error es undefined', async () => {
    const { queryByText } = await render(
      <FormField label="Nombre" error={undefined} />
    );
    expect(queryByText('El nombre es requerido')).toBeNull();
  });

  it('renderiza sin error ni placeholder sin errores', async () => {
    const { getByText } = await render(<FormField label="Edad" />);
    expect(getByText('Edad')).toBeTruthy();
  });
});
