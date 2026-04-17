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
import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsObject, IsEnum, ValidateNested, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
let MoradaDto = (() => {
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
    let _elevador_decorators;
    let _elevador_initializers = [];
    let _elevador_extraInitializers = [];
    let _pais_decorators;
    let _pais_initializers = [];
    let _pais_extraInitializers = [];
    return class MoradaDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _rua_decorators = [IsString(), IsNotEmpty()];
            _numero_decorators = [IsString(), IsNotEmpty()];
            _andar_decorators = [IsString(), IsOptional()];
            _codigoPostal_decorators = [IsString(), IsNotEmpty()];
            _localidade_decorators = [IsString(), IsNotEmpty()];
            _elevador_decorators = [IsBoolean(), IsOptional()];
            _pais_decorators = [IsString(), IsOptional()];
            __esDecorate(null, null, _rua_decorators, { kind: "field", name: "rua", static: false, private: false, access: { has: obj => "rua" in obj, get: obj => obj.rua, set: (obj, value) => { obj.rua = value; } }, metadata: _metadata }, _rua_initializers, _rua_extraInitializers);
            __esDecorate(null, null, _numero_decorators, { kind: "field", name: "numero", static: false, private: false, access: { has: obj => "numero" in obj, get: obj => obj.numero, set: (obj, value) => { obj.numero = value; } }, metadata: _metadata }, _numero_initializers, _numero_extraInitializers);
            __esDecorate(null, null, _andar_decorators, { kind: "field", name: "andar", static: false, private: false, access: { has: obj => "andar" in obj, get: obj => obj.andar, set: (obj, value) => { obj.andar = value; } }, metadata: _metadata }, _andar_initializers, _andar_extraInitializers);
            __esDecorate(null, null, _codigoPostal_decorators, { kind: "field", name: "codigoPostal", static: false, private: false, access: { has: obj => "codigoPostal" in obj, get: obj => obj.codigoPostal, set: (obj, value) => { obj.codigoPostal = value; } }, metadata: _metadata }, _codigoPostal_initializers, _codigoPostal_extraInitializers);
            __esDecorate(null, null, _localidade_decorators, { kind: "field", name: "localidade", static: false, private: false, access: { has: obj => "localidade" in obj, get: obj => obj.localidade, set: (obj, value) => { obj.localidade = value; } }, metadata: _metadata }, _localidade_initializers, _localidade_extraInitializers);
            __esDecorate(null, null, _elevador_decorators, { kind: "field", name: "elevador", static: false, private: false, access: { has: obj => "elevador" in obj, get: obj => obj.elevador, set: (obj, value) => { obj.elevador = value; } }, metadata: _metadata }, _elevador_initializers, _elevador_extraInitializers);
            __esDecorate(null, null, _pais_decorators, { kind: "field", name: "pais", static: false, private: false, access: { has: obj => "pais" in obj, get: obj => obj.pais, set: (obj, value) => { obj.pais = value; } }, metadata: _metadata }, _pais_initializers, _pais_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        rua = __runInitializers(this, _rua_initializers, void 0);
        numero = (__runInitializers(this, _rua_extraInitializers), __runInitializers(this, _numero_initializers, void 0));
        andar = (__runInitializers(this, _numero_extraInitializers), __runInitializers(this, _andar_initializers, void 0));
        codigoPostal = (__runInitializers(this, _andar_extraInitializers), __runInitializers(this, _codigoPostal_initializers, void 0));
        localidade = (__runInitializers(this, _codigoPostal_extraInitializers), __runInitializers(this, _localidade_initializers, void 0));
        elevador = (__runInitializers(this, _localidade_extraInitializers), __runInitializers(this, _elevador_initializers, void 0));
        pais = (__runInitializers(this, _elevador_extraInitializers), __runInitializers(this, _pais_initializers, void 0));
        constructor() {
            __runInitializers(this, _pais_extraInitializers);
        }
    };
})();
export { MoradaDto };
let MateriaisDto = (() => {
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
    return class MateriaisDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _protecaoFilme_decorators = [IsNumber(), IsOptional()];
            _protecaoCartao_decorators = [IsNumber(), IsOptional()];
            _caixas_decorators = [IsNumber(), IsOptional()];
            _fitaCola_decorators = [IsNumber(), IsOptional()];
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
export { MateriaisDto };
let CreateMudancaDto = (() => {
    let _tenantId_decorators;
    let _tenantId_initializers = [];
    let _tenantId_extraInitializers = [];
    let _clienteNome_decorators;
    let _clienteNome_initializers = [];
    let _clienteNome_extraInitializers = [];
    let _clienteEmail_decorators;
    let _clienteEmail_initializers = [];
    let _clienteEmail_extraInitializers = [];
    let _clienteTelefone_decorators;
    let _clienteTelefone_initializers = [];
    let _clienteTelefone_extraInitializers = [];
    let _moradaRecolha_decorators;
    let _moradaRecolha_initializers = [];
    let _moradaRecolha_extraInitializers = [];
    let _moradaEntrega_decorators;
    let _moradaEntrega_initializers = [];
    let _moradaEntrega_extraInitializers = [];
    let _dataPretendida_decorators;
    let _dataPretendida_initializers = [];
    let _dataPretendida_extraInitializers = [];
    let _horaPretendida_decorators;
    let _horaPretendida_initializers = [];
    let _horaPretendida_extraInitializers = [];
    let _tipoServico_decorators;
    let _tipoServico_initializers = [];
    let _tipoServico_extraInitializers = [];
    let _veiculoId_decorators;
    let _veiculoId_initializers = [];
    let _veiculoId_extraInitializers = [];
    let _equipa_decorators;
    let _equipa_initializers = [];
    let _equipa_extraInitializers = [];
    let _materiais_decorators;
    let _materiais_initializers = [];
    let _materiais_extraInitializers = [];
    let _observacoes_decorators;
    let _observacoes_initializers = [];
    let _observacoes_extraInitializers = [];
    let _eInternacional_decorators;
    let _eInternacional_initializers = [];
    let _eInternacional_extraInitializers = [];
    let _documentacao_decorators;
    let _documentacao_initializers = [];
    let _documentacao_extraInitializers = [];
    return class CreateMudancaDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _tenantId_decorators = [ApiProperty(), IsString(), IsOptional()];
            _clienteNome_decorators = [ApiProperty(), IsString(), IsNotEmpty()];
            _clienteEmail_decorators = [ApiProperty(), IsString(), IsNotEmpty()];
            _clienteTelefone_decorators = [ApiProperty(), IsString(), IsNotEmpty()];
            _moradaRecolha_decorators = [ApiProperty(), IsObject(), ValidateNested(), Type(() => MoradaDto)];
            _moradaEntrega_decorators = [ApiProperty(), IsObject(), ValidateNested(), Type(() => MoradaDto)];
            _dataPretendida_decorators = [ApiProperty(), IsString(), IsNotEmpty()];
            _horaPretendida_decorators = [ApiProperty({ required: false }), IsString(), IsOptional()];
            _tipoServico_decorators = [ApiProperty(), IsEnum(['normal', 'urgente']), IsNotEmpty()];
            _veiculoId_decorators = [ApiProperty(), IsString(), IsOptional()];
            _equipa_decorators = [ApiProperty(), IsEnum(['motorista', 'motorista_1_ajudante', 'motorista_2_ajudantes']), IsNotEmpty()];
            _materiais_decorators = [ApiProperty({ required: false }), IsObject(), ValidateNested(), Type(() => MateriaisDto), IsOptional()];
            _observacoes_decorators = [ApiProperty({ required: false }), IsString(), IsOptional()];
            _eInternacional_decorators = [ApiProperty({ default: false }), IsBoolean(), IsOptional()];
            _documentacao_decorators = [ApiProperty({ required: false }), IsString(), IsOptional()];
            __esDecorate(null, null, _tenantId_decorators, { kind: "field", name: "tenantId", static: false, private: false, access: { has: obj => "tenantId" in obj, get: obj => obj.tenantId, set: (obj, value) => { obj.tenantId = value; } }, metadata: _metadata }, _tenantId_initializers, _tenantId_extraInitializers);
            __esDecorate(null, null, _clienteNome_decorators, { kind: "field", name: "clienteNome", static: false, private: false, access: { has: obj => "clienteNome" in obj, get: obj => obj.clienteNome, set: (obj, value) => { obj.clienteNome = value; } }, metadata: _metadata }, _clienteNome_initializers, _clienteNome_extraInitializers);
            __esDecorate(null, null, _clienteEmail_decorators, { kind: "field", name: "clienteEmail", static: false, private: false, access: { has: obj => "clienteEmail" in obj, get: obj => obj.clienteEmail, set: (obj, value) => { obj.clienteEmail = value; } }, metadata: _metadata }, _clienteEmail_initializers, _clienteEmail_extraInitializers);
            __esDecorate(null, null, _clienteTelefone_decorators, { kind: "field", name: "clienteTelefone", static: false, private: false, access: { has: obj => "clienteTelefone" in obj, get: obj => obj.clienteTelefone, set: (obj, value) => { obj.clienteTelefone = value; } }, metadata: _metadata }, _clienteTelefone_initializers, _clienteTelefone_extraInitializers);
            __esDecorate(null, null, _moradaRecolha_decorators, { kind: "field", name: "moradaRecolha", static: false, private: false, access: { has: obj => "moradaRecolha" in obj, get: obj => obj.moradaRecolha, set: (obj, value) => { obj.moradaRecolha = value; } }, metadata: _metadata }, _moradaRecolha_initializers, _moradaRecolha_extraInitializers);
            __esDecorate(null, null, _moradaEntrega_decorators, { kind: "field", name: "moradaEntrega", static: false, private: false, access: { has: obj => "moradaEntrega" in obj, get: obj => obj.moradaEntrega, set: (obj, value) => { obj.moradaEntrega = value; } }, metadata: _metadata }, _moradaEntrega_initializers, _moradaEntrega_extraInitializers);
            __esDecorate(null, null, _dataPretendida_decorators, { kind: "field", name: "dataPretendida", static: false, private: false, access: { has: obj => "dataPretendida" in obj, get: obj => obj.dataPretendida, set: (obj, value) => { obj.dataPretendida = value; } }, metadata: _metadata }, _dataPretendida_initializers, _dataPretendida_extraInitializers);
            __esDecorate(null, null, _horaPretendida_decorators, { kind: "field", name: "horaPretendida", static: false, private: false, access: { has: obj => "horaPretendida" in obj, get: obj => obj.horaPretendida, set: (obj, value) => { obj.horaPretendida = value; } }, metadata: _metadata }, _horaPretendida_initializers, _horaPretendida_extraInitializers);
            __esDecorate(null, null, _tipoServico_decorators, { kind: "field", name: "tipoServico", static: false, private: false, access: { has: obj => "tipoServico" in obj, get: obj => obj.tipoServico, set: (obj, value) => { obj.tipoServico = value; } }, metadata: _metadata }, _tipoServico_initializers, _tipoServico_extraInitializers);
            __esDecorate(null, null, _veiculoId_decorators, { kind: "field", name: "veiculoId", static: false, private: false, access: { has: obj => "veiculoId" in obj, get: obj => obj.veiculoId, set: (obj, value) => { obj.veiculoId = value; } }, metadata: _metadata }, _veiculoId_initializers, _veiculoId_extraInitializers);
            __esDecorate(null, null, _equipa_decorators, { kind: "field", name: "equipa", static: false, private: false, access: { has: obj => "equipa" in obj, get: obj => obj.equipa, set: (obj, value) => { obj.equipa = value; } }, metadata: _metadata }, _equipa_initializers, _equipa_extraInitializers);
            __esDecorate(null, null, _materiais_decorators, { kind: "field", name: "materiais", static: false, private: false, access: { has: obj => "materiais" in obj, get: obj => obj.materiais, set: (obj, value) => { obj.materiais = value; } }, metadata: _metadata }, _materiais_initializers, _materiais_extraInitializers);
            __esDecorate(null, null, _observacoes_decorators, { kind: "field", name: "observacoes", static: false, private: false, access: { has: obj => "observacoes" in obj, get: obj => obj.observacoes, set: (obj, value) => { obj.observacoes = value; } }, metadata: _metadata }, _observacoes_initializers, _observacoes_extraInitializers);
            __esDecorate(null, null, _eInternacional_decorators, { kind: "field", name: "eInternacional", static: false, private: false, access: { has: obj => "eInternacional" in obj, get: obj => obj.eInternacional, set: (obj, value) => { obj.eInternacional = value; } }, metadata: _metadata }, _eInternacional_initializers, _eInternacional_extraInitializers);
            __esDecorate(null, null, _documentacao_decorators, { kind: "field", name: "documentacao", static: false, private: false, access: { has: obj => "documentacao" in obj, get: obj => obj.documentacao, set: (obj, value) => { obj.documentacao = value; } }, metadata: _metadata }, _documentacao_initializers, _documentacao_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        tenantId = __runInitializers(this, _tenantId_initializers, void 0);
        clienteNome = (__runInitializers(this, _tenantId_extraInitializers), __runInitializers(this, _clienteNome_initializers, void 0));
        clienteEmail = (__runInitializers(this, _clienteNome_extraInitializers), __runInitializers(this, _clienteEmail_initializers, void 0));
        clienteTelefone = (__runInitializers(this, _clienteEmail_extraInitializers), __runInitializers(this, _clienteTelefone_initializers, void 0));
        moradaRecolha = (__runInitializers(this, _clienteTelefone_extraInitializers), __runInitializers(this, _moradaRecolha_initializers, void 0));
        moradaEntrega = (__runInitializers(this, _moradaRecolha_extraInitializers), __runInitializers(this, _moradaEntrega_initializers, void 0));
        dataPretendida = (__runInitializers(this, _moradaEntrega_extraInitializers), __runInitializers(this, _dataPretendida_initializers, void 0));
        horaPretendida = (__runInitializers(this, _dataPretendida_extraInitializers), __runInitializers(this, _horaPretendida_initializers, void 0));
        tipoServico = (__runInitializers(this, _horaPretendida_extraInitializers), __runInitializers(this, _tipoServico_initializers, void 0));
        veiculoId = (__runInitializers(this, _tipoServico_extraInitializers), __runInitializers(this, _veiculoId_initializers, void 0));
        equipa = (__runInitializers(this, _veiculoId_extraInitializers), __runInitializers(this, _equipa_initializers, void 0));
        materiais = (__runInitializers(this, _equipa_extraInitializers), __runInitializers(this, _materiais_initializers, void 0));
        observacoes = (__runInitializers(this, _materiais_extraInitializers), __runInitializers(this, _observacoes_initializers, void 0));
        eInternacional = (__runInitializers(this, _observacoes_extraInitializers), __runInitializers(this, _eInternacional_initializers, void 0));
        documentacao = (__runInitializers(this, _eInternacional_extraInitializers), __runInitializers(this, _documentacao_initializers, void 0));
        constructor() {
            __runInitializers(this, _documentacao_extraInitializers);
        }
    };
})();
export { CreateMudancaDto };
