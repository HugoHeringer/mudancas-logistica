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
import { IsString, IsNotEmpty, IsBoolean, IsArray, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
let CreateTemplateDto = (() => {
    let _nome_decorators;
    let _nome_initializers = [];
    let _nome_extraInitializers = [];
    let _assunto_decorators;
    let _assunto_initializers = [];
    let _assunto_extraInitializers = [];
    let _corpo_decorators;
    let _corpo_initializers = [];
    let _corpo_extraInitializers = [];
    let _variaveis_decorators;
    let _variaveis_initializers = [];
    let _variaveis_extraInitializers = [];
    let _eAtivo_decorators;
    let _eAtivo_initializers = [];
    let _eAtivo_extraInitializers = [];
    return class CreateTemplateDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _nome_decorators = [ApiProperty(), IsString(), IsNotEmpty()];
            _assunto_decorators = [ApiProperty(), IsString(), IsNotEmpty()];
            _corpo_decorators = [ApiProperty(), IsString(), IsNotEmpty()];
            _variaveis_decorators = [ApiProperty({ type: [String], required: false }), IsArray(), IsString({ each: true }), IsOptional()];
            _eAtivo_decorators = [ApiProperty({ default: true }), IsBoolean(), IsOptional()];
            __esDecorate(null, null, _nome_decorators, { kind: "field", name: "nome", static: false, private: false, access: { has: obj => "nome" in obj, get: obj => obj.nome, set: (obj, value) => { obj.nome = value; } }, metadata: _metadata }, _nome_initializers, _nome_extraInitializers);
            __esDecorate(null, null, _assunto_decorators, { kind: "field", name: "assunto", static: false, private: false, access: { has: obj => "assunto" in obj, get: obj => obj.assunto, set: (obj, value) => { obj.assunto = value; } }, metadata: _metadata }, _assunto_initializers, _assunto_extraInitializers);
            __esDecorate(null, null, _corpo_decorators, { kind: "field", name: "corpo", static: false, private: false, access: { has: obj => "corpo" in obj, get: obj => obj.corpo, set: (obj, value) => { obj.corpo = value; } }, metadata: _metadata }, _corpo_initializers, _corpo_extraInitializers);
            __esDecorate(null, null, _variaveis_decorators, { kind: "field", name: "variaveis", static: false, private: false, access: { has: obj => "variaveis" in obj, get: obj => obj.variaveis, set: (obj, value) => { obj.variaveis = value; } }, metadata: _metadata }, _variaveis_initializers, _variaveis_extraInitializers);
            __esDecorate(null, null, _eAtivo_decorators, { kind: "field", name: "eAtivo", static: false, private: false, access: { has: obj => "eAtivo" in obj, get: obj => obj.eAtivo, set: (obj, value) => { obj.eAtivo = value; } }, metadata: _metadata }, _eAtivo_initializers, _eAtivo_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        nome = __runInitializers(this, _nome_initializers, void 0);
        assunto = (__runInitializers(this, _nome_extraInitializers), __runInitializers(this, _assunto_initializers, void 0));
        corpo = (__runInitializers(this, _assunto_extraInitializers), __runInitializers(this, _corpo_initializers, void 0));
        variaveis = (__runInitializers(this, _corpo_extraInitializers), __runInitializers(this, _variaveis_initializers, void 0));
        eAtivo = (__runInitializers(this, _variaveis_extraInitializers), __runInitializers(this, _eAtivo_initializers, void 0));
        constructor() {
            __runInitializers(this, _eAtivo_extraInitializers);
        }
    };
})();
export { CreateTemplateDto };
