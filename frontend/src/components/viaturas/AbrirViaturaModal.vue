<template>
  <div v-if="open" class="modal-overlay" @click.self="$emit('close')">
    <div class="modal">
      <div class="modal-header">
        <h3 class="modal-title">Abrir Viatura</h3>
        <button class="modal-close" @click="$emit('close')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      <div class="modal-body">
        <div class="fields-row">
          <div class="field">
            <label class="field-label">Prefixo <span class="req">*</span></label>
            <input
              v-model="form.prefixo"
              class="field-input"
              placeholder="ex: M-18012 / Tático 12"
              maxlength="20"
            />
          </div>
          <div class="field field--grow">
            <label class="field-label">Observação</label>
            <input
              v-model="form.observacao"
              class="field-input"
              placeholder="Opcional..."
              maxlength="200"
            />
          </div>
        </div>

        <div class="section-label">Tripulação</div>

        <div class="roles-grid">
          <div v-for="role in ROLES" :key="role.key" class="field">
            <label class="field-label">
              {{ role.label }}
              <span v-if="role.required" class="req">*</span>
            </label>
            <select v-model="form[role.key]" class="field-select">
              <option value="">— Selecionar —</option>
              <option
                v-for="officer in availableFor(role.key)"
                :key="officer._id"
                :value="officer._id"
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
          <span v-if="loading">Abrindo...</span>
          <span v-else>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="1" y="3" width="15" height="13" rx="2" />
              <path d="M16 8h4l3 3v5h-7V8z" />
              <circle cx="5.5" cy="18.5" r="2.5" />
              <circle cx="18.5" cy="18.5" r="2.5" />
            </svg>
            Abrir Viatura
          </span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, computed, watch } from 'vue'
import { GRADUACOES, buildDisplayName } from '@/constants/graduacoes'

const props = defineProps({
  open: { type: Boolean, default: false },
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
  prefixo: '',
  observacao: '',
  motorista: '',
  chefeDeBarca: '',
  auxiliar1: '',
  auxiliar2: '',
  auxiliar3: '',
})

watch(() => props.open, (val) => {
  if (val) resetForm()
})

function resetForm() {
  Object.assign(form, {
    prefixo: '',
    observacao: '',
    motorista: '',
    chefeDeBarca: '',
    auxiliar1: '',
    auxiliar2: '',
    auxiliar3: '',
  })
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
  return officer.patrulhando ? `${base} · EM SERVIÇO` : base
}

const isValid = computed(() => !!form.prefixo.trim() && !!form.motorista && !!form.chefeDeBarca)

function handleConfirm() {
  if (!isValid.value) return
  emit('confirm', {
    prefixo: form.prefixo.trim(),
    observacao: form.observacao.trim(),
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
  max-width: 560px;
  box-shadow: var(--shadow-lg, 0 20px 60px rgb(0 0 0 / 20%));
  max-height: 90vh;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  align-items: center;
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
  padding: 1.25rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  overflow-y: auto;
}

.fields-row {
  display: flex;
  gap: 0.75rem;
  align-items: flex-end;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.field--grow { flex: 1; }

.field-label {
  font-size: var(--fs-xs);
  font-weight: var(--fw-semibold);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--text-muted);
}

.req { color: var(--error); }

.field-input,
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

.field-input:focus,
.field-select:focus {
  border-color: var(--primary);
}

.section-label {
  font-size: var(--fs-xs);
  font-weight: var(--fw-semibold);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--primary);
  border-bottom: 1px solid var(--border-soft);
  padding-bottom: 0.4rem;
}

.roles-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}

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
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
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

.btn-primary svg { width: 15px; height: 15px; }
.btn-primary:hover:not(:disabled) { background: var(--primary-dark); }
.btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
</style>
