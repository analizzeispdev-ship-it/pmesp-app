<template>
  <div class="login-page">
    <div class="login-container">
      <!-- Painel esquerdo: identidade visual -->
      <div class="brand-panel">
        <div class="brand-content">
          <div class="shield-wrap">
            <svg class="shield-svg" viewBox="0 0 100 120" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M50 4L6 24V60C6 86 26 107 50 118C74 107 94 86 94 60V24L50 4Z"
                fill="#0f2347"
                stroke="#c8a951"
                stroke-width="2.5"
              />
              <path
                d="M50 4L6 24V60C6 86 26 107 50 118C74 107 94 86 94 60V24L50 4Z"
                fill="url(#shieldGrad)"
              />
              <defs>
                <linearGradient id="shieldGrad" x1="0" y1="0" x2="100" y2="120" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stop-color="#1a3a6b" />
                  <stop offset="100%" stop-color="#0a1a3a" />
                </linearGradient>
              </defs>
              <path
                d="M50 28L54.8 43H70L58 51.5L62.8 66.5L50 58L37.2 66.5L42 51.5L30 43H45.2L50 28Z"
                fill="#c8a951"
              />
              <line x1="22" y1="82" x2="78" y2="82" stroke="#c8a951" stroke-width="1" opacity="0.4" />
              <text x="50" y="95" text-anchor="middle" fill="#c8a951" font-size="7.5" font-family="serif" letter-spacing="3" opacity="0.9">PMESP</text>
            </svg>
          </div>

          <h1 class="brand-title">PMESP</h1>
          <p class="brand-name">Polícia Militar do Estado de São Paulo</p>

          <div class="brand-divider" />

          <p class="brand-desc">Sistema Integrado de Gerenciamento Policial</p>

          <div class="brand-badges">
            <span class="badge-tag">RP</span>
            <span class="badge-tag">v1.0</span>
          </div>
        </div>

        <div class="brand-circles">
          <div class="circle c1" />
          <div class="circle c2" />
        </div>
      </div>

      <!-- Painel direito: formulário de login -->
      <div class="form-panel">
        <div class="form-card">
          <div class="form-header">
            <h2>Acesso ao Sistema</h2>
            <p>Insira suas credenciais para continuar</p>
          </div>

          <form @submit.prevent="handleLogin" novalidate>
            <div class="field">
              <label for="username">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                Usuário
              </label>
              <input
                id="username"
                v-model="form.username"
                type="text"
                placeholder="Digite seu usuário"
                autocomplete="username"
                required
                :disabled="loading"
              />
            </div>

            <div class="field">
              <label for="password">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                Senha
              </label>
              <div class="input-wrap">
                <input
                  id="password"
                  v-model="form.password"
                  :type="showPwd ? 'text' : 'password'"
                  placeholder="Digite sua senha"
                  autocomplete="current-password"
                  required
                  :disabled="loading"
                />
                <button type="button" class="toggle-pwd" @click="showPwd = !showPwd" :aria-label="showPwd ? 'Ocultar senha' : 'Mostrar senha'">
                  <svg v-if="!showPwd" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                  <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                </button>
              </div>
            </div>

            <Transition name="alert-fade">
              <div v-if="error" class="alert-error" role="alert">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <span>
                  {{ error }}
                  <strong v-if="blocked > 0"> ({{ blocked }}s)</strong>
                </span>
              </div>
            </Transition>

            <button type="submit" class="btn-submit" :disabled="loading || blocked > 0 || !form.username || !form.password">
              <span v-if="loading" class="spinner" />
              <span>{{ loading ? 'Verificando...' : blocked > 0 ? `Bloqueado (${blocked}s)` : 'Entrar' }}</span>
            </button>
          </form>

          <p class="form-footer">
            Problemas no acesso? Contate o administrador do sistema.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useApi } from '@/composables/useApi'

const router = useRouter()
const auth = useAuthStore()
const api = useApi()

const form = reactive({ username: '', password: '' })
const loading = ref(false)
const error = ref('')
const showPwd = ref(false)
const blocked = ref(0) // segundos restantes de bloqueio

let countdownTimer = null

function startCountdown(seconds) {
  blocked.value = seconds
  clearInterval(countdownTimer)
  countdownTimer = setInterval(() => {
    blocked.value--
    if (blocked.value <= 0) {
      blocked.value = 0
      error.value = ''
      clearInterval(countdownTimer)
    }
  }, 1000)
}

onBeforeUnmount(() => clearInterval(countdownTimer))

