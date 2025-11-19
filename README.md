# SingJam! API

API em TypeScript + Fastify para o catálogo de músicas usadas em máquinas de karaokê. Permite buscas por título, artista ou trecho da letra, navegação por categorias, área administrativa para CRUD e registro de eventos para ranking de populares.

## Visão Geral
- Público: busca e navegação sem login.
- Admin: autenticação por JWT para cadastrar/editar/remover músicas e gerenciar admins.
- Métricas: eventos de busca e cliques em categorias para análise e ranking.
- Sem DDL: conecta em MySQL existente (tabelas já criadas).

## Stack
- Node.js LTS, TypeScript, Fastify 4
- MySQL (`mysql2/promise`) com queries manuais
- Validação com Zod, Auth JWT, `bcryptjs`
- Segurança: Helmet, CORS (localhost), Rate limiting por rota
- Documentação: OpenAPI 3 (Swagger UI)

## Estrutura de Pastas
```
src/
  app.ts                 # bootstrap do servidor
  config/
    env.ts               # envs + validação
    cors.ts              # CORS (localhost)
    swagger.ts           # setup Swagger/OpenAPI
  db/pool.ts             # pool MySQL + ping
  docs/schemas.ts        # componentes OpenAPI reutilizáveis
  middlewares/
    auth.ts              # guard JWT
    error.ts             # erros e notFound
    validate.ts          # validação com Zod
  modules/
    auth/                # login/forgot/reset/criar admin
    musicas/             # CRUD admin + buscas e detalhe
    categorias/          # listagem e músicas por categoria
    events/              # gravação de eventos e populares
  utils/pagination.ts    # paginação e ordenação
```

## Requisitos
- Node.js 18+ (LTS)
- MySQL 8.x (BD existente, com as tabelas fornecidas)

## Configuração
1) Instalar dependências
```
npm install
```
2) Variáveis de ambiente
- Copie `.env.example` para `.env` e ajuste conforme seu ambiente:
  - `PORT` (default 3000)
  - `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASS`, `DB_NAME`
  - `JWT_SECRET` (obrigatório trocar em produção)
  - `JWT_EXPIRES_IN` (default 1800s)
  - `CORS_ORIGINS` (default localhost)
  - `RESET_TOKEN_TTL` (TTL do token de reset em memória)

## Executando
- Desenvolvimento (hot reload):
```
npm run dev
```
- Produção:
```
npm run build
npm start
```
- Healthcheck: `GET http://localhost:3000/health`
- Swagger UI: `GET http://localhost:3000/docs`

## Decisões Importantes
- TypeScript + Fastify
- Consultas SQL manuais (`mysql2`) sem DDL/migrations
- Buscas por título/artista/letra com `LIKE` (contains) e collation acento/case-insensitive
- Reset de senha com token em memória (volátil) — sem tabela `PasswordReset`
- CORS restrito a localhost/127.0.0.1

## Banco de Dados (esperado)
- Tabelas: `Administrador`, `Musica`, `Artista`, `MusicaArtista`, `Categorias`, `MusicaCategoria`, `Historico`, `HistoricoMusicas`
- Relacionamentos N:N para artistas e categorias; histórico vincula buscas/cliques às músicas
- A API não cria/alterar tabelas; usa apenas SELECT/INSERT/UPDATE/DELETE

## Autenticação (Admins)
- Login: `POST /admin/login` body `{ email, senha }` → `200 { token, expiresIn }`
- Bearer JWT obrigatório em rotas `/admin/*` (exceto login/forgot/reset)
- Logout é stateless (204). Opcional blacklist não habilitada.
- Reset de senha: `POST /admin/forgot-password` (204) gera token em memória e loga no servidor; `POST /admin/reset-password` usa `{ token, novaSenha }`.
- Criação de admin: `POST /admin` (protegida). Para o primeiro admin, insira via SQL diretamente ou autentique com um existente.

## Endpoints Principais
- Admin
  - `POST /admin/login`
  - `POST /admin/forgot-password`
  - `POST /admin/reset-password`
  - `POST /admin/logout`
  - `POST /admin` (criar admin)
  - `POST /admin/musicas` (criar)
  - `PUT /admin/musicas/:id` (atualizar)
  - `DELETE /admin/musicas/:id` (remover)
  - `GET /admin/musicas?page=&limit=&sort=titulo|codigo_musica&order=asc|desc`
- Público
  - `GET /musicas/search?titulo=...|artista=...|letra=...&page=&limit=`
  - `GET /musicas/:id`
  - `GET /categorias`
  - `GET /categorias/:id/musicas?page=&limit=`
  - `GET /musicas/populares?limit=10`
- Eventos
  - `POST /events/search` body `{ termo, resultadoEncontrado, musicaId? }`
  - `POST /events/category-click` body `{ categoriaId }`

Consulte contratos completos, parâmetros e exemplos no Swagger em `/docs`.

## Exemplos Rápidos (cURL)
- Login
```
curl -X POST http://localhost:3000/admin/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@exemplo.com","senha":"senha123"}'
```
- Busca por título
```
curl 'http://localhost:3000/musicas/search?titulo=evid'
```
- Criar música (admin)
```
curl -X POST http://localhost:3000/admin/musicas \
  -H 'Authorization: Bearer <JWT>' \
  -H 'Content-Type: application/json' \
  -d '{"titulo":"Evidências","codigo_musica":"K-12345","artistaIds":[1],"categoriaIds":[3]}'
```

## Segurança e Limites
- Helmet habilitado; CORS restrito a localhost por padrão
- Rate limit aplicado em `/musicas/search`, `/events/*`, `/musicas/populares`
- Senhas com `bcryptjs`; JWT HS256; troque o `JWT_SECRET` em produção

## Troubleshooting
- Erro de conexão MySQL: verifique `DB_HOST/PORT/USER/PASS/NAME`
- 401 nas rotas admin: garanta que enviou `Authorization: Bearer <token>` e que o token não expirou
- Reset de senha: tokens são voláteis; reiniciar o servidor invalida tokens pendentes

## Licença
- Uso interno/educacional. Sem licença pública definida.
