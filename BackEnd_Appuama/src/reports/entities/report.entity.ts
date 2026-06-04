import { Prisma } from '@prisma/client';

export class Report implements Prisma.TesteReportUncheckedCreateInput {
  id?: number;
  carroId: number;
  usuarioId: number;
  balanceamentoId?: number;
  pilotoNome?: string;
  tipoSessao?: string;
  dataTeste?: Date;
  horaInicio?: Date;
  horaFim?: Date;
  tempoTotal?: string;
  distanciaPercorrida?: Prisma.Decimal;
  errosMecanicos?: number;
  errosHumanos?: number;
  observacoesPiloto?: string;

  pressaoDEAntes?: Prisma.Decimal;
  pressaoDEDepois?: Prisma.Decimal;
  desgasteDEAntes?: Prisma.Decimal;
  desgasteDEDepois?: Prisma.Decimal;
  pressaoDDAntes?: Prisma.Decimal;
  pressaoDDDepois?: Prisma.Decimal;
  desgasteDDAntes?: Prisma.Decimal;
  desgasteDDDepois?: Prisma.Decimal;
  pressaoTEAntes?: Prisma.Decimal;
  pressaoTEDepois?: Prisma.Decimal;
  desgasteTEAntes?: Prisma.Decimal;
  desgasteTEDepois?: Prisma.Decimal;
  pressaoTDAntes?: Prisma.Decimal;
  pressaoTDDepois?: Prisma.Decimal;
  desgasteTDAntes?: Prisma.Decimal;
  desgasteTDDepois?: Prisma.Decimal;

  tamanhoMolaDE?: Prisma.Decimal;
  tamanhoMolaDD?: Prisma.Decimal;
  tamanhoMolaTE?: Prisma.Decimal;
  tamanhoMolaTD?: Prisma.Decimal;
}
