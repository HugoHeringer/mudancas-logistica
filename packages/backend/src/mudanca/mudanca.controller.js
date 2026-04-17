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
let MudancaController = (() => {
    let _classDecorators = [ApiTags('mudancas'), Controller('mudancas'), ApiBearerAuth()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _create_decorators;
    let _findAll_decorators;
    let _getDashboard_decorators;
    let _getMinhas_decorators;
    let _findOne_decorators;
    let _update_decorators;
    let _aprovar_decorators;
    let _iniciarDeslocamento_decorators;
    let _emServico_decorators;
    let _concluir_decorators;
    let _recusar_decorators;
    let _cancelar_decorators;
    let _remove_decorators;
    var MudancaController = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _create_decorators = [Post(), HttpCode(HttpStatus.CREATED), ApiOperation({ summary: 'Criar nova mudança (público ou admin)' })];
            _findAll_decorators = [Get(), ApiOperation({ summary: 'Listar todas as mudanças (com filtros)' })];
            _getDashboard_decorators = [Get('dashboard'), ApiOperation({ summary: 'Obter dados para dashboard' })];
            _getMinhas_decorators = [Get('minhas'), ApiOperation({ summary: 'Obter mudanças do motorista autenticado' })];
            _findOne_decorators = [Get(':id'), ApiOperation({ summary: 'Obter mudança por ID' })];
            _update_decorators = [Patch(':id'), ApiOperation({ summary: 'Atualizar mudança' })];
            _aprovar_decorators = [Post(':id/aprovar'), ApiOperation({ summary: 'Aprovar mudança e atribuir motorista' })];
            _iniciarDeslocamento_decorators = [Post(':id/iniciar'), ApiOperation({ summary: 'Motorista inicia deslocamento' })];
            _emServico_decorators = [Post(':id/em-servico'), ApiOperation({ summary: 'Motorista inicia serviço no local' })];
            _concluir_decorators = [Post(':id/concluir'), ApiOperation({ summary: 'Concluir mudança com ficha' })];
            _recusar_decorators = [Post(':id/recusar'), ApiOperation({ summary: 'Recusar mudança' })];
            _cancelar_decorators = [Post(':id/cancelar'), ApiOperation({ summary: 'Cancelar mudança' })];
            _remove_decorators = [Delete(':id'), HttpCode(HttpStatus.NO_CONTENT), ApiOperation({ summary: 'Remover mudança' })];
            __esDecorate(this, null, _create_decorators, { kind: "method", name: "create", static: false, private: false, access: { has: obj => "create" in obj, get: obj => obj.create }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _findAll_decorators, { kind: "method", name: "findAll", static: false, private: false, access: { has: obj => "findAll" in obj, get: obj => obj.findAll }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getDashboard_decorators, { kind: "method", name: "getDashboard", static: false, private: false, access: { has: obj => "getDashboard" in obj, get: obj => obj.getDashboard }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getMinhas_decorators, { kind: "method", name: "getMinhas", static: false, private: false, access: { has: obj => "getMinhas" in obj, get: obj => obj.getMinhas }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _findOne_decorators, { kind: "method", name: "findOne", static: false, private: false, access: { has: obj => "findOne" in obj, get: obj => obj.findOne }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _update_decorators, { kind: "method", name: "update", static: false, private: false, access: { has: obj => "update" in obj, get: obj => obj.update }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _aprovar_decorators, { kind: "method", name: "aprovar", static: false, private: false, access: { has: obj => "aprovar" in obj, get: obj => obj.aprovar }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _iniciarDeslocamento_decorators, { kind: "method", name: "iniciarDeslocamento", static: false, private: false, access: { has: obj => "iniciarDeslocamento" in obj, get: obj => obj.iniciarDeslocamento }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _emServico_decorators, { kind: "method", name: "emServico", static: false, private: false, access: { has: obj => "emServico" in obj, get: obj => obj.emServico }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _concluir_decorators, { kind: "method", name: "concluir", static: false, private: false, access: { has: obj => "concluir" in obj, get: obj => obj.concluir }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _recusar_decorators, { kind: "method", name: "recusar", static: false, private: false, access: { has: obj => "recusar" in obj, get: obj => obj.recusar }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _cancelar_decorators, { kind: "method", name: "cancelar", static: false, private: false, access: { has: obj => "cancelar" in obj, get: obj => obj.cancelar }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _remove_decorators, { kind: "method", name: "remove", static: false, private: false, access: { has: obj => "remove" in obj, get: obj => obj.remove }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            MudancaController = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        mudancaService = __runInitializers(this, _instanceExtraInitializers);
        constructor(mudancaService) {
            this.mudancaService = mudancaService;
        }
        create(req, createMudancaDto) {
            const tenantId = req.tenantId || createMudancaDto.tenantId;
            return this.mudancaService.create(tenantId, createMudancaDto);
        }
        findAll(req) {
            const filters = req.query;
            return this.mudancaService.findAll(getTenantId(req), filters);
        }
        getDashboard(req) {
            return this.mudancaService.getDashboard(getTenantId(req));
        }
        getMinhas(req, filters) {
            return this.mudancaService.getMinhas(getTenantId(req), req.user.id, filters);
        }
        findOne(req, id) {
            return this.mudancaService.findOne(getTenantId(req), id);
        }
        update(req, id, updateMudancaDto) {
            return this.mudancaService.update(getTenantId(req), id, updateMudancaDto);
        }
        aprovar(req, id, aprovarMudancaDto) {
            return this.mudancaService.aprovar(getTenantId(req), id, aprovarMudancaDto);
        }
        iniciarDeslocamento(req, id) {
            return this.mudancaService.iniciarDeslocamento(getTenantId(req), id, req.user.id);
        }
        emServico(req, id) {
            return this.mudancaService.emServico(getTenantId(req), id, req.user.id);
        }
        concluir(req, id, concluirMudancaDto) {
            return this.mudancaService.concluir(getTenantId(req), id, concluirMudancaDto);
        }
        recusar(req, id, body) {
            return this.mudancaService.recusar(getTenantId(req), id, body.motivo);
        }
        cancelar(req, id) {
            return this.mudancaService.cancelar(getTenantId(req), id);
        }
        remove(req, id) {
            return this.mudancaService.remove(getTenantId(req), id);
        }
    };
    return MudancaController = _classThis;
})();
export { MudancaController };
