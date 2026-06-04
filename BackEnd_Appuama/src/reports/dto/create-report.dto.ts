import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsDateString,
  IsString,
  Min,
  Max,
  IsBoolean,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateReportChecklistItemDto {
  @IsInt()
  @IsNotEmpty()
  checklistItemId: number;

  @IsBoolean()
  @IsNotEmpty()
  status: boolean; // true if checked, false if unchecked
}

export class CreateReportDto {
  @IsInt()
  @IsNotEmpty()
  carroId: number;

  @IsInt()
  @IsNotEmpty()
  usuarioId: number;

  @IsOptional()
  @IsInt()
  balanceamentoId?: number;

  @IsOptional()
  @IsString()
  pilotoNome?: string;

  @IsOptional()
  @IsString()
  tipoSessao?: string;

  @IsOptional()
  @IsDateString()
  dataTeste?: string;

  @IsOptional()
  @IsDateString()
  horaInicio?: string;

  @IsOptional()
  @IsDateString()
  horaFim?: string;

  @IsOptional()
  @IsString()
  tempoTotal?: string;

  @IsOptional()
  @IsNumber()
  distanciaPercorrida?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  errosMecanicos?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  errosHumanos?: number;

  @IsOptional()
  @IsString()
  observacoesPiloto?: string;

  // Pneus
  @IsOptional()
  @IsNumber()
  pressaoDEAntes?: number;

  @IsOptional()
  @IsNumber()
  pressaoDEDepois?: number;

  @IsOptional()
  @IsNumber()
  desgasteDEAntes?: number;

  @IsOptional()
  @IsNumber()
  desgasteDEDepois?: number;

  @IsOptional()
  @IsNumber()
  pressaoDDAntes?: number;

  @IsOptional()
  @IsNumber()
  pressaoDDDepois?: number;

  @IsOptional()
  @IsNumber()
  desgasteDDAntes?: number;

  @IsOptional()
  @IsNumber()
  desgasteDDDepois?: number;

  @IsOptional()
  @IsNumber()
  pressaoTEAntes?: number;

  @IsOptional()
  @IsNumber()
  pressaoTEDepois?: number;

  @IsOptional()
  @IsNumber()
  desgasteTEAntes?: number;

  @IsOptional()
  @IsNumber()
  desgasteTEDepois?: number;

  @IsOptional()
  @IsNumber()
  pressaoTDAntes?: number;

  @IsOptional()
  @IsNumber()
  pressaoTDDepois?: number;

  @IsOptional()
  @IsNumber()
  desgasteTDAntes?: number;

  @IsOptional()
  @IsNumber()
  desgasteTDDepois?: number;

  // Molas
  @IsOptional()
  @IsNumber()
  tamanhoMolaDE?: number;

  @IsOptional()
  @IsNumber()
  tamanhoMolaDD?: number;

  @IsOptional()
  @IsNumber()
  tamanhoMolaTE?: number;

  @IsOptional()
  @IsNumber()
  tamanhoMolaTD?: number;

  // Balanceamento
  @IsOptional()
  @IsNumber()
  balanceFrontPercentage?: number;

  @IsOptional()
  @IsNumber()
  balanceRearPercentage?: number;

  @IsOptional()
  @IsNumber()
  balanceLeftPercentage?: number;

  @IsOptional()
  @IsNumber()
  balanceRightPercentage?: number;

  // Checklist Items
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateReportChecklistItemDto)
  checklistItems?: CreateReportChecklistItemDto[];
}
