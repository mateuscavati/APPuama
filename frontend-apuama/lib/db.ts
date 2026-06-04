import Dexie, { type Table } from 'dexie';

// Interfaces mirroring the Prisma schema with added synchronization metadata
export interface LocalUsuario {
  id?: number;
  remoteId?: number;
  nomeCompleto: string;
  email: string;
  matricula: string;
  posicaoEquipe: string;
  isAdmin: boolean;
  isAprovado: boolean;
  synced: boolean;
}

export interface LocalCarro {
  id?: number;
  remoteId?: number;
  nome: string;
  modelo: string;
  ano?: number;
  entreEixo: number;
  distanciaRodas: number;
  synced: boolean;
}

export interface LocalBalanceamento {
  id?: number;
  remoteId?: number;
  carroId: number;
  dataRegistro: Date;
  pesoPiloto?: number;
  pesoRodaDianteiraE: number;
  pesoRodaDianteiraD: number;
  pesoRodaTraseiraE: number;
  pesoRodaTraseiraD: number;
  distDianteiraTraseira?: number;
  distEsquerdaDireita?: number;
  distDiagonal?: number;
  pesoTotalCarro?: number;
  synced: boolean;
}

export interface LocalTesteReport {
  id?: number;
  remoteId?: number;
  carroId: number;
  usuarioId: number;
  balanceamentoId?: number;
  pilotoNome?: string;
  tipoSessao?: string;
  dataTeste?: Date;
  horaInicio?: string;
  horaFim?: string;
  tempoTotal?: string;
  distanciaPercorrida?: number;
  errosMecanicos: number;
  errosHumanos: number;
  observacoesPiloto?: string;
  
  // Pneus
  pressaoDEAntes?: number;
  pressaoDEDepois?: number;
  desgasteDEAntes?: number;
  desgasteDEDepois?: number;

  pressaoDDAntes?: number;
  pressaoDDDepois?: number;
  desgasteDDAntes?: number;
  desgasteDDDepois?: number;

  pressaoTEAntes?: number;
  pressaoTEDepois?: number;
  desgasteTEAntes?: number;
  desgasteTEDepois?: number;

  pressaoTDAntes?: number;
  pressaoTDDepois?: number;
  desgasteTDAntes?: number;
  desgasteTDDepois?: number;

  // Molas
  tamanhoMolaDE?: number;
  tamanhoMolaDD?: number;
  tamanhoMolaTE?: number;
  tamanhoMolaTD?: number;

  balanceFrontPercentage?: number;
  balanceRearPercentage?: number;
  balanceLeftPercentage?: number;
  balanceRightPercentage?: number;
  
  synced: boolean;
}

export interface LocalChecklistItem {
  id?: number;
  remoteId?: number;
  area: string;
  descricaoItem: string;
  synced: boolean;
}

export class AppDatabase extends Dexie {
  users!: Table<LocalUsuario>;
  cars!: Table<LocalCarro>;
  balances!: Table<LocalBalanceamento>;
  reports!: Table<LocalTesteReport>;
  checklistItems!: Table<LocalChecklistItem>;

  constructor() {
    super('AppuamaDB');
    this.version(1).stores({
      users: '++id, email, remoteId, synced',
      cars: '++id, remoteId, synced',
      balances: '++id, carroId, remoteId, synced, dataRegistro',
      reports: '++id, carroId, usuarioId, remoteId, synced, dataTeste',
      checklistItems: '++id, remoteId, synced'
    });
  }
}

export const db = new AppDatabase();

// Seed function for default admin
db.on('populate', () => {
  db.users.add({
    nomeCompleto: 'Admin Apuama',
    email: 'teste@apuama.com',
    matricula: '000000',
    posicaoEquipe: 'Admin',
    isAdmin: true,
    isAprovado: true,
    synced: true
  });
});

// For development/debugging: ensuring admin exists even if populate already ran
export async function ensureAdminUser() {
  const admin = await db.users.where('email').equals('teste@apuama.com').first();
  if (!admin) {
    await db.users.add({
      nomeCompleto: 'Admin Apuama',
      email: 'teste@apuama.com',
      matricula: '000000',
      posicaoEquipe: 'Admin',
      isAdmin: true,
      isAprovado: true,
      synced: true
    });
  }
}
