import { describe, it, expect, beforeEach } from 'vitest'
import request from 'supertest'
import app from '../../src/app.js'
import { reset } from '../../src/infra/fakeDb'

const VALID_EMAIL = 'nuevo.usuario@test.env'
const VALID_PASSWORD = 'Password1'
const NEW_VALID_PASSWORD = 'Password2'

beforeEach(async () => {
	await reset()
	const user = await request(app)
		.post('/register')
		.send({ email: VALID_EMAIL, password: VALID_PASSWORD })
})

describe('POST /change-password - Happy path', () => {
	it('Devuelve 200 con el usuario sin password (CA1)', async () => {
		const res = await request(app).post('/change-password').send({
			email: VALID_EMAIL,
			currentPassword: VALID_PASSWORD,
			newPassword: NEW_VALID_PASSWORD,
		})

		expect(res.status).toBe(200)
		expect(res.body).toHaveProperty('id')
		expect(res.body).not.toHaveProperty('password')
	})

	it('Tras el cambio, el login funciona con la nueva contraseña', async () => {
		const res = await request(app).post('/change-password').send({
			email: VALID_EMAIL,
			currentPassword: VALID_PASSWORD,
			newPassword: NEW_VALID_PASSWORD,
		})
		expect(res.status).toBe(200)

		const login = await request(app).post('/login').send({
			email: VALID_EMAIL,
			password: NEW_VALID_PASSWORD,
		})

		expect(login.status).toBe(200)
		expect(login.body).toHaveProperty('id')
		expect(login.body).not.toHaveProperty('password')
	})

	it('Tras el cambio, el login falla con la contraseña vieja', async () => {
		const res = await request(app).post('/change-password').send({
			email: VALID_EMAIL,
			currentPassword: VALID_PASSWORD,
			newPassword: NEW_VALID_PASSWORD,
		})
		expect(res.status).toBe(200)

		const login = await request(app).post('/login').send({
			email: VALID_EMAIL,
			password: VALID_PASSWORD,
		})

		expect(login.status).toBe(401)
		expect(login.body).toHaveProperty('error', 'Credenciales incorrectas')
	})
})
