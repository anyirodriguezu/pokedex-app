import React from 'react';
import { fireEvent, waitFor } from '@testing-library/react-native';
import { render } from '../../../../test-utils';
import { TeamScreen } from '../TeamScreen';
import { useTrainerStore } from '../../../../store/trainerStore';
import { MAX_ACTIVE_TEAM } from '../../../trainer/types/trainer.types';

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

describe('TeamScreen — render e interacciones básicas', () => {
  it('muestra estado vacío cuando no hay pokémon', async () => {
    const { getByText } = await render(<TeamScreen />);
    expect(getByText('Equipo Activo')).toBeTruthy();
    expect(getByText('0/' + MAX_ACTIVE_TEAM)).toBeTruthy();
    expect(getByText('No has capturado ningún Pokémon todavía')).toBeTruthy();
  });

  it('abre el menú de un miembro del equipo y muestra el modal de mover al laboratorio', async () => {
    useTrainerStore.setState({
      activeTeam: [
        { id: 1, name: 'Pikachu', sprite: 'https://example.com/pika.png' },
      ],
      box: [],
    });

    const { getByLabelText, queryByText } = await render(<TeamScreen />);

    expect(getByLabelText('Pikachu')).toBeTruthy();

    fireEvent.press(getByLabelText('Pikachu'));

    await waitFor(() => expect(getByLabelText('Mover al Laboratorio')).toBeTruthy());

    fireEvent.press(getByLabelText('Mover al Laboratorio'));
    await waitFor(() => expect(queryByText('🧪 ¿Enviar al Laboratorio?')).toBeNull());
  });
});
