import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, ChevronRight, Search, Clock, Sparkles, Flame, Share2, Check, Home, ArrowRight } from 'lucide-react'
import api from '../api/axios'

export default function BlogPage() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('Tous')
  const [copiedId, setCopiedId] = useState(null)
  const [newsletterEmail, setNewsletterEmail] = useState('')
  const [newsletterStatus, setNewsletterStatus] = useState(null)
  const [newsletterLoading, setNewsletterLoading] = useState(false)

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const { data } = await api.get('/blog')
        setPosts(data.posts || [])
      } catch (err) {
        console.error('Failed to fetch blog posts', err)
      } finally {
        setLoading(false)
      }
    }
    fetchPosts()
  }, [])

  const categories = ['Tous', '🔥 Tendances', '📈 Business & Marketing', '🤖 Tech & IA', '💡 Conseils']

  const getReadTime = (text = '') => {
    const words = text.split(/\s+/).length
    const time = Math.max(3, Math.ceil(words / 40))
    return `${time} min`
  }

  const filteredPosts = useMemo(() => {
    return posts.filter(post => {
      const titleMatch = post.title?.toLowerCase().includes(searchQuery.toLowerCase())
      const summaryMatch = post.summary?.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesSearch = titleMatch || summaryMatch

      if (selectedCategory === 'Tous') return matchesSearch

      const categoryClean = selectedCategory.replace(/[^a-zA-Z]/g, '').toLowerCase()
      const titleLower = post.title?.toLowerCase() || ''
      const summaryLower = post.summary?.toLowerCase() || ''
      
      const matchesCat = titleLower.includes(categoryClean) || summaryLower.includes(categoryClean)
      return matchesSearch && matchesCat
    })
  }, [posts, searchQuery, selectedCategory])

  const featuredPost = filteredPosts.length > 0 ? filteredPosts[0] : null
  const gridPosts = filteredPosts.length > 1 ? filteredPosts.slice(1) : (searchQuery || selectedCategory !== 'Tous' ? [] : [])

  const handleShare = (e, slug, id) => {
    e.preventDefault()
    e.stopPropagation()
    const url = `${window.location.origin}/blog/${slug}`
    navigator.clipboard.writeText(url)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault()
    if (!newsletterEmail || newsletterLoading) return
    setNewsletterLoading(true)
    setNewsletterStatus(null)
    try {
      await api.post('/auth/newsletter/subscribe', { email: newsletterEmail })
      setNewsletterStatus('success')
      setNewsletterEmail('')
    } catch (err) {
      setNewsletterStatus('error')
    } finally {
      setNewsletterLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-white/5 text-slate-900 dark:text-academy-textMain selection:bg-red-500/20 selection:text-red-900 relative font-sans">
      
      {/* 1) HUGE DARK HERO SECTION */}
      <div className="relative bg-slate-950 pt-32 pb-48 overflow-hidden rounded-b-[40px] sm:rounded-b-[60px] shadow-2xl">
        {/* Glow Effects */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[600px] bg-gradient-to-b from-red-600/20 via-amber-500/10 to-transparent blur-[120px] pointer-events-none rounded-full" />
        <div className="absolute top-1/4 right-0 w-96 h-96 bg-red-500/10 blur-[100px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-500/10 blur-[100px] rounded-full pointer-events-none" />

        {/* Grid Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:60px_60px] pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10 text-center">
          
          <div className="mb-10 flex justify-center">
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/10 dark:bg-academy-surfaceDark/10 backdrop-blur-md border border-white/10 hover:border-white/30 hover:bg-white/15 text-white rounded-full font-medium transition-all shadow-xl"
            >
              <Home className="w-4 h-4" />
              <span>Retour à la plateforme</span>
            </Link>
          </div>

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold uppercase tracking-widest mb-8 backdrop-blur-md shadow-lg shadow-red-500/5">
            <Sparkles className="w-4 h-4" />
            <span>Mylta Insights & Tendances</span>
          </div>

          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold tracking-tighter mb-8 text-white max-w-5xl mx-auto leading-[1.1]">
            L'excellence <span className="bg-gradient-to-r from-red-500 via-red-400 to-amber-400 bg-clip-text text-transparent">au quotidien.</span>
          </h1>

          <p className="text-lg md:text-xl text-slate-300 leading-relaxed max-w-2xl mx-auto font-medium mb-12">
            Stratégies business, innovations tech et conseils exclusifs pour accélérer votre croissance et dominer votre marché.
          </p>

        </div>
      </div>

      {/* 2) SEARCH & FILTER BAR (Glassmorphism overlapping the hero) */}
      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 z-20">
        <div className="bg-white/80 dark:bg-academy-surfaceDark/80 backdrop-blur-xl border border-white/40 shadow-2xl rounded-3xl p-4 sm:p-6 flex flex-col md:flex-row items-center gap-4 transition-all">
          
          <div className="relative w-full flex-1">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-academy-textMain/40 w-5 h-5" />
            <input
              type="text"
              placeholder="Rechercher des stratégies, tutoriels, articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-14 pr-4 py-4 bg-gray-50/50 hover:bg-gray-50 border border-gray-200 dark:border-academy-border rounded-2xl text-slate-900 dark:text-academy-textMain placeholder-gray-400 focus:outline-none focus:border-red-400 focus:ring-4 focus:ring-red-500/10 transition-all text-base font-medium shadow-inner"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-5 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-500 dark:text-academy-textMain/50 hover:text-slate-900 bg-white dark:bg-academy-surfaceDark shadow-sm border border-gray-200 dark:border-academy-border px-3 py-1.5 rounded-lg transition-all"
              >
                Effacer
              </button>
            )}
          </div>

          {/* Categories Horizontal Scroll or Wrap */}
          <div className="flex w-full md:w-auto overflow-x-auto gap-2 pb-2 md:pb-0 scrollbar-hide shrink-0 items-center">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`shrink-0 px-5 py-3.5 rounded-2xl text-sm font-bold transition-all duration-300 border ${
                  selectedCategory === cat
                    ? 'bg-slate-950 text-white border-slate-950 shadow-lg shadow-slate-900/20'
                    : 'bg-white dark:bg-academy-surfaceDark text-slate-600 dark:text-academy-textMain/60 border-gray-200 dark:border-academy-border hover:bg-gray-50 hover:border-gray-300 hover:text-slate-900'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

        </div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
        {/* Loading Skeleton */}
        {loading ? (
          <div className="space-y-16">
            <div className="w-full h-[600px] bg-white dark:bg-academy-surfaceDark border border-gray-100 dark:border-academy-border rounded-[40px] animate-pulse shadow-sm" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-[450px] bg-white dark:bg-academy-surfaceDark border border-gray-100 dark:border-academy-border rounded-[30px] animate-pulse shadow-sm" />
              ))}
            </div>
          </div>
        ) : filteredPosts.length === 0 ? (
          /* Empty State */
          <div className="text-center py-32 bg-white dark:bg-academy-surfaceDark border border-gray-200 dark:border-academy-border rounded-[40px] max-w-3xl mx-auto shadow-sm">
            <div className="w-24 h-24 bg-gray-50 dark:bg-white/5 rounded-[30px] flex items-center justify-center mx-auto mb-6 text-gray-400 dark:text-academy-textMain/40 border border-gray-100 dark:border-academy-border">
              <Search className="w-10 h-10" />
            </div>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-academy-textMain mb-4 tracking-tight">Aucun résultat</h2>
            <p className="text-gray-500 dark:text-academy-textMain/50 text-lg max-w-md mx-auto mb-8">
              Nous n'avons trouvé aucun article correspondant à "{searchQuery}".
            </p>
            <button
              onClick={() => { setSearchQuery(''); setSelectedCategory('Tous'); }}
              className="px-8 py-4 bg-slate-950 hover:bg-slate-800 text-white rounded-2xl text-base font-bold transition-all shadow-lg"
            >
              Réinitialiser les filtres
            </button>
          </div>
        ) : (
          <div className="space-y-24">

            {/* 3) FEATURED POST SPOTLIGHT */}
            {featuredPost && (
              <div className="group">
                <Link
                  to={`/blog/${featuredPost.slug}`}
                  className="relative block bg-white dark:bg-academy-surfaceDark border border-gray-200 dark:border-academy-border rounded-[40px] overflow-hidden hover:border-red-300 hover:shadow-2xl hover:shadow-red-500/10 transition-all duration-500"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-2 items-stretch">
                    {/* Massive Image Container */}
                    <div className="relative min-h-[400px] lg:min-h-[600px] overflow-hidden bg-slate-100 dark:bg-white/10">
                      {featuredPost.thumbnail ? (
                         <img
                          src={featuredPost.thumbnail}
                          alt={featuredPost.title}
                          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 ease-out"
                        />
                      ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-100 dark:bg-white/10 text-slate-300">
                          <Sparkles className="w-16 h-16 mb-4" />
                          <span className="text-lg font-bold uppercase tracking-widest">Mylta Academy</span>
                        </div>
                      )}
                      
                      {/* Gradient overlay on image */}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                      {/* Spotlight badge */}
                      <div className="absolute top-6 left-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/90 dark:bg-academy-surfaceDark/90 text-slate-900 dark:text-academy-textMain text-xs font-extrabold uppercase tracking-widest shadow-xl backdrop-blur-md border border-white/20">
                        <Flame className="w-4 h-4 text-red-600 dark:text-red-400 fill-red-600" />
                        <span>À la Une</span>
                      </div>
                    </div>

                    {/* Content Container */}
                    <div className="p-8 sm:p-12 lg:p-16 flex flex-col justify-center bg-white dark:bg-academy-surfaceDark z-10 relative">
                      {/* Decorative accent */}
                      <div className="absolute top-0 right-0 w-32 h-32 bg-red-50 dark:bg-red-500/10 rounded-bl-[100px] -z-10 transition-transform duration-500 group-hover:scale-110" />

                      <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-academy-textMain/50 mb-6 font-semibold">
                        <span className="px-3 py-1 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-md border border-red-100 dark:border-red-500/20 uppercase tracking-wider text-[11px]">
                          {selectedCategory !== 'Tous' ? selectedCategory : 'Insights'}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {new Date(featuredPost.createdAt).toLocaleDateString('fr-FR', {
                              day: 'numeric', month: 'long', year: 'numeric'
                            })}
                          </span>
                        </div>
                        <span className="text-slate-300">•</span>
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-4 h-4 text-amber-500" />
                          <span>{getReadTime(featuredPost.summary)}</span>
                        </div>
                      </div>

                      <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-academy-textMain group-hover:text-red-600 transition-colors duration-300 leading-[1.2] mb-6 tracking-tight line-clamp-4">
                        {featuredPost.title}
                      </h2>

                      <p className="text-slate-600 dark:text-academy-textMain/60 text-lg leading-relaxed line-clamp-4 mb-12">
                        {featuredPost.summary || "Plongez dans cet article détaillé pour découvrir nos meilleures astuces et méthodologies exclusives."}
                      </p>

                      <div className="flex flex-wrap items-center justify-between gap-6 pt-8 border-t border-gray-100 dark:border-academy-border mt-auto">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-slate-950 flex items-center justify-center text-white font-bold text-lg shadow-md">
                            {featuredPost.author?.name ? featuredPost.author.name.charAt(0).toUpperCase() : 'M'}
                          </div>
                          <div>
                            <p className="text-base font-bold text-slate-900 dark:text-academy-textMain">
                              {featuredPost.author?.name || 'Équipe Mylta'}
                            </p>
                            <p className="text-sm text-slate-500 dark:text-academy-textMain/50 font-medium">Expert Content</p>
                          </div>
                        </div>

                        <div className="inline-flex items-center gap-2 px-6 py-3 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-xl font-bold group-hover:bg-red-600 group-hover:text-white transition-colors duration-300">
                          <span>Lire l'article</span>
                          <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            )}

            {/* 4) GRID ARTICLES */}
            {gridPosts.length > 0 && (
              <div>
                <div className="flex items-end justify-between mb-12 pb-6 border-b-2 border-slate-100 dark:border-academy-border">
                  <h3 className="text-3xl font-extrabold text-slate-900 dark:text-academy-textMain tracking-tight">
                    Dernières publications
                  </h3>
                  <span className="text-sm font-bold text-slate-500 dark:text-academy-textMain/50 bg-slate-100 dark:bg-white/10 px-4 py-1.5 rounded-full">
                    {gridPosts.length} articles
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {gridPosts.map((post) => (
                    <div
                      key={post.id}
                      className="group flex flex-col bg-white dark:bg-academy-surfaceDark border border-gray-200 dark:border-academy-border rounded-[32px] overflow-hidden hover:border-slate-300 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
                    >
                      <Link to={`/blog/${post.slug}`} className="flex flex-col h-full">
                        
                        {/* Thumbnail */}
                        <div className="aspect-[4/3] w-full overflow-hidden bg-slate-100 dark:bg-white/10 relative">
                          {post.thumbnail ? (
                            <img
                              src={post.thumbnail}
                              alt={post.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-300 bg-slate-50 dark:bg-white/5">
                              <Sparkles className="w-10 h-10 opacity-50" />
                            </div>
                          )}

                          {/* Top Meta Pills */}
                          <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                            <span className="px-3 py-1.5 rounded-xl bg-white/90 dark:bg-academy-surfaceDark/90 backdrop-blur-md text-xs font-bold text-slate-900 dark:text-academy-textMain shadow-sm border border-white/20">
                              {getReadTime(post.summary)}
                            </span>
                            
                            <button
                              onClick={(e) => handleShare(e, post.slug, post.id)}
                              title="Copier le lien"
                              className="w-9 h-9 rounded-xl bg-white/90 dark:bg-academy-surfaceDark/90 backdrop-blur-md flex items-center justify-center text-slate-600 dark:text-academy-textMain/60 hover:text-red-600 shadow-sm border border-white/20 transition-all hover:scale-110"
                            >
                              {copiedId === post.id ? <Check className="w-4 h-4 text-green-600 dark:text-green-400" /> : <Share2 className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>

                        {/* Content */}
                        <div className="p-8 flex flex-col flex-grow bg-white dark:bg-academy-surfaceDark relative">
                          
                          <div className="flex items-center gap-2 text-xs font-bold text-red-600 dark:text-red-400 mb-4 tracking-wider uppercase">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>
                              {new Date(post.createdAt).toLocaleDateString('fr-FR', {
                                day: 'numeric', month: 'short', year: 'numeric'
                              })}
                            </span>
                          </div>

                          <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-academy-textMain group-hover:text-red-600 transition-colors duration-300 leading-tight mb-4 line-clamp-3">
                            {post.title}
                          </h3>

                          <p className="text-slate-600 dark:text-academy-textMain/60 text-base line-clamp-3 leading-relaxed mb-8 flex-grow">
                            {post.summary || "Découvrez nos meilleurs conseils et retours d'expérience dans cet article incontournable..."}
                          </p>

                          {/* Footer */}
                          <div className="pt-6 border-t border-slate-100 dark:border-academy-border flex items-center justify-between mt-auto">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center text-slate-900 dark:text-academy-textMain font-bold text-xs">
                                {post.author?.name ? post.author.name.charAt(0).toUpperCase() : 'M'}
                              </div>
                              <span className="text-sm font-bold text-slate-900 dark:text-academy-textMain">
                                {post.author?.name || 'Mylta Team'}
                              </span>
                            </div>
                            
                            <div className="w-10 h-10 rounded-full bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-400 dark:text-academy-textMain/40 group-hover:bg-red-50 group-hover:text-red-600 transition-colors">
                              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                            </div>
                          </div>
                        </div>
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 5) NEWSLETTER - SaaS Style */}
        <div className="mt-32 relative rounded-[40px] overflow-hidden p-10 sm:p-16 lg:p-20 bg-slate-950 shadow-2xl border border-slate-800">
          {/* Abstract background shapes */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-red-600/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-amber-500/10 rounded-full blur-[80px] translate-y-1/3 -translate-x-1/3 pointer-events-none" />
          
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 dark:bg-academy-surfaceDark/10 border border-white/10 text-slate-300 text-xs font-bold uppercase tracking-widest mb-6 backdrop-blur-sm">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Rejoignez l'élite</span>
              </div>
              <h3 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-6 tracking-tight leading-tight">
                Une longueur d'avance, <br/><span className="text-red-400">chaque semaine.</span>
              </h3>
              <p className="text-slate-300 text-lg leading-relaxed max-w-lg">
                Inscrivez-vous pour recevoir nos analyses poussées, nos études de cas et les stratégies de ceux qui réussissent. Pas de spam, que de la valeur.
              </p>
            </div>

            <div className="lg:pl-10">
              <form onSubmit={handleNewsletterSubmit} className="bg-white/5 dark:bg-academy-surfaceDark/5 border border-white/10 p-6 sm:p-8 rounded-[32px] backdrop-blur-md shadow-xl">
                <div className="flex flex-col gap-4">
                  <label className="text-sm font-bold text-white ml-2">Votre email professionnel</label>
                  <input
                    type="email"
                    placeholder="exemple@entreprise.com"
                    value={newsletterEmail}
                    onChange={(e) => { setNewsletterEmail(e.target.value); setNewsletterStatus(null) }}
                    required
                    className="w-full px-6 py-4 bg-slate-900/50 border border-white/20 rounded-2xl text-base text-white placeholder-slate-500 focus:outline-none focus:border-red-400 focus:ring-4 focus:ring-red-500/20 transition-all"
                  />
                  <button
                    type="submit"
                    disabled={newsletterLoading}
                    className="w-full px-6 py-4 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-bold rounded-2xl text-base transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-600/20"
                  >
                    {newsletterLoading ? (
                      <span className="animate-pulse">Inscription en cours...</span>
                    ) : (
                      <>
                        <span>S'abonner maintenant</span>
                        <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </button>
                  
                  <div className="h-6 flex items-center justify-center mt-2">
                    {newsletterStatus === 'success' && (
                      <p className="text-green-400 text-sm font-bold flex items-center gap-1.5"><Check className="w-4 h-4"/> Inscription réussie ! Bienvenue.</p>
                    )}
                    {newsletterStatus === 'error' && (
                      <p className="text-red-400 text-sm font-bold">Une erreur s'est produite. Réessayez.</p>
                    )}
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
