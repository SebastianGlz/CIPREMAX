import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
  MinLength,
  validateSync,
} from 'class-validator';

class VariablesDeEntorno {
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(65535)
  PORT?: number;

  @IsString()
  @MinLength(32)
  JWT_SECRET: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  JWT_EXPIRES_IN?: string;

  /** Orígenes permitidos separados por coma. Sin valor, CORS queda apagado. */
  @IsOptional()
  @IsString()
  CORS_ORIGIN?: string;
}

/** Detiene el arranque si falta o es inválida alguna variable de entorno. */
export function validarEntorno(config: Record<string, unknown>) {
  const variables = plainToInstance(VariablesDeEntorno, config, {
    enableImplicitConversion: true,
  });
  const errores = validateSync(variables);

  if (errores.length > 0) {
    const detalle = errores
      .flatMap((error) => Object.values(error.constraints ?? {}))
      .join('; ');
    throw new Error(`Variables de entorno inválidas: ${detalle}`);
  }
  return variables;
}
