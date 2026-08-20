import { useState, useEffect, useCallback } from 'react'
import { FileText, Plus, Trash2, Edit3, X, ImagePlus, Loader2 } from 'lucide-react'
import api from '../../api/axios'
import { useToast } from '../../hooks/useToast.jsx'
import { optimizeImage } from '../../utils/imageOptimizer'

export default function AdminBlogTab() {
  const { success: toastSuccess, error: toastError } = useToast()
  
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  
  const [form, setForm] = useState({ title: '', slug: '', summary: '', thumbnail: '', content: '', isPublished: false })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadingThumb, setUploadingThumb] = useState(false)

  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setUploadingThumb(true)
    try {
      const optimized = await optimizeImage(file, 800)
      const formData = new FormData()
      formData.append('image', optimized)
      const { data } = await api.post('/admin/upload-thumbnail', formData)
      setForm(p => ({ ...p, thumbnail: data.url }))
      toastSuccess('Image optimisée et uploadée !')
    } catch (err) {
      toastError(err.response?.data?.error || err.message || "Erreur d'upload")
    } finally {
      setUploadingThumb(false)
      if (e.target) e.target.value = ''
    }
  }

  const fetchPosts = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/admin/blog?limit=100') // On force 100 pour tout voir dans l'admin facilement
      setPosts(data.posts || [])
    } catch {
      toastError('Erreur lors du chargement des articles.')
    } finally {
      setLoading(false)
    }
  }, [toastError])

  useEffect(() => {
    fetchPosts()
  }, [fetchPosts])

  const handleEdit = (post) => {
    setEditingId(post.id)
    setForm({
      title: post.title,
      slug: post.slug,
      summary: post.summary || '',
      thumbnail: post.thumbnail || '',
      content: post.content || '',
      isPublished: post.isPublished
    })
    setShowForm(true)
  }

  const handleCreateNew = () => {
    setEditingId(null)
    setForm({ title: '', slug: '', summary: '', thumbnail: '', content: '', isPublished: false })
    setShowForm(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      if (editingId) {
        await api.put(`/blog/${editingId}`, form)
        toastSuccess('Article mis à jour !')
      } else {
        await api.post('/blog', form)
        toastSuccess('Article créé !')
      }
      setShowForm(false)
      fetchPosts()
    } catch (err) {
      toastError(err.response?.data?.error || 'Erreur.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id, title) => {
    if (!confirm(`Supprimer l'article "${title}" définitivement ?`)) return
    try {
      await api.delete(`/blog/${id}`)
      toastSuccess('Article supprimé.')
      fetchPosts()
    } catch (err) {
      toastError('Erreur lors de la suppression.')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-500/10 to-blue-500/10 border border-indigo-500/20 rounded-2xl p-6 sm:p-8 flex items-center justify-between">
        <div>
          <h2 className="font-display font-bold text-2xl text-white mb-2 flex items-center gap-3">
            <FileText className="text-indigo-400" /> Articles de Blog & SEO
          </h2>
          <p className="text-neutral-400 text-sm">Gérez le contenu de votre blog pour améliorer votre référencement Google.</p>
        </div>
        {!showForm && (
          <button onClick={handleCreateNew} className="flex items-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-bold transition-colors shadow-lg shadow-indigo-500/20">
            <Plus size={18} /> Rédiger un article
          </button>
        )}
      </div>

      {showForm ? (
        <div className="bg-neutral-900/80 border border-white/10 rounded-3xl p-6 sm:p-8 animate-fade-in relative">
          <button onClick={() => setShowForm(false)} className="absolute top-6 right-6 text-neutral-400 hover:text-white">
            <X size={24} />
          </button>
          <h3 className="text-xl font-bold mb-6">{editingId ? 'Modifier l\'article' : 'Nouvel article'}</h3>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="text-sm font-bold text-neutral-400 mb-1.5 block">Titre de l'article *</label>
                <input type="text" required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                       className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white outline-none" />
              </div>
              <div>
                <label className="text-sm font-bold text-neutral-400 mb-1.5 block">Slug (URL) *</label>
                <input type="text" required value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                       className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white outline-none" placeholder="mon-super-article" />
              </div>
            </div>

            <div>
              <label className="text-sm font-bold text-neutral-400 mb-1.5 block">Image de couverture</label>
              <div className="flex gap-4 items-center">
                <label className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-3 flex items-center justify-center gap-2 cursor-pointer hover:bg-black/60 hover:border-indigo-500/50 transition-all text-neutral-400 hover:text-white">
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={uploadingThumb} />
                  {uploadingThumb ? <Loader2 size={20} className="animate-spin text-indigo-500" /> : <ImagePlus size={20} />}
                  <span>{uploadingThumb ? "Compression..." : form.thumbnail ? "Changer l'image" : "Ajouter une image"}</span>
                </label>
                {form.thumbnail && (
                  <div className="w-16 h-12 rounded-lg overflow-hidden border border-white/10 shrink-0">
                    <img src={form.thumbnail} alt="Aperçu" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="text-sm font-bold text-neutral-400 mb-1.5 block">Résumé court (SEO)</label>
              <textarea value={form.summary} onChange={e => setForm({ ...form, summary: e.target.value })} rows={2}
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white outline-none resize-none" />
            </div>

            <div>
              <label className="text-sm font-bold text-neutral-400 mb-1.5 block">Contenu de l'article (Markdown supporté) *</label>
              <textarea required value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} rows={10}
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white outline-none resize-y font-mono text-sm" />
            </div>

            <div className="flex items-center gap-3 bg-white/5 p-4 rounded-xl border border-white/10">
              <input type="checkbox" id="isPublished" checked={form.isPublished} onChange={e => setForm({ ...form, isPublished: e.target.checked })} className="w-5 h-5 accent-indigo-500" />
              <label htmlFor="isPublished" className="font-bold cursor-pointer">Publier cet article (Visible publiquement)</label>
            </div>

            <div className="flex gap-4 pt-4">
              <button type="submit" disabled={isSubmitting} className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-bold transition-colors">
                {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="px-8 py-3 bg-neutral-800 hover:bg-neutral-700 rounded-xl font-bold transition-colors">
                Annuler
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="bg-neutral-900/50 border border-white/5 rounded-2xl overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-neutral-400">Chargement...</div>
          ) : posts.length === 0 ? (
            <div className="p-8 text-center text-neutral-500">Aucun article publié.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white/5 text-xs uppercase tracking-wider text-neutral-400">
                    <th className="p-4 font-semibold">Titre</th>
                    <th className="p-4 font-semibold">Auteur</th>
                    <th className="p-4 font-semibold">Date</th>
                    <th className="p-4 font-semibold">Statut</th>
                    <th className="p-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-sm">
                  {posts.map(p => (
                    <tr key={p.id} className="hover:bg-white/[0.02]">
                      <td className="p-4 font-bold text-white">{p.title}</td>
                      <td className="p-4 text-neutral-400">{p.author?.name || 'Inconnu'}</td>
                      <td className="p-4 text-neutral-500">{new Date(p.createdAt).toLocaleDateString('fr-FR')}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${p.isPublished ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                          {p.isPublished ? 'PUBLIÉ' : 'BROUILLON'}
                        </span>
                      </td>
                      <td className="p-4 text-right space-x-2">
                        <button onClick={() => handleEdit(p)} className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-neutral-400 transition-colors">
                          <Edit3 size={16} />
                        </button>
                        <button onClick={() => handleDelete(p.id, p.title)} className="p-2 bg-red-500/10 hover:bg-red-500/20 rounded-lg text-red-400 transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
