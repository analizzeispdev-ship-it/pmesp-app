<template>
  <div class="layout">
    <!-- Sidebar -->
    <aside class="sidebar" :class="{ collapsed: sidebarCollapsed }">
      <div class="sidebar-header">
        <svg class="sidebar-shield" viewBox="0 0 100 120" xmlns="http://www.w3.org/2000/svg">
          <path d="M50 4L6 24V60C6 86 26 107 50 118C74 107 94 86 94 60V24L50 4Z" fill="#0f2347" stroke="#c8a951" stroke-width="2.5" />
          <path d="M50 28L54.8 43H70L58 51.5L62.8 66.5L50 58L37.2 66.5L42 51.5L30 43H45.2L50 28Z" fill="#c8a951" />
        </svg>
        <div v-if="!sidebarCollapsed" class="sidebar-title">
          <span class="title-pmesp">PMESP</span>
          <span class="title-sub">Gerenciamento</span>
        </div>
        <button class="collapse-btn" @click="sidebarCollapsed = !sidebarCollapsed" :title="sidebarCollapsed ? 'Expandir' : 'Recolher'">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path v-if="!sidebarCollapsed" d="M15 18l-6-6 6-6" />
            <path v-else d="M9 18l6-6-6-6" />
          </svg>
        </button>
      </div>

      <nav class="sidebar-nav">
        <RouterLink to="/" class="nav-item" :class="{ active: route.path === '/' }" :title="sidebarCollapsed ? 'Dashboard' : ''">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
            <rect x="14" y="14" width="7" height="7" rx="1" />
          </svg>
          <span v-if="!sidebarCollapsed">Dashboard</span>
        </RouterLink>

        <div v-if="!sidebarCollapsed" class="nav-section">Operacional</div>

        <a class="nav-item disabled" title="Em desenvolvimento">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
          <span v-if="!sidebarCollapsed">Efetivo</span>
          <span v-if="!sidebarCollapsed" class="badge-soon">Em breve</span>
        </a>

        <a class="nav-item disabled" title="Em desenvolvimento">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          <span v-if="!sidebarCollapsed">Ocorrências</span>
          <span v-if="!sidebarCollapsed" class="badge-soon">Em breve</span>
        </a>

        <a class="nav-item disabled" title="Em desenvolvimento">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="1" y="3" width="15" height="13" rx="2" />
            <path d="M16 8h4l3 3v5h-7V8z" />
            <circle cx="5.5" cy="18.5" r="2.5" />
            <circle cx="18.5" cy="18.5" r="2.5" />
          </svg>
          <span v-if="!sidebarCollapsed">Viaturas</span>
          <span v-if="!sidebarCollapsed" class="badge-soon">Em breve</span>
        </a>

        <a class="nav-item disabled" title="Em desenvolvimento">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10 9 9 9 8 9" />
          </svg>
          <span v-if="!sidebarCollapsed">Relatórios</span>
          <span v-if="!sidebarCollapsed" class="badge-soon">Em breve</span>
        </a>

        <template v-if="auth.isAdmin">
          <div v-if="!sidebarCollapsed" class="nav-section">Administração</div>
          <a class="nav-item disabled" title="Em desenvolvimento">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14" />
            </svg>
            <span v-if="!sidebarCollapsed">Configurações</span>
            <span v-if="!sidebarCollapsed" class="badge-soon">Em breve</span>
          </a>
        </template>
      </nav>

      <!-- User info + logout -->
      <div class="sidebar-footer">
        <div class="user-avatar">{{ initials }}</div>
        <div v-if="!sidebarCollapsed" class="user-details">
          <span class="user-name">{{ auth.user?.name }}</span>
          <span class="user-rank">{{ auth.user?.rank || roleLabel }}</span>
        </div>
        <button v-if="!sidebarCollapsed" class="logout-btn" @click="logout" title="Sair">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
        </button>
      </div>
    </aside>

    <!-- Main content -->
    <div class="main">
      <!-- Top bar -->
      <header class="topbar">
        <div class="topbar-left">
          <h1 class="page-title">Dashboard</h1>
          <span class="page-breadcrumb">Início</span>
        </div>
        <div class="topbar-right">
          <div class="datetime">
            <span class="date">{{ currentDate }}</span>
            <span class="time">{{ currentTime }}</span>
          </div>
          <div class="topbar-user">
            <div class="topbar-avatar">{{ initials }}</div>
            <div class="topbar-user-info">
              <span class="topbar-name">{{ auth.user?.name }}</span>
              <span class="topbar-role">{{ roleLabel }}</span>
            </div>
          </div>
        </div>
      </header>

      <!-- Content -->
      <main class="content">
        <!-- Welcome banner -->
        <div class="welcome-banner">
          <div class="welcome-text">
            <h2>Bem-vindo, {{ firstName }}!</h2>
            <p>{{ greeting }} Você está acessando o Sistema de Gerenciamento da PMESP.</p>
          </div>
          <div class="welcome-badge">
            <svg viewBox="0 0 100 120" xmlns="http://www.w3.org/2000/svg" style="width:60px;opacity:0.15">
              <path d="M50 4L6 24V60C6 86 26 107 50 118C74 107 94 86 94 60V24L50 4Z" fill="white" />
              <path d="M50 28L54.8 43H70L58 51.5L62.8 66.5L50 58L37.2 66.5L42 51.5L30 43H45.2L50 28Z" fill="white" />
            </svg>
          </div>
        </div>

        <!-- Stats cards -->
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon blue">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <div class="stat-info">
              <span class="stat-value">—</span>
              <span class="stat-label">Efetivo de Serviço</span>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon red">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </div>
            <div class="stat-info">
              <span class="stat-value">—</span>
              <span class="stat-label">Ocorrências Abertas</span>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon green">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="1" y="3" width="15" height="13" rx="2" />
                <path d="M16 8h4l3 3v5h-7V8z" />
                <circle cx="5.5" cy="18.5" r="2.5" />
                <circle cx="18.5" cy="18.5" r="2.5" />
              </svg>
            </div>
            <div class="stat-info">
              <span class="stat-value">—</span>
              <span class="stat-label">Viaturas em Patrulha</span>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon gold">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
              </svg>
            </div>
            <div class="stat-info">
              <span class="stat-value">—</span>
              <span class="stat-label">Ocorrências Hoje</span>
            </div>
          </div>
        </div>

        <!-- Info box -->
        <div class="info-box">
          <div class="info-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <div>
            <p class="info-title">Sistema em implantação</p>
            <p class="info-desc">
              O sistema está em fase inicial. Os módulos de Efetivo, Ocorrências, Viaturas e Relatórios
              serão disponibilizados em breve. Utilize o menu lateral para navegar quando os módulos forem liberados.
            </p>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const route = useRoute()
