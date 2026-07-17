import React from 'react'
import { Server, Zap, Database, ArrowRight, TrendingDown, DollarSign, BrainCircuit, ShieldCheck, CheckCircle2 } from 'lucide-react'
import { useLanguage } from '../context/LanguageContext'

export default function CreditSavingDiagram() {
  const { t, currentLang } = useLanguage();
  
  // To handle LTR / RTL layout alignment based on language
  const isRtl = currentLang === 'ar';
  const marginStart = isRtl ? 'mr-auto' : 'ml-auto';
  const marginEnd = isRtl ? 'ml-auto' : 'mr-auto';

  return (
    <div className="bg-white rounded-2xl border border-academy-border shadow-sm p-6 lg:p-8" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-bold mb-3 border border-green-200">
          <ShieldCheck size={14} /> {t('credits_diagram.badge')}
        </div>
        <h2 className="text-2xl font-black text-academy-textMain mb-2">{t('credits_diagram.title')}</h2>
        <p className="text-academy-textMain/60 text-sm max-w-2xl mx-auto">
          {t('credits_diagram.subtitle')}
        </p>
      </div>

      <div className="relative max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
          
          {/* Step 1: Cache */}
          <div className="bg-white rounded-xl border-2 border-blue-100 shadow-sm hover:border-blue-300 transition-colors overflow-hidden flex flex-col">
            <div className="h-32 w-full relative">
              <img src="/credits/cache.png" alt="Database Cache" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-white to-transparent"></div>
              <div className="absolute bottom-[-16px] start-4 w-10 h-10 bg-white text-blue-600 rounded-xl flex items-center justify-center shadow-sm border border-blue-100 z-10">
                <Database size={20} />
              </div>
            </div>
            <div className="p-5 pt-6 flex-1 flex flex-col">
              <h3 className="font-bold text-academy-textMain text-sm mb-2">{t('credits_diagram.step1_title')}</h3>
              <p className="text-xs text-academy-textMain/70 leading-relaxed mb-4 flex-1">
                {t('credits_diagram.step1_desc')}
              </p>
              <div className="bg-blue-50 border border-blue-100 rounded p-2 text-[10px] text-blue-800 font-medium">
                {t('credits_diagram.step1_example')}
              </div>
            </div>
          </div>

          {/* Step 2: Routing / Modèles Rapides */}
          <div className="bg-white rounded-xl border-2 border-indigo-100 shadow-sm hover:border-indigo-300 transition-colors overflow-hidden flex flex-col">
            <div className="h-32 w-full relative">
              <img src="/credits/routing.png" alt="Fast Routing" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-white to-transparent"></div>
              <div className="absolute bottom-[-16px] start-4 w-10 h-10 bg-white text-indigo-600 rounded-xl flex items-center justify-center shadow-sm border border-indigo-100 z-10">
                <Zap size={20} />
              </div>
            </div>
            <div className="p-5 pt-6 flex-1 flex flex-col">
              <h3 className="font-bold text-academy-textMain text-sm mb-2">{t('credits_diagram.step2_title')}</h3>
              <p className="text-xs text-academy-textMain/70 leading-relaxed mb-4 flex-1">
                {t('credits_diagram.step2_desc')}
              </p>
              <div className="bg-indigo-50 border border-indigo-100 rounded p-2 text-[10px] text-indigo-800 font-medium">
                {t('credits_diagram.step2_example')}
              </div>
            </div>
          </div>

          {/* Step 3: Modèles Puissants */}
          <div className="bg-white rounded-xl border-2 border-purple-100 shadow-sm hover:border-purple-300 transition-colors overflow-hidden flex flex-col">
            <div className="h-32 w-full relative">
              <img src="/credits/processor.png" alt="Powerful AI Model" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-white to-transparent"></div>
              <div className="absolute bottom-[-16px] start-4 w-10 h-10 bg-white text-purple-600 rounded-xl flex items-center justify-center shadow-sm border border-purple-100 z-10">
                <BrainCircuit size={20} />
              </div>
            </div>
            <div className="p-5 pt-6 flex-1 flex flex-col">
              <h3 className="font-bold text-academy-textMain text-sm mb-2">{t('credits_diagram.step3_title')}</h3>
              <p className="text-xs text-academy-textMain/70 leading-relaxed mb-4 flex-1">
                {t('credits_diagram.step3_desc')}
              </p>
              <div className="bg-purple-50 border border-purple-100 rounded p-2 text-[10px] text-purple-800 font-medium">
                {t('credits_diagram.step3_example')}
              </div>
            </div>
          </div>

          {/* Step 4: Token Management */}
          <div className="bg-white rounded-xl border-2 border-orange-100 shadow-sm hover:border-orange-300 transition-colors overflow-hidden flex flex-col">
            <div className="h-32 w-full relative">
              <img src="/credits/tokens.png" alt="Token Management" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-white to-transparent"></div>
              <div className="absolute bottom-[-16px] start-4 w-10 h-10 bg-white text-orange-600 rounded-xl flex items-center justify-center shadow-sm border border-orange-100 z-10">
                <Server size={20} />
              </div>
            </div>
            <div className="p-5 pt-6 flex-1 flex flex-col">
              <h3 className="font-bold text-academy-textMain text-sm mb-2">{t('credits_diagram.step4_title')}</h3>
              <p className="text-xs text-academy-textMain/70 leading-relaxed mb-4 flex-1">
                {t('credits_diagram.step4_desc')}
              </p>
              <div className="bg-orange-50 border border-orange-100 rounded p-2 text-[10px] text-orange-800 font-medium">
                {t('credits_diagram.step4_example')}
              </div>
            </div>
          </div>

        </div>
      </div>

      <div className="mt-12 bg-slate-50 border border-slate-200 rounded-xl p-5 md:p-6 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h4 className="font-bold text-academy-textMain mb-2 flex items-center gap-2">
            <TrendingDown size={18} className="text-green-600" /> {t('credits_diagram.result_title')}
          </h4>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
            <li className="flex items-center gap-2 text-xs text-academy-textMain/70">
              <CheckCircle2 size={16} className="text-green-500 shrink-0" /> {t('credits_diagram.result_1')}
            </li>
            <li className="flex items-center gap-2 text-xs text-academy-textMain/70">
              <CheckCircle2 size={16} className="text-green-500 shrink-0" /> {t('credits_diagram.result_2')}
            </li>
            <li className="flex items-center gap-2 text-xs text-academy-textMain/70">
              <CheckCircle2 size={16} className="text-green-500 shrink-0" /> {t('credits_diagram.result_3')}
            </li>
            <li className="flex items-center gap-2 text-xs text-academy-textMain/70">
              <CheckCircle2 size={16} className="text-green-500 shrink-0" /> {t('credits_diagram.result_4')}
            </li>
          </ul>
        </div>
        <div className={`bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center justify-center min-w-[200px] ${marginStart} md:m-0`}>
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">{t('credits_diagram.savings')}</span>
          <div className="text-3xl font-black text-green-600 flex items-center">
            <DollarSign size={24} className={isRtl ? "ml-1 opacity-50" : "-mr-1 opacity-50"} />
            {t('credits_diagram.amount')}
          </div>
        </div>
      </div>
    </div>
  )
}
