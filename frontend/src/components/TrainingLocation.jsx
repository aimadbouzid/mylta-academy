import { useState } from 'react'
import { MapPin, Phone, Navigation, Map as MapIcon, Car, Footprints } from 'lucide-react'

// Lieu de la formation présentielle (partenaire Camden International Institute, Béjaïa).
const PLACE = {
  partner: 'Camden International Institute',
  logo: '/camden-logo.jpg',
  address: 'Cité Douanière Bir Slam, Promo Ceram Bt D1 W, Béjaïa',
  phone: '0542 47 12 61',
  from: { label: 'Gare routière de Béjaïa', lat: 36.7371759, lng: 5.0636466 },
  to: { lat: 36.7294694, lng: 5.0566702 },
}

const ROUTES = {
  car: {
    label: 'Voiture', icon: Car, time: '4 min', dist: '2,2 km',
    // Schéma du trajet réel : N12 vers le sud, puis boulevard Krim Belkacem.
    path: 'M286 34 L262 62 L232 112 L204 160 L178 204 L160 170 L146 136',
    steps: [
      'Sortez de la gare routière et prenez la route N12 (1,5 km).',
      'Tournez à droite sur le boulevard Krim Belkacem.',
      'Roulez 600 m : Camden est sur votre droite.',
    ],
    mode: 'driving',
  },
  walk: {
    label: 'À pied', icon: Footprints, time: '21 min', dist: '1,5 km',
    path: 'M286 34 L262 62 L246 92 L200 100 L160 106 L150 118 L146 136',
    steps: [
      'Sortez de la gare routière et longez la N12 vers le sud.',
      'Prenez la rue Rabia Ali à droite.',
      'Continuez tout droit jusqu\'à Camden, à côté du boulevard Krim Belkacem.',
    ],
    mode: 'walking',
  },
}

const directionsUrl = (mode) =>
  `https://www.google.com/maps/dir/?api=1&origin=${PLACE.from.lat},${PLACE.from.lng}&destination=${PLACE.to.lat},${PLACE.to.lng}&travelmode=${mode}`

