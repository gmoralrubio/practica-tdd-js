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

});

describe('validateEmail - emails inválidos', () => {

    it('devuelve false cuando falta el @', () => {
        expect(validateEmail('emailsinArroba.com')).toBe(false);
    });

    it('devuelve false para un string vacío', () => {
        expect(validateEmail('')).toBe(false);
    });

    it('el TypeError lanzado tiene un mensaje que contiene "string"', () => {
        let errorMessage = '';
         try {
            validateEmail(1234);
         } catch (e) {
            errorMessage = e.message;
         };

         expect(errorMessage).toMatch(/string/i);
    });

});