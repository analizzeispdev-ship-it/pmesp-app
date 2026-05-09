import { connectDB } from '../../utils/db'
import { Ausencia } from '../../models/Ausencia'
import { User } from '../../models/User'
import { requireAuth } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const payload = requireAuth(event)
  await connectDB()

  const body = await readBody(event)
  if (!body?.dataInicio || !body?.dataFim || !body?.motivo?.trim()) {
    throw createError({ statusCode: 400, message: 'Período e motivo são obrigatórios' })
  }

  const inicio = new Date(body.dataInicio)
  const fim = new Date(body.dataFim)
  if (fim < inicio) {
    throw createError({ statusCode: 400, message: 'Data fim deve ser igual ou posterior à data início' })
  }

  const existing = await Ausencia.exists({ usuarioId: payload.id, status: 'ativa' })
  if (existing) {
    throw createError({ statusCode: 409, message: 'Já existe uma ausência ativa' })
  }

  const user = await User.findById(payload.id).select('name rg graduacao').lean()
  if (!user) throw createError({ statusCode: 404, message: 'Usuário não encontrado' })

  const ausencia = await Ausencia.create({
    usuarioId: payload.id,
    usuarioNome: user.name,
    usuarioRg: user.rg,
    usuarioGraduacao: user.graduacao,
    dataInicio: inicio,
    dataFim: fim,
    motivo: body.motivo.trim(),
  })

  await User.findByIdAndUpdate(payload.id, { ausente: true })

  return { ausencia }
})
