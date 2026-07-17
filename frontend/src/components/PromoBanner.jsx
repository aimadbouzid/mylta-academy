import React from 'react'
import { Link } from 'react-router-dom'
import { Rocket, ArrowRight, Sparkles } from 'lucide-react'

export default function PromoBanner({ title, description, linkText, linkUrl }) {
  return (
    <div className="w-full bg-gradient-to-br from-indigo-900 to-purple-900 rounded-2xl p-6 sm:p-8 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl border border-white/10 group mt-4 mb-4">
      <div className="absolute top-0 right-0 w-64 h-64 bg-fuchsia-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-500/20 rounded-full blur-2xl translate-y-1/3 -translate-x-1/4 pointer-events-none"></div>
      
      <div className="flex items-start gap-4 z-10 w-full md:w-auto">
        <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center shrink-0 border border-white/20">
          <Rocket className="text-fuchsia-300" size={24} />
        </div>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-fuchsia-300 text-xs font-black uppercase tracking-widest flex items-center gap-1">
              <Sparkles size={12} /> Accélérez vos résultats
            </span>
          </div>
          <h3 className="text-xl md:text-2xl font-black font-display text-white mb-2">{title}</h3>
          <p className="text-indigo-200 text-sm md:text-base max-w-xl leading-relaxed">
            {description}
          </p>
        </div>
      </div>
      
      <Link 
        to={linkUrl} 
        className="shrink-0 w-full md:w-auto bg-white hover:bg-gray-50 text-indigo-900 font-bold py-3.5 px-8 rounded-xl transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)] text-center z-10 flex items-center justify-center gap-2 group-hover:scale-105"
      >
        {linkText} <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
      </Link>
    </div>
  )
}
