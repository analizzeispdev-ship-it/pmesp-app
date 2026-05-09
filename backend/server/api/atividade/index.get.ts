import { connectDB } from '../../utils/db'
import { User } from '../../models/User'
import { Viatura } from '../../models/Viatura'
import { Ausencia } from '../../models/Ausencia'
import { requireAuth } from '../../utils/auth'

function isWeekday(date: Date): boolean {
  const dow = date.getDay()
  return dow !== 0 && dow !== 6
}

function countWeekdays(from: Date, to: Date): number {
  let count = 0
  const cur = new Date(from)
  cur.setHours(0, 0, 0, 0)
  const end = new Date(to)
  end.setHours(0, 0, 0, 0)
  while (cur <= end) {
    if (isWeekday(cur)) count++
    cur.setDate(cur.getDate() + 1)
  }
  return count
}

export default defineEventHandler(async (event) => {
  const payload = requireAuth(event)
  if (payload.cargo !== 'p1' && payload.role !== 'admin') {
    throw createError({ statusCode: 403, message: 'Acesso negado' })
  }
  await connectDB()

  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59)

  const [ausentesIds, users, viaturas] = await Promise.all([
    Ausencia.find({ status: 'ativa' }).distinct('usuarioId'),
    User.find({ active: true, role: { $ne: 'admin' } })
      .select('name rg graduacao cargo patrulhando ultimaPatrulha')
      .lean(),
    Viatura.find({
      abertaEm: { $lte: today },
      $or: [{ encerradaEm: null }, { encerradaEm: { $gte: monthStart } }],
    }).select('motorista chefeDeBarca auxiliar1 auxiliar2 auxiliar3 abertaEm encerradaEm').lean(),
  ])

  const ausentesSet = new Set(ausentesIds.map((id: any) => id.toString()))
  const efetivo = users.filter((u) => !ausentesSet.has((u._id as any).toString()))

  const totalWeekdays = countWeekdays(monthStart, today)

  // allDays = todos os dias (inclui fim de semana)
  // weekDays = só dias úteis (base do cálculo de %)
  const allDays = new Map<string, Set<string>>()
  const weekDays = new Map<string, Set<string>>()

  for (const v of viaturas) {
    const members = [v.motorista, v.chefeDeBarca, v.auxiliar1, v.auxiliar2, v.auxiliar3]
      .filter(Boolean)
      .map((id: any) => id.toString())

    const rangeStart = new Date(Math.max(new Date(v.abertaEm).getTime(), monthStart.getTime()))
    const rangeEnd = new Date(Math.min((v.encerradaEm ? new Date(v.encerradaEm) : now).getTime(), today.getTime()))

    for (const userId of members) {
      if (!allDays.has(userId)) allDays.set(userId, new Set())
      if (!weekDays.has(userId)) weekDays.set(userId, new Set())
      const all = allDays.get(userId)!
      const week = weekDays.get(userId)!

      const cur = new Date(rangeStart)
      cur.setHours(0, 0, 0, 0)
      const endDay = new Date(rangeEnd)
      endDay.setHours(0, 0, 0, 0)

      while (cur <= endDay) {
        const key = cur.toISOString().split('T')[0]
        all.add(key)
        if (isWeekday(cur)) week.add(key)
        cur.setDate(cur.getDate() + 1)
      }
    }
  }

  const result = efetivo.map((user) => {
    const id = (user._id as any).toString()
    const diasPatrulhados = allDays.get(id)?.size ?? 0
    const diasUteisPatrulhados = weekDays.get(id)?.size ?? 0
    const percentual = totalWeekdays > 0 ? Math.round((diasUteisPatrulhados / totalWeekdays) * 100) : 0
    const flag = percentual >= 60 ? 'apto' : percentual >= 40 ? 'ativo' : 'inativo'
    return { ...user, diasPatrulhados, diasUteisPatrulhados, totalWeekdays, percentual, flag }
  })

  result.sort((a, b) => {
    const order: Record<string, number> = { apto: 0, ativo: 1, inativo: 2 }
    if (order[a.flag] !== order[b.flag]) return order[a.flag] - order[b.flag]
    return a.name.localeCompare(b.name)
  })

  return { efetivo: result, totalWeekdays, mes: monthStart.toISOString() }
})
