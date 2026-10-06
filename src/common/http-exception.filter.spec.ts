import {
  ArgumentsHost,
  BadRequestException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { HttpExceptionFilter } from './http-exception.filter';

describe('HttpExceptionFilter', () => {
  const filter = new HttpExceptionFilter();

  function ejecutar(exception: unknown) {
    const json = jest.fn();
    const status = jest.fn().mockReturnValue({ json });
    const host = {
      switchToHttp: () => ({
        getRequest: () => ({ method: 'GET', originalUrl: '/api/clientes' }),
        getResponse: () => ({ status }),
      }),
    } as unknown as ArgumentsHost;

    filter.catch(exception, host);
    return { status, cuerpo: json.mock.calls[0][0] };
  }

  beforeEach(() => {
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => jest.restoreAllMocks());

  it('normaliza un mensaje simple a una lista', () => {
    const { status, cuerpo } = ejecutar(new NotFoundException('No existe'));
    expect(status).toHaveBeenCalledWith(404);
    expect(cuerpo).toMatchObject({
      statusCode: 404,
      error: 'Not Found',
      messages: ['No existe'],
      path: '/api/clientes',
    });
    expect(Number.isNaN(Date.parse(cuerpo.timestamp))).toBe(false);
  });

  it('conserva todos los mensajes de validación', () => {
    const { cuerpo } = ejecutar(
      new BadRequestException(['nombre es requerido', 'email inválido']),
    );
    expect(cuerpo.statusCode).toBe(400);
    expect(cuerpo.messages).toEqual(['nombre es requerido', 'email inválido']);
  });

  it('oculta el detalle de errores inesperados y los registra', () => {
    const { status, cuerpo } = ejecutar(new Error('fallo con datos internos'));
    expect(status).toHaveBeenCalledWith(500);
    expect(cuerpo.messages).toEqual(['Error interno del servidor']);
    expect(Logger.prototype.error).toHaveBeenCalled();
  });
});
