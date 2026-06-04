import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const saltRounds = 10;
  const password = 'admin123';
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  const adminUser = await prisma.usuario.upsert({
    where: { email: 'teste@apuama.com' },
    update: {},
    create: {
      email: 'teste@apuama.com',
      nomeCompleto: 'Admin Apuama',
      matricula: '000000',
      posicaoEquipe: 'Admin',
      senhaHash: hashedPassword,
      isAdmin: true,
      isAprovado: true,
    },
  });

  console.log({ adminUser });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
