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
import { Controller, Get, Post, Delete, HttpCode, HttpStatus, } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { getTenantId } from '../prisma';
let FinanceiroController = (() => {
    let _classDecorators = [ApiTags('financeiro'), Controller('financeiro'), ApiBearerAuth()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _createMovimento_decorators;
    let _findAllMovimentos_decorators;
    let _getResumo_decorators;
    let _getBreakdownMotorista_decorators;
    let _getBreakdownTipoServico_decorators;
    let _getGastosDetalhados_decorators;
    let _removeMovimento_decorators;
    var FinanceiroController = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _createMovimento_decorators = [Post('movimentos'), HttpCode(HttpStatus.CREATED), ApiOperation({ summary: 'Criar movimento financeiro' })];
            _findAllMovimentos_decorators = [Get('movimentos'), ApiOperation({ summary: 'Listar movimentos financeiros' })];
            _getResumo_decorators = [Get('resumo'), ApiOperation({ summary: 'Obter resumo financeiro do período' })];
            _getBreakdownMotorista_decorators = [Get('breakdown/motoristas'), ApiOperation({ summary: 'Breakdown financeiro por motorista' })];
            _getBreakdownTipoServico_decorators = [Get('breakdown/tipo-servico'), ApiOperation({ summary: 'Breakdown financeiro por tipo de serviço' })];
            _getGastosDetalhados_decorators = [Get('gastos-detalhados'), ApiOperation({ summary: 'Gastos detalhados (combustível e alimentação)' })];
            _removeMovimento_decorators = [Delete('movimentos/:id'), HttpCode(HttpStatus.NO_CONTENT), ApiOperation({ summary: 'Remover movimento financeiro' })];
            __esDecorate(this, null, _createMovimento_decorators, { kind: "method", name: "createMovimento", static: false, private: false, access: { has: obj => "createMovimento" in obj, get: obj => obj.createMovimento }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _findAllMovimentos_decorators, { kind: "method", name: "findAllMovimentos", static: false, private: false, access: { has: obj => "findAllMovimentos" in obj, get: obj => obj.findAllMovimentos }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getResumo_decorators, { kind: "method", name: "getResumo", static: false, private: false, access: { has: obj => "getResumo" in obj, get: obj => obj.getResumo }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getBreakdownMotorista_decorators, { kind: "method", name: "getBreakdownMotorista", static: false, private: false, access: { has: obj => "getBreakdownMotorista" in obj, get: obj => obj.getBreakdownMotorista }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getBreakdownTipoServico_decorators, { kind: "method", name: "getBreakdownTipoServico", static: false, private: false, access: { has: obj => "getBreakdownTipoServico" in obj, get: obj => obj.getBreakdownTipoServico }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getGastosDetalhados_decorators, { kind: "method", name: "getGastosDetalhados", static: false, private: false, access: { has: obj => "getGastosDetalhados" in obj, get: obj => obj.getGastosDetalhados }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _removeMovimento_decorators, { kind: "method", name: "removeMovimento", static: false, private: false, access: { has: obj => "removeMovimento" in obj, get: obj => obj.removeMovimento }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            FinanceiroController = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        financeiroService = __runInitializers(this, _instanceExtraInitializers);
        constructor(financeiroService) {
            this.financeiroService = financeiroService;
        }
        createMovimento(req, createMovimentoDto) {
            return this.financeiroService.createMovimento(getTenantId(req), createMovimentoDto);
        }
        findAllMovimentos(req, filters) {
            return this.financeiroService.findAll(getTenantId(req), filters);
        }
        getResumo(req, dataInicio, dataFim) {
            return this.financeiroService.getResumo(getTenantId(req), dataInicio, dataFim);
        }
        getBreakdownMotorista(req, dataInicio, dataFim) {
            return this.financeiroService.getBreakdownMotorista(getTenantId(req), dataInicio, dataFim);
        }
        getBreakdownTipoServico(req, dataInicio, dataFim) {
            return this.financeiroService.getBreakdownTipoServico(getTenantId(req), dataInicio, dataFim);
        }
        getGastosDetalhados(req, dataInicio, dataFim) {
            return this.financeiroService.getGastosDetalhados(getTenantId(req), dataInicio, dataFim);
        }
        removeMovimento(req, id) {
            return this.financeiroService.removeMovimento(getTenantId(req), id);
        }
    };
    return FinanceiroController = _classThis;
})();
export { FinanceiroController };
