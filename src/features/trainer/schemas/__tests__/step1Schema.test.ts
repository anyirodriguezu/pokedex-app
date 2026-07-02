import { step1Schema } from '../step1Schema';

const validData = { fullName: 'Ash Ketchum', age: 10, email: 'ash@pokemon.com' };

describe('step1Schema — fullName', () => {
  it('acepta un nombre válido', async () => {
    await expect(step1Schema.validateAt('fullName', validData)).resolves.toBe('Ash Ketchum');
  });

  it('rechaza nombre indefinido', async () => {
    await expect(
      step1Schema.validateAt('fullName', { ...validData, fullName: undefined as unknown as string })
    ).rejects.toThrow('El nombre es requerido');
  });

  it('rechaza nombre con menos de 3 caracteres', async () => {
    await expect(
      step1Schema.validateAt('fullName', { ...validData, fullName: 'Ax' })
    ).rejects.toThrow('El nombre debe tener al menos 3 caracteres');
  });

  it('acepta nombre con exactamente 3 caracteres', async () => {
    await expect(
      step1Schema.validateAt('fullName', { ...validData, fullName: 'Ash' })
    ).resolves.toBe('Ash');
  });
});

describe('step1Schema — age', () => {
  it('acepta edad válida (10)', async () => {
    await expect(step1Schema.validateAt('age', validData)).resolves.toBe(10);
  });

  it('acepta edad mayor a 10', async () => {
    await expect(
      step1Schema.validateAt('age', { ...validData, age: 25 })
    ).resolves.toBe(25);
  });

  it('rechaza edad menor a 10', async () => {
    await expect(
      step1Schema.validateAt('age', { ...validData, age: 9 })
    ).rejects.toThrow('Debes tener al menos 10 años');
  });

  it('rechaza texto como edad', async () => {
    await expect(
      step1Schema.validateAt('age', { ...validData, age: 'doce' as unknown as number })
    ).rejects.toThrow('La edad debe ser un número');
  });

  it('rechaza edad vacía', async () => {
    await expect(
      step1Schema.validateAt('age', { ...validData, age: undefined as unknown as number })
    ).rejects.toThrow('La edad es requerida');
  });
});

describe('step1Schema — email', () => {
  it('acepta email válido', async () => {
    await expect(step1Schema.validateAt('email', validData)).resolves.toBe('ash@pokemon.com');
  });

  it('rechaza email sin @', async () => {
    await expect(
      step1Schema.validateAt('email', { ...validData, email: 'ashpokemon.com' })
    ).rejects.toThrow('Ingresa un email válido');
  });

  it('rechaza email sin dominio', async () => {
    await expect(
      step1Schema.validateAt('email', { ...validData, email: 'ash@' })
    ).rejects.toThrow('Ingresa un email válido');
  });

  it('rechaza email vacío', async () => {
    await expect(
      step1Schema.validateAt('email', { ...validData, email: '' })
    ).rejects.toThrow('El email es requerido');
  });
});

describe('step1Schema — objeto completo', () => {
  it('valida el objeto completo correctamente', async () => {
    await expect(step1Schema.validate(validData)).resolves.toMatchObject(validData);
  });

  it('rechaza objeto con múltiples errores en modo abortEarly false', async () => {
    await expect(
      step1Schema.validate({ fullName: '', age: 5, email: 'no-email' }, { abortEarly: false })
    ).rejects.toMatchObject({
      inner: expect.arrayContaining([
        expect.objectContaining({ path: 'fullName' }),
        expect.objectContaining({ path: 'age' }),
        expect.objectContaining({ path: 'email' }),
      ]),
    });
  });
});
