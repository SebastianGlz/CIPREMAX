import { STATUS_CODES } from 'node:http';
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';

/** Forma única de todas las respuestas de error de la API. */
export interface RespuestaDeError {
  statusCode: number;
  error: string;
  messages: string[];
  path: string;
  timestamp: string;
}

function extraerMensajes(exception: HttpException): string[] {
  const respuesta = exception.getResponse();
  if (typeof respuesta === 'string') return [respuesta];

  const { message } = respuesta as { message?: unknown };
  if (Array.isArray(message)) return message.map(String);
  if (typeof message === 'string') return [message];
  return [exception.message];
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const http = host.switchToHttp();
    const request = http.getRequest<Request>();
    const esHttp = exception instanceof HttpException;
    const statusCode = esHttp
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    // Los errores inesperados se registran completos pero no se exponen.
    if (!esHttp) {
      this.logger.error(
        `${request.method} ${request.originalUrl}`,
        exception instanceof Error ? exception.stack : String(exception),
      );
    }

    const cuerpo: RespuestaDeError = {
      statusCode,
      error: STATUS_CODES[statusCode] ?? 'Error',
      messages: esHttp
        ? extraerMensajes(exception)
        : ['Error interno del servidor'],
      path: request.originalUrl,
      timestamp: new Date().toISOString(),
    };
    http.getResponse<Response>().status(statusCode).json(cuerpo);
  }
}
