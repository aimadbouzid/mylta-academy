// AdminDashboard.jsx — Dashboard Admin complet & professionnel (Thème Bleu Éducatif)
// Gestion complète des formations, leçons vidéo (Drive/WeTransfer) et validation des reçus.

import { useState, useEffect, useCallback } from 'react'
import { useSocket } from '../context/SocketContext'
import {
  LayoutDashboard, ClipboardCheck, BookOpen, LogOut, ArrowLeft, Menu,
  Users, DollarSign, Clock, Eye, CheckCircle,
  XCircle, Plus, Trash2, Globe, GlobeLock,
  GraduationCap, AlertCircle, X, Edit3, Film, Info, HelpCircle, Upload, Save, MessageSquare, Compass, Sparkles,
  Radio, RefreshCw, Search, Activity, MousePointer, BarChart2, Award, ChevronRight, Mail, Settings,
  Ticket, CreditCard, FileText
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../hooks/useToast.jsx'
import { optimizeImage } from '../utils/imageOptimizer'
import Logo from '../components/Logo'
import CertificateGenerator from '../components/CertificateGenerator'
import AdminCouponsTab from '../components/admin/AdminCouponsTab'
import AdminPayoutsTab from '../components/admin/AdminPayoutsTab'
import AdminBlogTab from '../components/admin/AdminBlogTab'
import api from '../api/axios'
import { useLanguage } from '../context/LanguageContext'

// ── Carte Statistique ──────────────────────────────────────────
function StatCard({ icon: Icon, label, value, color, border, glowColor = 'from-blue-500/10' }) {
  return (
    <div className={`bg-gradient-to-b from-white/[0.04] to-white/[0.01] backdrop-blur-xl border border-white/5 rounded-2xl sm:rounded-3xl p-5 relative overflow-hidden group transition-all duration-500 hover:-translate-y-1 hover:border-white/10 hover:shadow-[0_20px_50px_rgba(0,0,0,0.4)]`}>
      {/* Background ambient glow */}
      <div className={`absolute -right-8 -bottom-8 w-28 h-28 bg-gradient-to-br ${glowColor} to-transparent rounded-full blur-2xl opacity-30 group-hover:opacity-60 transition-opacity duration-500`} />
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="flex items-start justify-between">
        <div className="space-y-3">
          <p className="text-neutral-400 text-xs font-semibold tracking-wide uppercase">{label}</p>
          <p className="font-display font-black text-2xl sm:text-3xl text-white tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-neutral-400">
            {value}
          </p>
        </div>
        <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center border border-white/10 shadow-lg`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
    </div>
  )
}

// ── Badge Statut ───────────────────────────────────────────────
function StatusBadge({ status }) {
  const { t } = useLanguage()
  const cfg = {
    PENDING:  { cls: 'bg-amber-500/10 text-amber-400 border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.15)]', label: t('admin.status_pending') },
    APPROVED: { cls: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.15)]', label: t('admin.status_approved') },
    REJECTED: { cls: 'bg-red-500/10 text-white border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.15)]', label: t('admin.status_rejected') },
  }[status] || { cls: 'bg-white/5 text-neutral-400 border-white/10', label: status }

  return (
    <span className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${cfg.cls}`}>
      {cfg.label}
    </span>
  )
}

// ── Modal Image Reçu ───────────────────────────────────────────
function ReceiptImageModal({ url, onClose }) {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-neutral-950/90 backdrop-blur-xl" />
      <div className="relative max-w-3xl w-full animate-fade-up" onClick={e => e.stopPropagation()}>
        <button onClick={onClose}
                className="absolute -top-4 -right-4 sm:-top-6 sm:-right-6 w-10 h-10 sm:w-12 sm:h-12 bg-neutral-900 border border-white/10
                           rounded-full flex items-center justify-center text-neutral-400 hover:text-white hover:bg-neutral-800 transition-all z-10 shadow-2xl">
          <X size={20} />
        </button>
        <img src={url} alt="Reçu de paiement"
             className="w-full rounded-3xl border border-white/10 shadow-2xl object-contain max-h-[85vh]" />
      </div>
    </div>
  )
}

// ── Guide Google Drive & WeTransfer ─────────────────────────────
function VideoGuideBox() {
  const { t } = useLanguage()
  return (
    <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-5 text-sm text-blue-200/80 space-y-3">
      <div className="flex items-center gap-2 font-bold text-blue-400 text-base">
        <HelpCircle size={18} />
        <span>{t('admin.video_guide_title')}</span>
      </div>
      <p className="text-neutral-400">
        {t('admin.video_guide_1')}
      </p>
      <p className="text-neutral-400">
        {t('admin.video_guide_2')}
      </p>
      <p className="text-white font-semibold bg-white/5 border border-white/10 p-3 rounded-xl mt-4">
        {t('admin.video_guide_security')}
      </p>
    </div>
  )
}

