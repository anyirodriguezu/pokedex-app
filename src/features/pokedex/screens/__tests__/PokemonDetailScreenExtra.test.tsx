import React from 'react';
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
  params: { pokemonId: 144, pokemonName: 'articuno' },
} as unknown as RouteProp<PokedexStackParamList, 'PokemonDetail'>;

const mockDetail = {
  id: 144,
  name: 'articuno',
  height: 17,
  weight: 554,
  base_experience: 261,
  sprites: {
    front_default: 'https://example.com/144.png',
    back_default: null,
    front_shiny: null,
    back_shiny: null,
    other: {
      'official-artwork': { front_default: 'https://example.com/144-art.png', front_shiny: null },
      home: { front_default: null, front_shiny: null },
      showdown: { front_default: null, front_shiny: null },
    },
  },
  types: [{ slot: 1, type: { name: 'ice', url: '' } }],
  stats: [{ base_stat: 90, effort: 0, stat: { name: 'hp', url: '' } }],
  abilities: [
    { ability: { name: 'pressure', url: '' }, is_hidden: false, slot: 1 },
    { ability: { name: 'snow-cloak', url: '' }, is_hidden: true, slot: 3 },
  ],
};

const legendarySpecies = {
  id: 144,
  name: 'articuno',
  flavor_text_entries: [
    { flavor_text: 'One of the legendary birds.', language: { name: 'en' }, version: { name: 'red' } },
  ],
  genera: [{ genus: 'Freeze Pokémon', language: { name: 'en' } }],
  gender_rate: -1,
  capture_rate: 3,
  base_happiness: 35,
  is_baby: false,
  is_legendary: true,
  is_mythical: false,
  egg_groups: [{ name: 'no-eggs', url: '' }],
  generation: { name: 'generation-i', url: '' },
  evolution_chain: { url: 'https://pokeapi.co/api/v2/evolution-chain/144/' },
  growth_rate: { name: 'slow', url: '' },
};

const mythicalSpecies = { ...legendarySpecies, is_legendary: false, is_mythical: true };
const babySpecies = { ...legendarySpecies, is_legendary: false, is_baby: true, gender_rate: 4 };

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
  mockUseEvolutionChain.mockReturnValue({ data: undefined, isLoading: false, isError: false } as any);
});

describe('PokemonDetailScreen — badges de especie', () => {
  it('muestra el badge ⭐ Legendario cuando is_legendary es true', async () => {
    mockUsePokemonDetail.mockReturnValue({ data: mockDetail, isLoading: false, isError: false, refetch: jest.fn() } as any);
    mockUsePokemonSpecies.mockReturnValue({ data: legendarySpecies, isLoading: false, isError: false } as any);
    const { getByText } = await renderScreen();
    expect(getByText('⭐ Legendario')).toBeTruthy();
  });

  it('muestra el badge ✨ Mítico cuando is_mythical es true', async () => {
    mockUsePokemonDetail.mockReturnValue({ data: mockDetail, isLoading: false, isError: false, refetch: jest.fn() } as any);
    mockUsePokemonSpecies.mockReturnValue({ data: mythicalSpecies, isLoading: false, isError: false } as any);
    const { getByText } = await renderScreen();
    expect(getByText('✨ Mítico')).toBeTruthy();
  });

  it('muestra el badge 🍼 Bebé cuando is_baby es true', async () => {
    mockUsePokemonDetail.mockReturnValue({ data: mockDetail, isLoading: false, isError: false, refetch: jest.fn() } as any);
    mockUsePokemonSpecies.mockReturnValue({ data: babySpecies, isLoading: false, isError: false } as any);
    const { getByText } = await renderScreen();
    expect(getByText('🍼 Bebé')).toBeTruthy();
  });

  it('muestra el badge "🧪 En el Laboratorio" cuando está en la caja', async () => {
    useTrainerStore.setState({
      activeTeam: [],
      box: [{ id: 144, name: 'Articuno', sprite: 'https://example.com/144.png' }],
    } as any);
    mockUsePokemonDetail.mockReturnValue({ data: mockDetail, isLoading: false, isError: false, refetch: jest.fn() } as any);
    mockUsePokemonSpecies.mockReturnValue({ data: legendarySpecies, isLoading: false, isError: false } as any);
    const { getByText } = await renderScreen();
    expect(getByText('🧪 En el Laboratorio')).toBeTruthy();
  });
});

describe('PokemonDetailScreen — tasa de captura y género', () => {
  it('muestra "Muy difícil" para tasa de captura < 10', async () => {
    mockUsePokemonDetail.mockReturnValue({ data: mockDetail, isLoading: false, isError: false, refetch: jest.fn() } as any);
    mockUsePokemonSpecies.mockReturnValue({ data: legendarySpecies, isLoading: false, isError: false } as any);
    const { getByText } = await renderScreen();
    expect(getByText('Muy difícil')).toBeTruthy();
  });

  it('muestra "Muy fácil" para tasa de captura >= 200', async () => {
    const easySpecies = { ...legendarySpecies, capture_rate: 255, is_legendary: false };
    mockUsePokemonDetail.mockReturnValue({ data: mockDetail, isLoading: false, isError: false, refetch: jest.fn() } as any);
    mockUsePokemonSpecies.mockReturnValue({ data: easySpecies, isLoading: false, isError: false } as any);
    const { getByText } = await renderScreen();
    expect(getByText('Muy fácil')).toBeTruthy();
  });

  it('muestra "Asexuado" para gender_rate -1', async () => {
    mockUsePokemonDetail.mockReturnValue({ data: mockDetail, isLoading: false, isError: false, refetch: jest.fn() } as any);
    mockUsePokemonSpecies.mockReturnValue({ data: legendarySpecies, isLoading: false, isError: false } as any);
    const { getByText } = await renderScreen();
    expect(getByText('Asexuado')).toBeTruthy();
  });
});
