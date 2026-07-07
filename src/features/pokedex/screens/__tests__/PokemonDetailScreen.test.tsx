import React from 'react';
import { fireEvent, waitFor } from '@testing-library/react-native';
import { render } from '../../../../test-utils';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { PokedexStackParamList } from '../../../../navigation/types';
import { PokemonDetailScreen } from '../PokemonDetailScreen';
import { useTrainerStore } from '../../../../store/trainerStore';
import { usePokemonDetail } from '../../hooks/usePokemonDetail';
import { usePokemonSpecies } from '../../hooks/usePokemonSpecies';
import { useEvolutionChain } from '../../hooks/useEvolutionChain';

jest.mock('expo-haptics');
jest.mock('../../hooks/usePokemonDetail');
jest.mock('../../hooks/usePokemonSpecies');
jest.mock('../../hooks/useEvolutionChain');

const mockUsePokemonDetail = usePokemonDetail as jest.MockedFunction<typeof usePokemonDetail>;
const mockUsePokemonSpecies = usePokemonSpecies as jest.MockedFunction<typeof usePokemonSpecies>;
const mockUseEvolutionChain = useEvolutionChain as jest.MockedFunction<typeof useEvolutionChain>;

type DetailNavProp = NativeStackNavigationProp<PokedexStackParamList, 'PokemonDetail'>;
const mockNavigation = {
  setOptions: jest.fn(),
  push: jest.fn(),
  goBack: jest.fn(),
} as unknown as DetailNavProp;
const mockRoute = {
  params: { pokemonId: 1, pokemonName: 'bulbasaur' },
} as unknown as RouteProp<PokedexStackParamList, 'PokemonDetail'>;

const mockDetail = {
  id: 1,
  name: 'bulbasaur',
  height: 7,
  weight: 69,
  base_experience: 64,
  sprites: {
    front_default: 'https://example.com/1.png',
    back_default: null,
    front_shiny: null,
    back_shiny: null,
    other: {
      'official-artwork': {
        front_default: 'https://example.com/1-art.png',
        front_shiny: null,
      },
      home: { front_default: null, front_shiny: null },
      showdown: { front_default: null, front_shiny: null },
    },
  },
  types: [{ slot: 1, type: { name: 'grass', url: '' } }],
  stats: [{ base_stat: 45, effort: 0, stat: { name: 'hp', url: '' } }],
  abilities: [
    { ability: { name: 'overgrow', url: '' }, is_hidden: false, slot: 1 },
  ],
};

const mockSpecies = {
  id: 1,
  name: 'bulbasaur',
  flavor_text_entries: [
    { flavor_text: 'A strange seed.', language: { name: 'en' }, version: { name: 'red' } },
  ],
  genera: [{ genus: 'Seed Pokémon', language: { name: 'en' } }],
  gender_rate: 1,
  capture_rate: 45,
  base_happiness: 50,
  is_baby: false,
  is_legendary: false,
  is_mythical: false,
  egg_groups: [{ name: 'monster', url: '' }],
  generation: { name: 'generation-i', url: '' },
  evolution_chain: { url: 'https://pokeapi.co/api/v2/evolution-chain/1/' },
  growth_rate: { name: 'medium-slow', url: '' },
};

const renderScreen = () =>
  render(<PokemonDetailScreen navigation={mockNavigation} route={mockRoute} />);

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
  mockUsePokemonSpecies.mockReturnValue({ data: undefined, isLoading: false, isError: false } as any);
  mockUseEvolutionChain.mockReturnValue({ data: undefined, isLoading: false, isError: false } as any);
});

