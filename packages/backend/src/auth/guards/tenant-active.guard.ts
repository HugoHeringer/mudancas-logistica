import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
  HttpException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../prisma/prisma.service';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class TenantActiveGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.tenantId) {
      // Se não houver usuário ou tenantId no request, permite passar
      // (provavelmente será barrado pelo JwtAuthGuard se não for pública)
      return true;
    }

    // Ignorar superadmin
    if (user.isSuperAdmin) {
      return true;
    }

    const tenant = await this.prisma.tenant.findUnique({
      where: { id: user.tenantId },
      select: { eAtivo: true, estado: true, trialFim: true },
    });

    if (!tenant) {
      throw new UnauthorizedException('Empresa não encontrada');
    }

    // estado === 'ativa' → permitir tudo
    if (tenant.estado === 'ativa') {
      return true;
    }

    // estado === 'suspensa' → bloquear
    if (tenant.estado === 'suspensa') {
      throw new HttpException(
        {
          statusCode: 402,
          message: 'A sua conta está suspensa. Contacte movefy.pt para continuar.',
        },
        402,
      );
    }

    // estado === 'em_setup' E trial activo → permitir tudo
    if (tenant.estado === 'em_setup') {
      if (tenant.trialFim && new Date(tenant.trialFim) < new Date()) {
        // Trial expirado
        throw new HttpException(
          {
            statusCode: 402,
            message: 'O seu período de trial terminou. Contacte movefy.pt para continuar.',
          },
          402,
        );
      }
      // Trial activo ou sem data (configurado manualmente)
      return true;
    }

    // estado === 'cancelada' → bloquear
    if (tenant.estado === 'cancelada') {
      throw new ForbiddenException(
        'Acesso bloqueado: Conta cancelada. Entre em contato com o suporte.',
      );
    }

    // Qualquer outro estado: permitir (defensivo)
    return true;
  }
}
