import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { login } from '../../src/services/userService.js';

// TODO: Mock de dependencias
vi.mock('../../src/infra/userRepository.js');
vi.mock('../../src/infra/hashPassword.js');

import * as userRepository from '../../src/infra/userRepository.js';
import * as hashPasswordModule from '../../src/infra/hashPassword.js';

// Setup de variables
const HASHED_PASSWORD = '$2b$10$hashedValueSimulado';
const VALID_EMAIL     = 'nuevo@example.com';
const VALID_PASSWORD  = 'SecurePass1';

const LOCK_DURATION_MS = 15 * 60 * 1000;
const LOCK_THRESHOLD = 3;

// Aislar individualmente cada test
beforeEach(() => {
    vi.clearAllTimers();
    vi.clearAllMocks();
});

afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
});

describe('CA1 - bloqueo tras 3 intentos fallidos consecutivos', () => {

    it('Tras el 3r intento, llama a updateOne con lockedUntil = now + 15 min', async () => {
        const NOW = new Date('2021-06-01T10:00:00.000Z').getTime();
        vi.setSystemTime(NOW);

        const userWith2Fail = {
            id: 'user-id-2',
            email: VALID_EMAIL,
            password: HASHED_PASSWORD,
            lockedUntil: null,
            failedAttempts: 2
        };
        userRepository.findOne.mockResolvedValueOnce(userWith2Fail);
        hashPasswordModule.comparePassword.mockResolvedValueOnce(false);
        userRepository.updateOne.mockResolvedValueOnce({ ...userWith2Fail });

        try {
            await login({ email: VALID_EMAIL, password: 'error-pw' });
        } catch (e) { }

        expect(userRepository.updateOne).toHaveBeenCalledWith(
            { id: 'user-id-2' },
            {
                failedAttempts: 3,
                lockedUntil: NOW + LOCK_DURATION_MS,
            }
        );
    });

    it('tras el 1r intento fallido, incrementa failedAttempts pero NO establece lockedUntil', async () => {
        const NOW = new Date('2021-06-01T10:00:00.000Z').getTime();
        vi.setSystemTime(NOW);

        const freshUser = {
            id: 'user-id-2',
            email: VALID_EMAIL,
            password: HASHED_PASSWORD,
            lockedUntil: null,
            failedAttempts: 0
        };

        userRepository.findOne.mockResolvedValueOnce(freshUser);
        hashPasswordModule.comparePassword.mockResolvedValueOnce(false);
        userRepository.updateOne.mockResolvedValueOnce({ ...freshUser });

        try {
            await login({ email: VALID_EMAIL, password: 'error-pw' });
        } catch (e) { }

        expect(userRepository.updateOne).toHaveBeenCalledWith(
            { id: 'user-id-2' },
            { failedAttempts: 1 }
        );

        // El 1r intento NO bloquea
        const callArgs = userRepository.updateOne.mock.calls[0][1];
        expect(callArgs.lockedUntil).toBeUndefined();

    });
});

describe('CA2 - Login exitoso reseta los contadores de bloqueo', () => {

    it('si el usuario tenia failedAttempts > 0, llama a updateOne con failedAttempts: 0 y lockedUntil: null', async () => {
        const userWithFails = {
            id: 'user-id-3',
            email: VALID_EMAIL,
            password: HASHED_PASSWORD,
            lockedUntil: null,
            failedAttempts: 2
        };

        userRepository.findOne.mockResolvedValueOnce(userWithFails);
        hashPasswordModule.comparePassword.mockResolvedValueOnce(true);
        userRepository.updateOne.mockResolvedValueOnce({ ...userWithFails });

        await login({ email: VALID_EMAIL, password: VALID_PASSWORD });

        expect(userRepository.updateOne).toHaveBeenCalledWith(
           { id: 'user-id-3' },
           { failedAttempts: 0, lockedUntil: null } 
        );

    });

});

describe('CA3 - cuenta bloqueada rechaza login (error LOCKED 423)', () => {

    // Verificar que esto explota
    it('si lockedUntil es futuro, lanza error LOCKED status 423', async () => {
        const NOW = new Date('2021-06-01T10:00:00.000Z').getTime();
        vi.setSystemTime(NOW);

        const userLocked = {
            id: 'user-id-4',
            email: VALID_EMAIL,
            password: HASHED_PASSWORD,
            lockedUntil: NOW + LOCK_DURATION_MS,
            failedAttempts: 3
        };

        userRepository.findOne.mockResolvedValueOnce(userLocked);

        await expect(
             login({ email: VALID_EMAIL, password: VALID_PASSWORD })
        ).rejects.toMatchObject({ code: 'LOCKED', status: 423 });
    });

    it('el error LOCKED se lanza ANTES de comparar el password (sin llamar a comparePassword)', async () => {
        const NOW = new Date('2021-06-01T10:00:00.000Z').getTime();
        vi.setSystemTime(NOW);

        const userLocked = {
            id: 'user-id-5',
            email: VALID_EMAIL,
            password: HASHED_PASSWORD,
            lockedUntil: NOW + LOCK_DURATION_MS,
            failedAttempts: 3
        };

        userRepository.findOne.mockResolvedValueOnce(userLocked);

        try {
            await login({ email: VALID_EMAIL, password: VALID_PASSWORD });
        } catch (e) { }

        expect(hashPasswordModule.comparePassword).not.toHaveBeenCalled();

    });

});

describe('CA4 - el bloqueo expira automaticamente tras 15 minuts', () => {

    it('tras login exitoso con cuenta expirada, llama a updateOne para limpiar contadores', async () => {
        const NOW = new Date('2021-06-01T10:00:00.000Z').getTime();
        vi.setSystemTime(NOW);

        const expiredUserLocked = {
            id: 'user-id-6',
            email: VALID_EMAIL,
            password: HASHED_PASSWORD,
            lockedUntil: NOW - 1000, // Expiró hace 1sec
            failedAttempts: 3
        };

        userRepository.findOne.mockResolvedValueOnce(expiredUserLocked);
        hashPasswordModule.comparePassword.mockResolvedValueOnce(true);
        userRepository.updateOne.mockResolvedValueOnce({ ...expiredUserLocked });

        await login({ email: VALID_EMAIL, password: VALID_PASSWORD });

        expect(userRepository.updateOne).toHaveBeenCalledWith(
            { id: 'user-id-6' },
            { lockedUntil: null, failedAttempts: 0 }
        )

    })
})
