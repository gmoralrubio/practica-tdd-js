import { describe, it, expect } from 'vitest';
import * as fakeDb from '../../src/infra/fakeDb.js';
import * as userRepository from '../../src/infra/userRepository.js';

// Async Await
// .resolves
// callbacks X

it('findAll() resuelve a un array con los usuarios del JSON (12)', async () => {
    const users = await fakeDb.findAll();
    expect(Array.isArray(users)).toBe(true);
    expect(users).toHaveLength(12);
});

it('.resolves: insert() resuelve al objeto con id', async () => {
    await expect(
        fakeDb.insert({ username: 'vitest-user' })
    ).resolves.toHaveProperty('id');
})

it('userRepository.findOne() devuelve null si no encuentra coincidencia', async () => {
    const email = 'inexistente@test.com';
    const user = await userRepository.findOne({ email: email });

    expect(user).toBeNull();
});