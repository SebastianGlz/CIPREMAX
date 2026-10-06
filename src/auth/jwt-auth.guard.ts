import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { ES_PUBLICO } from './public.decorator';
import { esJwtPayload, RequestAutenticado } from './usuario-autenticado';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const esPublico = this.reflector.getAllAndOverride<boolean>(ES_PUBLICO, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (esPublico) return true;

    const request = context.switchToHttp().getRequest<RequestAutenticado>();
    const token = this.extraerToken(request);
    if (!token) throw new UnauthorizedException();

    let payload: unknown;
    try {
      payload = await this.jwtService.verifyAsync(token);
    } catch {
      throw new UnauthorizedException();
    }
    // Un token sin unidad de negocio o sin rol no sirve: todo se filtra y
    // se autoriza con ellos.
    if (!esJwtPayload(payload)) throw new UnauthorizedException();

    request.user = {
      usuarioId: payload.sub,
      unidadNegocioId: payload.unidadNegocioId,
      rol: payload.rol,
    };
    return true;
  }

  private extraerToken(request: RequestAutenticado): string | undefined {
    const [tipo, token] = request.headers.authorization?.split(' ') ?? [];
    return tipo === 'Bearer' ? token : undefined;
  }
}
