import React from 'react';
import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { usePokemonDetail } from '../usePokemonDetail';
import * as pokeApi from '../../../../services/pokeApi';
import { PokemonDetail } from '../../types/pokemon.types';

jest.mock('../../../../services/pokeApi');

const mockFetch = pokeApi.fetchPokemonDetail as jest.MockedFunction<typeof pokeApi.fetchPokemonDetail>;

let queryClient: QueryClient;

function createWrapper() {
  queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children);
  }
  return Wrapper;
}

const mockDetail: PokemonDetail = {
  id: 1,
  name: 'bulbasaur',
  height: 7,
  weight: 69,
  base_experience: 64,
  sprites: {
    front_default: 'https://example.com/bulbasaur.png',
    back_default: null,
    front_shiny: null,
    back_shiny: null,
    other: {
      'official-artwork': { front_default: 'https://example.com/bulbasaur-art.png', front_shiny: null },
    },
  },
  types: [{ slot: 1, type: { name: 'grass', url: '' } }],
  stats: [{ base_stat: 45, effort: 0, stat: { name: 'hp', url: '' } }],
  abilities: [],
};

describe('usePokemonDetail', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    queryClient.clear();
  });

  it('does not fetch when id is 0 (disabled)', async () => {
    const { result } = await renderHook(() => usePokemonDetail(0), { wrapper: createWrapper() });
    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toBeUndefined();
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('returns pokemon detail data on success', async () => {
    mockFetch.mockResolvedValue(mockDetail);

    const { result } = await renderHook(() => usePokemonDetail(1), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.data?.name).toBe('bulbasaur');
    expect(result.current.data?.id).toBe(1);
    expect(result.current.isError).toBe(false);
  });

  it('calls the service with the given id', async () => {
    mockFetch.mockResolvedValue(mockDetail);

    const { result } = await renderHook(() => usePokemonDetail(25), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(mockFetch).toHaveBeenCalledWith(25);
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it('returns error state when fetch fails', async () => {
    mockFetch.mockRejectedValue(new Error('Not found'));

    const { result } = await renderHook(() => usePokemonDetail(999), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.data).toBeUndefined();
    expect(result.current.isLoading).toBe(false);
  });

  it('is in loading state immediately after mount for a valid id', async () => {
    mockFetch.mockImplementation(() => new Promise(() => {}));

    const { result } = await renderHook(() => usePokemonDetail(1), { wrapper: createWrapper() });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeUndefined();
  });
});
