import React from 'react';
import { fireEvent, waitFor } from '@testing-library/react-native';
import { render } from '../../../../test-utils';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { TrainerStackParamList } from '../../../../navigation/types';
import { SummaryScreen } from '../SummaryScreen';
import { useTrainerStore } from '../../../../store/trainerStore';
import { TrainerProfile } from '../../types/trainer.types';

type SummaryNavProp = NativeStackNavigationProp<TrainerStackParamList, 'Summary'>;

jest.mock('expo-haptics');

const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
  popToTop: jest.fn(),
} as unknown as SummaryNavProp;
const mockRoute = { params: {} } as unknown as RouteProp<TrainerStackParamList, 'Summary'>;

const profileMock: TrainerProfile = {
  fullName: 'Ash Ketchum',
  age: 10,
  email: 'ash@pokemon.com',
  district: 'Kanto',
  favoritePokemonType: 'Fuego',
  starterPokemon: null,
};

const renderScreen = () =>
  render(
    <SummaryScreen
      navigation={mockNavigation}
      route={mockRoute}
    />
  );

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

describe('SummaryScreen', () => {
  it('llama a popToTop si no hay perfil ni edición activa', async () => {
    await renderScreen();
    await waitFor(() => {
      expect(mockNavigation.popToTop).toHaveBeenCalled();
    });
  });

  it('renderiza el nombre del entrenador desde el store', async () => {
    useTrainerStore.setState({ profile: profileMock });
    const { getByText } = await renderScreen();
    expect(getByText('Ash Ketchum')).toBeTruthy();
  });

  it('renderiza el email del entrenador', async () => {
    useTrainerStore.setState({ profile: profileMock });
    const { getByText } = await renderScreen();
    expect(getByText('ash@pokemon.com')).toBeTruthy();
  });

  it('renderiza el distrito del entrenador', async () => {
    useTrainerStore.setState({ profile: profileMock });
    const { getByText } = await renderScreen();
    expect(getByText('Kanto')).toBeTruthy();
  });

  it('muestra los botones de edición', async () => {
    useTrainerStore.setState({ profile: profileMock });
    const { getByText } = await renderScreen();
    expect(getByText('✏️ Editar datos básicos')).toBeTruthy();
    expect(getByText('🎮 Editar preferencias')).toBeTruthy();
  });

  it('al pulsar "Editar datos básicos" navega al paso 1 en modo edit-basic', async () => {
    useTrainerStore.setState({ profile: profileMock });
    const { getByText } = await renderScreen();
    fireEvent.press(getByText('✏️ Editar datos básicos'));
    await waitFor(() => {
      expect(mockNavigation.navigate).toHaveBeenCalledWith('Step1PersonalData', {
        mode: 'edit-basic',
      });
    });
  });

  it('al pulsar "Editar preferencias" navega al paso 2 en modo edit-preferences', async () => {
    useTrainerStore.setState({ profile: profileMock });
    const { getByText } = await renderScreen();
    fireEvent.press(getByText('🎮 Editar preferencias'));
    await waitFor(() => {
      expect(mockNavigation.navigate).toHaveBeenCalledWith('Step2Preferences', {
        mode: 'edit-preferences',
      });
    });
  });

  it('no muestra el botón de liberar starter si no hay starter', async () => {
    useTrainerStore.setState({ profile: profileMock });
    const { queryByText } = await renderScreen();
    expect(queryByText(/Liberar a/)).toBeNull();
  });

  it('muestra el botón de liberar starter si hay uno asignado', async () => {
    useTrainerStore.setState({
      profile: {
        ...profileMock,
        starterPokemon: { id: 25, name: 'Pikachu', sprite: 'https://example.com/25.png' },
      },
    });
    const { getByText } = await renderScreen();
    expect(getByText('🔓 Liberar a Pikachu')).toBeTruthy();
  });
});
