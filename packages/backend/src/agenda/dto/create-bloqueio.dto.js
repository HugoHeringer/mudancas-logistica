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
import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
let CreateBloqueioDto = (() => {
    let _dataInicio_decorators;
    let _dataInicio_initializers = [];
    let _dataInicio_extraInitializers = [];
    let _dataFim_decorators;
    let _dataFim_initializers = [];
    let _dataFim_extraInitializers = [];
    let _motivo_decorators;
    let _motivo_initializers = [];
    let _motivo_extraInitializers = [];
    return class CreateBloqueioDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _dataInicio_decorators = [ApiProperty(), IsString(), IsNotEmpty()];
            _dataFim_decorators = [ApiProperty(), IsString(), IsNotEmpty()];
            _motivo_decorators = [ApiProperty(), IsString(), IsNotEmpty()];
            __esDecorate(null, null, _dataInicio_decorators, { kind: "field", name: "dataInicio", static: false, private: false, access: { has: obj => "dataInicio" in obj, get: obj => obj.dataInicio, set: (obj, value) => { obj.dataInicio = value; } }, metadata: _metadata }, _dataInicio_initializers, _dataInicio_extraInitializers);
            __esDecorate(null, null, _dataFim_decorators, { kind: "field", name: "dataFim", static: false, private: false, access: { has: obj => "dataFim" in obj, get: obj => obj.dataFim, set: (obj, value) => { obj.dataFim = value; } }, metadata: _metadata }, _dataFim_initializers, _dataFim_extraInitializers);
            __esDecorate(null, null, _motivo_decorators, { kind: "field", name: "motivo", static: false, private: false, access: { has: obj => "motivo" in obj, get: obj => obj.motivo, set: (obj, value) => { obj.motivo = value; } }, metadata: _metadata }, _motivo_initializers, _motivo_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        dataInicio = __runInitializers(this, _dataInicio_initializers, void 0);
        dataFim = (__runInitializers(this, _dataInicio_extraInitializers), __runInitializers(this, _dataFim_initializers, void 0));
        motivo = (__runInitializers(this, _dataFim_extraInitializers), __runInitializers(this, _motivo_initializers, void 0));
        constructor() {
            __runInitializers(this, _motivo_extraInitializers);
        }
    };
})();
export { CreateBloqueioDto };
