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