import React from 'react';
import { fireEvent, waitFor } from '@testing-library/react-native';
import { render } from '../../../../test-utils';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { TrainerStackParamList } from '../../../../navigation/types';
import { Step2PreferencesScreen } from '../Step2PreferencesScreen';
import { useTrainerStore } from '../../../../store/trainerStore';

type Step2NavProp = NativeStackNavigationProp<TrainerStackParamList, 'Step2Preferences'>;

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useFocusEffect: () => {},
}));
jest.mock('expo-haptics');

const mockNavigation = { navigate: jest.fn(), goBack: jest.fn() } as unknown as Step2NavProp;

const editPrefsRoute = { params: { mode: 'edit-preferences' } } as unknown as RouteProp<TrainerStackParamList, 'Step2Preferences'>;

const existingProfile = {
  fullName: 'Ash',
  age: 10,
  email: 'ash@pokemon.com',
  district: 'Kanto',
  favoritePokemonType: 'Fuego',
  starterPokemon: { id: 4, name: 'Charmander', sprite: 'https://example.com/4.png' },
};

beforeEach(() => {
  jest.clearAllMocks();
  useTrainerStore.setState({
    profile: null,
    step1Data: { fullName: 'Ash', age: 10, email: 'ash@pokemon.com' },
    isEditing: false,
    activeTeam: [],
    box: [],
    hasSeenSplash: false,
    trainerName: null,
  });
});

describe('Step2PreferencesScreen — modo edit-preferences', () => {
  it('muestra título "Editar Preferencias"', async () => {
    const { getByText } = await render(
      <Step2PreferencesScreen navigation={mockNavigation} route={editPrefsRoute} />
    );
    expect(getByText('Editar Preferencias')).toBeTruthy();
  });

  it('muestra botón "Guardar"', async () => {
    const { getByText } = await render(
      <Step2PreferencesScreen navigation={mockNavigation} route={editPrefsRoute} />
    );
    expect(getByText('Guardar')).toBeTruthy();
  });

  it('muestra botón "Cancelar"', async () => {
    const { getByText } = await render(
      <Step2PreferencesScreen navigation={mockNavigation} route={editPrefsRoute} />
    );
    expect(getByText('Cancelar')).toBeTruthy();
  });

  it('muestra subtítulo específico de edit-preferences', async () => {
    const { getByText } = await render(
      <Step2PreferencesScreen navigation={mockNavigation} route={editPrefsRoute} />
    );
    expect(getByText('Actualiza tu distrito y tipo favorito')).toBeTruthy();
  });

  it('navega a Summary cuando el tipo no cambia en edit-preferences', async () => {
    useTrainerStore.setState({ isEditing: true, profile: existingProfile } as any);
    const { getByLabelText, getByText } = await render(
      <Step2PreferencesScreen navigation={mockNavigation} route={editPrefsRoute} />
    );
    fireEvent.press(getByLabelText('Distrito Kanto'));
    fireEvent.press(getByLabelText('Tipo Fuego'));
    fireEvent.press(getByText('Guardar'));
    await waitFor(() => {
      expect(mockNavigation.navigate).toHaveBeenCalledWith('Summary', expect.anything());
    });
  });
});
