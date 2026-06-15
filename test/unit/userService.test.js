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

it.todo('El usuario devuelto NO incluye el campo password');