import { IsString, IsNotEmpty, IsInt, IsOptional, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCarDto {
  @IsString()
  @IsNotEmpty()
  nome: string;

  @IsString()
  @IsNotEmpty()
  modelo: string;

  @IsOptional()
  @IsInt()
  ano?: number;

  @IsNumber()
  @Type(() => Number)
  entreEixo: number;

  @IsNumber()
  @Type(() => Number)
  distanciaRodas: number;
}
