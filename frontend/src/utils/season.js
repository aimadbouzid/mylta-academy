// season.js — Détection dynamique et épurée de la saison basée sur la date du jour
export function getCurrentSeason(date = new Date()) {
  const month = date.getMonth() + 1 // 1 - 12
  const day = date.getDate()

  if ((month === 3 && day >= 20) || month === 4 || month === 5 || (month === 6 && day <= 20)) {
    return {
      id: 'spring',
      label: 'Printemps',
      tagline: 'Spring Edition 🌸',
      badgeText: '🌸 Printemps',
      titleSuffix: 'Spring',
      icon: '🌸',
      badgeBg: 'bg-emerald-50 text-emerald-700 border border-emerald-200/60',
      accentColor: 'text-emerald-700',
    }
  } else if ((month === 6 && day >= 21) || month === 7 || month === 8 || (month === 9 && day <= 22)) {
    return {
      id: 'summer',
      label: 'Summer',
      tagline: 'Summer Edition ☀️',
      badgeText: '☀️ Été',
      titleSuffix: 'Summer',
      icon: '☀️',
      badgeBg: 'bg-amber-50 text-amber-700 border border-amber-200/60',
      accentColor: 'text-amber-700',
    }
  } else if ((month === 9 && day >= 23) || month === 10 || month === 11 || (month === 12 && day <= 20)) {
    return {
      id: 'autumn',
      label: 'Automne',
      tagline: 'Autumn Edition 🍁',
      badgeText: '🍁 Automne',
      titleSuffix: 'Autumn',
      icon: '🍁',
      badgeBg: 'bg-orange-50 text-orange-800 border border-orange-200/60',
      accentColor: 'text-orange-800',
    }
  } else {
    return {
      id: 'winter',
      label: 'Hiver',
      tagline: 'Winter Edition ❄️',
      badgeText: '❄️ Hiver',
      titleSuffix: 'Winter',
      icon: '❄️',
      badgeBg: 'bg-blue-50 text-blue-700 border border-blue-200/60',
      accentColor: 'text-blue-700',
    }
  }
}
