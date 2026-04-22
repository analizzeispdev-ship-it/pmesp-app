<template>
  <div v-if="open" class="modal-overlay" @click.self="$emit('close')">
    <div class="modal">
      <div class="modal-header">
        <div class="header-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
        </div>
        <div>
          <h3 class="modal-title">Encerrar Viatura</h3>
          <p class="modal-subtitle">Esta ação remove todos da patrulha.</p>
        </div>
        <button class="modal-close" @click="$emit('close')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      <div class="modal-body">
        <div class="viatura-info">
          <span class="viatura-prefixo">{{ viatura?.prefixo }}</span>
          <span class="viatura-crew">{{ crewCount }} tripulante{{ crewCount !== 1 ? 's' : '' }}</span>
        </div>

        <div class="crew-preview">
          <div v-for="{ key, label } in filledRoles" :key="key" class="crew-item">
            <span class="crew-role">{{ label }}</span>
            <span class="crew-name">{{ viatura?.[key]?.name }}</span>
          </div>
        </div>

        <p class="confirm-text">
          O status de patrulha de todos os policiais da barca será encerrado.
        </p>
      </div>

      <div class="modal-footer">
        <button class="btn-ghost" @click="$emit('close')">Cancelar</button>
        <button class="btn-danger" :disabled="loading" @click="$emit('confirm')">
          <span v-if="loading">Encerrando...</span>
          <span v-else>Confirmar Encerramento</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  open: { type: Boolean, default: false },
  viatura: { type: Object, default: null },
  loading: { type: Boolean, default: false },
})

defineEmits(['close', 'confirm'])

const ROLES = [
  { key: 'motorista', label: 'Motorista' },
  { key: 'chefeDeBarca', label: 'Chefe de Barca' },
  { key: 'auxiliar1', label: '1° Auxiliar' },
  { key: 'auxiliar2', label: '2° Auxiliar' },
  { key: 'auxiliar3', label: '3° Auxiliar' },
]

const filledRoles = computed(() => ROLES.filter((r) => !!props.viatura?.[r.key]))
const crewCount = computed(() => filledRoles.value.length)
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgb(0 0 0 / 40%);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  padding: 1rem;
}

.modal {
  background: var(--surface);
  border: 1px solid var(--border-soft);
  border-radius: 14px;
  width: 100%;
  max-width: 420px;
  box-shadow: var(--shadow-lg, 0 20px 60px rgb(0 0 0 / 20%));
}

.modal-header {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid var(--border-soft);
}

.header-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: var(--danger-soft);
  color: var(--error);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.header-icon svg { width: 20px; height: 20px; }

.modal-title {
  font-size: var(--fs-lg);
  font-weight: var(--fw-bold);
  color: var(--text-strong);
  font-family: var(--font-family-display);
  line-height: 1.2;
}

.modal-subtitle {
  font-size: var(--fs-sm);
  color: var(--text-muted);
  margin-top: 2px;
}

.modal-close {
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 0.25rem;
  display: flex;
  margin-left: auto;
  flex-shrink: 0;
}

.modal-close svg { width: 18px; height: 18px; }
.modal-close:hover { color: var(--text); }

.modal-body {
  padding: 1.25rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
}

.viatura-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  background: var(--surface-soft);
  border-radius: 8px;
  border: 1px solid var(--border-soft);
}

.viatura-prefixo {
  font-size: var(--fs-md);
  font-weight: var(--fw-bold);
  color: var(--text-strong);
  font-family: var(--font-family-display);
}

.viatura-crew {
  font-size: var(--fs-sm);
  color: var(--text-muted);
}

.crew-preview {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.crew-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: var(--fs-sm);
}

.crew-role {
  font-size: var(--fs-xs);
  font-weight: var(--fw-semibold);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-muted);
  min-width: 110px;
}

.crew-name {
  color: var(--text);
}

.confirm-text {
  font-size: var(--fs-sm);
  color: var(--text-soft);
  line-height: var(--lh-relaxed);
  padding-top: 0.25rem;
  border-top: 1px solid var(--border-soft);
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  border-top: 1px solid var(--border-soft);
}

.btn-ghost {
  padding: 0.6rem 1.2rem;
  background: none;
  border: 1px solid var(--border);
  color: var(--text-soft);
  font-size: var(--fs-md);
  font-weight: var(--fw-semibold);
  border-radius: 8px;
  cursor: pointer;
  font-family: inherit;
}

.btn-ghost:hover { background: var(--surface-subtle); }

.btn-danger {
  padding: 0.6rem 1.2rem;
  background: var(--error);
  color: #fff;
  border: none;
  font-size: var(--fs-md);
  font-weight: var(--fw-semibold);
  border-radius: 8px;
  cursor: pointer;
  font-family: inherit;
  transition: opacity 0.15s;
}

.btn-danger:hover:not(:disabled) { opacity: 0.88; }
.btn-danger:disabled { opacity: 0.5; cursor: not-allowed; }
</style>
