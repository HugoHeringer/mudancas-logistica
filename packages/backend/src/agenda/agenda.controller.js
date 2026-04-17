var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
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
import { Controller, Get, Post, Delete, HttpCode, HttpStatus, Patch, } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
function getTenantId(req) {
    if (!req.tenantId) {
        throw new Error('Tenant ID não encontrado');
    }
    return req.tenantId;
}
let AgendaController = (() => {
    let _classDecorators = [ApiTags('agenda'), Controller('agenda'), ApiBearerAuth()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _getSlotsByDate_decorators;
    let _getSlotsByRange_decorators;
    let _getDisponibilidade_decorators;
    let _getAgendaSemanal_decorators;
    let _getAgendaMensal_decorators;
    let _criarSlots_decorators;
    let _criarBloqueio_decorators;
    let _removerBloqueio_decorators;
    let _getConfigAgenda_decorators;
    let _updateConfigAgenda_decorators;
    var AgendaController = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _getSlotsByDate_decorators = [Get('slots/:data'), ApiOperation({ summary: 'Obter slots de uma data específica' })];
            _getSlotsByRange_decorators = [Get('slots'), ApiOperation({ summary: 'Obter slots de um período' })];
            _getDisponibilidade_decorators = [Get('disponibilidade/:data'), ApiOperation({ summary: 'Verificar disponibilidade de uma data' })];
            _getAgendaSemanal_decorators = [Get('semanal/:dataInicio'), ApiOperation({ summary: 'Obter agenda semanal' })];
            _getAgendaMensal_decorators = [Get('mensal/:ano/:mes'), ApiOperation({ summary: 'Obter agenda mensal' })];
            _criarSlots_decorators = [Post('slots/:data'), ApiOperation({ summary: 'Criar slots para uma data' })];
            _criarBloqueio_decorators = [Post('bloqueios'), HttpCode(HttpStatus.CREATED), ApiOperation({ summary: 'Criar bloqueio de agenda' })];
            _removerBloqueio_decorators = [Delete('bloqueios/:id'), HttpCode(HttpStatus.NO_CONTENT), ApiOperation({ summary: 'Remover bloqueio de agenda' })];
            _getConfigAgenda_decorators = [Get('config'), ApiOperation({ summary: 'Obter configuração da agenda' })];
            _updateConfigAgenda_decorators = [Patch('config'), ApiOperation({ summary: 'Atualizar configuração da agenda' })];
            __esDecorate(this, null, _getSlotsByDate_decorators, { kind: "method", name: "getSlotsByDate", static: false, private: false, access: { has: obj => "getSlotsByDate" in obj, get: obj => obj.getSlotsByDate }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getSlotsByRange_decorators, { kind: "method", name: "getSlotsByRange", static: false, private: false, access: { has: obj => "getSlotsByRange" in obj, get: obj => obj.getSlotsByRange }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getDisponibilidade_decorators, { kind: "method", name: "getDisponibilidade", static: false, private: false, access: { has: obj => "getDisponibilidade" in obj, get: obj => obj.getDisponibilidade }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getAgendaSemanal_decorators, { kind: "method", name: "getAgendaSemanal", static: false, private: false, access: { has: obj => "getAgendaSemanal" in obj, get: obj => obj.getAgendaSemanal }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getAgendaMensal_decorators, { kind: "method", name: "getAgendaMensal", static: false, private: false, access: { has: obj => "getAgendaMensal" in obj, get: obj => obj.getAgendaMensal }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _criarSlots_decorators, { kind: "method", name: "criarSlots", static: false, private: false, access: { has: obj => "criarSlots" in obj, get: obj => obj.criarSlots }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _criarBloqueio_decorators, { kind: "method", name: "criarBloqueio", static: false, private: false, access: { has: obj => "criarBloqueio" in obj, get: obj => obj.criarBloqueio }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _removerBloqueio_decorators, { kind: "method", name: "removerBloqueio", static: false, private: false, access: { has: obj => "removerBloqueio" in obj, get: obj => obj.removerBloqueio }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getConfigAgenda_decorators, { kind: "method", name: "getConfigAgenda", static: false, private: false, access: { has: obj => "getConfigAgenda" in obj, get: obj => obj.getConfigAgenda }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _updateConfigAgenda_decorators, { kind: "method", name: "updateConfigAgenda", static: false, private: false, access: { has: obj => "updateConfigAgenda" in obj, get: obj => obj.updateConfigAgenda }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            AgendaController = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        agendaService = __runInitializers(this, _instanceExtraInitializers);
        constructor(agendaService) {
            this.agendaService = agendaService;
        }
        getSlotsByDate(req, data) {
            return this.agendaService.getSlotsByDate(getTenantId(req), data);
        }
        getSlotsByRange(req, dataInicio, dataFim) {
            return this.agendaService.getSlotsByRange(getTenantId(req), dataInicio, dataFim);
        }
        getDisponibilidade(req, data, horaInicio) {
            return this.agendaService.getDisponibilidade(getTenantId(req), data, horaInicio);
        }
        getAgendaSemanal(req, dataInicio) {
            return this.agendaService.getAgendaSemanal(getTenantId(req), dataInicio);
        }
        getAgendaMensal(req, ano, mes) {
            return this.agendaService.getAgendaMensal(getTenantId(req), ano, mes);
        }
        criarSlots(req, data, slots) {
            return this.agendaService.criarSlots(getTenantId(req), data, slots);
        }
        criarBloqueio(req, createBloqueioDto) {
            return this.agendaService.criarBloqueio(getTenantId(req), createBloqueioDto);
        }
        removerBloqueio(req, id) {
            return this.agendaService.removerBloqueio(getTenantId(req), id);
        }
        getConfigAgenda(req) {
            return this.agendaService.getConfigAgenda(getTenantId(req));
        }
        updateConfigAgenda(req, updateConfigAgendaDto) {
            return this.agendaService.updateConfigAgenda(getTenantId(req), updateConfigAgendaDto);
        }
    };
    return AgendaController = _classThis;
})();
export { AgendaController };
