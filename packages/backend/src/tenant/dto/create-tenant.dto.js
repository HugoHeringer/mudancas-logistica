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
import { IsString, IsNotEmpty, IsOptional, IsObject, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
let CreateTenantDto = (() => {
    let _subdomain_decorators;
    let _subdomain_initializers = [];
    let _subdomain_extraInitializers = [];
    let _estado_decorators;
    let _estado_initializers = [];
    let _estado_extraInitializers = [];
    let _configMarca_decorators;
    let _configMarca_initializers = [];
    let _configMarca_extraInitializers = [];
    let _configPreco_decorators;
    let _configPreco_initializers = [];
    let _configPreco_extraInitializers = [];
    let _configAgenda_decorators;
    let _configAgenda_initializers = [];
    let _configAgenda_extraInitializers = [];
    return class CreateTenantDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _subdomain_decorators = [ApiProperty({ example: 'minha-empresa' }), IsString(), IsNotEmpty()];
            _estado_decorators = [ApiProperty({ required: false }), IsOptional(), IsEnum(['ativa', 'suspensa', 'em_setup', 'cancelada'])];
            _configMarca_decorators = [ApiProperty({ required: false }), IsOptional(), IsObject()];
            _configPreco_decorators = [ApiProperty({ required: false }), IsOptional(), IsObject()];
            _configAgenda_decorators = [ApiProperty({ required: false }), IsOptional(), IsObject()];
            __esDecorate(null, null, _subdomain_decorators, { kind: "field", name: "subdomain", static: false, private: false, access: { has: obj => "subdomain" in obj, get: obj => obj.subdomain, set: (obj, value) => { obj.subdomain = value; } }, metadata: _metadata }, _subdomain_initializers, _subdomain_extraInitializers);
            __esDecorate(null, null, _estado_decorators, { kind: "field", name: "estado", static: false, private: false, access: { has: obj => "estado" in obj, get: obj => obj.estado, set: (obj, value) => { obj.estado = value; } }, metadata: _metadata }, _estado_initializers, _estado_extraInitializers);
            __esDecorate(null, null, _configMarca_decorators, { kind: "field", name: "configMarca", static: false, private: false, access: { has: obj => "configMarca" in obj, get: obj => obj.configMarca, set: (obj, value) => { obj.configMarca = value; } }, metadata: _metadata }, _configMarca_initializers, _configMarca_extraInitializers);
            __esDecorate(null, null, _configPreco_decorators, { kind: "field", name: "configPreco", static: false, private: false, access: { has: obj => "configPreco" in obj, get: obj => obj.configPreco, set: (obj, value) => { obj.configPreco = value; } }, metadata: _metadata }, _configPreco_initializers, _configPreco_extraInitializers);
            __esDecorate(null, null, _configAgenda_decorators, { kind: "field", name: "configAgenda", static: false, private: false, access: { has: obj => "configAgenda" in obj, get: obj => obj.configAgenda, set: (obj, value) => { obj.configAgenda = value; } }, metadata: _metadata }, _configAgenda_initializers, _configAgenda_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        subdomain = __runInitializers(this, _subdomain_initializers, void 0);
        estado = (__runInitializers(this, _subdomain_extraInitializers), __runInitializers(this, _estado_initializers, void 0));
        configMarca = (__runInitializers(this, _estado_extraInitializers), __runInitializers(this, _configMarca_initializers, void 0));
        configPreco = (__runInitializers(this, _configMarca_extraInitializers), __runInitializers(this, _configPreco_initializers, void 0));
        configAgenda = (__runInitializers(this, _configPreco_extraInitializers), __runInitializers(this, _configAgenda_initializers, void 0));
        constructor() {
            __runInitializers(this, _configAgenda_extraInitializers);
        }
    };
})();
export { CreateTenantDto };
