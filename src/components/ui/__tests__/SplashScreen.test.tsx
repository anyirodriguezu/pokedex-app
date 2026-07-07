import React from 'react';
import { render } from '../../../test-utils';
import { GenericSplash, SplashScreen } from '../SplashScreen';
import type { TrainerProfile } from '../../../features/trainer/types/trainer.types';

const noop = jest.fn();

const profileWithStarter: TrainerProfile = {
  fullName: 'Ash Ketchum',
  age: 10,
  email: 'ash@pokemon.com',
  district: 'Kanto',
  favoritePokemonType: 'Fuego',
  starterPokemon: { id: 4, name: 'Charmander', sprite: 'https://example.com/4.png' },
};

const profileWithoutStarter: TrainerProfile = {
  ...profileWithStarter,
  starterPokemon: null,
};

describe('GenericSplash', () => {
  it('renderiza el título de la app', async () => {
    const { getByText } = await render(<GenericSplash onFinish={noop} />);
    expect(getByText('Pokédex App')).toBeTruthy();
  });

  it('renderiza el subtítulo', async () => {
    const { getByText } = await render(<GenericSplash onFinish={noop} />);
    expect(getByText('Tu aventura Pokémon comienza aquí')).toBeTruthy();
  });

  it('renderiza sin errores', async () => {
    await render(<GenericSplash onFinish={noop} />);
  });
});

describe('SplashScreen', () => {
  it('renderiza el nombre del entrenador', async () => {
    const { getByText } = await render(
      <SplashScreen profile={profileWithStarter} onFinish={noop} />
    );
    expect(getByText('Ash Ketchum!')).toBeTruthy();
  });

  it('renderiza el texto de bienvenida', async () => {
    const { getByText } = await render(
      <SplashScreen profile={profileWithStarter} onFinish={noop} />
    );
    expect(getByText(/Bienvenido de vuelta/)).toBeTruthy();
  });

  it('renderiza el sprite del starter cuando existe', async () => {
    const { getByLabelText } = await render(
      <SplashScreen profile={profileWithStarter} onFinish={noop} />
    );
    expect(getByLabelText('Charmander')).toBeTruthy();
  });

  it('no renderiza el sprite cuando no hay starter', async () => {
    const { queryByLabelText } = await render(
      <SplashScreen profile={profileWithoutStarter} onFinish={noop} />
    );
    expect(queryByLabelText('Charmander')).toBeNull();
  });

  it('renderiza el subtítulo de aventura', async () => {
    const { getByText } = await render(
      <SplashScreen profile={profileWithStarter} onFinish={noop} />
    );
    expect(getByText('Tu aventura Pokémon continúa ✨')).toBeTruthy();
  });
});
