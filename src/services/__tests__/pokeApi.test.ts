import {
  fetchPokemonList,
  fetchPokemonDetail,
  fetchPokemonByType,
  fetchPokemonRange,
  fetchPokemonSpecies,
  fetchEvolutionChain,
} from '../pokeApi';

const mockFetch = jest.fn();
global.fetch = mockFetch;

function mockOkResponse(data: unknown) {
  mockFetch.mockResolvedValueOnce({
    ok: true,
    json: () => Promise.resolve(data),
  });
}

function mockErrorResponse() {
  mockFetch.mockResolvedValueOnce({ ok: false });
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe('fetchPokemonList', () => {
  it('returns the list response', async () => {
    const data = { count: 1, next: null, previous: null, results: [] };
    mockOkResponse(data);
    const result = await fetchPokemonList(0);
    expect(result).toEqual(data);
    expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('offset=0'));
  });

  it('uses the default offset 0 when not provided', async () => {
    mockOkResponse({ count: 0, next: null, previous: null, results: [] });
    await fetchPokemonList();
    expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('offset=0'));
  });

  it('throws on HTTP error', async () => {
    mockErrorResponse();
    await expect(fetchPokemonList()).rejects.toThrow();
  });
});

describe('fetchPokemonDetail', () => {
  it('returns the pokemon detail', async () => {
    const data = { id: 25, name: 'pikachu' };
    mockOkResponse(data);
    const result = await fetchPokemonDetail(25);
    expect(result).toEqual(data);
    expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/pokemon/25'));
  });

  it('throws on HTTP error', async () => {
    mockErrorResponse();
    await expect(fetchPokemonDetail(999)).rejects.toThrow();
  });
});

describe('fetchPokemonByType', () => {
  it('returns the type response', async () => {
    const data = { id: 10, name: 'fire', pokemon: [] };
    mockOkResponse(data);
    const result = await fetchPokemonByType('fire');
    expect(result).toEqual(data);
    expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/type/fire'));
  });

  it('throws on HTTP error', async () => {
    mockErrorResponse();
    await expect(fetchPokemonByType('fire')).rejects.toThrow();
  });
});

describe('fetchPokemonRange', () => {
  it('fetches with correct offset and limit', async () => {
    const data = { count: 151, next: null, previous: null, results: [] };
    mockOkResponse(data);
    const result = await fetchPokemonRange(0, 151);
    expect(result).toEqual(data);
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('offset=0') && expect.stringContaining('limit=151')
    );
  });

  it('throws on HTTP error', async () => {
    mockErrorResponse();
    await expect(fetchPokemonRange(0, 20)).rejects.toThrow();
  });
});

describe('fetchPokemonSpecies', () => {
  it('returns species data', async () => {
    const data = { id: 1, name: 'bulbasaur' };
    mockOkResponse(data);
    const result = await fetchPokemonSpecies(1);
    expect(result).toEqual(data);
    expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('pokemon-species/1'));
  });

  it('throws on HTTP error', async () => {
    mockErrorResponse();
    await expect(fetchPokemonSpecies(1)).rejects.toThrow();
  });
});

describe('fetchEvolutionChain', () => {
  it('fetches by full URL', async () => {
    const url = 'https://pokeapi.co/api/v2/evolution-chain/1/';
    const data = { id: 1, chain: {} };
    mockOkResponse(data);
    const result = await fetchEvolutionChain(url);
    expect(result).toEqual(data);
    expect(mockFetch).toHaveBeenCalledWith(url);
  });

  it('throws on HTTP error', async () => {
    mockErrorResponse();
    await expect(fetchEvolutionChain('https://pokeapi.co/api/v2/evolution-chain/1/')).rejects.toThrow();
  });
});
