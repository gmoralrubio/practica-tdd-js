import { Router } from 'express'
import * as userService from '../services/userService.js'

const router = Router()

// ---------------------------------------------------------------------------
// GET /register — devuelve el formulario de registro
// ---------------------------------------------------------------------------
router.get('/register', (_req, res) => {
	res.render('register', { year: new Date().getFullYear() })
})

// ---------------------------------------------------------------------------
// GET /login — devuelve el formulario de inicio de sesión
// ---------------------------------------------------------------------------
router.get('/login', (_req, res) => {
	res.render('login', { year: new Date().getFullYear() })
})

// ---------------------------------------------------------------------------
// GET /change-password — devuelve el formulario de cambio de contraseña
// ---------------------------------------------------------------------------
router.get('/change-password', (_req, res) => {
	res.render('change-password', { year: new Date().getFullYear() })
})

// ---------------------------------------------------------------------------
// POST /register — crea un nuevo usuario
// ---------------------------------------------------------------------------
router.post('/register', async (req, res) => {
	try {
		const user = await userService.register(req.body)

		res.status(201).json(user)
	} catch (error) {
		const status = error.status ?? 500
		const details = error.details ?? []

		res.status(status).json({
			error: error.message,
			details,
		})
	}
})

// ---------------------------------------------------------------------------
// POST /login — autentica a un usuario
// ---------------------------------------------------------------------------
router.post('/login', async (req, res) => {
	try {
		const user = await userService.login(req.body)

		res.status(200).json(user)
	} catch (error) {
		const status = error.status ?? 500

		res.status(status).json({
			error: error.message,
		})
	}
})

// ---------------------------------------------------------------------------
// POST /change-password — autentica a un usuario
// ---------------------------------------------------------------------------
router.post('/change-password', async (req, res) => {
	try {
		const user = await userService.changePassword(req.body)

		res.status(200).json(user)
	} catch (error) {
		const status = error.status ?? 500

		res.status(status).json({
			error: error.message,
		})
	}
})

export default router
