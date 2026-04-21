<template>
  <div class="page">
    <div class="card">
      <!-- Header -->
      <div class="card-header">
        <div class="shield-icon">
          <svg viewBox="0 0 100 120" xmlns="http://www.w3.org/2000/svg">
            <path d="M50 4L6 24V60C6 86 26 107 50 118C74 107 94 86 94 60V24L50 4Z" fill="#1a3a6b" stroke="#c8a951" stroke-width="2.5" />
            <path d="M50 28L54.8 43H70L58 51.5L62.8 66.5L50 58L37.2 66.5L42 51.5L30 43H45.2L50 28Z" fill="#c8a951" />
          </svg>
        </div>
        <h1>Primeiro Acesso</h1>
        <p>Você precisa definir uma nova senha antes de continuar.</p>
      </div>

      <!-- User info -->
      <div class="user-info">
        <span class="user-label">Usuário</span>
        <span class="user-name">{{ auth.user?.name }}</span>
        <span class="user-role">{{ roleLabel }}</span>
      </div>

      <!-- Form -->
      <form @submit.prevent="handleSubmit" novalidate>
        <div class="field">
          <label for="newPassword">Nova Senha</label>
          <div class="input-wrap">
            <input
              id="newPassword"
              v-model="form.newPassword"
              :type="show.new ? 'text' : 'password'"
              placeholder="Mínimo 8 caracteres"
              :disabled="loading"
              required
            />
            <button type="button" class="toggle-pwd" @click="show.new = !show.new">
              <EyeIcon :open="show.new" />
            </button>
          </div>
          <!-- Strength indicator -->
          <div v-if="form.newPassword" class="strength-bar">
            <div
              v-for="i in 4"
              :key="i"
              class="strength-segment"
              :class="{ active: strength >= i, [`level-${strength}`]: strength >= i }"
            />
          </div>
          <p v-if="form.newPassword" class="strength-label" :class="`level-${strength}`">
            {{ strengthLabel }}
          </p>
        </div>

        <div class="field">
          <label for="confirmPassword">Confirmar Nova Senha</label>
          <div class="input-wrap">
            <input
              id="confirmPassword"
              v-model="form.confirmPassword"
              :type="show.confirm ? 'text' : 'password'"
              placeholder="Repita a nova senha"
              :disabled="loading"
              required
            />
            <button type="button" class="toggle-pwd" @click="show.confirm = !show.confirm">
              <EyeIcon :open="show.confirm" />
            </button>
          </div>
          <p v-if="form.confirmPassword && form.newPassword !== form.confirmPassword" class="hint-error">
            As senhas não coincidem
          </p>
          <p v-if="form.confirmPassword && form.newPassword === form.confirmPassword" class="hint-ok">
            Senhas coincidem
          </p>
        </div>

        <!-- Rules -->
        <div class="rules">
          <p class="rules-title">A senha deve conter:</p>
          <ul>
            <li :class="{ ok: rules.length }">Mínimo 8 caracteres</li>
            <li :class="{ ok: rules.upper }">Letra maiúscula</li>
            <li :class="{ ok: rules.number }">Número</li>
            <li :class="{ ok: rules.special }">Caractere especial (!@#$%...)</li>
          </ul>
        </div>

        <Transition name="alert-fade">
          <div v-if="error" class="alert-error">{{ error }}</div>
        </Transition>

        <Transition name="alert-fade">
          <div v-if="successMsg" class="alert-success">{{ successMsg }}</div>
        </Transition>

        <button
          type="submit"
          class="btn-submit"
          :disabled="loading || !canSubmit"
        >
          <span v-if="loading" class="spinner" />
          {{ loading ? 'Salvando...' : 'Definir Nova Senha' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useApi } from '@/composables/useApi'

const EyeIcon = {
  props: ['open'],
  template: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:18px;height:18px">
      <template v-if="!open">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
        <circle cx="12" cy="12" r="3"/>
      </template>
      <template v-else>
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
        <line x1="1" y1="1" x2="23" y2="23"/>
      </template>
    </svg>
  `,
}

const router = useRouter()
const auth = useAuthStore()
const api = useApi()

const form = reactive({ newPassword: '', confirmPassword: '' })
const show = reactive({ new: false, confirm: false })
const loading = ref(false)
const error = ref('')
const successMsg = ref('')

const rules = computed(() => ({
  length: form.newPassword.length >= 8,
  upper: /[A-Z]/.test(form.newPassword),
  number: /[0-9]/.test(form.newPassword),
  special: /[!@#$%^&*(),.?":{}|<>]/.test(form.newPassword),
}))

const strength = computed(() => Object.values(rules.value).filter(Boolean).length)

const strengthLabel = computed(() => {
  const labels = { 1: 'Muito fraca', 2: 'Fraca', 3: 'Boa', 4: 'Forte' }
  return labels[strength.value] || ''
})

const canSubmit = computed(
  () =>
    form.newPassword.length >= 8 &&
    form.newPassword === form.confirmPassword
)

const roleLabel = computed(() => {
  const map = { admin: 'Administrador', supervisor: 'Supervisor', officer: 'Policial' }
  return map[auth.user?.role] || ''
})

async function handleSubmit() {
  loading.value = true
  error.value = ''
  successMsg.value = ''
  try {
    await api.post('/api/auth/change-password', {
      newPassword: form.newPassword,
      confirmPassword: form.confirmPassword,
    })
    auth.markFirstAccessDone()
    successMsg.value = 'Senha definida com sucesso! Redirecionando...'
    setTimeout(() => router.push('/'), 1500)
  } catch (err) {
    error.value = err.message || 'Erro ao alterar senha'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  background: linear-gradient(135deg, #06091a 0%, #0d1b3e 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
}

.card {
  background: white;
  border-radius: 20px;
  padding: 2.5rem;
  width: 100%;
  max-width: 480px;
  box-shadow: 0 30px 80px rgba(0, 0, 0, 0.5);
}

.card-header {
  text-align: center;
  margin-bottom: 1.75rem;
}

.shield-icon {
  display: flex;
  justify-content: center;
  margin-bottom: 1rem;
}

.shield-icon svg {
  width: 60px;
  height: auto;
  filter: drop-shadow(0 4px 12px rgba(26, 58, 107, 0.3));
}

.card-header h1 {
  font-size: 1.6rem;
  font-weight: 700;
  color: #1a3a6b;
  margin-bottom: 0.4rem;
}

.card-header p {
  font-size: 0.875rem;
  color: #64748b;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: #f0f4f8;
  border-radius: 10px;
  padding: 0.875rem 1rem;
  margin-bottom: 1.75rem;
}

.user-label {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  color: #94a3b8;
  letter-spacing: 0.05em;
}

.user-name {
  font-weight: 600;
  color: #1a3a6b;
  flex: 1;
}

.user-role {
  font-size: 0.75rem;
  background: #1a3a6b;
  color: white;
  padding: 0.2rem 0.6rem;
  border-radius: 999px;
}

/* Fields */
.field {
  margin-bottom: 1.25rem;
}

.field label {
  display: block;
  font-size: 0.8rem;
  font-weight: 600;
  color: #374151;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.5rem;
}

.input-wrap {
  position: relative;
}

.input-wrap input {
  width: 100%;
  padding: 0.8rem 3rem 0.8rem 1rem;
  border: 1.5px solid #e2e8f0;
  border-radius: 10px;
  font-size: 0.95rem;
  color: #1e293b;
  font-family: inherit;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.input-wrap input:focus {
  border-color: #1a3a6b;
  box-shadow: 0 0 0 3px rgba(26, 58, 107, 0.1);
}

.input-wrap input:disabled {
  background: #f8fafc;
  cursor: not-allowed;
}

.toggle-pwd {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: color 0.15s;
}

.toggle-pwd:hover {
  color: #1a3a6b;
}

/* Strength */
.strength-bar {
  display: flex;
  gap: 4px;
  margin-top: 6px;
}

.strength-segment {
  flex: 1;
  height: 4px;
  border-radius: 2px;
  background: #e2e8f0;
  transition: background 0.3s;
}

.strength-segment.active.level-1 { background: #ef4444; }
.strength-segment.active.level-2 { background: #f97316; }
.strength-segment.active.level-3 { background: #eab308; }
.strength-segment.active.level-4 { background: #22c55e; }

.strength-label {
  font-size: 0.75rem;
  margin-top: 4px;
}

.strength-label.level-1 { color: #ef4444; }
.strength-label.level-2 { color: #f97316; }
.strength-label.level-3 { color: #eab308; }
.strength-label.level-4 { color: #22c55e; }

.hint-error {
  font-size: 0.75rem;
  color: #dc2626;
  margin-top: 4px;
}

.hint-ok {
  font-size: 0.75rem;
  color: #16a34a;
  margin-top: 4px;
}

/* Rules */
.rules {
  background: #f8fafc;
  border-radius: 10px;
  padding: 0.875rem 1rem;
  margin-bottom: 1.25rem;
}

.rules-title {
  font-size: 0.8rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.5rem;
}

.rules ul {
  list-style: none;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.3rem;
}

.rules li {
  font-size: 0.78rem;
  color: #94a3b8;
  padding-left: 1.2rem;
  position: relative;
  transition: color 0.2s;
}

.rules li::before {
  content: '○';
  position: absolute;
  left: 0;
  font-size: 0.6rem;
}

.rules li.ok {
  color: #16a34a;
}

.rules li.ok::before {
  content: '●';
  color: #16a34a;
}

/* Alerts */
.alert-error,
.alert-success {
  padding: 0.75rem 1rem;
  border-radius: 8px;
  font-size: 0.875rem;
  margin-bottom: 1rem;
}

.alert-error {
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #dc2626;
}

.alert-success {
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  color: #16a34a;
}

/* Submit */
.btn-submit {
  width: 100%;
  padding: 0.9rem;
  background: linear-gradient(135deg, #1a3a6b, #0f2347);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 0.95rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  font-family: inherit;
  cursor: pointer;
  transition: opacity 0.2s, transform 0.15s, box-shadow 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.btn-submit:hover:not(:disabled) {
  opacity: 0.9;
  transform: translateY(-1px);
  box-shadow: 0 8px 20px rgba(15, 35, 71, 0.3);
}

.btn-submit:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.alert-fade-enter-active,
.alert-fade-leave-active {
  transition: all 0.25s ease;
}
.alert-fade-enter-from,
.alert-fade-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>
