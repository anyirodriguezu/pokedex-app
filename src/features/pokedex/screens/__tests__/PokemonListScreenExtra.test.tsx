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

const defaultPokemonList = {
  pokemonList: [{ id: 1, name: 'bulbasaur', url: 'https://pokeapi.co/api/v2/pokemon/1/' }],
  isLoading: false,
  isError: false,
  refetch: jest.fn(),
  fetchNextPage: jest.fn(),
  hasNextPage: false,
  isFetchingNextPage: false,
};

const defaultSearchResult = {
  rawTerm: '',
  handleSearchChange: jest.fn(),
  clearSearch: jest.fn(),
  localResults: [{ id: 1, name: 'bulbasaur', url: 'https://pokeapi.co/api/v2/pokemon/1/' }],
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
  render(<PokemonListScreen navigation={mockNavigation} route={mockRoute} />);

beforeEach(() => {
  jest.clearAllMocks();
  (usePokemonList as jest.Mock).mockReturnValue(defaultPokemonList);
  (usePokemonTypeFilter as jest.Mock).mockReturnValue({ results: [], isLoading: false });
  (usePokemonGenerationFilter as jest.Mock).mockReturnValue({ results: [], isLoading: false });
  (usePokemonSearch as jest.Mock).mockReturnValue(defaultSearchResult);
});

describe('PokemonListScreen — filtros', () => {
  it('abre el panel de filtros al pulsar "Mostrar filtros"', async () => {
    const { getByLabelText, getByText } = await renderScreen();
    fireEvent.press(getByLabelText('Mostrar filtros'));
    await waitFor(() => {
      expect(getByText('Tipo')).toBeTruthy();
    });
  });

  it('cierra el panel al pulsar "Ocultar filtros"', async () => {
    const { getByLabelText, queryByText } = await renderScreen();
    fireEvent.press(getByLabelText('Mostrar filtros'));
    await waitFor(() => getByLabelText('Ocultar filtros'));
    fireEvent.press(getByLabelText('Ocultar filtros'));
    await waitFor(() => {
      expect(queryByText('Tipo')).toBeNull();
    });
  });

  it('muestra el botón Limpiar cuando se selecciona un tipo', async () => {
    const { getByLabelText } = await renderScreen();
    fireEvent.press(getByLabelText('Mostrar filtros'));
    await waitFor(() => getByLabelText('🔥 Fuego'));
    fireEvent.press(getByLabelText('🔥 Fuego'));
    await waitFor(() => {
      expect(getByLabelText('Limpiar todos los filtros')).toBeTruthy();
    });
  });

  it('quita el filtro activo al pulsar Limpiar', async () => {
    const { getByLabelText, queryByLabelText } = await renderScreen();
    fireEvent.press(getByLabelText('Mostrar filtros'));
    await waitFor(() => getByLabelText('🔥 Fuego'));
    fireEvent.press(getByLabelText('🔥 Fuego'));
    await waitFor(() => getByLabelText('Limpiar todos los filtros'));
    fireEvent.press(getByLabelText('Limpiar todos los filtros'));
    await waitFor(() => {
      expect(queryByLabelText('Limpiar todos los filtros')).toBeNull();
    });
  });

  it('seleccionar una generación activa el filtro de generación', async () => {
    const { getByLabelText } = await renderScreen();
    fireEvent.press(getByLabelText('Mostrar filtros'));
    await waitFor(() => getByLabelText('Gen 1'));
    fireEvent.press(getByLabelText('Gen 1'));
    await waitFor(() => {
      expect(getByLabelText('Limpiar todos los filtros')).toBeTruthy();
    });
  });
});

describe('PokemonListScreen — estado sin resultados', () => {
  it('muestra mensaje de sin resultados cuando hasNoResults es true', async () => {
    (usePokemonSearch as jest.Mock).mockReturnValue({
      ...defaultSearchResult,
      localResults: [],
      hasNoResults: true,
      isSearching: true,
      showApiResult: false,
    });
    const { getByText } = await renderScreen();
    expect(getByText(/No encontramos ningún Pokémon/)).toBeTruthy();
  });
});