const router = useRouter()

const sidebarCollapsed = ref(false)
const currentTime = ref('')
const currentDate = ref('')

const firstName = computed(() => auth.user?.name?.split(' ')[0] || 'Policial')

const initials = computed(() => {
  const parts = (auth.user?.name || 'U').split(' ')
  return parts.length >= 2
    ? parts[0][0] + parts[parts.length - 1][0]
    : parts[0][0]
})

const roleLabel = computed(() => {
  const map = { admin: 'Administrador', supervisor: 'Supervisor', officer: 'Policial Militar' }
  return map[auth.user?.role] || ''
})

const greeting = computed(() => {
  const h = new Date().getHours()
  if (h < 12) return 'Bom dia!'
  if (h < 18) return 'Boa tarde!'
  return 'Boa noite!'
})

function updateClock() {
  const now = new Date()
  currentTime.value = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  currentDate.value = now.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })
}

let timer
onMounted(() => {
  updateClock()
  timer = setInterval(updateClock, 1000)
})

onBeforeUnmount(() => clearInterval(timer))

function logout() {
  auth.logout()
  router.push('/login')
}
</script>

<style scoped>
.layout {
  display: flex;
  min-height: 100vh;
  background: #f0f4f8;
}

/* ── Sidebar ── */
.sidebar {
  width: 260px;
  background: linear-gradient(180deg, #1a3a6b 0%, #0f2347 100%);
  display: flex;
  flex-direction: column;
  transition: width 0.25s ease;
  flex-shrink: 0;
  position: sticky;
  top: 0;
  height: 100vh;
}

.sidebar.collapsed {
  width: 72px;
}

.sidebar-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1.25rem 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.sidebar-shield {
  width: 36px;
  height: auto;
  flex-shrink: 0;
  filter: drop-shadow(0 2px 6px rgba(200, 169, 81, 0.3));
}

.sidebar-title {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.title-pmesp {
  font-size: 1.1rem;
  font-weight: 800;
  color: #c8a951;
  letter-spacing: 0.2em;
  line-height: 1;
}

.title-sub {
  font-size: 0.65rem;
  color: rgba(255, 255, 255, 0.45);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-top: 2px;
}

.collapse-btn {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.4);
  cursor: pointer;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  transition: color 0.15s;
  flex-shrink: 0;
}

.collapse-btn svg {
  width: 18px;
  height: 18px;
}

.collapse-btn:hover {
  color: rgba(255, 255, 255, 0.8);
}

.sidebar-nav {
  flex: 1;
  padding: 1rem 0;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.nav-section {
  font-size: 0.65rem;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: rgba(255, 255, 255, 0.3);
  padding: 0.75rem 1.25rem 0.25rem;
  white-space: nowrap;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.7rem 1.25rem;
  color: rgba(255, 255, 255, 0.65);
  border-radius: 0;
  transition: background 0.15s, color 0.15s;
  cursor: pointer;
  white-space: nowrap;
  border-left: 3px solid transparent;
  text-decoration: none;
}

.nav-item svg {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}

.nav-item:hover:not(.disabled) {
  background: rgba(255, 255, 255, 0.07);
  color: white;
}

.nav-item.active {
  background: rgba(200, 169, 81, 0.12);
  color: #c8a951;
  border-left-color: #c8a951;
}

.nav-item.disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.badge-soon {
  margin-left: auto;
  font-size: 0.6rem;
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.45);
  padding: 0.15rem 0.5rem;
  border-radius: 999px;
  white-space: nowrap;
}

.sidebar-footer {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #c8a951;
  color: #0f2347;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  font-weight: 700;
  flex-shrink: 0;
}

.user-details {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.user-name {
  font-size: 0.8rem;
  font-weight: 600;
  color: white;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-rank {
  font-size: 0.68rem;
  color: rgba(255, 255, 255, 0.45);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.logout-btn {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.35);
  cursor: pointer;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  transition: color 0.15s;
  flex-shrink: 0;
}

.logout-btn svg {
  width: 18px;
  height: 18px;
}

.logout-btn:hover {
  color: #ef4444;
}

/* ── Main ── */
.main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

/* Topbar */
.topbar {
  background: white;
  border-bottom: 1px solid #e2e8f0;
  padding: 0 1.75rem;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  position: sticky;
  top: 0;
  z-index: 10;
}

.topbar-left {
  display: flex;
  align-items: baseline;
  gap: 0.75rem;
}

.page-title {
  font-size: 1.2rem;
  font-weight: 700;
  color: #1a3a6b;
}

.page-breadcrumb {
  font-size: 0.8rem;
  color: #94a3b8;
}

.topbar-right {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.datetime {
  text-align: right;
  display: flex;
  flex-direction: column;
}

.date {
  font-size: 0.7rem;
  color: #94a3b8;
  text-transform: capitalize;
}

.time {
  font-size: 0.85rem;
  font-weight: 600;
  color: #1a3a6b;
  font-variant-numeric: tabular-nums;
}

.topbar-user {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.topbar-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #1a3a6b;
  color: #c8a951;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  font-weight: 700;
}

.topbar-user-info {
  display: flex;
  flex-direction: column;
}

.topbar-name {
  font-size: 0.85rem;
  font-weight: 600;
  color: #1e293b;
}

.topbar-role {
  font-size: 0.7rem;
  color: #94a3b8;
}

/* Content */
.content {
  padding: 2rem 1.75rem;
  flex: 1;
}

/* Welcome banner */
.welcome-banner {
  background: linear-gradient(135deg, #1a3a6b, #0f2347);
  border-radius: 16px;
  padding: 1.75rem 2rem;
  margin-bottom: 1.75rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: white;
  position: relative;
  overflow: hidden;
}

.welcome-text h2 {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 0.4rem;
}

.welcome-text p {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.65);
}

.welcome-badge {
  flex-shrink: 0;
}

/* Stats grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1.75rem;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 1.25rem 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  border: 1px solid #f1f5f9;
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-icon svg {
  width: 22px;
  height: 22px;
}

.stat-icon.blue { background: #eff6ff; color: #1a3a6b; }
.stat-icon.red  { background: #fef2f2; color: #dc2626; }
.stat-icon.green { background: #f0fdf4; color: #16a34a; }
.stat-icon.gold { background: #fffbeb; color: #b45309; }

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 1.75rem;
  font-weight: 700;
  color: #1e293b;
  line-height: 1;
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 0.78rem;
  color: #94a3b8;
}

/* Info box */
.info-box {
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  border-radius: 12px;
  padding: 1.25rem 1.5rem;
  display: flex;
  align-items: flex-start;
  gap: 1rem;
}

.info-icon {
  color: #1a3a6b;
  flex-shrink: 0;
  margin-top: 1px;
}

.info-icon svg {
  width: 20px;
  height: 20px;
}

.info-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: #1a3a6b;
  margin-bottom: 0.3rem;
}

.info-desc {
  font-size: 0.825rem;
  color: #3b82f6;
  line-height: 1.6;
}

/* Responsive */
@media (max-width: 768px) {
  .sidebar {
    width: 72px;
  }

  .sidebar-title,
  .user-details,
  .logout-btn,
  .nav-section,
  .badge-soon {
    display: none;
  }

  .topbar-right {
    gap: 0.75rem;
  }

  .datetime { display: none; }
  .topbar-user-info { display: none; }
}
</style>
