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
import { IsNumber, IsBoolean, IsNotEmpty, IsOptional, IsString, IsArray, ValidateNested, Min, } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
let CombustivelDto = (() => {
    let _valor_decorators;
    let _valor_initializers = [];
    let _valor_extraInitializers = [];
    let _litros_decorators;
    let _litros_initializers = [];
    let _litros_extraInitializers = [];
    return class CombustivelDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _valor_decorators = [IsNumber(), Min(0)];
            _litros_decorators = [IsNumber(), Min(0)];
            __esDecorate(null, null, _valor_decorators, { kind: "field", name: "valor", static: false, private: false, access: { has: obj => "valor" in obj, get: obj => obj.valor, set: (obj, value) => { obj.valor = value; } }, metadata: _metadata }, _valor_initializers, _valor_extraInitializers);
            __esDecorate(null, null, _litros_decorators, { kind: "field", name: "litros", static: false, private: false, access: { has: obj => "litros" in obj, get: obj => obj.litros, set: (obj, value) => { obj.litros = value; } }, metadata: _metadata }, _litros_initializers, _litros_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        valor = __runInitializers(this, _valor_initializers, void 0);
        litros = (__runInitializers(this, _valor_extraInitializers), __runInitializers(this, _litros_initializers, void 0));
        constructor() {
            __runInitializers(this, _litros_extraInitializers);
        }
    };
})();
let AlimentacaoDto = (() => {
    let _teve_decorators;
    let _teve_initializers = [];
    let _teve_extraInitializers = [];
    let _valor_decorators;
    let _valor_initializers = [];
    let _valor_extraInitializers = [];
    return class AlimentacaoDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _teve_decorators = [IsBoolean()];
            _valor_decorators = [IsNumber(), Min(0)];
            __esDecorate(null, null, _teve_decorators, { kind: "field", name: "teve", static: false, private: false, access: { has: obj => "teve" in obj, get: obj => obj.teve, set: (obj, value) => { obj.teve = value; } }, metadata: _metadata }, _teve_initializers, _teve_extraInitializers);
            __esDecorate(null, null, _valor_decorators, { kind: "field", name: "valor", static: false, private: false, access: { has: obj => "valor" in obj, get: obj => obj.valor, set: (obj, value) => { obj.valor = value; } }, metadata: _metadata }, _valor_initializers, _valor_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        teve = __runInitializers(this, _teve_initializers, void 0);
        valor = (__runInitializers(this, _teve_extraInitializers), __runInitializers(this, _valor_initializers, void 0));
        constructor() {
            __runInitializers(this, _valor_extraInitializers);
        }
    };
})();
let MateriaisUtilizadosDto = (() => {
    let _protecaoFilme_decorators;
    let _protecaoFilme_initializers = [];
    let _protecaoFilme_extraInitializers = [];
    let _protecaoCartao_decorators;
    let _protecaoCartao_initializers = [];
    let _protecaoCartao_extraInitializers = [];
    let _caixas_decorators;
    let _caixas_initializers = [];
    let _caixas_extraInitializers = [];
    let _fitaCola_decorators;
    let _fitaCola_initializers = [];
    let _fitaCola_extraInitializers = [];
    return class MateriaisUtilizadosDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _protecaoFilme_decorators = [IsNumber(), Min(0), IsOptional()];
            _protecaoCartao_decorators = [IsNumber(), Min(0), IsOptional()];
            _caixas_decorators = [IsNumber(), Min(0), IsOptional()];
            _fitaCola_decorators = [IsNumber(), Min(0), IsOptional()];
            __esDecorate(null, null, _protecaoFilme_decorators, { kind: "field", name: "protecaoFilme", static: false, private: false, access: { has: obj => "protecaoFilme" in obj, get: obj => obj.protecaoFilme, set: (obj, value) => { obj.protecaoFilme = value; } }, metadata: _metadata }, _protecaoFilme_initializers, _protecaoFilme_extraInitializers);
            __esDecorate(null, null, _protecaoCartao_decorators, { kind: "field", name: "protecaoCartao", static: false, private: false, access: { has: obj => "protecaoCartao" in obj, get: obj => obj.protecaoCartao, set: (obj, value) => { obj.protecaoCartao = value; } }, metadata: _metadata }, _protecaoCartao_initializers, _protecaoCartao_extraInitializers);
            __esDecorate(null, null, _caixas_decorators, { kind: "field", name: "caixas", static: false, private: false, access: { has: obj => "caixas" in obj, get: obj => obj.caixas, set: (obj, value) => { obj.caixas = value; } }, metadata: _metadata }, _caixas_initializers, _caixas_extraInitializers);
            __esDecorate(null, null, _fitaCola_decorators, { kind: "field", name: "fitaCola", static: false, private: false, access: { has: obj => "fitaCola" in obj, get: obj => obj.fitaCola, set: (obj, value) => { obj.fitaCola = value; } }, metadata: _metadata }, _fitaCola_initializers, _fitaCola_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        protecaoFilme = __runInitializers(this, _protecaoFilme_initializers, void 0);
        protecaoCartao = (__runInitializers(this, _protecaoFilme_extraInitializers), __runInitializers(this, _protecaoCartao_initializers, void 0));
        caixas = (__runInitializers(this, _protecaoCartao_extraInitializers), __runInitializers(this, _caixas_initializers, void 0));
        fitaCola = (__runInitializers(this, _caixas_extraInitializers), __runInitializers(this, _fitaCola_initializers, void 0));
        constructor() {
            __runInitializers(this, _fitaCola_extraInitializers);
        }
    };
})();
let ConcluirMudancaDto = (() => {
    let _horasRegistadas_decorators;
    let _horasRegistadas_initializers = [];
    let _horasRegistadas_extraInitializers = [];
    let _horasCobradas_decorators;
    let _horasCobradas_initializers = [];
    let _horasCobradas_extraInitializers = [];
    let _ajudantesConfirmados_decorators;
    let _ajudantesConfirmados_initializers = [];
    let _ajudantesConfirmados_extraInitializers = [];
    let _materiaisUtilizados_decorators;
    let _materiaisUtilizados_initializers = [];
    let _materiaisUtilizados_extraInitializers = [];
    let _combustivel_decorators;
    let _combustivel_initializers = [];
    let _combustivel_extraInitializers = [];
    let _alimentacao_decorators;
    let _alimentacao_initializers = [];
    let _alimentacao_extraInitializers = [];
    let _observacoes_decorators;
    let _observacoes_initializers = [];
    let _observacoes_extraInitializers = [];
    let _concluidoPor_decorators;
    let _concluidoPor_initializers = [];
    let _concluidoPor_extraInitializers = [];
    return class ConcluirMudancaDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _horasRegistadas_decorators = [ApiProperty(), IsNumber(), Min(0)];
            _horasCobradas_decorators = [ApiProperty(), IsNumber(), Min(0)];
            _ajudantesConfirmados_decorators = [ApiProperty({ type: [String] }), IsArray(), IsString({ each: true })];
            _materiaisUtilizados_decorators = [ApiProperty({ required: false }), IsOptional(), ValidateNested(), Type(() => MateriaisUtilizadosDto)];
            _combustivel_decorators = [ApiProperty({ required: false }), IsOptional(), ValidateNested(), Type(() => CombustivelDto)];
            _alimentacao_decorators = [ApiProperty({ required: false }), IsOptional(), ValidateNested(), Type(() => AlimentacaoDto)];
            _observacoes_decorators = [ApiProperty({ required: false }), IsString(), IsOptional()];
            _concluidoPor_decorators = [ApiProperty(), IsString(), IsNotEmpty()];
            __esDecorate(null, null, _horasRegistadas_decorators, { kind: "field", name: "horasRegistadas", static: false, private: false, access: { has: obj => "horasRegistadas" in obj, get: obj => obj.horasRegistadas, set: (obj, value) => { obj.horasRegistadas = value; } }, metadata: _metadata }, _horasRegistadas_initializers, _horasRegistadas_extraInitializers);
            __esDecorate(null, null, _horasCobradas_decorators, { kind: "field", name: "horasCobradas", static: false, private: false, access: { has: obj => "horasCobradas" in obj, get: obj => obj.horasCobradas, set: (obj, value) => { obj.horasCobradas = value; } }, metadata: _metadata }, _horasCobradas_initializers, _horasCobradas_extraInitializers);
            __esDecorate(null, null, _ajudantesConfirmados_decorators, { kind: "field", name: "ajudantesConfirmados", static: false, private: false, access: { has: obj => "ajudantesConfirmados" in obj, get: obj => obj.ajudantesConfirmados, set: (obj, value) => { obj.ajudantesConfirmados = value; } }, metadata: _metadata }, _ajudantesConfirmados_initializers, _ajudantesConfirmados_extraInitializers);
            __esDecorate(null, null, _materiaisUtilizados_decorators, { kind: "field", name: "materiaisUtilizados", static: false, private: false, access: { has: obj => "materiaisUtilizados" in obj, get: obj => obj.materiaisUtilizados, set: (obj, value) => { obj.materiaisUtilizados = value; } }, metadata: _metadata }, _materiaisUtilizados_initializers, _materiaisUtilizados_extraInitializers);
            __esDecorate(null, null, _combustivel_decorators, { kind: "field", name: "combustivel", static: false, private: false, access: { has: obj => "combustivel" in obj, get: obj => obj.combustivel, set: (obj, value) => { obj.combustivel = value; } }, metadata: _metadata }, _combustivel_initializers, _combustivel_extraInitializers);
            __esDecorate(null, null, _alimentacao_decorators, { kind: "field", name: "alimentacao", static: false, private: false, access: { has: obj => "alimentacao" in obj, get: obj => obj.alimentacao, set: (obj, value) => { obj.alimentacao = value; } }, metadata: _metadata }, _alimentacao_initializers, _alimentacao_extraInitializers);
            __esDecorate(null, null, _observacoes_decorators, { kind: "field", name: "observacoes", static: false, private: false, access: { has: obj => "observacoes" in obj, get: obj => obj.observacoes, set: (obj, value) => { obj.observacoes = value; } }, metadata: _metadata }, _observacoes_initializers, _observacoes_extraInitializers);
            __esDecorate(null, null, _concluidoPor_decorators, { kind: "field", name: "concluidoPor", static: false, private: false, access: { has: obj => "concluidoPor" in obj, get: obj => obj.concluidoPor, set: (obj, value) => { obj.concluidoPor = value; } }, metadata: _metadata }, _concluidoPor_initializers, _concluidoPor_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        horasRegistadas = __runInitializers(this, _horasRegistadas_initializers, void 0);
        horasCobradas = (__runInitializers(this, _horasRegistadas_extraInitializers), __runInitializers(this, _horasCobradas_initializers, void 0));
        ajudantesConfirmados = (__runInitializers(this, _horasCobradas_extraInitializers), __runInitializers(this, _ajudantesConfirmados_initializers, void 0));
        materiaisUtilizados = (__runInitializers(this, _ajudantesConfirmados_extraInitializers), __runInitializers(this, _materiaisUtilizados_initializers, void 0));
        combustivel = (__runInitializers(this, _materiaisUtilizados_extraInitializers), __runInitializers(this, _combustivel_initializers, void 0));
        alimentacao = (__runInitializers(this, _combustivel_extraInitializers), __runInitializers(this, _alimentacao_initializers, void 0));
        observacoes = (__runInitializers(this, _alimentacao_extraInitializers), __runInitializers(this, _observacoes_initializers, void 0));
        concluidoPor = (__runInitializers(this, _observacoes_extraInitializers), __runInitializers(this, _concluidoPor_initializers, void 0));
        constructor() {
            __runInitializers(this, _concluidoPor_extraInitializers);
        }
    };
})();
export { ConcluirMudancaDto };
