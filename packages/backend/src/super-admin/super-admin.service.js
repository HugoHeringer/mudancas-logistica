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
import { Injectable, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
let SuperAdminService = (() => {
    let _classDecorators = [Injectable()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var SuperAdminService = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            SuperAdminService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        prisma;
        constructor(prisma) {
            this.prisma = prisma;
        }
        async getAllTenants() {
            return this.prisma.tenant.findMany({
                orderBy: { createdAt: 'desc' },
                include: {
                    _count: {
                        select: {
                            users: true,
                            mudancas: true,
                            clientes: true,
                            motoristas: true,
                            veiculos: true,
                        },
                    },
                },
            });
        }
        async getTenantStats() {
            const [totalTenants, activeTenants, totalMudancas, totalClientes] = await Promise.all([
                this.prisma.tenant.count(),
                this.prisma.tenant.count({ where: { estado: 'ativa' } }),
                this.prisma.mudanca.count(),
                this.prisma.cliente.count(),
            ]);
            return {
                totalTenants,
                activeTenants,
                totalMudancas,
                totalClientes,
            };
        }
        async createTenantWithAdmin(createTenantDto) {
            // Verificar se subdomínio já existe
            const existingSubdomain = await this.prisma.tenant.findUnique({
                where: { subdomain: createTenantDto.subdomain },
            });
            if (existingSubdomain) {
                throw new ConflictException('Subdomínio já registado');
            }
            // Verificar se email do admin já existe
            const existingEmail = await this.prisma.user.findFirst({
                where: { email: createTenantDto.adminEmail },
            });
            if (existingEmail) {
                throw new ConflictException('Email de admin já registado');
            }
            // Criar tenant
            const tenant = await this.prisma.tenant.create({
                data: {
                    subdomain: createTenantDto.subdomain,
                    estado: createTenantDto.estado || 'em_setup',
                    configMarca: createTenantDto.configMarca || {},
                    configPreco: createTenantDto.configPreco || {},
                    configAgenda: createTenantDto.configAgenda || {},
                },
            });
            // Criar admin
            const passwordHash = await bcrypt.hash(createTenantDto.adminPassword, 10);
            const adminUser = await this.prisma.user.create({
                data: {
                    tenantId: tenant.id,
                    nome: createTenantDto.adminNome,
                    email: createTenantDto.adminEmail,
                    passwordHash,
                    perfil: 'admin',
                    eAtivo: true,
                },
            });
            // Atualizar tenant com adminUserId
            await this.prisma.tenant.update({
                where: { id: tenant.id },
                data: { adminUserId: adminUser.id },
            });
            // Inicializar templates de email
            await this.initializeEmailTemplates(tenant.id);
            return {
                tenant,
                admin: {
                    id: adminUser.id,
                    nome: adminUser.nome,
                    email: adminUser.email,
                },
            };
        }
        async updateTenantEstado(id, estado) {
            return this.prisma.tenant.update({
                where: { id },
                data: { estado },
            });
        }
        async deleteTenant(id) {
            return this.prisma.tenant.delete({
                where: { id },
            });
        }
        async resetAdminPassword(tenantId, newPassword) {
            const tenant = await this.prisma.tenant.findUnique({
                where: { id: tenantId },
            });
            if (!tenant || !tenant.adminUserId) {
                throw new Error('Tenant não encontrado ou sem admin associado');
            }
            const passwordHash = await bcrypt.hash(newPassword, 10);
            await this.prisma.user.update({
                where: { id: tenant.adminUserId },
                data: { passwordHash },
            });
            return { message: 'Senha do admin redefinida com sucesso' };
        }
        async initializeEmailTemplates(tenantId) {
            const defaultTemplates = [
                {
                    nome: 'confirmacao_rececao',
                    assunto: 'Solicitação de mudança recebida - {{nomeCliente}}',
                    corpo: `Olá {{nomeCliente}},\n\nRecebemos a sua solicitação de mudança para {{dataPretendida}}.\n\nEm breve entraremos em contacto para confirmar os detalhes.\n\nObrigado,\n{{nomeEmpresa}}`,
                    variaveis: ['nomeCliente', 'dataPretendida', 'nomeEmpresa'],
                    eAtivo: true,
                },
                {
                    nome: 'confirmacao_aprovacao',
                    assunto: 'Mudança confirmada - {{dataPretendida}}',
                    corpo: `Olá {{nomeCliente}},\n\nA sua mudança foi confirmada para {{dataPretendida}} às {{horaPretendida}}.\n\nMotorista: {{motoristaNome}}\nEquipa: {{equipa}}\n\nObrigado,\n{{nomeEmpresa}}`,
                    variaveis: ['nomeCliente', 'dataPretendida', 'horaPretendida', 'motoristaNome', 'equipa', 'nomeEmpresa'],
                    eAtivo: true,
                },
                {
                    nome: 'inicio_deslocamento',
                    assunto: 'O motorista está a caminho',
                    corpo: `Olá {{nomeCliente}},\n\nO nosso motorista {{motoristaNome}} está a caminho para a sua mudança.\n\nPrevisão de chegada: {{previsaoChegada}}\n\nObrigado,\n{{nomeEmpresa}}`,
                    variaveis: ['nomeCliente', 'motoristaNome', 'previsaoChegada', 'nomeEmpresa'],
                    eAtivo: true,
                },
                {
                    nome: 'mudanca_concluida',
                    assunto: 'Mudança concluída',
                    corpo: `Olá {{nomeCliente}},\n\nA sua mudança foi concluída com sucesso.\n\nObrigado por escolher a {{nomeEmpresa}}!`,
                    variaveis: ['nomeCliente', 'nomeEmpresa'],
                    eAtivo: true,
                },
                {
                    nome: 'recusa_mudanca',
                    assunto: 'Solicitação de mudança - {{nomeCliente}}',
                    corpo: `Olá {{nomeCliente}},\n\nInfelizmente não podemos aceitar a sua solicitação de mudança.\n\nMotivo: {{motivo}}\n\nObrigado,\n{{nomeEmpresa}}`,
                    variaveis: ['nomeCliente', 'motivo', 'nomeEmpresa'],
                    eAtivo: true,
                },
            ];
            for (const template of defaultTemplates) {
                await this.prisma.emailTemplate.create({
                    data: { ...template, tenantId },
                });
            }
        }
    };
    return SuperAdminService = _classThis;
})();
export { SuperAdminService };
