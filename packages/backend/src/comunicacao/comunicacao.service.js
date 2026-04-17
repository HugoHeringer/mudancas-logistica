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
let ComunicacaoService = (() => {
    let _classDecorators = [Injectable()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var ComunicacaoService = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            ComunicacaoService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        prisma;
        constructor(prisma) {
            this.prisma = prisma;
        }
        async getTemplates(tenantId) {
            return this.prisma.emailTemplate.findMany({
                where: { tenantId },
            });
        }
        async getTemplate(tenantId, nome) {
            const template = await this.prisma.emailTemplate.findFirst({
                where: { tenantId, nome },
            });
            if (!template) {
                throw new NotFoundException('Template não encontrado');
            }
            return template;
        }
        async createTemplate(tenantId, createTemplateDto) {
            return this.prisma.emailTemplate.create({
                data: {
                    tenantId,
                    ...createTemplateDto,
                },
            });
        }
        async updateTemplate(tenantId, nome, updateTemplateDto) {
            const template = await this.getTemplate(tenantId, nome);
            return this.prisma.emailTemplate.update({
                where: { id: template.id },
                data: updateTemplateDto,
            });
        }
        async deleteTemplate(tenantId, id) {
            const template = await this.prisma.emailTemplate.findFirst({
                where: { id, tenantId },
            });
            if (!template) {
                throw new NotFoundException('Template não encontrado');
            }
            return this.prisma.emailTemplate.delete({
                where: { id },
            });
        }
        async renderTemplate(tenantId, nome, variaveis) {
            const template = await this.getTemplate(tenantId, nome);
            let assunto = template.assunto;
            let corpo = template.corpo;
            // Substituir variáveis {{variavel}}
            Object.entries(variaveis).forEach(([key, value]) => {
                const regex = new RegExp(`{{${key}}}`, 'g');
                assunto = assunto.replace(regex, String(value));
                corpo = corpo.replace(regex, String(value));
            });
            return {
                assunto,
                corpo,
                eAtivo: template.eAtivo,
            };
        }
        async initializeDefaultTemplates(tenantId) {
            const defaultTemplates = [
                {
                    nome: 'confirmacao_rececao',
                    assunto: 'Solicitação de mudança recebida - {{nomeCliente}}',
                    corpo: `Olá {{nomeCliente}},

Recebemos a sua solicitação de mudança para {{dataPretendida}}.

Em breve entraremos em contacto para confirmar os detalhes.

Obrigado,
{{nomeEmpresa}}`,
                    variaveis: ['nomeCliente', 'dataPretendida', 'nomeEmpresa'],
                    eAtivo: true,
                },
                {
                    nome: 'confirmacao_aprovacao',
                    assunto: 'Mudança confirmada - {{dataPretendida}}',
                    corpo: `Olá {{nomeCliente}},

A sua mudança foi confirmada para {{dataPretendida}} às {{horaPretendida}}.

Motorista: {{motoristaNome}}
Equipa: {{equipa}}

Obrigado,
{{nomeEmpresa}}`,
                    variaveis: ['nomeCliente', 'dataPretendida', 'horaPretendida', 'motoristaNome', 'equipa', 'nomeEmpresa'],
                    eAtivo: true,
                },
                {
                    nome: 'inicio_deslocamento',
                    assunto: 'O motorista está a caminho',
                    corpo: `Olá {{nomeCliente}},

O nosso motorista {{motoristaNome}} está a caminho para a sua mudança.

Previsão de chegada: {{previsaoChegada}}

Obrigado,
{{nomeEmpresa}}`,
                    variaveis: ['nomeCliente', 'motoristaNome', 'previsaoChegada', 'nomeEmpresa'],
                    eAtivo: true,
                },
                {
                    nome: 'mudanca_concluida',
                    assunto: 'Mudança concluída',
                    corpo: `Olá {{nomeCliente}},

A sua mudança foi concluída com sucesso.

Obrigado por escolher a {{nomeEmpresa}}!`,
                    variaveis: ['nomeCliente', 'nomeEmpresa'],
                    eAtivo: true,
                },
                {
                    nome: 'recusa_mudanca',
                    assunto: 'Solicitação de mudança - {{nomeCliente}}',
                    corpo: `Olá {{nomeCliente}},

Infelizmente não podemos aceitar a sua solicitação de mudança.

Motivo: {{motivo}}

Obrigado,
{{nomeEmpresa}}`,
                    variaveis: ['nomeCliente', 'motivo', 'nomeEmpresa'],
                    eAtivo: true,
                },
            ];
            const created = [];
            for (const template of defaultTemplates) {
                const existing = await this.prisma.emailTemplate.findFirst({
                    where: { tenantId, nome: template.nome },
                });
                if (!existing) {
                    created.push(await this.prisma.emailTemplate.create({
                        data: { ...template, tenantId },
                    }));
                }
            }
            return created;
        }
    };
    return ComunicacaoService = _classThis;
})();
export { ComunicacaoService };
