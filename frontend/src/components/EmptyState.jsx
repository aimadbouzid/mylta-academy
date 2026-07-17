import React from 'react'
import { SearchX } from 'lucide-react'

export default function EmptyState({ message = "Aucun résultat trouvé.", subMessage = "Essayez de modifier votre recherche ou vos filtres.", onReset }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 bg-white/5 border border-academy-border/50 rounded-3xl w-full text-center">
      <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4 border border-gray-200">
        <SearchX className="text-gray-400" size={32} />
      </div>
      <h3 className="text-xl font-bold text-academy-textMain font-display mb-2">{message}</h3>
      <p className="text-academy-textMain/60 max-w-sm mx-auto mb-6">
        {subMessage}
      </p>
      {onReset && (
        <button 
          onClick={onReset}
          className="bg-academy-primary/10 hover:bg-academy-primary/20 text-academy-primary font-bold py-2 px-6 rounded-full transition-colors"
        >
          Réinitialiser la recherche
        </button>
      )}
    </div>
  )
}
