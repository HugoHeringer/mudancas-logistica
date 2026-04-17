import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from './prisma.service';

export interface TenantRequest extends Request {
  tenantId?: string;
  user?: {
    id: string;
    email: string;
    tenantId: string;
    perfil: string;
  };
}

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  constructor(
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) {}

  async use(req: TenantRequest, res: Response, next: NextFunction) {
    // Ignorar rotas públicas
    const publicRoutes = [
      '/api/auth',
      '/api/docs',
      '/api/health',
      '/swagger',
    ];

    if (publicRoutes.some(route => req.path.startsWith(route))) {
      return next();
    }

    // Extrair token
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Token não fornecido');
    }

    const token = authHeader.substring(7);

    try {
      // Validar token
      const payload = this.jwtService.verify(token);

      if (!payload || !payload.tenantId) {
        throw new UnauthorizedException('Token inválido');
      }

      // Verificar se tenant existe e está ativo
      const tenant = await this.prisma.tenant.findUnique({
        where: { id: payload.tenantId },
      });

      if (!tenant) {
        throw new UnauthorizedException('Tenant não encontrado');
      }

      if (tenant.estado !== 'ativa') {
        throw new ForbiddenException('Tenant inativo ou em configuração');
      }

      // Anexar ao request
      req.tenantId = payload.tenantId;
      req.user = {
        id: payload.sub,
        email: payload.email,
        tenantId: payload.tenantId,
        perfil: payload.perfil,
      };

      next();
    } catch (error) {
      throw new UnauthorizedException('Token inválido ou expirado');
    }
  }
}
