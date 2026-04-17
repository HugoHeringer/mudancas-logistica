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
import { IsString, IsNotEmpty, IsNumber, IsOptional, IsArray, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
let AprovarMudancaDto = (() => {
    let _aprovadoPor_decorators;
    let _aprovadoPor_initializers = [];
    let _aprovadoPor_extraInitializers = [];
    let _motoristaId_decorators;
    let _motoristaId_initializers = [];
    let _motoristaId_extraInitializers = [];
    let _ajudantesIds_decorators;
    let _ajudantesIds_initializers = [];
    let _ajudantesIds_extraInitializers = [];
    let _tempoEstimadoHoras_decorators;
    let _tempoEstimadoHoras_initializers = [];
    let _tempoEstimadoHoras_extraInitializers = [];
    let _observacoesAdmin_decorators;
    let _observacoesAdmin_initializers = [];
    let _observacoesAdmin_extraInitializers = [];
    return class AprovarMudancaDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _aprovadoPor_decorators = [ApiProperty(), IsString(), IsNotEmpty()];
            _motoristaId_decorators = [ApiProperty(), IsString(), IsNotEmpty()];
            _ajudantesIds_decorators = [ApiProperty({ type: [String], required: false }), IsArray(), IsString({ each: true }), IsOptional()];
            _tempoEstimadoHoras_decorators = [ApiProperty(), IsNumber(), Min(0.5), Max(24), IsNotEmpty()];
            _observacoesAdmin_decorators = [ApiProperty({ required: false }), IsString(), IsOptional()];
            __esDecorate(null, null, _aprovadoPor_decorators, { kind: "field", name: "aprovadoPor", static: false, private: false, access: { has: obj => "aprovadoPor" in obj, get: obj => obj.aprovadoPor, set: (obj, value) => { obj.aprovadoPor = value; } }, metadata: _metadata }, _aprovadoPor_initializers, _aprovadoPor_extraInitializers);
            __esDecorate(null, null, _motoristaId_decorators, { kind: "field", name: "motoristaId", static: false, private: false, access: { has: obj => "motoristaId" in obj, get: obj => obj.motoristaId, set: (obj, value) => { obj.motoristaId = value; } }, metadata: _metadata }, _motoristaId_initializers, _motoristaId_extraInitializers);
            __esDecorate(null, null, _ajudantesIds_decorators, { kind: "field", name: "ajudantesIds", static: false, private: false, access: { has: obj => "ajudantesIds" in obj, get: obj => obj.ajudantesIds, set: (obj, value) => { obj.ajudantesIds = value; } }, metadata: _metadata }, _ajudantesIds_initializers, _ajudantesIds_extraInitializers);
            __esDecorate(null, null, _tempoEstimadoHoras_decorators, { kind: "field", name: "tempoEstimadoHoras", static: false, private: false, access: { has: obj => "tempoEstimadoHoras" in obj, get: obj => obj.tempoEstimadoHoras, set: (obj, value) => { obj.tempoEstimadoHoras = value; } }, metadata: _metadata }, _tempoEstimadoHoras_initializers, _tempoEstimadoHoras_extraInitializers);
            __esDecorate(null, null, _observacoesAdmin_decorators, { kind: "field", name: "observacoesAdmin", static: false, private: false, access: { has: obj => "observacoesAdmin" in obj, get: obj => obj.observacoesAdmin, set: (obj, value) => { obj.observacoesAdmin = value; } }, metadata: _metadata }, _observacoesAdmin_initializers, _observacoesAdmin_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        aprovadoPor = __runInitializers(this, _aprovadoPor_initializers, void 0);
        motoristaId = (__runInitializers(this, _aprovadoPor_extraInitializers), __runInitializers(this, _motoristaId_initializers, void 0));
        ajudantesIds = (__runInitializers(this, _motoristaId_extraInitializers), __runInitializers(this, _ajudantesIds_initializers, void 0));
        tempoEstimadoHoras = (__runInitializers(this, _ajudantesIds_extraInitializers), __runInitializers(this, _tempoEstimadoHoras_initializers, void 0));
        observacoesAdmin = (__runInitializers(this, _tempoEstimadoHoras_extraInitializers), __runInitializers(this, _observacoesAdmin_initializers, void 0));
        constructor() {
            __runInitializers(this, _observacoesAdmin_extraInitializers);
        }
    };
})();
export { AprovarMudancaDto };
