
export const LOCK_THRESHOLD = 3;
export const LOCK_DURATION_MS = 15 * 60 * 1000;

// La cuenta esta bloqueada?
// Traemos now desde fuera para mantener 0 dependencias (inversion de deps)
export function isLocked({ lockedUntil, now }) {
    return Boolean(lockedUntil && now < lockedUntil) 
};

// TODO: Crea una función pura resetLockout que devuelva el objeto necesario para limpar el bloqueo.
export function resetLockout() {
    return { failedAttempts: 0, lockedUntil: null }
};

// Control de cambios a persistir tras un intento fallido
export function registerFaliure({ failedAttempts = 0, now }) {
    const newCount = failedAttempts + 1;
    const changes = { failedAttempts: newCount };

    if (newCount >= LOCK_THRESHOLD) {
        changes.lockedUntil = now + LOCK_DURATION_MS;
    }
   return changes;
}