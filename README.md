# APPuama Racing - Plataforma Desktop de Análise de Desempenho

Esta é a versão Desktop da Plataforma de Análise da equipe Apuama de Fórmula SAE. O sistema foi transformado em um aplicativo autônomo que funciona **100% offline**, utilizando um banco de dados local para persistência de dados.

## 🚀 Tecnologias Utilizadas

- **Frontend:** Next.js 15 (Exportação Estática)
- **Container Desktop:** Electron
- **Banco de Dados Local:** Dexie.js (IndexedDB)
- **Estilização:** Tailwind CSS & Shadcn UI

## 🛠️ Arquitetura Offline-First

O aplicativo foi projetado para ser usado em ambientes de competição onde o acesso à internet é limitado ou inexistente.

1.  **Persistência Local:** Todos os dados (Carros, Reports, Balanceamentos, Checklist) são salvos instantaneamente no banco de dados local do computador.
2.  **Autenticação Local:** O login é verificado contra o banco local. Um usuário administrador padrão é criado automaticamente no primeiro acesso.
3.  **Independência de Servidor:** Não é necessário rodar o BackEnd (NestJS/Postgres) para o funcionamento pleno do aplicativo Desktop.

## 📋 Credenciais Padrão (Offline)

- **Usuário:** `teste@apuama.com`
- **Senha:** `admin123`

---

## 💻 Como Rodar o Projeto

### Pré-requisitos
- Node.js (v20 ou superior)
- NPM ou PNPM

### Modo Desenvolvimento
Para rodar com Hot Reload (atualização automática ao salvar):

1.  **Terminal 1 (Frontend):**
    ```bash
    cd frontend-apuama
    npm run dev
    ```

2.  **Terminal 2 (Electron):**
    ```bash
    # Na raiz do projeto
    npm run electron:dev
    ```

---

## 📦 Como Gerar o Executável

### Para Linux (.AppImage)
Entrar na pasta "frontend-apuama"
rodar:
```bash
npm install
```
depois rodar na raiz:
```bash
npm install
```
e depois:
```bash
npm run electron:build:linux
```
O arquivo será gerado em `dist/APPuama Racing-1.0.0.AppImage`. Para rodar:
```bash
chmod +x dist/*.AppImage
./dist/*.AppImage --no-sandbox
```

### Para Windows (.exe)
*Requer Wine se estiver no Linux, ou rodar diretamente no Windows.*
Entrar na pasta "frontend-apuama"
rodar:
```bash
npm install
```
depois rodar na raiz:
```bash
npm install
```
e depois:
```bash
npm run electron:build:win
```
O instalador estará disponível na pasta `dist/`.

---

## 📂 Estrutura de Pastas Chave

- `main.js`: Configuração principal do Electron (gerenciamento de janelas e protocolos).
- `frontend-apuama/lib/db.ts`: Definição do schema do banco de dados local Dexie.
- `frontend-apuama/contexts/auth-context.tsx`: Núcleo da lógica offline-first e persistência.
- `frontend-apuama/out/`: Pasta gerada após o build contendo o site estático.

---

## 🔧 Manutenção

Caso precise adicionar novas tabelas ao banco de dados:
1.  Edite `frontend-apuama/lib/db.ts`.
2.  Incremente a versão do banco: `this.version(X).stores(...)`.
3.  Atualize as interfaces correspondentes.
