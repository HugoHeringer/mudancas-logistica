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
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
let TenantService = (() => {
    let _classDecorators = [Injectable()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var TenantService = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            TenantService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        prisma;
        constructor(prisma) {
            this.prisma = prisma;
        }
        async create(createTenantDto) {
            // Verificar se subdomínio já existe
            const existing = await this.prisma.tenant.findUnique({
                where: { subdomain: createTenantDto.subdomain },
            });
            if (existing) {
                throw new ConflictException('Subdomínio já registado');
            }
            return this.prisma.tenant.create({
                data: {
                    subdomain: createTenantDto.subdomain,
                    estado: createTenantDto.estado || 'em_setup',
                    configMarca: createTenantDto.configMarca || {},
                    configPreco: createTenantDto.configPreco || {},
                    configAgenda: createTenantDto.configAgenda || {},
                },
            });
        }
        async findAll() {
            return this.prisma.tenant.findMany({
                orderBy: { createdAt: 'desc' },
            });
        }
        async findOne(id) {
            const tenant = await this.prisma.tenant.findUnique({
                where: { id },
                include: {
                    users: {
                        select: {
                            id: true,
                            nome: true,
                            email: true,
                            perfil: true,
                            eAtivo: true,
                        },
                    },
                    _count: {
                        select: {
                            mudancas: true,
                            clientes: true,
                            motoristas: true,
                            veiculos: true,
                        },
                    },
                },
            });
            if (!tenant) {
                throw new NotFoundException('Tenant não encontrado');
            }
            return tenant;
        }
        async findBySubdomain(subdomain) {
            const tenant = await this.prisma.tenant.findUnique({
                where: { subdomain },
            });
            if (!tenant) {
                throw new NotFoundException('Tenant não encontrado');
            }
            return tenant;
        }
        async update(id, updateTenantDto) {
            const tenant = await this.prisma.tenant.findUnique({ where: { id } });
            if (!tenant) {
                throw new NotFoundException('Tenant não encontrado');
            }
            return this.prisma.tenant.update({
                where: { id },
                data: updateTenantDto,
            });
        }
        async remove(id) {
            const tenant = await this.prisma.tenant.findUnique({ where: { id } });
            if (!tenant) {
                throw new NotFoundException('Tenant não encontrado');
            }
            return this.prisma.tenant.delete({
                where: { id },
            });
        }
        async updateLastAccess(id) {
            return this.prisma.tenant.update({
                where: { id },
                data: { dataUltimoAcesso: new Date() },
            });
        }
        async getStats(tenantId) {
            const [mudancasCount, clientesCount, motoristasCount, veiculosCount, receitaMes] = await Promise.all([
                this.prisma.mudanca.count({ where: { tenantId } }),
                this.prisma.cliente.count({ where: { tenantId } }),
                this.prisma.motorista.count({ where: { tenantId } }),
                this.prisma.veiculo.count({ where: { tenantId } }),
                this.prisma.movimentoFinanceiro.aggregate({
                    where: {
                        tenantId,
                        tipo: 'receita',
                        data: {
                            gte: new Date(new Date().setDate(1)).toISOString().split('T')[0],
                        },
                    },
                    _sum: { valor: true },
                }),
            ]);
            return {
                mudancas: mudancasCount,
                clientes: clientesCount,
                motoristas: motoristasCount,
                veiculos: veiculosCount,
                receitaMes: receitaMes._sum.valor || 0,
            };
        }
    };
    return TenantService = _classThis;
})();
export { TenantService };
