import { Prisma } from '@prisma/client';

export class User implements Prisma.UsuarioUncheckedCreateInput {
  id?: number;
  nomeCompleto: string;
  email: string;
  matricula: string;
  posicaoEquipe: string;
  senhaHash: string;
  isAdmin?: boolean;
  isAprovado?: boolean;
}
