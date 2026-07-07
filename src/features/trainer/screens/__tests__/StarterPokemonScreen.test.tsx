import React from 'react';
import { fireEvent, waitFor } from '@testing-library/react-native';
import { render } from '../../../../test-utils';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { TrainerStackParamList } from '../../../../navigation/types';
import { StarterPokemonScreen } from '../StarterPokemonScreen';
import { useTrainerStore } from '../../../../store/trainerStore';
import { useStarterPokemon } from '../../hooks/useStarterPokemon';

jest.mock('expo-haptics');
jest.mock('../../hooks/useStarterPokemon');

const mockUseStarterPokemon = useStarterPokemon as jest.MockedFunction<typeof useStarterPokemon>;

type StarterNavProp = NativeStackNavigationProp<TrainerStackParamList, 'StarterPokemon'>;
const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
} as unknown as StarterNavProp;
const mockRoute = {} as unknown as RouteProp<TrainerStackParamList, 'StarterPokemon'>;

const renderScreen = () =>
  render(<StarterPokemonScreen navigation={mockNavigation} route={mockRoute} />);

beforeEach(() => {
  jest.clearAllMocks();
  useTrainerStore.setState({
    profile: {
      fullName: 'Ash',
      age: 10,
      email: 'ash@pokemon.com',
      district: 'Kanto',
      favoritePokemonType: 'Fuego',
      starterPokemon: null,
    },
    step1Data: null,
    isEditing: false,
    activeTeam: [],
    box: [],
    hasSeenSplash: false,
    trainerName: null,
  });
});

describe('StarterPokemonScreen', () => {
  it('no muestra el botón de aceptar ni el error mientras carga', async () => {
    mockUseStarterPokemon.mockReturnValue({
      isLoading: true,
      isError: false,
      data: undefined,
      refetch: jest.fn(),
    } as any);
    const { queryByText } = await renderScreen();
    expect(queryByText('¡Lo acepto!')).toBeNull();
    expect(queryByText('No se pudo asignar tu Pokémon inicial')).toBeNull();
  });

  it('muestra el estado de error cuando isError es true', async () => {
    mockUseStarterPokemon.mockReturnValue({
      isLoading: false,
      isError: true,
      data: undefined,
      refetch: jest.fn(),
    } as any);
    const { getByText } = await renderScreen();
    expect(getByText('No se pudo asignar tu Pokémon inicial')).toBeTruthy();
  });

  it('muestra el botón Reintentar en el estado de error', async () => {
    mockUseStarterPokemon.mockReturnValue({
      isLoading: false,
      isError: true,
      data: undefined,
      refetch: jest.fn(),
    } as any);
    const { getByText } = await renderScreen();
    expect(getByText('Reintentar')).toBeTruthy();
  });

  it('llama a refetch al pulsar Reintentar', async () => {
    const mockRefetch = jest.fn();
    mockUseStarterPokemon.mockReturnValue({
      isLoading: false,
      isError: true,
      data: undefined,
      refetch: mockRefetch,
    } as any);
    const { getByText } = await renderScreen();
    fireEvent.press(getByText('Reintentar'));
    await waitFor(() => expect(mockRefetch).toHaveBeenCalled());
  });

  it('renderiza el nombre del pokémon inicial cuando hay datos', async () => {
    mockUseStarterPokemon.mockReturnValue({
      isLoading: false,
      isError: false,
      data: { id: 4, name: 'Charmander', sprite: 'https://example.com/4.png' },
      refetch: jest.fn(),
    } as any);
    const { getByText } = await renderScreen();
    expect(getByText('Charmander')).toBeTruthy();
  });

  it('muestra el título y el botón de aceptar cuando hay pokémon', async () => {
    mockUseStarterPokemon.mockReturnValue({
      isLoading: false,
      isError: false,
      data: { id: 4, name: 'Charmander', sprite: 'https://example.com/4.png' },
      refetch: jest.fn(),
    } as any);
    const { getByText } = await renderScreen();
    expect(getByText('Tu Pokémon Inicial')).toBeTruthy();
    expect(getByText('¡Lo acepto!')).toBeTruthy();
  });

  it('llama a setStarterPokemon y navega a Summary al aceptar', async () => {
    const starterData = { id: 4, name: 'Charmander', sprite: 'https://example.com/4.png' };
    mockUseStarterPokemon.mockReturnValue({
      isLoading: false,
      isError: false,
      data: starterData,
      refetch: jest.fn(),
    } as any);

    const { getByText } = await renderScreen();
    fireEvent.press(getByText('¡Lo acepto!'));

    await waitFor(() => {
      expect(useTrainerStore.getState().profile?.starterPokemon).toEqual(starterData);
      expect(mockNavigation.navigate).toHaveBeenCalledWith('Summary', { fromEdit: false });
    });
  });
});
