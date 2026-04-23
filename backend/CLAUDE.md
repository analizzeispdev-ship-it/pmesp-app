# Backend — Nuxt 3 / Nitro (API only)

> **REGRA CRÍTICA:** Sempre que criar, alterar ou remover qualquer arquivo neste diretório,
> atualize este CLAUDE.md na mesma sessão. Ele é lido no lugar dos arquivos reais para economizar tokens.

---

## Arquitetura

Nuxt 3 usado apenas como servidor de API (sem frontend, sem SSR).
Toda lógica de negócio vive em **classes de serviço** (`server/services/`).
Event handlers em `server/api/` são finos: validam entrada → chamam serviço → retornam resposta.

```
server/
├── api/
│   ├── auth/
│   │   ├── login.post.ts
│   │   └── change-password.post.ts
│   ├── users/
│   │   ├── index.get.ts
│   │   └── index.post.ts
│   ├── efetivo/
│   │   └── index.get.ts
│   ├── publicacoes/
│   │   ├── index.get.ts
│   │   └── index.post.ts
│   ├── viaturas/
│   │   ├── index.get.ts
│   │   ├── index.post.ts
│   │   └── [id]/
│   │       ├── encerrar.patch.ts
│   │       └── tripulacao.patch.ts
│   ├── apreensoes/
│   │   ├── index.get.ts     → GET /api/apreensoes — stats do mês (totais + rankGeral + rankPorItem)
│   │   ├── index.post.ts    → POST /api/apreensoes — registrar apreensão (usuario deve estar na viatura)
│   │   └── relatorio.get.ts → GET /api/apreensoes/relatorio — last 15 viaturas com apreensoes (p3/admin)
│   └── gestao/
│       └── efetivo/
│           ├── index.get.ts
│           └── [id]/
│               ├── promover.patch.ts
│               ├── advertencia.patch.ts
│               └── exonerar.patch.ts
├── constants/
│   └── graduacoes.ts
├── services/
│   └── ApreensaoService.ts  → getStats(), create(data), getRelatorio()
├── models/
│   ├── User.ts
│   ├── Publicacao.ts
│   ├── Viatura.ts
│   └── Apreensao.ts         → viaturaId, viaturaPrefixo, membros[], 7 campos numéricos de itens, origem, registradoPorId
├── middleware/
│   ├── 01.cors.ts
│   └── 02.rateLimit.ts
├── plugins/
│   └── seed.ts
└── utils/
    ├── db.ts
    ├── jwt.ts
    ├── rateLimit.ts
    └── auth.ts              → requireAuth(event) → JwtPayload; usado nos novos handlers
```

---

## Estado atual dos arquivos

### `nuxt.config.ts`
```ts
export default defineNuxtConfig({
  ssr: false,
  nitro: { preset: 'node-server', devProxy: {} },
  runtimeConfig: { mongoUri: '', jwtSecret: '' },
})
```
Variáveis injetadas em runtime via `NUXT_MONGO_URI` e `NUXT_JWT_SECRET`.

### `server/utils/db.ts`
Singleton de conexão Mongoose. Chama `useRuntimeConfig().mongoUri`.
Flag `connected` evita reconexão. Chamar `await connectDB()` no início de cada serviço/handler.

### `server/utils/jwt.ts`
Duas funções puras: `signToken(payload, secret)` → JWT 8h | `verifyToken(token, secret)` → JwtPayload.
Interface: `JwtPayload { id, username, role, cargo, graduacao }`.
Secret sempre vem de `useRuntimeConfig().jwtSecret` — nunca hardcodar.

### `server/utils/rateLimit.ts`
`checkRate(key, limit, windowMs)` — janela fixa em memória (`Map`).
Retorna `{ allowed, remaining, resetAt, retryAfter }`.
Limpeza automática de entradas expiradas a cada 10 min via `setInterval`.

### `server/middleware/01.cors.ts`
Seta headers CORS para `*`. Responde `204` para `OPTIONS` (preflight).

