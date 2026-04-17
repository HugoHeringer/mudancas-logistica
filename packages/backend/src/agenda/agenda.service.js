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
let AgendaService = (() => {
    let _classDecorators = [Injectable()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var AgendaService = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            AgendaService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        prisma;
        constructor(prisma) {
            this.prisma = prisma;
        }
        async getSlotsByDate(tenantId, data) {
            return this.prisma.slotAgenda.findMany({
                where: { tenantId, data },
                orderBy: { horaInicio: 'asc' },
            });
        }
        async getSlotsByRange(tenantId, dataInicio, dataFim) {
            return this.prisma.slotAgenda.findMany({
                where: {
                    tenantId,
                    data: {
                        gte: dataInicio,
                        lte: dataFim,
                    },
                },
                orderBy: [{ data: 'asc' }, { horaInicio: 'asc' }],
            });
        }
        async getDisponibilidade(tenantId, data, horaInicio) {
            const slots = await this.getSlotsByDate(tenantId, data);
            if (horaInicio) {
                const slot = slots.find((s) => s.horaInicio === horaInicio);
                if (!slot)
                    return null;
                return {
                    ...slot,
                    disponivel: !slot.eBloqueado && slot.capacidadeOcupada < slot.capacidadeTotal,
                    slotsLivres: slot.capacidadeTotal - slot.capacidadeOcupada,
                };
            }
            return slots.map((slot) => ({
                ...slot,
                disponivel: !slot.eBloqueado && slot.capacidadeOcupada < slot.capacidadeTotal,
                slotsLivres: slot.capacidadeTotal - slot.capacidadeOcupada,
            }));
        }
        async getAgendaSemanal(tenantId, dataInicio) {
            const inicio = new Date(dataInicio);
            const fim = new Date(inicio);
            fim.setDate(fim.getDate() + 6);
            const slots = await this.getSlotsByRange(tenantId, inicio.toISOString().split('T')[0], fim.toISOString().split('T')[0]);
            // Agrupar por data
            const porData = slots.reduce((acc, slot) => {
                if (!acc[slot.data]) {
                    acc[slot.data] = [];
                }
                acc[slot.data].push(slot);
                return acc;
            }, {});
            return Object.entries(porData).map(([data, slotsDia]) => ({
                data,
                slots: slotsDia,
                capacidadeTotal: slotsDia.reduce((acc, s) => acc + s.capacidadeTotal, 0),
                capacidadeOcupada: slotsDia.reduce((acc, s) => acc + s.capacidadeOcupada, 0),
                disponivel: slotsDia.some((s) => !s.eBloqueado && s.capacidadeOcupada < s.capacidadeTotal),
            }));
        }
        async getAgendaMensal(tenantId, ano, mes) {
            const inicio = new Date(ano, mes - 1, 1);
            const fim = new Date(ano, mes, 0);
            const slots = await this.getSlotsByRange(tenantId, inicio.toISOString().split('T')[0], fim.toISOString().split('T')[0]);
            // Agrupar por data e calcular ocupação
            const porData = slots.reduce((acc, slot) => {
                if (!acc[slot.data]) {
                    acc[slot.data] = {
                        total: 0,
                        ocupada: 0,
                        bloqueada: false,
                    };
                }
                acc[slot.data].total += slot.capacidadeTotal;
                acc[slot.data].ocupada += slot.capacidadeOcupada;
                if (slot.eBloqueado)
                    acc[slot.data].bloqueada = true;
                return acc;
            }, {});
            // Gerar todos os dias do mês
            const diasMes = [];
            for (let d = 1; d <= fim.getDate(); d++) {
                const data = new Date(ano, mes - 1, d).toISOString().split('T')[0];
                const info = porData[data] || { total: 0, ocupada: 0, bloqueada: false };
                diasMes.push({
                    data,
                    total: info.total,
                    ocupada: info.ocupada,
                    bloqueada: info.bloqueada,
                    disponivel: !info.bloqueada && info.ocupada < info.total,
                });
            }
            return diasMes;
        }
        async criarSlots(tenantId, data, slots) {
            // Verificar se já existem slots para esta data
            const existentes = await this.prisma.slotAgenda.findMany({
                where: { tenantId, data },
            });
            if (existentes.length > 0) {
                return existentes;
            }
            // Criar novos slots
            const novosSlots = slots.map((slot) => ({
                tenantId,
                data,
                horaInicio: slot.horaInicio,
                horaFim: slot.horaFim,
                capacidadeTotal: slot.capacidadeTotal || 1,
                capacidadeOcupada: 0,
                eBloqueado: false,
            }));
            return this.prisma.slotAgenda.createMany({
                data: novosSlots,
            });
        }
        async criarBloqueio(tenantId, createBloqueioDto) {
            return this.prisma.bloqueioAgenda.create({
                data: {
                    tenantId,
                    ...createBloqueioDto,
                },
            });
        }
        async removerBloqueio(tenantId, id) {
            return this.prisma.bloqueioAgenda.delete({
                where: { id, tenantId },
            });
        }
        async getConfigAgenda(tenantId) {
            const tenant = await this.prisma.tenant.findUnique({
                where: { id: tenantId },
            });
            return tenant?.configAgenda || {};
        }
        async updateConfigAgenda(tenantId, updateConfigAgendaDto) {
            return this.prisma.tenant.update({
                where: { id: tenantId },
                data: { configAgenda: updateConfigAgendaDto },
            });
        }
        async ocuparSlot(tenantId, data, horaInicio) {
            const slot = await this.prisma.slotAgenda.findFirst({
                where: { tenantId, data, horaInicio },
            });
            if (!slot) {
                throw new Error('Slot não encontrado');
            }
            return this.prisma.slotAgenda.update({
                where: { id: slot.id },
                data: { capacidadeOcupada: { increment: 1 } },
            });
        }
        async liberarSlot(tenantId, data, horaInicio) {
            const slot = await this.prisma.slotAgenda.findFirst({
                where: { tenantId, data, horaInicio },
            });
            if (!slot) {
                throw new Error('Slot não encontrado');
            }
            return this.prisma.slotAgenda.update({
                where: { id: slot.id },
                data: { capacidadeOcupada: { decrement: 1 } },
            });
        }
    };
    return AgendaService = _classThis;
})();
export { AgendaService };
