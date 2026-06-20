import bcrypt from 'bcryptjs'

const ROUNDS = Number(process.env.SALT_ROUNDS) || 10

/**
 * Genera un hash bcrypt de una contraseña en texto plano.
 *
 * @param {string} plain
 * @returns {Promise<string>}
 */
export async function hashPassword(plain) {
	return bcrypt.hash(plain, ROUNDS)
}

/**
 * Compara una contraseña en texto plano con un hash bcrypt almacenado.
 *
 * @param {string} plain
 * @param {string} hash
 * @returns {Promise<boolean>}
 */
export async function comparePassword(plain, hash) {
	return bcrypt.compare(plain, hash)
}

/**
 * Compara dos contraseñas en texto plano.
 *
 * @param {string} a
 * @param {string} b
 * @returns {Promise<boolean>}
 */
export async function comparePlainPassword(a, b) {
	return Boolean(a === b)
}
