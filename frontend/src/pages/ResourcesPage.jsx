import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ExternalLink, Star, Mic, Video, Image as ImageIcon, Sparkles, ChevronDown, ChevronUp, TrendingUp, Smartphone, Music, ShoppingCart, PenTool, Monitor, Layout, Headphones, GraduationCap, Palette, Share2, Download, Rocket, Brain, Zap, ShieldCheck, CheckCircle2, ClipboardCopy, TerminalSquare, RefreshCw, Beaker, Wand2, Youtube, PlayCircle, Search, Mail, ArrowRight, Lightbulb, Target, AlertCircle, Activity, ArrowLeft, Info, Clock, Lock, User } from 'lucide-react'
import { prompts } from '../data/prompts/index.js'
import { resources } from '../data/resources/index.jsx'

import SEOHead from '../components/SEOHead'
import EmptyState from '../components/EmptyState'
import ContentEmpireSection from '../components/ContentEmpireSection'
import { useLanguage } from '../context/LanguageContext'
import { useAuth } from '../context/AuthContext'
import { useCourses } from '../hooks/useCourses'
import LoginModal from '../components/LoginModal'
import { getCurrentSeason } from '../utils/season'
import api from '../api/axios'

// Fonction pour générer les badges
const getBadgeStyles = (type) => {
  switch (type) {
    case '100% Gratuit':
    case 'Open Source':
    case 'Illimité':
      return 'bg-green-100 dark:bg-green-500/15 text-green-700 dark:text-green-300 border-green-200 dark:border-green-500/25'
    case 'Freemium':
    case 'Crédits Gratuits':
    case 'Crédits Quotidiens':
      return 'bg-blue-100 dark:bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-500/25'
    case 'Essai Gratuit':
      return 'bg-orange-100 dark:bg-orange-500/15 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-500/25'
    case 'Payant':
    case 'Commissions':
    case 'Abonnement requis':
      return 'bg-red-100 dark:bg-red-500/15 text-red-700 dark:text-red-300 border-red-200 dark:border-red-500/25'
    case 'Sans Filigrane':
    case 'Sans Abonnement':
      return 'bg-teal-100 dark:bg-teal-500/15 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-500/25'
    case 'Avec Filigrane':
    case 'Limité':
      return 'bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-academy-textMain/75 border-gray-200 dark:border-academy-border'
    default:
      return 'bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-academy-textMain/60 border-gray-200 dark:border-academy-border'
  }
}



