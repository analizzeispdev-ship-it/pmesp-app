# Frontend — Vue 3 + Vite (SPA)

> **REGRA CRÍTICA:** Sempre que criar, alterar ou remover qualquer arquivo neste diretório,
> atualize este CLAUDE.md na mesma sessão. Ele é lido no lugar dos arquivos reais para economizar tokens.

---

## Regra principal: TUDO É COMPONENTE

Qualquer elemento que apareça em mais de um lugar, ou que tenha lógica/estilo próprio, **é um componente**.
Nenhuma view deve ter mais de ~150 linhas de template. Se passou disso, extraia componentes.
Nunca duplicar markup entre views — extrair para componente de layout ou UI.

---

## Estrutura de pastas

```
src/
├── assets/
│   └── main.css                    → CSS global, variáveis CSS, reset
├── components/
│   ├── ui/                         → Componentes genéricos reutilizáveis
│   │   ├── BaseButton.vue          → (a criar) variantes: primary, danger, ghost; prop loading
│   │   ├── BaseInput.vue           → (a criar) label, erro, slot ícone, prop type
│   │   ├── BaseModal.vue           → (a criar) overlay, título, slot conteúdo, emit close
│   │   ├── BaseAlert.vue           → (a criar) variantes: error, success, warning, info
│   │   ├── BaseSpinner.vue         → (a criar) spinner de carregamento
│   │   ├── BaseBadge.vue           → (a criar) badge de status/role
│   │   ├── BaseCard.vue            → (a criar) card com sombra e padding padrão
│   │   └── BaseTable.vue           → (a criar) tabela paginada com slot de colunas
│   └── layout/
│       ├── AppSidebar.vue          → (a criar) extrair sidebar do DashboardView
│       └── AppTopbar.vue           → (a criar) extrair topbar do DashboardView
├── composables/
│   └── useApi.js                   → wrapper fetch com auth header e tratamento de erros
├── router/
│   └── index.js                    → rotas + guard beforeEach
├── stores/
│   └── auth.js                     → Pinia store de autenticação
└── views/
    ├── LoginView.vue
    ├── ChangePasswordView.vue
    └── DashboardView.vue
```

---

## Estado atual dos arquivos

### `src/main.js`
```js
createApp(App) → use(createPinia()) → use(router) → mount('#app')
```
Ordem importa: Pinia antes do router (router guards usam stores).

### `src/App.vue`
Apenas `<RouterView />`. Sem estado, sem lógica.

### `src/assets/main.css`
Reset global (`box-sizing`, `margin`, `padding`). Variáveis CSS:
```css
--primary: #1a3a6b       /* azul PMESP */
--primary-dark: #0f2347
--primary-light: #2a5298
--accent: #c8a951        /* dourado */
--accent-light: #e6c96e
--bg-dark: #0a0f1e
--bg-light: #f0f4f8
--surface: #ffffff
--error: #dc2626
--error-bg: #fef2f2
--success: #16a34a
--success-bg: #f0fdf4
--text: #1e293b
--text-muted: #64748b
--border: #e2e8f0
```
Fonte: `Inter` (Google Fonts via index.html), fallback `Segoe UI`.

---

### `src/stores/auth.js`
Store Pinia `auth`. Persiste em `localStorage` (chaves: `pmesp_token`, `pmesp_user`).

**State:** `token: string|null`, `user: object|null`

**Getters:**
- `isAuthenticated` → `!!token`
- `isAdmin` → `user.role === 'admin'`
- `needsPasswordChange` → `!!user.firstAccess`

**Actions:**
- `setAuth(token, user)` → persiste token e user
- `markFirstAccessDone()` → seta `user.firstAccess = false` e persiste
- `logout()` → limpa state e localStorage

**User object:**
```js
{ id, username, name, role, rank, badge, firstAccess }
```

---

### `src/composables/useApi.js`
`useApi()` → retorna `{ get, post, put, delete }`.
Base URL: `import.meta.env.VITE_API_URL || 'http://localhost:4000'`.
Injeta `Authorization: Bearer <token>` automaticamente se `auth.token` existir.
Em erro 401: chama `auth.logout()` e redireciona `/login`.
Erros expõem `error.status` e `error.retryAfter` (do header `Retry-After`).

