# Apuama Racing - Frontend

Este é o diretório do frontend da plataforma Apuama. Ele utiliza Next.js 15 configurado para exportação estática, permitindo que a aplicação seja empacotada pelo Electron.

## 📱 Funcionalidades

- **Dashboard de Administrador:** Gerenciamento de usuários, carros e checklists.
- **Checklist:** Verificação de sistemas do carro.
- **Balanceamento:** Cálculo de distribuição de peso e CG.
- **Reports:** Registro detalhado de sessões de teste.

## 💾 Banco de Dados Local (Dexie.js)

O frontend gerencia sua própria persistência de dados. A configuração está em `lib/db.ts`. 

### Sincronização
Embora o app seja focado no offline, a infraestrutura básica para sincronização futura (`synced` flag) foi mantida no `AuthContext.tsx`.

## 🛠️ Comandos Disponíveis

- `npm run dev`: Inicia o servidor de desenvolvimento na porta 3000.
- `npm run build`: Gera a exportação estática na pasta `out/`.
- `npm run lint`: Executa a verificação de código.

## 🎨 Estilização

O projeto utiliza **Tailwind CSS** para estilos e **Shadcn UI** para componentes de interface. Os temas (claro/escuro) são gerenciados via `next-themes`.

---

**Nota:** Para rodar a versão Desktop, utilize os comandos localizados na raiz do repositório.
