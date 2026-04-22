<template>
  <div v-if="open" class="modal-overlay" @click.self="$emit('close')">
    <div class="modal">
      <div class="modal-header">
        <div>
          <h3 class="modal-title">Editar Tripulação</h3>
          <p class="modal-subtitle">{{ viatura?.prefixo }}</p>
        </div>
        <button class="modal-close" @click="$emit('close')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      <div class="modal-body">
        <div class="roles-grid">
          <div v-for="role in ROLES" :key="role.key" class="field">
            <label class="field-label">
              {{ role.label }}
              <span v-if="role.required" class="req">*</span>
            </label>
            <select v-model="form[role.key]" class="field-select">
              <option value="">— Remover —</option>
              <option
                v-for="officer in availableFor(role.key)"
                :key="officer._id"
                :value="officer._id"
                :class="{ 'opt-busy': isBusyElsewhere(officer) }"
              >
                {{ officerLabel(officer) }}
              </option>
            </select>
          </div>
        </div>

        <div v-if="error" class="error-msg">{{ error }}</div>
      </div>

      <div class="modal-footer">
        <button class="btn-ghost" @click="$emit('close')">Cancelar</button>
        <button class="btn-primary" :disabled="!isValid || loading" @click="handleConfirm">
          <span v-if="loading">Salvando...</span>
          <span v-else>Salvar Tripulação</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, computed, watch } from 'vue'
import { buildDisplayName } from '@/constants/graduacoes'

const props = defineProps({
  open: { type: Boolean, default: false },
  viatura: { type: Object, default: null },
  loading: { type: Boolean, default: false },
  officers: { type: Array, default: () => [] },
  error: { type: String, default: '' },
})

const emit = defineEmits(['close', 'confirm'])

const ROLES = [
  { key: 'motorista', label: 'Motorista', required: true },
  { key: 'chefeDeBarca', label: 'Chefe de Barca', required: true },
  { key: 'auxiliar1', label: '1° Auxiliar', required: false },
  { key: 'auxiliar2', label: '2° Auxiliar', required: false },
  { key: 'auxiliar3', label: '3° Auxiliar', required: false },
]

const form = reactive({
  motorista: '',
  chefeDeBarca: '',
  auxiliar1: '',
  auxiliar2: '',
  auxiliar3: '',
})

watch(() => props.open, (val) => {
  if (val && props.viatura) populateFromViatura()
})

watch(() => props.viatura, (v) => {
  if (props.open && v) populateFromViatura()
})

function populateFromViatura() {
  const v = props.viatura
  form.motorista = v.motorista?._id ?? v.motorista ?? ''
  form.chefeDeBarca = v.chefeDeBarca?._id ?? v.chefeDeBarca ?? ''
  form.auxiliar1 = v.auxiliar1?._id ?? v.auxiliar1 ?? ''
  form.auxiliar2 = v.auxiliar2?._id ?? v.auxiliar2 ?? ''
  form.auxiliar3 = v.auxiliar3?._id ?? v.auxiliar3 ?? ''
}

const currentCrewIds = computed(() => {
  const v = props.viatura
  if (!v) return []
  return ['motorista', 'chefeDeBarca', 'auxiliar1', 'auxiliar2', 'auxiliar3']
    .map((k) => v[k]?._id ?? v[k])
    .filter(Boolean)
})

function isBusyElsewhere(officer) {
  return officer.patrulhando && !currentCrewIds.value.includes(officer._id)
}

function availableFor(roleKey) {
  const otherSelected = ROLES
    .filter((r) => r.key !== roleKey)
    .map((r) => form[r.key])
    .filter(Boolean)
  return props.officers.filter((o) => !otherSelected.includes(o._id))
}

function officerLabel(officer) {
  const base = buildDisplayName(officer.name, officer.rg, officer.graduacao)
  return isBusyElsewhere(officer) ? `${base} · EM OUTRA BARCA` : base
}

const isValid = computed(() => !!form.motorista && !!form.chefeDeBarca)

function handleConfirm() {
  if (!isValid.value) return
  emit('confirm', {
    motorista: form.motorista,
    chefeDeBarca: form.chefeDeBarca,
    auxiliar1: form.auxiliar1 || null,
    auxiliar2: form.auxiliar2 || null,
    auxiliar3: form.auxiliar3 || null,
  })
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
  max-width: 520px;
  box-shadow: var(--shadow-lg, 0 20px 60px rgb(0 0 0 / 20%));
  max-height: 90vh;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid var(--border-soft);
  flex-shrink: 0;
}

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
  flex-shrink: 0;
}

.modal-close svg { width: 18px; height: 18px; }
.modal-close:hover { color: var(--text); }

.modal-body {
  padding: 1.25rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  overflow-y: auto;
}

.roles-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.field-label {
  font-size: var(--fs-xs);
  font-weight: var(--fw-semibold);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--text-muted);
}

.req { color: var(--error); }

.field-select {
  padding: 0.55rem 0.75rem;
  border: 1px solid var(--border);
  border-radius: 8px;
  font-size: var(--fs-sm);
  color: var(--text);
  background: var(--surface);
  font-family: inherit;
  transition: border-color 0.15s;
  outline: none;
}

.field-select:focus { border-color: var(--primary); }

.error-msg {
  font-size: var(--fs-sm);
  color: var(--error);
  background: var(--danger-soft);
  border: 1px solid #fca5a5;
  border-radius: 8px;
  padding: 0.65rem 0.9rem;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  border-top: 1px solid var(--border-soft);
  flex-shrink: 0;
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
  padding: 0.6rem 1.2rem;
  background: var(--primary);
  color: #fff;
  border: none;
  font-size: var(--fs-md);
  font-weight: var(--fw-semibold);
  border-radius: 8px;
  cursor: pointer;
  font-family: inherit;
  transition: background 0.15s;
}

.btn-primary:hover:not(:disabled) { background: var(--primary-dark); }
.btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
</style>
