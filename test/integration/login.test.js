import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';

import app from '../../src/app.js';
import { reset } from '../../src/infra/fakeDb.js';

const TEST_EMAIL = 'login.test@example.com';
const TEST_PASSWORD = 'ValidPass1';

async function loginUser(email, password) {
    return request(app)
        .post('/login')
        .send({ email, password });
}

async function registerUser(email, password) {
    return request(app)
        .post('/register')
        .send({ email, password });
}

beforeEach( async () => {
    await reset();
});

describe('POST /login - Happy Path', () => {

    it('devuelve 200 con el usuario autenticado tras registrarse', async () => {
        const resRegister = await registerUser(TEST_EMAIL, TEST_PASSWORD);

        expect(resRegister.status).toBe(201);

        const res = await loginUser(TEST_EMAIL, TEST_PASSWORD);

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('email', TEST_EMAIL);
        expect(res.body).not.toHaveProperty('password');

        
    });

    it('funciona con usuarios del seed (admin@example.com - Admin1234)', async () => {
        const res = await loginUser('admin@example.com', 'Admin1234');

         expect(res.status).toBe(200);
    });

});

describe('POST /login - gestión de errores', () => {

    // Si el email no existe -> 401
    it('devuelve 401 si el email no esta registrado', async () => {
        const res = await loginUser('inexistente@example.com', 'Admin1234');

        expect(res.status).toBe(401);
        expect(res.body).toHaveProperty('error');
    });

    // Si la pw es incorrecta -> 401
    it('devuelve 401 si la password es incorrecta', async () => {
        const res = await loginUser('admin@example.com', 'ErrorPw123');

        expect(res.status).toBe(401);
        expect(res.body).toHaveProperty('error');
    });

    // En ambos casos el mensaje es idéntico
    it('el mensaje de error es idéntico para usuario inexistente y password incorrecto', async () => {
        const resErrorPw = await loginUser('admin@example.com', 'ErrorPw123');
        const resNoUser = await loginUser('inexistente@example.com', 'Admin1234');

        expect(resErrorPw.status).toBe(401);
        expect(resNoUser.status).toBe(401);
        expect(resErrorPw.body.error).toBe(resNoUser.body.error);
    });

    it('tras 3 fallos de login seguidos, se bloquea la cuenta con un 423 en el cuarto intento', async () => {
        const resRegister = await registerUser(TEST_EMAIL, TEST_PASSWORD);

        // 1-3 intentos de login
        const try1 = await loginUser(TEST_EMAIL, 'wrongPassword1');
        const try2 = await loginUser(TEST_EMAIL, 'wrongPassword1');
        const try3 = await loginUser(TEST_EMAIL, 'wrongPassword1');

        expect(try1.status).toBe(401);
        expect(try2.status).toBe(401);
        expect(try3.status).toBe(401);

        // Bloqueo
        const try4 = await loginUser(TEST_EMAIL, TEST_PASSWORD);

        expect(try4.status).toBe(423);
        expect(try4.body).toHaveProperty('error');

    });
});