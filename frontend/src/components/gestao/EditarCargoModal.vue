<template>
  <div v-if="open" class="modal-overlay" @click.self="$emit('close')">
    <div class="modal">
      <div class="modal-header">
        <h3 class="modal-title">Editar Cargo</h3>
        <button class="modal-close" @click="$emit('close')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      <div class="modal-body">
        <div class="officer-preview">
          <span class="officer-name">{{ officer?.name }}</span>
          <span class="officer-rg">RG {{ officer?.rg }}</span>
        </div>

        <div class="cargo-change">
          <div class="cargo-item current">
            <span class="cargo-item-label">Cargo atual</span>
            <span class="cargo-item-value">{{ currentLabel }}</span>
          </div>
          <svg class="cargo-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
          </svg>
          <div class="cargo-item new">
            <span class="cargo-item-label">Novo cargo</span>
            <span class="cargo-item-value" :class="{ placeholder: !novoCargo }">
              {{ novoLabel || 'Selecione...' }}
            </span>
          </div>
        </div>

        <div class="field">
          <label class="field-label">Selecionar novo cargo</label>
          <select v-model="novoCargo" class="field-input">
            <option value="" disabled>Escolha o cargo</option>
            <option
              v-for="c in CARGOS"
              :key="c.value"
              :value="c.value"
              :disabled="c.value === officer?.cargo"
            >
              {{ c.label }}
            </option>
          </select>
          <span v-if="novoCargoDesc" class="field-hint">{{ novoCargoDesc }}</span>
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn-ghost" @click="$emit('close')">Cancelar</button>
        <button
          class="btn-primary"
          :disabled="!novoCargo || novoCargo === officer?.cargo || loading"
          @click="confirm"
        >
          <span v-if="loading" class="btn-spinner" />
          {{ loading ? 'Salvando...' : 'Confirmar Alteração' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { CARGOS } from '@/constants/graduacoes'

const props = defineProps({
  open: { type: Boolean, default: false },
  officer: { type: Object, default: null },
  loading: { type: Boolean, default: false },
})

const emit = defineEmits(['close', 'confirm'])

const novoCargo = ref('')

watch(() => props.open, (val) => { if (val) novoCargo.value = '' })

const currentLabel = computed(() => CARGOS.find((c) => c.value === props.officer?.cargo)?.label ?? '—')
const novoLabel = computed(() => CARGOS.find((c) => c.value === novoCargo.value)?.label ?? '')
const novoCargoDesc = computed(() => CARGOS.find((c) => c.value === novoCargo.value)?.description ?? '')

function confirm() {
  if (!novoCargo.value || novoCargo.value === props.officer?.cargo) return
  emit('confirm', novoCargo.value)
}
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
  max-width: 440px;
  box-shadow: var(--shadow-lg, 0 20px 60px rgb(0 0 0 / 20%));
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid var(--border-soft);
}

.modal-title {
  font-size: var(--fs-lg);
  font-weight: var(--fw-bold);
  color: var(--text-strong);
  font-family: var(--font-family-display);
}

.modal-close {
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 0.25rem;
  display: flex;
}

.modal-close svg { width: 18px; height: 18px; }
.modal-close:hover { color: var(--text); }

.modal-body {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.officer-preview {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 0.75rem 1rem;
  background: var(--surface-soft);
  border-radius: 8px;
}

.officer-name {
  font-size: var(--fs-md);
  font-weight: var(--fw-semibold);
  color: var(--text-strong);
}

.officer-rg {
  font-size: var(--fs-xs);
  color: var(--text-faint);
}

.cargo-change {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.cargo-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  padding: 0.65rem 0.75rem;
  border-radius: 8px;
  border: 1px solid var(--border-soft);
}

.cargo-item.current { background: var(--surface-subtle); }
.cargo-item.new { background: var(--surface-brand-soft); border-color: var(--primary-light); }

.cargo-item-label {
  font-size: var(--fs-xs);
  color: var(--text-faint);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.cargo-item-value {
  font-size: var(--fs-sm);
  font-weight: var(--fw-semibold);
  color: var(--text-strong);
}

.cargo-item-value.placeholder { color: var(--text-faint); font-weight: var(--fw-normal); }

.cargo-arrow { width: 18px; height: 18px; color: var(--text-muted); flex-shrink: 0; }

.field { display: flex; flex-direction: column; gap: 0.35rem; }

.field-label {
  font-size: var(--fs-sm);
  font-weight: var(--fw-semibold);
  color: var(--text-strong);
}

.field-input {
  border: 1px solid var(--border);
  background: var(--surface-soft);
  color: var(--text);
  font-size: var(--fs-md);
  padding: 0.55rem 0.8rem;
  border-radius: 8px;
  outline: none;
  font-family: inherit;
}

.field-input:focus {
  border-color: var(--primary-light);
  box-shadow: 0 0 0 3px rgb(42 82 152 / 10%);
}

.field-hint {
  font-size: var(--fs-xs);
  color: var(--text-faint);
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1.25rem 1.5rem;
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

.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1.4rem;
  background: var(--primary);
  color: #fff;
  font-size: var(--fs-md);
  font-weight: var(--fw-semibold);
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-family: inherit;
}

.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
.btn-primary:hover:not(:disabled) { background: var(--primary-light); }

.btn-spinner {
  width: 14px;
  height: 14px;
  border: 2px solid rgb(255 255 255 / 40%);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }
</style>
