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
import { Injectable, NotFoundException } from '@nestjs/common';
let MotoristaService = (() => {
    let _classDecorators = [Injectable()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var MotoristaService = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            MotoristaService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        prisma;
        constructor(prisma) {
            this.prisma = prisma;
        }
        async create(tenantId, createMotoristaDto) {
            return this.prisma.motorista.create({
                data: {
                    tenantId,
                    ...createMotoristaDto,
                },
                include: {
                    veiculo: true,
                },
            });
        }
        async findAll(tenantId, filters) {
            const where = { tenantId };
            if (filters?.estado) {
                where.estado = filters.estado;
            }
            if (filters?.veiculoId) {
                where.veiculoId = filters.veiculoId;
            }
            if (filters?.search) {
                where.OR = [
                    { nome: { contains: filters.search, mode: 'insensitive' } },
                    { email: { contains: filters.search, mode: 'insensitive' } },
                ];
            }
            return this.prisma.motorista.findMany({
                where,
                include: {
                    veiculo: true,
                },
                orderBy: { nome: 'asc' },
            });
        }
        async findOne(tenantId, id) {
            const motorista = await this.prisma.motorista.findFirst({
                where: { id, tenantId },
                include: {
                    veiculo: true,
                    mudancas: {
                        take: 10,
                        orderBy: { createdAt: 'desc' },
                    },
                },
            });
            if (!motorista) {
                throw new NotFoundException('Motorista não encontrado');
            }
            return motorista;
        }
        async findByUserId(tenantId, userId) {
            const motorista = await this.prisma.motorista.findFirst({
                where: { tenantId, userId },
                include: { veiculo: true },
            });
            if (!motorista) {
                throw new NotFoundException('Motorista não encontrado para este utilizador');
            }
            return motorista;
        }
        async getDisponiveis(tenantId, data) {
            const where = {
                tenantId,
                estado: 'disponivel',
            };
            // Excluir motoristas já ocupados na data
            if (data) {
                const ocupados = await this.prisma.mudanca.findMany({
                    where: {
                        tenantId,
                        dataPretendida: data,
                        estado: { in: ['aprovada', 'a_caminho', 'em_servico'] },
                    },
                    select: { motoristaId: true },
                });
                const ocupadosIds = ocupados.map((m) => m.motoristaId).filter(Boolean);
                if (ocupadosIds.length > 0) {
                    where.id = { notIn: ocupadosIds };
                }
            }
            return this.prisma.motorista.findMany({
                where,
                include: {
                    veiculo: true,
                },
            });
        }
        async update(tenantId, id, updateMotoristaDto) {
            const motorista = await this.findOne(tenantId, id);
            return this.prisma.motorista.update({
                where: { id },
                data: updateMotoristaDto,
                include: {
                    veiculo: true,
                },
            });
        }
        async updateEstado(id, estado) {
            return this.prisma.motorista.update({
                where: { id },
                data: { estado },
            });
        }
        async getPerformance(tenantId, motoristaId, mes, ano) {
            const inicioMes = new Date(ano, mes - 1, 1).toISOString().split('T')[0];
            const fimMes = new Date(ano, mes, 0).toISOString().split('T')[0];
            const mudancas = await this.prisma.mudanca.findMany({
                where: {
                    tenantId,
                    motoristaId,
                    dataPretendida: {
                        gte: inicioMes,
                        lte: fimMes,
                    },
                    estado: 'concluida',
                },
            });
            const horasTrabalhadas = mudancas.reduce((acc, m) => acc + m.conclusao?.horasRegistadas || 0, 0);
            const receitaGerada = mudancas.reduce((acc, m) => acc + (m.receitaRealizada || 0), 0);
            const custosCombustivel = mudancas.reduce((acc, m) => acc + (m.conclusao?.combustivel?.valor || 0), 0);
            const custosAlimentacao = mudancas.reduce((acc, m) => acc + (m.conclusao?.alimentacao?.valor || 0), 0);
            const margem = receitaGerada - custosCombustivel - custosAlimentacao;
            return {
                motoristaId,
                mudancasNoMes: mudancas.length,
                horasTrabalhadas,
                receitaGerada,
                custosCombustivel,
                custosAlimentacao,
                margem,
            };
        }
        async remove(tenantId, id) {
            await this.findOne(tenantId, id);
            return this.prisma.motorista.delete({
                where: { id },
            });
        }
    };
    return MotoristaService = _classThis;
})();
export { MotoristaService };
