import { useTrainerStore } from '../trainerStore';
import { CapturedPokemon, Step1Data, Step2Data } from '../../features/trainer/types/trainer.types';

const step1Mock: Step1Data = { fullName: 'Ash Ketchum', age: 10, email: 'ash@pokemon.com' };
const step2Mock: Step2Data = { district: 'Kanto', favoritePokemonType: 'Fuego' };
const pikachuMock: CapturedPokemon = { id: 25, name: 'Pikachu', sprite: 'https://example.com/25.png' };
const charmanderMock: CapturedPokemon = { id: 4, name: 'Charmander', sprite: 'https://example.com/4.png' };

const buildProfile = () => {
  useTrainerStore.getState().setStep1Data(step1Mock);
  useTrainerStore.getState().setStep2Data(step2Mock);
};

beforeEach(() => {
  useTrainerStore.setState({
    profile: null,
    step1Data: null,
    isEditing: false,
    activeTeam: [],
    box: [],
    hasSeenSplash: false,
  });
});

describe('estado inicial', () => {
  it('inicia con perfil nulo', () => {
    expect(useTrainerStore.getState().profile).toBeNull();
  });

  it('inicia con step1Data nulo', () => {
    expect(useTrainerStore.getState().step1Data).toBeNull();
  });

  it('inicia en modo creación', () => {
    expect(useTrainerStore.getState().isEditing).toBe(false);
  });
});

describe('setStep1Data', () => {
  it('guarda los datos del paso 1', () => {
    useTrainerStore.getState().setStep1Data(step1Mock);
    expect(useTrainerStore.getState().step1Data).toEqual(step1Mock);
  });

  it('no crea el perfil al guardar solo paso 1', () => {
    useTrainerStore.getState().setStep1Data(step1Mock);
    expect(useTrainerStore.getState().profile).toBeNull();
  });
});

describe('setStep2Data', () => {
  it('crea el perfil completo combinando step1 y step2', () => {
    useTrainerStore.getState().setStep1Data(step1Mock);
    useTrainerStore.getState().setStep2Data(step2Mock);

    expect(useTrainerStore.getState().profile).toEqual({
      ...step1Mock,
      ...step2Mock,
      starterPokemon: null,
    });
  });

  it('no crea perfil si step1Data es null', () => {
    useTrainerStore.getState().setStep2Data(step2Mock);
    expect(useTrainerStore.getState().profile).toBeNull();
  });
});

describe('resetProfile', () => {
  it('limpia perfil, step1Data e isEditing', () => {
    useTrainerStore.getState().setStep1Data(step1Mock);
    useTrainerStore.getState().setStep2Data(step2Mock);
    useTrainerStore.getState().startEdit();

    useTrainerStore.getState().resetProfile();

    const { profile, step1Data, isEditing } = useTrainerStore.getState();
    expect(profile).toBeNull();
    expect(step1Data).toBeNull();
    expect(isEditing).toBe(false);
  });
});

describe('startEdit', () => {
  it('activa el modo edición', () => {
    useTrainerStore.getState().startEdit();
    expect(useTrainerStore.getState().isEditing).toBe(true);
  });
});

describe('startCreate', () => {
  it('desactiva el modo edición y limpia step1Data', () => {
    useTrainerStore.getState().setStep1Data(step1Mock);
    useTrainerStore.getState().startEdit();

    useTrainerStore.getState().startCreate();

    expect(useTrainerStore.getState().isEditing).toBe(false);
    expect(useTrainerStore.getState().step1Data).toBeNull();
  });

  it('no borra el perfil al iniciar creación', () => {
    useTrainerStore.getState().setStep1Data(step1Mock);
    useTrainerStore.getState().setStep2Data(step2Mock);

    useTrainerStore.getState().startCreate();

    expect(useTrainerStore.getState().profile).toEqual({
      ...step1Mock,
      ...step2Mock,
      starterPokemon: null,
    });
  });
});

describe('capture', () => {
  it('agrega un Pokémon al activeTeam si hay espacio', () => {
    useTrainerStore.getState().capture(pikachuMock);
    expect(useTrainerStore.getState().activeTeam).toHaveLength(1);
    expect(useTrainerStore.getState().activeTeam[0]).toEqual(pikachuMock);
  });

  it('no duplica un Pokémon ya capturado', () => {
    useTrainerStore.getState().capture(pikachuMock);
    useTrainerStore.getState().capture(pikachuMock);
    const { activeTeam, box } = useTrainerStore.getState();
    expect(activeTeam.length + box.length).toBe(1);
  });

  it('permite capturar varios Pokémon distintos', () => {
    useTrainerStore.getState().capture(pikachuMock);
    useTrainerStore.getState().capture(charmanderMock);
    const { activeTeam } = useTrainerStore.getState();
    expect(activeTeam).toHaveLength(2);
  });
});

