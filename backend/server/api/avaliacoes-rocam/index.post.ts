import { connectDB } from '../../utils/db'
import { AvaliacaoRocam } from '../../models/AvaliacaoRocam'
import { User } from '../../models/User'
import { verifyToken } from '../../utils/jwt'

export default defineEventHandler(async (event) => {
  const authHeader = getHeader(event, 'authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    throw createError({ statusCode: 401, message: 'Não autorizado' })
  }

  const config = useRuntimeConfig()
  let payload: ReturnType<typeof verifyToken>
  try {
    payload = verifyToken(authHeader.slice(7), config.jwtSecret)
  } catch {
    throw createError({ statusCode: 401, message: 'Token inválido ou expirado' })
  }

  const ACTIVE_CARGOS = ['padrao', 'p1', 'p3', 'p5']
  const isActiveOfficer = payload.cargo.some((c: string) => ACTIVE_CARGOS.includes(c)) || payload.role === 'admin'
  if (!isActiveOfficer) {
    throw createError({ statusCode: 403, message: 'Estagiários ROCAM não podem criar avaliações' })
  }

  const body = await readBody(event)
  const { avaliadoId, avaliacao, pontoAtencao, nota } = body ?? {}

  if (!avaliadoId || !avaliacao?.trim()) {
    throw createError({ statusCode: 400, message: 'Avaliado e avaliação são obrigatórios' })
  }

  const notaNum = Math.round(Number(nota))
  if (isNaN(notaNum) || notaNum < 0 || notaNum > 10) {
    throw createError({ statusCode: 400, message: 'Nota deve ser de 0 a 10' })
  }

  await connectDB()

  const [avaliado, avaliador] = await Promise.all([
    User.findOne({ _id: avaliadoId, active: true, cargo: 'rocam' }).select('name rg').lean(),
    User.findById(payload.id).select('name rg').lean(),
  ])

  if (!avaliado) {
    throw createError({ statusCode: 404, message: 'Policial ROCAM não encontrado' })
  }

  if (!avaliador) {
    throw createError({ statusCode: 401, message: 'Avaliador não encontrado' })
  }

  const doc = await AvaliacaoRocam.create({
    avaliadorId: payload.id,
    avaliadorNome: avaliador.name,
    avaliadorRg: avaliador.rg ?? '',
    avaliadoId,
    avaliadoNome: avaliado.name,
    avaliadoRg: avaliado.rg ?? '',
    avaliacao: avaliacao.trim(),
    pontoAtencao: pontoAtencao?.trim() ?? '',
    nota: notaNum,
  })

  return { avaliacao: doc.toObject() }
})
