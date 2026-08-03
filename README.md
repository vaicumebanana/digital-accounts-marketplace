# Digital Accounts Marketplace

Uma plataforma premium de venda de contas digitais com design glassmorphism, sistema de pagamentos integrado e gerenciamento completo.

## 🚀 Características

### E-Commerce
- **Catálogo de Produtos**: Categorias, busca inteligente, filtros por preço, idioma e plataforma
- **Carrinho de Compras**: Gerenciamento completo com atualização em tempo real
- **Sistema de Cupons**: Desconto percentual/fixo, validade, uso único, escopo por categoria/produto
- **Checkout**: Interface intuitiva com resumo de pedido

### Pagamentos
- **PIX**: Integração com provedores de PIX
- **PayPal**: Suporte para USD, EUR, BRL
- **Criptomoedas**: BTC, ETH, USDT
- **Entrega Automática**: Contas entregues automaticamente após confirmação de pagamento

### Painel do Cliente
- **Dashboard Pessoal**: Histórico de pedidos, downloads, favoritos
- **Gerenciamento de Conta**: Perfil, configurações de segurança
- **Wishlist**: Salvar produtos favoritos
- **Notificações**: Atualizações em tempo real

### Suporte
- **Sistema de Tickets**: Criação e rastreamento de tickets
- **Chat em Tempo Real**: Comunicação com suporte
- **Anexos**: Upload de arquivos e imagens
- **Notas Internas**: Anotações privadas para admins

### Admin
- **Dashboard com Analytics**: Gráficos de receita, vendas, usuários
- **Gerenciamento de Produtos**: CRUD completo
- **Gerenciamento de Pedidos**: Rastreamento e status
- **Gerenciamento de Usuários**: Controle de acesso por role
- **Gerenciamento de Cupons**: Criação e edição

### Design
- **Glassmorphism**: Efeitos de blur e transparência
- **Tema Claro/Escuro**: Toggle de tema com persistência
- **Responsivo**: Otimizado para mobile, tablet e desktop
- **Animações Suaves**: Transições fluidas e micro-interações
- **Premium UI**: Componentes shadcn/ui integrados

### Segurança
- **Autenticação OAuth**: Integração com Manus OAuth
- **JWT com Refresh Tokens**: Gerenciamento de sessão
- **2FA**: Autenticação de dois fatores (estrutura pronta)
- **Rate Limiting**: Proteção contra abuso
- **CSRF/XSS Protection**: Headers de segurança
- **IP Blocking**: Sistema de bloqueio de IP
- **Activity Logging**: Registro de ações do usuário

### SEO
- **Meta Tags**: Títulos, descrições e palavras-chave
- **Schema.org**: Dados estruturados
- **Sitemap**: Gerado automaticamente
- **Open Graph**: Compartilhamento em redes sociais

## 📋 Requisitos

- Node.js 22.x ou superior
- pnpm 10.x ou superior
- MySQL 8.0 ou superior (ou TiDB)

## 🛠️ Instalação

```bash
# Clone o repositório
git clone https://github.com/vaicumebanana/digital-accounts-marketplace.git
cd digital-accounts-marketplace

# Instale as dependências
pnpm install

# Configure as variáveis de ambiente
cp .env.example .env.local

# Execute as migrações do banco de dados
pnpm drizzle-kit generate
pnpm drizzle-kit migrate

# Inicie o servidor de desenvolvimento
pnpm dev
```

## 🚀 Deploy no Vercel

### Opção 1: Deploy Automático (Recomendado)

1. Acesse [Vercel.com](https://vercel.com)
2. Clique em "New Project"
3. Selecione este repositório GitHub
4. Configure as variáveis de ambiente:
   - `DATABASE_URL`: String de conexão MySQL
   - `JWT_SECRET`: Chave secreta para JWT
   - `VITE_APP_ID`: ID da aplicação OAuth
   - `OAUTH_SERVER_URL`: URL do servidor OAuth
   - Outras variáveis conforme necessário
5. Clique em "Deploy"

### Opção 2: Deploy Manual

```bash
# Instale o Vercel CLI
npm i -g vercel

# Faça login
vercel login

# Deploy
vercel
```

## 📁 Estrutura do Projeto

```
digital-accounts-marketplace/
├── client/                 # Frontend React
│   ├── src/
│   │   ├── pages/         # Páginas da aplicação
│   │   ├── components/    # Componentes reutilizáveis
│   │   ├── hooks/         # Custom hooks
│   │   ├── lib/           # Utilitários
│   │   └── index.css      # Estilos globais
│   └── public/            # Arquivos estáticos
├── server/                 # Backend Express
│   ├── routers/           # Rotas tRPC
│   ├── db.ts              # Helpers de banco de dados
│   └── _core/             # Configuração interna
├── drizzle/               # Migrações de banco de dados
├── shared/                # Código compartilhado
├── vercel.json            # Configuração Vercel
└── package.json           # Dependências
```

## 🔧 Configuração de Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```env
# Database
DATABASE_URL=mysql://user:password@localhost:3306/marketplace

# JWT
JWT_SECRET=sua_chave_secreta_aqui

# OAuth
VITE_APP_ID=seu_app_id
OAUTH_SERVER_URL=https://api.oauth.provider.com
VITE_OAUTH_PORTAL_URL=https://oauth.provider.com

# Outros
VITE_APP_TITLE=Digital Accounts Marketplace
VITE_ANALYTICS_ENDPOINT=https://analytics.example.com
VITE_ANALYTICS_WEBSITE_ID=seu_website_id
```

## 🧪 Testes

```bash
# Execute os testes
pnpm test

# Com cobertura
pnpm test:coverage
```

## 📦 Build para Produção

```bash
# Build
pnpm build

# Inicie o servidor de produção
pnpm start
```

## 🤝 Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo LICENSE para detalhes.

## 📞 Suporte

Para suporte, abra uma issue no repositório ou entre em contato através da página de contato da aplicação.

## 🎯 Roadmap

- [ ] Integração com provedores de pagamento reais
- [ ] Sistema de avaliações e comentários
- [ ] Recomendações personalizadas com IA
- [ ] Programa de afiliados
- [ ] API pública para integrações
- [ ] App mobile (React Native)
- [ ] Suporte multilíngue completo

## 🙏 Agradecimentos

- [React](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [tRPC](https://trpc.io)
- [Drizzle ORM](https://orm.drizzle.team)
- [shadcn/ui](https://ui.shadcn.com)
