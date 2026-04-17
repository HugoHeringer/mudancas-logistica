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
let ComunicacaoController = (() => {
    let _classDecorators = [ApiTags('comunicacao'), Controller('comunicacao'), ApiBearerAuth()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _getTemplates_decorators;
    let _getTemplate_decorators;
    let _createTemplate_decorators;
    let _updateTemplate_decorators;
    let _deleteTemplate_decorators;
    let _renderTemplate_decorators;
    let _initializeTemplates_decorators;
    var ComunicacaoController = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _getTemplates_decorators = [Get('templates'), ApiOperation({ summary: 'Listar templates de email' })];
            _getTemplate_decorators = [Get('templates/:nome'), ApiOperation({ summary: 'Obter template por nome' })];
            _createTemplate_decorators = [Post('templates'), HttpCode(HttpStatus.CREATED), ApiOperation({ summary: 'Criar template de email' })];
            _updateTemplate_decorators = [Patch('templates/:nome'), ApiOperation({ summary: 'Atualizar template de email' })];
            _deleteTemplate_decorators = [Delete('templates/:id'), HttpCode(HttpStatus.NO_CONTENT), ApiOperation({ summary: 'Remover template de email' })];
            _renderTemplate_decorators = [Post('templates/:nome/render'), ApiOperation({ summary: 'Renderizar template com variáveis' })];
            _initializeTemplates_decorators = [Post('templates/initialize'), ApiOperation({ summary: 'Inicializar templates padrão' })];
            __esDecorate(this, null, _getTemplates_decorators, { kind: "method", name: "getTemplates", static: false, private: false, access: { has: obj => "getTemplates" in obj, get: obj => obj.getTemplates }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getTemplate_decorators, { kind: "method", name: "getTemplate", static: false, private: false, access: { has: obj => "getTemplate" in obj, get: obj => obj.getTemplate }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _createTemplate_decorators, { kind: "method", name: "createTemplate", static: false, private: false, access: { has: obj => "createTemplate" in obj, get: obj => obj.createTemplate }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _updateTemplate_decorators, { kind: "method", name: "updateTemplate", static: false, private: false, access: { has: obj => "updateTemplate" in obj, get: obj => obj.updateTemplate }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _deleteTemplate_decorators, { kind: "method", name: "deleteTemplate", static: false, private: false, access: { has: obj => "deleteTemplate" in obj, get: obj => obj.deleteTemplate }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _renderTemplate_decorators, { kind: "method", name: "renderTemplate", static: false, private: false, access: { has: obj => "renderTemplate" in obj, get: obj => obj.renderTemplate }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _initializeTemplates_decorators, { kind: "method", name: "initializeTemplates", static: false, private: false, access: { has: obj => "initializeTemplates" in obj, get: obj => obj.initializeTemplates }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            ComunicacaoController = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        comunicacaoService = __runInitializers(this, _instanceExtraInitializers);
        constructor(comunicacaoService) {
            this.comunicacaoService = comunicacaoService;
        }
        getTemplates(req) {
            return this.comunicacaoService.getTemplates(getTenantId(req));
        }
        getTemplate(req, nome) {
            return this.comunicacaoService.getTemplate(getTenantId(req), nome);
        }
        createTemplate(req, createTemplateDto) {
            return this.comunicacaoService.createTemplate(getTenantId(req), createTemplateDto);
        }
        updateTemplate(req, nome, updateTemplateDto) {
            return this.comunicacaoService.updateTemplate(getTenantId(req), nome, updateTemplateDto);
        }
        deleteTemplate(req, id) {
            return this.comunicacaoService.deleteTemplate(getTenantId(req), id);
        }
        renderTemplate(req, nome, body) {
            return this.comunicacaoService.renderTemplate(getTenantId(req), nome, body.variaveis);
        }
        initializeTemplates(req) {
            return this.comunicacaoService.initializeDefaultTemplates(getTenantId(req));
        }
    };
    return ComunicacaoController = _classThis;
})();
export { ComunicacaoController };
