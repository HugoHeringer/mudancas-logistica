const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');
const fs = require('fs');

const prisma = new PrismaClient();

const TID = '77b6ec18-b629-4d4a-8bac-b710128ce682';
const ADMIN_ID = '1ea845f7-3d29-4579-9217-ed70fea36190';

const motoristas = [
  { id: 'd4208549-aa45-4769-b8df-29c384a2883c', nome: 'Motorista 1', valorHora: 8 },
  { id: 'dc8dd312-3bd8-4f80-a076-5415c630bd8a', nome: 'Motorista 2', valorHora: 9 },
  { id: '2d757bd8-84dd-4808-b5ea-2dc1f0ea9095', nome: 'Motorista 3', valorHora: 9.5 },
];
const veiculos = [
  { id: 'b0fc0ac6-0c17-40b9-b985-0506b30f6574', nome: 'Carrinha 1', precoHora: 35, m3: 19 },
  { id: 'ec7859f5-6f94-49a0-bae8-125a1f63f8b5', nome: 'Carrinha 2', precoHora: 45, m3: 23 },
  { id: '35de3d48-3150-4aa6-a403-3f55d382da9d', nome: 'Carrinha 3', precoHora: 45, m3: 23 },
  { id: '1931af0a-bff4-4314-8490-28fe707aea6e', nome: 'Carrinha 4', precoHora: 35, m3: 18 },
];

const localidades = ['Porto','Gaia','Matosinhos','Maia','Vila Nova de Gaia','Gondomar','Valongo','Póvoa de Varzim','Vila do Conde','Santo Tirso','Braga','Guimarães','Aveiro','Coimbra','Figueira da Foz'];
const ruas = ['Rua da Boavista','Av. da República','Rua de Santa Catarina','Rua do Ouro','Travessa das Flores','Rua Central','Av. dos Aliados','Rua da Paz','Rua do Comércio','Rua do Sol','Rua das Flores','Largo da Sé','Rua dos Clérigos','Av. da Boavista','Rua de Camões'];
const nomes = ['Ana Silva','João Santos','Maria Oliveira','Pedro Costa','Carla Ferreira','Rui Pereira','Sofia Martins','Miguel Rodrigues','Teresa Lopes','Fernando Almeida','Patrícia Sousa','Hugo Carvalho','Inês Ribeiro','André Moreira','Luísa Nascimento','Bruno Correia','Diana Mendes','Gonçalo Tavares','Rita Azevedo','Tiago Fonseca','Helena Vieira','Nuno Campos','Cátia Pinto','Vasco Lima','Beatriz Rocha','Paulo Gomes','Sandra Teixeira','Ricardo Neves','Marta Lopes','Carlos Pinto'];