---

### `src/router/index.js`
Histórico: `createWebHistory()`.

| Rota | Nome | Componente | Meta |
|------|------|-----------|------|
| `/login` | `Login` | `LoginView` | `public: true` |
| `/primeiro-acesso` | `ChangePassword` | `ChangePasswordView` | `requiresAuth: true` |
| `/` | `Dashboard` | `DashboardView` | `requiresAuth: true` |

**Guard `beforeEach`:**
1. Rota pública → passa
2. Sem token → `/login`
3. `firstAccess=true` + não é `ChangePassword` → `/primeiro-acesso`
4. `firstAccess=false` + é `ChangePassword` → `/`

---

### `src/views/LoginView.vue`
Layout split: painel esquerdo (brand azul escuro + shield SVG PMESP) · painel direito (formulário).
**State local:** `form {username, password}`, `loading`, `error`, `showPwd`, `blocked` (countdown 429).
**Lógica:** `handleLogin()` → `api.post('/api/auth/login')` → `auth.setAuth()` → redireciona.
Em erro 429: `startCountdown(retryAfter)` — botão fica desabilitado com timer regressivo visível.
Responsivo: abaixo de 768px empilha verticalmente.

### `src/views/ChangePasswordView.vue`
Tela de primeiro acesso. Card centralizado em fundo escuro.
**State local:** `form {newPassword, confirmPassword}`, `show {new, confirm}`, `loading`, `error`, `successMsg`.
**Computed:** `rules {length, upper, number, special}`, `strength` (0–4), `canSubmit`.
**Lógica:** `handleSubmit()` → `api.post('/api/auth/change-password')` → `auth.markFirstAccessDone()` → redireciona `/` após 1.5s.
Exibe: indicador de força da senha (4 segmentos coloridos), checklist de regras, hint de coincidir.

### `src/views/DashboardView.vue`
Layout: sidebar fixa (colapsável) + área principal (topbar + conteúdo).
**State local:** `sidebarCollapsed`, `currentTime`, `currentDate` (relógio atualizado a cada 1s via `setInterval`).
**Computed:** `firstName`, `initials` (2 letras do nome), `roleLabel`, `greeting` (bom dia/tarde/noite).
**Sidebar:** shield PMESP, navegação (Dashboard ativo; Efetivo, Ocorrências, Viaturas, Relatórios, Configurações marcados como "Em breve"), avatar do usuário, botão logout.
**Conteúdo:** banner de boas-vindas, 4 cards de stats (placeholder `—`), info box de sistema em implantação.
**Logout:** `auth.logout()` → `router.push('/login')`.

---

## Regras de componentes (obrigatórias)

- **Props tipadas** com `defineProps` e tipos explícitos.
- **Emits declarados** com `defineEmits([...])`.
- **Sem lógica de negócio** em componentes UI — apenas apresentação e eventos.
- **Sem chamadas de API** em componentes — API fica em composables ou stores.
- **Estilos `scoped`** — nunca estilos globais dentro de componentes.
- **Nomes PascalCase** nos arquivos e no template (`<BaseButton />`).
- **Uma responsabilidade** por componente — se faz duas coisas, separe.
- **Sem hex hardcoded** no CSS — sempre usar variáveis CSS de `main.css`.

## Regras de stores

- Uma store por domínio: `auth`, `usuarios`, `ocorrencias`, `viaturas`, etc.
- Views e componentes consomem store — não fazem fetch direto.
- Estado de `loading` e `error` de operações assíncronas ficam na store, não em `ref` local da view.

## Regras de composables

- Prefixo `use` obrigatório.
- Encapsulam lógica repetida entre múltiplos componentes/views.
- Nunca duplicar chamada de API — criar composable ou mover para store.

## Breakpoint responsivo

Principal: `768px`. Mobile-first. Sidebar colapsa automaticamente abaixo de 768px.

## Dependências atuais

```json
{
  "vue": "^3.4.21",
  "vue-router": "^4.3.2",
  "pinia": "^2.1.7"
}
```
Sem biblioteca de UI externa (Tailwind, Element Plus, etc.) — CSS próprio com variáveis.
