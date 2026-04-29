import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
const prisma = new PrismaClient();
async function main() {
    console.log('🌱 Seeding database...');
    // 1. Create Tenant
    const tenant = await prisma.tenant.upsert({
        where: { subdomain: 'demo' },
        update: {},
        create: {
            subdomain: 'demo',
            estado: 'ativa',
            configMarca: {
                nome: 'Mudanças Demo',
                slogan: 'A sua mudança, sem stress',
                logoUrl: null,
                faviconUrl: null,
                cores: {
                    primaria: '#1B4D3E',
                    primariaLight: '#2A7A64',
                    secundaria: '#C4572A',
                    acento: '#D4A853',
                    fundo: '#F5EDE0',
                    fundoEscuro: '#0A0F1E',
                    texto: '#2C1810',
                    textoClaro: '#F0E6D6',
                },
                fontes: {
                    display: 'Cormorant Garamond',
                    body: 'Inter',
                },
                heroImageUrl: null,
                galeriaUrls: [],
                avaliacoes: {
                    googleRating: 4.8,
                    googleReviews: 156,
                    depoimentos: [
                        { nome: 'Ana Rodrigues', texto: 'Excelente serviço! Profissionais impecáveis do início ao fim.', estrelas: 5 },
                        { nome: 'Carlos Mendes', texto: 'Ponte e cuidadosos com os móveis. Recomendo.', estrelas: 4 },
                        { nome: 'Maria Sousa', texto: 'Tudo chegou em perfeitas condições. Obrigada!', estrelas: 5 },
                    ],
                },
                contacto: {
                    telefone: '+351 912 345 678',
                    email: 'info@mudancas-demo.pt',
                    whatsapp: '+351912345678',
                    morada: 'Lisboa, Portugal',
                    redesSociais: {
                        facebook: 'https://facebook.com/mudancasdemo',
                        instagram: 'https://instagram.com/mudancasdemo',
                    },
                },
            },
            configPreco: { horaNormal: 35, horaUrgente: 55 },
            configAgenda: { inicio: '08:00', fim: '20:00', intervalo: 60 },
        },
    });
    console.log(`  ✓ Tenant: ${tenant.subdomain} (${tenant.id})`);
    // 2. Create Admin User
    const adminPasswordHash = await bcrypt.hash('admin123', 10);
    const adminUser = await prisma.user.upsert({
        where: { tenantId_email: { tenantId: tenant.id, email: 'admin@demo.pt' } },
        update: {},
        create: {
            tenantId: tenant.id,
            nome: 'Administrador',
            email: 'admin@demo.pt',
            passwordHash: adminPasswordHash,
            perfil: 'admin',
            eAtivo: true,
        },
    });
    // Update tenant adminUserId
    await prisma.tenant.update({
        where: { id: tenant.id },
        data: { adminUserId: adminUser.id },
    });
    console.log(`  ✓ Admin: admin@demo.pt / admin123`);
    // 3. Create Motorista User
    const motoristaPasswordHash = await bcrypt.hash('motorista123', 10);
    const motoristaUser = await prisma.user.upsert({
        where: { tenantId_email: { tenantId: tenant.id, email: 'motorista@demo.pt' } },
        update: {},
        create: {
            tenantId: tenant.id,
            nome: 'João Silva',
            email: 'motorista@demo.pt',
            passwordHash: motoristaPasswordHash,
            perfil: 'motorista',
            eAtivo: true,
        },
    });
    console.log(`  ✓ Motorista User: motorista@demo.pt / motorista123`);
    // 4. Create Veiculo
    const veiculo = await prisma.veiculo.upsert({
        where: { id: 'veiculo-demo-1' },
        update: {},
        create: {
            id: 'veiculo-demo-1',
            tenantId: tenant.id,
            nome: 'Carrinha Grande',
            marca: 'Mercedes',
            modelo: 'Sprinter',
            matricula: '12-AB-34',
            metrosCubicos: 15,
            precoHora: 35,
            estado: 'disponivel',
        },
    });
    console.log(`  ✓ Veículo: ${veiculo.nome}`);
    // 5. Create Motorista (linked to User + Veiculo)
    const motorista = await prisma.motorista.upsert({
        where: { id: 'motorista-demo-1' },
        update: {},
        create: {
            id: 'motorista-demo-1',
            tenantId: tenant.id,
            userId: motoristaUser.id,
            nome: 'João Silva',
            email: 'motorista@demo.pt',
            telefone: '912345678',
            cartaConducao: 'B',
            validadeCarta: '2028-01-01',
            veiculoId: veiculo.id,
            estado: 'disponivel',
        },
    });
    console.log(`  ✓ Motorista: ${motorista.nome} (userId: ${motoristaUser.id})`);
    // 6. Create Cliente
    const cliente = await prisma.cliente.upsert({
        where: { id: 'cliente-demo-1' },
        update: {},
        create: {
            id: 'cliente-demo-1',
            tenantId: tenant.id,
            nome: 'Maria',
            apelido: 'Santos',
            email: 'maria@email.pt',
            telefone: '923456789',
            moradas: {
                recolha: { rua: 'Rua das Flores', numero: '10', andar: '2o', codigoPostal: '1000-001', localidade: 'Lisboa', elevador: true },
                entrega: { rua: 'Avenida da Liberdade', numero: '50', andar: '5o', codigoPostal: '1250-001', localidade: 'Lisboa', elevador: true },
            },
        },
    });
    console.log(`  ✓ Cliente: ${cliente.nome} ${cliente.apelido}`);
    // 7. Create Mudanças (different states for testing)
    const today = new Date();
    const mudancas = [
        {
            id: 'mudanca-demo-aprovada',
            estado: 'aprovada',
            tipoServico: 'normal',
            clienteNome: 'Maria Santos',
            clienteEmail: 'maria@email.pt',
            clienteTelefone: '923456789',
            moradaRecolha: { rua: 'Rua das Flores', numero: '10', andar: '2o', codigoPostal: '1000-001', localidade: 'Lisboa', elevador: true },
            moradaEntrega: { rua: 'Avenida da Liberdade', numero: '50', andar: '5o', codigoPostal: '1250-001', localidade: 'Lisboa', elevador: true },
            dataPretendida: today,
            horaPretendida: '09:00',
            equipa: 'motorista_1_ajudante',
            materiais: { protecaoFilme: 2, protecaoCartao: 3, caixas: 10, fitaCola: 2 },
            observacoes: 'Cuidado com o piano na sala.',
            aprovadoPor: adminUser.id,
            aprovadoEm: new Date(),
            tempoEstimadoHoras: 4,
            observacoesAdmin: 'Cliente recorrente, dar prioridade.',
            veiculoId: veiculo.id,
            motoristaId: motorista.id,
            clienteId: cliente.id,
        },
        {
            id: 'mudanca-demo-caminho',
            estado: 'a_caminho',
            tipoServico: 'normal',
            clienteNome: 'Pedro Oliveira',
            clienteEmail: 'pedro@email.pt',
            clienteTelefone: '934567890',
            moradaRecolha: { rua: 'Rua do Sol', numero: '25', codigoPostal: '2000-001', localidade: 'Santarem', elevador: false },
            moradaEntrega: { rua: 'Rua da Lua', numero: '30', andar: '1o', codigoPostal: '1000-002', localidade: 'Lisboa', elevador: true },
            dataPretendida: today,
            horaPretendida: '14:00',
            equipa: 'motorista',
            materiais: { protecaoFilme: 1, caixas: 5, fitaCola: 1 },
            observacoes: 'Sem elevador na recolha.',
            aprovadoPor: adminUser.id,
            aprovadoEm: new Date(),
            tempoEstimadoHoras: 3,
            veiculoId: veiculo.id,
            motoristaId: motorista.id,
        },
        {
            id: 'mudanca-demo-servico',
            estado: 'em_servico',
            tipoServico: 'urgente',
            clienteNome: 'Ana Costa',
            clienteEmail: 'ana@email.pt',
            clienteTelefone: '945678901',
            moradaRecolha: { rua: 'Travessa do Forno', numero: '5', codigoPostal: '3000-001', localidade: 'Coimbra', elevador: false },
            moradaEntrega: { rua: 'Rua Principal', numero: '100', andar: '3o', codigoPostal: '4000-001', localidade: 'Porto', elevador: true },
            dataPretendida: today,
            horaPretendida: '10:00',
            equipa: 'motorista_2_ajudantes',
            materiais: { protecaoFilme: 4, protecaoCartao: 5, caixas: 20, fitaCola: 4 },
            observacoes: 'Mudanca urgente. Edifício antigo, escadas estreitas.',
            aprovadoPor: adminUser.id,
            aprovadoEm: new Date(),
            tempoEstimadoHoras: 6,
            observacoesAdmin: 'Urgente - prioridade maxima.',
            veiculoId: veiculo.id,
            motoristaId: motorista.id,
        },
        {
            id: 'mudanca-demo-concluida',
            estado: 'concluida',
            tipoServico: 'normal',
            clienteNome: 'Rui Mendes',
            clienteEmail: 'rui@email.pt',
            clienteTelefone: '956789012',
            moradaRecolha: { rua: 'Rua do Comercio', numero: '80', codigoPostal: '1100-001', localidade: 'Lisboa', elevador: true },
            moradaEntrega: { rua: 'Estrada Nacional 1', numero: '200', codigoPostal: '2600-001', localidade: 'Vila Franca de Xira', elevador: false },
            dataPretendida: today,
            horaPretendida: '08:00',
            equipa: 'motorista_1_ajudante',
            materiais: { caixas: 8, fitaCola: 2 },
            aprovadoPor: adminUser.id,
            aprovadoEm: new Date(),
            tempoEstimadoHoras: 3,
            veiculoId: veiculo.id,
            motoristaId: motorista.id,
            conclusao: {
                horasRegistadas: 3,
                horasCobradas: 3.5,
                combustivel: { valor: 25, litros: 20 },
                alimentacao: { teve: true, valor: 12 },
                observacoes: 'Tudo correu bem.',
            },
            concluidoPor: motoristaUser.id,
            concluidoEm: new Date(),
        },
        {
            id: 'mudanca-demo-pendente',
            estado: 'pendente',
            tipoServico: 'normal',
            clienteNome: 'Sofia Ferreira',
            clienteEmail: 'sofia@email.pt',
            clienteTelefone: '967890123',
            moradaRecolha: { rua: 'Calcada do Carmo', numero: '15', codigoPostal: '1200-001', localidade: 'Lisboa' },
            moradaEntrega: { rua: 'Rua da Esperanca', numero: '40', andar: '4o', codigoPostal: '1350-001', localidade: 'Lisboa', elevador: false },
            dataPretendida: today,
            horaPretendida: '16:00',
            equipa: 'motorista',
            materiais: { caixas: 3 },
        },
    ];
    for (const m of mudancas) {
        try {
            // Use raw SQL to avoid Prisma Client 0x00 byte bug with implicit many-to-many (ajudantesIds)
            const recolha = JSON.stringify(m.moradaRecolha);
            const entrega = JSON.stringify(m.moradaEntrega);
            const mat = JSON.stringify(m.materiais);
            const concl = m.conclusao ? JSON.stringify(m.conclusao) : null;
            await prisma.$executeRaw `
        INSERT INTO "Mudanca" (
          id, "tenantId", estado, "tipoServico", "clienteNome", "clienteEmail", "clienteTelefone",
          "moradaRecolha", "moradaEntrega", "dataPretendida", "horaPretendida", equipa, materiais,
          "eInternacional", "createdAt", "updatedAt",
          observacoes, "aprovadoPor", "aprovadoEm", "tempoEstimadoHoras", "observacoesAdmin",
          "veiculoId", "motoristaId", "clienteId", conclusao, "concluidoPor", "concluidoEm"
        ) VALUES (
          ${m.id}, ${tenant.id}, ${m.estado}, ${m.tipoServico}, ${m.clienteNome}, ${m.clienteEmail}, ${m.clienteTelefone},
          ${recolha}::jsonb, ${entrega}::jsonb, ${m.dataPretendida}, ${m.horaPretendida || null}, ${m.equipa}, ${mat}::jsonb,
          false, NOW(), NOW(),
          ${m.observacoes || null}, ${m.aprovadoPor || null}, ${m.aprovadoEm || null}, ${m.tempoEstimadoHoras || null}, ${m.observacoesAdmin || null},
          ${m.veiculoId || null}, ${m.motoristaId || null}, ${m.clienteId || null}, ${concl}::jsonb, ${m.concluidoPor || null}, ${m.concluidoEm || null}
        )
        ON CONFLICT (id) DO NOTHING
      `;
            console.log(`  ✓ Mudanca: ${m.id} (${m.estado})`);
        }
        catch (err) {
            console.error(`  ✗ Mudanca ${m.id} failed: ${err.message}`);
        }
    }
    console.log(`  ✓ ${mudancas.length} mudanças criadas (aprovada, a_caminho, em_servico, concluida, pendente)`);
    // 8. Create Super-Admin (platform tenant + user)
    const platformTenant = await prisma.tenant.upsert({
        where: { subdomain: 'superadmin' },
        update: {},
        create: {
            subdomain: 'superadmin',
            estado: 'ativa',
            configMarca: { nome: 'Plataforma Mudanças & Logística' },
        },
    });
    const superAdminPasswordHash = await bcrypt.hash('super123', 10);
    await prisma.user.upsert({
        where: { tenantId_email: { tenantId: platformTenant.id, email: 'super@mudancas-logistica.pt' } },
        update: {},
        create: {
            tenantId: platformTenant.id,
            nome: 'Super Administrador',
            email: 'super@mudancas-logistica.pt',
            passwordHash: superAdminPasswordHash,
            perfil: 'super_admin',
            eAtivo: true,
        },
    });
    console.log(`  ✓ Super-Admin: super@mudancas-logistica.pt / super123`);
    console.log('\n✅ Seed complete!');
    console.log('\n📋 Credenciais de teste:');
    console.log('  Admin:       admin@demo.pt / admin123');
    console.log('  Motorista:   motorista@demo.pt / motorista123');
    console.log('  Super-Admin: super@mudancas-logistica.pt / super123');
    console.log(`  Tenant ID:   ${tenant.id}`);
}
main()
    .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
