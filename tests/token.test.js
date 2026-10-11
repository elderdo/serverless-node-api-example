// Unit tests: test one small piece of code in isolation (no HTTP server).
process.env.JWT_SECRET = 'test-secret';
const jwt = require('jsonwebtoken');

describe('token utils', () => {
    afterEach(() => {
        delete process.env.JWT_EXPIRES_IN;
        jest.resetModules(); // re-read env vars on the next require
    });

    test('generateToken and verifyToken round-trip', () => {
        const { generateToken, verifyToken } = require('../src/utils/token');
        const payload = verifyToken(generateToken({ username: 'alice' }));
        expect(payload.username).toBe('alice');
    });

    test('verifyToken rejects a tampered token', () => {
        const { generateToken, verifyToken } = require('../src/utils/token');
        const bad = generateToken({ username: 'alice' }) + 'x';
        expect(() => verifyToken(bad)).toThrow();
    });

    test('defaults to a 15 minute expiry', () => {
        const { generateToken } = require('../src/utils/token');
        const { exp, iat } = jwt.decode(generateToken({ a: 1 }));
        expect(exp - iat).toBe(15 * 60);
    });

    test('JWT_EXPIRES_IN changes the expiry', () => {
        process.env.JWT_EXPIRES_IN = '30m';
        const { generateToken } = require('../src/utils/token');
        const { exp, iat } = jwt.decode(generateToken({ a: 1 }));
        expect(exp - iat).toBe(30 * 60);
    });
});
