import React from 'react';
import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  usePokemonTypeFilter,
  usePokemonGenerationFilter,
} from '../usePokemonTypeFilter';
import * as pokeApi from '../../../../services/pokeApi';

jest.mock('../../../../services/pokeApi');

const mockFetchByType = pokeApi.fetchPokemonByType as jest.MockedFunction<
  typeof pokeApi.fetchPokemonByType
>;
const mockFetchRange = pokeApi.fetchPokemonRange as jest.MockedFunction<
  typeof pokeApi.fetchPokemonRange
>;

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children);
  }
  return Wrapper;
}

const mockTypeResponse = {
  pokemon: [
    { pokemon: { name: 'charmander', url: 'https://pokeapi.co/api/v2/pokemon/4/' } },
    { pokemon: { name: 'charmeleon', url: 'https://pokeapi.co/api/v2/pokemon/5/' } },
    { pokemon: { name: 'out-of-range', url: 'https://pokeapi.co/api/v2/pokemon/9999/' } },
  ],
};

describe('usePokemonTypeFilter', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('is disabled and returns empty results when typeSlug is null', async () => {
    const { result } = await renderHook(() => usePokemonTypeFilter(null), {
      wrapper: createWrapper(),
    });
    expect(result.current.results).toHaveLength(0);
    expect(result.current.isLoading).toBe(false);
    expect(mockFetchByType).not.toHaveBeenCalled();
  });

  it('returns mapped pokemon list sorted by id on success', async () => {
    mockFetchByType.mockResolvedValue(mockTypeResponse as any);
    const { result } = await renderHook(() => usePokemonTypeFilter('fire'), {
      wrapper: createWrapper(),
    });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.results).toHaveLength(2);
    expect(result.current.results[0]).toEqual({
      name: 'charmander',
      url: 'https://pokeapi.co/api/v2/pokemon/4/',
      id: 4,
    });
    expect(result.current.results[1].id).toBe(5);
    expect(result.current.isError).toBe(false);
  });

  it('filters out pokemon with id > 1025', async () => {
    mockFetchByType.mockResolvedValue(mockTypeResponse as any);
    const { result } = await renderHook(() => usePokemonTypeFilter('fire'), {
      wrapper: createWrapper(),
    });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.results.every((p) => p.id <= 1025)).toBe(true);
  });

  it('calls fetchPokemonByType with the given slug', async () => {
    mockFetchByType.mockResolvedValue(mockTypeResponse as any);
    const { result } = await renderHook(() => usePokemonTypeFilter('water'), {
      wrapper: createWrapper(),
    });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(mockFetchByType).toHaveBeenCalledWith('water');
    expect(mockFetchByType).toHaveBeenCalledTimes(1);
  });

  it('returns error state when fetch fails', async () => {
    mockFetchByType.mockRejectedValue(new Error('Network error'));
    const { result } = await renderHook(() => usePokemonTypeFilter('fire'), {
      wrapper: createWrapper(),
    });
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.results).toHaveLength(0);
  });
});

describe('usePokemonGenerationFilter', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('is disabled and returns empty results when genIndex is null', async () => {
    const { result } = await renderHook(() => usePokemonGenerationFilter(null), {
      wrapper: createWrapper(),
    });
    expect(result.current.results).toHaveLength(0);
    expect(result.current.isLoading).toBe(false);
    expect(mockFetchRange).not.toHaveBeenCalled();
  });

  it('fetches Gen 1 with correct offset and limit', async () => {
    mockFetchRange.mockResolvedValue({
      count: 151,
      next: null,
      previous: null,
      results: [
        { name: 'bulbasaur', url: 'https://pokeapi.co/api/v2/pokemon/1/' },
        { name: 'pikachu', url: 'https://pokeapi.co/api/v2/pokemon/25/' },
      ],
    });
    const { result } = await renderHook(() => usePokemonGenerationFilter(0), {
      wrapper: createWrapper(),
    });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(mockFetchRange).toHaveBeenCalledWith(0, 151);
    expect(result.current.results).toHaveLength(2);
    expect(result.current.results[0]).toEqual({
      name: 'bulbasaur',
      url: 'https://pokeapi.co/api/v2/pokemon/1/',
      id: 1,
    });
  });

  it('fetches Gen 2 with correct offset and limit', async () => {
    mockFetchRange.mockResolvedValue({
      count: 100,
      next: null,
      previous: null,
      results: [{ name: 'chikorita', url: 'https://pokeapi.co/api/v2/pokemon/152/' }],
    });
    const { result } = await renderHook(() => usePokemonGenerationFilter(1), {
      wrapper: createWrapper(),
    });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(mockFetchRange).toHaveBeenCalledWith(151, 100);
    expect(result.current.results[0].id).toBe(152);
  });

  it('returns error state when fetch fails', async () => {
    mockFetchRange.mockRejectedValue(new Error('Network error'));
    const { result } = await renderHook(() => usePokemonGenerationFilter(0), {
      wrapper: createWrapper(),
    });
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.results).toHaveLength(0);
  });
});
