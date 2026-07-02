import React from 'react';
import { fireEvent } from '@testing-library/react-native';
import { render } from '../../../test-utils';
import { Button } from '../Button';

describe('Button', () => {
  it('muestra el label correctamente', async () => {
    const { getByText } = await render(<Button label="Siguiente" onPress={() => {}} />);
    expect(getByText('Siguiente')).toBeTruthy();
  });

  it('llama a onPress al ser presionado', async () => {
    const onPress = jest.fn();
    const { getByText } = await render(<Button label="Confirmar" onPress={onPress} />);
    fireEvent.press(getByText('Confirmar'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('oculta el label y muestra ActivityIndicator cuando loading=true', async () => {
    const { queryByText, getByTestId } = await render(
      <Button label="Guardando" onPress={() => {}} loading />
    );
    expect(queryByText('Guardando')).toBeNull();
    expect(getByTestId('loading-indicator')).toBeTruthy();
  });

  it('pasa color blanco al ActivityIndicator con variante primary', async () => {
    const { getByTestId } = await render(
      <Button label="Guardando" onPress={() => {}} loading variant="primary" />
    );
    expect(getByTestId('loading-indicator').props.color).toBe('#FFFFFF');
  });

  it('pasa color rojo al ActivityIndicator con variante outline', async () => {
    const { getByTestId } = await render(
      <Button label="Guardando" onPress={() => {}} loading variant="outline" />
    );
    expect(getByTestId('loading-indicator').props.color).toBe('#E3350D');
  });

  it('usa variante primary por defecto', async () => {
    const { getByText } = await render(<Button label="Aceptar" onPress={() => {}} />);
    expect(getByText('Aceptar')).toBeTruthy();
  });

  it('renderiza variante secondary sin errores', async () => {
    const { getByText } = await render(
      <Button label="Secundario" onPress={() => {}} variant="secondary" />
    );
    expect(getByText('Secundario')).toBeTruthy();
  });

  it('renderiza con disabled=true sin errores', async () => {
    const { getByText } = await render(
      <Button label="Deshabilitado" onPress={() => {}} disabled />
    );
    expect(getByText('Deshabilitado')).toBeTruthy();
  });
});
