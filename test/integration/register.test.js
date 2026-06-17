import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';

// Import de la APP REAL
import app from '../../src/app.js';
import { reset } from '../../src/infra/fakeDb.js';

const VALID_EMAIL = 'nuevo.usuario@test.env';
const VALID_PASSWORD = 'Password1';

beforeEach( async () => {
    await reset();
})

describe('POST /register - happy path', () => {

    it('devuelve 201 con el usuario creado, sin password', async () => {

        const res = await request(app)
            .post('/register')
            .send({ email: VALID_EMAIL, password: VALID_PASSWORD });

        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty('id');
        expect(res.body).toHaveProperty('email', VALID_EMAIL);

    });

    it('la respuesta NO incluye el campo password (invariante de seguridad)', async () => {
        const res = await request(app)
            .post('/register')
            .send({ email: VALID_EMAIL, password: VALID_PASSWORD });
        
        expect(res.status).toBe(201);
        expect(res.body).not.toHaveProperty('password');
    });

    it('normalizar el email a minúsculas', async () => {
        const res = await request(app)
            .post('/register')
            .send({ email: VALID_EMAIL.toUpperCase(), password: VALID_PASSWORD });

        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty('email', VALID_EMAIL);
    });

});

describe('POST /register - gestión de errores', () => {

    it('devuelve un 422 si el email no tiene un formato válido', async () => {
        const res = await request(app)
            .post('/register')
            .send({ email: 'email-invalido', password: VALID_PASSWORD });

        expect(res.status).toBe(422);
        expect(res.body).toHaveProperty('error');

        // Dominio o contrato de validación
        expect(res.body).toHaveProperty('details');
        expect(Array.isArray(res.body.details)).toBe(true);
        expect(res.body.details.length).toBeGreaterThan(0);

    });

    it('deuelve un 422 con DOS errores si el password no tiene mayúscula ni número', async () => {
        const res = await request(app)
            .post('/register')
            .send({ email: VALID_EMAIL, password: 'sinmayusculas' });
    
        expect(res.status).toBe(422);
        expect(res.body.details.length).toBeGreaterThanOrEqual(2);
    
    })

    it('devuelve un 409 si se intenta registrar el mismo email dos veces', async () => {
        const res1 = await request(app)
            .post('/register')
            .send({ email: VALID_EMAIL, password: VALID_PASSWORD });

        expect(res1.status).toBe(201);

        const res2 = await request(app)
            .post('/register')
            .send({ email: VALID_EMAIL, password: VALID_PASSWORD });
        
        expect(res2.status).toBe(409);
        expect(res2.body).toHaveProperty('error');
    });

});