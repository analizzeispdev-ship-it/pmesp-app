<template>
  <div class="table-wrapper">
    <!-- Loading -->
    <div v-if="loading" class="table-feedback">
      <div class="spinner" />
      <span>Carregando efetivo...</span>
    </div>

    <!-- Empty -->
    <div v-else-if="officers.length === 0" class="table-feedback">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
      <span>Nenhum policial encontrado.</span>
    </div>

    <!-- Table -->
    <table v-else class="efetivo-table">
      <thead>
        <tr>
          <th>Policial</th>
          <th>Cargo</th>
          <th>Graduação</th>
          <th>Última Promoção</th>
          <th class="col-center">PAD</th>
          <th>Cursos</th>
          <th>Status de Patrulha</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="officer in officers" :key="officer._id">

          <!-- Policial -->
          <td class="td-policial">
            <div class="officer-cell">
              <div class="officer-avatar">{{ getInitials(officer.name) }}</div>
              <div class="officer-info">
                <span class="officer-display">{{ buildDisplayName(officer.name, officer.rg, officer.graduacao) }}</span>
                <span class="officer-username">@{{ officer.username }}</span>
              </div>
            </div>
          </td>

          <!-- Cargo -->
          <td>
            <span class="cargo-badge" :class="`cargo-${officer.cargo}`">
              {{ getCargoLabel(officer.cargo) }}
            </span>
          </td>

          <!-- Graduação -->
          <td class="td-grad">
            <div class="grad-cell">
              <span class="grad-prefix">{{ getGraduacaoPrefix(officer.graduacao) }}</span>
              <span class="grad-label">{{ getGraduacaoLabel(officer.graduacao) }}</span>
            </div>
          </td>

          <!-- Última Promoção -->
          <td class="td-date">
            <span v-if="officer.dataPromocao" class="date-value">
              {{ formatDate(officer.dataPromocao) }}
            </span>
            <span v-else class="no-value">—</span>
          </td>

          <!-- PAD -->
          <td class="col-center">
            <PadIndicator
              :count="officer.advertencias?.length ?? 0"
              :advertencias="officer.advertencias ?? []"
            />
          </td>

          <!-- Cursos -->
          <td>
            <CursosBadge :cursos="officer.cursos ?? []" />
          </td>

          <!-- Patrulha -->
          <td>
            <PatrulhaStatus
              :patrulhando="officer.patrulhando"
              :ultima-patrulha="officer.ultimaPatrulha"
            />
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import PadIndicator from './PadIndicator.vue'
import CursosBadge from './CursosBadge.vue'
import PatrulhaStatus from './PatrulhaStatus.vue'
import { CARGOS, GRADUACOES, buildDisplayName } from '@/constants/graduacoes'

defineProps({
  officers: {
    type: Array,
    required: true,
  },
  loading: {
    type: Boolean,
    default: false,
  },
})

function getInitials(name) {
  const parts = (name || 'U').split(' ')
  return parts.length >= 2 ? parts[0][0] + parts[parts.length - 1][0] : parts[0][0]
}

function getCargoLabel(value) {
  return CARGOS.find((c) => c.value === value)?.label ?? value
}

function getGraduacaoLabel(value) {
  return GRADUACOES.find((g) => g.value === value)?.label ?? value
}

function getGraduacaoPrefix(value) {
  return GRADUACOES.find((g) => g.value === value)?.nickPrefix ?? ''
}

function formatDate(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}
</script>

<style scoped>
.table-wrapper {
  overflow-x: auto;
}

.table-feedback {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 3rem;
  color: var(--text-faint);
  font-size: var(--fs-md);
}

.table-feedback svg {
  width: 40px;
  height: 40px;
  color: var(--border);
}

.spinner {
  width: 28px;
  height: 28px;
  border: 3px solid var(--border);
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.efetivo-table {
  width: 100%;
  border-collapse: collapse;
  font-size: var(--fs-sm);
}

.efetivo-table thead th {
  text-align: left;
  font-size: var(--fs-xs);
  font-weight: var(--fw-semibold);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--text-muted);
  padding: 0.6rem 1rem;
  border-bottom: 1px solid var(--border-soft);
  white-space: nowrap;
  background: var(--surface-soft);
}

.efetivo-table thead th.col-center,
.efetivo-table tbody td.col-center {
  text-align: center;
}

.efetivo-table tbody tr {
  border-bottom: 1px solid var(--border-soft);
  transition: background 0.12s;
}

.efetivo-table tbody tr:last-child {
  border-bottom: none;
}

.efetivo-table tbody tr:hover {
  background: var(--surface-soft);
}

.efetivo-table tbody td {
  padding: 0.75rem 1rem;
  vertical-align: middle;
  color: var(--text);
}

/* Policial cell */
.td-policial { min-width: 200px; }

.officer-cell {
  display: flex;
  align-items: center;
  gap: 0.65rem;
}

.officer-avatar {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: var(--surface-brand-soft);
  color: var(--primary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--fs-xs);
  font-weight: var(--fw-bold);
  flex-shrink: 0;
  border: 1px solid var(--border-soft);
}

.officer-info {
  display: flex;
  flex-direction: column;
  gap: 1px;
  min-width: 0;
}

.officer-display {
  font-size: var(--fs-sm);
  font-weight: var(--fw-semibold);
  color: var(--text-strong);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.officer-username {
  font-size: var(--fs-xs);
  color: var(--text-faint);
}

/* Cargo badge */
.cargo-badge {
  font-size: var(--fs-xs);
  font-weight: var(--fw-semibold);
  padding: 0.2rem 0.55rem;
  border-radius: 999px;
  border: 1px solid var(--border-soft);
  background: var(--surface-subtle);
  color: var(--text-soft);
  white-space: nowrap;
}

.cargo-badge.cargo-p1 {
  background: var(--surface-brand-soft);
  color: var(--primary);
  border-color: var(--primary-light);
}

.cargo-badge.cargo-p3 {
  background: var(--warning-soft);
  color: var(--warning);
  border-color: var(--accent-light);
}

.cargo-badge.cargo-p5 {
  background: var(--success-bg);
  color: var(--success);
  border-color: #bbf7d0;
}

.cargo-badge.cargo-estagio {
  background: var(--danger-soft);
  color: var(--error);
  border-color: var(--error);
}

/* Graduação */
.grad-cell {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.grad-prefix {
  font-size: var(--fs-md);
  line-height: 1;
}

.grad-label {
  font-size: var(--fs-sm);
  color: var(--text);
  white-space: nowrap;
}

/* Date */
.td-date { white-space: nowrap; }

.date-value {
  color: var(--text-soft);
  font-size: var(--fs-sm);
}

.no-value {
  color: var(--text-faint);
}
</style>
