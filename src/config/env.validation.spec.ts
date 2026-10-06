import { validarEntorno } from './env.validation';

const JWT_SECRET = 'x'.repeat(32);
const NODE_ENV = 'development';

describe('validarEntorno', () => {
  it('acepta la configuración mínima y convierte PORT a número', () => {
    const variables = validarEntorno({ NODE_ENV, JWT_SECRET, PORT: '3000' });
    expect(variables.PORT).toBe(3000);
    expect(variables.JWT_SECRET).toBe(JWT_SECRET);
  });

  it('falla si falta JWT_SECRET', () => {
    expect(() => validarEntorno({ NODE_ENV })).toThrow(/JWT_SECRET/);
  });

  it('falla si JWT_SECRET es demasiado corto', () => {
    expect(() => validarEntorno({ NODE_ENV, JWT_SECRET: 'corto' })).toThrow(
      /JWT_SECRET/,
    );
  });

  it('falla si PORT no es un puerto válido', () => {
    expect(() => validarEntorno({ NODE_ENV, JWT_SECRET, PORT: 'abc' })).toThrow(
      /PORT/,
    );
    expect(() =>
      validarEntorno({ NODE_ENV, JWT_SECRET, PORT: '70000' }),
    ).toThrow(/PORT/);
  });

  it('falla si JWT_EXPIRES_IN viene vacío', () => {
    expect(() =>
      validarEntorno({ NODE_ENV, JWT_SECRET, JWT_EXPIRES_IN: '' }),
    ).toThrow(/JWT_EXPIRES_IN/);
  });

  it('falla si falta NODE_ENV', () => {
    expect(() => validarEntorno({ JWT_SECRET })).toThrow(/NODE_ENV/);
  });

  it('falla si NODE_ENV no es un entorno conocido', () => {
    expect(() => validarEntorno({ JWT_SECRET, NODE_ENV: 'prod' })).toThrow(
      /NODE_ENV/,
    );
  });
});
