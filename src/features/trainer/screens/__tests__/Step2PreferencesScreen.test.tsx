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
const mockRoute = { params: { mode: 'create' } } as unknown as RouteProp<TrainerStackParamList, 'Step2Preferences'>;

const renderScreen = () =>
  render(
    <Step2PreferencesScreen
      navigation={mockNavigation}
      route={mockRoute}
    />
  );

beforeEach(() => {
  jest.clearAllMocks();
  useTrainerStore.setState({
    profile: null,
    step1Data: { fullName: 'Ash Ketchum', age: 10, email: 'ash@pokemon.com' },
    isEditing: false,
    activeTeam: [],
    box: [],
    hasSeenSplash: false,
    trainerName: null,
  });
});

describe('Step2PreferencesScreen — renderizado', () => {
  it('muestra todos los chips de distrito', async () => {
    const { getByLabelText } = await renderScreen();
    expect(getByLabelText('Distrito Kanto')).toBeTruthy();
    expect(getByLabelText('Distrito Johto')).toBeTruthy();
    expect(getByLabelText('Distrito Miraflores')).toBeTruthy();
    expect(getByLabelText('Distrito Ate')).toBeTruthy();
    expect(getByLabelText('Distrito Breña')).toBeTruthy();
  });

  it('muestra los tres chips de tipo Pokémon', async () => {
    const { getByLabelText } = await renderScreen();
    expect(getByLabelText('Tipo Fuego')).toBeTruthy();
    expect(getByLabelText('Tipo Agua')).toBeTruthy();
    expect(getByLabelText('Tipo Planta')).toBeTruthy();
  });
});

describe('Step2PreferencesScreen — flujo completo', () => {
  it('guarda preferencias en el store y navega a StarterPokemon al confirmar selección', async () => {
    const { getByLabelText, getByText } = await renderScreen();
    fireEvent.press(getByLabelText('Distrito Kanto'));
    fireEvent.press(getByLabelText('Tipo Fuego'));
    fireEvent.press(getByText('Confirmar'));
    await waitFor(() => {
      expect(useTrainerStore.getState().profile).toMatchObject({
        district: 'Kanto',
        favoritePokemonType: 'Fuego',
      });
      expect(mockNavigation.navigate).toHaveBeenCalledWith('StarterPokemon', { mode: 'create' });
    });
  });
});
