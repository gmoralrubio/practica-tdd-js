import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

beforeEach(() => {
    vi.useFakeTimers(); // Activamos un "falso reloj".
})

afterEach(() => {
    vi.useRealTimers(); // Volvemos a utilizar la hora real del SO.
});

it('Controlo la hora falsa (No SO)', () => {
    const NOW = new Date('2021-06-01T10:00:00.000Z').getTime();
    vi.setSystemTime(NOW); // A partir de esta línea new Date() == NOW.

    expect(Date.now()).toBe(NOW);
});

it('Avanzo la hora a voluntad la hora 15 minutos', () => {
    const NOW = new Date('2021-06-01T10:00:00.000Z').getTime();
    const MS15min = 15 * 60 * 1000;

    vi.setSystemTime(NOW);

    // Viajar en el tiempo 15 minutos;
    // vi.setSystemTime(NOW + MS15min); // Esto seria sobreescribir la fecha.
    vi.advanceTimersByTime(MS15min);

    expect(Date.now()).toBe(NOW + MS15min);
});