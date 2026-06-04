import { Prisma } from '@prisma/client';

export class Car implements Prisma.CarroUncheckedCreateInput {
  id?: number;
  nome: string;
  modelo: string;
  ano?: number;
  entreEixo: Prisma.Decimal;
  distanciaRodas: Prisma.Decimal;
}
