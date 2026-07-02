import {
  capitalize,
  formatStatName,
  getPokemonIdFromUrl,
  getPokemonImageUrl,
  getTypeColor,
} from '../pokemonHelpers';

describe('capitalize', () => {
  it('capitaliza la primera letra', () => {
    expect(capitalize('bulbasaur')).toBe('Bulbasaur');
  });

  it('mantiene el resto en minúsculas', () => {
    expect(capitalize('pikachu')).toBe('Pikachu');
  });

  it('maneja string vacío sin error', () => {
    expect(capitalize('')).toBe('');
  });

  it('funciona con nombre ya capitalizado', () => {
    expect(capitalize('Charmander')).toBe('Charmander');
  });
});

describe('getPokemonIdFromUrl', () => {
  it('extrae el ID de una URL estándar de PokéAPI', () => {
    expect(getPokemonIdFromUrl('https://pokeapi.co/api/v2/pokemon/1/')).toBe(1);
  });

  it('extrae IDs de tres dígitos', () => {
    expect(getPokemonIdFromUrl('https://pokeapi.co/api/v2/pokemon/150/')).toBe(150);
  });

  it('extrae IDs de cuatro dígitos', () => {
    expect(getPokemonIdFromUrl('https://pokeapi.co/api/v2/pokemon/1010/')).toBe(1010);
  });
});

describe('getTypeColor', () => {
  it('retorna el color correcto para fuego', () => {
    expect(getTypeColor('fire')).toBe('#F08030');
  });

  it('retorna el color correcto para agua', () => {
    expect(getTypeColor('water')).toBe('#6890F0');
  });

  it('retorna el color fallback para un tipo desconocido', () => {
    expect(getTypeColor('unknown-type')).toBe('#A8A878');
  });

  it('retorna el color correcto para dragón', () => {
    expect(getTypeColor('dragon')).toBe('#7038F8');
  });
});

describe('formatStatName', () => {
  it('formatea HP en mayúsculas', () => {
    expect(formatStatName('hp')).toBe('HP');
  });

  it('traduce attack', () => {
    expect(formatStatName('attack')).toBe('Ataque');
  });

  it('traduce defense', () => {
    expect(formatStatName('defense')).toBe('Defensa');
  });

  it('traduce special-attack', () => {
    expect(formatStatName('special-attack')).toBe('Atq. Esp.');
  });

  it('traduce special-defense', () => {
    expect(formatStatName('special-defense')).toBe('Def. Esp.');
  });

  it('traduce speed', () => {
    expect(formatStatName('speed')).toBe('Velocidad');
  });

  it('capitaliza stats no mapeados', () => {
    expect(formatStatName('accuracy')).toBe('Accuracy');
  });
});

describe('getPokemonImageUrl', () => {
  it('genera la URL correcta para un ID dado', () => {
    expect(getPokemonImageUrl(25)).toBe(
      'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png'
    );
  });

  it('genera la URL correcta para el primer Pokémon', () => {
    expect(getPokemonImageUrl(1)).toBe(
      'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/1.png'
    );
  });
});
