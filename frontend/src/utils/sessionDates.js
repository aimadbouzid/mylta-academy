// Une session dure 3 jours consécutifs à partir de sa date : « Samedi 5 – lundi 7 octobre 2026 ».
export const formatDate = (s) => {
  const [y, m, d] = s.split('-').map(Number)
  const start = new Date(y, m - 1, d)
  const end = new Date(y, m - 1, d + 2)
  const day = (dt) => dt.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric' })
  const tail = end.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
  const startTail = start.getMonth() === end.getMonth() ? '' : ` ${start.toLocaleDateString('fr-FR', { month: 'long' })}`
  const label = `${day(start)}${startTail} – ${day(end)} ${tail}`
  return label.charAt(0).toUpperCase() + label.slice(1)
}
