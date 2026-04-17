import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string, tenantId: string) {
    // Resolve subdomain to tenant UUID if needed
    let resolvedTenantId = tenantId;
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(tenantId);
    if (!isUuid) {
      const tenant = await this.prisma.tenant.findFirst({
        where: { subdomain: tenantId },
      });
      if (!tenant) {
        throw new UnauthorizedException('Credenciais inválidas');
      }
      resolvedTenantId = tenant.id;
    }

    const user = await this.prisma.user.findFirst({
      where: {
        email,
        tenantId: resolvedTenantId,
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
    return result;
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(
      loginDto.email,
      loginDto.password,
      loginDto.tenantId,
    );

    const payload = {
      sub: user.id,
      email: user.email,
      tenantId: user.tenantId,
      perfil: user.perfil,
    };

    await this.prisma.user.update({
      where: { id: user.id },
      data: { ultimaSessao: new Date() },
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
      accessToken: this.jwtService.sign(payload),
      refreshToken: this.jwtService.sign(payload, {
        secret: process.env.JWT_REFRESH_SECRET,
        expiresIn: '7d',
      }),
    };
  }

  async register(registerDto: RegisterDto) {
    // Validar se tenant existe
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: registerDto.tenantId },
      select: { id: true },
    });

    if (!tenant) {
      throw new BadRequestException('Empresa inválida');
    }

    // Verificar se usuário já existe
    const existingUser = await this.prisma.user.findFirst({
      where: {
        email: registerDto.email,
        tenantId: registerDto.tenantId,
      },
    });

    if (existingUser) {
      throw new ConflictException('Email já registado');
    }

    const passwordHash = await bcrypt.hash(registerDto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        nome: registerDto.nome,
        email: registerDto.email,
        passwordHash,
        perfil: registerDto.perfil,
        tenantId: registerDto.tenantId,
        permissoes: registerDto.permissoes,
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
      });

      if (!user || !user.eAtivo) {
        throw new UnauthorizedException('Utilizador inválido');
      }

      const newPayload = {
        sub: user.id,
        email: user.email,
        tenantId: user.tenantId,
        perfil: user.perfil,
      };

      return {
        accessToken: this.jwtService.sign(newPayload),
      };
    } catch {
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
}