async function handleLogin() {
  if (blocked.value > 0) return
  loading.value = true
  error.value = ''
  try {
    const { token, user } = await api.post('/api/auth/login', {
      username: form.username.trim(),
      password: form.password,
    })
    auth.setAuth(token, user)
    router.push(user.firstAccess ? '/primeiro-acesso' : '/')
  } catch (err) {
    if (err.status === 429) {
      const wait = parseInt(err.retryAfter || '60', 10)
      startCountdown(wait)
      error.value = err.message
    } else {
      error.value = err.message || 'Erro ao realizar login'
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #06091a 0%, #0d1b3e 50%, #06091a 100%);
  padding: 1rem;
}

.login-container {
  display: flex;
  width: 100%;
  max-width: 1000px;
  min-height: 600px;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 30px 80px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(200, 169, 81, 0.1);
}

/* ── Brand panel ── */
.brand-panel {
  flex: 1;
  background: linear-gradient(160deg, #1a3a6b 0%, #0a1f45 60%, #060f28 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 3rem 2.5rem;
  position: relative;
  overflow: hidden;
}

.brand-circles {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.circle {
  position: absolute;
  border-radius: 50%;
  background: rgba(200, 169, 81, 0.04);
}

.c1 {
  width: 420px;
  height: 420px;
  top: -140px;
  left: -140px;
}

.c2 {
  width: 320px;
  height: 320px;
  bottom: -80px;
  right: -80px;
  background: rgba(255, 255, 255, 0.02);
}

.brand-content {
  position: relative;
  z-index: 1;
  text-align: center;
  color: white;
}

.shield-wrap {
  margin-bottom: 1.5rem;
  display: flex;
  justify-content: center;
}

.shield-svg {
  width: 110px;
  height: auto;
  filter: drop-shadow(0 6px 20px rgba(200, 169, 81, 0.35));
}

.brand-title {
  font-size: 3.25rem;
  font-weight: 800;
  letter-spacing: 0.4em;
  color: #c8a951;
  text-shadow: 0 2px 16px rgba(200, 169, 81, 0.25);
  margin-bottom: 0.5rem;
  line-height: 1;
}

.brand-name {
  font-size: 0.78rem;
  color: rgba(255, 255, 255, 0.65);
  letter-spacing: 0.04em;
  margin-bottom: 2rem;
  line-height: 1.5;
}

.brand-divider {
  width: 50px;
  height: 2px;
  background: linear-gradient(90deg, transparent, #c8a951, transparent);
  margin: 0 auto 2rem;
}

.brand-desc {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.4);
  text-transform: uppercase;
  letter-spacing: 0.12em;
  margin-bottom: 2rem;
}

.brand-badges {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
}

.badge-tag {
  padding: 0.25rem 0.75rem;
  background: rgba(200, 169, 81, 0.12);
  border: 1px solid rgba(200, 169, 81, 0.25);
  border-radius: 999px;
  font-size: 0.7rem;
  color: #c8a951;
  letter-spacing: 0.1em;
}

/* ── Form panel ── */
.form-panel {
  flex: 1;
  background: #f8fafc;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 3rem 2.5rem;
}

.form-card {
  width: 100%;
  max-width: 400px;
}

.form-header {
  margin-bottom: 2rem;
}

.form-header h2 {
  font-size: 1.8rem;
  font-weight: 700;
  color: #1a3a6b;
  margin-bottom: 0.4rem;
}

.form-header p {
  font-size: 0.875rem;
  color: #64748b;
}

/* Fields */
.field {
  margin-bottom: 1.25rem;
}

.field label {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.8rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.field label svg {
  width: 14px;
  height: 14px;
  color: #1a3a6b;
  flex-shrink: 0;
}

.field input {
  width: 100%;
  padding: 0.8rem 1rem;
  border: 1.5px solid #e2e8f0;
  border-radius: 10px;
  font-size: 0.95rem;
  color: #1e293b;
  background: white;
  transition: border-color 0.2s, box-shadow 0.2s;
  outline: none;
}

.field input:focus {
  border-color: #1a3a6b;
  box-shadow: 0 0 0 3px rgba(26, 58, 107, 0.1);
}

.field input:disabled {
  background: #f1f5f9;
  cursor: not-allowed;
  opacity: 0.6;
}

.input-wrap {
  position: relative;
}

.input-wrap input {
  padding-right: 3rem;
}

.toggle-pwd {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #94a3b8;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  transition: color 0.15s;
}

.toggle-pwd:hover {
  color: #1a3a6b;
}

.toggle-pwd svg {
  width: 18px;
  height: 18px;
}

/* Alert */
.alert-error {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  color: #dc2626;
  font-size: 0.875rem;
  margin-bottom: 1rem;
}

.alert-error svg {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

/* Submit button */
.btn-submit {
  width: 100%;
  padding: 0.9rem;
  background: linear-gradient(135deg, #1a3a6b, #0f2347);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 0.95rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  transition: opacity 0.2s, transform 0.15s, box-shadow 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.btn-submit:hover:not(:disabled) {
  opacity: 0.92;
  transform: translateY(-1px);
  box-shadow: 0 8px 20px rgba(15, 35, 71, 0.3);
}

.btn-submit:active:not(:disabled) {
  transform: translateY(0);
}

.btn-submit:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  flex-shrink: 0;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.form-footer {
  margin-top: 1.75rem;
  text-align: center;
  font-size: 0.78rem;
  color: #94a3b8;
  line-height: 1.5;
}

/* Transition */
.alert-fade-enter-active,
.alert-fade-leave-active {
  transition: all 0.25s ease;
}
.alert-fade-enter-from,
.alert-fade-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

/* Responsive */
@media (max-width: 768px) {
  .login-container {
    flex-direction: column;
    max-width: 480px;
  }

  .brand-panel {
    padding: 2.5rem 2rem;
    min-height: 280px;
  }

  .shield-svg {
    width: 80px;
  }

  .brand-title {
    font-size: 2.25rem;
  }

  .form-panel {
    padding: 2rem 1.5rem;
  }
}
</style>
