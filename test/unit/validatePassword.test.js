import { describe, it, expect } from 'vitest';
import { validatePassword, passwordStrength } from '../../src/domain/validatePassword';

it('devuelve true para cotraseña válida', () => {
    const result = validatePassword('Hola1234');
    // Cualquier tipo no primitivo (Object) se verifican con toEqual
    expect(result).toEqual({ valid: true, errors: [] });
});


it('devuelve los tres errores para una contraseña débil', () => {
    expect(validatePassword('corta')).toEqual({
        valid: false,
        errors: [
            'Debe tener al menos 8 caracteres',
            'Debe contener al menos una letra mayúscula',
            'Debe contener al menos un número'
        ]
    });
})