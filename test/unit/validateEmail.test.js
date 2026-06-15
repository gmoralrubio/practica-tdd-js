import { describe, it, expect } from 'vitest';
import { validateEmail } from '../../src/domain/validateEmail';

describe('validateEmail - emails válidos', () => {

    it('devuelve true para un email canónico', () => {
        // Arrange: datos de entrada
        const email = 'usuario@dominio.com';

        // Act: ejecución de la función
        const result = validateEmail(email);

        // Assert
        expect(result).toBe(true);
    });

    it.todo('devuelve false para un string vacío');
})