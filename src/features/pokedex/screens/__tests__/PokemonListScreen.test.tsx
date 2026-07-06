import React from 'react';
import { fireEvent, waitFor } from '@testing-library/react-native';
import { render } from '../../../../test-utils';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { PokedexStackParamList } from '../../../../navigation/types';
import { PokemonListScreen } from '../PokemonListScreen';
import { usePokemonList } from '../../hooks/usePokemonList';
import {
  usePokemonTypeFilter,
  usePokemonGenerationFilter,
} from '../../hooks/usePokemonTypeFilter';
import { usePokemonSearch } from '../../../../hooks/usePokemonSearch';

jest.mock('../../hooks/usePokemonList');
jest.mock('../../hooks/usePokemonTypeFilter', () => ({
  ...jest.requireActual('../../hooks/usePokemonTypeFilter'),
  usePokemonTypeFilter: jest.fn(),
  usePokemonGenerationFilter: jest.fn(),
}));
jest.mock('../../../../hooks/usePokemonSearch');

type PokemonListNavProp = NativeStackNavigationProp<PokedexStackParamList, 'PokemonList'>;
const mockNavigation = { navigate: jest.fn() } as unknown as PokemonListNavProp;
const mockRoute = { params: {} } as unknown as RouteProp<PokedexStackParamList, 'PokemonList'>;

const defaultSearchResult = {
  rawTerm: '',
  handleSearchChange: jest.fn(),
  clearSearch: jest.fn(),
  localResults: [],
  apiResult: null,
  isLoadingApi: false,
  isApiError: false,
  isSearching: false,
  isDebouncing: false,
  hasNoResults: false,
  showApiResult: false,
  debouncedTerm: '',
};

const renderScreen = () =>
  render(
    <PokemonListScreen
      navigation={mockNavigation}
      route={mockRoute}
    />
  );

beforeEach(() => {
  jest.clearAllMocks();
  (usePokemonTypeFilter as jest.Mock).mockReturnValue({ results: [], isLoading: false });
  (usePokemonGenerationFilter as jest.Mock).mockReturnValue({ results: [], isLoading: false });
  (usePokemonSearch as jest.Mock).mockReturnValue(defaultSearchResult);
});

describe('PokemonListScreen', () => {
  it('muestra el skeleton de carga mientras isLoading es true', async () => {
    (usePokemonList as jest.Mock).mockReturnValue({
      pokemonList: [],
      isLoading: true,
      isError: false,
      refetch: jest.fn(),
      fetchNextPage: jest.fn(),
      hasNextPage: false,
      isFetchingNextPage: false,
    });
    const { getByTestId } = await renderScreen();
    expect(getByTestId('pokemon-list-skeleton')).toBeTruthy();
  });

  it('muestra el estado de error cuando isError es true', async () => {
    (usePokemonList as jest.Mock).mockReturnValue({
      pokemonList: [],
      isLoading: false,
      isError: true,
      error: new Error('Network error'),
      refetch: jest.fn(),
      fetchNextPage: jest.fn(),
      hasNextPage: false,
      isFetchingNextPage: false,
    });
    const { getByText } = await renderScreen();
    expect(getByText('No se pudo cargar la lista de Pokémon')).toBeTruthy();
  });

  it('muestra el botón Reintentar en el estado de error', async () => {
    (usePokemonList as jest.Mock).mockReturnValue({
      pokemonList: [],
      isLoading: false,
      isError: true,
      error: new Error('Network error'),
      refetch: jest.fn(),
      fetchNextPage: jest.fn(),
      hasNextPage: false,
      isFetchingNextPage: false,
    });
    const { getByText } = await renderScreen();
    expect(getByText('Reintentar')).toBeTruthy();
  });

  it('renderiza las tarjetas de Pokémon cuando hay datos', async () => {
    const pokemonList = [
      { id: 1, name: 'bulbasaur', url: 'https://pokeapi.co/api/v2/pokemon/1/' },
      { id: 4, name: 'charmander', url: 'https://pokeapi.co/api/v2/pokemon/4/' },
    ];
    (usePokemonList as jest.Mock).mockReturnValue({
      pokemonList,
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
      fetchNextPage: jest.fn(),
      hasNextPage: true,
      isFetchingNextPage: false,
    });
    (usePokemonSearch as jest.Mock).mockReturnValue({
      ...defaultSearchResult,
      localResults: pokemonList,
    });
    const { getByText } = await renderScreen();
    expect(getByText('Bulbasaur')).toBeTruthy();
    expect(getByText('Charmander')).toBeTruthy();
  });

  it('navega a PokemonDetail al pulsar una tarjeta', async () => {
    const pokemonList = [
      { id: 25, name: 'pikachu', url: 'https://pokeapi.co/api/v2/pokemon/25/' },
    ];
    (usePokemonList as jest.Mock).mockReturnValue({
      pokemonList,
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
      fetchNextPage: jest.fn(),
      hasNextPage: false,
      isFetchingNextPage: false,
    });
    (usePokemonSearch as jest.Mock).mockReturnValue({
      ...defaultSearchResult,
      localResults: pokemonList,
    });
    const { getByText } = await renderScreen();
    fireEvent.press(getByText('Pikachu'));
    await waitFor(() => {
      expect(mockNavigation.navigate).toHaveBeenCalledWith('PokemonDetail', {
        pokemonId: 25,
        pokemonName: 'pikachu',
      });
    });
  });
});
