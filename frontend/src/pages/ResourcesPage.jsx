import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ExternalLink, Star, Mic, Video, Image as ImageIcon, Sparkles, ChevronDown, ChevronUp, TrendingUp, Smartphone, Music, ShoppingCart, PenTool, Monitor, Layout, Headphones, GraduationCap, Palette, Share2, Download, Rocket, Brain, Zap, ShieldCheck, CheckCircle2, ClipboardCopy, TerminalSquare, RefreshCw, Beaker, Wand2, Youtube, PlayCircle, Search, Mail, ArrowRight, Lightbulb, Target, AlertCircle, Activity, ArrowLeft, Info, Clock } from 'lucide-react'
import { prompts } from '../data/prompts/index.js'
import { resources } from '../data/resources/index.js'
import CreditSavingDiagram from '../components/CreditSavingDiagram'
import EmptyState from '../components/EmptyState'
import PromoBanner from '../components/PromoBanner'
import api from '../api/axios'
import { useLanguage } from '../context/LanguageContext'

// Fonction pour générer les badges
const getBadgeStyles = (type) => {
  switch (type) {
    case '100% Gratuit':
    case 'Open Source':
      return 'bg-green-100 text-green-700 border-green-200'
    case 'Freemium':
    case 'Crédits Gratuits':
      return 'bg-blue-100 text-blue-700 border-blue-200'
    case 'Essai Gratuit':
      return 'bg-orange-100 text-orange-700 border-orange-200'
    case 'Payant':
      return 'bg-red-100 text-red-700 border-red-200'
    case 'Sans Filigrane':
      return 'bg-teal-100 text-teal-700 border-teal-200'
    case 'Avec Filigrane':
      return 'bg-gray-100 text-gray-700 border-gray-200'
    default:
      return 'bg-gray-100 text-gray-600 border-gray-200'
  }
}



