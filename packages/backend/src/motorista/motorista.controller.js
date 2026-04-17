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
import { Controller, Get, Post, Patch, Delete, HttpCode, HttpStatus, } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { getTenantId } from '../prisma';
let MotoristaController = (() => {
    let _classDecorators = [ApiTags('motoristas'), Controller('motoristas'), ApiBearerAuth()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _create_decorators;
    let _findAll_decorators;
    let _getDisponiveis_decorators;
    let _getMe_decorators;
    let _findOne_decorators;
    let _getPerformance_decorators;
    let _update_decorators;
    let _updateEstado_decorators;
    let _remove_decorators;
    var MotoristaController = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _create_decorators = [Post(), HttpCode(HttpStatus.CREATED), ApiOperation({ summary: 'Criar novo motorista' })];
            _findAll_decorators = [Get(), ApiOperation({ summary: 'Listar motoristas com filtros' })];
            _getDisponiveis_decorators = [Get('disponiveis'), ApiOperation({ summary: 'Listar motoristas disponíveis' })];
            _getMe_decorators = [Get('me'), ApiOperation({ summary: 'Obter dados do motorista autenticado' })];
            _findOne_decorators = [Get(':id'), ApiOperation({ summary: 'Obter motorista por ID' })];
            _getPerformance_decorators = [Get(':id/performance'), ApiOperation({ summary: 'Obter performance do motorista' })];
            _update_decorators = [Patch(':id'), ApiOperation({ summary: 'Atualizar motorista' })];
            _updateEstado_decorators = [Patch(':id/estado'), ApiOperation({ summary: 'Atualizar estado do motorista' })];
            _remove_decorators = [Delete(':id'), HttpCode(HttpStatus.NO_CONTENT), ApiOperation({ summary: 'Remover motorista' })];
            __esDecorate(this, null, _create_decorators, { kind: "method", name: "create", static: false, private: false, access: { has: obj => "create" in obj, get: obj => obj.create }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _findAll_decorators, { kind: "method", name: "findAll", static: false, private: false, access: { has: obj => "findAll" in obj, get: obj => obj.findAll }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getDisponiveis_decorators, { kind: "method", name: "getDisponiveis", static: false, private: false, access: { has: obj => "getDisponiveis" in obj, get: obj => obj.getDisponiveis }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getMe_decorators, { kind: "method", name: "getMe", static: false, private: false, access: { has: obj => "getMe" in obj, get: obj => obj.getMe }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _findOne_decorators, { kind: "method", name: "findOne", static: false, private: false, access: { has: obj => "findOne" in obj, get: obj => obj.findOne }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getPerformance_decorators, { kind: "method", name: "getPerformance", static: false, private: false, access: { has: obj => "getPerformance" in obj, get: obj => obj.getPerformance }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _update_decorators, { kind: "method", name: "update", static: false, private: false, access: { has: obj => "update" in obj, get: obj => obj.update }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _updateEstado_decorators, { kind: "method", name: "updateEstado", static: false, private: false, access: { has: obj => "updateEstado" in obj, get: obj => obj.updateEstado }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _remove_decorators, { kind: "method", name: "remove", static: false, private: false, access: { has: obj => "remove" in obj, get: obj => obj.remove }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            MotoristaController = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        motoristaService = __runInitializers(this, _instanceExtraInitializers);
        constructor(motoristaService) {
            this.motoristaService = motoristaService;
        }
        create(req, createMotoristaDto) {
            return this.motoristaService.create(getTenantId(req), createMotoristaDto);
        }
        findAll(req, filters) {
            return this.motoristaService.findAll(getTenantId(req), filters);
        }
        getDisponiveis(req, data) {
            return this.motoristaService.getDisponiveis(getTenantId(req), data);
        }
        getMe(req) {
            return this.motoristaService.findByUserId(getTenantId(req), req.user.id);
        }
        findOne(req, id) {
            return this.motoristaService.findOne(getTenantId(req), id);
        }
        getPerformance(req, id, mes, ano) {
            return this.motoristaService.getPerformance(getTenantId(req), id, mes, ano);
        }
        update(req, id, updateMotoristaDto) {
            return this.motoristaService.update(getTenantId(req), id, updateMotoristaDto);
        }
        updateEstado(req, id, body) {
            return this.motoristaService.updateEstado(id, body.estado);
        }
        remove(req, id) {
            return this.motoristaService.remove(getTenantId(req), id);
        }
    };
    return MotoristaController = _classThis;
})();
export { MotoristaController };
