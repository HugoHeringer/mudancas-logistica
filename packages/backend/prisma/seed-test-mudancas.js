const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

const TENANT_ID = '9061f9d5-7e37-482b-a9a3-91251b25f91e';
const VEICULO_ID = '1b15e350-05bf-414b-b6c3-779f8593c8b5';
const MOTORISTA_ID = '0f9d6969-914c-4a36-ad26-81042430714c';
const ADMIN_ID = '59186b99-74ae-4644-997e-08f0392d6534';

async function main() {
  // 1. Create motorista user with known password
  const hash = await bcrypt.hash('Motorista1!', 10);
  let user;
  try {
    user = await prisma.user.create({
      data: {
        tenantId: TENANT_ID,
        nome: 'Carlos Motorista',
        email: 'motorista@demo.pt',
        passwordHash: hash,
        perfil: 'motorista',
        eAtivo: true,
      }
    });
    await prisma.motorista.update({
      where: { id: MOTORISTA_ID },
      data: { userId: user.id }
    });
    console.log('User motorista created:', user.id);
  } catch (e) {
    if (e.code === 'P2002') {
      console.log('User motorista@demo.pt already exists, skipping creation');
    } else {
      throw e;
    }
  }

  // 2. Create mudancas
  const today = new Date();
  const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
  const nextWeek = new Date(today); nextWeek.setDate(today.getDate() + 5);
  const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
  const fmt = d => d.toISOString().split('T')[0];

  // M1: Aprovada HOJE (para iniciar deslocamento)
  const m1 = await prisma.mudanca.create({ data: {
    tenantId: TENANT_ID, estado: 'aprovada', tipoServico: 'normal',
    clienteNome: 'Maria Fernandes', clienteEmail: 'maria.fernandes@email.pt', clienteTelefone: '912345111',
    moradaRecolha: { rua: 'Av. da Liberdade', numero: '45', andar: '3D', localidade: 'Lisboa', codigoPostal: '1250-140' },
    moradaEntrega: { rua: 'Rua das Flores', numero: '12', localidade: 'Cascais', codigoPostal: '2750-320' },
    dataPretendida: fmt(today), horaPretendida: '09:00',
    veiculoId: VEICULO_ID, equipa: 'motorista',
    materiais: { protecaoFilme: 3, protecaoCartao: 5, caixas: 20, fitaCola: 4 },
    observacoes: 'Cuidado com o piano na sala. Tem 3 andares, sem elevador.',
    motoristaId: MOTORISTA_ID, ajudantesIds: [], tempoEstimadoHoras: 6,
    observacoesAdmin: 'Cliente VIP - prioridade',
    aprovadoPor: ADMIN_ID, aprovadoEm: new Date(),
  }});
  console.log('M1 aprovada hoje:', m1.id);

  // M2: A caminho HOJE (para clicar Cheguei)
  const m2 = await prisma.mudanca.create({ data: {
    tenantId: TENANT_ID, estado: 'a_caminho', tipoServico: 'urgente',
    clienteNome: 'Joao Ribeiro', clienteEmail: 'joao.ribeiro@email.pt', clienteTelefone: '934567222',
    moradaRecolha: { rua: 'Rua do Comercio', numero: '88', localidade: 'Porto', codigoPostal: '4050-170' },
    moradaEntrega: { rua: 'Rua da Boavista', numero: '200', andar: '5A', localidade: 'Porto', codigoPostal: '4100-130' },
    dataPretendida: fmt(today), horaPretendida: '14:00',
    veiculoId: VEICULO_ID, equipa: 'motorista_1_ajudante',
    materiais: { protecaoFilme: 2, protecaoCartao: 3, caixas: 15, fitaCola: 2 },
    observacoes: 'Mudanca urgente - precisa terminar ate as 18h',
    motoristaId: MOTORISTA_ID, ajudantesIds: [], tempoEstimadoHoras: 4,
    observacoesAdmin: 'Urgente - cliente pediu expresso',
    aprovadoPor: ADMIN_ID, aprovadoEm: new Date(),
  }});
  console.log('M2 a_caminho hoje:', m2.id);

  // M3: Em servico HOJE (para concluir - ficha conclusao)
  const m3 = await prisma.mudanca.create({ data: {
    tenantId: TENANT_ID, estado: 'em_servico', tipoServico: 'normal',
    clienteNome: 'Ana Sousa', clienteEmail: 'ana.sousa@email.pt', clienteTelefone: '918765333',
    moradaRecolha: { rua: 'Rua 25 de Abril', numero: '15', localidade: 'Coimbra', codigoPostal: '3000-000' },
    moradaEntrega: { rua: 'Av. Emidio Navarro', numero: '30', andar: '2E', localidade: 'Coimbra', codigoPostal: '3000-150' },
    dataPretendida: fmt(today), horaPretendida: '08:00',
    veiculoId: VEICULO_ID, equipa: 'motorista',
    materiais: { protecaoFilme: 1, protecaoCartao: 2, caixas: 10, fitaCola: 1 },
    observacoes: 'Apartamento T2, mobilado. Cuidado com espelhos.',
    motoristaId: MOTORISTA_ID, ajudantesIds: [], tempoEstimadoHoras: 3,
    observacoesAdmin: '',
    aprovadoPor: ADMIN_ID, aprovadoEm: new Date(),
  }});
  console.log('M3 em_servico hoje (para concluir):', m3.id);

  // M4: Concluida ontem (historico)
  const m4 = await prisma.mudanca.create({ data: {
    tenantId: TENANT_ID, estado: 'concluida', tipoServico: 'normal',
    clienteNome: 'Pedro Martins', clienteEmail: 'pedro.martins@email.pt', clienteTelefone: '927654444',
    moradaRecolha: { rua: 'Rua da Paz', numero: '7', localidade: 'Braga', codigoPostal: '4700-000' },
    moradaEntrega: { rua: 'Av. Central', numero: '100', localidade: 'Guimaraes', codigoPostal: '4800-000' },
    dataPretendida: fmt(yesterday), horaPretendida: '10:00',
    veiculoId: VEICULO_ID, equipa: 'motorista_2_ajudantes',
    materiais: { protecaoFilme: 5, protecaoCartao: 8, caixas: 30, fitaCola: 6 },
    observacoes: 'Mudanca completa de casa T4.',
    motoristaId: MOTORISTA_ID, ajudantesIds: [], tempoEstimadoHoras: 8,
    observacoesAdmin: 'Casa grande, precisa equipa completa',
    aprovadoPor: ADMIN_ID, aprovadoEm: new Date(yesterday),
    conclusao: {
      horasRegistadas: 7.5, horasCobradas: 8,
      combustivel: { valor: 45.0, litros: 40 },
      alimentacao: { teve: true, valor: 25.0 },
      materiaisUtilizados: { protecaoFilme: 4, protecaoCartao: 6, caixas: 28, fitaCola: 5 },
      observacoes: 'Mudanca concluida sem problemas. Cliente satisfeito.'
    },
    concluidoPor: MOTORISTA_ID, concluidoEm: new Date(yesterday),
  }});
  console.log('M4 concluida ontem:', m4.id);

  // M5: Aprovada amanha
  const m5 = await prisma.mudanca.create({ data: {
    tenantId: TENANT_ID, estado: 'aprovada', tipoServico: 'normal',
    clienteNome: 'Sofia Lima', clienteEmail: 'sofia.lima@email.pt', clienteTelefone: '936543555',
    moradaRecolha: { rua: 'Rua do Sol', numero: '22', localidade: 'Faro', codigoPostal: '8000-000' },
    moradaEntrega: { rua: 'Rua do Mar', numero: '55', localidade: 'Albufeira', codigoPostal: '8200-000' },
    dataPretendida: fmt(tomorrow), horaPretendida: '10:00',
    veiculoId: VEICULO_ID, equipa: 'motorista',
    materiais: { protecaoFilme: 2, protecaoCartao: 3, caixas: 12, fitaCola: 2 },
    observacoes: 'Mudanca de escritorio.',
    motoristaId: MOTORISTA_ID, ajudantesIds: [], tempoEstimadoHoras: 4,
    aprovadoPor: ADMIN_ID, aprovadoEm: new Date(),
  }});
  console.log('M5 aprovada amanha:', m5.id);

  // M6: Aprovada proxima semana (urgente)
  const m6 = await prisma.mudanca.create({ data: {
    tenantId: TENANT_ID, estado: 'aprovada', tipoServico: 'urgente',
    clienteNome: 'Ricardo Almeida', clienteEmail: 'ricardo.almeida@email.pt', clienteTelefone: '945678666',
    moradaRecolha: { rua: 'Av. da Republica', numero: '300', andar: '8F', localidade: 'Lisboa', codigoPostal: '1050-000' },
    moradaEntrega: { rua: 'Rua Augusta', numero: '15', localidade: 'Setubal', codigoPostal: '2900-000' },
    dataPretendida: fmt(nextWeek), horaPretendida: '07:00',
    veiculoId: VEICULO_ID, equipa: 'motorista_1_ajudante',
    materiais: { protecaoFilme: 4, protecaoCartao: 6, caixas: 25, fitaCola: 3 },
    observacoes: 'Escritorio com equipamento informatico. Fragil!',
    motoristaId: MOTORISTA_ID, ajudantesIds: [], tempoEstimadoHoras: 5,
    observacoesAdmin: 'Urgente - nova sede da empresa',
    aprovadoPor: ADMIN_ID, aprovadoEm: new Date(),
  }});
  console.log('M6 aprovada proxima semana (urgente):', m6.id);

  await prisma.$disconnect();
  console.log('\n=== CREDENCIAIS MOTORISTA ===');
  console.log('Email: motorista@demo.pt');
  console.log('Senha: Motorista1!');
}

main().catch(e => { console.error(e); prisma.$disconnect(); process.exit(1); });
