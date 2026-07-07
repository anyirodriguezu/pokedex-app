import React from 'react';
import { render } from '../../../../test-utils';
import { PokemonEvolutionChain } from '../PokemonEvolutionChain';
import type { EvolutionChainLink } from '../../types/pokemon.types';

const noop = jest.fn();

function makeChain(trigger: Partial<import('../../types/pokemon.types').EvolutionDetail> & { trigger: { name: string; url: string } }): EvolutionChainLink {
  return {
    species: { name: 'base', url: 'https://pokeapi.co/api/v2/pokemon-species/1/' },
    evolution_details: [],
    evolves_to: [
      {
        species: { name: 'evolved', url: 'https://pokeapi.co/api/v2/pokemon-species/2/' },
        evolution_details: [
          {
            min_level: null,
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
            ...trigger,
          },
        ],
        evolves_to: [],
      },
    ],
  };
}

describe('PokemonEvolutionChain — trigger labels', () => {
  it('use-item trigger with item name', async () => {
    const chain = makeChain({
      trigger: { name: 'use-item', url: '' },
      item: { name: 'fire-stone', url: '' },
    });
    const { getByText } = await render(
      <PokemonEvolutionChain chain={chain} currentId={1} onPress={noop} />
    );
    expect(getByText('Fire stone')).toBeTruthy();
  });

  it('use-item trigger without item falls back', async () => {
    const chain = makeChain({ trigger: { name: 'use-item', url: '' } });
    const { getByText } = await render(
      <PokemonEvolutionChain chain={chain} currentId={1} onPress={noop} />
    );
    expect(getByText('Objeto')).toBeTruthy();
  });

  it('trade trigger with held_item', async () => {
    const chain = makeChain({
      trigger: { name: 'trade', url: '' },
      held_item: { name: 'kings-rock', url: '' },
    });
    const { getByText } = await render(
      <PokemonEvolutionChain chain={chain} currentId={1} onPress={noop} />
    );
    expect(getByText(/Intercambio/)).toBeTruthy();
  });

  it('trade trigger with trade_species', async () => {
    const chain = makeChain({
      trigger: { name: 'trade', url: '' },
      trade_species: { name: 'shelmet', url: '' },
    });
    const { getByText } = await render(
      <PokemonEvolutionChain chain={chain} currentId={1} onPress={noop} />
    );
    expect(getByText(/Intercambio/)).toBeTruthy();
  });

  it('trade trigger without extra condition', async () => {
    const chain = makeChain({ trigger: { name: 'trade', url: '' } });
    const { getByText } = await render(
      <PokemonEvolutionChain chain={chain} currentId={1} onPress={noop} />
    );
    expect(getByText('Intercambio')).toBeTruthy();
  });

  it('level-up trigger with min_happiness', async () => {
    const chain = makeChain({
      trigger: { name: 'level-up', url: '' },
      min_happiness: 220,
    });
    const { getByText } = await render(
      <PokemonEvolutionChain chain={chain} currentId={1} onPress={noop} />
    );
    expect(getByText('Amistad ♥')).toBeTruthy();
  });

  it('level-up trigger with time_of_day night', async () => {
    const chain = makeChain({
      trigger: { name: 'level-up', url: '' },
      time_of_day: 'night',
    });
    const { getByText } = await render(
      <PokemonEvolutionChain chain={chain} currentId={1} onPress={noop} />
    );
    expect(getByText('Noche')).toBeTruthy();
  });

  it('level-up trigger with time_of_day day', async () => {
    const chain = makeChain({
      trigger: { name: 'level-up', url: '' },
      time_of_day: 'day',
    });
    const { getByText } = await render(
      <PokemonEvolutionChain chain={chain} currentId={1} onPress={noop} />
    );
    expect(getByText('Día')).toBeTruthy();
  });

  it('level-up trigger with needs_overworld_rain', async () => {
    const chain = makeChain({
      trigger: { name: 'level-up', url: '' },
      needs_overworld_rain: true,
    });
    const { getByText } = await render(
      <PokemonEvolutionChain chain={chain} currentId={1} onPress={noop} />
    );
    expect(getByText('Con lluvia')).toBeTruthy();
  });

  it('level-up trigger with turn_upside_down', async () => {
    const chain = makeChain({
      trigger: { name: 'level-up', url: '' },
      turn_upside_down: true,
    });
    const { getByText } = await render(
      <PokemonEvolutionChain chain={chain} currentId={1} onPress={noop} />
    );
    expect(getByText('Boca abajo')).toBeTruthy();
  });

  it('level-up trigger with no condition returns Nivel', async () => {
    const chain = makeChain({ trigger: { name: 'level-up', url: '' } });
    const { getByText } = await render(
      <PokemonEvolutionChain chain={chain} currentId={1} onPress={noop} />
    );
    expect(getByText('Nivel')).toBeTruthy();
  });

  it('shed trigger', async () => {
    const chain = makeChain({ trigger: { name: 'shed', url: '' } });
    const { getByText } = await render(
      <PokemonEvolutionChain chain={chain} currentId={1} onPress={noop} />
    );
    expect(getByText('Muda')).toBeTruthy();
  });

  it('spin trigger', async () => {
    const chain = makeChain({ trigger: { name: 'spin', url: '' } });
    const { getByText } = await render(
      <PokemonEvolutionChain chain={chain} currentId={1} onPress={noop} />
    );
    expect(getByText('Girar')).toBeTruthy();
  });

  it('other trigger returns Especial', async () => {
    const chain = makeChain({ trigger: { name: 'other', url: '' } });
    const { getByText } = await render(
      <PokemonEvolutionChain chain={chain} currentId={1} onPress={noop} />
    );
    expect(getByText('Especial')).toBeTruthy();
  });

  it('unknown trigger uses capitalized fallback', async () => {
    const chain = makeChain({ trigger: { name: 'agile-style-move', url: '' } });
    const { getByText } = await render(
      <PokemonEvolutionChain chain={chain} currentId={1} onPress={noop} />
    );
    expect(getByText('Agile style move')).toBeTruthy();
  });

  it('level-up with min_affection', async () => {
    const chain = makeChain({
      trigger: { name: 'level-up', url: '' },
      min_affection: 2,
    });
    const { getByText } = await render(
      <PokemonEvolutionChain chain={chain} currentId={1} onPress={noop} />
    );
    expect(getByText('Cariño ♥')).toBeTruthy();
  });

  it('level-up with known_move', async () => {
    const chain = makeChain({
      trigger: { name: 'level-up', url: '' },
      known_move: { name: 'double-hit', url: '' },
    });
    const { getByText } = await render(
      <PokemonEvolutionChain chain={chain} currentId={1} onPress={noop} />
    );
    expect(getByText('Mov: Double hit')).toBeTruthy();
  });

  it('level-up with location', async () => {
    const chain = makeChain({
      trigger: { name: 'level-up', url: '' },
      location: { name: 'mt-coronet', url: '' },
    });
    const { getByText } = await render(
      <PokemonEvolutionChain chain={chain} currentId={1} onPress={noop} />
    );
    expect(getByText('Mt coronet')).toBeTruthy();
  });
});