### `server/middleware/02.rateLimit.ts`
- `/api/auth/*` → 5 req / 15 min · chave: `ip:path`
- `/api/*` demais → 120 req / min · chave: `ip:api`
- Seta `X-RateLimit-*` e `Retry-After`. Lança `createError(429)`.

### `server/constants/graduacoes.ts`
Fonte de verdade para graduações e cargos. Exporta:
- `GRADUACOES[]` — `{ label, value, nickPrefix, roleName, grupo }`
- `CARGOS[]` — `{ label, value, description }`
- `getGraduacao(value)` — busca graduação pelo value
- `buildDisplayName(name, rg, graduacao)` → `"nickPrefix | nome - rg"`

Graduações (value numérico, 1=mais alto, 14=mais baixo):
`'14'` Sd 2° Cl, `'13'` Sd 1° Cl, `'12'` Cabo, `'11'` 3° Sgt, `'10'` 2° Sgt, `'9'` 1° Sgt,
`'8'` Subtenente, `'7'` Asp. Oficial (✯), `'6'` 2° Ten (✧), `'5'` 1° Ten (✧✧),
`'4'` Capitão (✧✧✧), `'3'` Major (✵✧✧), `'2'` Ten. Coronel (✵✵✧), `'1'` Coronel (✵✵✵)
Cargos: `padrao`, `p1` (RH), `p3` (Operacional), `p5` (Comunicação), `estagio`

### `server/models/User.ts`

Schema Mongoose:
```
username       String   unique, lowercase, trim, required
password       String   required (bcrypt hash, salt 12)
name           String   required
rg             String   default: ''
role           'admin' | 'supervisor' | 'officer'  default: 'officer'
cargo          'padrao' | 'p1' | 'p3' | 'p5' | 'estagio'  default: 'padrao'
graduacao      String   enum de GRADUACAO_VALUES  default: '14'
dataPromocao   Date     default: null
cursos         [ObjectId]  ref: 'Course'  default: []
advertencias   [{ descricao, data, aplicadoPor }]  max 3 (validator)  default: []
patrulhando    Boolean  default: false
ultimaPatrulha Date     default: null
badge          String   default: ''
firstAccess    Boolean  default: true
active         Boolean  default: true
timestamps: true
```
Hook `pre('save')`: faz hash bcrypt(12) apenas se `password` foi modificado.
Método: `comparePassword(plain) → Promise<boolean>` via `bcrypt.compare`.
Export: `const User = mongoose.models.User || mongoose.model('User', UserSchema)`

### `server/plugins/seed.ts`
Nitro plugin que roda no boot. Cria usuário admin se não existir:
- username: `admin` | password: `Admin@123` | role: `admin` | cargo: `p1` | graduacao: `'4'` (Capitão) | rg: `00001` | firstAccess: `true`

### `server/api/auth/login.post.ts`
`POST /api/auth/login` — público (rate limit cobre)
Body: `{ username, password }`
Retorna: `{ token, user: { id, username, name, rg, role, cargo, graduacao, dataPromocao, patrulhando, badge, firstAccess } }`
Erro 400 se campos faltando · 401 se inválido · nunca revelar qual campo está errado.

### `server/api/auth/change-password.post.ts`
`POST /api/auth/change-password` — requer Bearer token
Body: `{ newPassword, confirmPassword }`
Valida: mínimo 8 chars · senhas iguais.
Faz `bcrypt.hash(12)` manualmente (não passa pelo hook `pre('save')`).
Seta `firstAccess: false` via `findByIdAndUpdate`.
Retorna: `{ success: true, message }`

### `server/api/users/index.get.ts`
`GET /api/users` — requer Bearer token · role: `admin`
Retorna: `{ users: [...] }` sem campo `password` (projeção `{ password: 0 }`).
Ordenado por `name`.

