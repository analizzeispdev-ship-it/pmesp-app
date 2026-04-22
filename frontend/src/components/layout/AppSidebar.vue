<template>
  <aside class="sidebar">
    <div class="sidebar-header">
      <div class="brand">
        <div class="brand-icon">
          <img src="@/assets/images/logo-pmsp.png" alt="Logo PMESP" />
        </div>
        <div class="brand-text">
          <span class="brand-unit">PMESP • RP</span>
          <span class="brand-name">Centro de Comando</span>
        </div>
      </div>
    </div>

    <nav class="sidebar-nav">
      <RouterLink to="/" class="nav-item" :class="{ active: currentPath === '/' }">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
        </svg>
        <span>Dashboard</span>
      </RouterLink>

      <div class="nav-section">Operacional</div>

      <RouterLink to="/efetivo" class="nav-item" :class="{ active: currentPath === '/efetivo' }">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
        <span>Efetivo</span>
      </RouterLink>

      <a class="nav-item disabled" title="Em desenvolvimento">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
        <span>Ocorrências</span>
        <span class="badge-soon">Em breve</span>
      </a>

      <a class="nav-item disabled" title="Em desenvolvimento">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="1" y="3" width="15" height="13" rx="2" />
          <path d="M16 8h4l3 3v5h-7V8z" />
          <circle cx="5.5" cy="18.5" r="2.5" />
          <circle cx="18.5" cy="18.5" r="2.5" />
        </svg>
        <span>Viaturas</span>
        <span class="badge-soon">Em breve</span>
      </a>

      <a class="nav-item disabled" title="Em desenvolvimento">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
        <span>Relatórios</span>
        <span class="badge-soon">Em breve</span>
      </a>

      <template v-if="isRh">
        <div class="nav-section">Gestão de Pessoal</div>
        <RouterLink
          to="/gestao/usuarios"
          class="nav-item"
          :class="{ active: currentPath === '/gestao/usuarios' }"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="8.5" cy="7" r="4" />
            <line x1="20" y1="8" x2="20" y2="14" />
            <line x1="23" y1="11" x2="17" y2="11" />
          </svg>
          <span>Cadastrar Policial</span>
        </RouterLink>
      </template>

      <template v-if="isAdmin">
        <div class="nav-section">Administração</div>
        <a class="nav-item disabled" title="Em desenvolvimento">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14" />
          </svg>
          <span>Configurações</span>
          <span class="badge-soon">Em breve</span>
        </a>
      </template>

    </nav>

    <div class="sidebar-footer">
      <div class="user-avatar">{{ initials }}</div>
      <div class="user-details">
        <span class="user-name">{{ userName }}</span>
        <span class="user-rank">{{ userRank }}</span>
      </div>
      <button class="logout-btn" title="Sair" @click="emit('logout')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <polyline points="16 17 21 12 16 7" />
          <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
      </button>
    </div>
  </aside>
</template>

<script setup>
import { RouterLink } from 'vue-router'

defineProps({
  currentPath: {
    type: String,
    required: true,
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
  isRh: {
    type: Boolean,
    default: false,
  },
  initials: {
    type: String,
    required: true,
  },
  userName: {
    type: String,
    default: '',
  },
  userRank: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['logout'])
</script>

<style scoped>
.sidebar {
  width: 260px;
  background: var(--surface);
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  position: sticky;
  top: 0;
  height: 100vh;
}

.sidebar-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1.25rem 1rem;
  border-bottom: 1px solid var(--border);
}

.brand {
  display: flex;
  align-items: center;
  gap: 0.625rem;
}

.brand-icon img {
  width: 30px;
  height: 30px;
  object-fit: contain;
}

.brand-text {
  display: flex;
  flex-direction: column;
}

.brand-unit {
  font-size: var(--fs-2xs);
  font-weight: var(--fw-semibold);
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.brand-name {
  font-size: var(--fs-md);
  font-weight: var(--fw-semibold);
  color: var(--text-strong);
  font-family: var(--font-family-display);
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
  font-size: var(--fs-2xs);
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: var(--text-muted);
  padding: 0.75rem 1.25rem 0.25rem;
  white-space: nowrap;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.7rem 1.25rem;
  color: var(--text-soft);
  transition: background 0.15s, color 0.15s;
  cursor: pointer;
  white-space: nowrap;
  border-left: 3px solid transparent;
  text-decoration: none;
  border: none;
  width: 100%;
  text-align: left;
  background: none;
}

.nav-item svg {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}

.nav-item:hover:not(.disabled) {
  background: var(--surface-subtle);
  color: var(--text-strong);
}

.nav-item.active {
  background: var(--surface-brand-soft);
  color: var(--primary);
  border-left-color: var(--primary-light);
}

.nav-item.disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.badge-soon {
  margin-left: auto;
  font-size: var(--fs-2xs);
  background: var(--surface-subtle);
  color: var(--text-soft);
  padding: 0.15rem 0.5rem;
  border-radius: 999px;
  white-space: nowrap;
}

.sidebar-footer {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  border-top: 1px solid var(--border);
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--surface-brand-soft);
  color: var(--primary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--fs-sm);
  font-weight: var(--fw-bold);
  flex-shrink: 0;
}

.user-details {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.user-name {
  font-size: var(--fs-sm);
  font-weight: var(--fw-semibold);
  color: var(--text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-rank {
  font-size: var(--fs-xs);
  color: var(--text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.logout-btn {
  background: none;
  border: none;
  color: var(--text-muted);
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
  color: var(--error);
}

@media (max-width: 768px) {
  .sidebar {
    width: 100%;
    height: auto;
    position: static;
    border-right: none;
    border-bottom: 1px solid var(--border);
  }
}
</style>
