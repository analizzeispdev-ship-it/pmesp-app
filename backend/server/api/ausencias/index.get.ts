import { connectDB } from '../../utils/db'
import { Ausencia } from '../../models/Ausencia'
import { requireAuth } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const payload = requireAuth(event)
  await connectDB()

  const { usuarioId, dataInicio, dataFim } = getQuery(event)
  const isP1OrAdmin = payload.cargo.includes('p1') || payload.role === 'admin'

  const filter: Record<string, unknown> = {}

  if (!isP1OrAdmin) {
    filter.usuarioId = payload.id
  } else {
    if (usuarioId) filter.usuarioId = usuarioId
    if (dataInicio || dataFim) {
      // ausencias que se sobrepõem ao período filtrado
      if (dataInicio) filter.dataFim = { $gte: new Date(dataInicio as string) }
      if (dataFim) filter.dataInicio = { ...(filter.dataInicio as object ?? {}), $lte: new Date(dataFim as string) }
    }
  }

  const ausencias = await Ausencia.find(filter).sort({ createdAt: -1 }).lean()
  return { ausencias }
})
