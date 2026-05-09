import { defineStore } from 'pinia'
import { useApi } from '@/composables/useApi'

export const useAtividadeStore = defineStore('atividade', {
  state: () => ({
    efetivo: [],
    totalWeekdays: 0,
    mes: null,
    loading: false,
    error: null,
  }),

  actions: {
    async fetchAll() {
      this.loading = true
      this.error = null
      try {
        const api = useApi()
        const data = await api.get('/api/atividade')
        this.efetivo = data.efetivo
        this.totalWeekdays = data.totalWeekdays
        this.mes = data.mes
      } catch (e) {
        this.error = e.message ?? 'Erro ao carregar registro de atividade'
      } finally {
        this.loading = false
      }
    },
  },
})