describe('PokemonDetailScreen', () => {
  it('muestra el skeleton mientras isLoading es true', async () => {
    mockUsePokemonDetail.mockReturnValue({ data: undefined, isLoading: true, isError: false, refetch: jest.fn() } as any);
    const { queryByText } = await renderScreen();
    expect(queryByText('Capturar')).toBeNull();
    expect(queryByText('No se pudo cargar el detalle del Pokémon')).toBeNull();
  });

  it('muestra el estado de error cuando isError es true', async () => {
    mockUsePokemonDetail.mockReturnValue({ data: undefined, isLoading: false, isError: true, refetch: jest.fn() } as any);
    const { getByText } = await renderScreen();
    expect(getByText('No se pudo cargar el detalle del Pokémon')).toBeTruthy();
  });

  it('muestra el número del pokémon cuando los datos cargan', async () => {
    mockUsePokemonDetail.mockReturnValue({ data: mockDetail, isLoading: false, isError: false, refetch: jest.fn() } as any);
    const { getByText } = await renderScreen();
    expect(getByText('#001')).toBeTruthy();
  });

  it('muestra el botón Capturar cuando el pokémon no está capturado', async () => {
    mockUsePokemonDetail.mockReturnValue({ data: mockDetail, isLoading: false, isError: false, refetch: jest.fn() } as any);
    const { getByRole } = await renderScreen();
    expect(getByRole('button', { name: 'Capturar' })).toBeTruthy();
  });

  it('muestra el botón Liberar cuando el pokémon está en el equipo', async () => {
    useTrainerStore.setState({
      activeTeam: [{ id: 1, name: 'Bulbasaur', sprite: '' }],
      box: [],
    } as any);
    mockUsePokemonDetail.mockReturnValue({ data: mockDetail, isLoading: false, isError: false, refetch: jest.fn() } as any);
    const { getByRole } = await renderScreen();
    expect(getByRole('button', { name: 'Liberar' })).toBeTruthy();
  });

  it('muestra el badge "⚡ En tu equipo" cuando el pokémon está en el equipo activo', async () => {
    useTrainerStore.setState({
      activeTeam: [{ id: 1, name: 'Bulbasaur', sprite: '' }],
      box: [],
    } as any);
    mockUsePokemonDetail.mockReturnValue({ data: mockDetail, isLoading: false, isError: false, refetch: jest.fn() } as any);
    const { getByText } = await renderScreen();
    expect(getByText('⚡ En tu equipo')).toBeTruthy();
  });

  it('muestra las habilidades del pokémon', async () => {
    mockUsePokemonDetail.mockReturnValue({ data: mockDetail, isLoading: false, isError: false, refetch: jest.fn() } as any);
    const { getByText } = await renderScreen();
    expect(getByText('Overgrow')).toBeTruthy();
  });

  it('muestra los datos físicos (altura y peso)', async () => {
    mockUsePokemonDetail.mockReturnValue({ data: mockDetail, isLoading: false, isError: false, refetch: jest.fn() } as any);
    const { getByText } = await renderScreen();
    expect(getByText('0.7 m')).toBeTruthy();
    expect(getByText('6.9 kg')).toBeTruthy();
  });

  it('muestra la descripción de especie cuando hay datos de species', async () => {
    mockUsePokemonDetail.mockReturnValue({ data: mockDetail, isLoading: false, isError: false, refetch: jest.fn() } as any);
    mockUsePokemonSpecies.mockReturnValue({ data: mockSpecies, isLoading: false, isError: false } as any);
    const { getByText } = await renderScreen();
    expect(getByText('A strange seed.')).toBeTruthy();
  });

  it('muestra la generación cuando hay species', async () => {
    mockUsePokemonDetail.mockReturnValue({ data: mockDetail, isLoading: false, isError: false, refetch: jest.fn() } as any);
    mockUsePokemonSpecies.mockReturnValue({ data: mockSpecies, isLoading: false, isError: false } as any);
    const { getByText } = await renderScreen();
    expect(getByText('Gen I')).toBeTruthy();
  });

  it('muestra la tasa de captura cuando hay species', async () => {
    mockUsePokemonDetail.mockReturnValue({ data: mockDetail, isLoading: false, isError: false, refetch: jest.fn() } as any);
    mockUsePokemonSpecies.mockReturnValue({ data: mockSpecies, isLoading: false, isError: false } as any);
    const { getByText } = await renderScreen();
    expect(getByText('Normal')).toBeTruthy();
  });

  it('captura el pokémon al pulsar el botón Capturar', async () => {
    mockUsePokemonDetail.mockReturnValue({ data: mockDetail, isLoading: false, isError: false, refetch: jest.fn() } as any);
    const { getByRole } = await renderScreen();
    fireEvent.press(getByRole('button', { name: 'Capturar' }));
    await waitFor(() => {
      const state = useTrainerStore.getState();
      expect(
        state.activeTeam.some((p) => p.id === 1) ||
        state.box.some((p) => p.id === 1)
      ).toBe(true);
    });
  });

  it('abre el modal de liberación al pulsar el botón Liberar', async () => {
    useTrainerStore.setState({
      activeTeam: [{ id: 1, name: 'Bulbasaur', sprite: '' }],
      box: [],
    } as any);
    mockUsePokemonDetail.mockReturnValue({ data: mockDetail, isLoading: false, isError: false, refetch: jest.fn() } as any);
    const { getByRole, getByText } = await renderScreen();
    fireEvent.press(getByRole('button', { name: 'Liberar' }));
    await waitFor(() => {
      expect(getByText(/Dejar ir a/)).toBeTruthy();
    });
  });
});
