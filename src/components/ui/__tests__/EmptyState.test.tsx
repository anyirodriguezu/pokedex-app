import React from 'react';
import { render } from '../../../test-utils';
import { EmptyState } from '../EmptyState';

describe('EmptyState', () => {
  it('muestra el mensaje por defecto', async () => {
    const { getByText } = await render(<EmptyState />);
    expect(getByText('No hay datos disponibles')).toBeTruthy();
  });

  it('muestra un mensaje personalizado', async () => {
    const { getByText } = await render(
      <EmptyState message="Sin resultados para tu búsqueda" />
    );
    expect(getByText('Sin resultados para tu búsqueda')).toBeTruthy();
  });
});
