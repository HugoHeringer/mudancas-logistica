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
import { IsArray, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
let HorarioDto = (() => {
    let _diaSemana_decorators;
    let _diaSemana_initializers = [];
    let _diaSemana_extraInitializers = [];
    let _horaInicio_decorators;
    let _horaInicio_initializers = [];
    let _horaInicio_extraInitializers = [];
    let _horaFim_decorators;
    let _horaFim_initializers = [];
    let _horaFim_extraInitializers = [];
    let _ativo_decorators;
    let _ativo_initializers = [];
    let _ativo_extraInitializers = [];
    return class HorarioDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _diaSemana_decorators = [IsNumber()];
            _horaInicio_decorators = [IsString()];
            _horaFim_decorators = [IsString()];
            _ativo_decorators = [IsNumber()];
            __esDecorate(null, null, _diaSemana_decorators, { kind: "field", name: "diaSemana", static: false, private: false, access: { has: obj => "diaSemana" in obj, get: obj => obj.diaSemana, set: (obj, value) => { obj.diaSemana = value; } }, metadata: _metadata }, _diaSemana_initializers, _diaSemana_extraInitializers);
            __esDecorate(null, null, _horaInicio_decorators, { kind: "field", name: "horaInicio", static: false, private: false, access: { has: obj => "horaInicio" in obj, get: obj => obj.horaInicio, set: (obj, value) => { obj.horaInicio = value; } }, metadata: _metadata }, _horaInicio_initializers, _horaInicio_extraInitializers);
            __esDecorate(null, null, _horaFim_decorators, { kind: "field", name: "horaFim", static: false, private: false, access: { has: obj => "horaFim" in obj, get: obj => obj.horaFim, set: (obj, value) => { obj.horaFim = value; } }, metadata: _metadata }, _horaFim_initializers, _horaFim_extraInitializers);
            __esDecorate(null, null, _ativo_decorators, { kind: "field", name: "ativo", static: false, private: false, access: { has: obj => "ativo" in obj, get: obj => obj.ativo, set: (obj, value) => { obj.ativo = value; } }, metadata: _metadata }, _ativo_initializers, _ativo_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        diaSemana = __runInitializers(this, _diaSemana_initializers, void 0);
        horaInicio = (__runInitializers(this, _diaSemana_extraInitializers), __runInitializers(this, _horaInicio_initializers, void 0));
        horaFim = (__runInitializers(this, _horaInicio_extraInitializers), __runInitializers(this, _horaFim_initializers, void 0));
        ativo = (__runInitializers(this, _horaFim_extraInitializers), __runInitializers(this, _ativo_initializers, void 0));
        constructor() {
            __runInitializers(this, _ativo_extraInitializers);
        }
    };
})();
let UpdateConfigAgendaDto = (() => {
    let _horarios_decorators;
    let _horarios_initializers = [];
    let _horarios_extraInitializers = [];
    let _capacidadePorSlot_decorators;
    let _capacidadePorSlot_initializers = [];
    let _capacidadePorSlot_extraInitializers = [];
    let _duracaoSlotMinutos_decorators;
    let _duracaoSlotMinutos_initializers = [];
    let _duracaoSlotMinutos_extraInitializers = [];
    return class UpdateConfigAgendaDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _horarios_decorators = [ApiProperty({ type: [HorarioDto] }), IsArray(), ValidateNested({ each: true }), Type(() => HorarioDto), IsOptional()];
            _capacidadePorSlot_decorators = [ApiProperty(), IsNumber(), IsOptional()];
            _duracaoSlotMinutos_decorators = [ApiProperty(), IsNumber(), IsOptional()];
            __esDecorate(null, null, _horarios_decorators, { kind: "field", name: "horarios", static: false, private: false, access: { has: obj => "horarios" in obj, get: obj => obj.horarios, set: (obj, value) => { obj.horarios = value; } }, metadata: _metadata }, _horarios_initializers, _horarios_extraInitializers);
            __esDecorate(null, null, _capacidadePorSlot_decorators, { kind: "field", name: "capacidadePorSlot", static: false, private: false, access: { has: obj => "capacidadePorSlot" in obj, get: obj => obj.capacidadePorSlot, set: (obj, value) => { obj.capacidadePorSlot = value; } }, metadata: _metadata }, _capacidadePorSlot_initializers, _capacidadePorSlot_extraInitializers);
            __esDecorate(null, null, _duracaoSlotMinutos_decorators, { kind: "field", name: "duracaoSlotMinutos", static: false, private: false, access: { has: obj => "duracaoSlotMinutos" in obj, get: obj => obj.duracaoSlotMinutos, set: (obj, value) => { obj.duracaoSlotMinutos = value; } }, metadata: _metadata }, _duracaoSlotMinutos_initializers, _duracaoSlotMinutos_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        horarios = __runInitializers(this, _horarios_initializers, void 0);
        capacidadePorSlot = (__runInitializers(this, _horarios_extraInitializers), __runInitializers(this, _capacidadePorSlot_initializers, void 0));
        duracaoSlotMinutos = (__runInitializers(this, _capacidadePorSlot_extraInitializers), __runInitializers(this, _duracaoSlotMinutos_initializers, void 0));
        constructor() {
            __runInitializers(this, _duracaoSlotMinutos_extraInitializers);
        }
    };
})();
export { UpdateConfigAgendaDto };
