# Usa Node.js 20 no Alpine
FROM node:20-alpine

# Cria diretório da aplicação
WORKDIR /app

# Copia package.json e package-lock.json
COPY package*.json ./

# Instala dependências
RUN npm cache clean --force
RUN npm install

# Copia o schema do Prisma para gerar o client
COPY prisma ./prisma

# Gera o Prisma Client
RUN npx prisma generate

# Copia o restante do código
COPY . .

# Compila TypeScript
RUN npm run build

# Docker cache busting comment - please ignore (2025-11-20-1)


# Expõe porta 3000
EXPOSE 3000

# Comando para rodar a aplicação
CMD ["npm", "run", "start:prod"]