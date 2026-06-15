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
});

it('el array de errors contiene el mensaje de longitud', () => {
    const { errors } = validatePassword('Abc1');
    // Verificamos el contenido de un array parcialmente
    expect(errors).toContain('Debe tener al menos 8 caracteres');
});

it('una contraseña que viola dos reglas tiene EXACTAMENTE 2 errores', () => {
    const { errors } = validatePassword('SINNUM');
    // Verificamos la longitud del array
    expect(errors).toHaveLength(2);
    expect(errors.length).toEqual(2);
})

it('devuelve 2/3 en la fuerza del password', () => {
    const strength = passwordStrength('Abcdefgh');
    expect(strength).toBe(2/3);
    expect(strength).toBeCloseTo(0.667, 3);
    expect(strength).toBeCloseTo(0.6667, 4);
});