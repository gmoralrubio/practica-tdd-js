import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import * as fakeDb from '../../src/infra/fakeDb.js';
import * as userRepository from '../../src/infra/userRepository.js';

// Async Await
// .resolves
// callbacks X

beforeEach( async () => {
    await fakeDb.reset();
});

afterAll( async () => {
    await fakeDb.reset();
});

it('findAll() resuelve a un array con los usuarios del JSON (12)', async () => {
    const users = await fakeDb.findAll();
    expect(Array.isArray(users)).toBe(true);
    expect(users).toHaveLength(12);
});

it('.resolves: insert() resuelve al objeto con id', async () => {
    await expect(
        fakeDb.insert({ username: 'vitest-user' })
    ).resolves.toHaveProperty('id');
});

it('userRepository.findOne() devuelve null si no encuentra coincidencia', async () => {
    // await fakeDb.reset();
    const email = 'vitest-user';
    const user = await userRepository.findOne({ username: email });

    expect(user).toBeNull();
});

it('userRepository.findOne() devuelve null si no encuentra coincidencia', async () => {
    const email = 'inexistente@example.com';
    const user = await userRepository.findOne({ email });

    expect(user).toBeNull();
});