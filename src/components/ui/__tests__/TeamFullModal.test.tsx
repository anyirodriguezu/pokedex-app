import React from 'react';
import { fireEvent } from '@testing-library/react-native';
import { render } from '../../../test-utils';
import { TeamFullModal } from '../TeamFullModal';
import { CapturedPokemon } from '../../../features/trainer/types/trainer.types';

const newPokemon: CapturedPokemon = { id: 1, name: 'bulbasaur', sprite: 'https://example.com/1.png' };

const activeTeam: CapturedPokemon[] = [
  { id: 25, name: 'pikachu', sprite: 'https://example.com/25.png' },
  { id: 4, name: 'charmander', sprite: 'https://example.com/4.png' },
];

const noop = jest.fn();

beforeEach(() => jest.clearAllMocks());

describe('TeamFullModal', () => {
  it('no renderiza nada si newPokemon es null', async () => {
    const { queryByText } = await render(
      <TeamFullModal
        visible={true}
        newPokemon={null}
        activeTeam={activeTeam}
        onSendToBox={noop}
        onSwap={noop}
        onCancel={noop}
      />
    );
    expect(queryByText(/Equipo completo/)).toBeNull();
  });

  it('muestra el título y el nombre del nuevo pokémon', async () => {
    const { getByText } = await render(
      <TeamFullModal
        visible={true}
        newPokemon={newPokemon}
        activeTeam={activeTeam}
        onSendToBox={noop}
        onSwap={noop}
        onCancel={noop}
      />
    );
    expect(getByText(/Equipo completo/)).toBeTruthy();
    expect(getByText(/bulbasaur/)).toBeTruthy();
  });

  it('lista los miembros del equipo activo', async () => {
    const { getByText } = await render(
      <TeamFullModal
        visible={true}
        newPokemon={newPokemon}
        activeTeam={activeTeam}
        onSendToBox={noop}
        onSwap={noop}
        onCancel={noop}
      />
    );
    expect(getByText('pikachu')).toBeTruthy();
    expect(getByText('charmander')).toBeTruthy();
  });

  it('llama a onSwap con el id correcto al pulsar un miembro', async () => {
    const mockSwap = jest.fn();
    const { getByLabelText } = await render(
      <TeamFullModal
        visible={true}
        newPokemon={newPokemon}
        activeTeam={activeTeam}
        onSendToBox={noop}
        onSwap={mockSwap}
        onCancel={noop}
      />
    );
    fireEvent.press(getByLabelText('Reemplazar a pikachu'));
    expect(mockSwap).toHaveBeenCalledWith(25);
  });

  it('llama a onSwap con el id del segundo miembro', async () => {
    const mockSwap = jest.fn();
    const { getByLabelText } = await render(
      <TeamFullModal
        visible={true}
        newPokemon={newPokemon}
        activeTeam={activeTeam}
        onSendToBox={noop}
        onSwap={mockSwap}
        onCancel={noop}
      />
    );
    fireEvent.press(getByLabelText('Reemplazar a charmander'));
    expect(mockSwap).toHaveBeenCalledWith(4);
  });

  it('llama a onSendToBox al pulsar Enviar al Laboratorio', async () => {
    const mockSendToBox = jest.fn();
    const { getByLabelText } = await render(
      <TeamFullModal
        visible={true}
        newPokemon={newPokemon}
        activeTeam={activeTeam}
        onSendToBox={mockSendToBox}
        onSwap={noop}
        onCancel={noop}
      />
    );
    fireEvent.press(getByLabelText('Enviar al Laboratorio'));
    expect(mockSendToBox).toHaveBeenCalled();
  });

  it('llama a onCancel al pulsar Cancelar captura', async () => {
    const mockCancel = jest.fn();
    const { getByLabelText } = await render(
      <TeamFullModal
        visible={true}
        newPokemon={newPokemon}
        activeTeam={activeTeam}
        onSendToBox={noop}
        onSwap={noop}
        onCancel={mockCancel}
      />
    );
    fireEvent.press(getByLabelText('Cancelar captura'));
    expect(mockCancel).toHaveBeenCalled();
  });

  it('no muestra el modal cuando visible es false', async () => {
    const { queryByText } = await render(
      <TeamFullModal
        visible={false}
        newPokemon={newPokemon}
        activeTeam={activeTeam}
        onSendToBox={noop}
        onSwap={noop}
        onCancel={noop}
      />
    );
    expect(queryByText(/Equipo completo/)).toBeNull();
  });
});