describe('isCaptured', () => {
  it('retorna true para un Pokémon en activeTeam', () => {
    useTrainerStore.getState().capture(pikachuMock);
    expect(useTrainerStore.getState().isCaptured(25)).toBe(true);
  });

  it('retorna true para un Pokémon en box', () => {
    useTrainerStore.getState().captureToBox(pikachuMock);
    expect(useTrainerStore.getState().isCaptured(25)).toBe(true);
  });

  it('retorna false para un Pokémon no capturado', () => {
    expect(useTrainerStore.getState().isCaptured(25)).toBe(false);
  });

  it('retorna false después de liberar', () => {
    useTrainerStore.getState().capture(pikachuMock);
    useTrainerStore.getState().release(25);
    expect(useTrainerStore.getState().isCaptured(25)).toBe(false);
  });
});

describe('release', () => {
  it('elimina el Pokémon del activeTeam', () => {
    useTrainerStore.getState().capture(pikachuMock);
    useTrainerStore.getState().capture(charmanderMock);

    useTrainerStore.getState().release(25);

    const { activeTeam } = useTrainerStore.getState();
    expect(activeTeam).toHaveLength(1);
    expect(activeTeam[0].id).toBe(4);
  });

  it('elimina el Pokémon del box', () => {
    useTrainerStore.getState().captureToBox(pikachuMock);
    useTrainerStore.getState().release(25);
    expect(useTrainerStore.getState().box).toHaveLength(0);
  });

  it('no lanza error si el id no existe', () => {
    useTrainerStore.getState().capture(pikachuMock);
    expect(() => useTrainerStore.getState().release(999)).not.toThrow();
    expect(useTrainerStore.getState().activeTeam).toHaveLength(1);
  });
});

describe('moveToTeam / moveToBox / swapPokemon', () => {
  it('mueve un pokémon de box a activeTeam', () => {
    useTrainerStore.getState().captureToBox(pikachuMock);
    useTrainerStore.getState().moveToTeam(25);
    expect(useTrainerStore.getState().activeTeam).toHaveLength(1);
    expect(useTrainerStore.getState().box).toHaveLength(0);
  });

  it('mueve un pokémon de activeTeam a box', () => {
    useTrainerStore.getState().capture(pikachuMock);
    useTrainerStore.getState().moveToBox(25);
    expect(useTrainerStore.getState().activeTeam).toHaveLength(0);
    expect(useTrainerStore.getState().box).toHaveLength(1);
  });

  it('intercambia pokémon entre box y activeTeam', () => {
    useTrainerStore.getState().capture(pikachuMock);
    useTrainerStore.getState().captureToBox(charmanderMock);
    useTrainerStore.getState().swapPokemon(4, 25);
    expect(useTrainerStore.getState().activeTeam[0].id).toBe(4);
    expect(useTrainerStore.getState().box[0].id).toBe(25);
  });
});

describe('setStarterPokemon', () => {
  it('asigna el starter al perfil existente', () => {
    buildProfile();
    useTrainerStore.getState().setStarterPokemon(pikachuMock);
    expect(useTrainerStore.getState().profile?.starterPokemon).toEqual(pikachuMock);
  });

  it('desactiva isEditing al asignar el starter', () => {
    buildProfile();
    useTrainerStore.getState().startEdit();
    useTrainerStore.getState().setStarterPokemon(pikachuMock);
    expect(useTrainerStore.getState().isEditing).toBe(false);
  });

  it('no hace nada si no hay perfil', () => {
    useTrainerStore.getState().setStarterPokemon(pikachuMock);
    expect(useTrainerStore.getState().profile).toBeNull();
  });
});

describe('releaseStarterPokemon', () => {
  it('pone starterPokemon en null sin borrar el perfil', () => {
    buildProfile();
    useTrainerStore.getState().setStarterPokemon(pikachuMock);

    useTrainerStore.getState().releaseStarterPokemon();

    expect(useTrainerStore.getState().profile?.starterPokemon).toBeNull();
    expect(useTrainerStore.getState().profile?.fullName).toBe('Ash Ketchum');
  });

  it('no lanza error si no hay perfil', () => {
    expect(() => useTrainerStore.getState().releaseStarterPokemon()).not.toThrow();
  });
});

describe('setHasSeenSplash', () => {
  it('activa la flag a true', () => {
    useTrainerStore.getState().setHasSeenSplash(true);
    expect(useTrainerStore.getState().hasSeenSplash).toBe(true);
  });

  it('puede volver a false', () => {
    useTrainerStore.getState().setHasSeenSplash(true);
    useTrainerStore.getState().setHasSeenSplash(false);
    expect(useTrainerStore.getState().hasSeenSplash).toBe(false);
  });
});

describe('resetProfile', () => {
  it('también resetea hasSeenSplash', () => {
    useTrainerStore.getState().setHasSeenSplash(true);
    useTrainerStore.getState().resetProfile();
    expect(useTrainerStore.getState().hasSeenSplash).toBe(false);
  });
});
