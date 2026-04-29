import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET')!,
    });
  }

  async validate(payload: any) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: { eAtivo: true, permissoes: true, tenantId: true },
    });

    if (!user || !user.eAtivo) {
      throw new UnauthorizedException('Utilizador inativo');
    }

    // Super-admin bypasses tenant check
    if (payload.isSuperAdmin) {
      return {
        id: payload.sub,
        email: payload.email,
        tenantId: payload.tenantId,
        perfil: payload.perfil,
        isSuperAdmin: true,
        slug: payload.slug,
        permissoes: user.permissoes || {},
      };
    }

    // Check tenant is active
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: user.tenantId },
      select: { eAtivo: true, estado: true },
    });

    if (!tenant || !tenant.eAtivo) {
      throw new UnauthorizedException('Conta suspensa');
    }

    return {
      id: payload.sub,
      email: payload.email,
      tenantId: payload.tenantId,
      perfil: payload.perfil,
      isSuperAdmin: payload.isSuperAdmin === true,
      slug: payload.slug,
      permissoes: user.permissoes || {},
    };
  }
}
