var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
let AuthService = (() => {
    let _classDecorators = [Injectable()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var AuthService = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            AuthService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        prisma;
        jwtService;
        constructor(prisma, jwtService) {
            this.prisma = prisma;
            this.jwtService = jwtService;
        }
        async validateUser(email, password, tenantId) {
            const user = await this.prisma.user.findFirst({
                where: {
                    email,
                    tenantId,
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
        async login(loginDto) {
            const user = await this.validateUser(loginDto.email, loginDto.password, loginDto.tenantId);
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
            let motoristaId = null;
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
        async register(registerDto) {
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
        async refreshToken(refreshToken) {
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
            }
            catch {
                throw new UnauthorizedException('Refresh token inválido');
            }
        }
        async updatePassword(userId, currentPassword, newPassword) {
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
    };
    return AuthService = _classThis;
})();
export { AuthService };
