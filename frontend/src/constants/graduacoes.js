export const GRADUACOES = [
  {
    label: 'Policial Militar',
    value: 'pm',
    nickPrefix: '✯',
    roleName: '[✯] POLICIAL MILITAR PM',
    grupo: 'PRAÇAS ESPECIAIS',
  },
  {
    label: '2º Tenente',
    value: '2tenente',
    nickPrefix: '✧',
    roleName: '[✧] 2° TENENTE PM',
    grupo: 'OFICIAIS SUBALTERNOS',
  },
  {
    label: '1º Tenente',
    value: '1tenente',
    nickPrefix: '✧✧',
    roleName: '[✧✧] 1º TENENTE PM',
    grupo: 'OFICIAIS SUBALTERNOS',
  },
  {
    label: 'Capitão',
    value: 'capitao',
    nickPrefix: '✧✧✧',
    roleName: '[✧✧✧] CAPITÃO PM',
    grupo: 'OFICIAIS INTERMEDIÁRIOS',
  },
]

export const CARGOS = [
  { label: 'Padrão', value: 'padrao', description: 'Policial padrão de patrulhamento' },
  { label: 'P1 - RH', value: 'p1', description: 'Recursos Humanos' },
  { label: 'P3 - Operacional', value: 'p3', description: 'Operacional' },
  { label: 'P5 - Comunicação', value: 'p5', description: 'Comunicação' },
  { label: 'Estágio Operacional', value: 'estagio', description: 'Estágio operacional' },
]

export function getGraduacao(value) {
  return GRADUACOES.find((g) => g.value === value)
}

export function buildDisplayName(name, rg, graduacao) {
  const grad = getGraduacao(graduacao)
  const prefix = grad?.nickPrefix ?? ''
  return `${prefix} | ${name} - ${rg}`
}