function randFrom(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

async function main() {
  console.log('🌱 Seeding ktransportes - Abril 2026...\n');

  // Create clients first
  const clientesCriados = [];
  for (const nome of nomes) {
    const email = nome.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(' ', '.') + '@gmail.com';
    const partes = nome.split(' ');
    const c = await prisma.cliente.create({
      data: {
        id: crypto.randomUUID(),
        tenantId: TID,
        nome: partes[0],
        apelido: partes.slice(1).join(' '),
        email,
        telefone: '91' + randInt(1000000, 9999999),
        nif: String(randInt(100000000, 999999999)),
        moradas: [{ rua: randFrom(ruas), numero: String(randInt(1, 200)), localidade: randFrom(localidades), codigoPostal: String(randInt(4000, 4999)) + '-' + String(randInt(100, 999)) }],
      }
    });
    clientesCriados.push(c);
  }
  console.log(`✓ ${clientesCriados.length} clientes criados`);

  // Generate 30 mudanças
  const estados = [
    'concluida','concluida','concluida','concluida','concluida',
    'concluida','concluida','concluida','concluida','concluida',
    'concluida','concluida','concluida','concluida',
    'aprovada','aprovada','aprovada','aprovada',
    'a_caminho','a_caminho',
    'em_servico',
    'pendente','pendente','pendente','pendente','pendente',
    'cancelada','cancelada',
    'recusada'
  ];
  // Shuffle
  for (let i = estados.length - 1; i > 0; i--) { const j = randInt(0, i); [estados[i], estados[j]] = [estados[j], estados[i]]; }

  const mudancas = [];
  const diasUsados = new Set();

  for (let i = 0; i < 30; i++) {
    let dia;
    do { dia = randInt(1, 29); } while (diasUsados.has(dia) && diasUsados.size < 25);
    diasUsados.add(dia);

    const estado = estados[i];
    const veiculo = randFrom(veiculos);
    const motorista = randFrom(motoristas);
    const tipoServico = Math.random() > 0.8 ? 'urgente' : 'normal';
    const equipa = randFrom(['motorista','motorista_1_ajudante','motorista_2_ajudantes']);
    const numAjudantes = equipa === 'motorista_2_ajudantes' ? 2 : equipa === 'motorista_1_ajudante' ? 1 : 0;
    const horas = tipoServico === 'urgente' ? randInt(1, 3) : randInt(2, 7);
    const clienteObj = randFrom(clientesCriados);
    const localRecolha = randFrom(localidades);
    let localEntrega = randFrom(localidades);
    while (localEntrega === localRecolha) localEntrega = randFrom(localidades);
    const eInternacional = Math.random() > 0.9;

    const receitaPrevista = (veiculo.precoHora * horas).toString();
    const totalPagoMot = (motorista.valorHora * horas).toFixed(2);
    const totalPagoAj = (numAjudantes * 7 * horas).toFixed(2);
    const custosOp = (parseFloat(totalPagoMot) + parseFloat(totalPagoAj)).toFixed(2);
    const margem = (parseFloat(receitaPrevista) - parseFloat(custosOp)).toFixed(2);

    const dataPretendida = new Date(2026, 3, dia, randInt(7, 11), 0, 0);
    const horaPretendida = String(randInt(7, 16)).padStart(2, '0') + ':' + String(randInt(0, 3) * 15).padStart(2, '0');
    const createdOffset = randInt(1, 14);
    const createdAt = new Date(2026, 3, Math.max(1, dia - createdOffset), randInt(8, 20), randInt(0, 59));

    const m = {
      id: crypto.randomUUID(),
      tenantId: TID,
      estado,
      tipoServico,
      clienteNome: clienteObj.nome,
      clienteEmail: clienteObj.email,
      clienteTelefone: clienteObj.telefone,
      clienteId: clienteObj.id,
      moradaRecolha: {
        rua: randFrom(ruas), numero: String(randInt(1, 200)), andar: String(randInt(0, 5)),
        codigoPostal: String(randInt(4000, 4999)) + '-' + String(randInt(100, 999)),
        localidade: localRecolha, elevador: Math.random() > 0.6,
        pais: eInternacional ? 'Espanha' : 'Portugal'
      },
      moradaEntrega: {
        rua: randFrom(ruas), numero: String(randInt(1, 200)), andar: String(randInt(0, 5)),
        codigoPostal: String(randInt(4000, 4999)) + '-' + String(randInt(100, 999)),
        localidade: localEntrega, elevador: Math.random() > 0.6,
        pais: eInternacional ? 'Espanha' : 'Portugal'
      },
      dataPretendida,
      horaPretendida,
      veiculoId: veiculo.id,
      motoristaId: motorista.id,
      equipa,
      materiais: { caixas: randInt(0, 20), fitaCola: randInt(0, 5), protecaoFilme: randInt(0, 4), protecaoCartao: randInt(0, 3) },
      observacoes: tipoServico === 'urgente' ? 'Mudança urgente' : null,
      eInternacional,
      documentacao: eInternacional ? 'Passaporte + NIF' : null,
      camposPersonalizados: {},
      consentimentoDados: true,
      consentimentoMarketing: Math.random() > 0.5,
      timestampConsentimento: createdAt,
      tempoEstimadoHoras: String(horas),
      valorHoraMotoristaSnapshot: String(motorista.valorHora),
      valorHoraAjudanteSnapshot: '7',
      receitaPrevista,
      receitaRealizada: estado === 'concluida' ? receitaPrevista : null,
      totalPagoMotorista: estado === 'concluida' ? totalPagoMot : null,
      totalPagoAjudantes: estado === 'concluida' ? totalPagoAj : null,
      custosOperacionais: estado === 'concluida' ? custosOp : null,
      margem: estado === 'concluida' ? margem : null,
      aprovadoPor: estado !== 'pendente' && estado !== 'recusada' ? ADMIN_ID : null,
      aprovadoEm: estado !== 'pendente' && estado !== 'recusada' ? new Date(createdAt.getTime() + 3600000) : null,
      concluidoEm: estado === 'concluida' ? new Date(dataPretendida.getTime() + horas * 3600000) : null,
      concluidoPor: estado === 'concluida' ? ADMIN_ID : null,
      horasCobradas: estado === 'concluida' ? String(horas) : null,
      createdAt,
      updatedAt: estado === 'concluida' ? new Date(dataPretendida.getTime() + horas * 3600000) : new Date(),
    };

    mudancas.push(m);
  }

  // Create mudanças
  for (const m of mudancas) {
    await prisma.mudanca.create({ data: m });
  }
  console.log(`✓ ${mudancas.length} mudanças criadas`);

  // Create financial movements for concluded
  const concluidas = mudancas.filter(m => m.estado === 'concluida');
  let finCount = 0;
  for (const m of concluidas) {
    // Revenue
    await prisma.movimentoFinanceiro.create({
      data: {
        tenantId: TID, mudancaId: m.id, tipo: 'receita', categoria: 'servico',
        descricao: `Mudança ${m.clienteNome} - ${m.moradaRecolha.localidade} → ${m.moradaEntrega.localidade}`,
        valor: parseFloat(m.receitaRealizada), data: m.concluidoEm,
      }
    });
    // Motorista cost
    await prisma.movimentoFinanceiro.create({
      data: {
        tenantId: TID, mudancaId: m.id, tipo: 'custo', categoria: 'outros',
        descricao: `Motorista - ${motoristas.find(mt => mt.id === m.motoristaId)?.nome}`,
        valor: parseFloat(m.totalPagoMotorista), data: m.concluidoEm,
      }
    });
    finCount += 2;
    // Ajudante cost
    if (parseFloat(m.totalPagoAjudantes) > 0) {
      await prisma.movimentoFinanceiro.create({
        data: {
          tenantId: TID, mudancaId: m.id, tipo: 'custo', categoria: 'outros',
          descricao: 'Ajudantes',
          valor: parseFloat(m.totalPagoAjudantes), data: m.concluidoEm,
        }
      });
      finCount++;
    }
  }
  console.log(`✓ ${finCount} movimentos financeiros criados`);

  // Generate reference file
  const report = {
    tenant: { id: TID, nome: 'K Transportes', subdomain: 'ktransportes' },
    periodo: 'Abril 2026',
    resumo: {
      totalMudancas: mudancas.length,
      concluidas: mudancas.filter(m => m.estado === 'concluida').length,
      aprovadas: mudancas.filter(m => m.estado === 'aprovada').length,
      aCaminho: mudancas.filter(m => m.estado === 'a_caminho').length,
      emServico: mudancas.filter(m => m.estado === 'em_servico').length,
      pendentes: mudancas.filter(m => m.estado === 'pendente').length,
      canceladas: mudancas.filter(m => m.estado === 'cancelada').length,
      recusadas: mudancas.filter(m => m.estado === 'recusada').length,
      receitaTotal: concluidas.reduce((s, m) => s + parseFloat(m.receitaRealizada), 0).toFixed(2) + ' €',
      custosTotal: concluidas.reduce((s, m) => s + parseFloat(m.custosOperacionais), 0).toFixed(2) + ' €',
      margemTotal: concluidas.reduce((s, m) => s + parseFloat(m.margem), 0).toFixed(2) + ' €',
    },
    mudancas: mudancas.map(m => ({
      id: m.id,
      data: m.dataPretendida.toISOString().split('T')[0],
      hora: m.horaPretendida,
      estado: m.estado,
      tipoServico: m.tipoServico,
      cliente: m.clienteNome,
      email: m.clienteEmail,
      telefone: m.clienteTelefone,
      recolha: `${m.moradaRecolha.rua} ${m.moradaRecolha.numero}, ${m.moradaRecolha.localidade}`,
      entrega: `${m.moradaEntrega.rua} ${m.moradaEntrega.numero}, ${m.moradaEntrega.localidade}`,
      veiculo: veiculos.find(v => v.id === m.veiculoId)?.nome,
      motorista: motoristas.find(mt => mt.id === m.motoristaId)?.nome,
      equipa: m.equipa,
      horasEstimadas: m.tempoEstimadoHoras,
      materiais: m.materiais,
      internacional: m.eInternacional,
      receitaPrevista: m.receitaPrevista + ' €',
      receitaRealizada: m.receitaRealizada ? m.receitaRealizada + ' €' : '-',
      custoMotorista: m.totalPagoMotorista ? m.totalPagoMotorista + ' €' : '-',
      custoAjudantes: m.totalPagoAjudantes ? m.totalPagoAjudantes + ' €' : '-',
      custosOperacionais: m.custosOperacionais ? m.custosOperacionais + ' €' : '-',
      margem: m.margem ? m.margem + ' €' : '-',
    })),
  };

  fs.writeFileSync('ktransportes-abril-2026.json', JSON.stringify(report, null, 2));
  console.log(`\n✅ Seed completo!`);
  console.log(`📋 Resumo:`);
  console.log(`   Mudanças: ${report.resumo.totalMudancas}`);
  console.log(`   Concluídas: ${report.resumo.concluidas}`);
  console.log(`   Receita Total: ${report.resumo.receitaTotal}`);
  console.log(`   Custos Total: ${report.resumo.custosTotal}`);
  console.log(`   Margem Total: ${report.resumo.margemTotal}`);
  console.log(`\n📄 Arquivo: ktransportes-abril-2026.json`);
}

main().catch(e => console.error('ERROR:', e.message)).finally(() => prisma.$disconnect());
