import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { Prisma, TesteReport } from '@prisma/client';

// Define a new interface for the formatted report
export interface FormattedReport extends Omit<TesteReport, 'horaInicio' | 'horaFim'> {
  horaInicio: string | null;
  horaFim: string | null;
}

// Helper function to convert to Decimal or null
function toDecimalOrNull(value: number | undefined | null): Prisma.Decimal | null {
  if (value === null || value === undefined || value === 0) {
    return null;
  }
  return new Prisma.Decimal(value);
}

// Helper function to convert to number or 0
function toNumberOrZero(value: number | undefined | null): number {
  if (value === null || value === undefined) {
    return 0;
  }
  return value;
}

// Helper function to convert Prisma.Decimal fields to numbers or default values
function convertDecimalFieldsToNumbers(report: any) {
  const fields = [
    'distanciaPercorrida',
    'pressaoDEAntes', 'pressaoDEDepois', 'desgasteDEAntes', 'desgasteDEDepois',
    'pressaoDDAntes', 'pressaoDDDepois', 'desgasteDDAntes', 'desgasteDDDepois',
    'pressaoTEAntes', 'pressaoTEDepois', 'desgasteTEAntes', 'desgasteTEDepois',
    'pressaoTDAntes', 'pressaoTDDepois', 'desgasteTDAntes', 'desgasteTDDepois',
    'tamanhoMolaDE', 'tamanhoMolaDD', 'tamanhoMolaTE', 'tamanhoMolaTD',
    'balanceFrontPercentage', 'balanceRearPercentage',
    'balanceLeftPercentage', 'balanceRightPercentage',
  ];
  for (const field of fields) {
    if (report[field] instanceof Prisma.Decimal) {
      report[field] = Number(report[field]);
    } else if (report[field] === null) {
      report[field] = 0; // Default to 0 for null numeric fields
    }
  }
  return report;
}

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createReportDto: CreateReportDto) {
    console.log('ReportsService: Received createReportDto:', createReportDto);

    const {
      carroId,
      usuarioId,
      balanceamentoId,
      dataTeste,
      horaInicio,
      horaFim,
      distanciaPercorrida,
      pressaoDEAntes, pressaoDEDepois, desgasteDEAntes, desgasteDEDepois,
      pressaoDDAntes, pressaoDDDepois, desgasteDDAntes, desgasteDDDepois,
      pressaoTEAntes, pressaoTEDepois, desgasteTEAntes, desgasteTEDepois,
      pressaoTDAntes, pressaoTDDepois, desgasteTDAntes, desgasteTDDepois,
      tamanhoMolaDE, tamanhoMolaDD, tamanhoMolaTE, tamanhoMolaTD,
      errosMecanicos,
      errosHumanos,
      observacoesPiloto,
      balanceFrontPercentage,
      balanceRearPercentage,
      balanceLeftPercentage,
      balanceRightPercentage,
    } = createReportDto;

    const dataToCreate: Prisma.TesteReportCreateInput = {
      carro: { connect: { id: carroId } },
      usuario: { connect: { id: usuarioId } },
      balanceamento: balanceamentoId ? { connect: { id: balanceamentoId } } : undefined,

      pilotoNome: createReportDto.pilotoNome,
      tipoSessao: createReportDto.tipoSessao,
      tempoTotal: createReportDto.tempoTotal,

      dataTeste: dataTeste ? new Date(dataTeste) : undefined,
      horaInicio: horaInicio ? new Date(horaInicio) : undefined,
      horaFim: horaFim ? new Date(horaFim) : undefined,

      distanciaPercorrida: toDecimalOrNull(distanciaPercorrida),
      
      errosMecanicos: toNumberOrZero(errosMecanicos),
      errosHumanos: toNumberOrZero(errosHumanos),
      observacoesPiloto: observacoesPiloto !== undefined ? observacoesPiloto : null,
      
      pressaoDEAntes: toDecimalOrNull(pressaoDEAntes),
      pressaoDEDepois: toDecimalOrNull(pressaoDEDepois),
      desgasteDEAntes: toDecimalOrNull(desgasteDEAntes),
      desgasteDEDepois: toDecimalOrNull(desgasteDEDepois),

      pressaoDDAntes: toDecimalOrNull(pressaoDDAntes),
      pressaoDDDepois: toDecimalOrNull(pressaoDDDepois),
      desgasteDDAntes: toDecimalOrNull(desgasteDDAntes),
      desgasteDDDepois: toDecimalOrNull(desgasteDDDepois),

      pressaoTEAntes: toDecimalOrNull(pressaoTEAntes),
      pressaoTEDepois: toDecimalOrNull(pressaoTEDepois),
      desgasteTEAntes: toDecimalOrNull(desgasteTEAntes),
      desgasteTEDepois: toDecimalOrNull(desgasteTEDepois),

      pressaoTDAntes: toDecimalOrNull(pressaoTDAntes),
      pressaoTDDepois: toDecimalOrNull(pressaoTDDepois),
      desgasteTDAntes: toDecimalOrNull(desgasteTDAntes),
      desgasteTDDepois: toDecimalOrNull(desgasteTDDepois),

      tamanhoMolaDE: toDecimalOrNull(tamanhoMolaDE),
      tamanhoMolaDD: toDecimalOrNull(tamanhoMolaDD),
      tamanhoMolaTE: toDecimalOrNull(tamanhoMolaTE),
      tamanhoMolaTD: toDecimalOrNull(tamanhoMolaTD),

      balanceFrontPercentage: toDecimalOrNull(balanceFrontPercentage),
      balanceRearPercentage: toDecimalOrNull(balanceRearPercentage),
      balanceLeftPercentage: toDecimalOrNull(balanceLeftPercentage),
      balanceRightPercentage: toDecimalOrNull(balanceRightPercentage),
    };

    console.log('ReportsService: Data to create:', dataToCreate);
    try {
      const createdReport = await this.prisma.testeReport.create({ 
        data: dataToCreate,
      });
      return createdReport;
    } catch (error) {
      console.error('ReportsService: Error creating report:', error);
      throw error; // Re-throw the error so NestJS can handle it as a 500
    }
  }

  async findAll(): Promise<FormattedReport[]> {
    const reports = await this.prisma.testeReport.findMany();
    return reports.map(report => {
      const formattedReport: FormattedReport = { ...report, horaInicio: null, horaFim: null };
      if (report.horaInicio instanceof Date) {
        formattedReport.horaInicio = report.horaInicio.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', hour12: false });
      }
      if (report.horaFim instanceof Date) {
        formattedReport.horaFim = report.horaFim.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', hour12: false });
      }
      return convertDecimalFieldsToNumbers(formattedReport) as FormattedReport;
    });
  }

  async findOne(id: number): Promise<FormattedReport> {
    const report = await this.prisma.testeReport.findUnique({
      where: { id },
    });
    if (!report) {
      throw new NotFoundException(`Report with ID ${id} not found`);
    }
    const formattedReport: FormattedReport = { ...report, horaInicio: null, horaFim: null };
    if (report.horaInicio instanceof Date) {
      formattedReport.horaInicio = report.horaInicio.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', hour12: false });
    }
    if (report.horaFim instanceof Date) {
      formattedReport.horaFim = report.horaFim.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', hour12: false });
    }
    return convertDecimalFieldsToNumbers(formattedReport) as FormattedReport;
  }

  async update(id: number, updateReportDto: UpdateReportDto) {
    const {
      carroId,
      usuarioId,
      balanceamentoId,
      dataTeste,
      horaInicio,
      horaFim,
      distanciaPercorrida,
      pressaoDEAntes, pressaoDEDepois, desgasteDEAntes, desgasteDEDepois,
      pressaoDDAntes, pressaoDDDepois, desgasteDDAntes, desgasteDDDepois,
      pressaoTEAntes, pressaoTEDepois, desgasteTEAntes, desgasteTEDepois,
      pressaoTDAntes, pressaoTDDepois, desgasteTDAntes, desgasteTDDepois,
      tamanhoMolaDE, tamanhoMolaDD, tamanhoMolaTE, tamanhoMolaTD,
      errosMecanicos,
      errosHumanos,
      observacoesPiloto,
      balanceFrontPercentage,
      balanceRearPercentage,
      balanceLeftPercentage,
      balanceRightPercentage,
      ...rest
    } = updateReportDto;

    const dataToUpdate: Prisma.TesteReportUpdateInput = {
      ...rest,
    };

    if (carroId !== undefined) {
        dataToUpdate.carro = { connect: { id: carroId } };
    }
    if (usuarioId !== undefined) {
        dataToUpdate.usuario = { connect: { id: usuarioId } };
    }
    if (balanceamentoId !== undefined) {
        dataToUpdate.balanceamento = { connect: { id: balanceamentoId } };
    }

    if (dataTeste !== undefined) dataToUpdate.dataTeste = dataTeste ? new Date(dataTeste) : null;
    if (horaInicio !== undefined) dataToUpdate.horaInicio = horaInicio ? new Date(horaInicio) : null;
    if (horaFim !== undefined) dataToUpdate.horaFim = horaFim ? new Date(horaFim) : null;

    if (distanciaPercorrida !== undefined) dataToUpdate.distanciaPercorrida = toDecimalOrNull(distanciaPercorrida);
    
    if (errosMecanicos !== undefined) dataToUpdate.errosMecanicos = toNumberOrZero(errosMecanicos);
    if (errosHumanos !== undefined) dataToUpdate.errosHumanos = toNumberOrZero(errosHumanos);
    if (observacoesPiloto !== undefined) dataToUpdate.observacoesPiloto = observacoesPiloto;

    if (balanceFrontPercentage !== undefined) dataToUpdate.balanceFrontPercentage = toDecimalOrNull(balanceFrontPercentage);
    if (balanceRearPercentage !== undefined) dataToUpdate.balanceRearPercentage = toDecimalOrNull(balanceRearPercentage);
    if (balanceLeftPercentage !== undefined) dataToUpdate.balanceLeftPercentage = toDecimalOrNull(balanceLeftPercentage);
    if (balanceRightPercentage !== undefined) dataToUpdate.balanceRightPercentage = toDecimalOrNull(balanceRightPercentage);

    if (pressaoDEAntes !== undefined) dataToUpdate.pressaoDEAntes = toDecimalOrNull(pressaoDEAntes);
    if (pressaoDEDepois !== undefined) dataToUpdate.pressaoDEDepois = toDecimalOrNull(pressaoDEDepois);
    if (desgasteDEAntes !== undefined) dataToUpdate.desgasteDEAntes = toDecimalOrNull(desgasteDEAntes);
    if (desgasteDEDepois !== undefined) dataToUpdate.desgasteDEDepois = toDecimalOrNull(desgasteDEDepois);

    if (pressaoDDAntes !== undefined) dataToUpdate.pressaoDDAntes = toDecimalOrNull(pressaoDDAntes);
    if (pressaoDDDepois !== undefined) dataToUpdate.pressaoDDDepois = toDecimalOrNull(pressaoDDDepois);
    if (desgasteDDAntes !== undefined) dataToUpdate.desgasteDDAntes = toDecimalOrNull(desgasteDDAntes);
    if (desgasteDDDepois !== undefined) dataToUpdate.desgasteDDDepois = toDecimalOrNull(desgasteDDDepois);

    if (pressaoTEAntes !== undefined) dataToUpdate.pressaoTEAntes = toDecimalOrNull(pressaoTEAntes);
    if (pressaoTEDepois !== undefined) dataToUpdate.pressaoTEDepois = toDecimalOrNull(pressaoTEDepois);
    if (desgasteTEAntes !== undefined) dataToUpdate.desgasteTEAntes = toDecimalOrNull(desgasteTEAntes);
    if (desgasteTEDepois !== undefined) dataToUpdate.desgasteTEDepois = toDecimalOrNull(desgasteTEDepois);

    if (pressaoTDAntes !== undefined) dataToUpdate.pressaoTDAntes = toDecimalOrNull(pressaoTDAntes);
    if (pressaoTDDepois !== undefined) dataToUpdate.pressaoTDDepois = toDecimalOrNull(pressaoTDDepois);
    if (desgasteTDAntes !== undefined) dataToUpdate.desgasteTDAntes = toDecimalOrNull(desgasteTDAntes);
    if (desgasteTDDepois !== undefined) dataToUpdate.desgasteTDDepois = toDecimalOrNull(desgasteTDDepois);

    if (tamanhoMolaDE !== undefined) dataToUpdate.tamanhoMolaDE = toDecimalOrNull(tamanhoMolaDE);
    if (tamanhoMolaDD !== undefined) dataToUpdate.tamanhoMolaDD = toDecimalOrNull(tamanhoMolaDD);
    if (tamanhoMolaTE !== undefined) dataToUpdate.tamanhoMolaTE = toDecimalOrNull(tamanhoMolaTE);
    if (tamanhoMolaTD !== undefined) dataToUpdate.tamanhoMolaTD = toDecimalOrNull(tamanhoMolaTD);

    const updatedReport = await this.prisma.testeReport.update({
      where: { id },
      data: dataToUpdate,
    });
    return updatedReport;
  }

  remove(id: number) {
    return this.prisma.testeReport.delete({ where: { id } });
  }

  async findByCarroId(carroId: number): Promise<FormattedReport[]> {
    const reports = await this.prisma.testeReport.findMany({
      where: { carroId },
      orderBy: { dataTeste: 'desc' },
    });
    return reports.map(report => {
      const formattedReport: FormattedReport = { ...report, horaInicio: null, horaFim: null };
      if (report.horaInicio instanceof Date) {
        formattedReport.horaInicio = report.horaInicio.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', hour12: false });
      }
      if (report.horaFim instanceof Date) {
        formattedReport.horaFim = report.horaFim.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', hour12: false });
      }
      return convertDecimalFieldsToNumbers(formattedReport) as FormattedReport;
    });
  }

  async findLastReport(): Promise<FormattedReport | null> {
    const report = await this.prisma.testeReport.findFirst({
      orderBy: [
        { dataTeste: 'desc' },
        { horaFim: 'desc' }
      ], // Order by date, then by end time
    });
    if (!report) {
      return null;
    }
    console.log('ReportsService: Before conversion - report:', report);
    const formattedReport: FormattedReport = { ...report, horaInicio: null, horaFim: null };
    if (report.horaInicio instanceof Date) {
      formattedReport.horaInicio = report.horaInicio.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', hour12: false });
    }
    if (report.horaFim instanceof Date) {
      formattedReport.horaFim = report.horaFim.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', hour12: false });
    }
    const convertedReport = convertDecimalFieldsToNumbers(formattedReport) as FormattedReport;
    console.log('ReportsService: After conversion - convertedReport:', convertedReport);
    return convertedReport;
  }
}