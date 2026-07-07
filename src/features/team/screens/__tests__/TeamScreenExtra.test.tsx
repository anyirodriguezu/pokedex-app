import React from 'react';
import { fireEvent, waitFor } from '@testing-library/react-native';
import { render } from '../../../../test-utils';
import { TeamScreen } from '../TeamScreen';
import { useTrainerStore } from '../../../../store/trainerStore';

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useFocusEffect: () => {},
}));
jest.mock('expo-haptics');

beforeEach(() => {
  jest.clearAllMocks();
  useTrainerStore.setState({
    profile: null,
    step1Data: null,
    isEditing: false,
    activeTeam: [],
    box: [],
    hasSeenSplash: false,
    trainerName: null,
  });
});

describe('TeamScreen — caja de laboratorio', () => {
  it('muestra la sección del laboratorio cuando hay pokémon en la caja', async () => {
    useTrainerStore.setState({
      activeTeam: [],
      box: [{ id: 6, name: 'Charizard', sprite: 'https://example.com/6.png' }],
    } as any);
    const { getByText } = await render(<TeamScreen />);
    expect(getByText('🧪 Laboratorio Pokémon')).toBeTruthy();
    expect(getByText('Charizard')).toBeTruthy();
  });

  it('abre el modal de liberación desde la tarjeta del laboratorio', async () => {
    useTrainerStore.setState({
      activeTeam: [],
      box: [{ id: 6, name: 'Charizard', sprite: 'https://example.com/6.png' }],
    } as any);
    const { getByLabelText, getByText } = await render(<TeamScreen />);
    fireEvent.press(getByLabelText('Liberar a Charizard'));
    await waitFor(() => {
      expect(getByText(/Liberar a/)).toBeTruthy();
    });
  });

  it('muestra el botón de Máquina de Transferencia cuando hay pokémon en la caja', async () => {
    useTrainerStore.setState({
      activeTeam: [{ id: 25, name: 'Pikachu', sprite: 'https://example.com/25.png' }],
      box: [{ id: 1, name: 'Bulbasaur', sprite: 'https://example.com/1.png' }],
    } as any);
    const { getByLabelText } = await render(<TeamScreen />);
    expect(getByLabelText('Abrir Máquina de Transferencias')).toBeTruthy();
  });

  it('abre la Máquina de Transferencias al pulsarla', async () => {
    useTrainerStore.setState({
      activeTeam: [{ id: 25, name: 'Pikachu', sprite: 'https://example.com/25.png' }],
      box: [{ id: 1, name: 'Bulbasaur', sprite: 'https://example.com/1.png' }],
    } as any);
    const { getByLabelText, getAllByText } = await render(<TeamScreen />);
    fireEvent.press(getByLabelText('Abrir Máquina de Transferencias'));
    await waitFor(() => {
      expect(getAllByText(/Máquina de Transferencias/).length).toBeGreaterThan(0);
    });
  });

  it('abre el modal de liberación desde el menú del equipo', async () => {
    useTrainerStore.setState({
      activeTeam: [{ id: 25, name: 'Pikachu', sprite: 'https://example.com/25.png' }],
      box: [],
    } as any);
    const { getByLabelText, getByText } = await render(<TeamScreen />);
    fireEvent.press(getByLabelText('Pikachu'));
    await waitFor(() => getByLabelText('Liberar'));
    fireEvent.press(getByLabelText('Liberar'));
    await waitFor(() => {
      expect(getByText(/Liberar a/)).toBeTruthy();
    });
  });
});
