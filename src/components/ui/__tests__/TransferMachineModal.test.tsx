import React from 'react';
import { fireEvent, waitFor } from '@testing-library/react-native';
import { render } from '../../../test-utils';
import { TransferMachineModal } from '../TransferMachineModal';

jest.mock('expo-haptics');

const labPokemon = [
  { id: 1, name: 'bulbasaur', sprite: 'https://example.com/1.png' },
  { id: 4, name: 'charmander', sprite: 'https://example.com/4.png' },
];

const teamPokemon = [
  { id: 25, name: 'pikachu', sprite: 'https://example.com/25.png' },
];

const noop = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
});

describe('TransferMachineModal', () => {
  it('muestra el título cuando visible es true', async () => {
    const { getByText } = await render(
      <TransferMachineModal
        visible={true}
        labPokemon={labPokemon}
        activeTeam={teamPokemon}
        onMoveToTeam={noop}
        onSwap={noop}
        onClose={noop}
      />
    );
    expect(getByText(/Máquina de Transferencias/)).toBeTruthy();
  });

  it('muestra los pokémon del laboratorio', async () => {
    const { getByText } = await render(
      <TransferMachineModal
        visible={true}
        labPokemon={labPokemon}
        activeTeam={teamPokemon}
        onMoveToTeam={noop}
        onSwap={noop}
        onClose={noop}
      />
    );
    expect(getByText('bulbasaur')).toBeTruthy();
    expect(getByText('charmander')).toBeTruthy();
  });

  it('muestra los pokémon del equipo activo', async () => {
    const { getByText } = await render(
      <TransferMachineModal
        visible={true}
        labPokemon={labPokemon}
        activeTeam={teamPokemon}
        onMoveToTeam={noop}
        onSwap={noop}
        onClose={noop}
      />
    );
    expect(getByText('pikachu')).toBeTruthy();
  });

  it('muestra slots vacíos cuando el equipo tiene espacio', async () => {
    const { getByLabelText } = await render(
      <TransferMachineModal
        visible={true}
        labPokemon={labPokemon}
        activeTeam={teamPokemon}
        onMoveToTeam={noop}
        onSwap={noop}
        onClose={noop}
      />
    );
    expect(getByLabelText('Slot vacío 2')).toBeTruthy();
  });

  it('muestra la instrucción inicial de selección', async () => {
    const { getByText } = await render(
      <TransferMachineModal
        visible={true}
        labPokemon={labPokemon}
        activeTeam={teamPokemon}
        onMoveToTeam={noop}
        onSwap={noop}
        onClose={noop}
      />
    );
    expect(getByText(/Selecciona un Pokémon/)).toBeTruthy();
  });

  it('seleccionar un pokémon del laboratorio cambia la instrucción', async () => {
    const { getByLabelText, getByText } = await render(
      <TransferMachineModal
        visible={true}
        labPokemon={labPokemon}
        activeTeam={teamPokemon}
        onMoveToTeam={noop}
        onSwap={noop}
        onClose={noop}
      />
    );
    fireEvent.press(getByLabelText('Seleccionar bulbasaur'));
    await waitFor(() => {
      expect(getByText(/slot vacío o un miembro/)).toBeTruthy();
    });
  });

  it('transfiere al equipo al seleccionar lab y luego slot vacío', async () => {
    const mockMoveToTeam = jest.fn();
    const { getByLabelText } = await render(
      <TransferMachineModal
        visible={true}
        labPokemon={[labPokemon[0]]}
        activeTeam={[]}
        onMoveToTeam={mockMoveToTeam}
        onSwap={noop}
        onClose={noop}
      />
    );
    fireEvent.press(getByLabelText('Seleccionar bulbasaur'));
    await waitFor(() => getByLabelText('Slot vacío 1'));
    fireEvent.press(getByLabelText('Slot vacío 1'));
    await waitFor(() => {
      expect(mockMoveToTeam).toHaveBeenCalledWith(1);
    });
  });

  it('muestra mensaje de laboratorio vacío cuando no hay pokémon', async () => {
    const { getByText } = await render(
      <TransferMachineModal
        visible={true}
        labPokemon={[]}
        activeTeam={teamPokemon}
        onMoveToTeam={noop}
        onSwap={noop}
        onClose={noop}
      />
    );
    expect(getByText('El laboratorio está vacío')).toBeTruthy();
  });

  it('llama a onClose al pulsar el botón Cerrar', async () => {
    const mockClose = jest.fn();
    const { getByText } = await render(
      <TransferMachineModal
        visible={true}
        labPokemon={labPokemon}
        activeTeam={teamPokemon}
        onMoveToTeam={noop}
        onSwap={noop}
        onClose={mockClose}
      />
    );
    fireEvent.press(getByText('Cerrar'));
    await waitFor(() => expect(mockClose).toHaveBeenCalled());
  });
});
