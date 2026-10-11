process.env.JWT_SECRET = 'test-secret';
const { handleRegister, handleLogin, AuthError } = require('../src/auth-handler');
const users = require('../src/db/users');

beforeEach(() => users.clear());

describe('auth-handler', () => {
    test('stores a hash, not the plain password', async () => {
        await handleRegister('alice', 'password123');
        const stored = users.findByUsername('alice');
        expect(stored.passwordHash).not.toBe('password123');
        expect(stored.passwordHash).toMatch(/^\$2[aby]\$/); // bcrypt format
    });

    test('duplicate usernames are rejected (case-insensitive) with 409', async () => {
        await handleRegister('alice', 'password123');
        await expect(handleRegister('ALICE', 'password123')).rejects.toMatchObject({ status: 409 });
    });

    test('login returns a token for correct credentials', async () => {
        await handleRegister('alice', 'password123');
        const { token } = await handleLogin('alice', 'password123');
        expect(typeof token).toBe('string');
    });

    test('wrong password and unknown user give the same 401 error', async () => {
        await handleRegister('alice', 'password123');
        const wrongPw = await handleLogin('alice', 'nope-nope').catch((e) => e);
        const noUser = await handleLogin('bob', 'password123').catch((e) => e);
        expect(wrongPw).toBeInstanceOf(AuthError);
        expect(wrongPw.status).toBe(401);
        expect(noUser.message).toBe(wrongPw.message);
    });
});