// ── Modal Ajout / Édition Formation ────────────────────────────
function CourseModal({ courseToEdit, onClose, onSuccess }) {
  const { t } = useLanguage()
  const { success: toastSuccess, error: toastError } = useToast()
  const isEditing = !!courseToEdit

  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    title: courseToEdit?.title || '',
    description: courseToEdit?.description || '',
    price: courseToEdit?.price !== undefined ? courseToEdit.price : '',
    category: courseToEdit?.category || 'Tech',
    level: courseToEdit?.level || 'Débutant',
    duration: courseToEdit?.duration || '',
    thumbnail: courseToEdit?.thumbnail || '',
    discountPrice: courseToEdit?.discountPrice || '',
    discountEndsAt: courseToEdit?.discountEndsAt ? new Date(courseToEdit.discountEndsAt).toISOString().slice(0, 16) : '',
    showSyllabus: courseToEdit?.showSyllabus !== undefined ? courseToEdit.showSyllabus : true,
  })

  const [lessons, setLessons] = useState(
    courseToEdit?.lessons && courseToEdit.lessons.length > 0
      ? courseToEdit.lessons.map(l => ({
          id: l.id,
          title: l.title,
          externalVideoUrl: l.externalVideoUrl || '',
          duration: l.duration || '',
          description: l.description || '',
        }))
      : [{ title: '', externalVideoUrl: '', duration: '', description: '' }]
  )

  const [uploadingThumb, setUploadingThumb] = useState(false)
  const setField = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }))
  const handleThumbnailUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setUploadingThumb(true)
    try {
      const optimized = await optimizeImage(file, 800)
      const formData = new FormData()
      formData.append('image', optimized)
      const { data } = await api.post('/admin/upload-thumbnail', formData)
      setForm(p => ({ ...p, thumbnail: data.url }))
      toastSuccess('Image optimisée et uploadée avec succès !')
    } catch (err) {
      if (err.message.includes("chargement de l'image") || err.message.includes("n'est pas une image")) {
        toastError("Format invalide. Si vous êtes sur Mac/iPhone, convertissez votre photo en JPG ou PNG (le format HEIC n'est pas supporté par votre navigateur).")
      } else {
        toastError(err.response?.data?.error || err.message || "Erreur d'upload")
      }
    } finally {
      setUploadingThumb(false)
      if (e.target) e.target.value = ''
    }
  }

  const setLesson = (i, k) => (e) => {
    setLessons(p => p.map((l, idx) => idx === i ? { ...l, [k]: e.target.value } : l))
  }
  const addLesson = () => setLessons(p => [...p, { title: '', externalVideoUrl: '', duration: '', description: '' }])
  const removeLesson = async (i) => {
    const lessonToDelete = lessons[i]
    if (lessonToDelete.id && isEditing) {
      if (!confirm(`Supprimer définitivement la leçon "${lessonToDelete.title}" ?`)) return
      try {
        await api.delete(`/admin/lessons/${lessonToDelete.id}`)
        toastSuccess('Leçon supprimée.')
      } catch {
        toastError('Erreur lors de la suppression de la leçon.')
        return
      }
    }
    setLessons(p => p.filter((_, idx) => idx !== i))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (isEditing) {
        // Modifier le cours
        await api.put(`/admin/courses/${courseToEdit.id}`, {
          ...form,
          price: parseFloat(form.price),
          discountPrice: form.discountPrice ? parseFloat(form.discountPrice) : null,
          discountEndsAt: form.discountEndsAt || null,
        })

        // Sauvegarder/Ajouter les leçons
        for (const l of lessons) {
          if (l.id) {
            await api.put(`/admin/lessons/${l.id}`, l)
          } else if (l.title && l.externalVideoUrl) {
            await api.post(`/admin/courses/${courseToEdit.id}/lessons`, l)
          }
        }
        toastSuccess(`Formation "${form.title}" mise à jour !`)
      } else {
        // Créer le cours avec ses leçons
        await api.post('/admin/courses', {
          ...form,
          price: parseFloat(form.price),
          discountPrice: form.discountPrice ? parseFloat(form.discountPrice) : null,
          discountEndsAt: form.discountEndsAt || null,
          lessons,
        })
        toastSuccess(`Formation "${form.title}" créée avec succès !`)
      }
      onSuccess?.()
      onClose?.()
    } catch (err) {
      toastError(err.response?.data?.error || 'Erreur lors de l\'enregistrement.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[150] flex items-start justify-center p-4 pt-16 overflow-y-auto" onClick={onClose}>
      <div className="fixed inset-0 bg-neutral-950/80 backdrop-blur-md" />
      <div className="relative w-full max-w-4xl bg-neutral-900/90 border border-white/10 backdrop-blur-2xl rounded-3xl shadow-2xl animate-fade-up mb-12"
           onClick={e => e.stopPropagation()}>

        <div className="flex items-center justify-between p-8 border-b border-white/5">
          <div>
            <h2 className="font-display font-bold text-2xl text-white">
              {isEditing ? `Modifier "${courseToEdit.title}"` : 'Créer une nouvelle formation'}
            </h2>
            <p className="text-neutral-400 text-sm mt-1">Configurez les informations et ajoutez vos leçons vidéo</p>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-neutral-400 hover:text-white hover:bg-white/10 hover:border-white/30 transition-all">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          <VideoGuideBox />

          {/* Informations Formation */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="sm:col-span-2">
              <label className="text-neutral-400 text-sm font-medium mb-2 block">Titre de la formation *</label>
              <input value={form.title} onChange={setField('title')} required
                     placeholder="Ex: Marketing Digital & E-Commerce DZ"
                     className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-neutral-600 focus:border-white/40 outline-none transition-all" />
            </div>
            <div className="sm:col-span-2">
              <label className="text-neutral-400 text-sm font-medium mb-2 block">Description *</label>
              <textarea value={form.description} onChange={setField('description')} required
                        rows={3} placeholder="Présentation détaillée des objectifs du cours…"
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-neutral-600 focus:border-white/40 outline-none transition-all resize-none" />
            </div>
            <div>
              <label className="text-neutral-400 text-sm font-medium mb-2 block">Prix (DZD) *</label>
              <input type="number" value={form.price} onChange={setField('price')} required min="0"
                     placeholder="4500" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-neutral-600 focus:border-white/40 outline-none transition-all" />
            </div>
            <div>
              <label className="text-neutral-400 text-sm font-medium mb-2 block">Durée totale estimée</label>
              <input value={form.duration} onChange={setField('duration')}
                     placeholder="Ex: 14h 30min" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-neutral-600 focus:border-white/40 outline-none transition-all" />
            </div>
            
            {/* Nouvelles fonctionnalités */}
            <div className="sm:col-span-2">
              <label className="text-neutral-400 text-sm font-medium mb-2 block">Image de couverture (Upload ou URL)</label>
              <div className="flex gap-3">
                <input value={form.thumbnail} onChange={setField('thumbnail')}
                       placeholder="Ex: https://example.com/image.jpg" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-neutral-600 focus:border-white/40 outline-none transition-all flex-1" />
                <label className={`bg-white text-black shadow-lg shadow-white/20 flex items-center justify-center px-6 rounded-xl cursor-pointer text-sm font-bold whitespace-nowrap ${uploadingThumb ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 transition-transform'}`}>
                  <Upload size={18} className="mr-2" /> {uploadingThumb ? 'Upload...' : 'Uploader'}
                  <input type="file" accept="image/*" className="hidden" onChange={handleThumbnailUpload} disabled={uploadingThumb} />
                </label>
              </div>
            </div>
            <div>
              <label className="text-neutral-400 text-sm font-medium mb-2 block">Prix réduit promotionnel (DZD)</label>
              <input type="number" value={form.discountPrice} onChange={setField('discountPrice')} min="0"
                     placeholder="Ex: 2500" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-neutral-600 focus:border-white/40 outline-none transition-all" />
            </div>
            <div>
              <label className="text-neutral-400 text-sm font-medium mb-2 block">Fin de la promotion</label>
              <input type="datetime-local" value={form.discountEndsAt} onChange={setField('discountEndsAt')}
                     className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-neutral-600 focus:border-white/40 outline-none transition-all [color-scheme:dark]" />
            </div>
            <div className="sm:col-span-2 flex items-center gap-3 pt-3">
              <input type="checkbox" id="showSyllabus" checked={form.showSyllabus} onChange={(e) => setForm(p => ({ ...p, showSyllabus: e.target.checked }))}
                     className="w-5 h-5 rounded bg-black/40 border border-white/10 accent-white cursor-pointer" />
              <label htmlFor="showSyllabus" className="text-neutral-300 text-sm cursor-pointer select-none">
                Afficher le programme (Syllabus) publiquement avant l'achat
              </label>
            </div>
            
            <div>
              <label className="text-neutral-400 text-sm font-medium mb-2 block">Catégorie</label>
              <select value={form.category} onChange={setField('category')} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-white/40 outline-none transition-all appearance-none cursor-pointer">
                {['Tech', 'Marketing', 'Business', 'Design', 'Finance', 'Général'].map(c => (
                  <option key={c} value={c} className="bg-neutral-900">{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-neutral-400 text-sm font-medium mb-2 block">Niveau</label>
              <select value={form.level} onChange={setField('level')} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-white/40 outline-none transition-all appearance-none cursor-pointer">
                {['Débutant', 'Intermédiaire', 'Avancé'].map(l => (
                  <option key={l} value={l} className="bg-neutral-900">{l}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Liste des Leçons */}
          <div className="pt-8 border-t border-white/10">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-white font-bold text-xl flex items-center gap-3">
                  <Film size={20} className="text-white" />
                  Leçons du programme ({lessons.length})
                </h3>
                <p className="text-neutral-400 text-sm mt-1">Chaque leçon possède son titre et son lien vidéo confidentiel.</p>
              </div>
              <button type="button" onClick={addLesson} className="bg-white text-black shadow-lg shadow-white/20 text-sm py-2.5 px-5">
                <Plus size={16} className="mr-1" /> Ajouter
              </button>
            </div>

            <div className="space-y-4">
              {lessons.map((l, i) => (
                <div key={i} className="bg-black/20 border border-white/5 rounded-2xl p-6 space-y-4 relative group">
                  <div className="flex items-center justify-between">
                    <span className="text-white font-mono font-bold text-xs bg-red-500/10 px-3 py-1.5 rounded-lg border border-red-500/20">
                      Leçon {i + 1}
                    </span>
                    {lessons.length > 1 && (
                      <button type="button" onClick={() => removeLesson(i)} className="text-red-400/50 hover:text-red-400 bg-red-500/5 hover:bg-red-500/20 p-2 rounded-lg transition-colors border border-transparent hover:border-red-500/20" title="Supprimer cette leçon">
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="sm:col-span-2">
                      <input value={l.title} onChange={setLesson(i, 'title')} required
                             placeholder="Titre de la vidéo (ex: Intro au SEO)" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-neutral-600 focus:border-white/40 outline-none transition-all" />
                    </div>
                    <div>
                      <input value={l.duration} onChange={setLesson(i, 'duration')}
                             placeholder="Durée (ex: 45min)" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-neutral-600 focus:border-white/40 outline-none transition-all" />
                    </div>
                  </div>

                  <div>
                    <input value={l.externalVideoUrl} onChange={setLesson(i, 'externalVideoUrl')} required
                           placeholder="Lien vidéo Google Drive / WeTransfer (Ex: https://drive.google.com/file/d/...)"
                           className="w-full bg-blue-950/20 border border-blue-500/20 rounded-xl px-4 py-3 text-blue-400 placeholder-blue-900/50 focus:border-blue-500 outline-none transition-all font-mono text-sm" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-4 pt-8 border-t border-white/10">
            <button type="button" onClick={onClose} className="flex-1 py-3.5 border border-white/10 text-neutral-400 rounded-xl hover:border-white/30 hover:bg-white/5 hover:text-white transition-all font-medium">
              Annuler
            </button>
            <button type="submit" disabled={loading} className="flex-[2] bg-white text-black shadow-lg shadow-white/20 justify-center disabled:opacity-50 text-base py-3.5 font-bold">
              {loading ? 'Enregistrement…' : isEditing ? 'Mettre à jour la formation' : 'Créer la formation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Tab Configuration Globale (Vidéo + Modules) ─────────────────────────
function SettingsTab() {
  const { t } = useLanguage()
  const { success: toastSuccess, error: toastError } = useToast()
  const [videoUrl, setVideoUrl] = useState('')
  const [modules, setModules] = useState({ instructorEnabled: true, resourcesEnabled: true, blogEnabled: true, inAppBrowserGuardEnabled: true })
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)

  // Règles de retrait appliquées aux formateurs
  const [payoutRules, setPayoutRules] = useState({
    minPayoutAmount: 1000, maxPayoutAmount: 0,
    payoutsEnabled: true, requireIdentityForPayout: true,
  })
  const [savingPayoutRules, setSavingPayoutRules] = useState(false)

  useEffect(() => {
    api.get('/admin/config')
      .then(res => {
        setVideoUrl(res.data?.introVideoUrl || '')
        if (res.data?.modules) {
          setModules(res.data.modules)
        }
        const m = res.data?.marketplace
        if (m) {
          setPayoutRules({
            minPayoutAmount: m.minPayoutAmount ?? 1000,
            maxPayoutAmount: m.maxPayoutAmount ?? 0,
            payoutsEnabled: m.payoutsEnabled !== false,
            requireIdentityForPayout: m.requireIdentityForPayout !== false,
          })
        }
      })
      .catch(() => toastError('Erreur chargement configuration vidéo.'))
  }, [])

  const handleSavePayoutRules = async (e) => {
    e.preventDefault()
    const min = Number(payoutRules.minPayoutAmount)
    const max = Number(payoutRules.maxPayoutAmount)
    if (!Number.isFinite(min) || min < 0) return toastError('Montant minimum invalide.')
    if (!Number.isFinite(max) || max < 0) return toastError('Plafond invalide.')
    if (max > 0 && max < min) return toastError('Le plafond doit être supérieur au minimum.')

    setSavingPayoutRules(true)
    try {
      // Seule la clé marketplace est envoyée : la fusion côté serveur préserve
      // les autres réglages (commission, prix de place…).
      await api.put('/admin/config', {
        marketplace: {
          minPayoutAmount: min,
          maxPayoutAmount: max,
          payoutsEnabled: payoutRules.payoutsEnabled,
          requireIdentityForPayout: payoutRules.requireIdentityForPayout,
        },
      })
      toastSuccess('Règles de retrait mises à jour.')
    } catch (err) {
      toastError(err.response?.data?.error || 'Erreur lors de la mise à jour.')
    } finally {
      setSavingPayoutRules(false)
    }
  }

  const handleSaveUrl = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.put('/admin/config', { introVideoUrl: videoUrl, modules })
      toastSuccess('Configuration mise à jour avec succès !')
      if (typeof window !== 'undefined' && window.dispatchEvent) {
        window.dispatchEvent(new Event('configUpdated'))
      }
    } catch (err) {
      toastError(err.response?.data?.error || 'Erreur lors de la mise à jour.')
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('video', file)
      const { data } = await api.post('/admin/upload-intro-video', formData)
      setVideoUrl(data.url)
      toastSuccess('Vidéo téléversée et configurée avec succès !')
    } catch (err) {
      toastError(err.response?.data?.error || 'Erreur lors du téléversement de la vidéo.')
    } finally {
      setUploading(false)
      if (e.target) e.target.value = ''
    }
  }

  return (
    <div className="animate-fade-up space-y-8 max-w-4xl">
      <div>
        <h1 className="font-display font-bold text-4xl text-white tracking-tight mb-2">Vidéo d&apos;accueil</h1>
        <p className="text-neutral-400">Gérez la vidéo d&apos;introduction qui s&apos;affiche aux visiteurs à l&apos;entrée sur la plateforme</p>
      </div>

      <div className="bg-neutral-900/40 backdrop-blur-xl border border-white/5 rounded-3xl p-8 space-y-8 shadow-2xl">
        <form onSubmit={handleSaveUrl} className="space-y-4">
          <div>
            <label className="text-neutral-400 text-sm font-medium mb-3 block">Lien URL de la vidéo</label>
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="text"
                value={videoUrl}
                onChange={e => setVideoUrl(e.target.value)}
                placeholder="Ex: http://localhost:3000/uploads/intro/intro.mp4"
                required
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 text-blue-400 placeholder-blue-900/50 focus:border-blue-500 outline-none transition-all flex-1 font-mono text-sm"
              />
              <button type="submit" disabled={loading} className="bg-white text-black shadow-lg shadow-white/20 text-sm px-8 py-3.5 whitespace-nowrap hover:scale-105 transition-transform">
                {loading ? 'Enregistrement…' : 'Enregistrer le lien'}
              </button>
            </div>
          </div>
          
          <div className="pt-6 border-t border-white/5 space-y-4">
            <h3 className="text-white font-semibold">Modules de la Plateforme</h3>
            
            <div className="flex items-center justify-between p-4 bg-black/20 rounded-xl border border-white/5">
              <div>
                <p className="text-white font-medium">Espace Formateur</p>
                <p className="text-neutral-400 text-xs">Activer le dashboard formateur et le bouton "Devenir Formateur".</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={modules.instructorEnabled}
                  onChange={(e) => setModules({...modules, instructorEnabled: e.target.checked})}
                />
                <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-black/20 rounded-xl border border-white/5">
              <div>
                <p className="text-white font-medium">Ressources Premium</p>
                <p className="text-neutral-400 text-xs">Activer l'accès à la page des outils et ressources recommandés.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={modules.resourcesEnabled}
                  onChange={(e) => setModules({...modules, resourcesEnabled: e.target.checked})}
                />
                <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-black/20 rounded-xl border border-white/5">
              <div>
                <p className="text-white font-medium">Section Blog</p>
                <p className="text-neutral-400 text-xs">Activer l'accès à la page des articles de blog.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={modules.blogEnabled !== false}
                  onChange={(e) => setModules({...modules, blogEnabled: e.target.checked})}
                />
                <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-black/20 rounded-xl border border-white/5">
              <div>
                <p className="text-white font-medium">Redirection navigateur externe</p>
                <p className="text-neutral-400 text-xs">Depuis Instagram, TikTok, Facebook… rouvrir automatiquement le site dans Chrome/Safari plutôt que le navigateur intégré de l'app.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={modules.inAppBrowserGuardEnabled !== false}
                  onChange={(e) => setModules({...modules, inAppBrowserGuardEnabled: e.target.checked})}
                />
                <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
              </label>
            </div>

            <div className="flex justify-end pt-2">
              <button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-500 text-white shadow-lg text-sm px-6 py-2.5 rounded-lg font-bold transition-colors">
                {loading ? 'Enregistrement...' : 'Enregistrer les modifications'}
              </button>
            </div>
          </div>
        </form>

        <div className="pt-6 border-t border-white/5">
          <label className="text-neutral-400 text-sm font-medium mb-4 block">Ou Téléverser directement un fichier vidéo MP4</label>
          <div className="flex items-center gap-4 flex-wrap">
            <label className={`bg-white text-black shadow-lg shadow-white/20 text-sm px-6 py-3 cursor-pointer inline-flex items-center gap-2 font-bold ${uploading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 transition-transform'}`}>
              <Upload size={18} />
              {uploading ? 'Téléversement en cours...' : 'Sélectionner une vidéo MP4'}
              <input type="file" accept="video/*" onChange={handleFileUpload} disabled={uploading} className="hidden" />
            </label>
            <span className="text-neutral-500 text-sm font-medium">Fichiers autorisés: MP4, WebM (Max 150 Mo)</span>
          </div>
        </div>

        {/* ═══ Règles de retrait des formateurs ═══ */}
        <form onSubmit={handleSavePayoutRules} className="pt-6 border-t border-white/5 space-y-4">
          <div>
            <h3 className="text-white font-semibold">Retraits des formateurs</h3>
            <p className="text-neutral-400 text-xs mt-1">
              Ces règles s'appliquent immédiatement à toutes les demandes de retrait.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-neutral-400 text-xs font-bold mb-1.5">
                Montant minimum par demande (DA)
              </label>
              <input type="number" min="0" value={payoutRules.minPayoutAmount}
                onChange={e => setPayoutRules(r => ({ ...r, minPayoutAmount: e.target.value }))}
                className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white outline-none focus:border-blue-500/50" />
            </div>
            <div>
              <label className="block text-neutral-400 text-xs font-bold mb-1.5">
                Plafond par demande (DA) — 0 = illimité
              </label>
              <input type="number" min="0" value={payoutRules.maxPayoutAmount}
                onChange={e => setPayoutRules(r => ({ ...r, maxPayoutAmount: e.target.value }))}
                className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white outline-none focus:border-blue-500/50" />
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-black/20 rounded-xl border border-white/5">
            <div>
              <p className="text-white font-medium">Retraits activés</p>
              <p className="text-neutral-400 text-xs">Désactiver suspend toute nouvelle demande de retrait.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer"
                checked={payoutRules.payoutsEnabled}
                onChange={e => setPayoutRules(r => ({ ...r, payoutsEnabled: e.target.checked }))} />
              <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-black/20 rounded-xl border border-white/5">
            <div>
              <p className="text-white font-medium">Identité vérifiée obligatoire</p>
              <p className="text-neutral-400 text-xs">
                Aucun versement vers un formateur dont l'identité n'a pas été validée.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer"
                checked={payoutRules.requireIdentityForPayout}
                onChange={e => setPayoutRules(r => ({ ...r, requireIdentityForPayout: e.target.checked }))} />
              <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
            </label>
          </div>

          {!payoutRules.requireIdentityForPayout && (
            <div className="flex items-start gap-2.5 p-3 bg-amber-500/5 border border-amber-500/20 rounded-xl">
              <AlertCircle size={16} className="text-amber-400 flex-shrink-0 mt-0.5" />
              <p className="text-amber-300/90 text-xs leading-relaxed">
                Sans vérification d'identité, des versements pourront partir vers des bénéficiaires
                non identifiés. Vérifiez que cela reste conforme à vos obligations légales et comptables.
              </p>
            </div>
          )}

          <div className="flex justify-end pt-2">
            <button type="submit" disabled={savingPayoutRules}
              className="bg-blue-600 hover:bg-blue-500 text-white shadow-lg text-sm px-6 py-2.5 rounded-lg font-bold transition-colors disabled:opacity-50">
              {savingPayoutRules ? 'Enregistrement...' : 'Enregistrer les règles de retrait'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── CMS CONFIGURATION EN DIRECT DU SITE ─────────────────────────
function SiteCMSConfigTab() {
  const { success, error: toastError } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [heroPhrases, setHeroPhrases] = useState('')
  const [heroSubtitle, setHeroSubtitle] = useState('')
  const [missionTitle, setMissionTitle] = useState('')
  const [missionSubtitle, setMissionSubtitle] = useState('')
  const [testimonials, setTestimonials] = useState([])
  const [faq, setFaq] = useState([])
  const [introVideoUrl, setIntroVideoUrl] = useState('')
  const [learningPoints, setLearningPoints] = useState([
    "Maîtrise complète des concepts théoriques et pratiques du domaine.",
    "Études de cas réelles et exercices concrètement applicables.",
    "Utilisation des outils professionnels les plus demandés du marché.",
    "Accès à l'attestation de réussite nominative Mylta Academy."
  ])
  const [bannerIsActive, setBannerIsActive] = useState(false)
  const [bannerText, setBannerText] = useState('')
  const [bannerAnimation, setBannerAnimation] = useState('none')
  const [bannerHasCountdown, setBannerHasCountdown] = useState(false)
  const [bannerCountdownDate, setBannerCountdownDate] = useState('')
  const [bannerBg, setBannerBg] = useState('bg-gradient-to-r from-red-600 to-red-500')
  const [bannerIcon, setBannerIcon] = useState('sparkles')
  const [bannerLinkUrl, setBannerLinkUrl] = useState('')
  const [bannerLinkText, setBannerLinkText] = useState('')

  useEffect(() => {
    api.get('/admin/config')
      .then(res => {
        const data = res.data || {}
        setIntroVideoUrl(data.introVideoUrl || '')
        if (data.hero) {
          setHeroPhrases(Array.isArray(data.hero.phrases) ? data.hero.phrases.join(', ') : '')
          setHeroSubtitle(data.hero.subtitle || '')
        }
        if (data.mission) {
          setMissionTitle(data.mission.title || '')
          setMissionSubtitle(data.mission.subtitle || '')
        }
        if (Array.isArray(data.testimonials)) setTestimonials(data.testimonials)
        if (Array.isArray(data.faq)) setFaq(data.faq)
        if (Array.isArray(data.learningPoints)) setLearningPoints(data.learningPoints)
        if (data.topBanner) {
          setBannerIsActive(data.topBanner.isActive || false)
          setBannerText(data.topBanner.text || '')
          setBannerAnimation(data.topBanner.animation || 'none')
          setBannerHasCountdown(data.topBanner.hasCountdown || false)
          // Format date for datetime-local input
          setBannerCountdownDate(data.topBanner.countdownDate ? new Date(data.topBanner.countdownDate).toISOString().slice(0, 16) : '')
          setBannerBg(data.topBanner.backgroundColor || 'bg-gradient-to-r from-red-600 to-red-500')
          setBannerIcon(data.topBanner.icon || 'none')
          setBannerLinkUrl(data.topBanner.linkUrl || '')
          setBannerLinkText(data.topBanner.linkText || '')
        }
      })
      .catch(() => toastError('Erreur lors du chargement de la configuration site.'))
      .finally(() => setLoading(false))
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      const phrasesArray = heroPhrases.split(',').map(s => s.trim()).filter(Boolean)
      const payload = {
        introVideoUrl,
        hero: { phrases: phrasesArray, subtitle: heroSubtitle },
        mission: { title: missionTitle, subtitle: missionSubtitle },
        testimonials,
        faq,
        learningPoints,
        topBanner: {
          isActive: bannerIsActive,
          text: bannerText,
          animation: bannerAnimation,
          hasCountdown: bannerHasCountdown,
          countdownDate: bannerCountdownDate ? new Date(bannerCountdownDate).toISOString() : '',
          backgroundColor: bannerBg,
          textColor: "text-white",
          icon: bannerIcon,
          linkUrl: bannerLinkUrl,
          linkText: bannerLinkText
        }
      }
      await api.put('/admin/config', payload)
      success('Modifications du site enregistrées en direct !')
    } catch (err) {
      toastError(err.response?.data?.error || 'Erreur lors de la sauvegarde.')
    } finally {
      setSaving(false)
    }
  }

  const handleAddTestimonial = () => {
    setTestimonials(prev => [
      ...prev,
      { name: 'Nouvel Étudiant', role: 'Étudiant, Alger', text: 'Formation incroyable !', rating: 5, avatar: 'NE', course: 'Formation DZ' }
    ])
  }

  const handleRemoveTestimonial = (index) => {
    setTestimonials(prev => prev.filter((_, i) => i !== index))
  }

  const handleTestimonialChange = (index, field, value) => {
    setTestimonials(prev => {
      const updated = [...prev]
      updated[index] = { ...updated[index], [field]: value }
      return updated
    })
  }

  const handleAddFaq = () => {
    setFaq(prev => [...prev, { question: 'Nouvelle question ?', answer: 'Réponse ici...' }])
  }

  const handleRemoveFaq = (index) => {
    setFaq(prev => prev.filter((_, i) => i !== index))
  }

  const handleFaqChange = (index, field, value) => {
    setFaq(prev => {
      const updated = [...prev]
      updated[index] = { ...updated[index], [field]: value }
      return updated
    })
  }

  if (loading) return <div className="text-center py-16 text-neutral-500 font-medium">Chargement du CMS...</div>

  return (
    <div className="space-y-8 animate-fade-up pb-12">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <h2 className="font-display text-4xl font-bold text-white tracking-tight flex items-center gap-3 mb-2">
            <Globe className="text-white" size={32} /> Gestion du Site (CMS)
          </h2>
          <p className="text-neutral-400 text-sm">Modifiez tous les textes, la mission, la FAQ et les avis clients de la plateforme.</p>
        </div>
        <button onClick={handleSave} disabled={saving} className="bg-white text-black shadow-lg shadow-white/20 px-6 py-3 text-sm font-bold flex items-center gap-2 disabled:opacity-50 hover:scale-105 transition-transform">
          <Save size={18} /> {saving ? 'Sauvegarde...' : 'Sauvegarder en direct'}
        </button>
      </div>

      {/* Top Banner CMS */}
      <div className="bg-neutral-900/40 backdrop-blur-xl border border-white/5 rounded-3xl p-8 space-y-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/5 pb-4">
          <h3 className="font-display font-bold text-xl text-white flex items-center gap-3">
            <GlobeLock className="text-white" size={22} /> Bannière Supérieure
          </h3>
          <label className="flex items-center cursor-pointer gap-2">
            <span className="text-sm font-medium text-white">{bannerIsActive ? 'Activée' : 'Désactivée'}</span>
            <input type="checkbox" className="sr-only peer" checked={bannerIsActive} onChange={(e) => setBannerIsActive(e.target.checked)} />
            <div className="relative w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-academy-primary"></div>
          </label>
        </div>
        
        {bannerIsActive && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 animate-fade-in">
            <div className="sm:col-span-2">
              <label className="text-neutral-400 text-sm font-medium mb-2 block">Texte de la bannière</label>
              <input value={bannerText} onChange={e => setBannerText(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-neutral-600 focus:border-white/40 outline-none transition-all" placeholder="Ex: Promo -50%" />
            </div>
            <div>
              <label className="text-neutral-400 text-sm font-medium mb-2 block">Animation du texte</label>
              <select value={bannerAnimation} onChange={e => setBannerAnimation(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-white/40 outline-none transition-all appearance-none">
                <option value="none">Statique (Aucune)</option>
                <option value="pulse">Clignotant (Pulse)</option>
                <option value="marquee">Défilant (Marquee)</option>
              </select>
            </div>
            <div>
              <label className="text-neutral-400 text-sm font-medium mb-2 block">Couleur de fond (Classe Tailwind)</label>
              <input value={bannerBg} onChange={e => setBannerBg(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-neutral-600 focus:border-white/40 outline-none transition-all" placeholder="Ex: bg-red-600" />
            </div>
            <div>
              <label className="text-neutral-400 text-sm font-medium mb-2 block">Icône</label>
              <select value={bannerIcon} onChange={e => setBannerIcon(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-white/40 outline-none transition-all appearance-none">
                <option value="none">Aucune</option>
                <option value="sparkles">✨ Étincelles (Sparkles)</option>
                <option value="flame">🔥 Flamme (Flame)</option>
                <option value="gift">🎁 Cadeau (Gift)</option>
                <option value="megaphone">📣 Mégaphone</option>
              </select>
            </div>
            <div>
              <label className="text-neutral-400 text-sm font-medium mb-2 block">Texte du bouton lien (Optionnel)</label>
              <input value={bannerLinkText} onChange={e => setBannerLinkText(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-neutral-600 focus:border-white/40 outline-none transition-all" placeholder="Ex: Profiter de l'offre" />
            </div>
            <div>
              <label className="text-neutral-400 text-sm font-medium mb-2 block">URL du bouton lien (Optionnel)</label>
              <input value={bannerLinkUrl} onChange={e => setBannerLinkUrl(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-neutral-600 focus:border-white/40 outline-none transition-all" placeholder="Ex: /courses" />
            </div>
            <div className="sm:col-span-2 border-t border-white/5 pt-4">
              <label className="flex items-center cursor-pointer gap-2 mb-4">
                <input type="checkbox" className="w-4 h-4 rounded bg-black/40 border border-white/10 accent-white" checked={bannerHasCountdown} onChange={(e) => setBannerHasCountdown(e.target.checked)} />
                <span className="text-sm font-medium text-white">Activer le compte à rebours</span>
              </label>
              {bannerHasCountdown && (
                <div>
                  <label className="text-neutral-400 text-sm font-medium mb-2 block">Date de fin du compte à rebours</label>
                  <input type="datetime-local" value={bannerCountdownDate} onChange={e => setBannerCountdownDate(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-white/40 outline-none transition-all [color-scheme:dark]" />
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Hero Section CMS */}
      <div className="bg-neutral-900/40 backdrop-blur-xl border border-white/5 rounded-3xl p-8 space-y-6 shadow-2xl">
        <h3 className="font-display font-bold text-xl text-white flex items-center gap-3 border-b border-white/5 pb-4">
          <Sparkles className="text-white" size={22} /> Page d&apos;Accueil — Section Hero
        </h3>
        <div>
          <label className="text-neutral-400 text-sm font-medium mb-2 block">Phrases d&apos;accroche défilantes (séparées par des virgules)</label>
          <input value={heroPhrases} onChange={e => setHeroPhrases(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-neutral-600 focus:border-white/40 outline-none transition-all" placeholder="Formations Pratiques, Tech & Web, Marketing..." />
        </div>
        <div>
          <label className="text-neutral-400 text-sm font-medium mb-2 block">Sous-titre Hero</label>
          <textarea value={heroSubtitle} onChange={e => setHeroSubtitle(e.target.value)} rows={2} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-neutral-600 focus:border-white/40 outline-none transition-all resize-none" />
        </div>
      </div>

      {/* Mission Section CMS */}
      <div className="bg-neutral-900/40 backdrop-blur-xl border border-white/5 rounded-3xl p-8 space-y-6 shadow-2xl">
        <h3 className="font-display font-bold text-xl text-white flex items-center gap-3 border-b border-white/5 pb-4">
          <Compass className="text-amber-500" size={22} /> Page & Section Notre Mission
        </h3>
        <div>
          <label className="text-neutral-400 text-sm font-medium mb-2 block">Titre de la Mission</label>
          <input value={missionTitle} onChange={e => setMissionTitle(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-neutral-600 focus:border-amber-500 outline-none transition-all" />
        </div>
        <div>
          <label className="text-neutral-400 text-sm font-medium mb-2 block">Description / Manifeste de la Mission</label>
          <textarea value={missionSubtitle} onChange={e => setMissionSubtitle(e.target.value)} rows={3} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-neutral-600 focus:border-amber-500 outline-none transition-all resize-none" />
        </div>
      </div>

      {/* Ce que vous allez apprendre CMS */}
      <div className="bg-neutral-900/40 backdrop-blur-xl border border-white/5 rounded-3xl p-8 space-y-6 shadow-2xl">
        <h3 className="font-display font-bold text-xl text-white flex items-center gap-3 border-b border-white/5 pb-4">
          <CheckCircle className="text-emerald-500" size={22} /> Ce que vous allez apprendre (Points d&apos;apprentissage)
        </h3>
        <p className="text-neutral-400 text-sm mb-4">Ces 4 points s&apos;affichent directement sur la page de chaque formation.</p>
        <div className="space-y-4">
          {learningPoints.map((pt, idx) => (
            <div key={idx} className="flex items-center gap-4">
              <span className="text-emerald-400 font-bold text-sm font-mono w-6">#{idx + 1}</span>
              <input
                value={pt}
                onChange={e => {
                  const updated = [...learningPoints]
                  updated[idx] = e.target.value
                  setLearningPoints(updated)
                }}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-neutral-600 focus:border-emerald-500 outline-none transition-all flex-1"
                placeholder={`Point ${idx + 1}`}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Avis Étudiants CMS */}
      <div className="bg-neutral-900/40 backdrop-blur-xl border border-white/5 rounded-3xl p-8 space-y-6 shadow-2xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
          <h3 className="font-display font-bold text-xl text-white flex items-center gap-3">
            <MessageSquare className="text-purple-500" size={22} /> Avis & Témoignages Étudiants ({testimonials.length})
          </h3>
          <button onClick={handleAddTestimonial} className="btn-primary shadow-lg shadow-purple-500/20 text-sm py-2 px-5 flex items-center gap-2 hover:scale-105 transition-transform">
            <Plus size={16} /> Ajouter un avis
          </button>
        </div>

        <div className="space-y-6 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
          {testimonials.map((item, idx) => (
            <div key={idx} className="bg-black/20 border border-white/5 p-6 rounded-2xl space-y-4 relative group">
              <button onClick={() => handleRemoveTestimonial(idx)} className="absolute top-4 right-4 text-red-400/50 hover:text-red-400 bg-red-500/5 hover:bg-red-500/20 p-2 rounded-lg transition-colors border border-transparent hover:border-red-500/20 opacity-0 group-hover:opacity-100">
                <Trash2 size={16} />
              </button>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <input value={item.name} onChange={e => handleTestimonialChange(idx, 'name', e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-neutral-600 focus:border-purple-500 outline-none transition-all" placeholder="Nom complet" />
                <input value={item.role} onChange={e => handleTestimonialChange(idx, 'role', e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-neutral-600 focus:border-purple-500 outline-none transition-all" placeholder="Rôle / Ville" />
                <input value={item.avatar} onChange={e => handleTestimonialChange(idx, 'avatar', e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-neutral-600 focus:border-purple-500 outline-none transition-all" placeholder="Initiales (ex: AB)" />
              </div>
              <textarea value={item.text} onChange={e => handleTestimonialChange(idx, 'text', e.target.value)} rows={2} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-neutral-600 focus:border-purple-500 outline-none transition-all resize-none" placeholder="Commentaire d'avis" />
            </div>
          ))}
        </div>
      </div>

      {/* FAQ CMS */}
      <div className="bg-neutral-900/40 backdrop-blur-xl border border-white/5 rounded-3xl p-8 space-y-6 shadow-2xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
          <h3 className="font-display font-bold text-xl text-white flex items-center gap-3">
            <HelpCircle className="text-blue-500" size={22} /> Foire Aux Questions (FAQ) ({faq.length})
          </h3>
          <button onClick={handleAddFaq} className="btn-primary shadow-lg shadow-blue-500/20 text-sm py-2 px-5 flex items-center gap-2 hover:scale-105 transition-transform">
            <Plus size={16} /> Ajouter une question
          </button>
        </div>

        <div className="space-y-6 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
          {faq.map((item, idx) => (
            <div key={idx} className="bg-black/20 border border-white/5 p-6 rounded-2xl space-y-4 relative group">
              <button onClick={() => handleRemoveFaq(idx)} className="absolute top-4 right-4 text-red-400/50 hover:text-red-400 bg-red-500/5 hover:bg-red-500/20 p-2 rounded-lg transition-colors border border-transparent hover:border-red-500/20 opacity-0 group-hover:opacity-100">
                <Trash2 size={16} />
              </button>
              <input value={item.question} onChange={e => handleFaqChange(idx, 'question', e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-neutral-600 font-semibold focus:border-blue-500 outline-none transition-all pr-12" placeholder="Question" />
              <textarea value={item.answer} onChange={e => handleFaqChange(idx, 'answer', e.target.value)} rows={2} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-neutral-600 focus:border-blue-500 outline-none transition-all resize-none" placeholder="Réponse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// PRESENCE & AUTOMATION TAB (Nombre de comptes, En ligne, Visiteurs Sans Compte & Clics)
// ═══════════════════════════════════════════════════════════════

function PresenceAutomationTab() {
  const { error: toastError } = useToast()
  const { socket } = useSocket()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [lastUpdated, setLastUpdated] = useState(new Date())
  const [currentTimeStr, setCurrentTimeStr] = useState('')
  const [filterRole, setFilterRole] = useState('ALL')
  const [filterStatus, setFilterStatus] = useState('ALL')
  const [search, setSearch] = useState('')
  const [subTab, setSubTab] = useState('USERS') // 'USERS' | 'CLICKS' | 'TOP_BUTTONS'
  const [liveClickStream, setLiveClickStream] = useState([])

  const fetchPresence = useCallback(async () => {
    try {
      const res = await api.get('/admin/presence-stats')
      setData(res.data)
      setLastUpdated(new Date())
      if (res.data.recentClickLogs) {
        setLiveClickStream(res.data.recentClickLogs)
      }
    } catch {
      toastError('Erreur de chargement des statistiques de présence et clics.')
    } finally {
      setLoading(false)
    }
  }, [])

  // Auto-refresh (toutes les 5 secondes si actif).
  // On saute les rafraîchissements quand l'onglet est en arrière-plan : un
  // onglet admin laissé ouvert consommait le quota pour rien, et personne ne
  // regardait l'écran. Même garde-fou que la cloche de notifications.
  useEffect(() => {
    fetchPresence()
    if (!autoRefresh) return

    const timer = setInterval(() => {
      if (document.hidden) return
      fetchPresence()
    }, 5000)

    // Remise à jour immédiate au retour sur l'onglet
    const onVisibilityChange = () => {
      if (!document.hidden) fetchPresence()
    }
    document.addEventListener('visibilitychange', onVisibilityChange)

    return () => {
      clearInterval(timer)
      document.removeEventListener('visibilitychange', onVisibilityChange)
    }
  }, [fetchPresence, autoRefresh])

  // Live Socket Click Listener
  useEffect(() => {
    if (!socket) return
    socket.emit('join_admin_analytics')

    const handleNewClick = (clickEvent) => {
      setLiveClickStream(prev => [clickEvent, ...prev.slice(0, 59)])
      setData(prev => prev ? ({ ...prev, totalClicksCount: (prev.totalClicksCount || 0) + 1 }) : prev)
    }

    socket.on('new_click_event', handleNewClick)
    return () => {
      socket.off('new_click_event', handleNewClick)
    }
  }, [socket])

  // Horloge en direct (se seconde en seconde)
  useEffect(() => {
    const updateClock = () => {
      const now = new Date()
      setCurrentTimeStr(now.toLocaleTimeString('fr-DZ', { hour: '2-digit', minute: '2-digit', second: '2-digit' }))
    }
    updateClock()
    const clockInterval = setInterval(updateClock, 1000)
    return () => clearInterval(clockInterval)
  }, [])

  if (loading && !data) {
    return <div className="p-16 text-center text-neutral-400 font-medium">Chargement des données de présence et clics en direct...</div>
  }

  const filteredUsers = (data?.users || []).filter(u => {
    if (filterRole !== 'ALL' && u.role !== filterRole) return false
    if (filterStatus === 'ONLINE' && !u.isOnline) return false
    if (filterStatus === 'OFFLINE' && u.isOnline) return false
    if (search.trim()) {
      const q = search.toLowerCase()
      const matchName = u.name?.toLowerCase().includes(q)
      const matchEmail = u.email?.toLowerCase().includes(q)
      if (!matchName && !matchEmail) return false
    }
    return true
  })

  const topElements = data?.topClickedElements || []
  const maxClicks = topElements[0]?.count || 1

  return (
    <div className="space-y-8 animate-fade-up">
      {/* Header avec contrôles d'automatisation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="font-display font-bold text-3xl sm:text-4xl text-white tracking-tight">Comptes, Visiteurs & Clics en Direct</h1>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              Temps Réel (5s)
            </span>
          </div>
          <p className="text-neutral-400 text-sm">Suivi automatisé des comptes enregistrés, des visiteurs anonymes (sans compte), et de tous les clics sur la plateforme</p>
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2.5 bg-neutral-900/60 border border-white/10 px-4 py-2.5 rounded-xl cursor-pointer hover:bg-neutral-800/80 transition-all select-none">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="w-4 h-4 rounded bg-black border-white/10 accent-emerald-500 cursor-pointer"
            />
            <span className="text-xs font-bold text-white">Rafraîchissement Auto (5s)</span>
          </label>

          <button
            onClick={() => fetchPresence()}
            className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold border border-white/10 transition-all active:scale-95"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Actualiser
          </button>
        </div>
      </div>

      {/* Horloge & Bannière de synchronisation */}
      <div className="bg-gradient-to-r from-blue-900/20 via-purple-900/20 to-emerald-900/20 border border-white/10 rounded-2xl p-4 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-amber-400 shrink-0">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-neutral-400">Heure Actuelle & Horodatage Serveur</p>
            <p className="text-xl sm:text-2xl font-bold text-white font-mono">{currentTimeStr || '00:00:00'} <span className="text-xs text-neutral-400 font-sans font-normal ml-2">({data?.serverTimeFormatted || '—'})</span></p>
          </div>
        </div>

        <div className="text-right sm:border-l border-white/10 sm:pl-6">
          <p className="text-xs text-neutral-400">Dernier rafraîchissement à :</p>
          <p className="text-sm font-semibold text-emerald-400 font-mono">{lastUpdated.toLocaleTimeString('fr-DZ')}</p>
        </div>
      </div>

      {/* Cartes statistiques automatisées */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
        {/* Card 1: Total Comptes */}
        <div className="bg-neutral-900/40 border border-white/5 backdrop-blur-xl rounded-2xl p-5 relative overflow-hidden group hover:border-blue-500/30 transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20">
              <Users size={20} />
            </div>
            <span className="text-xs font-bold text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-full border border-blue-500/20">Total Comptes</span>
          </div>
          <p className="text-3xl font-extrabold text-white tracking-tight mb-1">{data?.totalAccounts ?? 0}</p>
          <p className="text-xs text-neutral-400 font-medium">Comptes Inscrits sur la Plateforme</p>
          <div className="mt-4 pt-3 border-t border-white/5 flex justify-between text-xs text-neutral-400">
            <span>Étudiants: <strong className="text-white">{data?.studentsCount ?? 0}</strong></span>
            <span>Formateurs: <strong className="text-white">{data?.instructorsCount ?? 0}</strong></span>
            <span>Admins: <strong className="text-white">{data?.adminsCount ?? 0}</strong></span>
          </div>
        </div>

        {/* Card 2: En Ligne (Comptes Connectés) */}
        <div className="bg-neutral-900/40 border border-emerald-500/20 backdrop-blur-xl rounded-2xl p-5 relative overflow-hidden group hover:border-emerald-500/40 transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
              <Radio size={20} className="animate-pulse" />
            </div>
            <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              Comptes En Ligne
            </span>
          </div>
          <p className="text-3xl font-extrabold text-emerald-400 tracking-tight mb-1">{data?.onlineUsersCount ?? 0}</p>
          <p className="text-xs text-neutral-400 font-medium">Comptes Inscrits Connectés</p>
          <div className="mt-4 pt-3 border-t border-white/5 text-xs text-neutral-400 flex justify-between">
            <span>Taux de présence :</span>
            <strong className="text-emerald-400">
              {data?.totalAccounts ? Math.round((data.onlineUsersCount / data.totalAccounts) * 100) : 0}%
            </strong>
          </div>
        </div>

        {/* Card 3: Visiteurs Sans Compte (Invités) */}
        <div className="bg-neutral-900/40 border border-purple-500/20 backdrop-blur-xl rounded-2xl p-5 relative overflow-hidden group hover:border-purple-500/40 transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center border border-purple-500/20">
              <Eye size={20} className="animate-bounce" />
            </div>
            <span className="text-xs font-bold text-purple-300 bg-purple-500/10 px-2.5 py-1 rounded-full border border-purple-500/20 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-ping" />
              Sans Compte
            </span>
          </div>
          <p className="text-3xl font-extrabold text-purple-300 tracking-tight mb-1">{data?.onlineGuestsCount ?? 0}</p>
          <p className="text-xs text-neutral-400 font-medium">Visiteurs Anonymes en Direct</p>
          <div className="mt-4 pt-3 border-t border-white/5 text-xs text-neutral-400 flex justify-between">
            <span>Total Visiteurs Actifs :</span>
            <strong className="text-purple-400">{data?.totalActiveVisitors ?? 0} en direct</strong>
          </div>
        </div>

        {/* Card 4: Total Clics */}
        <div className="bg-neutral-900/40 border border-amber-500/20 backdrop-blur-xl rounded-2xl p-5 relative overflow-hidden group hover:border-amber-500/40 transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
              <MousePointer size={20} />
            </div>
            <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">Analytics</span>
          </div>
          <p className="text-3xl font-extrabold text-amber-400 tracking-tight mb-1">{data?.totalClicksCount ?? 0}</p>
          <p className="text-xs text-neutral-400 font-medium">Total Clics Capturés sur le Site</p>
          <div className="mt-4 pt-3 border-t border-white/5 text-xs text-neutral-400 flex justify-between">
            <span>Flux de clics :</span>
            <strong className="text-amber-400">Temps Réel Actif</strong>
          </div>
        </div>
      </div>

      {/* Navigation Onglets de Détails */}
      <div className="flex bg-black/60 p-1.5 rounded-2xl border border-white/10 gap-2 w-full sm:w-auto overflow-x-auto">
        <button
          onClick={() => setSubTab('USERS')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${subTab === 'USERS' ? 'bg-white text-black shadow-lg' : 'text-neutral-400 hover:text-white'}`}
        >
          <Users size={15} />
          Comptes & Présence ({data?.totalAccounts ?? 0})
        </button>

        <button
          onClick={() => setSubTab('CLICKS')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${subTab === 'CLICKS' ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20' : 'text-amber-400 hover:text-white'}`}
        >
          <MousePointer size={15} />
          Journal des Clics en Direct ({liveClickStream.length})
        </button>

        <button
          onClick={() => setSubTab('TOP_BUTTONS')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${subTab === 'TOP_BUTTONS' ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/20' : 'text-purple-400 hover:text-white'}`}
        >
          <BarChart2 size={15} />
          Top Boutons & Liens Cliqués ({topElements.length})
        </button>
      </div>

      {/* Onglet USERS */}
      {subTab === 'USERS' && (
        <div className="bg-neutral-900/30 border border-white/5 backdrop-blur-xl rounded-2xl p-4 sm:p-6 space-y-4 shadow-2xl">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3.5 top-3 text-neutral-500" size={18} />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Rechercher nom ou email..."
                className="w-full bg-black border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-neutral-500 focus:border-blue-500 outline-none transition-all"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
              <div className="flex bg-black/60 p-1 rounded-xl border border-white/10">
                <button
                  onClick={() => setFilterStatus('ALL')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${filterStatus === 'ALL' ? 'bg-white text-black' : 'text-neutral-400 hover:text-white'}`}
                >
                  Tous ({data?.totalAccounts ?? 0})
                </button>
                <button
                  onClick={() => setFilterStatus('ONLINE')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${filterStatus === 'ONLINE' ? 'bg-emerald-500 text-black' : 'text-emerald-400 hover:text-white'}`}
                >
                  🟢 En Ligne ({data?.onlineUsersCount ?? 0})
                </button>
                <button
                  onClick={() => setFilterStatus('OFFLINE')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${filterStatus === 'OFFLINE' ? 'bg-neutral-700 text-white' : 'text-neutral-400 hover:text-white'}`}
                >
                  ⚪ Déconnectés ({data?.offlineUsersCount ?? 0})
                </button>
              </div>

              <select
                value={filterRole}
                onChange={e => setFilterRole(e.target.value)}
                className="bg-black border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none cursor-pointer"
              >
                <option value="ALL">Tous les rôles</option>
                <option value="STUDENT">Étudiants</option>
                <option value="INSTRUCTOR">Formateurs</option>
                <option value="ADMIN">Admins</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-white/5">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/5 text-neutral-400 uppercase text-[11px] font-bold">
                <tr>
                  <th className="px-6 py-4">Utilisateur & ID</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Rôle</th>
                  <th className="px-6 py-4">Statut Présence</th>
                  <th className="px-6 py-4">Date & Heure de Création</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-neutral-500 font-medium">
                      Aucun compte trouvé correspondant aux critères.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map(u => (
                    <tr key={u.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${u.isOnline ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-white/5 text-neutral-400 border border-white/10'}`}>
                            {u.name?.[0]?.toUpperCase() || u.email?.[0]?.toUpperCase() || 'U'}
                          </div>
                          <div>
                            <p className="font-semibold text-white text-sm">{u.name || '—'}</p>
                            <p className="text-xs text-neutral-500">ID #{u.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-neutral-300 font-mono text-xs">{u.email}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${
                          u.role === 'ADMIN' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                          u.role === 'INSTRUCTOR' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                          'bg-blue-500/10 text-blue-400 border-blue-500/20'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {u.isOnline ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                            En Ligne
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-neutral-800 text-neutral-400 border border-white/10">
                            <span className="w-2 h-2 rounded-full bg-neutral-500" />
                            Déconnecté
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-neutral-400 text-xs font-mono">
                        {u.createdAtFormatted}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Onglet CLICKS (Live Click Stream) */}
      {subTab === 'CLICKS' && (
        <div className="bg-neutral-900/30 border border-white/5 backdrop-blur-xl rounded-2xl p-4 sm:p-6 space-y-4 shadow-2xl">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold text-lg text-white flex items-center gap-2">
              <MousePointer className="text-amber-400" size={18} />
              Journal des Clics Capturés en Temps Réel
            </h3>
            <span className="text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full font-bold">
              Flux Live Connecté
            </span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-white/5">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/5 text-neutral-400 uppercase text-[11px] font-bold">
                <tr>
                  <th className="px-6 py-4">Horodatage</th>
                  <th className="px-6 py-4">Type d'Utilisateur</th>
                  <th className="px-6 py-4">Page / URL</th>
                  <th className="px-6 py-4">Élément / Bouton Cliqué</th>
                  <th className="px-6 py-4">Tag & IP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {liveClickStream.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-neutral-500 font-medium">
                      Aucun clic enregistré pour le moment. Naviguez sur le site pour voir apparaître les clics en direct !
                    </td>
                  </tr>
                ) : (
                  liveClickStream.map((c, idx) => (
                    <tr key={c.id || idx} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4 text-neutral-400 font-mono text-xs whitespace-nowrap">
                        {c.createdAt ? new Date(c.createdAt).toLocaleTimeString('fr-DZ') : new Date().toLocaleTimeString('fr-DZ')}
                      </td>
                      <td className="px-6 py-4">
                        {c.isGuest ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-500/10 text-purple-300 border border-purple-500/20">
                            <Eye size={12} />
                            Visiteur Anonyme (Sans compte)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                            <Users size={12} />
                            {c.userName || 'Utilisateur Inscrit'} {c.userEmail ? `(${c.userEmail})` : ''}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-emerald-400 font-bold max-w-[180px] truncate">
                        {c.pageUrl}
                      </td>
                      <td className="px-6 py-4 font-medium text-white text-sm">
                        <span className="bg-white/10 border border-white/10 px-3 py-1.5 rounded-lg inline-block max-w-[280px] truncate">
                          {c.elementText || c.elementTag || 'Clic sur écran'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-neutral-500 text-xs font-mono">
                        <span className="text-neutral-400 uppercase font-bold mr-2">{c.elementTag || 'CLICK'}</span>
                        <span>{c.ip || '127.0.0.1'}</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Onglet TOP_BUTTONS */}
      {subTab === 'TOP_BUTTONS' && (
        <div className="bg-neutral-900/30 border border-white/5 backdrop-blur-xl rounded-2xl p-4 sm:p-6 space-y-4 shadow-2xl">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold text-lg text-white flex items-center gap-2">
              <BarChart2 className="text-purple-400" size={18} />
              Classement des Éléments & Boutons les Plus Cliqués
            </h3>
            <span className="text-xs text-purple-300 bg-purple-500/10 border border-purple-500/20 px-3 py-1 rounded-full font-bold">
              Top Performance
            </span>
          </div>

          {topElements.length === 0 ? (
            <div className="py-12 text-center text-neutral-500 font-medium">
              Pas encore assez de données de clics cumulées.
            </div>
          ) : (
            <div className="space-y-4 pt-2">
              {topElements.map((el, i) => {
                const pct = Math.round((el.count / maxClicks) * 100)
                return (
                  <div key={i} className="bg-black/40 border border-white/5 rounded-xl p-4 space-y-2">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center justify-center font-bold text-xs shrink-0">
                          #{i + 1}
                        </span>
                        <div className="min-w-0">
                          <p className="font-bold text-white text-sm truncate">
                            {el.elementText || 'Élément sans texte'}
                          </p>
                          <p className="text-xs text-neutral-500 font-mono">
                            Page: <span className="text-emerald-400 font-semibold">{el.pageUrl}</span> • Tag: {el.elementTag || 'BUTTON'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="px-3 py-1 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-bold font-mono">
                          {el.count} clic{el.count > 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                    {/* Barre de progression */}
                    <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-purple-500 to-amber-400 h-full rounded-full transition-all duration-500"
                        style={{ width: `${Math.max(5, pct)}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── Modal Ajout Formateur ────────────────────────────
function CreateInstructorModal({ onClose, onSuccess }) {
  const { success, error: toastError } = useToast()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', password: '', plan: 'Starter' })

  const setField = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }))

  const generateCredentials = () => {
    if (!form.name) return toastError("Veuillez d'abord saisir le nom du formateur.")
    const baseName = form.name.toLowerCase().replace(/\s+/g, '.')
    const email = `${baseName}@mylta-academy.com`
    const password = Math.random().toString(36).slice(-8) + "!"
    setForm(p => ({ ...p, email, password }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data } = await api.post('/admin/instructors', {
        name: form.name,
        email: form.email,
        password: form.password,
        plan: form.plan,
        commissionRate: 20 // Default
      })
      success(`Formateur "${data.user.name}" créé avec succès ! (Offre: ${data.user.plan})`)
      onSuccess?.()
      onClose?.()
    } catch (err) {
      toastError(err.response?.data?.error || 'Erreur lors de la création.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-neutral-950/90 backdrop-blur-xl" />
      <div className="relative w-full max-w-lg bg-neutral-900 border border-white/10 backdrop-blur-2xl rounded-3xl shadow-2xl animate-fade-up p-8" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display font-bold text-2xl text-white">Créer un formateur</h2>
          <button onClick={onClose} className="text-neutral-400 hover:text-white transition-colors"><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-neutral-400 text-sm font-medium mb-2 block">Nom du formateur</label>
            <input value={form.name} onChange={setField('name')} required placeholder="Ex: Jean Dupont" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-neutral-600 focus:border-white/40 outline-none transition-all" />
          </div>

          <div className="pt-2">
            <button type="button" onClick={generateCredentials} className="w-full bg-white/10 hover:bg-white/20 text-white text-sm font-bold py-2.5 rounded-xl transition-all border border-white/10">
              Générer Email & Mot de passe
            </button>
          </div>

          <div>
            <label className="text-neutral-400 text-sm font-medium mb-2 block">Email de connexion</label>
            <input value={form.email} onChange={setField('email')} required type="email" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-blue-400 font-mono text-sm outline-none transition-all" />
          </div>

          <div>
            <label className="text-neutral-400 text-sm font-medium mb-2 block">Mot de passe provisoire</label>
            <input value={form.password} onChange={setField('password')} required type="text" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-emerald-400 font-mono text-sm outline-none transition-all" />
          </div>

          <div>
            <label className="text-neutral-400 text-sm font-medium mb-2 block">Offre choisie (Abonnement 1 mois)</label>
            <select value={form.plan} onChange={setField('plan')} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-white/40 outline-none transition-all appearance-none cursor-pointer">
              <option value="Starter">Starter</option>
              <option value="Pro">Pro</option>
              <option value="Elite">Elite</option>
            </select>
          </div>

          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 text-xs text-blue-300">
            <strong>Note :</strong> Lors de la création, le formateur recevra une notification lui confirmant son offre et lui indiquant de régler par <strong>Baridimob</strong>, <strong>Redotpay</strong> ou <strong>CCP</strong>.
          </div>

          <div className="flex gap-4 pt-4">
            <button type="button" onClick={onClose} className="flex-1 py-3.5 border border-white/10 text-neutral-400 rounded-xl hover:bg-white/5 transition-all">Annuler</button>
            <button type="submit" disabled={loading} className="flex-1 bg-white text-black shadow-lg shadow-white/20 font-bold py-3.5 rounded-xl disabled:opacity-50">
              {loading ? 'Création...' : 'Créer & Configurer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Modal Suppression Formateur ──────────────────────────
function DeleteInstructorModal({ instructor, onClose, onSuccess }) {
  const { success, error: toastError } = useToast()
  const [loading, setLoading] = useState(false)
  const [confirmText, setConfirmText] = useState('')

  const coursesCount = instructor._count?.coursesCreated || 0
  const balance = instructor.instructorBalance || 0
  const canDelete = confirmText.trim().toLowerCase() === (instructor.email || '').toLowerCase()

  const handleDelete = async () => {
    if (!canDelete) return
    setLoading(true)
    try {
      const { data } = await api.delete(`/admin/instructors/${instructor.id}`)
      const details = []
      if (data.coursesDetached) details.push(`${data.coursesDetached} formation(s) rattachée(s) à la plateforme`)
      if (data.coursesDeleted) details.push(`${data.coursesDeleted} formation(s) supprimée(s)`)
      success(details.length ? `${data.message} ${details.join(', ')}.` : data.message)
      onSuccess?.()
      onClose?.()
    } catch (err) {
      toastError(err.response?.data?.error || 'Erreur lors de la suppression.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-neutral-950/90 backdrop-blur-xl" />
      <div className="relative w-full max-w-lg bg-neutral-900 border border-red-500/20 backdrop-blur-2xl rounded-3xl shadow-2xl animate-fade-up p-8" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display font-bold text-2xl text-white flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-red-500/10 text-red-400 flex items-center justify-center border border-red-500/20">
              <AlertCircle size={20} />
            </span>
            Supprimer le formateur
          </h2>
          <button onClick={onClose} className="text-neutral-400 hover:text-white transition-colors"><X size={20} /></button>
        </div>

        <div className="bg-black/40 border border-white/10 rounded-xl p-4 mb-5">
          <p className="text-white font-semibold">{instructor.name}</p>
          <p className="text-neutral-500 text-xs font-mono">{instructor.email}</p>
        </div>

        {balance > 0 ? (
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 text-sm text-amber-300 mb-6">
            Ce formateur a un solde de <strong>{balance.toLocaleString('fr-DZ')} DZD</strong>. Réglez son retrait dans « Retraits Formateurs » avant de pouvoir supprimer le compte.
          </div>
        ) : (
          <>
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-sm text-red-300 mb-5 space-y-1.5">
              <p className="font-bold">Cette action est définitive :</p>
              <ul className="list-disc list-inside space-y-1 text-red-300/90 text-xs">
                <li>Le compte, ses notifications, avis et candidatures sont supprimés.</li>
                <li>Ses formations <strong>déjà vendues</strong> sont rattachées à la plateforme — les étudiants gardent leur accès.</li>
                <li>Ses formations <strong>sans aucune vente</strong> sont supprimées avec leurs leçons.</li>
                <li>Ses articles de blog vous sont transférés.</li>
              </ul>
              {coursesCount > 0 && (
                <p className="pt-1 text-xs">Formations concernées : <strong>{coursesCount}</strong></p>
              )}
            </div>

            <div className="mb-6">
              <label className="text-neutral-400 text-sm font-medium mb-2 block">
                Tapez <span className="text-white font-mono">{instructor.email}</span> pour confirmer
              </label>
              <input
                value={confirmText}
                onChange={e => setConfirmText(e.target.value)}
                autoFocus
                placeholder={instructor.email}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-neutral-700 font-mono text-sm focus:border-red-500/40 outline-none transition-all"
              />
            </div>
          </>
        )}

        <div className="flex gap-4">
          <button onClick={onClose} className="flex-1 py-3.5 border border-white/10 text-neutral-400 rounded-xl hover:bg-white/5 transition-all">Annuler</button>
          <button
            onClick={handleDelete}
            disabled={loading || !canDelete || balance > 0}
            className="flex-1 bg-red-500 text-white shadow-lg shadow-red-500/20 font-bold py-3.5 rounded-xl disabled:opacity-40 disabled:pointer-events-none hover:bg-red-600 transition-all"
          >
            {loading ? 'Suppression...' : 'Supprimer définitivement'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// DASHBOARD PRINCIPAL
// ═══════════════════════════════════════════════════════════════
export default function AdminDashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { success, error: toastError } = useToast()
  const { t } = useLanguage()

  const [tab, setTab] = useState('overview')
  const [stats, setStats] = useState(null)
  const [receipts, setReceipts] = useState([])
  const [courses, setCourses] = useState([])
  const [receiptFilter, setReceiptFilter] = useState('PENDING')
  const [loading, setLoading] = useState(false)
  const [imgModal, setImgModal] = useState(null)
  const [courseModalOpen, setCourseModalOpen] = useState(false)
  const [instructorModalOpen, setInstructorModalOpen] = useState(false)
  const [instructorsList, setInstructorsList] = useState([])
  const [instructorToDelete, setInstructorToDelete] = useState(null)
  const [courseToEdit, setCourseToEdit] = useState(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  // Newsletter Subscribers States
  const [subscribers, setSubscribers] = useState([])
  const [subscriberPage, setSubscriberPage] = useState(1)
  const [subscriberTotalPages, setSubscriberTotalPages] = useState(1)
  const [subscriberTotal, setSubscriberTotal] = useState(0)

  const fetchStats = useCallback(async () => {
    try {
      const { data } = await api.get('/admin/stats')
      setStats(data)
    } catch {
      toastError('Impossible de charger les statistiques.')
    }
  }, [])

  const fetchReceipts = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await api.get(`/admin/receipts?status=${receiptFilter}`)
      setReceipts(data.receipts || [])
    } catch {
      toastError('Impossible de charger les reçus.')
    } finally { setLoading(false) }
  }, [receiptFilter])

  const fetchCourses = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/admin/courses')
      setCourses(data.courses || [])
    } catch {
      toastError('Impossible de charger les formations.')
    } finally { setLoading(false) }
  }, [])

  const [instructorApplications, setInstructorApplications] = useState([])

  const fetchInstructors = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/admin/instructors')
      setInstructorsList(data.instructors || [])
    } catch {
      toastError('Impossible de charger la liste des formateurs.')
    } finally { setLoading(false) }
  }, [])

  const fetchInstructorApplications = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/admin/instructor-applications')
      setInstructorApplications(data.applications || [])
    } catch {
      toastError('Impossible de charger les candidatures.')
    } finally { setLoading(false) }
  }, [])

  const fetchSubscribers = useCallback(async (page = 1) => {
    setLoading(true)
    try {
      const { data } = await api.get(`/admin/newsletter/subscribers?page=${page}&limit=50`)
      setSubscribers(data.subscribers || [])
      setSubscriberPage(data.pagination?.page || 1)
      setSubscriberTotalPages(data.pagination?.totalPages || 1)
      setSubscriberTotal(data.pagination?.total || 0)
    } catch {
      toastError('Impossible de charger les abonnés de la newsletter.')
    } finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchStats() }, [fetchStats])
  useEffect(() => { if (tab === 'receipts') fetchReceipts() }, [tab, fetchReceipts])
  useEffect(() => { if (tab === 'courses')  fetchCourses()  }, [tab, fetchCourses])
  useEffect(() => { if (tab === 'instructors') fetchInstructors() }, [tab, fetchInstructors])
  useEffect(() => { if (tab === 'instructor_apps') fetchInstructorApplications() }, [tab, fetchInstructorApplications])
  useEffect(() => { if (tab === 'newsletter') fetchSubscribers(subscriberPage) }, [tab, subscriberPage, fetchSubscribers])

  const handleApprove = async (id) => {
    try {
      await api.put(`/admin/receipts/${id}/approve`)
      success('Accès accordé avec succès !')
      fetchReceipts()
      fetchStats()
    } catch (err) {
      toastError(err.response?.data?.error || 'Erreur lors de l\'approbation.')
    }
  }

  const handleReject = async (id) => {
    try {
      await api.put(`/admin/receipts/${id}/reject`)
      success('Reçu rejeté.')
      fetchReceipts()
    } catch {
      toastError('Erreur lors du rejet.')
    }
  }

  const handleApproveInstructor = async (id) => {
    try {
      await api.put(`/admin/instructor-applications/${id}/approve`)
      success('Candidature approuvée avec succès !')
      fetchInstructorApplications()
    } catch (err) {
      toastError(err.response?.data?.error || 'Erreur lors de l\'approbation.')
    }
  }

  const handleRejectInstructor = async (id) => {
    try {
      await api.put(`/admin/instructor-applications/${id}/reject`)
      success('Candidature rejetée.')
      fetchInstructorApplications()
    } catch {
      toastError('Erreur lors du rejet.')
    }
  }

  const handleTogglePublish = async (id) => {
    try {
      const { data } = await api.put(`/admin/courses/${id}/publish`)
      success(data.message)
      fetchCourses()
    } catch {
      toastError('Erreur lors de la mise à jour.')
    }
  }

  const handleDeleteCourse = async (id, title) => {
    if (!confirm(`Supprimer "${title}" ? Cette action est définitive.`)) return
    try {
      await api.delete(`/admin/courses/${id}`)
      success('Formation supprimée.')
      fetchCourses()
    } catch {
      toastError('Erreur lors de la suppression.')
    }
  }

  const handleLogout = () => { logout(); navigate('/') }

  const SIDEBAR = [
    { id: 'overview', icon: LayoutDashboard, label: 'Tableau de bord' },
    { id: 'presence', icon: Radio, label: 'Présence & Clics', badge: 'Live' },
    { id: 'receipts', icon: ClipboardCheck, label: 'Validation paiements', badge: stats?.pendingReceipts > 0 ? stats.pendingReceipts : null },
    { id: 'courses',  icon: BookOpen, label: 'Gestion formations' },
    { id: 'instructors', icon: GraduationCap, label: 'Formateurs' },
    { id: 'instructor_apps', icon: GraduationCap, label: 'Candidatures' },
    { id: 'payouts', icon: CreditCard, label: 'Retraits Formateurs' },
    { id: 'certificates', icon: Award, label: 'Certificats' },
    { id: 'coupons', icon: Ticket, label: 'Coupons (Promo)' },
    { id: 'blog', icon: FileText, label: 'Blog & Articles' },
    { id: 'newsletter', icon: Mail, label: 'Newsletter', badge: stats?.totalSubscribers > 0 ? stats.totalSubscribers : null },
    { id: 'site_cms', icon: Globe, label: 'Gestion du Site (CMS)' },
    { id: 'settings', icon: Settings, label: 'Paramètres' },
  ]

  return (
    <div className="min-h-screen bg-[#07070a] text-white flex selection:bg-white/20 overflow-hidden relative">
      {/* Glow ambientaux futuristes */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none -z-10 animate-[pulse_8s_ease-in-out_infinite]" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-[100px] pointer-events-none -z-10 animate-[pulse_10s_ease-in-out_infinite]" />
      
      {/* Overlay Mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden animate-fade-in" 
          onClick={() => setIsSidebarOpen(false)} 
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 w-64 bg-neutral-950/60 backdrop-blur-2xl border-r border-white/5 flex flex-col z-50 transform transition-transform duration-300 lg:translate-x-0 lg:static lg:h-screen ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Logo size="sm" theme="dark" />
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-2 text-neutral-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors">
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-1.5">
          {SIDEBAR.map(item => {
            const Icon = item.icon
            const active = tab === item.id
            return (
              <button
                key={item.id}
                onClick={() => { setTab(item.id); setIsSidebarOpen(false) }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 text-left group relative border
                            ${active 
                              ? 'bg-blue-600/10 border-blue-500/30 text-white shadow-[0_0_20px_rgba(59,130,246,0.1)]' 
                              : 'border-transparent text-neutral-400 hover:bg-white/[0.03] hover:text-white'}`}
              >
                {active && (
                  <div className="absolute left-0 top-3 bottom-3 w-1 bg-blue-500 rounded-r-full shadow-[0_0_8px_#3b82f6]" />
                )}
                <Icon size={18} className={active ? 'text-blue-400 drop-shadow-[0_0_6px_rgba(59,130,246,0.5)]' : 'text-neutral-500 group-hover:text-neutral-300'} />
                <span className="flex-1">{item.label}</span>
                {item.badge && (
                  <span className={`w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center border ${active ? 'bg-blue-500/20 border-blue-500/30 text-blue-400' : 'bg-white/10 border-white/10 text-neutral-400'}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            )
          })}
        </nav>

        <div className="p-4 border-t border-white/5 bg-neutral-950/30">
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center text-xs font-bold text-white">
              {user?.name?.[0] || 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">{user?.name}</p>
              <p className="text-neutral-500 text-xs">Administrateur</p>
            </div>
          </div>
          <button onClick={() => navigate('/')} className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm text-neutral-400 hover:text-white hover:bg-white/5 transition-all mb-1">
            <ArrowLeft size={15} />
            Retour au site
          </button>
          <button onClick={handleLogout} className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm text-white/70 hover:text-white hover:bg-red-950/30 border border-transparent hover:border-red-900/50 transition-all">
            <LogOut size={15} />
            Se déconnecter
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto relative z-10 w-full h-screen">
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between p-4 border-b border-white/5 bg-neutral-900/50 backdrop-blur-md sticky top-0 z-30">
          <Logo size="sm" theme="dark" />
          <button onClick={() => setIsSidebarOpen(true)} className="p-2 bg-white/5 border border-white/10 rounded-lg text-white hover:bg-white/10 transition">
            <Menu size={20} />
          </button>
        </div>

        <div className="p-6 lg:p-12 max-w-7xl mx-auto">

          {/* OVERVIEW */}
          {tab === 'overview' && (
            <div className="animate-fade-up space-y-10">
              <div>
                <h1 className="font-display font-bold text-4xl text-white mb-2 tracking-tight">Tableau de bord</h1>
                <p className="text-neutral-400">Bienvenue, <span className="text-white font-medium">{user?.name}</span> — Vue d&apos;ensemble de la plateforme</p>
              </div>

              <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6 animate-fade-up" style={{ animationDelay: '0.1s' }}>
                <StatCard icon={Users} label="Étudiants inscrits" value={stats?.totalUsers ?? '—'} color="from-blue-500 to-blue-600" glowColor="from-blue-500/10" />
                <StatCard icon={BookOpen} label="Formations" value={stats?.totalCourses ?? '—'} color="from-purple-500 to-purple-600" glowColor="from-purple-500/10" />
                <StatCard icon={Clock} label="En attente" value={stats?.pendingReceipts ?? '—'} color="from-amber-500 to-amber-600" glowColor="from-amber-500/10" />
                <StatCard icon={DollarSign} label="Revenus totaux" value={stats?.totalRevenue ? `${stats.totalRevenue.toLocaleString('fr-DZ')} DZD` : '—'} color="from-emerald-500 to-emerald-600" glowColor="from-emerald-500/10" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 animate-fade-up" style={{ animationDelay: '0.2s' }}>
                {/* Action Valider Paiements */}
                <button onClick={() => setTab('receipts')} className="bg-gradient-to-b from-white/[0.04] to-white/[0.01] backdrop-blur-xl border border-white/5 rounded-2xl sm:rounded-3xl p-5 sm:p-7 text-left hover:border-amber-500/30 hover:-translate-y-1 hover:shadow-2xl shadow-amber-500/5 transition-all duration-500 group relative overflow-hidden flex flex-col justify-between min-h-[170px]">
                  <div className="absolute top-0 right-0 p-4 sm:p-6 opacity-[0.02] transform translate-x-2 -translate-y-2 group-hover:scale-110 group-hover:opacity-[0.05] transition-all duration-700">
                    <ClipboardCheck className="w-24 h-24 text-amber-500" />
                  </div>
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-500/10 to-amber-500/20 border border-amber-500/20 flex items-center justify-center mb-6 relative">
                    <div className="absolute inset-0 bg-amber-500/20 rounded-xl blur-lg opacity-40 group-hover:opacity-100 transition-opacity" />
                    <ClipboardCheck className="w-5 h-5 text-amber-400 relative z-10" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between">
                      <h3 className="font-display font-bold text-lg sm:text-xl text-white group-hover:text-amber-400 transition-colors leading-tight">Valider paiements</h3>
                      <ChevronRight size={18} className="text-neutral-500 group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
                    </div>
                    <p className="text-neutral-400 text-xs sm:text-sm font-medium mt-1">{stats?.pendingReceipts || 0} reçu{(stats?.pendingReceipts || 0) > 1 ? 's' : ''} en attente</p>
                  </div>
                </button>

                {/* Action Gérer formations */}
                <button onClick={() => setTab('courses')} className="bg-gradient-to-b from-white/[0.04] to-white/[0.01] backdrop-blur-xl border border-white/5 rounded-2xl sm:rounded-3xl p-5 sm:p-7 text-left hover:border-blue-500/30 hover:-translate-y-1 hover:shadow-2xl shadow-blue-500/5 transition-all duration-500 group relative overflow-hidden flex flex-col justify-between min-h-[170px]">
                  <div className="absolute top-0 right-0 p-4 sm:p-6 opacity-[0.02] transform translate-x-2 -translate-y-2 group-hover:scale-110 group-hover:opacity-[0.05] transition-all duration-700">
                    <BookOpen className="w-24 h-24 text-blue-500" />
                  </div>
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-500/20 border border-blue-500/20 flex items-center justify-center mb-6 relative">
                    <div className="absolute inset-0 bg-blue-500/20 rounded-xl blur-lg opacity-40 group-hover:opacity-100 transition-opacity" />
                    <BookOpen className="w-5 h-5 text-blue-400 relative z-10" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between">
                      <h3 className="font-display font-bold text-lg sm:text-xl text-white group-hover:text-blue-400 transition-colors leading-tight">Gérer formations</h3>
                      <ChevronRight size={18} className="text-neutral-500 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
                    </div>
                    <p className="text-neutral-400 text-xs sm:text-sm font-medium mt-1">{stats?.totalCourses || 0} formation{(stats?.totalCourses || 0) > 1 ? 's' : ''}</p>
                  </div>
                </button>

                {/* Action Générer Certificats */}
                <button onClick={() => setTab('certificates')} className="bg-gradient-to-b from-white/[0.04] to-white/[0.01] backdrop-blur-xl border border-white/5 rounded-2xl sm:rounded-3xl p-5 sm:p-7 text-left hover:border-[#d25b5b]/30 hover:-translate-y-1 hover:shadow-2xl shadow-[#d25b5b]/5 transition-all duration-500 group relative overflow-hidden flex flex-col justify-between min-h-[170px]">
                  <div className="absolute top-0 right-0 p-4 sm:p-6 opacity-[0.02] transform translate-x-2 -translate-y-2 group-hover:scale-110 group-hover:opacity-[0.05] transition-all duration-700">
                    <Award className="w-24 h-24 text-[#d25b5b]" />
                  </div>
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#d25b5b]/10 to-[#d25b5b]/20 border border-[#d25b5b]/20 flex items-center justify-center mb-6 relative">
                    <div className="absolute inset-0 bg-[#d25b5b]/20 rounded-xl blur-lg opacity-40 group-hover:opacity-100 transition-opacity" />
                    <Award className="w-5 h-5 text-[#d25b5b] relative z-10" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between">
                      <h3 className="font-display font-bold text-lg sm:text-xl text-white group-hover:text-[#d25b5b] transition-colors leading-tight">Générer Certificats</h3>
                      <ChevronRight size={18} className="text-neutral-500 group-hover:text-[#d25b5b] group-hover:translate-x-1 transition-all" />
                    </div>
                    <p className="text-neutral-400 text-xs sm:text-sm font-medium mt-1">Créer des certificats PDF</p>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* PRESENCE & CLICKS */}
          {tab === 'presence' && <PresenceAutomationTab />}

          {/* RECEIPTS */}
          {tab === 'receipts' && (
            <div className="animate-fade-up space-y-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="font-display font-bold text-4xl text-white mb-2 tracking-tight">Validation des paiements</h1>
                  <p className="text-neutral-400">Vérifiez et validez les preuves de virement CCP/BaridiMob</p>
                </div>
              </div>

              <div className="flex gap-3">
                {['PENDING', 'APPROVED', 'REJECTED'].map(s => (
                  <button key={s} onClick={() => setReceiptFilter(s)}
                          className={`px-5 py-2.5 rounded-2xl text-sm font-semibold transition-all duration-300 ${receiptFilter === s ? 'bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.3)]' : 'bg-neutral-900/50 text-neutral-400 hover:text-white hover:bg-neutral-800'}`}>
                    { {PENDING: t('admin.status_pending'), APPROVED: 'Approuvés', REJECTED: t('admin.tab_rejected')}[s] }
                  </button>
                ))}
              </div>

              <div className="bg-neutral-900/40 backdrop-blur-xl border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/5 bg-white/[0.02]">
                        {['Étudiant', 'Formation', 'Montant', 'Type', 'Date', 'Statut', 'Actions'].map(h => (
                          <th key={h} className="px-6 py-5 text-left text-xs font-bold text-neutral-500 uppercase tracking-wider">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {loading ? (
                        <tr><td colSpan={7} className="py-16 text-center text-neutral-500 font-medium">Chargement…</td></tr>
                      ) : receipts.length === 0 ? (
                        <tr><td colSpan={7} className="py-16 text-center text-neutral-500 font-medium">Aucun reçu {receiptFilter === 'PENDING' ? 'en attente' : ''}.</td></tr>
                      ) : receipts.map(r => (
                        <tr key={r.id} className="hover:bg-white/[0.02] transition-colors duration-300 group">
                          <td className="px-6 py-5">
                            <p className="text-white text-sm font-semibold mb-0.5">{r.user.name || '—'}</p>
                            <p className="text-neutral-500 text-xs font-medium">{r.user.email}</p>
                          </td>
                          <td className="px-6 py-5"><p className="text-neutral-300 text-sm font-medium max-w-[200px] truncate">{r.course.title}</p></td>
                          <td className="px-6 py-5"><span className="text-white font-mono font-bold text-sm bg-white/10 px-3 py-1.5 rounded-lg border border-white/20">{r.amount.toLocaleString('fr-DZ')} DZD</span></td>
                          <td className="px-6 py-5"><span className="text-neutral-400 text-xs font-mono bg-white/5 px-2.5 py-1.5 rounded-md border border-white/10">{r.paymentType}</span></td>
                          <td className="px-6 py-5 text-neutral-400 text-xs font-medium">{new Date(r.createdAt).toLocaleDateString('fr-DZ')}</td>
                          <td className="px-6 py-5"><StatusBadge status={r.status} /></td>
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-3 transition-opacity duration-300">
                              {r.receiptImage && (
                                <button onClick={() => setImgModal(r.receiptImage.startsWith('http') ? r.receiptImage : r.receiptImage)} className="p-2 rounded-xl bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 hover:scale-110 transition-all border border-blue-500/20" title="Voir la preuve de paiement">
                                  <Eye size={16} />
                                </button>
                              )}
                              {r.status === 'PENDING' && (
                                <>
                                  <button onClick={() => handleApprove(r.id)} className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 hover:scale-110 transition-all border border-emerald-500/20" title="Valider et débloquer">
                                    <CheckCircle size={16} />
                                  </button>
                                  <button onClick={() => handleReject(r.id)} className="p-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:scale-110 transition-all border border-red-500/20" title="Rejeter">
                                    <XCircle size={16} />
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* COURSES */}
          {tab === 'courses' && (
            <div className="animate-fade-up space-y-8">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h1 className="font-display font-bold text-4xl text-white mb-2 tracking-tight">Gestion des formations</h1>
                  <p className="text-neutral-400">Créez, éditez vos cours et gérez vos leçons vidéo</p>
                </div>
                <button onClick={() => { setCourseToEdit(null); setCourseModalOpen(true) }} className="bg-white text-black shadow-lg shadow-white/20 text-sm py-3 px-6 hover:scale-105 transition-transform">
                  <Plus size={18} />
                  Ajouter une formation
                </button>
              </div>

              <div className="bg-neutral-900/40 backdrop-blur-xl border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/5 bg-white/[0.02]">
                        {['Formation', 'Catégorie', 'Prix', 'Leçons', 'Ventes', 'Statut', 'Actions'].map(h => (
                          <th key={h} className="px-6 py-5 text-left text-xs font-bold text-neutral-500 uppercase tracking-wider">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {loading ? (
                        <tr><td colSpan={7} className="py-16 text-center text-neutral-500 font-medium">Chargement…</td></tr>
                      ) : courses.length === 0 ? (
                        <tr><td colSpan={7} className="py-16 text-center">
                          <p className="text-neutral-500 mb-6 font-medium">Aucune formation en catalogue.</p>
                          <button onClick={() => { setCourseToEdit(null); setCourseModalOpen(true) }} className="bg-white text-black text-sm py-2.5 px-6 rounded-xl shadow-lg shadow-white/20 font-bold hover:scale-105 transition-transform">
                            <Plus size={16} /> Créer ma première formation
                          </button>
                        </td></tr>
                      ) : courses.map(c => (
                        <tr key={c.id} className="hover:bg-white/[0.02] transition-colors duration-300 group">
                          <td className="px-6 py-5">
                            <p className="text-white text-sm font-semibold mb-0.5 max-w-[220px] truncate">{c.title}</p>
                            <p className="text-neutral-500 text-xs font-medium">{c.level}</p>
                          </td>
                          <td className="px-6 py-5">
                            <span className="px-3 py-1.5 bg-white/10 border border-white/20 rounded-lg text-white text-xs font-bold">
                              {c.category}
                            </span>
                          </td>
                          <td className="px-6 py-5"><span className="text-white font-mono font-bold text-sm bg-white/10 px-3 py-1.5 rounded-lg border border-white/20">{c.price.toLocaleString('fr-DZ')} DZD</span></td>
                          <td className="px-6 py-5 text-neutral-400 text-sm font-mono font-medium">{c.lessonsCount}</td>
                          <td className="px-6 py-5 text-neutral-400 text-sm font-mono font-medium">{c.salesCount}</td>
                          <td className="px-6 py-5">
                            <span className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${c.isPublished ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]' : 'bg-white/5 text-neutral-400 border-white/10'}`}>
                              {c.isPublished ? 'Publié' : 'Brouillon'}
                            </span>
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-3 transition-opacity duration-300">
                              <button onClick={() => { setCourseToEdit(c); setCourseModalOpen(true) }} className="p-2 rounded-xl bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 hover:scale-110 transition-all border border-blue-500/20" title="Modifier le cours et les leçons">
                                <Edit3 size={16} />
                              </button>
                              <button onClick={() => handleTogglePublish(c.id)} className={`p-2 rounded-xl transition-all border hover:scale-110 ${c.isPublished ? 'bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border-amber-500/20' : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border-emerald-500/20'}`} title={c.isPublished ? 'Dépublier' : 'Publier'}>
                                {c.isPublished ? <GlobeLock size={16} /> : <Globe size={16} />}
                              </button>
                              <button onClick={() => handleDeleteCourse(c.id, c.title)} className="p-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:scale-110 transition-all border border-red-500/20" title="Supprimer la formation">
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* INSTRUCTOR APPLICATIONS (CANDIDATURES) */}
          {tab === 'instructor_apps' && (
            <div className="animate-fade-up space-y-8">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h1 className="font-display font-bold text-4xl text-white mb-2 tracking-tight">Candidatures Formateurs</h1>
                  <p className="text-neutral-400">Validez les demandes d'inscription au programme formateur (reçus de paiement)</p>
                </div>
              </div>

              <div className="bg-neutral-900/40 backdrop-blur-xl border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/5 bg-white/[0.02]">
                        {['Candidat', 'Spécialité', 'Message', 'Reçu', 'Statut', 'Actions'].map(h => (
                          <th key={h} className="px-6 py-5 text-left text-xs font-bold text-neutral-500 uppercase tracking-wider">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {loading ? (
                        <tr><td colSpan={6} className="py-16 text-center text-neutral-500 font-medium">Chargement…</td></tr>
                      ) : instructorApplications.length === 0 ? (
                        <tr><td colSpan={6} className="py-16 text-center text-neutral-500 font-medium">Aucune candidature en attente.</td></tr>
                      ) : instructorApplications.map(app => (
                        <tr key={app.id} className="hover:bg-white/[0.02] transition-colors duration-300">
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center font-bold">
                                {app.user?.name?.[0]?.toUpperCase() || 'U'}
                              </div>
                              <div>
                                <p className="text-white text-sm font-semibold">{app.user?.name}</p>
                                <p className="text-neutral-500 text-xs font-mono">{app.user?.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-5 text-neutral-400 font-medium text-sm">{app.specialty || '-'}</td>
                          <td className="px-6 py-5">
                            <p className="text-neutral-400 text-xs line-clamp-2 max-w-[200px]" title={app.message}>{app.message || '-'}</p>
                          </td>
                          <td className="px-6 py-5">
                            {app.receiptImage ? (
                              <button
                                onClick={() => setImgModal(app.receiptImage.startsWith('http') ? app.receiptImage : `${import.meta.env.VITE_API_URL || ''}${app.receiptImage}`)}
                                className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-lg text-xs font-semibold transition-colors border border-blue-500/20"
                              >
                                <Eye size={14} /> Voir reçu
                              </button>
                            ) : (
                              <span className="text-neutral-600 text-xs italic">Aucun reçu</span>
                            )}
                          </td>
                          <td className="px-6 py-5"><StatusBadge status={app.status} /></td>
                          <td className="px-6 py-5">
                            {app.status === 'PENDING' && (
                              <div className="flex gap-2">
                                <button onClick={() => handleApproveInstructor(app.id)} className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white flex items-center justify-center transition-all shadow-lg shadow-emerald-500/10">
                                  <Check size={16} />
                                </button>
                                <button onClick={() => handleRejectInstructor(app.id)} className="w-9 h-9 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white flex items-center justify-center transition-all shadow-lg shadow-red-500/10">
                                  <X size={16} />
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* CERTIFICATES */}
          {tab === 'certificates' && <CertificateGenerator />}

          {/* NEWSLETTER SUBSCRIBERS */}
          {tab === 'newsletter' && (
            <div className="space-y-6 animate-fade-up">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-display font-black text-2xl sm:text-3xl text-white tracking-tight">
                    Abonnés Newsletter
                  </h2>
                  <p className="text-neutral-400 text-xs sm:text-sm font-medium mt-1">
                    {subscriberTotal} inscrit{subscriberTotal > 1 ? 's' : ''} à la newsletter privée.
                  </p>
                </div>
              </div>

              <div className="bg-neutral-950/40 backdrop-blur-xl border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-white/5 bg-white/[0.02] text-neutral-400 text-xs font-bold uppercase tracking-wider">
                        <th className="px-6 py-4">Adresse E-mail</th>
                        <th className="px-6 py-4">Date d'inscription</th>
                        <th className="px-6 py-4">Source</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-sm font-medium text-neutral-300">
                      {loading && subscribers.length === 0 ? (
                        <tr>
                          <td colSpan={3} className="py-16 text-center text-neutral-500 font-medium">
                            Chargement des abonnés...
                          </td>
                        </tr>
                      ) : subscribers.length === 0 ? (
                        <tr>
                          <td colSpan={3} className="py-16 text-center text-neutral-500 font-medium">
                            Aucun abonné enregistré pour le moment.
                          </td>
                        </tr>
                      ) : (
                        subscribers.map((sub) => (
                          <tr key={sub.id} className="hover:bg-white/[0.01] transition-colors">
                            <td className="px-6 py-4 font-semibold text-white">{sub.email}</td>
                            <td className="px-6 py-4 font-mono text-xs">
                              {new Date(sub.createdAt).toLocaleString('fr-DZ', {
                                dateStyle: 'long',
                                timeStyle: 'short',
                              })}
                            </td>
                            <td className="px-6 py-4">
                              <span className="px-2 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-md text-[10px] uppercase font-bold tracking-wider">
                                {sub.source || 'resources_page'}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {subscriberTotalPages > 1 && (
                  <div className="px-6 py-4 border-t border-white/5 flex items-center justify-between">
                    <button
                      onClick={() => setSubscriberPage((p) => Math.max(1, p - 1))}
                      disabled={subscriberPage === 1 || loading}
                      className="px-4 py-2 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-30 disabled:pointer-events-none"
                    >
                      Précédent
                    </button>
                    <span className="text-xs text-neutral-400 font-bold">
                      Page {subscriberPage} sur {subscriberTotalPages}
                    </span>
                    <button
                      onClick={() => setSubscriberPage((p) => Math.min(subscriberTotalPages, p + 1))}
                      disabled={subscriberPage === subscriberTotalPages || loading}
                      className="px-4 py-2 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-30 disabled:pointer-events-none"
                    >
                      Suivant
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* INSTRUCTORS (FORMATEURS) */}
          {tab === 'instructors' && (
            <div className="animate-fade-up space-y-8">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h1 className="font-display font-bold text-4xl text-white mb-2 tracking-tight">Formateurs</h1>
                  <p className="text-neutral-400">Gérez les abonnements et accès de vos formateurs partenaires</p>
                </div>
                <button onClick={() => setInstructorModalOpen(true)} className="bg-white text-black shadow-lg shadow-white/20 text-sm py-3 px-6 hover:scale-105 transition-transform font-bold flex items-center gap-2 rounded-xl">
                  <Plus size={18} /> Créer un formateur
                </button>
              </div>

              <div className="bg-neutral-900/40 backdrop-blur-xl border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/5 bg-white/[0.02]">
                        {['Nom / Email', 'Formations créées', 'Taux Commission', 'Solde Actuel', "Date d'inscription", 'Actions'].map(h => (
                          <th key={h} className="px-6 py-5 text-left text-xs font-bold text-neutral-500 uppercase tracking-wider">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {loading ? (
                        <tr><td colSpan={6} className="py-16 text-center text-neutral-500 font-medium">Chargement…</td></tr>
                      ) : instructorsList.length === 0 ? (
                        <tr><td colSpan={6} className="py-16 text-center">
                          <p className="text-neutral-500 mb-6 font-medium">Aucun formateur enregistré.</p>
                          <button onClick={() => setInstructorModalOpen(true)} className="bg-white text-black text-sm py-2.5 px-6 rounded-xl shadow-lg shadow-white/20 font-bold hover:scale-105 transition-transform inline-flex items-center gap-2">
                            <Plus size={16} /> Ajouter le premier formateur
                          </button>
                        </td></tr>
                      ) : instructorsList.map(inst => (
                        <tr key={inst.id} className="hover:bg-white/[0.02] transition-colors duration-300">
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold">
                                {inst.name?.[0]?.toUpperCase() || 'F'}
                              </div>
                              <div>
                                <p className="text-white text-sm font-semibold">{inst.name}</p>
                                <p className="text-neutral-500 text-xs font-mono">{inst.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-5 text-neutral-400 font-medium text-sm">
                            {inst._count?.coursesCreated || 0} formation(s)
                          </td>
                          <td className="px-6 py-5">
                            <span className="px-3 py-1 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-lg text-xs font-bold">
                              {inst.commissionRate || 20}%
                            </span>
                          </td>
                          <td className="px-6 py-5 text-emerald-400 font-mono font-bold text-sm">
                            {(inst.instructorBalance || 0).toLocaleString('fr-DZ')} DZD
                          </td>
                          <td className="px-6 py-5 text-neutral-400 text-xs font-mono">
                            {new Date(inst.createdAt).toLocaleDateString('fr-DZ')}
                          </td>
                          <td className="px-6 py-5">
                            <button
                              onClick={() => setInstructorToDelete(inst)}
                              className="p-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:scale-110 transition-all border border-red-500/20"
                              title="Supprimer le formateur"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* SETTINGS (VIDÉO D'ACCUEIL & CMS) */}
          {tab === 'site_cms' && <SiteCMSConfigTab />}
          {tab === 'coupons' && <AdminCouponsTab />}
          {tab === 'payouts' && <AdminPayoutsTab />}
          {tab === 'blog' && <AdminBlogTab />}
          {tab === 'settings' && <SettingsTab />}
        </div>
      </main>

      {imgModal && <ReceiptImageModal url={imgModal} onClose={() => setImgModal(null)} />}
      {courseModalOpen && <CourseModal courseToEdit={courseToEdit} onClose={() => setCourseModalOpen(false)} onSuccess={() => { setCourseModalOpen(false); fetchCourses() }} />}
      {instructorModalOpen && <CreateInstructorModal onClose={() => setInstructorModalOpen(false)} onSuccess={() => { setInstructorModalOpen(false); fetchInstructors() }} />}
      {instructorToDelete && (
        <DeleteInstructorModal
          instructor={instructorToDelete}
          onClose={() => setInstructorToDelete(null)}
          onSuccess={() => { setInstructorToDelete(null); fetchInstructors(); fetchStats() }}
        />
      )}
    </div>
  )
}
