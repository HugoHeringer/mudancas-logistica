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
import { IsString, IsNotEmpty, IsNumber, IsEnum, IsOptional, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
let CreateMovimentoDto = (() => {
    let _mudancaId_decorators;
    let _mudancaId_initializers = [];
    let _mudancaId_extraInitializers = [];
    let _tipo_decorators;
    let _tipo_initializers = [];
    let _tipo_extraInitializers = [];
    let _categoria_decorators;
    let _categoria_initializers = [];
    let _categoria_extraInitializers = [];
    let _descricao_decorators;
    let _descricao_initializers = [];
    let _descricao_extraInitializers = [];
    let _valor_decorators;
    let _valor_initializers = [];
    let _valor_extraInitializers = [];
    let _data_decorators;
    let _data_initializers = [];
    let _data_extraInitializers = [];
    return class CreateMovimentoDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _mudancaId_decorators = [ApiProperty({ required: false }), IsString(), IsOptional()];
            _tipo_decorators = [ApiProperty({ enum: ['receita', 'custo'] }), IsEnum(['receita', 'custo']), IsNotEmpty()];
            _categoria_decorators = [ApiProperty({
                    enum: ['servico', 'materiais', 'combustivel', 'alimentacao', 'manutencao', 'outros'],
                }), IsEnum(['servico', 'materiais', 'combustivel', 'alimentacao', 'manutencao', 'outros']), IsNotEmpty()];
            _descricao_decorators = [ApiProperty(), IsString(), IsNotEmpty()];
            _valor_decorators = [ApiProperty(), IsNumber(), Min(0), IsNotEmpty()];
            _data_decorators = [ApiProperty(), IsString(), IsNotEmpty()];
            __esDecorate(null, null, _mudancaId_decorators, { kind: "field", name: "mudancaId", static: false, private: false, access: { has: obj => "mudancaId" in obj, get: obj => obj.mudancaId, set: (obj, value) => { obj.mudancaId = value; } }, metadata: _metadata }, _mudancaId_initializers, _mudancaId_extraInitializers);
            __esDecorate(null, null, _tipo_decorators, { kind: "field", name: "tipo", static: false, private: false, access: { has: obj => "tipo" in obj, get: obj => obj.tipo, set: (obj, value) => { obj.tipo = value; } }, metadata: _metadata }, _tipo_initializers, _tipo_extraInitializers);
            __esDecorate(null, null, _categoria_decorators, { kind: "field", name: "categoria", static: false, private: false, access: { has: obj => "categoria" in obj, get: obj => obj.categoria, set: (obj, value) => { obj.categoria = value; } }, metadata: _metadata }, _categoria_initializers, _categoria_extraInitializers);
            __esDecorate(null, null, _descricao_decorators, { kind: "field", name: "descricao", static: false, private: false, access: { has: obj => "descricao" in obj, get: obj => obj.descricao, set: (obj, value) => { obj.descricao = value; } }, metadata: _metadata }, _descricao_initializers, _descricao_extraInitializers);
            __esDecorate(null, null, _valor_decorators, { kind: "field", name: "valor", static: false, private: false, access: { has: obj => "valor" in obj, get: obj => obj.valor, set: (obj, value) => { obj.valor = value; } }, metadata: _metadata }, _valor_initializers, _valor_extraInitializers);
            __esDecorate(null, null, _data_decorators, { kind: "field", name: "data", static: false, private: false, access: { has: obj => "data" in obj, get: obj => obj.data, set: (obj, value) => { obj.data = value; } }, metadata: _metadata }, _data_initializers, _data_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        mudancaId = __runInitializers(this, _mudancaId_initializers, void 0);
        tipo = (__runInitializers(this, _mudancaId_extraInitializers), __runInitializers(this, _tipo_initializers, void 0));
        categoria = (__runInitializers(this, _tipo_extraInitializers), __runInitializers(this, _categoria_initializers, void 0));
        descricao = (__runInitializers(this, _categoria_extraInitializers), __runInitializers(this, _descricao_initializers, void 0));
        valor = (__runInitializers(this, _descricao_extraInitializers), __runInitializers(this, _valor_initializers, void 0));
        data = (__runInitializers(this, _valor_extraInitializers), __runInitializers(this, _data_initializers, void 0));
        constructor() {
            __runInitializers(this, _data_extraInitializers);
        }
    };
})();
export { CreateMovimentoDto };
