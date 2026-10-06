import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload, UsuarioAutenticado } from './usuario-autenticado';

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  /** Firma el token de acceso para un usuario en su unidad de negocio activa. */
  emitirToken(usuario: UsuarioAutenticado): Promise<string> {
    const payload: JwtPayload = {
      sub: usuario.usuarioId,
      unidadNegocioId: usuario.unidadNegocioId,
    };
    return this.jwtService.signAsync(payload);
  }
}
