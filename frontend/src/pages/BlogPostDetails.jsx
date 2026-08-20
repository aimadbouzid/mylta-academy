import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Calendar, Clock, Share2, Check, BookOpen, ChevronRight, Home, Twitter, Linkedin, Facebook } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import api from '../api/axios'

export default function BlogPostDetails() {
  const { slug } = useParams()
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [copied, setCopied] = useState(false)
  const [scrollProgress, setScrollProgress] = useState(0)

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true)
        const { data } = await api.get(`/blog/${slug}`)
        setPost(data)
      } catch (err) {
        setError(err.response?.data?.error || 'Article introuvable')
      } finally {
        setLoading(false)
      }
    }
    fetchPost()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [slug])

  // Track scroll progress
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight
      if (totalHeight > 0) {
        const currentProgress = (window.scrollY / totalHeight) * 100
        setScrollProgress(currentProgress)
      }
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  const getReadTime = (content = '') => {
    const words = content.split(/\s+/).length
    const time = Math.max(3, Math.ceil(words / 150))
    return `${time} min de lecture`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-white/5 text-slate-900 dark:text-academy-textMain flex flex-col justify-center items-center">
        <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-slate-500 dark:text-academy-textMain/50 text-sm font-bold tracking-widest uppercase animate-pulse">Chargement...</p>
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-white/5 text-slate-900 dark:text-academy-textMain flex flex-col items-center justify-center pt-32 pb-32 px-4">
        <div className="w-24 h-24 bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 rounded-[32px] flex items-center justify-center text-red-500 mb-8 shadow-sm">
          <BookOpen className="w-12 h-12" />
        </div>
        <h1 className="text-4xl font-extrabold text-slate-900 dark:text-academy-textMain mb-4 tracking-tight">Article introuvable</h1>
        <p className="text-slate-500 dark:text-academy-textMain/50 text-lg mb-10 max-w-md text-center">Cet article n'existe pas ou a été déplacé vers une autre URL.</p>
        <Link
          to="/blog"
          className="px-8 py-4 bg-slate-950 hover:bg-slate-800 rounded-2xl font-bold text-white transition-all shadow-xl inline-flex items-center gap-3"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Retourner au blog</span>
        </Link>
      </div>
    )
  }

  // Ultra-premium Markdown rendering components
  const MarkdownComponents = {
    p: ({ node, ...props }) => <p dir="auto" className="mb-8 text-xl leading-[1.8] text-slate-700 dark:text-academy-textMain/75 font-serif-like whitespace-pre-wrap" {...props} />,
    h1: ({ node, ...props }) => <h1 dir="auto" className="text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-academy-textMain mt-16 mb-8 tracking-tight leading-tight" {...props} />,
    h2: ({ node, ...props }) => <h2 dir="auto" className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-academy-textMain mt-16 mb-8 tracking-tight" {...props} />,
    h3: ({ node, ...props }) => <h3 dir="auto" className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-academy-textMain/85 mt-12 mb-6" {...props} />,
    ul: ({ node, ...props }) => <ul dir="auto" className="list-disc pl-8 mb-8 space-y-3 text-xl leading-[1.8] marker:text-red-500 text-slate-700 dark:text-academy-textMain/75 font-serif-like" {...props} />,
    ol: ({ node, ...props }) => <ol dir="auto" className="list-decimal pl-8 mb-8 space-y-3 text-xl leading-[1.8] marker:text-red-500 font-bold text-slate-800 dark:text-academy-textMain/85 font-serif-like" {...props} />,
    li: ({ node, ...props }) => <li dir="auto" className="text-slate-700 dark:text-academy-textMain/75 pl-2" {...props} />,
    blockquote: ({ node, ...props }) => (
      <blockquote dir="auto" className="relative my-12 py-6 pl-8 pr-6 rounded-r-3xl bg-slate-50/80 border-l-4 border-red-500 text-slate-800 dark:text-academy-textMain/85 text-2xl font-medium italic leading-relaxed" {...props} />
    ),
    hr: ({ node, ...props }) => <hr className="my-16 border-t-2 border-slate-100 dark:border-academy-border" {...props} />,
    strong: ({ node, ...props }) => <strong dir="auto" className="text-slate-900 dark:text-academy-textMain font-bold bg-slate-100/50 px-1 py-0.5 rounded" {...props} />,
    em: ({ node, ...props }) => <em dir="auto" className="text-slate-800 dark:text-academy-textMain/85 italic font-serif-like" {...props} />,
    img: ({ node, ...props }) => (
      <figure className="my-12">
        <img className="w-full rounded-[24px] shadow-lg border border-slate-100 dark:border-academy-border object-cover" {...props} />
        {props.alt && <figcaption className="text-center text-sm text-slate-500 dark:text-academy-textMain/50 mt-4 italic">{props.alt}</figcaption>}
      </figure>
    ),
    code: ({ node, inline, ...props }) => 
      inline 
        ? <code dir="auto" className="text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 px-2 py-1 rounded-lg text-sm font-mono border border-red-100 dark:border-red-500/20" {...props} />
        : <pre dir="auto" className="bg-[#0A0F1C] p-6 sm:p-8 rounded-[24px] overflow-x-auto border border-slate-800 my-10 shadow-2xl"><code className="text-amber-400 text-[15px] font-mono leading-relaxed" {...props} /></pre>
  }

  return (
    <div className="min-h-screen bg-white dark:bg-academy-surfaceDark text-slate-900 dark:text-academy-textMain selection:bg-red-500/20 selection:text-red-900 relative font-sans">
      
      {/* Premium Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-1.5 bg-slate-100 dark:bg-white/10 z-50">
        <div
          className="h-full bg-gradient-to-r from-red-600 to-amber-500 transition-all duration-150 ease-out"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* Breadcrumb Navigation - Simple and clean */}
      <div className="sticky top-0 z-40 bg-white/80 dark:bg-academy-surfaceDark/80 backdrop-blur-xl border-b border-slate-100 dark:border-academy-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 dark:text-academy-textMain/50 hover:text-slate-900 transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            <span>Retour aux articles</span>
          </Link>
          
          <button
            onClick={handleShare}
            className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 dark:text-academy-textMain/50 hover:text-slate-900 transition-colors"
          >
            {copied ? (
              <span className="text-green-600 dark:text-green-400 flex items-center gap-1"><Check className="w-4 h-4"/> Copié</span>
            ) : (
              <span className="flex items-center gap-1"><Share2 className="w-4 h-4"/> Partager</span>
            )}
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-20 pb-32 flex flex-col lg:flex-row gap-12 lg:gap-24 relative">
        
        {/* Left Sidebar (Sticky Share on desktop) */}
        <div className="hidden lg:block w-16 shrink-0 relative">
          <div className="sticky top-32 flex flex-col items-center gap-6">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-academy-textMain/40 rotate-180" style={{ writingMode: 'vertical-rl' }}>
              Partager
            </span>
            <div className="w-[1px] h-12 bg-slate-200"></div>
            
            <button onClick={handleShare} title="Copier le lien" className="w-12 h-12 rounded-full bg-slate-50 dark:bg-white/5 hover:bg-red-50 text-slate-500 dark:text-academy-textMain/50 hover:text-red-600 border border-slate-200 dark:border-academy-border flex items-center justify-center transition-all hover:scale-110 shadow-sm">
              {copied ? <Check className="w-5 h-5 text-green-500" /> : <Share2 className="w-5 h-5" />}
            </button>
            <button className="w-12 h-12 rounded-full bg-slate-50 dark:bg-white/5 hover:bg-[#1DA1F2]/10 text-slate-500 dark:text-academy-textMain/50 hover:text-[#1DA1F2] border border-slate-200 dark:border-academy-border flex items-center justify-center transition-all hover:scale-110 shadow-sm">
              <Twitter className="w-5 h-5 fill-current" />
            </button>
            <button className="w-12 h-12 rounded-full bg-slate-50 dark:bg-white/5 hover:bg-[#0A66C2]/10 text-slate-500 dark:text-academy-textMain/50 hover:text-[#0A66C2] border border-slate-200 dark:border-academy-border flex items-center justify-center transition-all hover:scale-110 shadow-sm">
              <Linkedin className="w-5 h-5 fill-current" />
            </button>
          </div>
        </div>

        {/* Main Article Content */}
        <div className="flex-1 max-w-[800px] w-full">
          
          {/* Header */}
          <header className="mb-12 sm:mb-16">
            <div className="flex flex-wrap items-center gap-4 text-sm font-bold text-slate-500 dark:text-academy-textMain/50 mb-8 uppercase tracking-wider">
              <span className="px-4 py-1.5 rounded-full bg-slate-100 dark:bg-white/10 text-slate-900 dark:text-academy-textMain">
                Insights
              </span>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-500" />
                <span>{getReadTime(post.content)}</span>
              </div>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 dark:text-academy-textMain tracking-tighter leading-[1.1] mb-8">
              {post.title}
            </h1>

            {/* Author Area */}
            <div className="flex items-center gap-4 pt-6 mt-6 border-t border-slate-100 dark:border-academy-border">
              <div className="w-14 h-14 rounded-full bg-slate-950 flex items-center justify-center text-white font-bold text-xl shadow-md">
                {post.author?.name ? post.author.name.charAt(0).toUpperCase() : 'M'}
              </div>
              <div>
                <p className="text-lg font-bold text-slate-900 dark:text-academy-textMain">
                  {post.author?.name || 'Équipe Mylta'}
                </p>
                <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-academy-textMain/50 font-medium">
                  <span>Rédaction Expert</span>
                  <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(post.createdAt).toLocaleDateString('fr-FR', {
                      day: 'numeric', month: 'long', year: 'numeric'
                    })}
                  </span>
                </div>
              </div>
            </div>
          </header>

          {/* Massive Hero Image */}
          {post.thumbnail && (
            <div className="relative rounded-[32px] sm:rounded-[40px] overflow-hidden mb-16 shadow-2xl bg-slate-100 dark:bg-white/10 border border-slate-100 dark:border-academy-border aspect-[16/9]">
              <img
                src={post.thumbnail}
                alt={post.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Main Markdown Body */}
          <article className="prose-container">
            <ReactMarkdown components={MarkdownComponents}>
              {post.content}
            </ReactMarkdown>
          </article>

          {/* Post Footer & Author Bio block */}
          <div className="mt-24 pt-12 border-t-2 border-slate-100 dark:border-academy-border">
            <div className="bg-slate-50 dark:bg-white/5 p-8 sm:p-10 rounded-[32px] border border-slate-200 dark:border-academy-border flex flex-col sm:flex-row items-center sm:items-start gap-8">
              <div className="w-24 h-24 shrink-0 rounded-full bg-slate-900 flex items-center justify-center text-white font-bold text-3xl shadow-xl ring-4 ring-white">
                {post.author?.name ? post.author.name.charAt(0).toUpperCase() : 'M'}
              </div>
              <div className="text-center sm:text-left">
                <h4 className="text-2xl font-extrabold text-slate-900 dark:text-academy-textMain mb-2">
                  Écrit par {post.author?.name || 'Équipe Mylta'}
                </h4>
                <p className="text-slate-600 dark:text-academy-textMain/60 text-lg leading-relaxed mb-6">
                  Expert en stratégies d'apprentissage et croissance professionnelle. Nous partageons des insights exclusifs pour vous aider à atteindre l'excellence dans votre domaine.
                </p>
                <Link to="/blog" className="inline-flex items-center gap-2 text-red-600 dark:text-red-400 font-bold hover:text-red-700 transition-colors">
                  <span>Voir tous les articles</span>
                  <ChevronRight className="w-5 h-5" />
                </Link>
              </div>
            </div>
          </div>

          {/* Mobile Share Action Footer */}
          <div className="lg:hidden mt-12 flex flex-col items-center">
            <span className="text-sm font-bold text-slate-500 dark:text-academy-textMain/50 uppercase tracking-widest mb-6">Partager cet article</span>
            <div className="flex items-center gap-4">
              <button onClick={handleShare} className="w-14 h-14 rounded-full bg-slate-50 dark:bg-white/5 hover:bg-red-50 text-slate-500 dark:text-academy-textMain/50 hover:text-red-600 border border-slate-200 dark:border-academy-border flex items-center justify-center shadow-sm">
                {copied ? <Check className="w-6 h-6 text-green-500" /> : <Share2 className="w-6 h-6" />}
              </button>
              <button className="w-14 h-14 rounded-full bg-slate-50 dark:bg-white/5 text-slate-500 dark:text-academy-textMain/50 border border-slate-200 dark:border-academy-border flex items-center justify-center shadow-sm">
                <Twitter className="w-6 h-6 fill-current" />
              </button>
              <button className="w-14 h-14 rounded-full bg-slate-50 dark:bg-white/5 text-slate-500 dark:text-academy-textMain/50 border border-slate-200 dark:border-academy-border flex items-center justify-center shadow-sm">
                <Linkedin className="w-6 h-6 fill-current" />
              </button>
            </div>
          </div>

        </div>
      </div>

    </div>
  )
}