export default function ResourcesPage() {
  const navigate = useNavigate()
  const { t, currentLang } = useLanguage()
  
  const currentResources = resources[currentLang] || resources['fr']
  const currentPrompts = prompts[currentLang] || prompts['fr']

  const { resourceCategories, masterclassCategories, labIdeasData, freeCombosData } = currentResources
  const promptsCategories = currentPrompts

  const [weeklyResource, setWeeklyResource] = useState(null)
  
  useEffect(() => {
    let mounted = true
    api.get('/config/site')
      .then(res => {
        if (mounted && res.data?.settings?.weeklyResource) {
          setWeeklyResource(res.data.settings.weeklyResource)
        }
      })
      .catch(console.error)
    return () => { mounted = false }
  }, [])
  const [activeTab, setActiveTab] = useState("lab") // "tools" | "prompts" | "strategies" | "lab"
  
  // Selection States
  const [selectedCatId, setSelectedCatId] = useState(resourceCategories[0]?.id)
  const [selectedPromptCatId, setSelectedPromptCatId] = useState(promptsCategories[0]?.id)
  const [selectedMasterclassCatId, setSelectedMasterclassCatId] = useState(masterclassCategories[0]?.id)
  
  const [copiedPromptId, setCopiedPromptId] = useState(null)
  
  // Search State
  const [searchQuery, setSearchQuery] = useState("")
  
  // States for Lab
  const [generatedIdea, setGeneratedIdea] = useState(null)
  const [isSpinning, setIsSpinning] = useState(false)
  const [progress, setProgress] = useState(0)

  // Current selections
  const selectedCategory = resourceCategories.find(c => c.id === selectedCatId) || resourceCategories[0]
  const selectedPromptCategory = promptsCategories.find(c => c.id === selectedPromptCatId) || promptsCategories[0]
  const selectedMasterclassCategory = masterclassCategories.find(c => c.id === selectedMasterclassCatId) || masterclassCategories[0]

  // Filtering Logic
  const allTools = resourceCategories.flatMap(c => c.tools);
  const filteredTools = searchQuery 
    ? allTools.filter(t => t.name.toLowerCase().includes(searchQuery.toLowerCase()) || t.desc.toLowerCase().includes(searchQuery.toLowerCase()))
    : selectedCategory.tools;

  const allPrompts = promptsCategories.flatMap(c => c.prompts);
  const filteredPrompts = searchQuery
    ? allPrompts.filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase()) || p.prompt.toLowerCase().includes(searchQuery.toLowerCase()))
    : selectedPromptCategory.prompts;

  // Handlers
  const handleCopyPrompt = (id, text) => {
    navigator.clipboard.writeText(text)
    setCopiedPromptId(id)
    setTimeout(() => setCopiedPromptId(null), 2000)
  }

  const handleGenerateIdea = () => {
    if (isSpinning) return;
    setIsSpinning(true)
    setGeneratedIdea(null)
    setProgress(0)

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          const random = labIdeasData[Math.floor(Math.random() * labIdeasData.length)]
          setGeneratedIdea(random)
          setIsSpinning(false)
          return 100;
        }
        return prev + 4;
      })
    }, 40)
  }

  // Difficulty badge for lab
  const getDifficultyColor = (diff) => {
    if (diff === "Facile") return "bg-green-500/20 text-green-300 border-green-500/30"
    if (diff === "Moyen") return "bg-orange-500/20 text-orange-300 border-orange-500/30"
    if (diff === "Difficile") return "bg-red-500/20 text-red-300 border-red-500/30"
    return "bg-white/10 text-white"
  }

  return (
    <div className="min-h-screen bg-academy-surface/30 flex flex-col">
      
      {/* HEADER COMPACT ET STICKY */}
      <div className="bg-white/95 backdrop-blur-md border-b border-academy-border py-4 px-4 sticky top-0 z-30 shadow-sm w-full">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Left: Back button & Title */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            <button onClick={() => navigate(-1)} className="flex items-center justify-center p-2 rounded-xl bg-academy-surface hover:bg-academy-border text-academy-textMain/75 transition-all border border-academy-border hover:shadow-sm">
              <ArrowLeft size={16} />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-display font-black text-academy-textMain leading-none">
                  {t('resources_page.title')} <span className="text-academy-primary">{t('resources_page.title_highlight')}</span>
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-200 font-bold text-[10px] animate-pulse">
                  <Sparkles size={10} /> {t('resources_page.free_badge')}
                </span>
              </div>
              <p className="text-[11px] text-academy-textMain/55 mt-0.5 hidden md:block">
                {t('resources_page.subtitle')}
              </p>
            </div>
          </div>

          {/* Right: Tabs & Search Bar */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            {/* TABS */}
            <div className="bg-academy-surface p-1 rounded-xl flex gap-1 border border-academy-border w-full sm:w-auto">
              <button
                onClick={() => { setActiveTab("tools"); setSearchQuery(""); }}
                className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg font-bold text-xs transition-all whitespace-nowrap ${
                  activeTab === "tools" ? "bg-white text-academy-primary shadow-sm border border-black/5" : "text-academy-textMain/60 hover:text-academy-textMain"
                }`}
              >
                {t('resources_page.tabs.tools')}
              </button>
              <button
                onClick={() => { setActiveTab("prompts"); setSearchQuery(""); }}
                className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg font-bold text-xs transition-all whitespace-nowrap ${
                  activeTab === "prompts" ? "bg-white text-academy-primary shadow-sm border border-black/5" : "text-academy-textMain/60 hover:text-academy-textMain"
                }`}
              >
                {t('resources_page.tabs.prompts')}
              </button>
              <button
                onClick={() => { setActiveTab("strategies"); setSearchQuery(""); }}
                className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg font-bold text-xs transition-all whitespace-nowrap ${
                  activeTab === "strategies" ? "bg-white text-academy-primary shadow-sm border border-black/5" : "text-academy-textMain/60 hover:text-academy-textMain"
                }`}
              >
                {t('resources_page.tabs.masterclass')}
              </button>
              <button
                onClick={() => { setActiveTab("combos"); setSearchQuery(""); }}
                className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg font-bold text-xs transition-all whitespace-nowrap ${
                  activeTab === "combos" ? "bg-white text-academy-primary shadow-sm border border-black/5" : "text-academy-textMain/60 hover:text-academy-textMain"
                }`}
              >
                {t('resources_page.tabs.combos')}
              </button>
              <button
                onClick={() => { setActiveTab("lab"); setSearchQuery(""); }}
                className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg font-black text-xs transition-all whitespace-nowrap ${
                  activeTab === "lab" ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-sm" : "text-purple-600 hover:bg-purple-50"
                }`}
              >
                {t('resources_page.tabs.lab')}
              </button>
              <button
                onClick={() => { setActiveTab("credits"); setSearchQuery(""); }}
                className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg font-bold text-xs transition-all whitespace-nowrap ${
                  activeTab === "credits" ? "bg-white text-green-600 shadow-sm border border-black/5" : "text-green-600/70 hover:text-green-600"
                }`}
              >
                {t('resources_page.tabs.credits')}
              </button>
            </div>

            {/* SEARCH */}
            {(activeTab === "tools" || activeTab === "prompts") && (
              <div className="relative w-full sm:w-48 md:w-56">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                  <Search size={14} className="text-academy-textMain/40" />
                </div>
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher..."
                  className="w-full bg-academy-surface border border-academy-border rounded-xl py-1.5 pl-8 pr-3 text-xs text-academy-textMain focus:outline-none focus:ring-1 focus:ring-academy-primary transition-all"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 🌟 PETITE BANNIÈRE DE LA SEMAINE 🌟 */}
      {weeklyResource && weeklyResource.isActive && (
        <div className="max-w-7xl mx-auto px-4 mt-6 w-full">
          <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-fuchsia-600 rounded-2xl p-0.5 shadow-md shadow-indigo-500/10">
            <div className="bg-white rounded-[14px] p-4 flex flex-col md:flex-row items-center justify-between gap-4 overflow-hidden relative shadow-[inset_0_0_0_1px_rgba(255,255,255,0.2)]">
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/3"></div>
              <div className="flex items-center gap-3 z-10">
                <div className="w-10 h-10 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-center shrink-0">
                  <RefreshCw className="text-indigo-500 animate-spin-slow" size={20} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="bg-indigo-100 text-indigo-700 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded border border-indigo-200">{weeklyResource.tagline || "Pépite de la semaine"}</span>
                    <span className="flex h-1.5 w-1.5 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500"></span>
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-800 mt-0.5">{weeklyResource.title} — <span className="text-slate-500 font-normal text-xs">{weeklyResource.description}</span></h3>
                </div>
              </div>
              <a href={weeklyResource.url} target="_blank" rel="noopener noreferrer" className="shrink-0 bg-slate-900 hover:bg-slate-800 text-white font-bold py-2 px-5 rounded-xl text-xs transition-all shadow-sm flex items-center gap-1.5 z-10">
                Découvrir l'outil <ExternalLink size={12} />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* CONTENU PRINCIPAL */}
      <div className="max-w-7xl mx-auto px-4 flex-1 w-full my-6">
        
        {/* TAB 1 : OUTILS */}
        {activeTab === "tools" && (
          <div className="flex flex-col lg:flex-row gap-6 animate-in fade-in slide-in-from-bottom-3 duration-300">
            {/* SIDEBAR NAVIGATION COMPACTE */}
            <div className={`w-full lg:w-56 shrink-0 ${searchQuery ? 'hidden lg:block opacity-50 pointer-events-none' : ''}`}>
              <div className="lg:sticky lg:top-20 flex flex-row lg:flex-col gap-1.5 overflow-x-auto lg:overflow-visible pb-3 lg:pb-0 hide-scrollbar">
                {resourceCategories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCatId(cat.id)}
                    className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-left whitespace-nowrap lg:whitespace-normal font-bold transition-all text-xs ${
                      selectedCatId === cat.id 
                      ? "bg-academy-primary text-white shadow-sm" 
                      : "bg-white border border-academy-border text-academy-textMain/70 hover:border-academy-primary/40 hover:text-academy-primary"
                    }`}
                  >
                    <div className={selectedCatId === cat.id ? "text-white" : cat.color}>
                      {cat.icon}
                    </div>
                    <span>{cat.shortTitle}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* MAIN CONTENT GRID */}
            <div className="flex-1 bg-white rounded-2xl border border-academy-border shadow-sm p-5 lg:p-6">
              {!searchQuery && (
                <div className="mb-6 pb-4 border-b border-academy-border/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-base font-black text-academy-textMain flex items-center gap-2">
                      {selectedCategory.title}
                      <span className="text-xs font-normal text-academy-textMain/50">({filteredTools.length} outils)</span>
                    </h2>
                    <p className="text-xs text-academy-textMain/60 mt-0.5">
                      {selectedCategory.description}
                    </p>
                  </div>
                  <div className="bg-blue-50 border border-blue-100 text-blue-800 rounded-xl p-3 text-[11px] max-w-sm shrink-0 leading-relaxed">
                    💡 <strong>Astuce Pro :</strong> Ces outils proposent tous un plan gratuit ou freemium de qualité. Base mise à jour régulièrement.
                  </div>
                </div>
              )}
              
              {searchQuery && (
                <div className="mb-6 pb-4 border-b border-academy-border/50">
                  <h2 className="text-sm font-bold text-academy-textMain">
                    {filteredTools.length} résultat{filteredTools.length > 1 ? 's' : ''} pour "{searchQuery}"
                  </h2>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredTools.length > 0 ? filteredTools.map((tool, idx) => (
                  <a 
                    key={idx} 
                    href={tool.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="group flex flex-col p-4 bg-academy-surface/30 rounded-xl border border-academy-border hover:border-academy-primary hover:bg-white hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex items-start justify-between mb-1.5">
                      <h3 className="font-bold text-academy-textMain text-sm group-hover:text-academy-primary transition-colors flex-1 pr-2">
                        {tool.name}
                      </h3>
                      <ExternalLink size={12} className="text-academy-textMain/30 shrink-0 group-hover:text-academy-primary mt-1" />
                    </div>
                    <p className="text-xs text-academy-textMain/60 leading-relaxed mb-3 flex-1">
                      {tool.desc}
                    </p>
                    <div className="flex flex-wrap gap-1 mt-auto">
                      {tool.badges.map((badge, bIdx) => (
                        <span key={bIdx} className={`px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded border ${getBadgeStyles(badge)}`}>
                          {badge}
                        </span>
                      ))}
                    </div>
                  </a>
                )) : (
                  <div className="col-span-full text-center py-10 text-xs text-academy-textMain/50">
                    {t('resources_page.no_results')}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2 : PROMPTS MAGIQUES */}
        {activeTab === "prompts" && (
          <div className="flex flex-col lg:flex-row gap-6 animate-in fade-in slide-in-from-bottom-3 duration-300">
            {/* SIDEBAR NAVIGATION COMPACTE */}
            <div className={`w-full lg:w-56 shrink-0 ${searchQuery ? 'hidden lg:block opacity-50 pointer-events-none' : ''}`}>
              <div className="lg:sticky lg:top-20 flex flex-row lg:flex-col gap-1.5 overflow-x-auto lg:overflow-visible pb-3 lg:pb-0 hide-scrollbar">
                {promptsCategories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedPromptCatId(cat.id)}
                    className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-left whitespace-nowrap lg:whitespace-normal font-bold transition-all text-xs ${
                      selectedPromptCatId === cat.id 
                      ? "bg-slate-800 text-white shadow-sm" 
                      : "bg-white border border-academy-border text-academy-textMain/70 hover:border-slate-800/40 hover:text-slate-800"
                    }`}
                  >
                    <TerminalSquare size={14} className={selectedPromptCatId === cat.id ? "text-white" : "text-slate-500"} />
                    <span>{cat.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* MAIN CONTENT GRID */}
            <div className="flex-1">
              {!searchQuery && (
                <div className="bg-gradient-to-br from-indigo-50 to-white rounded-2xl border border-indigo-100 p-5 mb-5 text-left relative overflow-hidden shadow-sm">
                  <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
                  <h2 className="text-lg font-display font-black text-indigo-900 mb-1 relative z-10">Prompts : {selectedPromptCategory.name}</h2>
                  <p className="text-xs text-indigo-700/80 mb-3 relative z-10">Copiez ces instructions professionnelles et collez-les directement dans ChatGPT ou Claude.</p>
                  <p className="text-[11px] text-indigo-800 leading-relaxed bg-white rounded-lg p-2 border border-indigo-100 relative z-10 inline-block shadow-sm">
                    <span className="animate-pulse">✨</span> <strong>Mises à jour :</strong> Nouveaux prompts ajoutés régulièrement.
                  </p>
                </div>
              )}

              {searchQuery && (
                <div className="bg-white rounded-2xl border border-academy-border p-4 mb-4">
                  <h2 className="text-sm font-bold text-academy-textMain">
                    {filteredPrompts.length} résultat{filteredPrompts.length > 1 ? 's' : ''} pour "{searchQuery}"
                  </h2>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredPrompts.length > 0 ? filteredPrompts.map((prompt, idx) => (
                  <div key={idx} className="bg-white rounded-2xl border border-academy-border shadow-sm hover:shadow-md hover:border-indigo-200 transition-all flex flex-col overflow-hidden h-full">
                    <div className="p-4 border-b border-academy-border/50 bg-slate-50/50">
                      <h3 className="text-sm font-bold text-academy-textMain leading-tight">{prompt.title}</h3>
                    </div>
                    
                    <div className="p-4 bg-white flex-1 relative group flex flex-col justify-between gap-4">
                      <p className="text-slate-600 text-xs leading-relaxed font-mono">
                        {prompt.prompt}
                      </p>
                      {prompt.technique && (
                        <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-3 mt-2">
                          <h4 className="text-[10px] font-bold text-indigo-800 uppercase tracking-wider mb-1 flex items-center gap-1.5"><Lightbulb size={12}/> Technique Avancée</h4>
                          <p className="text-xs text-indigo-900/80 leading-relaxed">{prompt.technique}</p>
                        </div>
                      )}
                      <div className="mt-2 flex justify-end">
                        <button 
                          onClick={() => handleCopyPrompt(`${selectedPromptCategory.id}-${idx}`, prompt.prompt)}
                          className={`flex items-center gap-1.5 font-bold py-2 px-4 rounded-lg text-xs transition-all shadow-sm border ${
                            copiedPromptId === `${selectedPromptCategory.id}-${idx}` ? "bg-green-500 text-white border-green-600" : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                          }`}
                        >
                          {copiedPromptId === `${selectedPromptCategory.id}-${idx}` ? <><CheckCircle2 size={12} /> Copié !</> : <><ClipboardCopy size={12} /> Copier le Prompt</>}
                        </button>
                      </div>
                    </div>
                  </div>
                )) : (
                  <div className="col-span-full text-center py-10 bg-white rounded-2xl border border-academy-border text-xs text-academy-textMain/50">
                    Aucun prompt trouvé pour cette recherche.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3 : MASTERCLASS */}
        {activeTab === "strategies" && (
          <div className="flex flex-col lg:flex-row gap-6 animate-in fade-in slide-in-from-bottom-3 duration-300">
            {/* SIDEBAR NAVIGATION COMPACTE */}
            <div className="w-full lg:w-56 shrink-0">
              <div className="lg:sticky lg:top-20 flex flex-row lg:flex-col gap-1.5 overflow-x-auto lg:overflow-visible pb-3 lg:pb-0 hide-scrollbar">
                {masterclassCategories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedMasterclassCatId(cat.id)}
                    className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-left whitespace-nowrap lg:whitespace-normal font-bold transition-all text-xs ${
                      selectedMasterclassCatId === cat.id 
                      ? "bg-white border-2 border-academy-primary text-academy-primary shadow-sm" 
                      : "bg-white border border-academy-border text-academy-textMain/70 hover:border-academy-primary/40 hover:text-academy-primary"
                    }`}
                  >
                    <div className={selectedMasterclassCatId === cat.id ? "text-academy-primary" : "text-academy-textMain/50"}>
                      {cat.icon}
                    </div>
                    <span>{cat.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* MAIN CONTENT GRID */}
            <div className="flex-1 bg-white rounded-2xl border border-academy-border shadow-sm p-5 lg:p-6">
              <div className="mb-6 pb-4 border-b border-academy-border/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 bg-academy-surface rounded-xl text-sm shrink-0`}>
                    <span className={selectedMasterclassCategory.color}>{selectedMasterclassCategory.icon}</span>
                  </div>
                  <div>
                    <h2 className="text-base font-black text-academy-textMain">
                      {selectedMasterclassCategory.title}
                    </h2>
                    <p className="text-xs text-academy-textMain/60 mt-0.5">
                      {selectedMasterclassCategory.desc}
                    </p>
                  </div>
                </div>
                <div className="bg-amber-50 border border-amber-100 text-amber-800 rounded-xl p-3 text-[11px] max-w-sm shrink-0 leading-relaxed">
                  🎓 <strong>Formation Gratuite :</strong> Stratégies régulières pour rester en avance.
                </div>
              </div>

              {selectedMasterclassCategory.id !== "videos" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedMasterclassCategory.strategies.map((strat, idx) => (
                    <div key={idx} className="bg-academy-surface/30 rounded-2xl border border-academy-border p-4 hover:shadow-sm transition-all flex flex-col h-full hover:border-academy-primary/30">
                      <div className="flex items-start gap-3 mb-4">
                        <div className={`p-2 rounded-lg shrink-0 text-sm ${strat.color}`}>
                          {strat.icon}
                        </div>
                        <div>
                          <h3 className="text-sm font-bold font-display text-academy-textMain leading-tight mb-0.5">
                            {strat.title}
                          </h3>
                          <p className="text-academy-textMain/60 text-xs leading-normal">
                            {strat.desc}
                          </p>
                        </div>
                      </div>
                      
                      <div className="bg-white rounded-xl p-3 border border-academy-border flex-1">
                        <ul className="space-y-2">
                          {strat.points.map((pt, pIdx) => (
                            <li key={pIdx} className="flex items-start gap-2 text-xs text-academy-textMain font-medium">
                              <CheckCircle2 size={12} className="text-academy-primary shrink-0 mt-0.5 opacity-80" />
                              <span className="leading-snug">{pt}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedMasterclassCategory.videos.map((video) => (
                    <a 
                      key={video.id} 
                      href={video.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="bg-white rounded-xl border border-academy-border p-4 hover:shadow-md hover:border-red-300 transition-all flex flex-col sm:flex-row gap-4 group"
                    >
                      <div className="w-full sm:w-20 h-20 bg-slate-100 rounded-lg flex items-center justify-center shrink-0 group-hover:bg-red-50 transition-colors relative overflow-hidden">
                        {video.icon}
                        <div className="absolute inset-0 flex items-center justify-center bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity">
                          <PlayCircle size={28} className="text-white drop-shadow-md" />
                        </div>
                      </div>
                      <div className="flex-1 flex flex-col justify-center">
                        <span className="text-[9px] font-bold text-red-500 uppercase tracking-wider mb-0.5">Chaine : {video.channel}</span>
                        <h3 className="text-sm font-bold text-academy-textMain leading-tight mb-1 group-hover:text-red-500 transition-colors">{video.title}</h3>
                        <p className="text-[11px] text-academy-textMain/60 leading-normal line-clamp-2">
                          {video.desc}
                        </p>
                      </div>
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 4 : LABORATOIRE */}
        {activeTab === "lab" && (
          <div className="animate-in fade-in slide-in-from-bottom-3 duration-300 max-w-4xl mx-auto">
            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm relative overflow-hidden border border-slate-200">
              
              {/* Background */}
              <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-5 mix-blend-overlay"></div>
              <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-fuchsia-100 rounded-full blur-[80px]"></div>
              <div className="absolute bottom-[-20%] left-[-10%] w-64 h-64 bg-indigo-100 rounded-full blur-[80px]"></div>
              
              <div className="relative z-10 flex flex-col lg:flex-row gap-8 items-center">
                
                {/* Left Side */}
                <div className="flex-1 text-center lg:text-left">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-fuchsia-50 border border-fuchsia-100 mb-4">
                    <Beaker size={12} className="text-fuchsia-600" />
                    <span className="text-[10px] font-bold text-fuchsia-700 uppercase tracking-wider">Accès Libre</span>
                  </div>
                  
                  <h2 className="text-2xl md:text-3xl font-display font-black text-slate-900 mb-3 leading-tight">
                    Machine à <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-600 to-indigo-600">Idées Virales</span>
                  </h2>
                  <p className="text-slate-600 text-xs mb-6 max-w-xs mx-auto lg:mx-0">
                    Notre algorithme combine les tendances actuelles pour générer des concepts viraux de contenu ou de business.
                  </p>

                  <button 
                    onClick={handleGenerateIdea}
                    disabled={isSpinning}
                    className={`w-full lg:w-auto bg-slate-900 text-white font-black text-sm py-3.5 px-6 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 ${isSpinning ? 'opacity-50 cursor-not-allowed scale-95' : 'hover:scale-105 active:scale-95'}`}
                  >
                    {isSpinning ? <><RefreshCw size={16} className="animate-spin" /> Analyse...</> : <>🎰 Générer un Concept</>}
                  </button>
                </div>

                {/* Right Side */}
                <div className="flex-1 w-full min-h-[300px] flex flex-col relative">
                  
                  {isSpinning ? (
                    <div className="flex-1 bg-white border border-slate-200 rounded-2xl p-6 flex flex-col items-center justify-center relative overflow-hidden shadow-sm">
                      <div className="w-full absolute top-0 left-0 h-1 bg-slate-100">
                        <div className="h-full bg-gradient-to-r from-fuchsia-500 to-indigo-500 transition-all duration-75 ease-linear" style={{ width: `${progress}%` }}></div>
                      </div>
                      <Wand2 size={36} className="text-fuchsia-500 animate-pulse mb-4" />
                      <h3 className="text-lg font-bold text-slate-800 mb-1">Génération...</h3>
                      <p className="text-slate-500 text-xs text-center">Croisement des données de viralité TikTok et YouTube.</p>
                    </div>
                  ) : generatedIdea ? (
                    <div className="flex-1 bg-white border border-slate-200 rounded-2xl p-6 animate-in zoom-in-95 duration-200 shadow-md flex flex-col">
                      
                      <div className="flex flex-wrap items-center gap-1.5 mb-4">
                        <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded bg-indigo-50 text-indigo-700 border border-indigo-100">
                          {generatedIdea.type}
                        </span>
                        <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded bg-fuchsia-50 text-fuchsia-700 border border-fuchsia-100">
                          {generatedIdea.niche}
                        </span>
                        <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded border ml-auto bg-slate-50 text-slate-600 border-slate-200`}>
                          Diff: {generatedIdea.difficulty}
                        </span>
                      </div>

                      <h3 className="text-lg font-bold text-slate-900 leading-tight mb-4">
                        "{generatedIdea.title}"
                      </h3>

                      <div className="bg-slate-50 rounded-xl p-4 mb-4 border border-slate-100">
                        <h4 className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5">
                          <Target size={12} /> Plan d'exécution :
                        </h4>
                        <ul className="space-y-2">
                          {generatedIdea.steps.map((step, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                              <span className="flex items-center justify-center w-4.5 h-4.5 rounded-full bg-slate-200 text-slate-700 text-[9px] font-bold shrink-0 mt-0.5">{idx + 1}</span>
                              <span className="leading-snug">{step}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-3">
                        <div className="flex items-center gap-1.5 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                          <Activity size={14} /> Viralité
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-orange-400 to-green-500" style={{ width: `${generatedIdea.virality}%` }}></div>
                          </div>
                          <span className="text-slate-700 text-xs font-black">{generatedIdea.virality}%</span>
                        </div>
                      </div>

                    </div>
                  ) : (
                    <div className="flex-1 bg-slate-50 border border-slate-200 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center text-center">
                      <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-4 border border-slate-100 shadow-sm">
                        <AlertCircle size={24} className="text-slate-400" />
                      </div>
                      <h3 className="text-sm font-bold text-slate-700 mb-1">En attente d'instruction</h3>
                      <p className="text-slate-500 text-xs max-w-xs">Générez un nouveau concept viral.</p>
                    </div>
                  )}

                </div>
              </div>
            </div>
            
            <div className="text-center mt-4 text-academy-textMain/50 text-[11px] font-medium flex items-center justify-center gap-1.5">
              <ShieldCheck size={14} className="text-green-500" /> Idées libres de droits et prêtes à être exécutées.
            </div>
          </div>
        )}
        {/* TAB 5 : CREDITS IA */}
        {activeTab === "credits" && (
          <div className="animate-in fade-in slide-in-from-bottom-3 duration-300">
            <CreditSavingDiagram />
          </div>
        )}

        {/* TAB 6 : COMBOS GRATUITS */}
        {activeTab === "combos" && (
          <div className="animate-in fade-in slide-in-from-bottom-3 duration-300 space-y-6">
            <div className="bg-gradient-to-br from-yellow-50 to-white rounded-2xl border border-yellow-100 p-5 text-left relative overflow-hidden shadow-sm">
              <div className="absolute top-0 right-0 w-48 h-48 bg-yellow-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
              <h2 className="text-lg font-display font-black text-amber-900 mb-1 relative z-10 font-sans">Combos 100% Gratuits ⚡</h2>
              <p className="text-xs text-amber-700/80 mb-3 relative z-10 font-medium">Combinez la puissance de plusieurs outils gratuits pour réaliser des tâches complexes en un temps record.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {freeCombosData.map((combo, idx) => (
                <div key={idx} className="bg-white rounded-2xl border border-academy-border shadow-sm p-6 hover:shadow-md transition-all flex flex-col justify-between h-full hover:border-academy-primary/30 relative overflow-hidden">
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <h3 className="font-display font-bold text-base text-academy-textMain leading-snug group-hover:text-academy-primary">
                          {combo.title}
                        </h3>
                        <p className="text-academy-textMain/60 text-xs mt-1.5 leading-relaxed font-medium">
                          {combo.goal}
                        </p>
                      </div>
                    </div>

                    {/* Tools badges */}
                    <div className="flex flex-wrap gap-1.5">
                      {combo.tools.map((t, tIdx) => (
                        <span key={tIdx} className="px-2.5 py-1 bg-academy-surfaceDark text-academy-textMain/80 text-[10px] font-bold rounded-lg border border-academy-border/50">
                          {t}
                        </span>
                      ))}
                    </div>

                    {/* Steps */}
                    <div className="bg-academy-surface/30 rounded-xl p-4 border border-academy-border/50">
                      <h4 className="text-[10px] font-bold text-academy-primary uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                        <Target size={12} /> Plan d'action :
                      </h4>
                      <ul className="space-y-3">
                        {combo.steps.map((step, sIdx) => (
                          <li key={sIdx} className="flex items-start gap-2.5 text-xs text-academy-textMain/80 font-medium">
                            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-academy-primary/10 text-academy-primary text-[10px] font-bold shrink-0 mt-0.5">
                              {sIdx + 1}
                            </span>
                            <span className="leading-snug">{step}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Footer details */}
                  <div className="flex items-center justify-between border-t border-academy-border/60 pt-4 mt-6">
                    <div className="flex items-center gap-4">
                      <span className="text-[10px] text-academy-textMain/40 font-bold uppercase tracking-wider flex items-center gap-1">
                        <Clock size={12} /> {combo.time}
                      </span>
                      <span className="text-[10px] text-green-600 font-bold uppercase tracking-wider flex items-center gap-1">
                        <Zap size={12} /> {combo.cost}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* FOOTER CTA NEWSLETTER (Light Mode) */}
      <div className="bg-slate-50 border-t border-slate-200 py-10 px-4 w-full relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-academy-primary/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3"></div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-sm">
            <Mail size={20} className="text-slate-600" />
          </div>
          <h2 className="text-xl md:text-2xl font-display font-black text-slate-900 mb-2">
            Ne ratez plus aucune pépite.
          </h2>
          <p className="text-slate-500 text-xs mb-6 max-w-lg mx-auto">
            Inscrivez-vous à notre newsletter privée. Recevez des outils secrets, prompts et stratégies directement dans votre boîte mail.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 max-w-md mx-auto">
            <input 
              type="email" 
              placeholder="Votre adresse email" 
              className="w-full sm:flex-1 bg-white border border-slate-200 rounded-xl py-2.5 px-4 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-academy-primary shadow-sm"
            />
            <button className="w-full sm:w-auto bg-academy-primary hover:bg-academy-primary/90 text-white font-bold py-2.5 px-5 rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 shadow-sm shrink-0">
              S'inscrire <ArrowRight size={14} />
            </button>
          </div>
          <p className="text-slate-400 text-[10px] mt-3">100% gratuit. Désinscription en 1 clic.</p>
        </div>
      </div>
      
    </div>
  )
}
