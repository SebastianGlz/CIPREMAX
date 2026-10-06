import { PasswordService } from './password.service';

describe('PasswordService', () => {
  const service = new PasswordService();

  it('genera un hash argon2id que no contiene la contraseña', async () => {
    const hash = await service.hashear('MiClave-123');
    expect(hash.startsWith('$argon2id$')).toBe(true);
    expect(hash).not.toContain('MiClave-123');
  });

  it('usa una sal distinta en cada hash', async () => {
    const [a, b] = await Promise.all([
      service.hashear('MiClave-123'),
      service.hashear('MiClave-123'),
    ]);
    expect(a).not.toBe(b);
  });

  it('verifica la contraseña correcta y rechaza la incorrecta', async () => {
    const hash = await service.hashear('MiClave-123');
    await expect(service.verificar(hash, 'MiClave-123')).resolves.toBe(true);
    await expect(service.verificar(hash, 'miclave-123')).resolves.toBe(false);
  });

  it('devuelve false si el hash guardado no es válido', async () => {
    await expect(service.verificar('no-es-un-hash', 'x')).resolves.toBe(false);
    await expect(service.verificar('', 'x')).resolves.toBe(false);
  });
});
