import { PasswordUtil } from './password.util';
import * as bcrypt from 'bcrypt';

describe('PasswordUtil (Argon2id)', () => {
  it('should hash a password using Argon2id', async () => {
    const password = 'StrongPassword123!';
    const hash = await PasswordUtil.hash(password);

    expect(hash).toBeDefined();
    expect(hash.startsWith('$argon2id$')).toBe(true);
  });

  it('should correctly verify a valid password with Argon2id', async () => {
    const password = 'TestSecretPassword2026';
    const hash = await PasswordUtil.hash(password);

    const result = await PasswordUtil.verify(hash, password);
    expect(result.isValid).toBe(true);
  });

  it('should reject an incorrect password', async () => {
    const password = 'CorrectPassword123';
    const hash = await PasswordUtil.hash(password);

    const result = await PasswordUtil.verify(hash, 'WrongPassword');
    expect(result.isValid).toBe(false);
  });

  it('should support legacy bcrypt hashes and mark them for rehash', async () => {
    const password = 'LegacyBcryptPassword';
    const legacyHash = await bcrypt.hash(password, 10);

    const result = await PasswordUtil.verify(legacyHash, password);
    expect(result.isValid).toBe(true);
    expect(result.needsRehash).toBe(true);
  });
});
