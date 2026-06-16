import { describe, it, expect, vi, beforeEach } from 'vitest';
import { register, login } from '../../src/services/userService';

// Llamar a mi funcion de register
// La función se ejecutará normalmente
// Cuando llegue a la linea 63 no va a llamar a userRepository original, será un mock. 
// El resto de la función se ejecute normalmente

// ------
// Mock Setup
vi.mock('../../src/infra/userRepository.js');
vi.mock('../../src/infra/hashPassword.js');

import * as userRepositoy from '../../src/infra/userRepository.js';
import * as hashPasswordModule from '../../src/infra/hashPassword.js';
// ------

const VALID_PASSWORD = 'SecurePass1';
const HASHED_PASSWORD = '$2b$10$hashedValueSimulado';
const VALID_EMAIL     = 'nuevo@example.com';
const CREATED_USER = {
  id: 'uuid-generado-123', username: 'nuevo',
  email: VALID_EMAIL, password: HASHED_PASSWORD,
  createdAt: '2024-01-01T00:00:00.000Z',
};

// Testing suite

beforeEach(() => {
    vi.clearAllMocks();

    // Stub Functions / Values

    // STUB hashPassword siempre devuelve el hash de la VAR
    hashPasswordModule.hashPassword.mockResolvedValue(HASHED_PASSWORD);

    // STUB findOne devuelve null por defecto
    userRepositoy.findOne.mockResolvedValue(null);

    // STUB create devuelve el usuario de la VAR
    userRepositoy.create.mockResolvedValue(CREATED_USER);
    // userRepositoy.create.mockImplementation(async () => CREATED_USER);

});

it('registra a un usuario con email y password válidos', async () => {
    const result = await register({
        email: VALID_EMAIL,
        password: VALID_PASSWORD
    });

    expect(result).toHaveProperty('id');
    expect(result.id).toBe(CREATED_USER.id);
    expect(result).toHaveProperty('username');
});

it('El usuario devuelto NO incluye el campo password', async () => {
    const result = await register({
        email: VALID_EMAIL,
        password: VALID_PASSWORD
    });
    expect(result).not.toHaveProperty('password');
});

it('lanza un error DUPLICATE si el usuario ya esta registrado', async () => {
    // Mock que se ejecuta una sola vez
    userRepositoy.findOne.mockResolvedValueOnce({ id: 'x', email: 'admin@example.com' });

    await expect(
        register({ email: 'admin@example.com', password: VALID_PASSWORD })
    ).rejects.toMatchObject({ code: 'DUPLICATE', status: 409 });
})


describe('register - SPY sobre hashPassword', () => {

    it('llama a hashPassword con el password en texto plano', async () => {
        const result = await register({
            email: VALID_EMAIL,
            password: VALID_PASSWORD
        });

        expect(hashPasswordModule.hashPassword).toHaveBeenCalled();
        expect(hashPasswordModule.hashPassword).toHaveBeenCalledWith(VALID_PASSWORD);
    });

    it('llama a hashPassword UNA sola vez', async () => {
        const result = await register({
            email: VALID_EMAIL,
            password: VALID_PASSWORD
        });

        expect(hashPasswordModule.hashPassword).toHaveBeenCalledTimes(1);
    });

});

// Como verifico que el password se guarda SIEMPRE en su version HASH.
// userRepository.create() ... recibe HASH, no PW.
it('userRepository.create recibe el password HASHEADO, no en plano', async () => {
    const result = await register({
        email: VALID_EMAIL,
        password: VALID_PASSWORD
    });

    const createCallArgs = userRepositoy.create.mock.calls[0][0];
    // Array donde se guardan todas las llamadas.
    // A su vez, cada llamada guarda un array con parametros.
    /**
     * [
     *  [{username: 'nuevo', email: 'nuevo@example.com', password: 'password'}]
     * ]
     */
    expect(createCallArgs.password).toBe(HASHED_PASSWORD);
    expect(createCallArgs.password).not.toBe(VALID_PASSWORD);
});

it('no llamamos a comparePassword si el usuario no existe', async () => {
    try {
        await login({ email: 'noexiste@error.com', password: 'noexiste' });
    } catch (e) { }

    // Nos interesa el Spy, no la excepción
    expect(hashPasswordModule.comparePassword).not.toHaveBeenCalled();
});

