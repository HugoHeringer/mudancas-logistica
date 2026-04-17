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
import { IsString, IsNotEmpty, IsEmail, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
let CreateMotoristaDto = (() => {
    let _nome_decorators;
    let _nome_initializers = [];
    let _nome_extraInitializers = [];
    let _email_decorators;
    let _email_initializers = [];
    let _email_extraInitializers = [];
    let _telefone_decorators;
    let _telefone_initializers = [];
    let _telefone_extraInitializers = [];
    let _cartaConducao_decorators;
    let _cartaConducao_initializers = [];
    let _cartaConducao_extraInitializers = [];
    let _validadeCarta_decorators;
    let _validadeCarta_initializers = [];
    let _validadeCarta_extraInitializers = [];
    let _veiculoId_decorators;
    let _veiculoId_initializers = [];
    let _veiculoId_extraInitializers = [];
    let _estado_decorators;
    let _estado_initializers = [];
    let _estado_extraInitializers = [];
    return class CreateMotoristaDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _nome_decorators = [ApiProperty(), IsString(), IsNotEmpty()];
            _email_decorators = [ApiProperty(), IsEmail(), IsNotEmpty()];
            _telefone_decorators = [ApiProperty(), IsString(), IsNotEmpty()];
            _cartaConducao_decorators = [ApiProperty(), IsString(), IsNotEmpty()];
            _validadeCarta_decorators = [ApiProperty(), IsString(), IsNotEmpty()];
            _veiculoId_decorators = [ApiProperty({ required: false }), IsString(), IsOptional()];
            _estado_decorators = [ApiProperty({ enum: ['disponivel', 'em_servico', 'indisponivel'], default: 'disponivel' }), IsEnum(['disponivel', 'em_servico', 'indisponivel']), IsOptional()];
            __esDecorate(null, null, _nome_decorators, { kind: "field", name: "nome", static: false, private: false, access: { has: obj => "nome" in obj, get: obj => obj.nome, set: (obj, value) => { obj.nome = value; } }, metadata: _metadata }, _nome_initializers, _nome_extraInitializers);
            __esDecorate(null, null, _email_decorators, { kind: "field", name: "email", static: false, private: false, access: { has: obj => "email" in obj, get: obj => obj.email, set: (obj, value) => { obj.email = value; } }, metadata: _metadata }, _email_initializers, _email_extraInitializers);
            __esDecorate(null, null, _telefone_decorators, { kind: "field", name: "telefone", static: false, private: false, access: { has: obj => "telefone" in obj, get: obj => obj.telefone, set: (obj, value) => { obj.telefone = value; } }, metadata: _metadata }, _telefone_initializers, _telefone_extraInitializers);
            __esDecorate(null, null, _cartaConducao_decorators, { kind: "field", name: "cartaConducao", static: false, private: false, access: { has: obj => "cartaConducao" in obj, get: obj => obj.cartaConducao, set: (obj, value) => { obj.cartaConducao = value; } }, metadata: _metadata }, _cartaConducao_initializers, _cartaConducao_extraInitializers);
            __esDecorate(null, null, _validadeCarta_decorators, { kind: "field", name: "validadeCarta", static: false, private: false, access: { has: obj => "validadeCarta" in obj, get: obj => obj.validadeCarta, set: (obj, value) => { obj.validadeCarta = value; } }, metadata: _metadata }, _validadeCarta_initializers, _validadeCarta_extraInitializers);
            __esDecorate(null, null, _veiculoId_decorators, { kind: "field", name: "veiculoId", static: false, private: false, access: { has: obj => "veiculoId" in obj, get: obj => obj.veiculoId, set: (obj, value) => { obj.veiculoId = value; } }, metadata: _metadata }, _veiculoId_initializers, _veiculoId_extraInitializers);
            __esDecorate(null, null, _estado_decorators, { kind: "field", name: "estado", static: false, private: false, access: { has: obj => "estado" in obj, get: obj => obj.estado, set: (obj, value) => { obj.estado = value; } }, metadata: _metadata }, _estado_initializers, _estado_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        nome = __runInitializers(this, _nome_initializers, void 0);
        email = (__runInitializers(this, _nome_extraInitializers), __runInitializers(this, _email_initializers, void 0));
        telefone = (__runInitializers(this, _email_extraInitializers), __runInitializers(this, _telefone_initializers, void 0));
        cartaConducao = (__runInitializers(this, _telefone_extraInitializers), __runInitializers(this, _cartaConducao_initializers, void 0));
        validadeCarta = (__runInitializers(this, _cartaConducao_extraInitializers), __runInitializers(this, _validadeCarta_initializers, void 0));
        veiculoId = (__runInitializers(this, _validadeCarta_extraInitializers), __runInitializers(this, _veiculoId_initializers, void 0));
        estado = (__runInitializers(this, _veiculoId_extraInitializers), __runInitializers(this, _estado_initializers, void 0));
        constructor() {
            __runInitializers(this, _estado_extraInitializers);
        }
    };
})();
export { CreateMotoristaDto };
