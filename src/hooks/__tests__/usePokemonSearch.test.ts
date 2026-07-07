import React from 'react';
import { renderHook, act } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { usePokemonSearch } from '../usePokemonSearch';

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

const samplePokemons = [
  { id: 1, name: 'bulbasaur', url: 'https://pokeapi.co/api/v2/pokemon/1/' },
  { id: 4, name: 'charmander', url: 'https://pokeapi.co/api/v2/pokemon/4/' },
  { id: 25, name: 'pikachu', url: 'https://pokeapi.co/api/v2/pokemon/25/' },
];

describe('usePokemonSearch', () => {
  beforeEach(() => jest.useFakeTimers());

  afterEach(() => {
    jest.runAllTimers();
    jest.useRealTimers();
    queryClient.clear();
  });

  it('returns all cached pokemons when search term is empty', async () => {
    const { result } = await renderHook(() => usePokemonSearch(samplePokemons), {
      wrapper: createWrapper(),
    });
    expect(result.current.localResults).toEqual(samplePokemons);
    expect(result.current.isSearching).toBe(false);
    expect(result.current.rawTerm).toBe('');
  });

  it('sets isSearching true and rawTerm on input', async () => {
    const { result } = await renderHook(() => usePokemonSearch(samplePokemons), {
      wrapper: createWrapper(),
    });
    await act(async () => {
      result.current.handleSearchChange('bul');
    });
    expect(result.current.rawTerm).toBe('bul');
    expect(result.current.isSearching).toBe(true);
  });

  it('is debouncing before the 400ms timer fires', async () => {
    const { result } = await renderHook(() => usePokemonSearch(samplePokemons), {
      wrapper: createWrapper(),
    });
    await act(async () => {
      result.current.handleSearchChange('bul');
    });
    expect(result.current.isDebouncing).toBe(true);
    expect(result.current.debouncedTerm).toBe('');
  });

  it('filters by name after the debounce delay', async () => {
    const { result } = await renderHook(() => usePokemonSearch(samplePokemons), {
      wrapper: createWrapper(),
    });
    await act(async () => {
      result.current.handleSearchChange('bulb');
    });
    await act(async () => {
      jest.advanceTimersByTime(400);
    });
    expect(result.current.localResults).toHaveLength(1);
    expect(result.current.localResults[0].name).toBe('bulbasaur');
  });

  it('filters by pokemon id after the debounce delay', async () => {
    const { result } = await renderHook(() => usePokemonSearch(samplePokemons), {
      wrapper: createWrapper(),
    });
    await act(async () => {
      result.current.handleSearchChange('25');
    });
    await act(async () => {
      jest.advanceTimersByTime(400);
    });
    expect(result.current.localResults).toHaveLength(1);
    expect(result.current.localResults[0].name).toBe('pikachu');
  });

  it('search is case-insensitive', async () => {
    const { result } = await renderHook(() => usePokemonSearch(samplePokemons), {
      wrapper: createWrapper(),
    });
    await act(async () => {
      result.current.handleSearchChange('CHAR');
    });
    await act(async () => {
      jest.advanceTimersByTime(400);
    });
    expect(result.current.localResults).toHaveLength(1);
    expect(result.current.localResults[0].name).toBe('charmander');
  });

  it('clearSearch resets rawTerm and isSearching', async () => {
    const { result } = await renderHook(() => usePokemonSearch(samplePokemons), {
      wrapper: createWrapper(),
    });
    await act(async () => {
      result.current.handleSearchChange('char');
    });
    await act(async () => {
      result.current.clearSearch();
    });
    expect(result.current.rawTerm).toBe('');
    expect(result.current.isSearching).toBe(false);
  });

  it('clearSearch restores full list after debounce fired', async () => {
    const { result } = await renderHook(() => usePokemonSearch(samplePokemons), {
      wrapper: createWrapper(),
    });
    await act(async () => {
      result.current.handleSearchChange('char');
    });
    await act(async () => {
      jest.advanceTimersByTime(400);
    });
    expect(result.current.debouncedTerm).toBe('char');
    await act(async () => {
      result.current.clearSearch();
    });
    expect(result.current.localResults).toEqual(samplePokemons);
  });
});
