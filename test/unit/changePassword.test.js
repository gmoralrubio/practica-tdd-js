import { describe, it, expect, vi, beforeEach } from 'vitest'
import { changePassword, register } from '../../src/services/userService.js'

vi.mock('../../src/infra/userRepository.js')
vi.mock('../../src/infra/hashPassword.js')

import * as userRepository from '../../src/infra/userRepository.js'
import * as hashPasswordModule from '../../src/infra/hashPassword.js'

const VALID_PASSWORD = 'SecurePass1'
const NEW_VALID_PASSWORD = 'NewSecurePass1'
const HASHED_PASSWORD = '$2b$10$hashedValueSimulado'
const VALID_EMAIL = 'nuevo@example.com'
const USER = {
	id: 'uuid-generado-123',
	username: 'nuevo',
	email: VALID_EMAIL,
	password: HASHED_PASSWORD,
	createdAt: '2024-01-01T00:00:00.000Z',
}

describe('changePassword - Happy path (200)', () => {
	beforeEach(() => {
		vi.clearAllMocks()
		userRepository.findOne.mockResolvedValueOnce(USER)
		hashPasswordModule.comparePassword.mockResolvedValueOnce(true)
		hashPasswordModule.hashPassword.mockResolvedValueOnce(HASHED_PASSWORD)
		userRepository.updateOne.mockResolvedValueOnce({
			...USER,
			password: NEW_VALID_PASSWORD,
		})
	})
	it('Devuelve el usuario sin password cuando todo es correcto', async () => {
		const user = await changePassword({
			email: VALID_EMAIL,
			currentPassword: VALID_PASSWORD,
			newPassword: NEW_VALID_PASSWORD,
		})
		expect(user.id).toBe(USER.id)
		expect(user).not.toHaveProperty('password')
	})

	it('Llama a comparePassword con la contraseña actual en texto plano', async () => {
		const user = await changePassword({
			email: VALID_EMAIL,
			currentPassword: VALID_PASSWORD,
			newPassword: NEW_VALID_PASSWORD,
		})

		const compareCallArgs =
			hashPasswordModule.comparePassword.mock.calls[0][0]

		expect(compareCallArgs).toBe(VALID_PASSWORD)
	})

	it('Llama a updateOne con el hash de la nueva contraseña', async () => {
		const user = await changePassword({
			email: VALID_EMAIL,
			currentPassword: VALID_PASSWORD,
			newPassword: NEW_VALID_PASSWORD,
		})

		const updateCallArgs = userRepository.updateOne.mock.calls[0][1]

		expect(updateCallArgs.password).toBe(HASHED_PASSWORD)
	})
})

describe('changePassword - INVALID_CREDENTIALS (401)', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	it('Lanza 401 si el usuario no existe', async () => {
		userRepository.findOne.mockResolvedValueOnce(null)

		await expect(
			changePassword({
				email: VALID_EMAIL,
				currentPassword: VALID_PASSWORD,
				newPassword: NEW_VALID_PASSWORD,
			})
		).rejects.toMatchObject({
			code: 'INVALID_CREDENTIALS',
			status: 401,
		})
	})

	it('Lanza 401 si la contraseña actual no coincide', async () => {
		userRepository.findOne.mockResolvedValueOnce(USER)
		hashPasswordModule.comparePassword.mockResolvedValueOnce(false)

		await expect(
			changePassword({
				email: VALID_EMAIL,
				currentPassword: VALID_PASSWORD,
				newPassword: NEW_VALID_PASSWORD,
			})
		).rejects.toMatchObject({
			code: 'INVALID_CREDENTIALS',
			status: 401,
		})
	})
})
