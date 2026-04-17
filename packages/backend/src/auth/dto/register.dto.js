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
import { IsEmail, IsNotEmpty, IsString, MinLength, IsOptional, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
let RegisterDto = (() => {
    let _nome_decorators;
    let _nome_initializers = [];
    let _nome_extraInitializers = [];
    let _email_decorators;
    let _email_initializers = [];
    let _email_extraInitializers = [];
    let _password_decorators;
    let _password_initializers = [];
    let _password_extraInitializers = [];
    let _perfil_decorators;
    let _perfil_initializers = [];
    let _perfil_extraInitializers = [];
    let _tenantId_decorators;
    let _tenantId_initializers = [];
    let _tenantId_extraInitializers = [];
    let _permissoes_decorators;
    let _permissoes_initializers = [];
    let _permissoes_extraInitializers = [];
    return class RegisterDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _nome_decorators = [ApiProperty({ example: 'João Silva' }), IsString(), MinLength(2), IsNotEmpty()];
            _email_decorators = [ApiProperty({ example: 'joao@empresa.pt' }), IsEmail(), IsNotEmpty()];
            _password_decorators = [ApiProperty({ example: 'password123' }), IsString(), MinLength(6), IsNotEmpty()];
            _perfil_decorators = [ApiProperty({ example: 'admin' }), IsString(), IsNotEmpty()];
            _tenantId_decorators = [ApiProperty({ example: 'tenant-uuid' }), IsString(), IsNotEmpty()];
            _permissoes_decorators = [ApiProperty({ required: false }), IsOptional(), IsObject()];
            __esDecorate(null, null, _nome_decorators, { kind: "field", name: "nome", static: false, private: false, access: { has: obj => "nome" in obj, get: obj => obj.nome, set: (obj, value) => { obj.nome = value; } }, metadata: _metadata }, _nome_initializers, _nome_extraInitializers);
            __esDecorate(null, null, _email_decorators, { kind: "field", name: "email", static: false, private: false, access: { has: obj => "email" in obj, get: obj => obj.email, set: (obj, value) => { obj.email = value; } }, metadata: _metadata }, _email_initializers, _email_extraInitializers);
            __esDecorate(null, null, _password_decorators, { kind: "field", name: "password", static: false, private: false, access: { has: obj => "password" in obj, get: obj => obj.password, set: (obj, value) => { obj.password = value; } }, metadata: _metadata }, _password_initializers, _password_extraInitializers);
            __esDecorate(null, null, _perfil_decorators, { kind: "field", name: "perfil", static: false, private: false, access: { has: obj => "perfil" in obj, get: obj => obj.perfil, set: (obj, value) => { obj.perfil = value; } }, metadata: _metadata }, _perfil_initializers, _perfil_extraInitializers);
            __esDecorate(null, null, _tenantId_decorators, { kind: "field", name: "tenantId", static: false, private: false, access: { has: obj => "tenantId" in obj, get: obj => obj.tenantId, set: (obj, value) => { obj.tenantId = value; } }, metadata: _metadata }, _tenantId_initializers, _tenantId_extraInitializers);
            __esDecorate(null, null, _permissoes_decorators, { kind: "field", name: "permissoes", static: false, private: false, access: { has: obj => "permissoes" in obj, get: obj => obj.permissoes, set: (obj, value) => { obj.permissoes = value; } }, metadata: _metadata }, _permissoes_initializers, _permissoes_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        nome = __runInitializers(this, _nome_initializers, void 0);
        email = (__runInitializers(this, _nome_extraInitializers), __runInitializers(this, _email_initializers, void 0));
        password = (__runInitializers(this, _email_extraInitializers), __runInitializers(this, _password_initializers, void 0));
        perfil = (__runInitializers(this, _password_extraInitializers), __runInitializers(this, _perfil_initializers, void 0));
        tenantId = (__runInitializers(this, _perfil_extraInitializers), __runInitializers(this, _tenantId_initializers, void 0));
        permissoes = (__runInitializers(this, _tenantId_extraInitializers), __runInitializers(this, _permissoes_initializers, void 0));
        constructor() {
            __runInitializers(this, _permissoes_extraInitializers);
        }
    };
})();
export { RegisterDto };
