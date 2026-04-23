import { defineStore } from 'pinia'
import { useApi } from '@/composables/useApi'

export const useApreensaoStore = defineStore('apreensoes', {
  state: () => ({
    totais: null,
    rankGeral: [],
    rankPorItem: {},
    rankPatrulha: [],
    loading: false,
    error: null,
    actionLoading: false,
    actionError: null,
    relatorio: [],
    relatorioLoading: false,
  }),

  actions: {
    async fetchStats(mes, ano) {
      this.loading = true
      this.error = null
      try {
        const api = useApi()
        const [statsData, patrulhaData] = await Promise.all([
          api.get(`/api/apreensoes?mes=${mes}&ano=${ano}`),
          api.get(`/api/apreensoes/rank-patrulha?mes=${mes}&ano=${ano}`),
        ])
        this.totais = statsData.totais
        this.rankGeral = statsData.rankGeral
        this.rankPorItem = statsData.rankPorItem
        this.rankPatrulha = patrulhaData.rank
      } catch (e) {
        this.error = e.message || 'Erro ao carregar dados'
      } finally {
        this.loading = false
      }
    },

    async registrar(payload) {
      this.actionLoading = true
      this.actionError = null
      try {
        const api = useApi()
        const data = await api.post('/api/apreensoes', payload)
        return data.apreensao
      } catch (e) {
        this.actionError = e.message || 'Erro ao registrar apreensão'
        throw e
      } finally {
        this.actionLoading = false
      }
    },

    async fetchRelatorio() {
      this.relatorioLoading = true
      try {
        const api = useApi()
        const data = await api.get('/api/apreensoes/relatorio')
        this.relatorio = data.viaturas
      } catch (e) {
        throw e
      } finally {
        this.relatorioLoading = false
      }
    },
  },
})
