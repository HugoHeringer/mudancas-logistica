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
let ClienteController = (() => {
    let _classDecorators = [ApiTags('clientes'), Controller('clientes'), ApiBearerAuth()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _create_decorators;
    let _findAll_decorators;
    let _findOne_decorators;
    let _findByEmail_decorators;
    let _update_decorators;
    let _merge_decorators;
    let _remove_decorators;
    var ClienteController = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _create_decorators = [Post(), HttpCode(HttpStatus.CREATED), ApiOperation({ summary: 'Criar novo cliente' })];
            _findAll_decorators = [Get(), ApiOperation({ summary: 'Listar clientes com filtros' })];
            _findOne_decorators = [Get(':id'), ApiOperation({ summary: 'Obter cliente por ID' })];
            _findByEmail_decorators = [Get('email/:email'), ApiOperation({ summary: 'Obter cliente por email' })];
            _update_decorators = [Patch(':id'), ApiOperation({ summary: 'Atualizar cliente' })];
            _merge_decorators = [Post(':sourceId/merge/:targetId'), ApiOperation({ summary: 'Mesclar dois clientes (manter target)' })];
            _remove_decorators = [Delete(':id'), HttpCode(HttpStatus.NO_CONTENT), ApiOperation({ summary: 'Remover cliente' })];
            __esDecorate(this, null, _create_decorators, { kind: "method", name: "create", static: false, private: false, access: { has: obj => "create" in obj, get: obj => obj.create }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _findAll_decorators, { kind: "method", name: "findAll", static: false, private: false, access: { has: obj => "findAll" in obj, get: obj => obj.findAll }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _findOne_decorators, { kind: "method", name: "findOne", static: false, private: false, access: { has: obj => "findOne" in obj, get: obj => obj.findOne }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _findByEmail_decorators, { kind: "method", name: "findByEmail", static: false, private: false, access: { has: obj => "findByEmail" in obj, get: obj => obj.findByEmail }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _update_decorators, { kind: "method", name: "update", static: false, private: false, access: { has: obj => "update" in obj, get: obj => obj.update }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _merge_decorators, { kind: "method", name: "merge", static: false, private: false, access: { has: obj => "merge" in obj, get: obj => obj.merge }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _remove_decorators, { kind: "method", name: "remove", static: false, private: false, access: { has: obj => "remove" in obj, get: obj => obj.remove }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            ClienteController = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        clienteService = __runInitializers(this, _instanceExtraInitializers);
        constructor(clienteService) {
            this.clienteService = clienteService;
        }
        create(req, createClienteDto) {
            return this.clienteService.create(getTenantId(req), createClienteDto);
        }
        findAll(req, filters) {
            return this.clienteService.findAll(getTenantId(req), filters);
        }
        findOne(req, id) {
            return this.clienteService.findOne(getTenantId(req), id);
        }
        findByEmail(req, email) {
            return this.clienteService.findByEmail(getTenantId(req), email);
        }
        update(req, id, updateClienteDto) {
            return this.clienteService.update(getTenantId(req), id, updateClienteDto);
        }
        merge(req, sourceId, targetId) {
            return this.clienteService.merge(getTenantId(req), sourceId, targetId);
        }
        remove(req, id) {
            return this.clienteService.remove(getTenantId(req), id);
        }
    };
    return ClienteController = _classThis;
})();
export { ClienteController };
