import { validateEmail }                  from '../domain/validateEmail.js';
import { validatePassword }               from '../domain/validatePassword.js';
import { normalizeEmail, generateUsername } from '../utils/index.js';
import * as userRepository                from '../infra/userRepository.js';
import { hashPassword, comparePassword }  from '../infra/hashPassword.js';
import { isLocked, registerFaliure, resetLockout } from '../domain/lockoutPolicy.js';

/**
 * Crea un Error enriquecido con código de negocio y status HTTP.
 *
 * @param {string}   code
 * @param {string}   message
 * @param {string[]} [details=[]]
 * @returns {Error}
 */
function createError(code, message, details = []) {
  const STATUS_MAP = {
    VALIDATION:          422,
    DUPLICATE:           409,
    INVALID_CREDENTIALS: 401,
    LOCKED:              423, // Resolvemos CA3
  };

  const error = new Error(message);
  error.code    = code;
  error.status  = STATUS_MAP[code] ?? 500;
  error.details = details;

  return error;
}

/**
 * Registra un nuevo usuario.
 *
 * @param {{ email: string, password: string }} data
 * @returns {Promise<object>} Usuario creado sin el campo password.
 * @throws {Error} code='VALIDATION' (422) si email o password no son válidos.
 * @throws {Error} code='DUPLICATE'  (409) si el email ya está registrado.
 */
export async function register({ email, password }) {
  const validationErrors = [];

  let emailOk = false;
  try {
    emailOk = validateEmail(email);
  } catch {
    validationErrors.push('El email debe ser un texto válido');
  }

  if (!emailOk && !validationErrors.length) {
    validationErrors.push('El formato del email no es válido');
  }

  const { valid: passwordOk, errors: passwordErrors } = validatePassword(password);
  if (!passwordOk) {
    validationErrors.push(...passwordErrors);
  }

  if (validationErrors.length > 0) {
    throw createError('VALIDATION', 'Los datos de registro no son válidos', validationErrors);
  }

  const normalizedEmail = normalizeEmail(email);

  const existing = await userRepository.findOne({ email: normalizedEmail });
  if (existing) {
    throw createError('DUPLICATE', 'El email ya está registrado');
  }

  const hashedPassword = await hashPassword(password);
  const username       = generateUsername(normalizedEmail);

  const created = await userRepository.create({
    username,
    email:    normalizedEmail,
    password: hashedPassword,
  });

  const { password: _omitted, ...safeUser } = created;

  return safeUser;
}

/**
 * Autentica a un usuario con email y contraseña.
 *
 * @param {{ email: string, password: string }} credentials
 * @returns {Promise<object>} Usuario autenticado sin el campo password.
 * @throws {Error} code='INVALID_CREDENTIALS' (401) si las credenciales no son válidas.
 */
export async function login({ email, password }) {
  const normalizedEmail = normalizeEmail(email);

  const user = await userRepository.findOne({ email: normalizedEmail });

  if (!user) {
    throw createError('INVALID_CREDENTIALS', 'Credenciales incorrectas');
  }

  const now = Date.now();
  // CA3: cuenta bloqueada (lockedUntil es futuro) -> Error 423
  if (isLocked({ lockedUntil: user.lockedUntil, now })) {
    throw createError('LOCKED', 'Cuenta bloqueada temporalmente');
  }

  const passwordMatches = await comparePassword(password, user.password);
  if (!passwordMatches) {

    // CA1: Registro de intentos fallidos
    const changes = registerFaliure({ failedAttempts: user.failedAttempts, now });

    await userRepository.updateOne(
      { id: user.id },
      changes
    );
    throw createError('INVALID_CREDENTIALS', 'Credenciales incorrectas');
  }

  // CA2: Login exitoso
  if (user.failedAttempts > 0 || user.lockedUntil) {
    await userRepository.updateOne(
      { id: user.id },
      resetLockout()
    );
  }

  const { password: _omitted, ...safeUser } = user;

  return safeUser;
}
