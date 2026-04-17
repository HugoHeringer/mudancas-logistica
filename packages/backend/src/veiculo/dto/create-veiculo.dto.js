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
import { IsString, IsNotEmpty, IsNumber, IsBoolean, IsOptional, IsEnum, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
let CreateVeiculoDto = (() => {
    let _nome_decorators;
    let _nome_initializers = [];
    let _nome_extraInitializers = [];
    let _marca_decorators;
    let _marca_initializers = [];
    let _marca_extraInitializers = [];
    let _modelo_decorators;
    let _modelo_initializers = [];
    let _modelo_extraInitializers = [];
    let _matricula_decorators;
    let _matricula_initializers = [];
    let _matricula_extraInitializers = [];
    let _metrosCubicos_decorators;
    let _metrosCubicos_initializers = [];
    let _metrosCubicos_extraInitializers = [];
    let _precoHora_decorators;
    let _precoHora_initializers = [];
    let _precoHora_extraInitializers = [];
    let _estado_decorators;
    let _estado_initializers = [];
    let _estado_extraInitializers = [];
    let _eParaUrgencias_decorators;
    let _eParaUrgencias_initializers = [];
    let _eParaUrgencias_extraInitializers = [];
    return class CreateVeiculoDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _nome_decorators = [ApiProperty(), IsString(), IsNotEmpty()];
            _marca_decorators = [ApiProperty(), IsString(), IsNotEmpty()];
            _modelo_decorators = [ApiProperty({ required: false }), IsString(), IsOptional()];
            _matricula_decorators = [ApiProperty(), IsString(), IsNotEmpty()];
            _metrosCubicos_decorators = [ApiProperty(), IsNumber(), Min(1), IsNotEmpty()];
            _precoHora_decorators = [ApiProperty(), IsNumber(), Min(0), IsNotEmpty()];
            _estado_decorators = [ApiProperty({ enum: ['disponivel', 'em_servico', 'em_manutencao'], default: 'disponivel' }), IsEnum(['disponivel', 'em_servico', 'em_manutencao']), IsOptional()];
            _eParaUrgencias_decorators = [ApiProperty({ default: false }), IsBoolean(), IsOptional()];
            __esDecorate(null, null, _nome_decorators, { kind: "field", name: "nome", static: false, private: false, access: { has: obj => "nome" in obj, get: obj => obj.nome, set: (obj, value) => { obj.nome = value; } }, metadata: _metadata }, _nome_initializers, _nome_extraInitializers);
            __esDecorate(null, null, _marca_decorators, { kind: "field", name: "marca", static: false, private: false, access: { has: obj => "marca" in obj, get: obj => obj.marca, set: (obj, value) => { obj.marca = value; } }, metadata: _metadata }, _marca_initializers, _marca_extraInitializers);
            __esDecorate(null, null, _modelo_decorators, { kind: "field", name: "modelo", static: false, private: false, access: { has: obj => "modelo" in obj, get: obj => obj.modelo, set: (obj, value) => { obj.modelo = value; } }, metadata: _metadata }, _modelo_initializers, _modelo_extraInitializers);
            __esDecorate(null, null, _matricula_decorators, { kind: "field", name: "matricula", static: false, private: false, access: { has: obj => "matricula" in obj, get: obj => obj.matricula, set: (obj, value) => { obj.matricula = value; } }, metadata: _metadata }, _matricula_initializers, _matricula_extraInitializers);
            __esDecorate(null, null, _metrosCubicos_decorators, { kind: "field", name: "metrosCubicos", static: false, private: false, access: { has: obj => "metrosCubicos" in obj, get: obj => obj.metrosCubicos, set: (obj, value) => { obj.metrosCubicos = value; } }, metadata: _metadata }, _metrosCubicos_initializers, _metrosCubicos_extraInitializers);
            __esDecorate(null, null, _precoHora_decorators, { kind: "field", name: "precoHora", static: false, private: false, access: { has: obj => "precoHora" in obj, get: obj => obj.precoHora, set: (obj, value) => { obj.precoHora = value; } }, metadata: _metadata }, _precoHora_initializers, _precoHora_extraInitializers);
            __esDecorate(null, null, _estado_decorators, { kind: "field", name: "estado", static: false, private: false, access: { has: obj => "estado" in obj, get: obj => obj.estado, set: (obj, value) => { obj.estado = value; } }, metadata: _metadata }, _estado_initializers, _estado_extraInitializers);
            __esDecorate(null, null, _eParaUrgencias_decorators, { kind: "field", name: "eParaUrgencias", static: false, private: false, access: { has: obj => "eParaUrgencias" in obj, get: obj => obj.eParaUrgencias, set: (obj, value) => { obj.eParaUrgencias = value; } }, metadata: _metadata }, _eParaUrgencias_initializers, _eParaUrgencias_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        nome = __runInitializers(this, _nome_initializers, void 0);
        marca = (__runInitializers(this, _nome_extraInitializers), __runInitializers(this, _marca_initializers, void 0));
        modelo = (__runInitializers(this, _marca_extraInitializers), __runInitializers(this, _modelo_initializers, void 0));
        matricula = (__runInitializers(this, _modelo_extraInitializers), __runInitializers(this, _matricula_initializers, void 0));
        metrosCubicos = (__runInitializers(this, _matricula_extraInitializers), __runInitializers(this, _metrosCubicos_initializers, void 0));
        precoHora = (__runInitializers(this, _metrosCubicos_extraInitializers), __runInitializers(this, _precoHora_initializers, void 0));
        estado = (__runInitializers(this, _precoHora_extraInitializers), __runInitializers(this, _estado_initializers, void 0));
        eParaUrgencias = (__runInitializers(this, _estado_extraInitializers), __runInitializers(this, _eParaUrgencias_initializers, void 0));
        constructor() {
            __runInitializers(this, _eParaUrgencias_extraInitializers);
        }
    };
})();
export { CreateVeiculoDto };
