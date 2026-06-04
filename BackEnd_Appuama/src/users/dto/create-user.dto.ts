import { IsString, IsEmail, IsNotEmpty, MinLength, IsOptional, IsBoolean } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  nomeCompleto: string;

  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  matricula: string;

  @IsString()
  @IsNotEmpty()
  posicaoEquipe: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  senhaHash: string;

  @IsOptional()
  @IsBoolean()
  isAdmin?: boolean;

  @IsOptional()
  @IsBoolean()
  isAprovado?: boolean;
}
