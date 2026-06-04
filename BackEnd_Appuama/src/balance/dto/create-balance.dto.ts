import { IsInt, IsNotEmpty, IsOptional, IsNumber, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateBalanceDto {
  @IsInt()
  @IsNotEmpty()
  carroId: number;

  @IsOptional()
  @IsDateString()
  dataRegistro?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  pesoPiloto?: number;

  @IsNumber()
  @IsNotEmpty()
  @Type(() => Number)
  pesoRodaDianteiraE: number;

  @IsNumber()
  @IsNotEmpty()
  @Type(() => Number)
  pesoRodaDianteiraD: number;

  @IsNumber()
  @IsNotEmpty()
  @Type(() => Number)
  pesoRodaTraseiraE: number;

  @IsNumber()
  @IsNotEmpty()
  @Type(() => Number)
  pesoRodaTraseiraD: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  distDianteiraTraseira?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  distEsquerdaDireita?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  distDiagonal?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  pesoTotalCarro?: number;
}
