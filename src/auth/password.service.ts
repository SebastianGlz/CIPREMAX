import { Injectable } from '@nestjs/common';
import * as argon2 from 'argon2';

@Injectable()
export class PasswordService {
  /** Devuelve el hash argon2id (incluye sal y parámetros) para guardar. */
  hashear(password: string): Promise<string> {
    return argon2.hash(password);
  }

  /** `false` tanto si la contraseña no coincide como si el hash es inválido. */
  async verificar(hash: string, password: string): Promise<boolean> {
    try {
      return await argon2.verify(hash, password);
    } catch {
      return false;
    }
  }
}
