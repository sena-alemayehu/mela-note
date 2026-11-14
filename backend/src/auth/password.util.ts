import * as argon2 from 'argon2';
import * as bcrypt from 'bcrypt';

export class PasswordUtil {
  /**
   * Hashes a password using Argon2id with OWASP-recommended parameters.
   */
  static async hash(password: string): Promise<string> {
    return argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: 19456, // 19 MiB
      timeCost: 2,
      parallelism: 1,
    });
  }

  /**
   * Verifies a password against an Argon2id or legacy bcrypt hash.
   */
  static async verify(hash: string, password: string): Promise<{ isValid: boolean; needsRehash: boolean }> {
    if (!hash || !password) {
      return { isValid: false, needsRehash: false };
    }

    // Check if this is an Argon2 hash
    if (hash.startsWith('$argon2')) {
      try {
        const isValid = await argon2.verify(hash, password);
        const needsRehash = argon2.needsRehash(hash, {
          memoryCost: 19456,
          timeCost: 2,
        });
        return { isValid, needsRehash };
      } catch {
        return { isValid: false, needsRehash: false };
      }
    }

    // Support legacy bcrypt hashes gracefully and mark for rehash
    if (hash.startsWith('$2a$') || hash.startsWith('$2b$')) {
      try {
        const isValid = await bcrypt.compare(password, hash);
        return { isValid, needsRehash: true };
      } catch {
        return { isValid: false, needsRehash: false };
      }
    }

    return { isValid: false, needsRehash: false };
  }
}
