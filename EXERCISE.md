# Ejercicio voluntario final — Cambio de contrasena

## Contexto

Este ejercicio es voluntario del modulo "Testing con JS (TDD)" de KeepCoding.

El proyecto ya tiene:
- `register` y `login` completos con tests unitarios, de integracion y e2e.
- Politica de bloqueo tras intentos fallidos.
- Suite verde al completo.

Se nos pide anadir la feature **cambio de contrasena** y cubrirla con tests en las tres capas
de la piramide: unidad, integracion y e2e.

---

## Historia de usuario

> Como usuario registrado, quiero poder cambiar mi contrasena desde la aplicacion,
> introduciendo mi contrasena actual y la nueva, para mantener mi cuenta segura.

---

## Criterios de aceptacion

**CA1 — Cambio exitoso**
Dado un usuario registrado, cuando envio mi email, mi contrasena actual correcta y una contrasena
nueva valida y distinta a la actual, entonces el servidor responde 200 y devuelve mis datos de
usuario sin el campo `password`.

**CA2 — Contrasena actual incorrecta**
Dado un usuario registrado, cuando envio una contrasena actual que no coincide con la almacenada,
entonces el servidor responde 401.

**CA3 — Nueva contrasena no cumple la politica**
Cuando la nueva contrasena no supera la validacion (menos de 8 caracteres, sin mayuscula o sin
numero), entonces el servidor responde 422 con un array `details` que describe las reglas
incumplidas.

**CA4 — Nueva contrasena igual a la actual**
Cuando la nueva contrasena es identica a la actual en texto plano, entonces el servidor responde
422 con el mensaje "La nueva contrasena debe ser distinta a la actual".

**CA5 — Verificacion post-cambio**
Tras un cambio exitoso, el login funciona con la nueva contrasena y devuelve 401 con la antigua.

---

## Que debes entregar

### 1. La feature

**`src/services/userService.js`** — anade la funcion exportada:

```js
// src/services/userService.js
// TODO: exportar changePassword({ email, currentPassword, newPassword })
// Orden de comprobaciones:
//   1. normalizeEmail + userRepository.findOne -> si no existe: INVALID_CREDENTIALS (401)
//   2. comparePassword(currentPassword, user.password) -> si no coincide: INVALID_CREDENTIALS (401)
//   3. si newPassword === currentPassword -> VALIDATION (422) "La nueva contrasena debe ser distinta a la actual"
//   4. validatePassword(newPassword) -> si invalida: VALIDATION (422) con details
//   5. hashPassword(newPassword) -> userRepository.updateOne({ id: user.id }, { password: hash })
//   6. devolver el usuario actualizado sin el campo password
export async function changePassword({ email, currentPassword, newPassword }) {
  // TODO: implementar
}
```

**`src/web/routes.js`** — anade dos rutas:

```js
// src/web/routes.js
// TODO: GET /change-password -> res.render('change-password', { year })
// TODO: POST /change-password -> llama a userService.changePassword(req.body)
//       200 en exito, propagar error.status y error.message en caso de error
```

**`src/web/views/change-password.html`** — crea la vista EJS:

```html
<!-- src/web/views/change-password.html -->
<!-- TODO: formulario con campos #email, #currentPassword, #newPassword -->
<!-- TODO: boton de envio -->
<!-- TODO: <div id="result"> donde el script fetch muestra el resultado -->
<!-- El script llama a POST /change-password con los tres campos -->
<!-- Aplica clase 'success' o 'error' segun la respuesta, igual que register.html -->
```

---

### 2. Tests en las tres capas

#### Capa 1 — Unitaria (`tests/unit/changePassword.test.js`)

```js
// tests/unit/changePassword.test.js
// Mockear: userRepository (vi.mock), hashPassword y comparePassword (ya mockeados)
// Importar: changePassword desde userService

// TODO: describe 'changePassword — flujo feliz (200)'
//   it 'devuelve el usuario sin password cuando todo es correcto'
//   it 'llama a comparePassword con la contrasena actual en texto plano'
//   it 'llama a updateOne con el hash de la nueva contrasena'

// TODO: describe 'changePassword — INVALID_CREDENTIALS (401)'
//   it 'lanza 401 si el usuario no existe'
//   it 'lanza 401 si la contrasena actual no coincide'

// TODO: describe 'changePassword — VALIDATION (422)'
//   it 'lanza 422 si la nueva contrasena es igual a la actual'
//   it 'lanza 422 si la nueva contrasena no cumple la politica'
//   it 'el error 422 por politica incluye details con los mensajes de reglas incumplidas'
```

#### Capa 2 — Integracion (`tests/integration/changePassword.test.js`)

```js
// tests/integration/changePassword.test.js
// Usar: supertest + app + fakeDb.reset() en beforeEach
// Sin mocks: todo real (bcrypt, fakeDb, validatePassword)

// TODO: beforeEach -> reset() + registrar usuario de prueba via POST /register

// TODO: describe 'POST /change-password — flujo feliz'
//   it 'devuelve 200 con el usuario sin password (CA1)'
//   it 'tras el cambio, el login funciona con la nueva contrasena (CA5)'
//   it 'tras el cambio, el login falla con la contrasena vieja (CA5)'

// TODO: describe 'POST /change-password — errores'
//   it 'devuelve 401 si la contrasena actual es incorrecta (CA2)'
//   it 'devuelve 422 si la nueva contrasena no cumple la politica (CA3)'
//   it 'devuelve 422 si la nueva contrasena es igual a la actual (CA4)'
```

#### Capa 3 — E2E (`tests/e2e/change-password.spec.js`)

```js
// tests/e2e/change-password.spec.js
// Usar: Playwright (@playwright/test)
// Usa un email con timestamp para evitar conflictos entre ejecuciones

// TODO: registrar el usuario (puede hacerse via fetch en beforeAll o POST directo)
// TODO: test 'flujo feliz: navegar a /change-password, rellenar y ver mensaje de exito'
//   - page.goto('/change-password')
//   - rellenar #email, #currentPassword, #newPassword con valores validos
//   - click en boton de envio
//   - expect(page.locator('#result')).toContainText('...') // algun texto de exito
```

---

## Pistas

- **Reutiliza lo que ya existe**: `validatePassword`, `comparePassword`, `hashPassword` y
  `userRepository` ya estan en `src/infra/` y `src/domain/`. No reinventes nada.
- **Aislamiento en integracion**: llama a `fakeDb.reset()` en `beforeEach`. Sin eso, el estado
  de la DB se acumula entre tests y los resultados se vuelven impredecibles.
- **Email unico en e2e**: los tests e2e corren contra el servidor real sin reset. Usa
  `Date.now()` en el email para que cada ejecucion use credenciales nuevas, igual que en
  `register.spec.js`.
- **Orden de comprobaciones**: respeta el orden del contrato. Si verificas la politica antes de
  comparar la contrasena actual, el CA2 y el CA4 podrian solaparse de forma incorrecta.
- **Mensaje exacto del CA4**: el mensaje debe ser exactamente
  `"La nueva contrasena debe ser distinta a la actual"` para que los tests de integracion lo
  puedan verificar si asi lo decides.
- **La vista**: sigue el mismo patron que `register.html` y `login.html`. El `<div id="result">`
  debe tener clase `success` o `error` segun el resultado del fetch.

---

## Evaluacion

Este ejercicio es voluntario. No hay nota. El objetivo es que salgas del curso habiendo
implementado una feature completa con TDD en las tres capas de la piramide.

Si quieres comparar tu solucion, el material del profesor incluye una solucion de referencia
comentada con explicaciones de cada decision de diseno.
