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
import { Injectable, NotFoundException } from '@nestjs/common';
let PublicService = (() => {
    let _classDecorators = [Injectable()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var PublicService = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            PublicService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        prisma;
        constructor(prisma) {
            this.prisma = prisma;
        }
        async criarMudanca(tenantId, dto) {
            // Verify tenant exists and is active
            const tenant = await this.prisma.tenant.findUnique({
                where: { id: tenantId },
            });
            if (!tenant || tenant.estado !== 'ativa') {
                throw new NotFoundException('Empresa não encontrada');
            }
            return this.prisma.mudanca.create({
                data: {
                    tenantId,
                    estado: 'pendente',
                    tipoServico: dto.tipoServico,
                    clienteNome: dto.clienteNome,
                    clienteEmail: dto.clienteEmail,
                    clienteTelefone: dto.clienteTelefone,
                    moradaRecolha: dto.moradaRecolha,
                    moradaEntrega: dto.moradaEntrega,
                    dataPretendida: dto.dataPretendida,
                    horaPretendida: dto.horaPretendida,
                    equipa: dto.equipa,
                    veiculoId: dto.veiculoId,
                    materiais: dto.materiais || {},
                    observacoes: dto.observacoes,
                    eInternacional: dto.eInternacional,
                    documentacao: dto.documentacao,
                },
            });
        }
        async getVeiculos(tenantId) {
            const tenant = await this.prisma.tenant.findUnique({
                where: { id: tenantId },
            });
            if (!tenant || tenant.estado !== 'ativa') {
                throw new NotFoundException('Empresa não encontrada');
            }
            return this.prisma.veiculo.findMany({
                where: { tenantId, estado: 'disponivel' },
                select: {
                    id: true,
                    nome: true,
                    marca: true,
                    modelo: true,
                    matricula: true,
                    metrosCubicos: true,
                    precoHora: true,
                    eParaUrgencias: true,
                },
                orderBy: { metrosCubicos: 'asc' },
            });
        }
        async getDisponibilidade(tenantId, data) {
            const tenant = await this.prisma.tenant.findUnique({
                where: { id: tenantId },
            });
            if (!tenant || tenant.estado !== 'ativa') {
                throw new NotFoundException('Empresa não encontrada');
            }
            // Get mudanças for that date to check availability
            const mudancas = await this.prisma.mudanca.findMany({
                where: {
                    tenantId,
                    dataPretendida: data,
                    estado: { in: ['aprovada', 'a_caminho', 'em_servico'] },
                },
                select: {
                    id: true,
                    horaPretendida: true,
                    motoristaId: true,
                    veiculoId: true,
                },
            });
            const motoristasDisponiveis = await this.prisma.motorista.count({
                where: { tenantId, estado: 'disponivel' },
            });
            return {
                data,
                mudancasAgendadas: mudancas.length,
                motoristasDisponiveis,
                disponivel: motoristasDisponiveis > mudancas.length,
            };
        }
        async getTenantInfo(subdomain) {
            const tenant = await this.prisma.tenant.findUnique({
                where: { subdomain },
                select: {
                    id: true,
                    subdomain: true,
                    configMarca: true,
                },
            });
            if (!tenant || !tenant.configMarca) {
                throw new NotFoundException('Empresa não encontrada');
            }
            return tenant;
        }
    };
    return PublicService = _classThis;
})();
export { PublicService };
