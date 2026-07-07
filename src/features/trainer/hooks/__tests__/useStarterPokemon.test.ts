import React from 'react';
import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useStarterPokemon } from '../useStarterPokemon';
import * as pokeApi from '../../../../services/pokeApi';

jest.mock('../../../../services/pokeApi');

const mockFetch = pokeApi.fetchPokemonByType as jest.MockedFunction<typeof pokeApi.fetchPokemonByType>;

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

const mockTypeResponse = {
  pokemon: [
    { pokemon: { name: 'bulbasaur', url: 'https://pokeapi.co/api/v2/pokemon/1/' } },
    { pokemon: { name: 'charmander', url: 'https://pokeapi.co/api/v2/pokemon/4/' } },
  ],
};

describe('useStarterPokemon', () => {
  beforeEach(() => jest.clearAllMocks());

  afterEach(() => queryClient?.clear());

  it('retorna datos cuando el tipo es Fuego → fire', async () => {
    mockFetch.mockResolvedValue(mockTypeResponse as any);

    const { result } = await renderHook(() => useStarterPokemon('Fuego'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toMatchObject({
      id: expect.any(Number),
      name: expect.any(String),
      sprite: expect.stringContaining('https://'),
    });
    expect(mockFetch).toHaveBeenCalledWith('fire');
  });

  it('mapea el tipo Agua al slug water', async () => {
    mockFetch.mockResolvedValue(mockTypeResponse as any);

    const { result } = await renderHook(() => useStarterPokemon('Agua'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockFetch).toHaveBeenCalledWith('water');
  });

  it('mapea el tipo Planta al slug grass', async () => {
    mockFetch.mockResolvedValue(mockTypeResponse as any);

    const { result } = await renderHook(() => useStarterPokemon('Planta'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockFetch).toHaveBeenCalledWith('grass');
  });

  it('no ejecuta la query cuando el tipo es null', async () => {
    const { result } = await renderHook(() => useStarterPokemon(null), {
      wrapper: createWrapper(),
    });

    expect(result.current.fetchStatus).toBe('idle');
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('no ejecuta la query cuando el tipo es undefined', async () => {
    const { result } = await renderHook(() => useStarterPokemon(undefined), {
      wrapper: createWrapper(),
    });

    expect(result.current.fetchStatus).toBe('idle');
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('entra en estado error cuando la API falla', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'));

    const { result } = await renderHook(() => useStarterPokemon('Fuego'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeInstanceOf(Error);
  });
});
