import { step2Schema } from '../step2Schema';
import { District, PokemonType } from '../../types/trainer.types';

const validData = { district: 'Kanto' as District, favoritePokemonType: 'Fuego' as PokemonType };

describe('step2Schema — district', () => {
  it('acepta un distrito válido', async () => {
    await expect(step2Schema.validateAt('district', validData)).resolves.toBe('Kanto');
  });

  it('acepta todos los distritos permitidos', async () => {
    const distritos: District[] = ['Ate', 'Breña', 'Miraflores', 'Kanto', 'Johto'];
    for (const district of distritos) {
      await expect(
        step2Schema.validateAt('district', { ...validData, district })
      ).resolves.toBe(district);
    }
  });

  it('rechaza un distrito no permitido', async () => {
    await expect(
      step2Schema.validateAt('district', { ...validData, district: 'Sinnoh' as District })
    ).rejects.toThrow('Selecciona un distrito válido');
  });

  it('rechaza distrito vacío', async () => {
    await expect(
      step2Schema.validateAt('district', { ...validData, district: undefined as unknown as District })
    ).rejects.toThrow('El distrito es requerido');
  });
});

describe('step2Schema — favoritePokemonType', () => {
  it('acepta un tipo válido', async () => {
    await expect(step2Schema.validateAt('favoritePokemonType', validData)).resolves.toBe('Fuego');
  });

  it('acepta todos los tipos permitidos', async () => {
    const tipos: PokemonType[] = ['Fuego', 'Agua', 'Planta'];
    for (const favoritePokemonType of tipos) {
      await expect(
        step2Schema.validateAt('favoritePokemonType', { ...validData, favoritePokemonType })
      ).resolves.toBe(favoritePokemonType);
    }
  });

  it('rechaza un tipo no permitido', async () => {
    await expect(
      step2Schema.validateAt('favoritePokemonType', {
        ...validData,
        favoritePokemonType: 'Eléctrico' as PokemonType,
      })
    ).rejects.toThrow('Selecciona un tipo válido');
  });

  it('rechaza tipo vacío', async () => {
    await expect(
      step2Schema.validateAt('favoritePokemonType', {
        ...validData,
        favoritePokemonType: undefined as unknown as PokemonType,
      })
    ).rejects.toThrow('El tipo favorito es requerido');
  });
});

describe('step2Schema — objeto completo', () => {
  it('valida el objeto completo correctamente', async () => {
    await expect(step2Schema.validate(validData)).resolves.toMatchObject(validData);
  });

  it('rechaza objeto vacío con ambos errores', async () => {
    await expect(
      step2Schema.validate({}, { abortEarly: false })
    ).rejects.toMatchObject({
      inner: expect.arrayContaining([
        expect.objectContaining({ path: 'district' }),
        expect.objectContaining({ path: 'favoritePokemonType' }),
      ]),
    });
  });
});
