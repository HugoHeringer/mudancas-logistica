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
import { Prisma } from '@prisma/client';
let MudancaService = (() => {
    let _classDecorators = [Injectable()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var MudancaService = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            MudancaService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        prisma;
        constructor(prisma) {
            this.prisma = prisma;
        }
        async create(tenantId, createMudancaDto) {
            return this.prisma.mudanca.create({
                data: {
                    tenantId,
                    ...createMudancaDto,
                    estado: 'pendente',
                    moradaRecolha: createMudancaDto.moradaRecolha,
                    moradaEntrega: createMudancaDto.moradaEntrega,
                    materiais: createMudancaDto.materiais,
                },
                include: {
                    veiculo: true,
                },
            });
        }
        async findAll(tenantId, filters) {
            const where = { tenantId };
            if (filters?.estado) {
                where.estado = { in: filters.estado };
            }
            if (filters?.tipoServico) {
                where.tipoServico = filters.tipoServico;
            }
            if (filters?.motoristaId) {
                where.motoristaId = filters.motoristaId;
            }
            if (filters?.dataInicio || filters?.dataFim) {
                where.dataPretendida = {};
                if (filters.dataInicio)
                    where.dataPretendida.gte = filters.dataInicio;
                if (filters.dataFim)
                    where.dataPretendida.lte = filters.dataFim;
            }
            return this.prisma.mudanca.findMany({
                where,
                include: {
                    veiculo: true,
                    motorista: {
                        select: {
                            id: true,
                            nome: true,
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
            });
        }
        async findOne(tenantId, id) {
            const mudanca = await this.prisma.mudanca.findFirst({
                where: { id, tenantId },
                include: {
                    veiculo: true,
                    motorista: {
                        select: {
                            id: true,
                            nome: true,
                            telefone: true,
                        },
                    },
                    cliente: {
                        select: {
                            id: true,
                            nome: true,
                            apelido: true,
                            email: true,
                            telefone: true,
                            eRecorrente: true,
                        },
                    },
                },
            });
            if (!mudanca) {
                throw new NotFoundException('Mudança não encontrada');
            }
            return mudanca;
        }
        async update(tenantId, id, updateMudancaDto) {
            const mudanca = await this.findOne(tenantId, id);
            return this.prisma.mudanca.update({
                where: { id },
                data: updateMudancaDto,
                include: {
                    veiculo: true,
                    motorista: true,
                },
            });
        }
        async aprovar(tenantId, id, aprovarMudancaDto) {
            const mudanca = await this.findOne(tenantId, id);
            // Atualizar estado do motorista
            if (aprovarMudancaDto.motoristaId) {
                await this.prisma.motorista.update({
                    where: { id: aprovarMudancaDto.motoristaId },
                    data: { estado: 'em_servico' },
                });
            }
            // Ocupar slot na agenda
            const dataMudanca = mudanca.dataPretendida;
            const slot = await this.prisma.slotAgenda.findFirst({
                where: {
                    tenantId,
                    data: dataMudanca,
                    horaInicio: mudanca.horaPretendida || '08:00',
                },
            });
            if (slot) {
                await this.prisma.slotAgenda.update({
                    where: { id: slot.id },
                    data: { capacidadeOcupada: { increment: 1 } },
                });
            }
            return this.prisma.mudanca.update({
                where: { id },
                data: {
                    estado: 'aprovada',
                    aprovadoPor: aprovarMudancaDto.aprovadoPor,
                    aprovadoEm: new Date(),
                    motoristaId: aprovarMudancaDto.motoristaId,
                    ajudantesIds: aprovarMudancaDto.ajudantesIds || [],
                    tempoEstimadoHoras: aprovarMudancaDto.tempoEstimadoHoras,
                    observacoesAdmin: aprovarMudancaDto.observacoesAdmin,
                },
                include: {
                    veiculo: true,
                    motorista: true,
                },
            });
        }
        async iniciarDeslocamento(tenantId, id, motoristaId) {
            const mudanca = await this.findOne(tenantId, id);
            if (mudanca.motoristaId !== motoristaId) {
                throw new NotFoundException('Mudança não atribuída a este motorista');
            }
            return this.prisma.mudanca.update({
                where: { id },
                data: { estado: 'a_caminho' },
            });
        }
        async emServico(tenantId, id, motoristaId) {
            const mudanca = await this.findOne(tenantId, id);
            if (mudanca.motoristaId !== motoristaId) {
                throw new NotFoundException('Mudança não atribuída a este motorista');
            }
            return this.prisma.mudanca.update({
                where: { id },
                data: { estado: 'em_servico' },
            });
        }
        async concluir(tenantId, id, concluirMudancaDto) {
            const mudanca = await this.findOne(tenantId, id);
            // Calcular financeiro
            const veiculo = mudanca.veiculoId
                ? await this.prisma.veiculo.findUnique({
                    where: { id: mudanca.veiculoId },
                })
                : null;
            const precoHora = veiculo?.precoHora || 0;
            const receitaRealizada = concluirMudancaDto.horasCobradas * precoHora;
            const custosCombustivel = concluirMudancaDto.combustivel?.valor || 0;
            const custosAlimentacao = concluirMudancaDto.alimentacao?.teve
                ? concluirMudancaDto.alimentacao.valor
                : 0;
            const custosOperacionais = custosCombustivel + custosAlimentacao;
            const margem = receitaRealizada - custosOperacionais;
            return this.prisma.mudanca.update({
                where: { id },
                data: {
                    estado: 'concluida',
                    conclusao: concluirMudancaDto,
                    concluidoPor: concluirMudancaDto.concluidoPor,
                    concluidoEm: new Date(),
                    receitaRealizada,
                    custosOperacionais,
                    margem,
                },
            });
        }
        async recusar(tenantId, id, motivo) {
            const mudanca = await this.findOne(tenantId, id);
            return this.prisma.mudanca.update({
                where: { id },
                data: {
                    estado: 'recusada',
                    observacoesAdmin: motivo,
                },
            });
        }
        async cancelar(tenantId, id) {
            const mudanca = await this.findOne(tenantId, id);
            return this.prisma.mudanca.update({
                where: { id },
                data: { estado: 'cancelada' },
            });
        }
        async remove(tenantId, id) {
            await this.findOne(tenantId, id);
            return this.prisma.mudanca.delete({
                where: { id },
            });
        }
        async getMinhas(tenantId, userId, filters) {
            // Encontrar o motorista associado a este user
            const motorista = await this.prisma.motorista.findFirst({
                where: { tenantId, userId },
            });
            if (!motorista) {
                return [];
            }
            const where = { tenantId, motoristaId: motorista.id };
            if (filters?.data) {
                where.dataPretendida = filters.data;
            }
            if (filters?.estado) {
                where.estado = filters.estado;
            }
            if (filters?.dataInicio || filters?.dataFim) {
                where.dataPretendida = {};
                if (filters.dataInicio)
                    where.dataPretendida.gte = filters.dataInicio;
                if (filters.dataFim)
                    where.dataPretendida.lte = filters.dataFim;
            }
            return this.prisma.mudanca.findMany({
                where,
                include: {
                    veiculo: true,
                    motorista: {
                        select: { id: true, nome: true, telefone: true },
                    },
                },
                orderBy: { horaPretendida: 'asc' },
            });
        }
        async getDashboard(tenantId) {
            const hoje = new Date().toISOString().split('T')[0];
            const [mudancasHoje, pendentes, emCurso, concluidasSemFicha, estatisticasMes,] = await Promise.all([
                this.prisma.mudanca.findMany({
                    where: { tenantId, dataPretendida: hoje },
                    include: { motorista: true, veiculo: true },
                }),
                this.prisma.mudanca.count({ where: { tenantId, estado: 'pendente' } }),
                this.prisma.mudanca.count({ where: { tenantId, estado: { in: ['a_caminho', 'em_servico'] } } }),
                this.prisma.mudanca.count({
                    where: {
                        tenantId,
                        estado: 'concluida',
                        conclusao: { equals: Prisma.DbNull },
                    },
                }),
                this.prisma.mudanca.aggregate({
                    where: {
                        tenantId,
                        createdAt: {
                            gte: new Date(new Date().setDate(1)).toISOString(),
                        },
                    },
                    _sum: {
                        receitaRealizada: true,
                        custosOperacionais: true,
                        margem: true,
                    },
                    _count: true,
                }),
            ]);
            return {
                hoje: {
                    mudancas: mudancasHoje,
                    total: mudancasHoje.length,
                },
                pendentes,
                emCurso,
                concluidasSemFicha,
                mes: {
                    total: estatisticasMes._count,
                    receita: estatisticasMes._sum.receitaRealizada || 0,
                    custos: estatisticasMes._sum.custosOperacionais || 0,
                    margem: estatisticasMes._sum.margem || 0,
                },
            };
        }
    };
    return MudancaService = _classThis;
})();
export { MudancaService };
