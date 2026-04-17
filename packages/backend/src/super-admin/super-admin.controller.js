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
import { Public } from '../auth/decorators/public.decorator';
let SuperAdminController = (() => {
    let _classDecorators = [ApiTags('super-admin'), Controller('super-admin'), ApiBearerAuth(), Public()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _getAllTenants_decorators;
    let _getStats_decorators;
    let _createTenantWithAdmin_decorators;
    let _updateTenantEstado_decorators;
    let _resetAdminPassword_decorators;
    let _deleteTenant_decorators;
    var SuperAdminController = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _getAllTenants_decorators = [Get('tenants'), ApiOperation({ summary: 'Listar todos os tenants (Super-Admin)' })];
            _getStats_decorators = [Get('stats'), ApiOperation({ summary: 'Estatísticas globais da plataforma' })];
            _createTenantWithAdmin_decorators = [Post('tenants'), HttpCode(HttpStatus.CREATED), ApiOperation({ summary: 'Criar novo tenant com admin (Super-Admin)' })];
            _updateTenantEstado_decorators = [Patch('tenants/:id/estado'), ApiOperation({ summary: 'Atualizar estado do tenant' })];
            _resetAdminPassword_decorators = [Post('tenants/:id/reset-password'), ApiOperation({ summary: 'Redefinir senha do admin do tenant' })];
            _deleteTenant_decorators = [Delete('tenants/:id'), HttpCode(HttpStatus.NO_CONTENT), ApiOperation({ summary: 'Remover tenant' })];
            __esDecorate(this, null, _getAllTenants_decorators, { kind: "method", name: "getAllTenants", static: false, private: false, access: { has: obj => "getAllTenants" in obj, get: obj => obj.getAllTenants }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getStats_decorators, { kind: "method", name: "getStats", static: false, private: false, access: { has: obj => "getStats" in obj, get: obj => obj.getStats }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _createTenantWithAdmin_decorators, { kind: "method", name: "createTenantWithAdmin", static: false, private: false, access: { has: obj => "createTenantWithAdmin" in obj, get: obj => obj.createTenantWithAdmin }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _updateTenantEstado_decorators, { kind: "method", name: "updateTenantEstado", static: false, private: false, access: { has: obj => "updateTenantEstado" in obj, get: obj => obj.updateTenantEstado }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _resetAdminPassword_decorators, { kind: "method", name: "resetAdminPassword", static: false, private: false, access: { has: obj => "resetAdminPassword" in obj, get: obj => obj.resetAdminPassword }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _deleteTenant_decorators, { kind: "method", name: "deleteTenant", static: false, private: false, access: { has: obj => "deleteTenant" in obj, get: obj => obj.deleteTenant }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            SuperAdminController = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        superAdminService = __runInitializers(this, _instanceExtraInitializers);
        constructor(superAdminService) {
            this.superAdminService = superAdminService;
        }
        getAllTenants() {
            return this.superAdminService.getAllTenants();
        }
        getStats() {
            return this.superAdminService.getTenantStats();
        }
        createTenantWithAdmin(body) {
            return this.superAdminService.createTenantWithAdmin(body);
        }
        updateTenantEstado(id, body) {
            return this.superAdminService.updateTenantEstado(id, body.estado);
        }
        resetAdminPassword(id, body) {
            return this.superAdminService.resetAdminPassword(id, body.newPassword);
        }
        deleteTenant(id) {
            return this.superAdminService.deleteTenant(id);
        }
    };
    return SuperAdminController = _classThis;
})();
export { SuperAdminController };
