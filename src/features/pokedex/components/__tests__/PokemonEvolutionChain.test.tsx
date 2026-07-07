import React from 'react';
import { fireEvent } from '@testing-library/react-native';
import { render } from '../../../../test-utils';
import { PokemonEvolutionChain } from '../PokemonEvolutionChain';
import type { EvolutionChainLink } from '../../types/pokemon.types';

const bulbasaurChain: EvolutionChainLink = {
  species: { name: 'bulbasaur', url: 'https://pokeapi.co/api/v2/pokemon-species/1/' },
  evolution_details: [],
  evolves_to: [
    {
      species: { name: 'ivysaur', url: 'https://pokeapi.co/api/v2/pokemon-species/2/' },
      evolution_details: [
        {
          trigger: { name: 'level-up', url: '' },
          min_level: 16,
          min_happiness: null,
          min_affection: null,
          min_beauty: null,
          item: null,
          held_item: null,
          known_move: null,
          known_move_type: null,
          location: null,
          time_of_day: '',
          trade_species: null,
          turn_upside_down: false,
          needs_overworld_rain: false,
        },
      ],
      evolves_to: [
        {
          species: { name: 'venusaur', url: 'https://pokeapi.co/api/v2/pokemon-species/3/' },
          evolution_details: [
            {
              trigger: { name: 'level-up', url: '' },
              min_level: 32,
              min_happiness: null,
              min_affection: null,
              min_beauty: null,
              item: null,
              held_item: null,
              known_move: null,
              known_move_type: null,
              location: null,
              time_of_day: '',
              trade_species: null,
              turn_upside_down: false,
              needs_overworld_rain: false,
            },
          ],
          evolves_to: [],
        },
      ],
    },
  ],
};

const singleStageChain: EvolutionChainLink = {
  species: { name: 'ditto', url: 'https://pokeapi.co/api/v2/pokemon-species/132/' },
  evolution_details: [],
  evolves_to: [],
};

const mockOnPress = jest.fn();

describe('PokemonEvolutionChain', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all evolution stages', async () => {
    const { getByText } = await render(
      <PokemonEvolutionChain chain={bulbasaurChain} currentId={1} onPress={mockOnPress} />
    );
    expect(getByText('Bulbasaur')).toBeTruthy();
    expect(getByText('Ivysaur')).toBeTruthy();
    expect(getByText('Venusaur')).toBeTruthy();
  });

  it('shows the level trigger label', async () => {
    const { getByText } = await render(
      <PokemonEvolutionChain chain={bulbasaurChain} currentId={1} onPress={mockOnPress} />
    );
    expect(getByText('Nv. 16')).toBeTruthy();
    expect(getByText('Nv. 32')).toBeTruthy();
  });

  it('calls onPress with id and name when a non-current pokemon is pressed', async () => {
    const { getByText } = await render(
      <PokemonEvolutionChain chain={bulbasaurChain} currentId={1} onPress={mockOnPress} />
    );
    fireEvent.press(getByText('Ivysaur'));
    expect(mockOnPress).toHaveBeenCalledWith(2, 'ivysaur');
  });

  it('does not call onPress when the current pokemon is pressed', async () => {
    const { getByText } = await render(
      <PokemonEvolutionChain chain={bulbasaurChain} currentId={1} onPress={mockOnPress} />
    );
    fireEvent.press(getByText('Bulbasaur'));
    expect(mockOnPress).not.toHaveBeenCalled();
  });

  it('returns null for a single-stage chain', async () => {
    const { queryByText } = await render(
      <PokemonEvolutionChain chain={singleStageChain} currentId={132} onPress={mockOnPress} />
    );
    expect(queryByText('Cadena de evolución')).toBeNull();
  });

  it('shows the "Cadena de evolución" title for multi-stage chains', async () => {
    const { getByText } = await render(
      <PokemonEvolutionChain chain={bulbasaurChain} currentId={1} onPress={mockOnPress} />
    );
    expect(getByText('Cadena de evolución')).toBeTruthy();
  });
});
