import React, { useState } from 'react'
import { 
  BookOpen, Sparkles, Zap, Flame, CheckCircle2, Copy, Check, 
  HelpCircle, ArrowRight, Video, Target, Brain, Bot, DollarSign, 
  TrendingUp, Award, Layers, Search, Filter, ShieldCheck, ChevronDown, ChevronUp, Star, Lightbulb, AlertTriangle
} from 'lucide-react'
import { useLanguage } from '../context/LanguageContext'
import { contentEmpireMultilingual } from '../data/contentEmpireData'

export default function ContentEmpireSection() {
  const { currentLang, changeLanguage } = useLanguage()
  const isAr = currentLang === 'ar'
  const isEn = currentLang === 'en'

  // Extract data based on active language (fr, ar, en)
  const langData = contentEmpireMultilingual[currentLang] || contentEmpireMultilingual['fr']
  const { 
    bookInfo, chapters, viralFramework, hookCategories, sampleHooks, 
    scriptNiches, sampleScripts, psychologyAndAlgo, aiToolkitData, premiumToolkit 
  } = langData

  const [subTab, setSubTab] = useState('chapters') // 'chapters' | 'framework' | 'hooks' | 'scripts' | 'psychology' | 'ai' | 'premium'
  const [activeChapterId, setActiveChapterId] = useState(1)
  const [chapterSubTab, setChapterSubTab] = useState('intro') // 'intro' | 'concepts' | 'examples' | 'errors' | 'checklist' | 'exercise'
  
  // Chapters Filter & Search State
  const [chapterSearch, setChapterSearch] = useState('')

  // Hooks Filter & Search State
  const [hookCat, setHookCat] = useState('all')
  const [hookSearch, setHookSearch] = useState('')
  const [copiedHookIndex, setCopiedHookIndex] = useState(null)

  // Scripts Filter & Search State
  const [scriptNiche, setScriptNiche] = useState('all')
  const [scriptSearch, setScriptSearch] = useState('')
  const [copiedScriptIndex, setCopiedScriptIndex] = useState(null)

  // Checked items state for chapter checklists
  const [checkedChecklistItems, setCheckedChecklistItems] = useState({})

  const activeChapter = chapters.find(c => c.id === activeChapterId) || chapters[0]

  const handleCopyHook = (text, idx) => {
    navigator.clipboard.writeText(text)
    setCopiedHookIndex(idx)
    setTimeout(() => setCopiedHookIndex(null), 2000)
  }

  const handleCopyScript = (script, idx) => {
    const fullText = `[HOOK]\n${script.hook}\n\n[BUILD-UP]\n${script.buildup}\n\n[VALUE / VALEUR]\n${script.valeur}\n\n[TWIST]\n${script.twist}\n\n[CTA]\n${script.cta}`
    navigator.clipboard.writeText(fullText)
    setCopiedScriptIndex(idx)
    setTimeout(() => setCopiedScriptIndex(null), 2000)
  }

  const toggleChecklistItem = (chapId, idx) => {
    const key = `${chapId}-${idx}`
    setCheckedChecklistItems(prev => ({ ...prev, [key]: !prev[key] }))
  }

  // Filter Chapters
  const filteredChapters = chapters.filter(c => {
    const searchLower = chapterSearch.toLowerCase()
    return !chapterSearch || 
      c.title.toLowerCase().includes(searchLower) ||
      c.subtitle.toLowerCase().includes(searchLower) ||
      c.intro?.toLowerCase().includes(searchLower)
  })

  // Filter Hooks
  const filteredHooks = sampleHooks.filter(h => {
    const matchesCat = hookCat === 'all' || h.cat === hookCat
    const matchesSearch = !hookSearch || h.text.toLowerCase().includes(hookSearch.toLowerCase()) || h.psych.toLowerCase().includes(hookSearch.toLowerCase())
    return matchesCat && matchesSearch
  })

  // Filter Scripts
  const filteredScripts = sampleScripts.filter(s => {
    const matchesNiche = scriptNiche === 'all' || s.niche === scriptNiche
    const matchesSearch = !scriptSearch || 
      s.title.toLowerCase().includes(scriptSearch.toLowerCase()) || 
      s.hook.toLowerCase().includes(scriptSearch.toLowerCase()) ||
      s.valeur.toLowerCase().includes(scriptSearch.toLowerCase())
    return matchesNiche && matchesSearch
  })

  // Helper text translations
  const getText = (frStr, arStr, enStr) => {
    if (isAr) return arStr
    if (isEn) return enStr
    return frStr
  }

  return (
    <div className={`w-full space-y-8 animate-fadeIn ${isAr ? 'text-right' : 'text-left'}`}>
      


      {/* NAVIGATION INTERNE CONTENT EMPIRE - SUB TABS */}
      <div className="bg-academy-surface p-1.5 sm:p-2 rounded-2xl border border-academy-border shadow-sm grid grid-cols-2 sm:flex sm:flex-wrap gap-1.5 sm:gap-2">
        <button
          onClick={() => setSubTab('chapters')}
          className={`flex flex-row items-center justify-start gap-1.5 sm:gap-2 px-2.5 py-2 sm:px-4 sm:py-2.5 rounded-xl text-[10px] sm:text-sm font-bold transition-all text-left ${
            subTab === 'chapters' 
              ? 'bg-slate-900 text-amber-400 shadow-md border border-slate-800' 
              : 'text-slate-600 dark:text-academy-textMain/60 hover:text-slate-900 hover:bg-slate-100/70 border border-transparent'
          }`}
        >
          <BookOpen size={16} className="sm:w-4 sm:h-4 shrink-0" /> 
          <span className="truncate">{getText("12 Chapitres", "12 فصلاً", "12 Chapters")}</span>
        </button>

      </div>

      {/* ----------------------------------------------------------------------------------- */}
      {/* SECTION 1: 12 CHAPITRES DU LIVRE */}
      {/* ----------------------------------------------------------------------------------- */}
      {subTab === 'chapters' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Menu latéral des 12 chapitres */}
          <div className="lg:col-span-4 space-y-4">
            <div className="space-y-2.5">
              <h3 className="text-xs font-black uppercase text-slate-400 dark:text-academy-textMain/40 tracking-wider px-1">
                {getText("Table des Matières (12 Chapitres)", "فهرس المحتويات (12 فصلاً)", "Table of Contents (12 Chapters)")}
              </h3>
              
              {/* Barre de Recherche des Chapitres */}
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-academy-textMain/40" size={16} />
                <input
                  type="text"
                  placeholder={getText("Rechercher un cours...", "ابحث عن درس...", "Search lesson...")}
                  value={chapterSearch}
                  onChange={(e) => setChapterSearch(e.target.value)}
                  className="w-full bg-white/60 dark:bg-academy-surfaceDark/60 backdrop-blur-md border border-slate-200/50 rounded-xl py-2 pl-9 pr-3 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1.5 max-h-[750px] overflow-y-auto pr-1 hide-scrollbar">
              {filteredChapters.length === 0 ? (
                <div className="text-center py-4 text-xs text-slate-500 dark:text-academy-textMain/50">
                  {getText("Aucun chapitre trouvé", "لم يتم العثور على أي فصل", "No chapter found")}
                </div>
              ) : (
                filteredChapters.map((c) => {
                const isActive = c.id === activeChapterId
                return (
                  <button
                    key={c.id}
                    onClick={() => { setActiveChapterId(c.id); setChapterSubTab('intro'); }}
                    className={`w-full text-left p-2 sm:p-3.5 rounded-xl sm:rounded-2xl transition-all border flex items-center sm:items-start gap-2 sm:gap-3.5 ${
                      isActive 
                        ? 'bg-slate-900 text-white border-slate-800 shadow-lg' 
                        : 'bg-academy-surface hover:bg-slate-100/80 text-slate-700 dark:text-academy-textMain/75 border-academy-border'
                    }`}
                  >
                    <span className={`text-[10px] sm:text-xs font-black px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-md sm:rounded-lg shrink-0 ${
                      isActive ? 'bg-amber-400 text-slate-950' : 'bg-slate-200 text-slate-700 dark:text-academy-textMain/75'
                    }`}>
                      {c.number}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="text-[11px] sm:text-xs font-extrabold truncate">{c.title}</div>
                      <div className={`text-[9px] sm:text-[11px] truncate mt-0.5 ${isActive ? 'text-slate-300' : 'text-slate-500 dark:text-academy-textMain/50'}`}>
                        {c.readTime} <span className="hidden sm:inline">• {c.subtitle}</span>
                      </div>
                    </div>
                  </button>
                )
              }))}
            </div>
          </div>

          {/* Vue détaillée du chapitre actif */}
          <div className="lg:col-span-8 bg-academy-surface rounded-3xl border border-academy-border p-6 sm:p-8 space-y-6 shadow-sm">
            
            {/* Chapitre Header */}
            <div className="border-b border-academy-border pb-6 space-y-2">
              <div className="flex items-center justify-between">
                <span className="bg-amber-100 dark:bg-amber-500/15 text-amber-800 dark:text-amber-300 text-xs font-black px-2.5 py-1 rounded-lg border border-amber-200 dark:border-amber-500/25">
                  {getText(`CHAPITRE ${activeChapter.number}`, `الفصل ${activeChapter.number}`, `CHAPTER ${activeChapter.number}`)}
                </span>
                <span className="text-xs font-medium text-slate-400 dark:text-academy-textMain/40">
                  {getText(`Temps de lecture : ${activeChapter.readTime}`, `وقت القراءة: ${activeChapter.readTime}`, `Reading time: ${activeChapter.readTime}`)}
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-academy-textMain leading-tight">
                {activeChapter.title}
              </h2>

              <p className="text-sm text-slate-600 dark:text-academy-textMain/60 font-medium">
                {activeChapter.subtitle}
              </p>
            </div>

            {/* Contenu du Chapitre (Flux continu) */}
            <div className="space-y-10 text-slate-700 dark:text-academy-textMain/75 leading-relaxed text-sm">
              
              {/* Intro */}
              <div className="space-y-4">
                <div className="bg-amber-500/10 border-l-4 border-amber-500 p-4 rounded-r-2xl">
                  <p className="text-amber-950 font-medium italic">
                    "{activeChapter.intro}"
                  </p>
                </div>
                <p>
                  {getText(
                    "Ce chapitre vous livre les fondations techniques pour maîtriser cet aspect essentiel de la création de contenu viral en 2026.",
                    "يقدم لك هذا الفصل الأسس الفنية لاحتراف هذا الجانب الأساسي من إنتاج المحتوى الفيروسي لعام 2026.",
                    "This chapter delivers technical foundations to master this essential aspect of viral content creation in 2026."
                  )}
                </p>
              </div>

              {/* Concepts */}
              {activeChapter.concepts && activeChapter.concepts.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 border-b border-slate-200 dark:border-academy-border pb-2">
                    <span className="text-xl">💡</span>
                    <h4 className="font-bold text-slate-900 dark:text-academy-textMain text-lg">{getText("Concepts Clés", "المفاهيم الأساسية", "Key Concepts")}</h4>
                  </div>
                  <div className="grid gap-3">
                    {activeChapter.concepts.map((concept, idx) => (
                      <div key={idx} className="p-4 bg-white/60 dark:bg-academy-surfaceDark/60 backdrop-blur-md border border-slate-200/50 rounded-2xl space-y-1 shadow-sm hover:shadow-md transition-shadow">
                        <div className="font-extrabold text-slate-900 dark:text-academy-textMain flex items-center gap-2 text-sm">
                          <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                          {concept.name}
                        </div>
                        <p className="text-xs text-slate-600 dark:text-academy-textMain/60">{concept.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Examples */}
              {activeChapter.examples && activeChapter.examples.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 border-b border-slate-200 dark:border-academy-border pb-2">
                    <span className="text-xl">🎯</span>
                    <h4 className="font-bold text-slate-900 dark:text-academy-textMain text-lg">{getText("Exemples", "أمثلة عملية", "Examples")}</h4>
                  </div>
                  <div className="space-y-3">
                    {activeChapter.examples.map((ex, idx) => (
                      <div key={idx} className="p-4 bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/25 text-emerald-950 rounded-2xl flex items-start gap-3">
                        <CheckCircle2 size={18} className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                        <div className="text-xs font-medium">{ex}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Errors */}
              {activeChapter.errors && activeChapter.errors.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 border-b border-slate-200 dark:border-academy-border pb-2">
                    <span className="text-xl">⚠️</span>
                    <h4 className="font-bold text-slate-900 dark:text-academy-textMain text-lg">{getText("Erreurs", "أخطاء للتجنب", "Errors")}</h4>
                  </div>
                  <div className="space-y-3">
                    {activeChapter.errors.map((err, idx) => (
                      <div key={idx} className="p-4 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/25 text-rose-950 rounded-2xl flex items-start gap-3">
                        <AlertTriangle size={18} className="text-rose-500 shrink-0 mt-0.5" />
                        <div className="text-xs font-medium">{err}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Checklist */}
              {activeChapter.checklist && activeChapter.checklist.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 border-b border-slate-200 dark:border-academy-border pb-2">
                    <span className="text-xl">✅</span>
                    <h4 className="font-bold text-slate-900 dark:text-academy-textMain text-lg">{getText("Checklist d'Action", "قائمة التحقق والتطبيق", "Action Checklist")}</h4>
                  </div>
                  <div className="space-y-2">
                    {activeChapter.checklist.map((item, idx) => {
                      const isChecked = !!checkedChecklistItems[`${activeChapter.id}-${idx}`]
                      return (
                        <div 
                          key={idx} 
                          onClick={() => toggleChecklistItem(activeChapter.id, idx)}
                          className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center gap-4 ${
                            isChecked ? 'bg-green-50 dark:bg-green-500/10 border-green-200 dark:border-green-500/25 text-green-800 dark:text-green-300' : 'bg-white dark:bg-academy-surfaceDark border-slate-200 dark:border-academy-border text-slate-700 dark:text-academy-textMain/75 hover:bg-slate-50'
                          }`}
                        >
                          <input 
                            type="checkbox" 
                            checked={isChecked} 
                            onChange={() => {}} 
                            className="rounded border-slate-300 text-amber-500 focus:ring-amber-400"
                          />
                          <span className={`text-xs font-medium ${isChecked ? 'line-through opacity-80' : ''}`}>
                            {item}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Exercise */}
              {activeChapter.exercise && (
                <div className="space-y-4">
                  <div className="p-5 bg-purple-50/50 border border-purple-100 dark:border-purple-500/20 rounded-2xl space-y-3">
                    <div className="flex items-center gap-2 text-purple-700 dark:text-purple-300 font-bold text-sm">
                      <Flame size={18} /> {getText("Exercice Pratique d'Application", "تمرين تطبيقي عملي", "Practical Application Exercise")}
                    </div>
                    <p className="text-xs text-purple-900/80 leading-relaxed font-medium">
                      {activeChapter.exercise}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Footer Navigation inter-chapitres */}
            <div className="pt-4 border-t border-academy-border flex items-center justify-between text-xs font-bold">
              <button
                disabled={activeChapterId === 1}
                onClick={() => { setActiveChapterId(prev => Math.max(1, prev - 1)); setChapterSubTab('intro'); }}
                className={`px-4 py-2 rounded-xl border transition-all ${
                  activeChapterId === 1 ? 'opacity-30 cursor-not-allowed border-slate-200 dark:border-academy-border' : 'bg-slate-100 dark:bg-white/10 hover:bg-slate-200 border-slate-300 text-slate-800 dark:text-academy-textMain/85'
                }`}
              >
                {getText("← Chapitre Précédent", "← الفصل السابق", "← Previous Chapter")}
              </button>

              <button
                disabled={activeChapterId === 12}
                onClick={() => { setActiveChapterId(prev => Math.min(12, prev + 1)); setChapterSubTab('intro'); }}
                className={`px-4 py-2 rounded-xl border transition-all ${
                  activeChapterId === 12 ? 'opacity-30 cursor-not-allowed border-slate-200 dark:border-academy-border' : 'bg-slate-900 hover:bg-slate-800 text-white border-slate-900'
                }`}
              >
                {getText("Chapitre Suivant →", "الفصل التالي →", "Next Chapter →")}
              </button>
            </div>

          </div>

        </div>
      )}

      {/* ----------------------------------------------------------------------------------- */}
      {/* SECTION 2: MÉTHODE EXCLUSIVE V.I.R.A.L FRAMEWORK™ */}
      {/* ----------------------------------------------------------------------------------- */}
      {subTab === 'framework' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-purple-900 via-slate-900 to-purple-950 p-6 sm:p-8 rounded-3xl text-white border border-purple-500/30 space-y-3">
            <div className="flex items-center gap-2">
              <span className="bg-purple-500/30 text-purple-300 text-xs font-black px-3 py-1 rounded-full border border-purple-400/30">
                {getText("MÉTHODE PROPRIÉTAIRE EXCLUSIVE", "منهجية حصرية مبتكرة", "EXCLUSIVE PROPRIETARY METHOD")}
              </span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-amber-300">
              V.I.R.A.L Framework™
            </h2>
            <p className="text-sm text-slate-300 max-w-3xl leading-relaxed">
              {getText(
                "Le système à 5 piliers mis au point pour garantir un taux de complétion maximal et une viralité prédictible.",
                "النظام الخماسي المبتكر لضمان معدل إكمال أقصى، انتشار فيروزي مضمون وتحويل مستمر للمشاهدين عبر المنصات الحديثة.",
                "The 5-pillar system engineered to guarantee maximum completion rates and predictable virality."
              )}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {viralFramework.map((item) => (
              <div key={item.letter} className="bg-academy-surface border border-academy-border p-5 rounded-2xl space-y-3 hover:shadow-md transition-all">
                <div className="w-12 h-12 rounded-2xl bg-purple-950 text-amber-400 font-black text-2xl flex items-center justify-center border border-purple-800 shadow-inner">
                  {item.letter}
                </div>
                <h3 className="font-extrabold text-slate-900 dark:text-academy-textMain text-sm">{item.title}</h3>
                <p className="text-xs text-slate-500 dark:text-academy-textMain/50 leading-snug">{item.subtitle}</p>
              </div>
            ))}
          </div>

          <div className="space-y-6">
            {viralFramework.map((item) => (
              <div key={item.letter} className="bg-academy-surface border border-academy-border rounded-3xl p-6 sm:p-8 space-y-5 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-academy-border pb-4">
                  <div className="flex items-center gap-3">
                    <span className="w-10 h-10 rounded-xl bg-slate-900 text-amber-400 font-black text-xl flex items-center justify-center">
                      {item.letter}
                    </span>
                    <div>
                      <h3 className="text-lg font-black text-slate-900 dark:text-academy-textMain">{item.title}</h3>
                      <p className="text-xs text-slate-500 dark:text-academy-textMain/50">{item.subtitle}</p>
                    </div>
                  </div>
                  <span className="bg-purple-100 dark:bg-purple-500/15 text-purple-800 dark:text-purple-300 text-xs font-bold px-3 py-1 rounded-lg border border-purple-200 dark:border-purple-500/25">
                    {getText(`Étape ${item.letter}`, `الركيزة ${item.letter}`, `Pillar ${item.letter}`)}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-200/80 space-y-1">
                    <span className="font-bold text-slate-900 dark:text-academy-textMain text-xs uppercase tracking-wider block text-purple-700 dark:text-purple-300">🎯 {getText("Objectif :", "الهدف الرئيسي:", "Objective:")}</span>
                    <p className="text-slate-700 dark:text-academy-textMain/75 font-medium">{item.objectif}</p>
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-200/80 space-y-1">
                    <span className="font-bold text-slate-900 dark:text-academy-textMain text-xs uppercase tracking-wider block text-indigo-700 dark:text-indigo-300">🧠 {getText("Psychologie Cognitives :", "علم النفس المعرفي:", "Cognitive Psychology:")}</span>
                    <p className="text-slate-700 dark:text-academy-textMain/75 font-medium">{item.psychologie}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div className="p-4 bg-rose-50 dark:bg-rose-500/10 rounded-2xl border border-rose-200 dark:border-rose-500/25 space-y-2">
                    <span className="font-bold text-rose-800 dark:text-rose-300 flex items-center gap-1.5 text-xs">
                      <AlertTriangle size={14} /> {getText("Erreurs Fatales :", "أخطاء قاتلة:", "Fatal Mistakes:")}
                    </span>
                    <ul className="space-y-1 text-rose-950 font-medium list-disc list-inside">
                      {item.erreurs.map((err, i) => <li key={i}>{err}</li>)}
                    </ul>
                  </div>

                  <div className="p-4 bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl border border-emerald-200 dark:border-emerald-500/25 space-y-2">
                    <span className="font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5 text-xs">
                      <CheckCircle2 size={14} /> {getText("Exemples Concrets :", "أمثلة تطبيقية:", "Concrete Examples:")}
                    </span>
                    <ul className="space-y-1 text-emerald-950 font-medium list-disc list-inside">
                      {item.exemples.map((ex, i) => <li key={i}>{ex}</li>)}
                    </ul>
                  </div>

                  <div className="p-4 bg-amber-50 dark:bg-amber-500/10 rounded-2xl border border-amber-200 dark:border-amber-500/25 space-y-2">
                    <span className="font-bold text-amber-900 flex items-center gap-1.5 text-xs">
                      <Lightbulb size={14} /> {getText("Cas Réel :", "حالة واقعية:", "Real Case:")}
                    </span>
                    <p className="text-amber-950 font-medium italic">{item.casReels}</p>
                  </div>
                </div>

                <div className="p-4 bg-slate-900 text-white rounded-2xl flex items-center justify-between gap-4 text-xs">
                  <div>
                    <span className="text-amber-400 font-bold block">💡 {getText("Conseil d'expert V.I.R.A.L™ :", "نصيحة خبير V.I.R.A.L™:", "V.I.R.A.L™ Expert Tip:")}</span>
                    <span className="text-slate-300 font-medium">{item.conseilsExpert}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ----------------------------------------------------------------------------------- */}
      {/* SECTION 3: GUIDE ULTIME DES HOOKS VIRAUX */}
      {/* ----------------------------------------------------------------------------------- */}
      {subTab === 'hooks' && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-academy-surface p-6 rounded-3xl border border-academy-border shadow-sm">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-academy-textMain flex items-center gap-2">
                <Target className="text-emerald-600 dark:text-emerald-400" /> {getText("Bibliothèque Ultime de 1,000+ Hooks Viraux", "مكتبة +1,000 خطاف فيروسي", "Ultimate 1,000+ Viral Hooks Library")}
              </h2>
              <p className="text-xs text-slate-500 dark:text-academy-textMain/50 mt-1">
                {getText("Classés par plateforme et biais psychologique sous-jacent. Cliquez pour copier.", "مصنفة حسب المنصة والدافع النفسي. انقر للنسخ الفوري.", "Categorized by platform and cognitive bias. Click to copy instantly.")}
              </p>
            </div>

            {/* Barre de Recherche des Hooks */}
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-academy-textMain/40" size={16} />
              <input
                type="text"
                placeholder={getText("Mot clé...", "كلمة مفتاحية...", "Keyword...")}
                value={hookSearch}
                onChange={(e) => setHookSearch(e.target.value)}
                className="w-full bg-white/60 dark:bg-academy-surfaceDark/60 backdrop-blur-md border border-slate-200/50 rounded-xl py-2 pl-9 pr-3 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
              />
            </div>
          </div>

          {/* Filtres par Catégories */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setHookCat('all')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                hookCat === 'all' ? 'bg-emerald-600 text-white shadow-sm' : 'bg-academy-surface text-slate-600 dark:text-academy-textMain/60 border border-academy-border hover:bg-slate-100'
              }`}
            >
              {getText("Tous les Hooks", "كل الخطافات", "All Hooks")}
            </button>
            {hookCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setHookCat(cat.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  hookCat === cat.id ? 'bg-emerald-600 text-white shadow-sm' : 'bg-academy-surface text-slate-600 dark:text-academy-textMain/60 border border-academy-border hover:bg-slate-100'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Liste des Hooks */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredHooks.map((h, idx) => (
              <div key={idx} className="bg-academy-surface border border-academy-border p-5 rounded-2xl space-y-3 hover:border-emerald-300 transition-all flex flex-col justify-between group">
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="bg-emerald-100 dark:bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 text-[10px] font-black px-2.5 py-0.5 rounded-md uppercase border border-emerald-200 dark:border-emerald-500/25">
                      {h.cat}
                    </span>
                    <button
                      onClick={() => handleCopyHook(h.text, idx)}
                      className="text-slate-400 dark:text-academy-textMain/40 hover:text-emerald-600 transition-colors p-1"
                      title={getText("Copier le hook", "نسخ الخطاف", "Copy hook")}
                    >
                      {copiedHookIndex === idx ? <Check size={16} className="text-emerald-600 dark:text-emerald-400" /> : <Copy size={16} />}
                    </button>
                  </div>
                  <p className="text-sm font-extrabold text-slate-900 dark:text-academy-textMain leading-snug">
                    "{h.text}"
                  </p>
                </div>
                <div className="pt-3 border-t border-slate-100 dark:border-academy-border text-[11px] text-slate-500 dark:text-academy-textMain/50 font-medium flex items-center gap-1.5">
                  <Brain size={12} className="text-purple-500 shrink-0" />
                  <span>{getText("Psychologie : ", "علم النفس: ", "Psychology: ")}<strong className="text-slate-700 dark:text-academy-textMain/75">{h.psych}</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ----------------------------------------------------------------------------------- */}
      {/* SECTION 4: 300+ SCRIPTS VIRAUX PAR NICHE */}
      {/* ----------------------------------------------------------------------------------- */}
      {subTab === 'scripts' && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-academy-surface p-6 rounded-3xl border border-academy-border shadow-sm">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-academy-textMain flex items-center gap-2">
                <Video className="text-cyan-600 dark:text-cyan-400" /> {getText("Bibliothèque de +300 Scripts Viraux Décodés", "مكتبة +300 سيناريو فيروسي", "300+ Decoded Viral Scripts Library")}
              </h2>
              <p className="text-xs text-slate-500 dark:text-academy-textMain/50 mt-1">
                {getText("Structures à 5 temps prêtes pour le prompteur.", "هياكل خماسية جاهزة للتصوير عبر جهاز الملقن.", "5-stage structures ready for teleprompter.")}
              </p>
            </div>

            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-academy-textMain/40" size={16} />
              <input
                type="text"
                placeholder={getText("Rechercher un script...", "ابحث عن سكريبت...", "Search script...")}
                value={scriptSearch}
                onChange={(e) => setScriptSearch(e.target.value)}
                className="w-full bg-white/60 dark:bg-academy-surfaceDark/60 backdrop-blur-md border border-slate-200/50 rounded-xl py-2 pl-9 pr-3 text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-colors"
              />
            </div>
          </div>

          {/* Filtres par Niche */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setScriptNiche('all')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                scriptNiche === 'all' ? 'bg-cyan-600 text-white shadow-sm' : 'bg-academy-surface text-slate-600 dark:text-academy-textMain/60 border border-academy-border hover:bg-slate-100'
              }`}
            >
              {getText("Toutes les Niches", "كل المجالات", "All Niches")}
            </button>
            {scriptNiches.map((niche) => (
              <button
                key={niche.id}
                onClick={() => setScriptNiche(niche.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  scriptNiche === niche.id ? 'bg-cyan-600 text-white shadow-sm' : 'bg-academy-surface text-slate-600 dark:text-academy-textMain/60 border border-academy-border hover:bg-slate-100'
                }`}
              >
                {niche.name}
              </button>
            ))}
          </div>

          {/* Cartes des Scripts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredScripts.map((script, idx) => (
              <div key={idx} className="bg-academy-surface border border-academy-border rounded-3xl p-6 space-y-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-academy-border pb-3">
                    <span className="bg-cyan-100 dark:bg-cyan-500/15 text-cyan-800 dark:text-cyan-300 text-xs font-black px-2.5 py-1 rounded-lg uppercase border border-cyan-200 dark:border-cyan-500/25">
                      {getText(`Niche : ${script.niche}`, `المجال: ${script.niche}`, `Niche: ${script.niche}`)}
                    </span>
                    <button
                      onClick={() => handleCopyScript(script, idx)}
                      className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5"
                    >
                      {copiedScriptIndex === idx ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                      {copiedScriptIndex === idx ? getText('Copié !', 'تم النسخ!', 'Copied!') : getText('Copier Script', 'نسخ السيناريو', 'Copy Script')}
                    </button>
                  </div>

                  <h3 className="font-black text-slate-900 dark:text-academy-textMain text-base">{script.title}</h3>

                  <div className="space-y-2 text-xs">
                    <div className="p-3 bg-amber-50 dark:bg-amber-500/10 rounded-xl border border-amber-200/80">
                      <strong className="text-amber-900 block font-black uppercase text-[10px]">🪝 1. Hook (0-3s) :</strong>
                      <p className="text-amber-950 font-bold mt-0.5">"{script.hook}"</p>
                    </div>

                    <div className="p-3 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-200/80">
                      <strong className="text-slate-700 dark:text-academy-textMain/75 block font-black uppercase text-[10px]">📈 2. Build-up ({getText("Tension", "التوتر", "Tension")}) :</strong>
                      <p className="text-slate-800 dark:text-academy-textMain/85 font-medium mt-0.5">{script.buildup}</p>
                    </div>

                    <div className="p-3 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl border border-emerald-200/80">
                      <strong className="text-emerald-900 block font-black uppercase text-[10px]">💡 3. {getText("Valeur Core", "القيمة الجوهرية", "Core Value")} :</strong>
                      <p className="text-emerald-950 font-medium mt-0.5">{script.valeur}</p>
                    </div>

                    <div className="p-3 bg-purple-50 dark:bg-purple-500/10 rounded-xl border border-purple-200/80">
                      <strong className="text-purple-900 block font-black uppercase text-[10px]">🌀 4. Twist / {getText("Surprise", "المفاجأة", "Surprise")} :</strong>
                      <p className="text-purple-950 font-medium mt-0.5">{script.twist}</p>
                    </div>

                    <div className="p-3 bg-cyan-50 dark:bg-cyan-500/10 rounded-xl border border-cyan-200/80">
                      <strong className="text-cyan-900 block font-black uppercase text-[10px]">🚀 5. Call To Action ({getText("Loop", "الحلقة المغلقة", "Loop")}) :</strong>
                      <p className="text-cyan-950 font-bold mt-0.5">{script.cta}</p>
                    </div>
                  </div>
                </div>

              </div>
            ))}
          </div>
        </div>
      )}

      {/* ----------------------------------------------------------------------------------- */}
      {/* SECTION 5: PSYCHOLOGIE & ALGORITHMES 2026 */}
      {/* ----------------------------------------------------------------------------------- */}
      {subTab === 'psychology' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-900 p-6 sm:p-8 rounded-3xl text-white border border-indigo-500/30 space-y-3">
            <h2 className="text-2xl sm:text-3xl font-black text-indigo-300">
              {psychologyAndAlgo.title}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
              {getText(
                "Une plongée neuro-scientifique et algorithmique dans les moteurs d'attention 2026.",
                "غوص علمي وخوارزمي في محركات الانتباه لعام 2026. اكتشف التحيزات المعرفية وآلية عمل خوارزميات التوصية.",
                "A neuro-scientific and algorithmic deep dive into 2026 attention engines."
              )}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Biais Cognitifs */}
            <div className="bg-academy-surface border border-academy-border rounded-3xl p-6 space-y-4 shadow-sm">
              <h3 className="text-base font-black text-slate-900 dark:text-academy-textMain flex items-center gap-2">
                <Brain className="text-purple-600 dark:text-purple-400" /> {getText("Biais Cognitifs de l'Attention", "التحيزات المعرفية لجذب الانتباه", "Cognitive Biases of Attention")}
              </h3>
              <div className="space-y-3">
                {psychologyAndAlgo.sections[0].biases.map((b, i) => (
                  <div key={i} className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-200/80 space-y-1">
                    <h4 className="font-extrabold text-slate-900 dark:text-academy-textMain text-xs text-indigo-900">{b.title}</h4>
                    <p className="text-xs text-slate-600 dark:text-academy-textMain/60">{b.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Algorithmes 2026 */}
            <div className="bg-academy-surface border border-academy-border rounded-3xl p-6 space-y-4 shadow-sm">
              <h3 className="text-base font-black text-slate-900 dark:text-academy-textMain flex items-center gap-2">
                <Layers className="text-indigo-600 dark:text-indigo-400" /> {getText("Métriques Algorithmiques 2026", "المقاييس الخوارزمية لعام 2026", "2026 Algorithmic Metrics")}
              </h3>
              <div className="space-y-3">
                {psychologyAndAlgo.sections[1].platforms.map((p, i) => (
                  <div key={i} className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-200/80 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-black text-slate-900 dark:text-academy-textMain text-xs">{p.name}</span>
                    </div>
                    <p className="text-xs text-emerald-700 dark:text-emerald-300 font-bold">🎯 {getText("Métrique Reine :", "المعيار الذهبي:", "Queen Metric:")} {p.metrics}</p>
                    <p className="text-xs text-slate-600 dark:text-academy-textMain/60">{p.algoNote}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Erreurs Fatales Reach */}
          <div className="bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/25 rounded-3xl p-6 space-y-4">
            <h3 className="text-base font-black text-rose-950 flex items-center gap-2">
              <AlertTriangle className="text-rose-600 dark:text-rose-400" /> {getText("Les 5 Erreurs Fatales qui Tuent le Reach d'une Vidéo", "الأخطاء الـ 5 القاتلة التي تدمر وصول الفيديو", "The 5 Fatal Errors Killing Video Reach")}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {psychologyAndAlgo.sections[2].errorsList.map((err, i) => (
                <div key={i} className="bg-white dark:bg-academy-surfaceDark p-3.5 rounded-xl border border-rose-200 dark:border-rose-500/25 text-xs text-rose-900 font-medium">
                  • {err}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ----------------------------------------------------------------------------------- */}
      {/* SECTION 6: L'ARSENAL IA ULTIME DU CRÉATEUR MODERNE */}
      {/* ----------------------------------------------------------------------------------- */}
      {subTab === 'ai' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-amber-950 via-slate-900 to-amber-900 p-6 sm:p-8 rounded-3xl text-white border border-amber-500/30 space-y-3">
            <h2 className="text-2xl sm:text-3xl font-black text-amber-300">
              {getText("L'Arsenal IA & Workflows de Création 2026", "ترسانة الذكاء الاصطناعي وسلاسل العمل 2026", "The 2026 AI Arsenal & Workflows")}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
              {getText("Industrialisez votre production grâce à la synergie des meilleures IA du marché.", "قم بأتمتة إنتاجك بفضل التآزر بين أفضل أدوات الذكاء الاصطناعي. ضاعف سرعتك 10 مرات مع الحفاظ على بصمتك الخاصة.", "Industrialize your content production through the synergy of top market AI tools.")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {aiToolkitData.map((tool, idx) => (
              <div key={idx} className="bg-academy-surface border border-academy-border rounded-3xl p-6 space-y-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-academy-border pb-3">
                    <h3 className="font-black text-slate-900 dark:text-academy-textMain text-base">{tool.name}</h3>
                    <span className="bg-amber-100 dark:bg-amber-500/15 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded-md">{getText("IA Pro", "ذكاء اصطناعي محترف", "Pro AI")}</span>
                  </div>
                  
                  <p className="text-xs font-bold text-amber-700 dark:text-amber-300">{tool.role}</p>
                  
                  <div className="text-xs text-slate-600 dark:text-academy-textMain/60 space-y-2">
                    <div>
                      <strong className="text-slate-900 dark:text-academy-textMain block font-semibold">{getText("Cas d'usage optimal :", "الاستخدام الأمثل:", "Optimal Use Case:")}</strong>
                      {tool.bestUse}
                    </div>
                    
                    <div className="p-3 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-academy-border">
                      <strong className="text-purple-800 dark:text-purple-300 block font-extrabold text-[10px] uppercase">{getText("Prompt Pro :", "أمر محترف:", "Pro Prompt:")}</strong>
                      <p className="font-medium text-[11px] text-slate-800 dark:text-academy-textMain/85 mt-0.5">{tool.prompts[0]}</p>
                    </div>

                    <div className="text-rose-700 dark:text-rose-300 text-[11px] font-medium">
                      ⚠️ {getText("Éviter :", "تجنب:", "Avoid:")} {tool.avoid}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ----------------------------------------------------------------------------------- */}
      {/* SECTION 7: TOOLKIT PREMIUM & MONÉTISATION */}
      {/* ----------------------------------------------------------------------------------- */}
      {subTab === 'premium' && (
        <div className="space-y-8">
          
          <div className="bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 p-6 sm:p-8 rounded-3xl text-slate-950 space-y-3 shadow-xl">
            <span className="bg-slate-950 text-amber-400 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider">
              {getText("PACK PREMIUM EXCLUSIF", "حقيبة بريميوم حصرية", "EXCLUSIVE PREMIUM PACK")}
            </span>
            <h2 className="text-2xl sm:text-4xl font-black">
              {getText("Kit Stratégique & Plan 365 Jours", "الحقيبة الاستراتيجية وخطة 365 يوماً", "Strategic Kit & 365-Day Plan")}
            </h2>
            <p className="text-sm font-semibold max-w-3xl leading-relaxed">
              {getText(
                "La feuille de route complète pour bâtir une audience millionnaire et déployer une machine de monétisation.",
                "خارطة الطريق الكاملة لبناء جمهور مليونيري ونشر محرك أرباح عالي العائد.",
                "The complete roadmap to building a millionaire audience and deploying a monetization machine."
              )}
            </p>
          </div>

          {/* Synthèse des Ressources Premium */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-academy-surface border border-academy-border p-4 rounded-2xl text-center space-y-1">
              <div className="text-amber-600 dark:text-amber-400 text-2xl font-black">100</div>
              <div className="text-xs font-bold text-slate-700 dark:text-academy-textMain/75">{getText("Checklists Actionnables", "قائمة تحقق عملي", "Actionable Checklists")}</div>
            </div>
            <div className="bg-academy-surface border border-academy-border p-4 rounded-2xl text-center space-y-1">
              <div className="text-purple-600 dark:text-purple-400 text-2xl font-black">50</div>
              <div className="text-xs font-bold text-slate-700 dark:text-academy-textMain/75">{getText("Tableaux & Matrices", "جدول ومصفوفة قرار", "Tables & Matrices")}</div>
            </div>
            <div className="bg-academy-surface border border-academy-border p-4 rounded-2xl text-center space-y-1">
              <div className="text-emerald-600 dark:text-emerald-400 text-2xl font-black">100</div>
              <div className="text-xs font-bold text-slate-700 dark:text-academy-textMain/75">{getText("Prompts IA Validés", "أمر ذكاء اصطناعي مؤكد", "Validated AI Prompts")}</div>
            </div>
            <div className="bg-academy-surface border border-academy-border p-4 rounded-2xl text-center space-y-1">
              <div className="text-cyan-600 dark:text-cyan-400 text-2xl font-black">100</div>
              <div className="text-xs font-bold text-slate-700 dark:text-academy-textMain/75">{getText("Templates Viraux", "قالب فيروزي", "Viral Templates")}</div>
            </div>
          </div>

          {/* Plan 365 Jours */}
          <div className="bg-academy-surface border border-academy-border rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
            <h3 className="text-xl font-black text-slate-900 dark:text-academy-textMain flex items-center gap-2">
              <TrendingUp className="text-amber-500" /> {getText("Plan d'Action sur 365 Jours", "خطة العمل على 365 يوماً", "365-Day Action Plan")}
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {premiumToolkit.plan365.map((p, i) => (
                <div key={i} className="p-5 bg-white/60 dark:bg-academy-surfaceDark/60 backdrop-blur-md border border-slate-200/50 rounded-3xl space-y-2 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow">
                  <div>
                    <h3 className="font-bold text-slate-800 dark:text-academy-textMain/85 flex items-center justify-between"><span className="text-xs font-black text-amber-600 dark:text-amber-400 block">{p.phase}</span></h3>
                    <p className="text-xs font-medium text-slate-700 dark:text-academy-textMain/75">{p.goal}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Stratégie 1 Million de Vues */}
          <div className="bg-academy-surface border border-academy-border rounded-3xl p-6 sm:p-8 space-y-4 shadow-sm">
            <h3 className="text-xl font-black text-slate-900 dark:text-academy-textMain flex items-center gap-2">
              <Award className="text-purple-600 dark:text-purple-400" /> {getText("Stratégie Pas à Pas : Atteindre 1 Million de Vues", "استراتيجية خطوة بخطوة: وصول لـ 1 مليون مشاهدة", "Step-by-Step Strategy: Hit 1 Million Views")}
            </h3>
            <div className="space-y-2">
              {premiumToolkit.views1MStrategy.map((step, i) => (
                <div key={i} className="p-3.5 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-academy-border text-xs font-bold text-slate-800 dark:text-academy-textMain/85">
                  {step}
                </div>
              ))}
            </div>
          </div>

          {/* Plan de Monétisation */}
          <div className="bg-academy-surface border border-academy-border rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
            <h3 className="text-xl font-black text-slate-900 dark:text-academy-textMain flex items-center gap-2">
              <DollarSign className="text-emerald-600 dark:text-emerald-400" /> {getText("Feuille de Route Monétisation & Lead Capture", "خارطة طريق تحقيق الأرباح والتقاط العملاء", "Monetization & Lead Capture Roadmap")}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {premiumToolkit.monetizationRoadmap.map((item, i) => (
                <div key={i} className="p-4 bg-emerald-50/60 border border-emerald-200/80 rounded-2xl space-y-1">
                  <h4 className="font-black text-emerald-950 text-xs">{item.step}</h4>
                  <p className="text-xs text-emerald-900 font-medium">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

    </div>
  )
}

function CrownIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z" />
    </svg>
  )
}
