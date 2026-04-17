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
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
let ClienteService = (() => {
    let _classDecorators = [Injectable()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var ClienteService = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            ClienteService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        prisma;
        constructor(prisma) {
            this.prisma = prisma;
        }
        async create(tenantId, createClienteDto) {
            // Verificar se email já existe
            const existing = await this.prisma.cliente.findFirst({
                where: {
                    tenantId,
                    email: createClienteDto.email,
                },
            });
            if (existing) {
                throw new ConflictException('Cliente com este email já registado');
            }
            return this.prisma.cliente.create({
                data: {
                    tenantId,
                    ...createClienteDto,
                    moradas: createClienteDto.moradas,
                },
            });
        }
        async findAll(tenantId, filters) {
            const where = { tenantId };
            if (filters?.search) {
                where.OR = [
                    { nome: { contains: filters.search, mode: 'insensitive' } },
                    { apelido: { contains: filters.search, mode: 'insensitive' } },
                    { email: { contains: filters.search, mode: 'insensitive' } },
                ];
            }
            if (filters?.eRecorrente !== undefined) {
                where.eRecorrente = filters.eRecorrente;
            }
            return this.prisma.cliente.findMany({
                where,
                orderBy: { createdAt: 'desc' },
            });
        }
        async findOne(tenantId, id) {
            const cliente = await this.prisma.cliente.findFirst({
                where: { id, tenantId },
                include: {
                    mudancas: {
                        orderBy: { createdAt: 'desc' },
                        take: 10,
                    },
                },
            });
            if (!cliente) {
                throw new NotFoundException('Cliente não encontrado');
            }
            return cliente;
        }
        async findByEmail(tenantId, email) {
            return this.prisma.cliente.findFirst({
                where: { tenantId, email },
                include: {
                    mudancas: {
                        orderBy: { createdAt: 'desc' },
                    },
                },
            });
        }
        async update(tenantId, id, updateClienteDto) {
            const cliente = await this.findOne(tenantId, id);
            // Verificar email duplicado se estiver a ser alterado
            if (updateClienteDto.email) {
                const existing = await this.prisma.cliente.findFirst({
                    where: {
                        tenantId,
                        email: updateClienteDto.email,
                        id: { not: id },
                    },
                });
                if (existing) {
                    throw new ConflictException('Email já registado');
                }
            }
            return this.prisma.cliente.update({
                where: { id },
                data: updateClienteDto,
            });
        }
        async merge(tenantId, sourceId, targetId) {
            // Verificar se ambos existem
            await this.findOne(tenantId, sourceId);
            await this.findOne(tenantId, targetId);
            // Transferir mudanças do source para target
            await this.prisma.mudanca.updateMany({
                where: { clienteEmail: { not: null } },
                data: { clienteId: targetId },
            });
            // Remover source
            return this.prisma.cliente.delete({
                where: { id: sourceId },
            });
        }
        async remove(tenantId, id) {
            await this.findOne(tenantId, id);
            return this.prisma.cliente.delete({
                where: { id },
            });
        }
        async incrementMudancasCount(tenantId, email) {
            const cliente = await this.prisma.cliente.findFirst({
                where: { tenantId, email },
            });
            if (!cliente) {
                // Criar cliente automaticamente
                return this.prisma.cliente.create({
                    data: {
                        tenantId,
                        email,
                        nome: 'Cliente',
                        apelido: 'Novo',
                        telefone: '',
                        numeroMudancas: 1,
                        eRecorrente: false,
                    },
                });
            }
            return this.prisma.cliente.update({
                where: { id: cliente.id },
                data: {
                    numeroMudancas: { increment: 1 },
                    eRecorrente: cliente.numeroMudancas > 0,
                    ultimaMudanca: new Date(),
                },
            });
        }
    };
    return ClienteService = _classThis;
})();
export { ClienteService };
