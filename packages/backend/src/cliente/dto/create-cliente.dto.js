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
import { IsString, IsNotEmpty, IsEmail, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
let MoradaClienteDto = (() => {
    let _tipo_decorators;
    let _tipo_initializers = [];
    let _tipo_extraInitializers = [];
    let _rua_decorators;
    let _rua_initializers = [];
    let _rua_extraInitializers = [];
    let _numero_decorators;
    let _numero_initializers = [];
    let _numero_extraInitializers = [];
    let _andar_decorators;
    let _andar_initializers = [];
    let _andar_extraInitializers = [];
    let _codigoPostal_decorators;
    let _codigoPostal_initializers = [];
    let _codigoPostal_extraInitializers = [];
    let _localidade_decorators;
    let _localidade_initializers = [];
    let _localidade_extraInitializers = [];
    let _pais_decorators;
    let _pais_initializers = [];
    let _pais_extraInitializers = [];
    return class MoradaClienteDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _tipo_decorators = [IsString()];
            _rua_decorators = [IsString()];
            _numero_decorators = [IsString()];
            _andar_decorators = [IsString(), IsOptional()];
            _codigoPostal_decorators = [IsString()];
            _localidade_decorators = [IsString()];
            _pais_decorators = [IsString(), IsOptional()];
            __esDecorate(null, null, _tipo_decorators, { kind: "field", name: "tipo", static: false, private: false, access: { has: obj => "tipo" in obj, get: obj => obj.tipo, set: (obj, value) => { obj.tipo = value; } }, metadata: _metadata }, _tipo_initializers, _tipo_extraInitializers);
            __esDecorate(null, null, _rua_decorators, { kind: "field", name: "rua", static: false, private: false, access: { has: obj => "rua" in obj, get: obj => obj.rua, set: (obj, value) => { obj.rua = value; } }, metadata: _metadata }, _rua_initializers, _rua_extraInitializers);
            __esDecorate(null, null, _numero_decorators, { kind: "field", name: "numero", static: false, private: false, access: { has: obj => "numero" in obj, get: obj => obj.numero, set: (obj, value) => { obj.numero = value; } }, metadata: _metadata }, _numero_initializers, _numero_extraInitializers);
            __esDecorate(null, null, _andar_decorators, { kind: "field", name: "andar", static: false, private: false, access: { has: obj => "andar" in obj, get: obj => obj.andar, set: (obj, value) => { obj.andar = value; } }, metadata: _metadata }, _andar_initializers, _andar_extraInitializers);
            __esDecorate(null, null, _codigoPostal_decorators, { kind: "field", name: "codigoPostal", static: false, private: false, access: { has: obj => "codigoPostal" in obj, get: obj => obj.codigoPostal, set: (obj, value) => { obj.codigoPostal = value; } }, metadata: _metadata }, _codigoPostal_initializers, _codigoPostal_extraInitializers);
            __esDecorate(null, null, _localidade_decorators, { kind: "field", name: "localidade", static: false, private: false, access: { has: obj => "localidade" in obj, get: obj => obj.localidade, set: (obj, value) => { obj.localidade = value; } }, metadata: _metadata }, _localidade_initializers, _localidade_extraInitializers);
            __esDecorate(null, null, _pais_decorators, { kind: "field", name: "pais", static: false, private: false, access: { has: obj => "pais" in obj, get: obj => obj.pais, set: (obj, value) => { obj.pais = value; } }, metadata: _metadata }, _pais_initializers, _pais_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        tipo = __runInitializers(this, _tipo_initializers, void 0);
        rua = (__runInitializers(this, _tipo_extraInitializers), __runInitializers(this, _rua_initializers, void 0));
        numero = (__runInitializers(this, _rua_extraInitializers), __runInitializers(this, _numero_initializers, void 0));
        andar = (__runInitializers(this, _numero_extraInitializers), __runInitializers(this, _andar_initializers, void 0));
        codigoPostal = (__runInitializers(this, _andar_extraInitializers), __runInitializers(this, _codigoPostal_initializers, void 0));
        localidade = (__runInitializers(this, _codigoPostal_extraInitializers), __runInitializers(this, _localidade_initializers, void 0));
        pais = (__runInitializers(this, _localidade_extraInitializers), __runInitializers(this, _pais_initializers, void 0));
        constructor() {
            __runInitializers(this, _pais_extraInitializers);
        }
    };
})();
let CreateClienteDto = (() => {
    let _nome_decorators;
    let _nome_initializers = [];
    let _nome_extraInitializers = [];
    let _apelido_decorators;
    let _apelido_initializers = [];
    let _apelido_extraInitializers = [];
    let _email_decorators;
    let _email_initializers = [];
    let _email_extraInitializers = [];
    let _telefone_decorators;
    let _telefone_initializers = [];
    let _telefone_extraInitializers = [];
    let _moradas_decorators;
    let _moradas_initializers = [];
    let _moradas_extraInitializers = [];
    return class CreateClienteDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _nome_decorators = [ApiProperty(), IsString(), IsNotEmpty()];
            _apelido_decorators = [ApiProperty(), IsString(), IsNotEmpty()];
            _email_decorators = [ApiProperty(), IsEmail(), IsNotEmpty()];
            _telefone_decorators = [ApiProperty(), IsString(), IsNotEmpty()];
            _moradas_decorators = [ApiProperty({ type: [MoradaClienteDto], required: false }), IsArray(), ValidateNested({ each: true }), Type(() => MoradaClienteDto), IsOptional()];
            __esDecorate(null, null, _nome_decorators, { kind: "field", name: "nome", static: false, private: false, access: { has: obj => "nome" in obj, get: obj => obj.nome, set: (obj, value) => { obj.nome = value; } }, metadata: _metadata }, _nome_initializers, _nome_extraInitializers);
            __esDecorate(null, null, _apelido_decorators, { kind: "field", name: "apelido", static: false, private: false, access: { has: obj => "apelido" in obj, get: obj => obj.apelido, set: (obj, value) => { obj.apelido = value; } }, metadata: _metadata }, _apelido_initializers, _apelido_extraInitializers);
            __esDecorate(null, null, _email_decorators, { kind: "field", name: "email", static: false, private: false, access: { has: obj => "email" in obj, get: obj => obj.email, set: (obj, value) => { obj.email = value; } }, metadata: _metadata }, _email_initializers, _email_extraInitializers);
            __esDecorate(null, null, _telefone_decorators, { kind: "field", name: "telefone", static: false, private: false, access: { has: obj => "telefone" in obj, get: obj => obj.telefone, set: (obj, value) => { obj.telefone = value; } }, metadata: _metadata }, _telefone_initializers, _telefone_extraInitializers);
            __esDecorate(null, null, _moradas_decorators, { kind: "field", name: "moradas", static: false, private: false, access: { has: obj => "moradas" in obj, get: obj => obj.moradas, set: (obj, value) => { obj.moradas = value; } }, metadata: _metadata }, _moradas_initializers, _moradas_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        nome = __runInitializers(this, _nome_initializers, void 0);
        apelido = (__runInitializers(this, _nome_extraInitializers), __runInitializers(this, _apelido_initializers, void 0));
        email = (__runInitializers(this, _apelido_extraInitializers), __runInitializers(this, _email_initializers, void 0));
        telefone = (__runInitializers(this, _email_extraInitializers), __runInitializers(this, _telefone_initializers, void 0));
        moradas = (__runInitializers(this, _telefone_extraInitializers), __runInitializers(this, _moradas_initializers, void 0));
        constructor() {
            __runInitializers(this, _moradas_extraInitializers);
        }
    };
})();
export { CreateClienteDto };
