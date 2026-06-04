# Formula SAE App - Backend

Este é o diretório do backend do projeto Formula SAE App, uma API desenvolvida com NestJS para o gerenciamento de dados da equipe Apuama Racing.

## Visão Geral

O backend é responsável por toda a lógica de negócio da aplicação, incluindo:

-   Gerenciamento de usuários e autenticação.
-   Cadastro e gerenciamento de carros.
-   Armazenamento e recuperação de dados de balanceamento.
-   Criação e consulta de relatórios de testes.
-   Gerenciamento de itens de checklist.

## Arquitetura e Tecnologias

A API foi construída utilizando uma arquitetura modular para garantir a separação de responsabilidades e facilitar a manutenção.

-   **Framework**: [NestJS](https://nestjs.com/) (TypeScript)
-   **ORM**: [Prisma](https://www.prisma.io/) para interação com o banco de dados.
-   **Banco de Dados**: [PostgreSQL](https://www.postgresql.org/).
-   **Autenticação**: Baseada em [JSON Web Tokens (JWT)](https://jwt.io/).
-   **Documentação da API**: [Swagger](https://swagger.io/) (OpenAPI) para visualização e teste dos endpoints.

## Como Executar o Projeto

A forma mais simples de executar o backend, juntamente com o frontend e o banco de dados, é utilizando o Docker.

1.  **Pré-requisitos**:
    -   [Docker](https://docs.docker.com/get-docker/) instalado.
    -   [Docker Compose](https://docs.docker.com/compose/install/) instalado.

2.  **Passos**:
    1.  Navegue até a raiz do projeto (`formula-sae-app`).
    2.  Execute o comando abaixo para construir as imagens e iniciar os contêineres:
        ```bash
        docker-compose up -d
        ```

O backend estará acessível em `http://localhost:3001`. A documentação interativa da API (Swagger) pode ser acessada em `http://localhost:3001/api`.

## Estrutura dos Módulos

O backend está organizado nos seguintes módulos principais:

-   `AuthModule`: Cuida da autenticação (login e registro).
-   `UsersModule`: Gerenciamento completo de usuários (CRUD).
-   `CarsModule`: Gerenciamento dos carros da equipe.
-   `BalanceModule`: Armazenamento de dados de balanceamento dos carros.
-   `ReportsModule`: Gerenciamento dos relatórios de testes.
-   `ChecklistItemsModule`: Gerenciamento dos itens de checklist para os testes.

## Endpoints da API

A seguir, um resumo dos principais endpoints disponíveis.

### Autenticação (`/auth`)

-   `POST /auth/login`: Realiza o login do usuário e retorna um token JWT.
-   `POST /auth/signup`: Permite que um novo usuário se registre (fica pendente de aprovação).

### Usuários (`/users`)

-   `GET /users`: Retorna todos os usuários (requer permissão de administrador).
-   `POST /users`: Cria um novo usuário (requer permissão de administrador).
-   `PATCH /users/:id`: Atualiza os dados de um usuário, incluindo status de aprovação.
-   `DELETE /users/:id`: Remove um usuário (requer permissão de administrador).

### Carros (`/cars`)

-   `GET /cars`: Retorna todos os carros cadastrados.
-   `POST /cars`: Adiciona um novo carro.
-   `DELETE /cars/:id`: Remove um carro.

### Balanceamento (`/balance`)

-   `POST /balance`: Salva novos dados de balanceamento para um carro.
-   `GET /balance/last/:carroId`: Obtém os últimos dados de balanceamento de um carro específico.

### Relatórios (`/reports`)

-   `GET /reports`: Retorna todos os relatórios.
-   `POST /reports`: Cria um novo relatório de teste.
-   `GET /reports/car/:carroId`: Retorna todos os relatórios de um carro específico.
-   `DELETE /reports/:id`: Remove um relatório.

### Itens de Checklist (`/checklist-items`)

-   `GET /checklist-items`: Retorna todos os itens de checklist.
-   `POST /checklist-items`: Adiciona um novo item de checklist.
-   `DELETE /checklist-items/:id`: Remove um item de checklist.

## Modelo do Banco de Dados

O esquema do banco de dados é definido com o Prisma em `prisma/schema.prisma`. Este arquivo é a fonte da verdade para a estrutura de dados da aplicação.