export default function ResourcesPage() {
  const navigate = useNavigate()
  const season = getCurrentSeason()
  const { t, currentLang, changeLanguage } = useLanguage()
  const { isAuthenticated } = useAuth()
  const { courses } = useCourses()
  const [loginModalOpen, setLoginModalOpen] = useState(false)
  const [selectedCombo, setSelectedCombo] = useState(null)

  // Newsletter State
  const [newsletterEmail, setNewsletterEmail] = useState("")
  const [newsletterStatus, setNewsletterStatus] = useState("idle") // "idle" | "loading" | "success" | "error"
  const [newsletterMsg, setNewsletterMsg] = useState("")

  const getText = (fr, ar, en) => {
    if (currentLang === 'ar') return ar;
    if (currentLang === 'en') return en;
    return fr;
  }

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    if (!newsletterEmail || !newsletterEmail.includes("@") || !newsletterEmail.includes(".")) {
      setNewsletterStatus("error");
      setNewsletterMsg(
        getText(
          "Veuillez entrer une adresse email valide.",
          "يرجى إدخال عنوان بريد إلكتروني صحيح.",
          "Please enter a valid email address."
        )
      );
      return;
    }

    setNewsletterStatus("loading");
    setNewsletterMsg("");

    try {
      // API Call if backend available
      await api.post("/auth/newsletter/subscribe", {
        email: newsletterEmail
      }).catch(() => null);

      // Store in localStorage as backup
      try {
        const existing = JSON.parse(localStorage.getItem("mylta_newsletter_subscribers") || "[]");
        if (!existing.some(s => s.email === newsletterEmail)) {
          existing.push({ email: newsletterEmail, subscribedAt: new Date().toISOString() });
          localStorage.setItem("mylta_newsletter_subscribers", JSON.stringify(existing));
        }
      } catch (err) {
        console.error(err);
      }

      setNewsletterStatus("success");
      setNewsletterEmail("");
      setNewsletterMsg(
        getText(
          "Merci ! Votre inscription à la newsletter a bien été enregistrée.",
          "شكراً! تم تسجيل اشتراكك في النشرة البريدية بنجاح.",
          "Thank you! Your newsletter subscription has been recorded."
        )
      );
    } catch (error) {
      setNewsletterStatus("error");
      setNewsletterMsg(
        getText(
          "Une erreur est survenue. Veuillez réessayer.",
          "حدث خطأ. يرجى المحاولة مرة أخرى.",
          "An error occurred. Please try again."
        )
      );
    }
  }
  
  const currentResources = resources[currentLang] || resources['fr']
  const { resourceCategories, freeCombosData } = currentResources

  const [activeTab, setActiveTab] = useState("tools_prompts") // "tools_prompts" | "combos" | "credits"
  
  // Selection States
  const [selectedView, setSelectedView] = useState({ type: 'tool', id: resourceCategories[0]?.id })


  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("")
  const [visibleCombos, setVisibleCombos] = useState(24)
  const [comboCategory, setComboCategory] = useState("all") // "all" | "dev" | "ia" | "media" | "free2026"

  // Current selections
  const selectedCategory = resourceCategories.find(c => c.id === selectedView.id) || resourceCategories[0]

  // Filtering Logic
  const allTools = resourceCategories.flatMap(c => c.tools);
  const filteredTools = searchQuery 
    ? allTools.filter(t => t.name.toLowerCase().includes(searchQuery.toLowerCase()) || t.desc.toLowerCase().includes(searchQuery.toLowerCase()))
    : (selectedView.type === 'tool' ? selectedCategory.tools : []);


  const filteredCombos = freeCombosData.filter(c => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = !searchQuery || 
      (c.title && c.title.toLowerCase().includes(query)) || 
      (c.goal && c.goal.toLowerCase().includes(query)) ||
      (c.tools && c.tools.some(t => t.toLowerCase().includes(query)));

    if (!matchesSearch) return false;

    if (comboCategory === "dev") {
      return c.category === "dev" || (c.tools && c.tools.some(t => ["cursor", "v0", "vercel", "supabase", "cloudflare", "python", "docker", "git", "react", "expo", "hono", "ollama", "qdrant"].some(k => t.toLowerCase().includes(k))));
    }
    if (comboCategory === "ia") {
      return c.category === "ia" || (c.tools && c.tools.some(t => ["gpt", "claude", "ollama", "llama", "deepseek", "notebooklm", "qdrant", "huggingface"].some(k => t.toLowerCase().includes(k))));
    }
    if (comboCategory === "media") {
      return c.category === "media" || (c.tools && c.tools.some(t => ["leonardo", "capcut", "canva", "ideogram", "suno", "audacity", "photopea", "vectorizer"].some(k => t.toLowerCase().includes(k))));
    }
    if (comboCategory === "free2026") {
      return c.badge === "Gratuit 2026" || (c.cost && (c.cost.includes("100%") || c.cost.includes("0 DZD") || c.cost.includes("0 DZD") || c.cost.includes("2026")));
    }

    return true;
  });

  // Reset pagination on search or category change
  useEffect(() => {
    if (activeTab === "combos") {
      setVisibleCombos(24);
    }
  }, [searchQuery, comboCategory, activeTab]);

  // Handlers

  return (
    <div className="min-h-screen bg-academy-surface/30 flex flex-col">
      <SEOHead title="Ressources & Outils" />
      
      {/* HEADER COMPACT ET STICKY */}
      <div className="bg-white/95 dark:bg-academy-surfaceDark/95 backdrop-blur-md border-b border-academy-border py-3 sm:py-4 px-4 sticky top-0 z-30 shadow-sm w-full">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4">
          {/* Left: Back button & Title */}
          <div className="flex items-center gap-3 sm:gap-4 w-full md:w-auto">
            <button 
              onClick={() => navigate('/')} 
              className="group flex items-center gap-2 sm:gap-2.5 px-2 sm:px-3 py-1.5 sm:py-2 rounded-xl bg-white dark:bg-academy-surfaceDark hover:bg-slate-50 text-slate-700 dark:text-academy-textMain/75 transition-all border border-slate-200 dark:border-academy-border hover:border-slate-300 hover:shadow-sm shadow-sm shrink-0"
            >
              <div className="w-7 h-7 rounded-[10px] bg-slate-100 dark:bg-white/10 flex items-center justify-center group-hover:-translate-x-0.5 transition-transform border border-slate-200/50">
                <ArrowLeft size={14} className="text-slate-600 dark:text-academy-textMain/60" />
              </div>
              <span className="text-[13px] font-bold pr-1 hidden sm:block">{getText("Retour à l'accueil", "العودة للرئيسية", "Back to Home")}</span>
            </button>
            
            <div className="hidden sm:block w-px h-8 bg-slate-200"></div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-display font-black text-slate-900 dark:text-academy-textMain leading-none flex items-center gap-2">
                  <span>The <span className="text-[#b91c1c] font-black">1%</span></span>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${season.badgeBg}`}>
                    {season.icon} {season.label}
                  </span>
                </h1>
              </div>
            </div>
          </div>

          {/* Right: Tabs & Search Bar */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto mt-2 sm:mt-0">
            {/* TABS */}
            <div className="bg-slate-100/80 p-1 rounded-2xl flex gap-1 border border-slate-200/50 w-full sm:w-auto overflow-x-auto hide-scrollbar">
              <button
                onClick={() => { setActiveTab("tools_prompts"); setSearchQuery(""); }}
                className={`flex-1 sm:flex-none px-3 sm:px-5 py-1.5 sm:py-2 rounded-xl font-semibold text-[11px] sm:text-[13px] transition-all whitespace-nowrap ${
                  activeTab === "tools_prompts" ? "bg-white dark:bg-academy-surfaceDark text-slate-900 dark:text-academy-textMain shadow-sm border border-slate-200/50" : "text-slate-500 dark:text-academy-textMain/50 hover:text-slate-700 hover:bg-slate-200/50 border border-transparent"
                }`}
              >
                {getText("Outils & Prompts", "أدوات وبرومبت", "Tools & Prompts")}
              </button>
              <button
                onClick={() => { setActiveTab("combos"); setSearchQuery(""); }}
                className={`flex-1 sm:flex-none px-3 sm:px-5 py-1.5 sm:py-2 rounded-xl font-semibold text-[11px] sm:text-[13px] transition-all whitespace-nowrap flex items-center justify-center gap-2 ${
                  activeTab === "combos" ? "bg-white dark:bg-academy-surfaceDark text-emerald-700 dark:text-emerald-300 shadow-sm border border-slate-200/50" : "text-slate-500 dark:text-academy-textMain/50 hover:text-slate-700 hover:bg-slate-200/50 border border-transparent"
                }`}
              >
                {t('resources_page.tabs.combos')}
              </button>
              <button
                onClick={() => {
                  setActiveTab("content_empire");
                  setSearchQuery("");
                  if (!isAuthenticated) {
                    setLoginModalOpen(true);
                  }
                }}
                className={`flex-1 sm:flex-none px-3 sm:px-5 py-1.5 sm:py-2 rounded-xl font-semibold text-[11px] sm:text-[13px] transition-all whitespace-nowrap flex items-center justify-center gap-2 ${
                  activeTab === "content_empire" ? "bg-white dark:bg-academy-surfaceDark text-amber-600 dark:text-amber-400 shadow-sm border border-slate-200/50" : "text-slate-500 dark:text-academy-textMain/50 hover:text-slate-700 hover:bg-slate-200/50 border border-transparent"
                }`}
              >
                {!isAuthenticated && <Lock size={12} className="text-slate-500 dark:text-academy-textMain/50 shrink-0" />}
                {getText("Empire du Contenu", "إمبراطورية المحتوى", "Content Empire")}
              </button>

            </div>

            {/* SEARCH & LANGUAGE */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              {/* SEARCH */}
              <div className="relative flex-1 sm:w-48 md:w-56">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                  <Search size={14} className="text-academy-textMain/40" />
                </div>
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('resources_page.search_placeholder')}
                  className="w-full bg-academy-surface border border-academy-border rounded-xl py-1.5 pl-8 pr-3 text-xs text-academy-textMain focus:outline-none focus:ring-1 focus:ring-academy-primary transition-all"
                />
              </div>
              
              {/* LANGUAGE SWITCHER */}
              <div className="flex items-center bg-slate-100/80 rounded-xl p-0.5 border border-slate-200/50 shrink-0">
                <button 
                  onClick={() => changeLanguage('fr')}
                  className={`px-2.5 py-1.5 rounded-lg text-[10px] font-black transition-all flex items-center gap-1 ${currentLang === 'fr' ? 'bg-white dark:bg-academy-surfaceDark text-slate-800 dark:text-academy-textMain/85 shadow-sm' : 'text-slate-500 dark:text-academy-textMain/50 hover:text-slate-700'}`}
                >
                  <span className="text-[10px]">🇫🇷</span> FR
                </button>
                <button 
                  onClick={() => changeLanguage('en')}
                  className={`px-2.5 py-1.5 rounded-lg text-[10px] font-black transition-all flex items-center gap-1 ${currentLang === 'en' ? 'bg-white dark:bg-academy-surfaceDark text-slate-800 dark:text-academy-textMain/85 shadow-sm' : 'text-slate-500 dark:text-academy-textMain/50 hover:text-slate-700'}`}
                >
                  <span className="text-[10px]">🇬🇧</span> EN
                </button>
                <button 
                  onClick={() => changeLanguage('ar')}
                  className={`px-2.5 py-1.5 rounded-lg text-[10px] font-black transition-all flex items-center gap-1 ${currentLang === 'ar' ? 'bg-white dark:bg-academy-surfaceDark text-slate-800 dark:text-academy-textMain/85 shadow-sm' : 'text-slate-500 dark:text-academy-textMain/50 hover:text-slate-700'}`}
                >
                  <span className="text-[10px]">🇸🇦</span> AR
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CONTENU PRINCIPAL */}
      <div className="max-w-7xl mx-auto px-4 flex-1 w-full my-6">
        
        {/* TAB 1 : OUTILS & PROMPTS COMBINÉS */}
        {activeTab === "tools_prompts" && (
          <div className="animate-in fade-in slide-in-from-bottom-3 duration-300">
            


            <div className="flex flex-col lg:flex-row gap-6">
            {/* SIDEBAR NAVIGATION */}
            <div className={`w-full lg:w-64 shrink-0 ${searchQuery ? 'hidden lg:block opacity-50 pointer-events-none' : ''}`}>
              <div className="lg:sticky lg:top-20 flex flex-col gap-4 lg:gap-6 pb-2 lg:pb-0">
                
                {/* SELECT DROPDOWN FOR MOBILE */}
                <div className="block lg:hidden w-full">
                  <div className="relative">
                    <select 
                      className="w-full appearance-none bg-white dark:bg-academy-surfaceDark border border-slate-200/80 rounded-[14px] px-4 py-3.5 pr-10 text-[13px] font-bold text-slate-700 dark:text-academy-textMain/75 shadow-sm focus:outline-none focus:border-indigo-300 focus:ring-4 focus:ring-indigo-500/10 transition-all"
                      value={`${selectedView.type}-${selectedView.id}`}
                      onChange={(e) => {
                        const [type, ...idParts] = e.target.value.split('-');
                        setSelectedView({ type, id: idParts.join('-') });
                      }}
                    >
                      <optgroup label={getText("Logiciels & IA", "برامج وذكاء اصطناعي", "Software & AI")}>
                        {resourceCategories.map(cat => (
                          <option key={`tool-${cat.id}`} value={`tool-${cat.id}`}>{cat.shortTitle || cat.title}</option>
                        ))}
                      </optgroup>

                    </select>
                    <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-400 dark:text-academy-textMain/40">
                      <ChevronDown size={16} />
                    </div>
                  </div>
                </div>

                {/* DESKTOP SIDEBAR: Section Outils */}
                <div className="hidden lg:block">
                  <h3 className="text-[10px] font-black text-academy-textMain/40 uppercase tracking-wider mb-2 sm:mb-3 px-2 flex items-center gap-2">
                    <Monitor size={12} /> {t('resources_page.tabs.tools') || getText("Logiciels & IA", "برامج وذكاء اصطناعي", "Software & AI")}
                  </h3>
                  <div className="flex flex-col gap-1 pb-1 sm:pb-0">
                    {resourceCategories.map((cat) => (
                      <button
                        key={`tool-${cat.id}`}
                        onClick={() => setSelectedView({ type: 'tool', id: cat.id })}
                        className={`group flex items-center gap-3 px-3 py-2.5 rounded-full text-left whitespace-normal font-bold transition-all text-[13px] ${
                          selectedView.type === 'tool' && selectedView.id === cat.id 
                          ? "bg-slate-900 text-white shadow-md shadow-slate-900/10" 
                          : "bg-transparent text-slate-600 dark:text-academy-textMain/60 hover:bg-white hover:shadow-sm"
                        }`}
                      >
                        <div className={`p-1.5 rounded-full transition-colors ${selectedView.type === 'tool' && selectedView.id === cat.id ? "bg-white/20 dark:bg-academy-surfaceDark/20 text-white" : "bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-academy-textMain/50 group-hover:bg-slate-200 group-hover:text-slate-800"}`}>
                          {React.cloneElement(cat.icon, { size: 14 })}
                        </div>
                        <span>{cat.shortTitle}</span>
                      </button>
                    ))}
                  </div>
                </div>


              </div>
            </div>

            {/* MAIN CONTENT GRID */}
            <div className="flex-1">




              {searchQuery && (
                <div className="mb-6 bg-white dark:bg-academy-surfaceDark rounded-2xl border border-academy-border p-4 shadow-sm">
                  <h2 className="text-sm font-bold text-academy-textMain">
                    Résultats pour "{searchQuery}" : {filteredTools.length} outil(s)
                  </h2>
                </div>
              )}

              {/* Affichage des Outils */}
              {(selectedView.type === 'tool' || searchQuery) && filteredTools.length > 0 && (
                <div className={`${searchQuery ? 'mb-8' : ''}`}>
                  {searchQuery && <h3 className="text-sm font-bold text-academy-textMain mb-4 flex items-center gap-2"><Monitor size={16} className="text-academy-primary" /> Logiciels & IA</h3>}
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5">
                    {filteredTools.map((tool, idx) => (
                      <a 
                        key={idx} 
                        href={tool.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="group bg-white/60 dark:bg-academy-surfaceDark/60 backdrop-blur-md rounded-[24px] border border-slate-200/50 hover:bg-white hover:border-amber-300/50 hover:shadow-lg hover:shadow-amber-500/5 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between h-full relative overflow-hidden p-3 sm:p-5"
                      >
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-400 to-orange-500 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-out z-20"></div>
                        
                        <div className="flex flex-col flex-1">
                          <div className="flex items-start justify-between mb-3 sm:mb-4">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-slate-100/80 text-slate-400 dark:text-academy-textMain/40 flex items-center justify-center group-hover:bg-amber-100 group-hover:text-amber-500 transition-all duration-300">
                              <Monitor size={18} />
                            </div>
                            <div className="text-slate-300 group-hover:text-amber-400 transition-colors p-1.5">
                              <ExternalLink size={12} />
                            </div>
                          </div>
                          <h3 className="font-display font-black text-[13px] sm:text-[16px] text-slate-800 dark:text-academy-textMain/85 leading-tight group-hover:text-amber-600 transition-colors sm:mb-1.5 line-clamp-1">
                            {tool.name}
                          </h3>
                          <p className="hidden sm:block text-slate-500 dark:text-academy-textMain/50 text-[12px] leading-relaxed font-medium mb-3 flex-1 line-clamp-2">
                            {tool.desc}
                          </p>
                        </div>
                        
                        <div className="flex flex-wrap gap-1.5 mt-auto">
                          {tool.badges.map((badge, bIdx) => (
                            <span key={bIdx} className={`px-2 py-0.5 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider rounded-md border ${getBadgeStyles(badge)}`}>
                              {badge}
                            </span>
                          ))}
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}


              {/* Aucun résultat */}
              {searchQuery && filteredTools.length === 0 && (
                <div className="text-center py-16 bg-white dark:bg-academy-surfaceDark rounded-2xl border border-slate-200 dark:border-academy-border shadow-sm">
                  <div className="w-16 h-16 bg-slate-50 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search size={24} className="text-slate-400 dark:text-academy-textMain/40" />
                  </div>
                  <h3 className="text-slate-800 dark:text-academy-textMain/85 font-bold mb-1">Aucun résultat trouvé</h3>
                  <p className="text-xs text-slate-500 dark:text-academy-textMain/50 max-w-sm mx-auto">
                    Nous n'avons trouvé aucun outil ou prompt correspondant à "{searchQuery}". Essayez avec d'autres mots-clés.
                  </p>
                </div>
              )}
            </div>
          </div>
          </div>
        )}


        {/* TAB 6 : COMBOS GRATUITS */}
        {activeTab === "combos" && (
          <div className="animate-in fade-in slide-in-from-bottom-3 duration-300 space-y-6">

            
            {searchQuery && (
              <div className="bg-white dark:bg-academy-surfaceDark rounded-2xl border border-slate-200 dark:border-academy-border p-4">
                <h2 className="text-sm font-bold text-slate-800 dark:text-academy-textMain/85">
                  {filteredCombos.length} résultat{filteredCombos.length > 1 ? 's' : ''} pour "{searchQuery}"
                </h2>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredCombos.slice(0, visibleCombos).map((combo, idx) => {
                const isDev = combo.category === "dev" || (combo.tools && combo.tools.some(t => ["cursor", "v0", "vercel", "supabase", "cloudflare", "python", "docker", "git", "react", "expo", "hono", "ollama", "qdrant"].some(k => t.toLowerCase().includes(k))));
                const is2026 = combo.badge === "Gratuit 2026";
                
                return (
                  <div key={idx} className={`group flex flex-col bg-white dark:bg-academy-surfaceDark rounded-3xl border ${isDev ? 'border-blue-200 dark:border-blue-500/25 hover:border-blue-400 hover:shadow-blue-500/10' : 'border-slate-200/80 hover:border-amber-200'} shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden h-full relative`}>
                    
                    <div className={`absolute top-0 left-0 w-full h-1.5 ${isDev ? 'bg-gradient-to-r from-blue-500 via-indigo-500 to-cyan-400' : 'bg-slate-100 dark:bg-white/10 group-hover:bg-gradient-to-r group-hover:from-amber-400 group-hover:to-orange-400'} transition-all duration-500 z-20`}></div>
                    
                    <div className="p-6 flex-1 flex flex-col relative z-10">
                      <div className="mb-5">
                        <div className="flex items-center justify-between gap-2 mb-3">
                          <div className="text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
                            {isDev ? (
                              <span className="bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-200/80 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                                <TerminalSquare size={11} className="text-blue-600 dark:text-blue-400" /> Dev & Info
                              </span>
                            ) : combo.category === "ia" ? (
                              <span className="bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-200/80 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                                <Brain size={11} className="text-purple-600 dark:text-purple-400" /> IA & Workflows
                              </span>
                            ) : combo.category === "media" ? (
                              <span className="bg-pink-50 dark:bg-pink-500/10 text-pink-700 dark:text-pink-300 border border-pink-200/80 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                                <Palette size={11} className="text-pink-600 dark:text-pink-400" /> Media & Design
                              </span>
                            ) : (
                              <span className="bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-200/80 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                                <Lightbulb size={11} className="text-amber-600 dark:text-amber-400" /> Idée Business
                              </span>
                            )}
                          </div>

                          {is2026 && (
                            <span className="bg-emerald-500 text-white font-black text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full shadow-sm">
                              Gratuit 2026
                            </span>
                          )}
                        </div>

                        <h3 className="font-display font-black text-xl text-slate-800 dark:text-academy-textMain/85 leading-tight mb-3 group-hover:text-amber-600 transition-colors">
                          {combo.title}
                        </h3>
                        <p className="text-slate-500 dark:text-academy-textMain/50 text-[14px] leading-relaxed font-medium line-clamp-3">
                          {combo.goal}
                        </p>
                      </div>

                      <div className="mb-6 flex flex-wrap gap-2">
                        {combo.tools.map((t, tIdx) => (
                          <span key={tIdx} className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg border flex items-center gap-1.5 transition-colors ${
                            isDev ? 'bg-blue-50/80 text-blue-800 dark:text-blue-300 border-blue-200/70 font-medium' : 'bg-slate-50 dark:bg-white/5 text-slate-600 dark:text-academy-textMain/60 border-slate-200/60 group-hover:bg-white group-hover:border-slate-200'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${isDev ? 'bg-blue-500' : 'bg-slate-300 group-hover:bg-amber-400'}`}></span>
                            {t}
                          </span>
                        ))}
                      </div>

                      <div className="mt-auto pt-2">
                        <button 
                          onClick={() => setSelectedCombo(combo)}
                          className="w-full bg-slate-900 hover:bg-emerald-600 text-white font-bold py-3 rounded-xl border border-slate-800 hover:border-emerald-500 shadow-sm transition-all text-[13px] flex items-center justify-center gap-2 group/btn"
                        >
                          Voir le plan d'action <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                        </button>
                      </div>
                    </div>

                    <div className="bg-slate-50/80 px-6 py-4 flex items-center justify-between border-t border-slate-100 dark:border-academy-border">
                      <div className="flex items-center gap-2 text-slate-500 dark:text-academy-textMain/50">
                        <Clock size={14} className="opacity-70" />
                        <span className="text-[11px] font-bold uppercase tracking-wide">{combo.time}</span>
                      </div>
                      <div className="flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/20 px-2.5 py-1 rounded-md shadow-sm">
                        <Zap size={14} className="opacity-80 text-emerald-500 fill-emerald-500" />
                        <span className="text-[10px] font-black uppercase tracking-wide">{combo.cost || "100% GRATUIT"}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination / Load More */}
            {visibleCombos < filteredCombos.length && (
              <div className="flex justify-center pt-6 pb-2">
                <button 
                  onClick={() => setVisibleCombos(prev => prev + 24)}
                  className="bg-white dark:bg-academy-surfaceDark hover:bg-slate-50 text-slate-700 dark:text-academy-textMain/75 font-bold text-xs py-2.5 px-6 rounded-xl border border-slate-200 dark:border-academy-border shadow-sm transition-all flex items-center gap-2 hover:-translate-y-0.5"
                >
                  <RefreshCw size={14} className="text-amber-500" />
                  Afficher plus d'idées ({filteredCombos.length - visibleCombos} restantes)
                </button>
              </div>
            )}
            
            {filteredCombos.length === 0 && (
              <div className="text-center py-12 bg-white dark:bg-academy-surfaceDark rounded-2xl border border-slate-200 dark:border-academy-border text-slate-500 dark:text-academy-textMain/50 text-sm">
                Aucun combo ne correspond à vos filtres ou à votre recherche.
              </div>
            )}
          </div>
        )}

        {/* SECTION LIVRE & MASTERCLASS : CONTENT EMPIRE */}
        {activeTab === "content_empire" && (
          !isAuthenticated ? (
            <div className="animate-in fade-in slide-in-from-bottom-3 duration-300 py-8 flex justify-center">
              <div className="bg-white dark:bg-academy-surfaceDark rounded-3xl border border-slate-200 dark:border-academy-border p-6 sm:p-8 text-slate-800 dark:text-academy-textMain/85 shadow-sm max-w-sm w-full text-center flex flex-col items-center justify-between gap-5">
                
                {/* Lock Icon avec animation CSS légère (aucun impact serveur) */}
                <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-white/10 text-slate-800 dark:text-academy-textMain/85 flex items-center justify-center border border-slate-200 dark:border-academy-border shadow-xs animate-float">
                  <Lock size={24} />
                </div>

                {/* Main Text */}
                <div className="space-y-1.5">
                  <h2 className="text-base sm:text-lg font-display font-black text-slate-900 dark:text-academy-textMain leading-tight">
                    {getText(
                      "Empire du Contenu",
                      "إمبراطورية المحتوى",
                      "Content Empire"
                    )}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-academy-textMain/50 font-medium leading-relaxed">
                    {getText(
                      "Ouvrez un compte gratuit pour débloquer le livre, les hooks & scripts.",
                      "أنشئ حساباً مجانياً لفتح الكتاب، الخطافات والسيناريوهات.",
                      "Open a free account to unlock the book, hooks & scripts."
                    )}
                  </p>
                </div>

                {/* CTA Button */}
                <button
                  onClick={() => setLoginModalOpen(true)}
                  className="w-full bg-academy-primary hover:bg-academy-dark text-academy-onPrimary font-bold py-3 rounded-xl text-xs transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5 flex items-center justify-center gap-2"
                >
                  <User size={15} />
                  {getText("Ouvrir un compte", "إنشاء حساب", "Open an Account")}
                </button>
              </div>
            </div>
          ) : (
            <ContentEmpireSection globalSearchQuery={searchQuery} />
          )
        )}
      </div>

      {/* FOOTER CTA NEWSLETTER (Light Mode) */}
      <div className="bg-white dark:bg-academy-surfaceDark border-t border-slate-200 dark:border-academy-border py-10 px-4 w-full relative overflow-hidden">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="w-10 h-10 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-academy-border rounded-xl flex items-center justify-center mx-auto mb-4 shadow-sm">
            <Mail size={20} className="text-slate-600 dark:text-academy-textMain/60" />
          </div>
          <h2 className="text-xl md:text-2xl font-display font-black text-slate-900 dark:text-academy-textMain mb-2">
            {getText(
              "Ne ratez plus aucune pépite.",
              "لا تفوت أي جوهرة بعد الآن.",
              "Don't miss a single gem."
            )}
          </h2>
          <p className="text-slate-500 dark:text-academy-textMain/50 text-xs mb-6 max-w-lg mx-auto">
            {getText(
              "Inscrivez-vous à notre newsletter privée. Recevez des outils secrets, prompts et stratégies directement dans votre boîte mail.",
              "اشترك في نشرتنا البريدية الخاصة. احصل على أدوات سرية، برومبتات واستراتيجيات مباشرة في صندوق الوارد الخاص بك.",
              "Subscribe to our private newsletter. Get secret tools, prompts, and strategies directly in your inbox."
            )}
          </p>

          {newsletterStatus === "success" ? (
            <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/25 text-emerald-800 dark:text-emerald-300 px-5 py-3.5 rounded-2xl max-w-md mx-auto flex items-center justify-center gap-2 text-xs font-semibold shadow-sm animate-in fade-in zoom-in duration-200">
              <CheckCircle2 size={18} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>{newsletterMsg}</span>
            </div>
          ) : (
            <form onSubmit={handleNewsletterSubmit} className="max-w-md mx-auto">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
                <input 
                  type="email" 
                  value={newsletterEmail}
                  onChange={(e) => {
                    setNewsletterEmail(e.target.value);
                    if (newsletterStatus === "error") setNewsletterStatus("idle");
                  }}
                  placeholder={getText("Votre adresse email", "بريدك الإلكتروني", "Your email address")}
                  className="w-full sm:flex-1 bg-white dark:bg-academy-surfaceDark border border-slate-200 dark:border-academy-border rounded-xl py-2.5 px-4 text-xs text-slate-900 dark:text-academy-textMain placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#991b1b] shadow-sm"
                  required
                />
                <button 
                  type="submit"
                  disabled={newsletterStatus === "loading"}
                  className="w-full sm:w-auto bg-[#a32e2e] hover:bg-[#8b2424] active:bg-[#721c1c] text-white font-bold py-2.5 px-5 rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 shadow-sm shrink-0 disabled:opacity-50"
                >
                  {newsletterStatus === "loading" ? (
                    <RefreshCw size={14} className="animate-spin" />
                  ) : (
                    <>
                      {getText("S'inscrire", "اشترك", "Subscribe")} <ArrowRight size={14} />
                    </>
                  )}
                </button>
              </div>

              {newsletterStatus === "error" && (
                <p className="text-red-500 text-[11px] mt-2 font-medium">
                  {newsletterMsg}
                </p>
              )}
            </form>
          )}

          <p className="text-slate-400 dark:text-academy-textMain/40 text-[10px] mt-3">
            {getText(
              "100% gratuit. Désinscription en 1 clic.",
              "مجاني 100%. إلغاء الاشتراك بنقرة واحدة.",
              "100% free. Unsubscribe in 1 click."
            )}
          </p>
        </div>
      </div>
      
      {/* Auth Modal */}
      {loginModalOpen && (
        <LoginModal
          onClose={() => setLoginModalOpen(false)}
          onSuccess={() => setLoginModalOpen(false)}
        />
      )}

      {/* Combo Details Modal */}
      {selectedCombo && (() => {
        const isModalDev = selectedCombo.category === "dev" || (selectedCombo.tools && selectedCombo.tools.some(t => ["cursor", "v0", "vercel", "supabase", "cloudflare", "python", "docker", "git", "react", "expo", "hono", "ollama", "qdrant"].some(k => t.toLowerCase().includes(k))));

        return (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setSelectedCombo(null)}>
            <div className="bg-white dark:bg-academy-surfaceDark rounded-[32px] w-full max-w-3xl max-h-[90vh] md:max-h-[85vh] overflow-hidden shadow-2xl relative flex flex-col animate-in zoom-in-95 slide-in-from-bottom-4 duration-500" onClick={e => e.stopPropagation()}>
              
              {/* Header section */}
              <div className={`relative px-6 pt-8 pb-14 sm:px-10 sm:pt-8 sm:pb-16 overflow-hidden shrink-0 ${
                isModalDev ? 'bg-gradient-to-br from-blue-50/80 via-white to-indigo-50/80 border-b border-blue-100 dark:border-blue-500/20 text-slate-800 dark:text-academy-textMain/85' : 'bg-slate-50 dark:bg-white/5 border-b border-slate-200 dark:border-academy-border text-slate-800 dark:text-academy-textMain/85'
              }`}>
                {isModalDev && (
                  <div className="absolute top-0 right-0 w-80 h-80 bg-blue-400/10 rounded-full blur-[70px] pointer-events-none"></div>
                )}
                
                <button 
                  onClick={() => setSelectedCombo(null)}
                  className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full transition-all z-20 bg-white dark:bg-academy-surfaceDark border border-slate-200 dark:border-academy-border hover:bg-slate-100 text-slate-500 dark:text-academy-textMain/50 shadow-sm"
                >
                  &times;
                </button>
                
                <div className="relative z-10 flex flex-col items-center text-center">
                  <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mb-3 shadow-sm ${
                    isModalDev ? 'bg-blue-100 dark:bg-blue-500/15 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-500/25' : 'bg-white dark:bg-academy-surfaceDark border border-slate-200 dark:border-academy-border text-slate-600 dark:text-academy-textMain/60'
                  }`}>
                    {isModalDev ? (
                      <>
                        <TerminalSquare size={12} className="text-blue-600 dark:text-blue-400" /> Stack Tech & Dev 2026
                      </>
                    ) : (
                      <>
                        <Lightbulb size={12} className="text-amber-500" /> Idée & Stratégie
                      </>
                    )}
                  </div>
                  <h2 className="font-display font-black text-xl sm:text-2xl md:text-3xl mb-2 leading-tight max-w-2xl text-slate-800 dark:text-academy-textMain/85">
                    {selectedCombo.title}
                  </h2>
                  <p className="text-[13px] sm:text-[15px] leading-relaxed max-w-xl mx-auto font-medium text-slate-600 dark:text-academy-textMain/60">
                    {selectedCombo.goal}
                  </p>
                </div>
              </div>
              
              {/* Scrollable Content */}
              <div className="flex-1 min-h-0 overflow-y-auto relative z-20 -mt-12 pt-12">
                <div className="bg-slate-50 dark:bg-white/5 px-6 sm:px-10 pb-6 min-h-full flex flex-col">
                  
                  {/* Info Bar (Time & Cost) */}
                  <div className="flex flex-col sm:flex-row items-center gap-3 mb-8 -mt-8 relative z-20 mx-auto max-w-2xl w-full">
                    <div className="flex-1 bg-white dark:bg-academy-surfaceDark rounded-[16px] p-4 shadow-[0_4px_20px_rgb(0,0,0,0.06)] border border-slate-100 dark:border-academy-border flex items-center gap-3 w-full">
                      <div className="w-10 h-10 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl flex items-center justify-center border border-amber-100 dark:border-amber-500/20 shrink-0">
                        <Clock size={18} className="text-amber-500" />
                      </div>
                      <div>
                        <span className="text-[9px] font-black text-slate-400 dark:text-academy-textMain/40 uppercase tracking-widest block mb-0.5">Temps estimé</span>
                        <span className="text-slate-800 dark:text-academy-textMain/85 font-bold text-sm">{selectedCombo.time}</span>
                      </div>
                    </div>
                    <div className="flex-1 bg-white dark:bg-academy-surfaceDark rounded-[16px] p-4 shadow-[0_4px_20px_rgb(0,0,0,0.06)] border border-slate-100 dark:border-academy-border flex items-center gap-3 w-full">
                      <div className="w-10 h-10 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl flex items-center justify-center border border-emerald-100 dark:border-emerald-500/20 shrink-0">
                        <Zap size={18} className="text-emerald-500 fill-emerald-500" />
                      </div>
                      <div>
                        <span className="text-[9px] font-black text-slate-400 dark:text-academy-textMain/40 uppercase tracking-widest block mb-0.5">Budget requis</span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-black text-sm">{selectedCombo.cost || "0 DZD (100% Gratuit)"}</span>
                      </div>
                    </div>
                  </div>

                  {/* Tools / Stack Section */}
                  <div className="mb-8 max-w-2xl mx-auto w-full">
                    <h3 className="font-display font-black text-base text-slate-800 dark:text-academy-textMain/85 mb-3 flex items-center gap-2">
                      <div className={`p-1.5 rounded-md ${isModalDev ? 'bg-blue-100 dark:bg-blue-500/15 text-blue-700 dark:text-blue-300' : 'bg-slate-200/50 text-slate-600 dark:text-academy-textMain/60'}`}>
                        {isModalDev ? <TerminalSquare size={16} /> : <Monitor size={16} />}
                      </div> 
                      {isModalDev ? 'Stack Technique & Outils' : 'Outils Requis'}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedCombo.tools.map((t, idx) => {
                        const matchedTool = allTools.find(tool => t.toLowerCase().includes(tool.name.toLowerCase()));
                        const href = matchedTool ? matchedTool.url : `https://www.google.com/search?q=${encodeURIComponent(t)}`;
                        return (
                          <a 
                            key={idx} 
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`px-3 py-1.5 text-[12px] font-bold rounded-xl border shadow-sm flex items-center gap-1.5 hover:scale-105 hover:shadow-md transition-all cursor-pointer ${
                              isModalDev ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-900 border-blue-200 dark:border-blue-500/25 font-medium hover:bg-blue-100' : 'bg-white dark:bg-academy-surfaceDark text-slate-700 dark:text-academy-textMain/75 border-slate-200/80 hover:bg-slate-50'
                            }`}
                          >
                            <div className={`w-1.5 h-1.5 rounded-full ${isModalDev ? 'bg-blue-500' : 'bg-slate-800'}`}></div>
                            {t}
                          </a>
                        );
                      })}
                    </div>
                  </div>

                  {/* Steps Section */}
                  <div className="max-w-2xl mx-auto w-full">
                    <h3 className="font-display font-black text-base text-slate-800 dark:text-academy-textMain/85 mb-6 flex items-center gap-2">
                      <div className="bg-amber-100 dark:bg-amber-500/15 p-1.5 rounded-md"><Target size={16} className="text-amber-600 dark:text-amber-400" /></div> Plan d'action étape par étape
                    </h3>
                    <div className="relative border-l-[2px] border-slate-200 dark:border-academy-border ml-3 space-y-6 pb-2">
                      {selectedCombo.steps.map((step, idx) => (
                        <div key={idx} className="relative pl-6">
                          {/* Timeline Dot */}
                          <div className={`absolute -left-[13px] top-1 w-6 h-6 rounded-full bg-white dark:bg-academy-surfaceDark border-[2px] ${
                            isModalDev ? 'border-blue-500' : 'border-amber-400'
                          } flex items-center justify-center shadow-sm`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${isModalDev ? 'bg-blue-600' : 'bg-amber-500'}`}></div>
                          </div>
                          
                          {/* Step Content */}
                          <div className="bg-white dark:bg-academy-surfaceDark rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-academy-border">
                            <div className={`text-[9px] font-black uppercase tracking-widest mb-2 flex items-center gap-2 ${
                              isModalDev ? 'text-blue-600 dark:text-blue-400 font-medium' : 'text-amber-500'
                            }`}>
                              Étape {idx + 1}
                            </div>
                            <p className="text-[13px] text-slate-600 dark:text-academy-textMain/60 leading-relaxed font-medium">
                              {step}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Marketing Upsell */}
                  <div className="max-w-2xl mx-auto mt-8 mb-2 w-full">
                    <div onClick={() => navigate('/courses')} className="cursor-pointer bg-[#151b2b] rounded-[24px] p-5 sm:p-6 flex flex-col sm:flex-row items-center gap-4 sm:gap-6 shadow-sm group hover:scale-[1.01] transition-transform">
                      
                      <div className="w-[60px] h-[60px] rounded-[20px] border-[2px] border-[#f59e0b] flex items-center justify-center shrink-0 bg-[#151b2b]">
                        <Rocket size={26} className="text-[#fcd34d]" />
                      </div>
                      
                      <div className="flex-1 text-center sm:text-left">
                        <h4 className="text-[18px] font-bold text-white mb-2 flex items-center justify-center sm:justify-start gap-2">
                          Passez au niveau supérieur <Sparkles size={16} className="text-[#f59e0b]" />
                        </h4>
                        <p className="text-[14px] text-slate-400/90 leading-snug">
                          Apprenez à maîtriser ces stacks Dev & IA avec nos formations guidées pas à pas.
                        </p>
                      </div>
                      
                      <button className="shrink-0 bg-white dark:bg-academy-surfaceDark text-slate-900 dark:text-academy-textMain font-bold py-3 px-6 rounded-[14px] text-[15px] flex items-center justify-center gap-2 w-full sm:w-auto hover:bg-slate-50 transition-colors">
                        Découvrir <ArrowRight size={18} />
                      </button>
                    </div>
                  </div>
                  
                </div>
              </div>
              
              {/* Sticky Footer */}
              <div className="p-4 sm:px-10 sm:py-4 bg-white dark:bg-academy-surfaceDark border-t border-slate-100 dark:border-academy-border shrink-0 relative z-30">
                <button 
                  onClick={() => setSelectedCombo(null)}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-xl transition-transform shadow-[0_4px_15px_rgba(15,23,42,0.15)] active:scale-[0.98] text-[13px]"
                >
                  C'est compris, fermer
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  )
}