export default function TrainingLocation() {
  const [routeId, setRouteId] = useState('car')
  const [showMap, setShowMap] = useState(false)
  const route = ROUTES[routeId]

  return (
    <section className="bg-white border border-academy-border rounded-2xl p-5 sm:p-6 shadow-sm space-y-5">
      <div>
        <p className="text-xs font-black uppercase tracking-wider text-academy-primary mb-1">Lieu de la formation</p>
        <h2 className="font-display font-black text-xl leading-tight">À Béjaïa, chez notre partenaire</h2>
      </div>

      {/* Partenariat */}
      <div className="flex items-center gap-3 rounded-xl border border-academy-border bg-academy-surface/60 p-3">
        <img src={PLACE.logo} alt={PLACE.partner} width="84" height="56" loading="lazy"
             className="w-[84px] h-14 object-contain rounded-lg bg-white p-1 shrink-0" />
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-wide text-academy-textMain/50">En partenariat avec</p>
          <p className="font-bold leading-snug">{PLACE.partner}</p>
          <p className="text-xs text-academy-textMain/60">Mylta Academy × Camden</p>
        </div>
      </div>

      <div className="space-y-1.5 text-sm">
        <p className="flex gap-2"><MapPin size={17} className="text-academy-primary shrink-0 mt-0.5" /> {PLACE.address}</p>
        <a href={`tel:${PLACE.phone.replace(/\s/g, '')}`} className="flex gap-2 font-semibold hover:text-academy-primary">
          <Phone size={16} className="text-academy-primary shrink-0 mt-0.5" /> {PLACE.phone}
        </a>
      </div>

      {/* Trajet depuis la gare routière */}
      <div>
        <h3 className="font-bold mb-2">Depuis la gare routière</h3>
        <div className="flex gap-1.5 mb-3">
          {Object.entries(ROUTES).map(([id, r]) => {
            const Icon = r.icon
            const active = id === routeId
            return (
              <button key={id} type="button" onClick={() => setRouteId(id)}
                      className={`h-9 px-3 rounded-full border text-[13px] font-semibold whitespace-nowrap inline-flex items-center gap-1.5 transition-colors ${active ? 'border-academy-primary bg-academy-primary text-academy-onPrimary' : 'border-academy-border bg-white text-academy-textMain/80'}`}>
                <Icon size={15} /> {r.label} · {r.time}
              </button>
            )
          })}
        </div>

        <div className="relative rounded-xl overflow-hidden border border-academy-border bg-[#f4f1ea]">
          <svg viewBox="0 0 360 230" className="block w-full h-auto" role="img"
               aria-label={`Trajet (${route.label.toLowerCase()}) de la gare routière de Béjaïa à Camden : ${route.time}, ${route.dist}`}>
            <style>{`
              .tl-route { stroke-dasharray: 420; stroke-dashoffset: 420; animation: tl-draw 2.4s ease-out forwards; }
              @keyframes tl-draw { to { stroke-dashoffset: 0; } }
              @media (prefers-reduced-motion: reduce) { .tl-route { animation: none; stroke-dashoffset: 0; } }
            `}</style>
            {/* Oued Soummam et mer */}
            <path d="M300 230 C318 190 330 150 338 110 C344 80 352 50 360 30" fill="none" stroke="#bcd7ea" strokeWidth="16" strokeLinecap="round" />
            <path d="M330 0 L360 0 L360 22 C350 14 340 8 330 0 Z" fill="#bcd7ea" />
            <text x="318" y="150" fontSize="9" fill="#5b8db0" fontStyle="italic" transform="rotate(-72 318 150)">Oued Soummam</text>
            {/* Rues */}
            <path d="M296 22 L262 62 L232 112 L204 160 L172 220" fill="none" stroke="#ffffff" strokeWidth="9" strokeLinecap="round" />
            <path d="M178 204 L160 170 L140 124 L128 96" fill="none" stroke="#ffffff" strokeWidth="7" strokeLinecap="round" />
            <path d="M246 92 L200 100 L160 106 L110 112" fill="none" stroke="#ffffff" strokeWidth="5" strokeLinecap="round" />
            <text x="222" y="150" fontSize="9" fontWeight="700" fill="#8a8170" transform="rotate(-58 222 150)">N12</text>
            <text x="112" y="132" fontSize="8.5" fontWeight="600" fill="#8a8170" transform="rotate(65 112 132)">Bd Krim Belkacem</text>
            <text x="176" y="96" fontSize="8" fill="#8a8170">Rue Rabia Ali</text>

            {/* Trajet animé */}
            <path key={routeId} className="tl-route" d={route.path} fill="none" stroke="#b91c1c" strokeWidth="4.5"
                  strokeLinecap="round" strokeLinejoin="round" />
            <circle r="5.5" fill="#b91c1c" stroke="#fff" strokeWidth="2">
              <animateMotion key={routeId} dur={routeId === 'car' ? '3.2s' : '4.2s'} repeatCount="indefinite" path={route.path} />
            </circle>

            {/* Gare routière */}
            <circle cx="286" cy="34" r="9" fill="#1f2937" stroke="#fff" strokeWidth="2.5" />
            <text x="286" y="37.5" fontSize="9" fontWeight="800" fill="#fff" textAnchor="middle">G</text>
            <rect x="196" y="12" width="78" height="17" rx="8.5" fill="#fff" />
            <text x="235" y="24" fontSize="9" fontWeight="700" fill="#1f2937" textAnchor="middle">Gare routière</text>

            {/* Camden */}
            <path d="M146 136 C146 136 133 121 133 112 A13 13 0 0 1 159 112 C159 121 146 136 146 136 Z" fill="#b91c1c" stroke="#fff" strokeWidth="2" />
            <circle cx="146" cy="112" r="4.5" fill="#fff" />
            <rect x="42" y="102" width="82" height="20" rx="10" fill="#fff" stroke="#b91c1c" strokeWidth="1.2" />
            <text x="83" y="115.5" fontSize="10" fontWeight="800" fill="#b91c1c" textAnchor="middle">Camden</text>
          </svg>
          <span className="absolute bottom-2 right-2 rounded-full bg-white/95 px-2.5 py-1 text-xs font-bold shadow-sm">
            {route.time} · {route.dist}
          </span>
        </div>

        <ol className="mt-3 space-y-2">
          {route.steps.map((s, i) => (
            <li key={i} className="flex items-baseline gap-2.5 text-[14px]">
              <span className="text-xs font-black text-academy-primary tabular-nums">{String(i + 1).padStart(2, '0')}</span>
              <span className="font-medium leading-snug">{s}</span>
            </li>
          ))}
        </ol>
      </div>

      {showMap && (
        <iframe title="Carte : Camden International Institute, Béjaïa" loading="lazy" referrerPolicy="no-referrer-when-downgrade"
                src={`https://www.google.com/maps?q=${PLACE.to.lat},${PLACE.to.lng}&z=16&output=embed`}
                className="w-full h-64 rounded-xl border border-academy-border" />
      )}

      <div className="grid grid-cols-2 gap-2">
        <a href={directionsUrl(route.mode)} target="_blank" rel="noopener noreferrer"
           className="inline-flex items-center justify-center gap-1.5 py-3 rounded-xl bg-academy-primary text-academy-onPrimary font-bold text-sm">
          <Navigation size={16} /> Itinéraire
        </a>
        <button type="button" onClick={() => setShowMap(v => !v)}
                className="inline-flex items-center justify-center gap-1.5 py-3 rounded-xl border-2 border-academy-border font-bold text-sm">
          <MapIcon size={16} /> {showMap ? 'Masquer la carte' : 'Voir la carte'}
        </button>
      </div>
    </section>
  )
}
