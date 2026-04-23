import { connectDB } from '../utils/db'
import { Apreensao } from '../models/Apreensao'
import { Viatura } from '../models/Viatura'

const ITEMS = ['armasFogo', 'drogas', 'explosivos', 'itensRoubados', 'armasBrancas', 'dinheiroSujo', 'municao'] as const

function monthRange(mes: number, ano: number) {
  const start = new Date(ano, mes - 1, 1)
  const end = new Date(ano, mes, 0, 23, 59, 59, 999)
  return { start, end }
}

export class ApreensaoService {
  static async getStats(mes: number, ano: number) {
    await connectDB()
    const { start, end } = monthRange(mes, ano)
    const match = { createdAt: { $gte: start, $lte: end } }

    const [totaisArr, rankRaw] = await Promise.all([
      Apreensao.aggregate([
        { $match: match },
        {
          $group: {
            _id: null,
            armasFogo: { $sum: '$armasFogo' },
            drogas: { $sum: '$drogas' },
            explosivos: { $sum: '$explosivos' },
            itensRoubados: { $sum: '$itensRoubados' },
            armasBrancas: { $sum: '$armasBrancas' },
            dinheiroSujo: { $sum: '$dinheiroSujo' },
            municao: { $sum: '$municao' },
          },
        },
      ]),
      Apreensao.aggregate([
        { $match: match },
        { $unwind: '$membros' },
        {
          $group: {
            _id: '$membros.userId',
            name: { $first: '$membros.name' },
            rg: { $first: '$membros.rg' },
            graduacao: { $first: '$membros.graduacao' },
            armasFogo: { $sum: '$armasFogo' },
            drogas: { $sum: '$drogas' },
            explosivos: { $sum: '$explosivos' },
            itensRoubados: { $sum: '$itensRoubados' },
            armasBrancas: { $sum: '$armasBrancas' },
            dinheiroSujo: { $sum: '$dinheiroSujo' },
            municao: { $sum: '$municao' },
          },
        },
        {
          $addFields: {
            total: {
              $add: [
                '$armasFogo', '$drogas', '$explosivos', '$itensRoubados',
                '$armasBrancas', '$dinheiroSujo', '$municao',
              ],
            },
          },
        },
        { $sort: { total: -1 } },
      ]),
    ])

    const raw = totaisArr[0] ?? {}
    const totais: Record<string, number> = {}
    for (const k of ITEMS) totais[k] = raw[k] ?? 0

    const rankGeral = rankRaw.slice(0, 10).map((r: any) => ({
      userId: r._id,
      name: r.name,
      rg: r.rg,
      graduacao: r.graduacao,
      total: r.total,
    }))

    const rankPorItem: Record<string, any[]> = {}
    for (const item of ITEMS) {
      rankPorItem[item] = rankRaw
        .filter((r: any) => r[item] > 0)
        .sort((a: any, b: any) => b[item] - a[item])
        .slice(0, 5)
        .map((r: any) => ({
          userId: r._id,
          name: r.name,
          rg: r.rg,
          graduacao: r.graduacao,
          total: r[item],
        }))
    }

    return { totais, rankGeral, rankPorItem }
  }

  static async getPatrulhaRank(mes: number, ano: number) {
    await connectDB()
    const { start, end } = monthRange(mes, ano)
    const now = new Date()

    const viaturas = await Viatura.find({
      abertaEm: { $lte: end },
      $or: [
        { encerradaEm: null },
        { encerradaEm: { $gte: start } },
      ],
    })
      .populate('motorista chefeDeBarca auxiliar1 auxiliar2 auxiliar3', 'name rg graduacao')
      .lean()

    const officerMap = new Map<string, any>()
    const crewFields = ['motorista', 'chefeDeBarca', 'auxiliar1', 'auxiliar2', 'auxiliar3']

    for (const v of viaturas as any[]) {
      const vStart = new Date(Math.max(new Date(v.abertaEm).getTime(), start.getTime()))
      const closeTime = v.encerradaEm ? new Date(v.encerradaEm) : now
      const vEnd = new Date(Math.min(closeTime.getTime(), end.getTime()))
      const minutos = Math.max(0, (vEnd.getTime() - vStart.getTime()) / 60000)

      if (minutos <= 0) continue

      for (const f of crewFields) {
        const m = v[f]
        if (!m) continue
        const uid = m._id.toString()
        const existing = officerMap.get(uid)
        if (existing) {
          existing.total += minutos
        } else {
          officerMap.set(uid, {
            userId: m._id,
            name: m.name,
            rg: m.rg ?? '',
            graduacao: m.graduacao ?? '',
            total: minutos,
          })
        }
      }
    }

    return Array.from(officerMap.values())
      .sort((a, b) => b.total - a.total)
      .slice(0, 10)
  }

  static async create(data: {
    viaturaId: string
    userId: string
    items: Record<string, number>
    origem: string
  }) {
    await connectDB()

    const viatura = await Viatura.findOne({
      _id: data.viaturaId,
      status: 'ativa',
      $or: [
        { motorista: data.userId },
        { chefeDeBarca: data.userId },
        { auxiliar1: data.userId },
        { auxiliar2: data.userId },
        { auxiliar3: data.userId },
      ],
    })
      .populate('motorista chefeDeBarca auxiliar1 auxiliar2 auxiliar3', 'name rg graduacao')
      .lean() as any

    if (!viatura) {
      throw createError({ statusCode: 403, message: 'Você não está nesta viatura ou viatura inativa' })
    }

    const crewFields = ['motorista', 'chefeDeBarca', 'auxiliar1', 'auxiliar2', 'auxiliar3']
    const membros = crewFields
      .map((f) => viatura[f])
      .filter(Boolean)
      .map((m: any) => ({
        userId: m._id,
        name: m.name,
        rg: m.rg ?? '',
        graduacao: m.graduacao ?? '',
      }))

    return Apreensao.create({
      viaturaId: data.viaturaId,
      viaturaPrefixo: viatura.prefixo,
      membros,
      ...data.items,
      origem: data.origem,
      registradoPorId: data.userId,
    })
  }

  static async getRelatorio() {
    await connectDB()

    const viaturas = await Viatura.find({})
      .sort({ abertaEm: -1 })
      .limit(15)
      .select('prefixo status abertaEm encerradaEm')
      .lean()

    const ids = viaturas.map((v: any) => v._id)

    const apreensoes = await Apreensao.find({ viaturaId: { $in: ids } })
      .sort({ createdAt: -1 })
      .lean()

    const map = new Map<string, any[]>()
    for (const a of apreensoes) {
      const key = (a as any).viaturaId.toString()
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(a)
    }

    return viaturas.map((v: any) => ({
      viaturaId: v._id,
      prefixo: v.prefixo,
      status: v.status,
      abertaEm: v.abertaEm,
      encerradaEm: v.encerradaEm,
      apreensoes: map.get(v._id.toString()) ?? [],
    }))
  }
}
