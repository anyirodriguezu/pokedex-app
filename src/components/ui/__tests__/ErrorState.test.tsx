import React from 'react';
import { fireEvent } from '@testing-library/react-native';
import { render } from '../../../test-utils';
import { ErrorState } from '../ErrorState';

describe('ErrorState', () => {
  it('muestra el mensaje por defecto', async () => {
    const { getByText } = await render(<ErrorState />);
    expect(getByText('Ocurrió un error inesperado')).toBeTruthy();
  });

  it('muestra un mensaje personalizado', async () => {
    const { getByText } = await render(
      <ErrorState message="No se pudo cargar la lista de Pokémon" />
    );
    expect(getByText('No se pudo cargar la lista de Pokémon')).toBeTruthy();
  });

  it('muestra el botón Reintentar cuando onRetry está definido', async () => {
    const { getByText } = await render(<ErrorState onRetry={() => {}} />);
    expect(getByText('Reintentar')).toBeTruthy();
  });

  it('no muestra el botón Reintentar cuando onRetry es undefined', async () => {
    const { queryByText } = await render(<ErrorState />);
    expect(queryByText('Reintentar')).toBeNull();
  });

  it('llama a onRetry al presionar el botón', async () => {
    const onRetry = jest.fn();
    const { getByText } = await render(<ErrorState onRetry={onRetry} />);
    fireEvent.press(getByText('Reintentar'));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});