### `server/api/efetivo/index.get.ts`
`GET /api/efetivo` — requer Bearer token (qualquer role)
Retorna: `{ officers: [...] }` com todos os campos exceto `password` e `__v`.
Ordenado por `name`. Apenas usuários `active: true`.

### `server/models/Publicacao.ts`
Schema Mongoose:
```
tipo           'aviso' | 'boletim'  required
titulo         String   default: ''
conteudo       String   default: ''
parte1–parte4  String   default: 'Sem alterações.'
autorId        ObjectId ref: 'User'  required
autorNome      String   required
autorRg        String   default: ''
autorGraduacao String   default: ''
autorCargo     String   default: ''
ativo          Boolean  default: true
timestamps: true
```

### `server/api/publicacoes/index.get.ts`
`GET /api/publicacoes` — requer Bearer token (qualquer role)
Retorna: `{ avisos: [...], boletins: [...] }` — ambos ordenados por `createdAt` desc.
Avisos: limit 50. Boletins: limit 20.

### `server/api/publicacoes/index.post.ts`
`POST /api/publicacoes` — requer Bearer token
Body aviso: `{ tipo: 'aviso', titulo, conteudo }`
Body boletim: `{ tipo: 'boletim', parte1?, parte2?, parte3?, parte4? }`
Autorização: aviso → `parseInt(graduacao) <= 7` ou admin. Boletim → `cargo === 'p1'` ou admin.
Snapshot do autor buscado no DB e salvo em `autorNome/Rg/Graduacao/Cargo`.
Retorna: `{ publicacao }`

### `server/api/gestao/efetivo/index.get.ts`
`GET /api/gestao/efetivo` — requer Bearer + cargo p1 ou admin
Query: `?exonerado=1` → retorna inativos. Sem query → retorna ativos.
Exclui admins. Ordenado por `{ graduacao: 1, name: 1 }`.
Retorna: `{ officers: [...] }`

### `server/api/gestao/efetivo/[id]/promover.patch.ts`
`PATCH /api/gestao/efetivo/:id/promover` — requer p1 ou admin
Body: `{ graduacao }` — deve ser valor válido de GRADUACAO_VALUES.
Atualiza `graduacao` + `dataPromocao = now`. Retorna `{ officer }`.

### `server/api/gestao/efetivo/[id]/advertencia.patch.ts`
`PATCH /api/gestao/efetivo/:id/advertencia` — requer p1 ou admin
Body: `{ descricao }`. Máximo 3 advertências — erro 400 se já tiver 3.
Push `{ descricao, data: now, aplicadoPor: payload.id }`. Retorna `{ officer }`.

### `server/api/gestao/efetivo/[id]/exonerar.patch.ts`
`PATCH /api/gestao/efetivo/:id/exonerar` — requer p1 ou admin
Não permite exonerar a si mesmo. Seta `active: false`. Retorna `{ officer }`.

### `server/models/Viatura.ts`
Schema Mongoose:
```
prefixo        String   required, trim
observacao     String   default: ''
status         'ativa' | 'encerrada'  default: 'ativa'
motorista      ObjectId ref: 'User'  required
chefeDeBarca   ObjectId ref: 'User'  required
auxiliar1–3    ObjectId ref: 'User'  default: null
abertaPor      ObjectId ref: 'User'  required
encerradaPor   ObjectId ref: 'User'  default: null
abertaEm       Date     default: Date.now
encerradaEm    Date     default: null
timestamps: true
```

### `server/api/viaturas/index.get.ts`
`GET /api/viaturas` — requer Bearer token (qualquer role)
Retorna: `{ viaturas: [...] }` — apenas `status: 'ativa'`, ordenadas por `abertaEm` desc.
Popula motorista, chefeDeBarca, auxiliar1–3 com `name rg graduacao cargo username`.

