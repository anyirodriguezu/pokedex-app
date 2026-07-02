import { useTrainerStore } from '../trainerStore';
import { Step1Data, Step2Data } from '../../features/trainer/types/trainer.types';

const step1Mock: Step1Data = { fullName: 'Ash Ketchum', age: 10, email: 'ash@pokemon.com' };
const step2Mock: Step2Data = { district: 'Kanto', favoritePokemonType: 'Fuego' };

beforeEach(() => {
  useTrainerStore.setState({ profile: null, step1Data: null, isEditing: false });
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

    expect(useTrainerStore.getState().profile).toEqual({ ...step1Mock, ...step2Mock });
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

    expect(useTrainerStore.getState().profile).toEqual({ ...step1Mock, ...step2Mock });
  });
});
