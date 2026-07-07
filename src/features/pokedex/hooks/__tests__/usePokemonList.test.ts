import React from 'react';
import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { usePokemonList } from '../usePokemonList';
import * as pokeApi from '../../../../services/pokeApi';

jest.mock('../../../../services/pokeApi');

const mockFetch = pokeApi.fetchPokemonList as jest.MockedFunction<typeof pokeApi.fetchPokemonList>;

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

describe('usePokemonList', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    queryClient.clear();
  });

  it('starts with empty list while loading', async () => {
    mockFetch.mockResolvedValue({ count: 0, next: null, previous: null, results: [] });
    const { result } = await renderHook(() => usePokemonList(), { wrapper: createWrapper() });
    expect(result.current.pokemonList).toHaveLength(0);
    expect(result.current.isLoading).toBe(true);
  });

  it('returns mapped pokemon list with derived ids on success', async () => {
    mockFetch.mockResolvedValue({
      count: 2,
      next: null,
      previous: null,
      results: [
        { name: 'bulbasaur', url: 'https://pokeapi.co/api/v2/pokemon/1/' },
        { name: 'ivysaur',   url: 'https://pokeapi.co/api/v2/pokemon/2/' },
      ],
    });

    const { result } = await renderHook(() => usePokemonList(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.pokemonList).toHaveLength(2);
    expect(result.current.pokemonList[0]).toEqual({
      name: 'bulbasaur',
      url: 'https://pokeapi.co/api/v2/pokemon/1/',
      id: 1,
    });
    expect(result.current.pokemonList[1].id).toBe(2);
    expect(result.current.isError).toBe(false);
  });

  it('returns error state and empty list when fetch fails', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'));

    const { result } = await renderHook(() => usePokemonList(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.pokemonList).toHaveLength(0);
    expect(result.current.isLoading).toBe(false);
  });

  it('signals hasNextPage when the API returns a next cursor', async () => {
    mockFetch.mockResolvedValue({
      count: 100,
      next: 'https://pokeapi.co/api/v2/pokemon?offset=20&limit=20',
      previous: null,
      results: [{ name: 'bulbasaur', url: 'https://pokeapi.co/api/v2/pokemon/1/' }],
    });

    const { result } = await renderHook(() => usePokemonList(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.hasNextPage).toBe(true);
    expect(typeof result.current.fetchNextPage).toBe('function');
    expect(result.current.isFetchingNextPage).toBe(false);
  });

  it('signals no next page when the API returns null next', async () => {
    mockFetch.mockResolvedValue({
      count: 1,
      next: null,
      previous: null,
      results: [{ name: 'bulbasaur', url: 'https://pokeapi.co/api/v2/pokemon/1/' }],
    });

    const { result } = await renderHook(() => usePokemonList(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.hasNextPage).toBe(false);
  });
});