### `server/api/viaturas/index.post.ts`
`POST /api/viaturas` — requer Bearer + cargo p1 ou admin
Body: `{ prefixo, observacao?, motorista, chefeDeBarca, auxiliar1?, auxiliar2?, auxiliar3? }`
Valida: prefixo obrigatório, motorista/chefeDeBarca obrigatórios, sem IDs duplicados na barca.
Ao criar: `User.updateMany({ _id: { $in: ids } }, { patrulhando: true, ultimaPatrulha: now })`.
Retorna `{ viatura }` populada.

### `server/api/viaturas/[id]/tripulacao.patch.ts`
`PATCH /api/viaturas/:id/tripulacao` — requer estar na tripulação ou admin
Body: `{ motorista, chefeDeBarca, auxiliar1?, auxiliar2?, auxiliar3? }`
Calcula `addedIds` (novos na viatura) e `removedIds` (saíram). Verifica `addedIds` não estão patrulhando em outra viatura.
`updateMany` removedIds → `patrulhando: false`; addedIds → `patrulhando: true, ultimaPatrulha: now`.
Retorna `{ viatura }` populada.

### `server/utils/auth.ts`
`requireAuth(event)` — extrai e verifica Bearer token; retorna `JwtPayload`. Lança 401 se ausente/inválido.
Usado nos novos endpoints de apreensões. Handlers antigos ainda fazem inline auth.

### `server/models/Apreensao.ts`
Schema Mongoose:
```
viaturaId      ObjectId   ref: 'Viatura'  required
viaturaPrefixo String     required
membros        [{ userId, name, rg, graduacao }]  snapshot da tripulação no momento
armasFogo      Number     default: 0
drogas         Number     default: 0
explosivos     Number     default: 0
itensRoubados  Number     default: 0
armasBrancas   Number     default: 0
dinheiroSujo   Number     default: 0
municao        Number     default: 0
origem         String     default: ''
registradoPorId ObjectId  ref: 'User'  required
timestamps: true
```
Indexes: `{ createdAt: -1 }`, `{ viaturaId: 1 }`.

### `server/services/ApreensaoService.ts`
- `getStats(mes, ano)` → agrega período: totais por item + rankGeral (top 10 por total) + rankPorItem (top 5 por item)
- `getPatrulhaRank(mes, ano)` → top 10 officers por minutos patrulhados no período; usa viaturas que se sobrepõem ao mês
- `create({ viaturaId, userId, items, origem })` → verifica usuário na viatura via `$or` query, snapshot crew, cria Apreensao
- `getRelatorio()` → last 15 viaturas (qualquer status) + apreensoes de cada uma

### `server/api/apreensoes/index.get.ts`
`GET /api/apreensoes?mes=4&ano=2026` — qualquer role autenticado; query params opcionais (default: mês atual)
Retorna: `{ totais, rankGeral, rankPorItem }`

### `server/api/apreensoes/rank-patrulha.get.ts`
`GET /api/apreensoes/rank-patrulha?mes=4&ano=2026` — qualquer role autenticado
Retorna: `{ rank: [{ userId, name, rg, graduacao, total: minutos }] }` top 10 por minutos patrulhados no período

### `server/api/apreensoes/index.post.ts`
`POST /api/apreensoes` — qualquer role autenticado; backend verifica que user está na viatura ativa
Body: `{ viaturaId, origem?, armasFogo?, drogas?, explosivos?, itensRoubados?, armasBrancas?, dinheiroSujo?, municao? }`
Valida: ao menos um item > 0. Retorna `{ apreensao }`.

### `server/api/apreensoes/relatorio.get.ts`
`GET /api/apreensoes/relatorio` — requer cargo p3 ou admin
Retorna: `{ viaturas: [{ viaturaId, prefixo, status, abertaEm, encerradaEm, apreensoes[] }] }`

### `server/api/viaturas/[id]/encerrar.patch.ts`
`PATCH /api/viaturas/:id/encerrar` — requer p1 ou admin
Checa se viatura é ativa (400 se já encerrada).
Ao encerrar: `User.updateMany(...)` seta `patrulhando: false` em todos da barca.
Seta `status: 'encerrada'`, `encerradaPor`, `encerradaEm: now`.
Retorna `{ viatura }` populada.

