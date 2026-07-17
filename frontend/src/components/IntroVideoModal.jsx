// IntroVideoModal.jsx — Modal de vidéo de présentation/introduction pour Mylta Academy
import { X, Volume2, Sparkles } from 'lucide-react'

export default function IntroVideoModal({ onClose }) {
  // Ajout de playsinline=1 très important pour iOS (Apple) pour éviter le lag d'ouverture du lecteur natif
  const videoUrl = "https://www.youtube.com/embed/M7lc1UVf-VE?autoplay=1&rel=0&playsinline=1&modestbranding=1" // URL YouTube

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center p-4 sm:p-6"
      onClick={onClose}
    >
      {/* Backdrop sombre et flou */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md animate-fade-in" />

      {/* Container de la modal */}
      <div
        className="relative w-full max-w-3xl bg-red-950/10 border-red-900/15 backdrop-blur-2xl border border-academy-border/50
                   rounded-2xl shadow-soft-lg animate-fade-up overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* En-tête */}
        <div className="px-5 py-4 border-b border-academy-border/60 flex items-center justify-between bg-academy-surfaceDark/80 backdrop-blur-md relative z-20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-academy-primary/15 border border-academy-primary/30 flex items-center justify-center text-academy-primary">
              <Sparkles size={20} />
            </div>
            <div>
              <h2 className="font-display font-bold text-academy-textMain text-base sm:text-lg leading-tight">
                Découvrez <span className="text-academy-primary">Mylta Academy</span>
              </h2>
              <p className="text-academy-textMain/50 text-xs mt-0.5 hidden sm:block">
                La plateforme d'excellence en Algérie
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-academy-surface border border-academy-border hover:bg-white text-academy-textMain/50 hover:text-academy-textMain
                       flex items-center justify-center transition-all focus:outline-none shadow-sm"
            aria-label="Fermer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Zone Vidéo — 16:9 */}
        <div className="relative w-full aspect-video bg-[#0f172a] flex items-center justify-center overflow-hidden">
          {/* Lecteur YouTube */}
          <iframe
            width="100%"
            height="100%"
            src={videoUrl}
            title="Vidéo de présentation Mylta Academy"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full object-cover"
          ></iframe>
        </div>

        {/* Pied de la modal */}
        <div className="px-5 py-4 border-t border-academy-border/60 bg-academy-surfaceDark/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
          <span className="text-academy-textMain/50 flex items-center gap-2 font-medium">
            <div className="w-6 h-6 rounded-full bg-academy-primary/10 flex items-center justify-center">
              <Volume2 size={12} className="text-academy-primary" />
            </div>
            Activez le son pour une immersion totale
          </span>
          <button
            onClick={onClose}
            className="btn-primary py-2.5 px-6 font-semibold shadow-md w-full sm:w-auto justify-center"
          >
            Fermer la vidéo
          </button>
        </div>
      </div>
    </div>
  )
}
