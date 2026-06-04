import { Prisma } from '@prisma/client';

export class Balance implements Prisma.BalanceamentoUncheckedCreateInput {
  id?: number;
  carroId: number;
  dataRegistro?: Date;
  pesoPiloto?: Prisma.Decimal;
  pesoRodaDianteiraE: Prisma.Decimal;
  pesoRodaDianteiraD: Prisma.Decimal;
  pesoRodaTraseiraE: Prisma.Decimal;
  pesoRodaTraseiraD: Prisma.Decimal;
  distDianteiraTraseira?: Prisma.Decimal;
  distEsquerdaDireita?: Prisma.Decimal;
  distDiagonal?: Prisma.Decimal;
  pesoTotalCarro?: Prisma.Decimal;
}
