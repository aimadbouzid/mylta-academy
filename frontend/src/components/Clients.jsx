import { CLIENTS } from '../data/clients'

// Les entreprises qui nous ont confié leurs tournages, en bandeau qui défile.
// Le défilement est une animation CSS sur une liste écrite deux fois : la
// seconde reprend là où la première finit, donc la boucle ne se voit pas, et
// rien ne tourne en JavaScript. Le bandeau s'arrête quand on le survole.

export default function Clients() {
  if (!CLIENTS.length) return null

  return (
    <section className="py-8 lg:py-12 border-t border-academy-border">
      <div className="section-container">
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-academy-primary">Ils nous font confiance</p>
        <h2 className="mt-1 font-display font-black text-2xl sm:text-3xl tracking-tight text-academy-textMain">
          {CLIENTS.length} entreprises nous ont confié leurs vidéos
        </h2>
        <p className="mt-1.5 text-[15px] text-academy-textMain/60 max-w-xl">
          Hôtels, agences de voyage, promotion immobilière, commerces. C'est ce travail que nous enseignons.
        </p>
      </div>

      <div className="mt-6 bandeau-clients">
        <div className="bandeau-clients-piste">
          {[0, 1].map(copie => (
            <ul key={copie} aria-hidden={copie === 1} className="flex items-center gap-4 sm:gap-7 pe-4 sm:pe-7 shrink-0">
              {CLIENTS.map(c => (
                <li key={c.nom} className="shrink-0">
                  <img src={c.logo} alt={copie === 0 ? c.nom : ''} loading="lazy" decoding="async"
                       width="300" height="300"
                       className="w-14 h-14 sm:w-20 sm:h-20 rounded-full object-cover bg-white border border-academy-border
                                  grayscale opacity-80 transition duration-300 hover:grayscale-0 hover:opacity-100" />
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>
    </section>
  )
}
