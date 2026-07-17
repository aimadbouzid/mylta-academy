// AdminDashboard.jsx — Dashboard Admin complet & professionnel (Thème Bleu Éducatif)
// Gestion complète des formations, leçons vidéo (Drive/WeTransfer) et validation des reçus.

import { useState, useEffect, useCallback } from 'react'
import {
  LayoutDashboard, ClipboardCheck, BookOpen, LogOut, ArrowLeft, Menu,
  Users, DollarSign, Clock, Eye, CheckCircle,
  XCircle, Plus, Trash2, Globe, GlobeLock,
  GraduationCap, AlertCircle, X, Edit3, Film, Info, HelpCircle, Upload, Save, MessageSquare, Compass, Sparkles
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../hooks/useToast.jsx'
import { optimizeImage } from '../utils/imageOptimizer'
import Logo from '../components/Logo'
import api from '../api/axios'

// ── Carte Statistique ──────────────────────────────────────────
function StatCard({ icon: Icon, label, value, color, border }) {
  return (
    <div className={`bg-neutral-900/40 backdrop-blur-xl border border-white/5 rounded-2xl sm:rounded-3xl p-4 sm:p-6 relative overflow-hidden group transition-all duration-500 hover:-translate-y-1 hover:border-white/10 hover:bg-neutral-900/60`}>
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center mb-3 sm:mb-5 ${color} border border-white/5`}>
        <Icon className="w-5 h-5 sm:w-[22px] sm:h-[22px] text-current" />
      </div>
      <p className="font-display font-bold text-2xl sm:text-4xl text-white mb-1 sm:mb-2 tracking-tight">{value}</p>
      <p className="text-neutral-400 text-xs sm:text-sm font-medium leading-snug">{label}</p>
    </div>
  )
}

// ── Badge Statut ───────────────────────────────────────────────
function StatusBadge({ status }) {
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

// ── Tab Configuration Vidéo d'Accueil ─────────────────────────
function VideoConfigTab() {
  const { t } = useLanguage()
  const { success: toastSuccess, error: toastError } = useToast()
  const [videoUrl, setVideoUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    api.get('/admin/config')
      .then(res => setVideoUrl(res.data?.introVideoUrl || ''))
      .catch(() => toastError('Erreur chargement configuration vidéo.'))
  }, [])

  const handleSaveUrl = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.put('/admin/config', { introVideoUrl: videoUrl })
      toastSuccess('Lien de la vidéo mis à jour avec succès !')
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

        {/* Aperçu vidéo */}
        {videoUrl && (
          <div className="pt-8 border-t border-white/5">
            <p className="text-white text-lg font-bold mb-4 flex items-center gap-3">
              <Film size={20} className="text-white" /> Aperçu en direct :
            </p>
            <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black/50 border border-white/10 flex items-center justify-center shadow-2xl">
              <video key={videoUrl} src={videoUrl} controls playsInline className="w-full h-full object-contain">
                Votre navigateur ne supporte pas la lecture vidéo.
              </video>
            </div>
          </div>
        )}
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
// DASHBOARD PRINCIPAL
// ═══════════════════════════════════════════════════════════════
export default function AdminDashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { success, error: toastError } = useToast()

  const [tab, setTab] = useState('overview')
  const [stats, setStats] = useState(null)
  const [receipts, setReceipts] = useState([])
  const [courses, setCourses] = useState([])
  const [receiptFilter, setReceiptFilter] = useState('PENDING')
  const [loading, setLoading] = useState(false)
  const [imgModal, setImgModal] = useState(null)
  const [courseModalOpen, setCourseModalOpen] = useState(false)
  const [courseToEdit, setCourseToEdit] = useState(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

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

  useEffect(() => { fetchStats() }, [fetchStats])
  useEffect(() => { if (tab === 'receipts') fetchReceipts() }, [tab, fetchReceipts])
  useEffect(() => { if (tab === 'courses')  fetchCourses()  }, [tab, fetchCourses])

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
    { id: 'overview', icon: LayoutDashboard, label: t('admin.dashboard') },
    { id: 'receipts', icon: ClipboardCheck, label: t('admin.receipts'), badge: stats?.pendingReceipts > 0 ? stats.pendingReceipts : null },
    { id: 'courses',  icon: BookOpen, label: t('admin.courses') },
    { id: 'site_cms', icon: Globe, label: t('admin.site_cms') },
    { id: 'settings', icon: Film, label: t('admin.video_config') },
  ]

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex selection:bg-white/20 overflow-hidden">
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/5 via-neutral-950 to-neutral-950 -z-10" />
      
      {/* Overlay Mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden" 
          onClick={() => setIsSidebarOpen(false)} 
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 w-64 bg-neutral-900/30 backdrop-blur-2xl border-r border-white/5 flex flex-col z-50 transform transition-transform duration-300 lg:translate-x-0 lg:static lg:h-screen ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Logo size="sm" theme="dark" />
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-2 text-neutral-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors">
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {SIDEBAR.map(item => {
            const Icon = item.icon
            const active = tab === item.id
            return (
              <button
                key={item.id}
                onClick={() => { setTab(item.id); setIsSidebarOpen(false) }}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-all duration-300 text-left group
                            ${active ? 'bg-gradient-to-r from-white/10 to-transparent text-white border border-white/20 shadow-[0_0_15px_rgba(255,255,255,0.05)]' : 'text-neutral-400 hover:bg-white/5 hover:text-white'}`}
              >
                <Icon size={18} className={active ? 'text-white' : 'text-neutral-500 group-hover:text-neutral-300'} />
                <span className="flex-1">{item.label}</span>
                {item.badge && (
                  <span className="w-5 h-5 rounded-full bg-white/20 border border-white/30 text-white text-xs font-bold flex items-center justify-center">
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

              <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
                <StatCard icon={Users} label="Étudiants inscrits" value={stats?.totalUsers ?? '—'} color="bg-blue-500/20 text-blue-400" border="border-blue-500/20" />
                <StatCard icon={BookOpen} label="Formations" value={stats?.totalCourses ?? '—'} color="bg-purple-500/20 text-purple-400" border="border-purple-500/20" />
                <StatCard icon={Clock} label="En attente" value={stats?.pendingReceipts ?? '—'} color="bg-amber-500/20 text-amber-400" border="border-amber-500/20" />
                <StatCard icon={DollarSign} label="Revenus totaux" value={stats?.totalRevenue ? `${stats.totalRevenue.toLocaleString('fr-DZ')} DZD` : '—'} color="bg-emerald-500/20 text-emerald-400" border="border-emerald-500/20" />
              </div>

              <div className="grid grid-cols-2 gap-4 sm:gap-6">
                <button onClick={() => setTab('receipts')} className="bg-neutral-900/40 backdrop-blur-xl border border-white/5 rounded-2xl sm:rounded-3xl p-5 sm:p-8 text-left hover:border-amber-500/30 hover:-translate-y-1 hover:shadow-2xl shadow-amber-500/10 transition-all duration-500 group relative overflow-hidden flex flex-col justify-between">
                  <div className="absolute top-0 right-0 p-4 sm:p-8 opacity-5 transform translate-x-4 -translate-y-4 group-hover:scale-110 transition-transform duration-700">
                    <ClipboardCheck className="w-20 h-20 sm:w-32 sm:h-32" />
                  </div>
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-4 sm:mb-6">
                    <ClipboardCheck className="w-6 h-6 sm:w-7 sm:h-7 text-amber-400" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-lg sm:text-xl text-white mb-1 sm:mb-2 group-hover:text-amber-400 transition-colors leading-tight">Valider paiements</h3>
                    <p className="text-neutral-400 text-xs sm:text-sm font-medium">{stats?.pendingReceipts || 0} reçu{(stats?.pendingReceipts || 0) > 1 ? 's' : ''} attente</p>
                  </div>
                </button>

                <button onClick={() => setTab('courses')} className="bg-neutral-900/40 backdrop-blur-xl border border-white/5 rounded-2xl sm:rounded-3xl p-5 sm:p-8 text-left hover:border-white/30 hover:-translate-y-1 hover:shadow-2xl shadow-white/5 transition-all duration-500 group relative overflow-hidden flex flex-col justify-between">
                  <div className="absolute top-0 right-0 p-4 sm:p-8 opacity-5 transform translate-x-4 -translate-y-4 group-hover:scale-110 transition-transform duration-700">
                    <BookOpen className="w-20 h-20 sm:w-32 sm:h-32" />
                  </div>
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4 sm:mb-6">
                    <BookOpen className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-lg sm:text-xl text-white mb-1 sm:mb-2 group-hover:text-white transition-colors leading-tight">Gérer formations</h3>
                    <p className="text-neutral-400 text-xs sm:text-sm font-medium">{stats?.totalCourses || 0} formation{(stats?.totalCourses || 0) > 1 ? 's' : ''}</p>
                  </div>
                </button>
              </div>
            </div>
          )}

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

          {/* SETTINGS (VIDÉO D'ACCUEIL & CMS) */}
          {tab === 'site_cms' && <SiteCMSConfigTab />}
          {tab === 'settings' && <VideoConfigTab />}
        </div>
      </main>

      {imgModal && <ReceiptImageModal url={imgModal} onClose={() => setImgModal(null)} />}
      {courseModalOpen && <CourseModal courseToEdit={courseToEdit} onClose={() => setCourseModalOpen(false)} onSuccess={() => { setCourseModalOpen(false); fetchCourses() }} />}
    </div>
  )
}
