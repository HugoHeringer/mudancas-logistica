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
import { Injectable } from '@nestjs/common';
let FinanceiroService = (() => {
    let _classDecorators = [Injectable()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var FinanceiroService = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            FinanceiroService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        prisma;
        constructor(prisma) {
            this.prisma = prisma;
        }
        async createMovimento(tenantId, createMovimentoDto) {
            return this.prisma.movimentoFinanceiro.create({
                data: {
                    tenantId,
                    ...createMovimentoDto,
                },
            });
        }
        async findAll(tenantId, filters) {
            const where = { tenantId };
            if (filters?.tipo) {
                where.tipo = filters.tipo;
            }
            if (filters?.categoria) {
                where.categoria = filters.categoria;
            }
            if (filters?.dataInicio || filters?.dataFim) {
                where.data = {};
                if (filters.dataInicio)
                    where.data.gte = filters.dataInicio;
                if (filters.dataFim)
                    where.data.lte = filters.dataFim;
            }
            if (filters?.mudancaId) {
                where.mudancaId = filters.mudancaId;
            }
            return this.prisma.movimentoFinanceiro.findMany({
                where,
                orderBy: { data: 'desc' },
            });
        }
        async getResumo(tenantId, dataInicio, dataFim) {
            const [receitas, custos] = await Promise.all([
                this.prisma.movimentoFinanceiro.aggregate({
                    where: {
                        tenantId,
                        tipo: 'receita',
                        data: {
                            gte: dataInicio,
                            lte: dataFim,
                        },
                    },
                    _sum: { valor: true },
                    _count: true,
                }),
                this.prisma.movimentoFinanceiro.aggregate({
                    where: {
                        tenantId,
                        tipo: 'custo',
                        data: {
                            gte: dataInicio,
                            lte: dataFim,
                        },
                    },
                    _sum: { valor: true },
                    _count: true,
                }),
            ]);
            const receitaTotal = receitas._sum.valor || 0;
            const custosTotais = custos._sum.valor || 0;
            const margemTotal = receitaTotal - custosTotais;
            const margemPercentual = receitaTotal > 0 ? (margemTotal / receitaTotal) * 100 : 0;
            return {
                periodo: { inicio: dataInicio, fim: dataFim },
                receitaTotal,
                custosTotais,
                margemTotal,
                margemPercentual: Math.round(margemPercentual * 100) / 100,
                receitasCount: receitas._count,
                custosCount: custos._count,
            };
        }
        async getBreakdownMotorista(tenantId, dataInicio, dataFim) {
            const mudancas = await this.prisma.mudanca.findMany({
                where: {
                    tenantId,
                    estado: 'concluida',
                    dataPretendida: {
                        gte: dataInicio,
                        lte: dataFim,
                    },
                    motoristaId: { not: null },
                },
                include: {
                    motorista: {
                        select: {
                            id: true,
                            nome: true,
                        },
                    },
                },
            });
            const breakdown = mudancas.reduce((acc, m) => {
                const mid = m.motoristaId || '_none';
                if (!acc[mid]) {
                    acc[mid] = {
                        motoristaId: m.motoristaId,
                        motoristaNome: m.motorista?.nome || 'N/A',
                        receitaGerada: 0,
                        custosCombustivel: 0,
                        custosAlimentacao: 0,
                        mudancasCount: 0,
                    };
                }
                acc[mid].receitaGerada += m.receitaRealizada || 0;
                acc[mid].custosCombustivel += m.conclusao?.combustivel?.valor || 0;
                acc[mid].custosAlimentacao += m.conclusao?.alimentacao?.valor || 0;
                acc[mid].mudancasCount += 1;
                return acc;
            }, {});
            return Object.values(breakdown).map((b) => ({
                ...b,
                margem: b.receitaGerada - b.custosCombustivel - b.custosAlimentacao,
            }));
        }
        async getBreakdownTipoServico(tenantId, dataInicio, dataFim) {
            const mudancas = await this.prisma.mudanca.findMany({
                where: {
                    tenantId,
                    estado: 'concluida',
                    dataPretendida: {
                        gte: dataInicio,
                        lte: dataFim,
                    },
                },
            });
            const breakdown = mudancas.reduce((acc, m) => {
                const tipo = m.tipoServico;
                if (!acc[tipo]) {
                    acc[tipo] = {
                        tipo,
                        quantidade: 0,
                        receitaTotal: 0,
                        margemTotal: 0,
                    };
                }
                acc[tipo].quantidade += 1;
                acc[tipo].receitaTotal += m.receitaRealizada || 0;
                acc[tipo].margemTotal += m.margem || 0;
                return acc;
            }, {});
            return Object.values(breakdown);
        }
        async getGastosDetalhados(tenantId, dataInicio, dataFim) {
            const [combustivelRegistos, alimentacaoRegistos] = await Promise.all([
                this.prisma.mudanca.findMany({
                    where: {
                        tenantId,
                        estado: 'concluida',
                        dataPretendida: {
                            gte: dataInicio,
                            lte: dataFim,
                        },
                        conclusao: {
                            path: ['combustivel'],
                            not: null,
                        },
                    },
                    select: {
                        id: true,
                        conclusao: true,
                    },
                }),
                this.prisma.mudanca.findMany({
                    where: {
                        tenantId,
                        estado: 'concluida',
                        dataPretendida: {
                            gte: dataInicio,
                            lte: dataFim,
                        },
                        conclusao: {
                            path: ['alimentacao'],
                            not: null,
                        },
                    },
                    select: {
                        id: true,
                        conclusao: true,
                    },
                }),
            ]);
            const combustivel = combustivelRegistos
                .map((m) => ({
                mudancaId: m.id,
                valor: m.conclusao?.combustivel?.valor || 0,
                litros: m.conclusao?.combustivel?.litros || 0,
            }))
                .filter((c) => c.valor > 0);
            const alimentacao = alimentacaoRegistos
                .map((m) => ({
                mudancaId: m.id,
                valor: m.conclusao?.alimentacao?.valor || 0,
            }))
                .filter((a) => a.valor > 0);
            return {
                combustivel: {
                    total: combustivel.reduce((acc, c) => acc + c.valor, 0),
                    porMudanca: combustivel,
                },
                alimentacao: {
                    total: alimentacao.reduce((acc, a) => acc + a.valor, 0),
                    porMudanca: alimentacao,
                },
            };
        }
        async removeMovimento(tenantId, id) {
            return this.prisma.movimentoFinanceiro.delete({
                where: { id, tenantId },
            });
        }
    };
    return FinanceiroService = _classThis;
})();
export { FinanceiroService };