### `server/api/users/index.post.ts`
`POST /api/users` — requer Bearer token · role: `admin` OU cargo: `p1`
Body: `{ username, name, rg?, role?, cargo?, graduacao?, dataPromocao?, badge? }`
Gera senha temporária aleatória: `Pmesp@XXXXXX`.
Retorna: `{ user: {...}, tempPassword }` — único momento em que a senha temporária é exposta.
Erro 409 se username já existe.

---

## Padrão de classe de serviço (usar ao criar novos domínios)

```typescript
// server/services/ExemploService.ts
import { connectDB } from '../utils/db'
import { Exemplo } from '../models/Exemplo'

export class ExemploService {
  static async findAll() {
    await connectDB()
    return Exemplo.find({ active: true }).select('-__v').sort({ name: 1 }).lean()
  }

  static async findById(id: string) {
    await connectDB()
    const doc = await Exemplo.findById(id).lean()
    if (!doc) throw createError({ statusCode: 404, message: 'Não encontrado' })
    return doc
  }

  static async create(data: unknown) {
    await connectDB()
    return Exemplo.create(data)
  }

  static async update(id: string, data: unknown) {
    await connectDB()
    const doc = await Exemplo.findByIdAndUpdate(id, data, { new: true }).lean()
    if (!doc) throw createError({ statusCode: 404, message: 'Não encontrado' })
    return doc
  }

  static async remove(id: string) {
    await connectDB()
    await Exemplo.findByIdAndUpdate(id, { active: false })
  }
}
```

Handler correspondente (fino):
```typescript
// server/api/exemplos/index.get.ts
import { ExemploService } from '../../services/ExemploService'
import { requireAuth } from '../../utils/auth'  // a criar

export default defineEventHandler(async (event) => {
  requireAuth(event, ['admin', 'supervisor'])
  return ExemploService.findAll()
})
```

---

## Utilitário `requireAuth` (criar quando necessário)

```typescript
// server/utils/auth.ts
import { verifyToken } from './jwt'

export function requireAuth(event: H3Event, roles?: string[]) {
  const header = getHeader(event, 'authorization')
  if (!header?.startsWith('Bearer ')) throw createError({ statusCode: 401, message: 'Não autorizado' })
  const config = useRuntimeConfig()
  const payload = verifyToken(header.slice(7), config.jwtSecret)
  if (roles?.length && !roles.includes(payload.role)) throw createError({ statusCode: 403, message: 'Acesso negado' })
  return payload
}
```
Ao criar este utilitário, refatorar os handlers existentes para usá-lo e atualizar este CLAUDE.md.

---

## Regras de otimização (obrigatórias)

| Situação | O que fazer |
|----------|------------|
| Leitura | Sempre `.lean()` — retorna POJO, sem overhead de documento Mongoose |
| Projeção | Sempre omitir `password` e `__v` — usar `.select('-password -__v')` ou projeção `{password:0}` |
| Listagem | Sempre paginar — `.limit(n).skip(offset)` |
| Campo buscado | `index: true` no Schema |
| Verificar existência | `.exists({})` em vez de `findOne` |
| Múltiplos writes | `bulkWrite()` — nunca loop com `.save()` |
| Nunca retornar senha | Regra absoluta, sem exceção, em nenhum endpoint |

## Convenção de middlewares

Nomear com prefixo numérico para garantir ordem de execução:
- `01.cors.ts` — CORS
- `02.rateLimit.ts` — Rate limiting
- `03+` — futuros (ex: logging, auth global)

## Dependências atuais

```json
{
  "nuxt": "^3.11.2",
  "mongoose": "^8.3.4",
  "bcryptjs": "^2.4.3",
  "jsonwebtoken": "^9.0.2"
}
```
