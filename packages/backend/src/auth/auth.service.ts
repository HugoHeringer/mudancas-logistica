import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  /**
   * Resolve a tenant identifier (UUID, subdomain, or slug) to a tenant record.
   */
  private async resolveTenant(tenantId: string, slug?: string) {
    // If it's already a UUID, fetch directly
    if (UUID_REGEX.test(tenantId)) {
      const tenant = await this.prisma.tenant.findUnique({
        where: { id: tenantId },
      });
      if (!tenant || !tenant.eAtivo) {
        throw new UnauthorizedException('Empresa não encontrada');
      }
      return tenant;
    }

    // Otherwise resolve by slug or subdomain
    const tenant = await this.prisma.tenant.findFirst({
      where: {
        OR: [
          ...(slug ? [{ slug }] : []),
          { subdomain: tenantId },
        ],
        eAtivo: true,
      },
    });

    if (!tenant) {
      throw new UnauthorizedException('Empresa não encontrada');
    }

    return tenant;
  }

  async validateUser(email: string, password: string, tenantId: string, slug?: string) {
    // Super-admin path: bypass tenant resolution
    if (tenantId === 'superadmin') {
      const user = await this.prisma.user.findFirst({
        where: {
          email,
          isSuperAdmin: true,
        },
      });

      if (!user) {
        throw new UnauthorizedException('Credenciais inválidas');
      }

      if (!user.eAtivo) {
        throw new UnauthorizedException('Utilizador inativo');
      }

      const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
      if (!isPasswordValid) {
        throw new UnauthorizedException('Credenciais inválidas');
      }

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { passwordHash, ...result } = user;
      // Return a pseudo-tenant for super-admin
      const pseudoTenant = { id: user.tenantId || 'superadmin', slug: 'superadmin', subdomain: 'superadmin', eAtivo: true, estado: 'ativa' };
      return { user: result, tenant: pseudoTenant };
    }

    const tenant = await this.resolveTenant(tenantId, slug);

    const user = await this.prisma.user.findFirst({
      where: {
        email,
        tenantId: tenant.id,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    if (!user.eAtivo) {
      throw new UnauthorizedException('Utilizador inativo');
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, ...result } = user;
    return { user: result, tenant };
  }

  async login(loginDto: LoginDto) {
    const { user, tenant } = await this.validateUser(
      loginDto.email,
      loginDto.password,
      loginDto.tenantId,
      loginDto.slug,
    );

    const slug = tenant.slug || tenant.subdomain;

    const payload = {
      sub: user.id,
      email: user.email,
      tenantId: user.tenantId,
      perfil: user.perfil,
      isSuperAdmin: (user as any).isSuperAdmin === true,
      slug,
    };

    // Record last login
    await this.prisma.user.update({
      where: { id: user.id },
      data: { ultimoLogin: new Date() },
    });

    // Se for motorista, buscar o motoristaId
    let motoristaId: string | null = null;
    if (user.perfil === 'motorista') {
      const motorista = await this.prisma.motorista.findFirst({
        where: { tenantId: user.tenantId, userId: user.id },
      });
      motoristaId = motorista?.id || null;
    }

    return {
      user: {
        id: user.id,
        email: user.email,
        nome: user.nome,
        perfil: user.perfil,
        tenantId: user.tenantId,
        motoristaId,
      },
      requirePasswordChange: (user as any).obrigarTrocaSenha === true,
      accessToken: this.jwtService.sign(payload),
      refreshToken: this.jwtService.sign(payload, {
        secret: process.env.JWT_REFRESH_SECRET,
        expiresIn: '7d',
      }),
    };
  }

  async register(registerDto: RegisterDto, creator?: any) {
    const tenantId = registerDto.tenantId || creator?.tenantId;

    if (!tenantId) {
      throw new BadRequestException('Empresa não especificada');
    }

    // Validar se tenant existe
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { id: true },
    });

    if (!tenant) {
      throw new BadRequestException('Empresa inválida');
    }

    // Restringir perfis: se houver criador admin, permite qualquer perfil
    // Caso contrário, apenas motorista/operacional
    const isAdmin = creator?.perfil === 'admin' || creator?.isSuperAdmin;
    const perfisPermitidos = isAdmin
      ? ['admin', 'gerente', 'financeiro', 'operacional', 'motorista']
      : ['motorista', 'operacional'];

    if (!perfisPermitidos.includes(registerDto.perfil)) {
      throw new BadRequestException(
        'Perfil não permitido para este nível de acesso',
      );
    }

    // Verificar se usuário já existe
    const existingUser = await this.prisma.user.findFirst({
      where: {
        email: registerDto.email,
        tenantId,
      },
    });

    if (existingUser) {
      throw new ConflictException('Email já registado nesta empresa');
    }

    const passwordHash = await bcrypt.hash(registerDto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        nome: registerDto.nome,
        email: registerDto.email,
        passwordHash,
        perfil: registerDto.perfil,
        tenantId,
        permissoes: registerDto.permissoes as any,
        motoristaId: registerDto.motoristaId || null,
        obrigarTrocaSenha: registerDto.obrigarTrocaSenha ?? false,
      },
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash: _, ...result } = user;
    return result;
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        include: { tenant: { select: { estado: true, eAtivo: true } } },
      });

      if (!user || !user.eAtivo) {
        throw new UnauthorizedException('Utilizador inválido');
      }

      // Verificar se tenant está ativo
      if (!user.tenant?.eAtivo || user.tenant?.estado === 'suspensa') {
        throw new UnauthorizedException('Conta suspensa');
      }

      const newPayload = {
        sub: user.id,
        email: user.email,
        tenantId: user.tenantId,
        perfil: user.perfil,
        slug: payload.slug,
      };

      return {
        accessToken: this.jwtService.sign(newPayload),
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) throw error;
      throw new UnauthorizedException('Refresh token inválido');
    }
  }

  async updatePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('Utilizador não encontrado');
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Senha atual inválida');
    }

    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newPasswordHash },
    });

    return { message: 'Senha atualizada com sucesso' };
  }

  async changePassword(userId: string, senhaAtual: string | undefined, novaSenha: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('Utilizador não encontrado');
    }

    // If obrigarTrocaSenha, skip current password check (first login forced change)
    if (!user.obrigarTrocaSenha && senhaAtual) {
      const isPasswordValid = await bcrypt.compare(senhaAtual, user.passwordHash);
      if (!isPasswordValid) {
        throw new UnauthorizedException('Senha atual inválida');
      }
    } else if (!user.obrigarTrocaSenha && !senhaAtual) {
      throw new BadRequestException('Senha atual é obrigatória');
    }

    const newPasswordHash = await bcrypt.hash(novaSenha, 10);
    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newPasswordHash, obrigarTrocaSenha: false },
    });

    return { message: 'Senha alterada com sucesso' };
  }
}
