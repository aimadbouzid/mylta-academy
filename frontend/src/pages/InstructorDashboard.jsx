// InstructorDashboard.jsx — Dashboard complet pour les formateurs (Marketplace)
// Stats, CRUD Formations, Revenus, Retraits

import { useState, useEffect, useCallback } from 'react'
import {
  LayoutDashboard, BookOpen, DollarSign, ArrowLeft, Menu,
  Plus, Trash2, Edit3, Film, Save, X, Eye, EyeOff,
  TrendingUp, Wallet, Clock, CheckCircle, XCircle,
  Upload, HelpCircle, LogOut, Send, Users, AlertCircle,
  ChevronDown, ChevronUp, Ticket
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'
import { useToast } from '../hooks/useToast'
import Logo from '../components/Logo'
import SEOHead from '../components/SEOHead'
import api from '../api/axios'

// ── Carte Statistique ──────────────────────────────────────────
function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="bg-neutral-900/40 backdrop-blur-xl border border-white/5 rounded-2xl p-4 sm:p-6 relative overflow-hidden group transition-all duration-500 hover:-translate-y-1 hover:border-white/10 hover:bg-neutral-900/60">
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center mb-3 sm:mb-4 ${color} border border-white/5`}>
        <Icon className="w-5 h-5 sm:w-[22px] sm:h-[22px] text-current" />
      </div>
      <p className="font-display font-bold text-2xl sm:text-3xl text-white mb-1 tracking-tight">{value}</p>
      <p className="text-neutral-400 text-xs sm:text-sm font-medium">{label}</p>
    </div>
  )
}

// ── Sidebar Navigation ─────────────────────────────────────────
const TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'courses', label: 'Mes Formations', icon: BookOpen },
  { id: 'coupons', label: 'Coupons', icon: Ticket },
  { id: 'earnings', label: 'Revenus', icon: DollarSign },
  { id: 'payouts', label: 'Retraits', icon: Wallet },
]

export default function InstructorDashboard() {
  const { user, logout } = useAuth()
  const { t } = useLanguage()
  const { success, error: showError } = useToast()
  const navigate = useNavigate()

  const [activeTab, setActiveTab] = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Dashboard data
  const [stats, setStats] = useState(null)
  const [quota, setQuota] = useState(null) // Limite de formations liée à l'offre
  const [chartData, setChartData] = useState([])
  const [recentSales, setRecentSales] = useState([])
  const [courses, setCourses] = useState([])
  const [earnings, setEarnings] = useState([])
  const [payouts, setPayouts] = useState([])
  const [balance, setBalance] = useState(0)
  const [loading, setLoading] = useState(true)

  // Course form
  const [showCourseForm, setShowCourseForm] = useState(false)
  const [editingCourse, setEditingCourse] = useState(null)
  const [courseForm, setCourseForm] = useState({
    title: '', description: '', price: '', category: 'Général',
    level: 'Débutant', duration: '', thumbnail: '',
  })
  const [newLessons, setNewLessons] = useState([])
  const [savingCourse, setSavingCourse] = useState(false)

  // Coupons formateur
  const [coupons, setCoupons] = useState([])
  const [showCouponForm, setShowCouponForm] = useState(false)
  const [couponForm, setCouponForm] = useState({ code: '', courseId: '', discountPercent: '', maxUses: '100', expiresAt: '' })
  const [savingCoupon, setSavingCoupon] = useState(false)

  // Payout form
  const [showPayoutForm, setShowPayoutForm] = useState(false)
  const [payoutForm, setPayoutForm] = useState({ amount: '', method: 'CCP', accountInfo: '' })
  const [requestingPayout, setRequestingPayout] = useState(false)

  // Conditions de retrait (règles admin + état d'identité)
  const [eligibility, setEligibility] = useState(null)
  const [identityForm, setIdentityForm] = useState({ fullName: '', file: null })
  const [submittingIdentity, setSubmittingIdentity] = useState(false)

  // ── Data fetching ─────────────────────────────────────────────
  const fetchDashboard = useCallback(async () => {
    try {
      const [dashRes, statsRes] = await Promise.all([
        api.get('/instructor/dashboard'),
        api.get('/instructor/stats')
      ])
      
      setStats(dashRes.data.stats)
      setQuota(dashRes.data.quota || null)
      setRecentSales(dashRes.data.recentSales)
      setBalance(dashRes.data.stats.balance)
      
      if (statsRes.data.chartData) {
        setChartData(statsRes.data.chartData)
      }
    } catch (err) {
      if (err.response?.status === 403) navigate('/become-instructor')
    }
  }, [navigate])

  const fetchCourses = useCallback(async () => {
    try {
      const { data } = await api.get('/instructor/courses')
      setCourses(data.courses)
    } catch { /* ignore */ }
  }, [])

  const fetchCoupons = useCallback(async () => {
    try {
      const { data } = await api.get('/instructor/coupons')
      setCoupons(data.coupons)
    } catch { /* ignore */ }
  }, [])

  const fetchEarnings = useCallback(async () => {
    try {
      const { data } = await api.get('/instructor/earnings')
      setEarnings(data.sales)
      setBalance(data.balance)
    } catch { /* ignore */ }
  }, [])

  const fetchPayouts = useCallback(async () => {
    try {
      const [payoutsRes, eligibilityRes] = await Promise.all([
        api.get('/instructor/payouts'),
        api.get('/instructor/payout-eligibility'),
      ])
      setPayouts(payoutsRes.data.payouts)
      setEligibility(eligibilityRes.data)
      setBalance(eligibilityRes.data.balance)
    } catch { /* ignore */ }
  }, [])

  const handleIdentitySubmit = async (e) => {
    e.preventDefault()
    if (!identityForm.file) return showError('Veuillez joindre votre document d\'identité.')
    setSubmittingIdentity(true)
    try {
      const formData = new FormData()
      formData.append('fullName', identityForm.fullName)
      formData.append('identityDoc', identityForm.file)
      const { data } = await api.post('/instructor/identity', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      success(data.message)
      setIdentityForm({ fullName: '', file: null })
      fetchPayouts()
    } catch (err) {
      showError(err.response?.data?.error || "Erreur lors de l'envoi du document.")
    } finally {
      setSubmittingIdentity(false)
    }
  }

  useEffect(() => {
    const init = async () => {
      setLoading(true)
      await fetchDashboard()
      setLoading(false)
    }
    init()
  }, [fetchDashboard])

  useEffect(() => {
    if (activeTab === 'courses') fetchCourses()
    if (activeTab === 'coupons') { fetchCoupons(); fetchCourses() } // Les formations alimentent le sélecteur
    if (activeTab === 'earnings') fetchEarnings()
    if (activeTab === 'payouts') fetchPayouts()
  }, [activeTab, fetchCourses, fetchCoupons, fetchEarnings, fetchPayouts])

  // ── Course CRUD ───────────────────────────────────────────────
  const resetCourseForm = () => {
    setCourseForm({ title: '', description: '', price: '', category: 'Général', level: 'Débutant', duration: '', thumbnail: '' })
    setNewLessons([])
    setEditingCourse(null)
    setShowCourseForm(false)
  }

  const handleEditCourse = (course) => {
    setCourseForm({
      title: course.title, description: course.description, price: String(course.price),
      category: course.category, level: course.level, duration: course.duration || '',
      thumbnail: course.thumbnail || '',
    })
    setNewLessons([])
    setEditingCourse(course)
    setShowCourseForm(true)
  }

  const handleSaveCourse = async (e) => {
    e.preventDefault()
    setSavingCourse(true)
    try {
      const payload = {
        ...courseForm,
        price: parseFloat(courseForm.price),
        lessons: editingCourse ? undefined : newLessons,
      }

      if (editingCourse) {
        await api.put(`/instructor/courses/${editingCourse.id}`, payload)
        success('Formation modifiée !')
      } else {
        await api.post('/instructor/courses', payload)
        success('Formation créée !')
      }
      resetCourseForm()
      fetchCourses()
      fetchDashboard() // Rafraîchit le quota
    } catch (err) {
      if (err.response?.data?.quota) setQuota(err.response.data.quota)
      showError(err.response?.data?.error || 'Erreur')
    } finally {
      setSavingCourse(false)
    }
  }

  const handleDeleteCourse = async (courseId) => {
    if (!confirm('Supprimer cette formation ?')) return
    try {
      await api.delete(`/instructor/courses/${courseId}`)
      success('Formation supprimée.')
      fetchCourses()
      fetchDashboard() // Rafraîchit le quota
    } catch (err) {
      showError(err.response?.data?.error || 'Erreur')
    }
  }

  // ── Coupons CRUD ──────────────────────────────────────────────
  const resetCouponForm = () => {
    setCouponForm({ code: '', courseId: '', discountPercent: '', maxUses: '100', expiresAt: '' })
    setShowCouponForm(false)
  }

  const handleCreateCoupon = async (e) => {
    e.preventDefault()
    setSavingCoupon(true)
    try {
      const { data } = await api.post('/instructor/coupons', {
        ...couponForm,
        courseId: parseInt(couponForm.courseId, 10),
      })
      success(data.message || 'Coupon créé.')
      resetCouponForm()
      fetchCoupons()
    } catch (err) {
      showError(err.response?.data?.error || 'Erreur')
    } finally {
      setSavingCoupon(false)
    }
  }

  const handleToggleCoupon = async (coupon) => {
    try {
      const { data } = await api.put(`/instructor/coupons/${coupon.id}`, { isActive: !coupon.isActive })
      success(data.message)
      fetchCoupons()
    } catch (err) {
      showError(err.response?.data?.error || 'Erreur')
    }
  }

  const handleDeleteCoupon = async (coupon) => {
    if (!confirm(`Supprimer le coupon ${coupon.code} ?`)) return
    try {
      await api.delete(`/instructor/coupons/${coupon.id}`)
      success('Coupon supprimé.')
      fetchCoupons()
    } catch (err) {
      showError(err.response?.data?.error || 'Erreur')
    }
  }

  // ── Lesson CRUD ───────────────────────────────────────────────
  const addLessonRow = () => {
    setNewLessons(prev => [...prev, { title: '', externalVideoUrl: '', duration: '', description: '' }])
  }

  const updateLessonRow = (idx, field, value) => {
    setNewLessons(prev => prev.map((l, i) => i === idx ? { ...l, [field]: value } : l))
  }

  const removeLessonRow = (idx) => {
    setNewLessons(prev => prev.filter((_, i) => i !== idx))
  }

  const handleAddLesson = async (courseId) => {
    const title = prompt('Titre de la leçon:')
    if (!title) return
    const url = prompt('URL vidéo (Google Drive, YouTube...):')
    if (!url) return
    try {
      await api.post(`/instructor/courses/${courseId}/lessons`, { title, externalVideoUrl: url })
      success('Leçon ajoutée !')
      fetchCourses()
    } catch (err) {
      showError(err.response?.data?.error || 'Erreur')
    }
  }

  const handleDeleteLesson = async (lessonId) => {
    if (!confirm('Supprimer cette leçon ?')) return
    try {
      await api.delete(`/instructor/lessons/${lessonId}`)
      success('Leçon supprimée.')
      fetchCourses()
    } catch (err) {
      showError(err.response?.data?.error || 'Erreur')
    }
  }

  // ── Payout ────────────────────────────────────────────────────
  const handlePayoutRequest = async (e) => {
    e.preventDefault()
    setRequestingPayout(true)
    try {
      const { data } = await api.post('/instructor/payout-request', {
        ...payoutForm,
        amount: parseFloat(payoutForm.amount),
      })
      success(data.message)
      setShowPayoutForm(false)
      setPayoutForm({ amount: '', method: 'CCP', accountInfo: '' })
      fetchPayouts()
      fetchDashboard()
    } catch (err) {
      showError(err.response?.data?.error || 'Erreur')
    } finally {
      setRequestingPayout(false)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex">
      <SEOHead title="Espace Formateur" canonicalPath="/instructor" noindex />
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-neutral-950 border-r border-white/5 transform transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="p-6 border-b border-white/5">
            <div className="flex items-center justify-between">
              <Logo size="sm" />
              <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-neutral-400 hover:text-white">
                <X size={20} />
              </button>
            </div>
            <p className="text-[10px] uppercase tracking-widest text-blue-400 font-bold mt-2">Dashboard Formateur</p>
          </div>

          {/* Nav */}
          <nav className="flex-1 p-3 space-y-1">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setSidebarOpen(false) }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                  activeTab === tab.id
                    ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                    : 'text-neutral-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <tab.icon size={18} /> {tab.label}
              </button>
            ))}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-white/5 space-y-2">
            <button onClick={() => navigate('/')} className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm text-neutral-400 hover:text-white hover:bg-white/5 transition-all font-medium">
              <ArrowLeft size={16} /> Retour au site
            </button>
            <button onClick={handleLogout} className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm text-red-400 hover:bg-red-500/10 transition-all font-medium">
              <LogOut size={16} /> Déconnexion
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && <div className="fixed inset-0 z-40 bg-black/60 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Main */}
      <main className="flex-1 lg:ml-64">
        {/* Top bar */}
        <div className="sticky top-0 z-30 bg-neutral-950/80 backdrop-blur-xl border-b border-white/5 px-4 sm:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-neutral-400 hover:text-white">
              <Menu size={22} />
            </button>
            <h1 className="font-display font-bold text-lg sm:text-xl">{TABS.find(t => t.id === activeTab)?.label}</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-bold text-white">{user?.name || user?.email}</p>
              <p className="text-xs text-blue-400 font-semibold">Formateur</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-8">
          {/* ═══ DASHBOARD TAB ═══ */}
          {activeTab === 'dashboard' && stats && (
            <div className="space-y-8">
              {/* Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <StatCard
                  icon={BookOpen}
                  label={quota && !quota.unlimited ? `Formations (limite : ${quota.limit})` : 'Formations'}
                  value={quota && !quota.unlimited ? `${quota.used} / ${quota.limit}` : stats.totalCourses}
                  color="bg-blue-500/10 text-blue-400"
                />
                <StatCard icon={Users} label="Ventes" value={stats.totalSales} color="bg-emerald-500/10 text-emerald-400" />
                <StatCard icon={TrendingUp} label="Revenus totaux" value={`${(stats.totalEarnings || 0).toLocaleString('fr-DZ')} DA`} color="bg-purple-500/10 text-purple-400" />
                <StatCard icon={Wallet} label="Solde disponible" value={`${(stats.balance || 0).toLocaleString('fr-DZ')} DA`} color="bg-amber-500/10 text-amber-400" />
              </div>

              {/* Quota de formations */}
              {quota && (
                <div className="bg-neutral-900/40 border border-white/5 rounded-2xl p-5">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                      <p className="text-sm font-bold text-white mb-1">Votre quota de formations</p>
                      <p className="text-neutral-400 text-sm">
                        {quota.unlimited ? (
                          <>Offre <span className="text-white font-bold">{quota.plan || 'actuelle'}</span> — formations <span className="text-emerald-400 font-bold">illimitées</span>.</>
                        ) : (
                          <>
                            Offre <span className="text-white font-bold">{quota.plan || 'actuelle'}</span> — vous avez utilisé{' '}
                            <span className="text-white font-bold">{quota.used}</span> formation(s) sur{' '}
                            <span className="text-white font-bold">{quota.limit}</span>.
                          </>
                        )}
                      </p>
                    </div>
                    {!quota.unlimited && (
                      <span className={`text-xs font-bold px-3 py-1.5 rounded-full border ${
                        quota.reached
                          ? 'bg-red-500/10 text-red-400 border-red-500/20'
                          : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      }`}>
                        {quota.reached ? 'Limite atteinte' : `${quota.remaining} restante(s)`}
                      </span>
                    )}
                  </div>

                  {!quota.unlimited && (
                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden mt-4">
                      <div
                        style={{ width: `${Math.min(100, (quota.used / quota.limit) * 100)}%` }}
                        className={`h-full transition-all duration-500 ${quota.reached ? 'bg-red-500' : 'bg-blue-500'}`}
                      />
                    </div>
                  )}

                  {quota.reached && (
                    <p className="text-red-400/80 text-xs mt-3">
                      Pour publier davantage, supprimez une formation existante ou passez à une offre supérieure.
                    </p>
                  )}
                </div>
              )}

              {/* Note qualité — attentes pédagogiques */}
              <div className="bg-amber-500/5 border border-amber-500/10 rounded-2xl p-5 flex items-start gap-3">
                <AlertCircle size={20} className="text-amber-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-bold text-amber-400 mb-2">Note — ce qu'on attend de vos formations</p>
                  <ul className="text-neutral-400 text-sm space-y-1.5 list-disc list-inside">
                    <li><span className="text-white font-semibold">Fluides et rapides</span> : allez droit au but, chaque minute doit apporter quelque chose.</li>
                    <li><span className="text-white font-semibold">Pas de longue introduction</span> : évitez les présentations interminables, l'apprenant décroche.</li>
                    <li><span className="text-white font-semibold">Du concret</span> : privilégiez la pratique et les exemples réels plutôt que la théorie qui traîne.</li>
                    <li><span className="text-white font-semibold">Des leçons courtes</span> : mieux vaut plusieurs vidéos nettes qu'une seule très longue.</li>
                  </ul>
                </div>
              </div>

              {/* Commission info */}
              <div className="bg-blue-500/5 border border-blue-500/10 rounded-2xl p-5 flex items-start gap-3">
                <AlertCircle size={20} className="text-blue-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-bold text-blue-400 mb-1">Taux de commission</p>
                  <p className="text-neutral-400 text-sm">La plateforme retient <span className="text-white font-bold">{stats.commissionRate}%</span> sur chaque vente. Vous touchez <span className="text-emerald-400 font-bold">{100 - stats.commissionRate}%</span>.</p>
                </div>
              </div>

              {/* Chart */}
              {chartData.length > 0 && (
                <div>
                  <h2 className="font-bold text-lg mb-4">Évolution des revenus</h2>
                  <div className="bg-neutral-900/40 border border-white/5 rounded-2xl p-4 sm:p-6 h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                        <XAxis dataKey="name" stroke="#ffffff50" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="#ffffff50" fontSize={12} tickLine={false} axisLine={false} tickFormatter={value => `${value} DA`} width={80} />
                        <Tooltip
                          contentStyle={{ backgroundColor: '#171717', border: '1px solid #ffffff10', borderRadius: '12px', color: '#fff' }}
                          itemStyle={{ color: '#fff' }}
                          formatter={(value) => [`${value} DA`, 'Revenus']}
                          labelStyle={{ color: '#aaa', marginBottom: '4px' }}
                        />
                        <Line type="monotone" dataKey="revenue" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 4, fill: '#8b5cf6', strokeWidth: 0 }} activeDot={{ r: 6, strokeWidth: 0 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* Recent Sales */}
              {recentSales.length > 0 && (
                <div>
                  <h2 className="font-bold text-lg mb-4">Ventes récentes</h2>
                  <div className="bg-neutral-900/40 border border-white/5 rounded-2xl overflow-hidden">
                    <div className="divide-y divide-white/5">
                      {recentSales.slice(0, 5).map((sale, i) => (
                        <div key={i} className="px-5 py-4 flex items-center justify-between">
                          <div>
                            <p className="font-semibold text-sm">{sale.course?.title}</p>
                            <p className="text-neutral-500 text-xs">{sale.user?.name || sale.user?.email} • {new Date(sale.createdAt).toLocaleDateString('fr-DZ')}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-emerald-400 text-sm">+{(sale.instructorEarnings || 0).toLocaleString('fr-DZ')} DA</p>
                            <p className="text-neutral-500 text-[10px]">Commission: {(sale.platformCommission || 0).toLocaleString('fr-DZ')} DA</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ═══ COURSES TAB ═══ */}
          {activeTab === 'courses' && (
            <div className="space-y-6">
              {/* Create button + quota */}
              {!showCourseForm && (
                <div className="flex items-center gap-4 flex-wrap">
                  <button
                    onClick={() => { resetCourseForm(); setShowCourseForm(true) }}
                    disabled={quota?.reached}
                    className="flex items-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-blue-600"
                  >
                    <Plus size={18} /> Nouvelle Formation
                  </button>
                  {quota && !quota.unlimited && (
                    <span className={`text-sm font-semibold ${quota.reached ? 'text-red-400' : 'text-neutral-400'}`}>
                      {quota.used} / {quota.limit} formations
                      {quota.reached && ' — limite de votre offre atteinte'}
                    </span>
                  )}
                </div>
              )}

              {/* Course Form */}
              {showCourseForm && (
                <div className="bg-neutral-900/60 border border-white/10 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="font-bold text-lg">{editingCourse ? 'Modifier la formation' : 'Créer une formation'}</h2>
                    <button onClick={resetCourseForm} className="text-neutral-400 hover:text-white"><X size={20} /></button>
                  </div>

                  {/* Rappel des attentes au moment où le formateur construit son contenu */}
                  <div className="bg-amber-500/5 border border-amber-500/10 rounded-xl p-4 mb-5 text-sm">
                    <p className="font-bold text-amber-400 mb-1.5">Rappel qualité</p>
                    <p className="text-neutral-400">
                      Formation <span className="text-white font-semibold">fluide et rapide</span>, droit au but.
                      Pas de longue introduction : l'apprenant doit apprendre quelque chose d'utile dès la première minute.
                    </p>
                  </div>

                  <form onSubmit={handleSaveCourse} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-neutral-400 mb-1.5">Titre *</label>
                        <input type="text" required value={courseForm.title} onChange={e => setCourseForm(f => ({ ...f, title: e.target.value }))}
                          className="w-full px-4 py-3 bg-neutral-800/50 border border-white/10 rounded-xl text-white placeholder-neutral-600 focus:border-blue-500/50 outline-none" placeholder="Nom de la formation" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-neutral-400 mb-1.5">Prix (DA) *</label>
                        <input type="number" required min="0" value={courseForm.price} onChange={e => setCourseForm(f => ({ ...f, price: e.target.value }))}
                          className="w-full px-4 py-3 bg-neutral-800/50 border border-white/10 rounded-xl text-white placeholder-neutral-600 focus:border-blue-500/50 outline-none" placeholder="Ex: 3000" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-neutral-400 mb-1.5">Description *</label>
                      <textarea required rows={3} value={courseForm.description} onChange={e => setCourseForm(f => ({ ...f, description: e.target.value }))}
                        className="w-full px-4 py-3 bg-neutral-800/50 border border-white/10 rounded-xl text-white placeholder-neutral-600 focus:border-blue-500/50 outline-none resize-none" placeholder="Description détaillée..." />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-neutral-400 mb-1.5">Catégorie</label>
                        <select value={courseForm.category} onChange={e => setCourseForm(f => ({ ...f, category: e.target.value }))}
                          className="w-full px-4 py-3 bg-neutral-800/50 border border-white/10 rounded-xl text-white focus:border-blue-500/50 outline-none">
                          {['Général', 'Marketing', 'Tech', 'Business', 'Design', 'Finance'].map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-neutral-400 mb-1.5">Niveau</label>
                        <select value={courseForm.level} onChange={e => setCourseForm(f => ({ ...f, level: e.target.value }))}
                          className="w-full px-4 py-3 bg-neutral-800/50 border border-white/10 rounded-xl text-white focus:border-blue-500/50 outline-none">
                          {['Débutant', 'Intermédiaire', 'Avancé'].map(l => <option key={l} value={l}>{l}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-neutral-400 mb-1.5">Durée</label>
                        <input type="text" value={courseForm.duration} onChange={e => setCourseForm(f => ({ ...f, duration: e.target.value }))}
                          className="w-full px-4 py-3 bg-neutral-800/50 border border-white/10 rounded-xl text-white placeholder-neutral-600 focus:border-blue-500/50 outline-none" placeholder="Ex: 8h" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-neutral-400 mb-1.5">URL Thumbnail</label>
                      <input type="text" value={courseForm.thumbnail} onChange={e => setCourseForm(f => ({ ...f, thumbnail: e.target.value }))}
                        className="w-full px-4 py-3 bg-neutral-800/50 border border-white/10 rounded-xl text-white placeholder-neutral-600 focus:border-blue-500/50 outline-none" placeholder="https://..." />
                    </div>

                    {/* Lessons (only for new course) */}
                    {!editingCourse && (
                      <div className="border-t border-white/5 pt-5">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-bold text-sm">Leçons</h3>
                          <button type="button" onClick={addLessonRow} className="text-blue-400 hover:text-blue-300 text-sm font-bold flex items-center gap-1">
                            <Plus size={14} /> Ajouter
                          </button>
                        </div>
                        {newLessons.map((lesson, idx) => (
                          <div key={idx} className="grid grid-cols-1 md:grid-cols-12 gap-2 mb-2">
                            <input type="text" required value={lesson.title} onChange={e => updateLessonRow(idx, 'title', e.target.value)}
                              className="md:col-span-4 px-3 py-2.5 bg-neutral-800/50 border border-white/10 rounded-lg text-sm text-white placeholder-neutral-600 outline-none" placeholder="Titre" />
                            <input type="text" required value={lesson.externalVideoUrl} onChange={e => updateLessonRow(idx, 'externalVideoUrl', e.target.value)}
                              className="md:col-span-5 px-3 py-2.5 bg-neutral-800/50 border border-white/10 rounded-lg text-sm text-white placeholder-neutral-600 outline-none" placeholder="URL vidéo" />
                            <input type="text" value={lesson.duration} onChange={e => updateLessonRow(idx, 'duration', e.target.value)}
                              className="md:col-span-2 px-3 py-2.5 bg-neutral-800/50 border border-white/10 rounded-lg text-sm text-white placeholder-neutral-600 outline-none" placeholder="Durée" />
                            <button type="button" onClick={() => removeLessonRow(idx)}
                              className="md:col-span-1 flex items-center justify-center text-red-400 hover:text-red-300">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex gap-3 pt-2">
                      <button type="submit" disabled={savingCourse}
                        className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold transition-colors disabled:opacity-50">
                        {savingCourse ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save size={16} />}
                        {editingCourse ? 'Sauvegarder' : 'Créer'}
                      </button>
                      <button type="button" onClick={resetCourseForm} className="px-6 py-3 bg-neutral-800 hover:bg-neutral-700 rounded-xl font-bold transition-colors">
                        Annuler
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Course List */}
              <div className="space-y-4">
                {courses.length === 0 && !showCourseForm && (
                  <div className="text-center py-20 text-neutral-500">
                    <BookOpen size={40} className="mx-auto mb-4 opacity-30" />
                    <p className="font-bold">Aucune formation</p>
                    <p className="text-sm mt-1">Créez votre première formation pour commencer à vendre.</p>
                  </div>
                )}
                {courses.map(course => (
                  <CourseItem
                    key={course.id}
                    course={course}
                    onEdit={() => handleEditCourse(course)}
                    onDelete={() => handleDeleteCourse(course.id)}
                    onAddLesson={() => handleAddLesson(course.id)}
                    onDeleteLesson={handleDeleteLesson}
                  />
                ))}
              </div>
            </div>
          )}

          {/* ═══ COUPONS TAB ═══ */}
          {activeTab === 'coupons' && (
            <div className="space-y-6">
              <div className="bg-blue-500/5 border border-blue-500/10 rounded-2xl p-5 flex items-start gap-3">
                <AlertCircle size={20} className="text-blue-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-bold text-blue-400 mb-1">Codes promo sur vos formations</p>
                  <p className="text-neutral-400 text-sm">
                    Un coupon que vous créez ne s'applique qu'à la formation choisie. La réduction est prise
                    sur le prix de vente : vos revenus sont calculés sur le montant réellement payé.
                  </p>
                </div>
              </div>

              {!showCouponForm && (
                <button
                  onClick={() => setShowCouponForm(true)}
                  disabled={courses.length === 0}
                  className="flex items-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Plus size={18} /> Nouveau Coupon
                </button>
              )}

              {courses.length === 0 && (
                <p className="text-neutral-500 text-sm">Créez d'abord une formation pour pouvoir lui associer un coupon.</p>
              )}

              {/* Formulaire */}
              {showCouponForm && (
                <div className="bg-neutral-900/60 border border-white/10 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="font-bold text-lg">Créer un coupon</h2>
                    <button onClick={resetCouponForm} className="text-neutral-400 hover:text-white"><X size={20} /></button>
                  </div>

                  <form onSubmit={handleCreateCoupon} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-neutral-400 mb-1.5">Code *</label>
                        <input
                          type="text" required value={couponForm.code}
                          onChange={e => setCouponForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
                          className="w-full px-4 py-3 bg-neutral-800/50 border border-white/10 rounded-xl text-white placeholder-neutral-600 focus:border-blue-500/50 outline-none uppercase"
                          placeholder="PROMO20" maxLength={30}
                        />
                        <p className="text-neutral-600 text-xs mt-1">Majuscules, chiffres et tirets — 3 à 30 caractères.</p>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-neutral-400 mb-1.5">Formation concernée *</label>
                        <select
                          required value={couponForm.courseId}
                          onChange={e => setCouponForm(f => ({ ...f, courseId: e.target.value }))}
                          className="w-full px-4 py-3 bg-neutral-800/50 border border-white/10 rounded-xl text-white focus:border-blue-500/50 outline-none"
                        >
                          <option value="">— Choisir —</option>
                          {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-neutral-400 mb-1.5">Réduction (%) *</label>
                        <input
                          type="number" required min="1" max="100" value={couponForm.discountPercent}
                          onChange={e => setCouponForm(f => ({ ...f, discountPercent: e.target.value }))}
                          className="w-full px-4 py-3 bg-neutral-800/50 border border-white/10 rounded-xl text-white placeholder-neutral-600 focus:border-blue-500/50 outline-none"
                          placeholder="20"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-neutral-400 mb-1.5">Utilisations max</label>
                        <input
                          type="number" min="1" max="10000" value={couponForm.maxUses}
                          onChange={e => setCouponForm(f => ({ ...f, maxUses: e.target.value }))}
                          className="w-full px-4 py-3 bg-neutral-800/50 border border-white/10 rounded-xl text-white placeholder-neutral-600 focus:border-blue-500/50 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-neutral-400 mb-1.5">Expire le</label>
                        <input
                          type="date" value={couponForm.expiresAt}
                          onChange={e => setCouponForm(f => ({ ...f, expiresAt: e.target.value }))}
                          className="w-full px-4 py-3 bg-neutral-800/50 border border-white/10 rounded-xl text-white focus:border-blue-500/50 outline-none"
                        />
                      </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                      <button
                        type="submit" disabled={savingCoupon}
                        className="flex items-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold transition-colors disabled:opacity-50"
                      >
                        <Save size={18} /> {savingCoupon ? 'Création…' : 'Créer le coupon'}
                      </button>
                      <button type="button" onClick={resetCouponForm} className="px-5 py-3 bg-neutral-800 hover:bg-neutral-700 rounded-xl font-bold transition-colors">
                        Annuler
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Liste */}
              {coupons.length === 0 && !showCouponForm ? (
                <div className="text-center py-12 text-neutral-500">
                  <Ticket size={40} className="mx-auto mb-3 opacity-30" />
                  <p>Aucun coupon pour le moment.</p>
                </div>
              ) : (
                <div className="bg-neutral-900/40 border border-white/5 rounded-2xl divide-y divide-white/5">
                  {coupons.map(coupon => {
                    const expired = coupon.expiresAt && new Date(coupon.expiresAt) < new Date()
                    const exhausted = coupon.currentUses >= coupon.maxUses
                    return (
                      <div key={coupon.id} className="px-5 py-4 flex items-center justify-between gap-4 flex-wrap">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono font-bold text-white">{coupon.code}</span>
                            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                              -{coupon.discountPercent}%
                            </span>
                            {!coupon.isActive && (
                              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-neutral-500/10 text-neutral-400 border border-neutral-500/20">Inactif</span>
                            )}
                            {expired && (
                              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">Expiré</span>
                            )}
                            {exhausted && (
                              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">Épuisé</span>
                            )}
                          </div>
                          <p className="text-neutral-500 text-xs mt-1">
                            {coupon.course?.title || 'Formation supprimée'} • {coupon.currentUses}/{coupon.maxUses} utilisations
                            {coupon.expiresAt && ` • expire le ${new Date(coupon.expiresAt).toLocaleDateString('fr-DZ')}`}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleToggleCoupon(coupon)}
                            className="px-3 py-2 text-sm font-bold rounded-lg bg-neutral-800 hover:bg-neutral-700 transition-colors"
                          >
                            {coupon.isActive ? 'Désactiver' : 'Activer'}
                          </button>
                          <button
                            onClick={() => handleDeleteCoupon(coupon)}
                            className="p-2 text-red-400 hover:text-red-300 transition-colors"
                            title="Supprimer"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* ═══ EARNINGS TAB ═══ */}
          {activeTab === 'earnings' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-emerald-500/10 to-blue-500/10 border border-emerald-500/20 rounded-2xl p-6">
                <p className="text-neutral-400 text-sm font-medium mb-1">Solde disponible</p>
                <p className="font-display font-black text-3xl text-emerald-400">{balance.toLocaleString('fr-DZ')} DA</p>
              </div>

              <h2 className="font-bold text-lg">Historique des ventes</h2>
              {earnings.length === 0 ? (
                <p className="text-neutral-500 text-sm">Aucune vente pour le moment.</p>
              ) : (
                <div className="bg-neutral-900/40 border border-white/5 rounded-2xl overflow-hidden">
                  <div className="divide-y divide-white/5">
                    {earnings.map((sale, i) => (
                      <div key={i} className="px-5 py-4 flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-sm">{sale.course?.title}</p>
                          <p className="text-neutral-500 text-xs">{sale.user?.name} • {new Date(sale.createdAt).toLocaleDateString('fr-DZ')}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-emerald-400 text-sm">+{(sale.instructorEarnings || 0).toLocaleString('fr-DZ')} DA</p>
                          <p className="text-neutral-600 text-[10px]">sur {(sale.amount || 0).toLocaleString('fr-DZ')} DA</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ═══ PAYOUTS TAB ═══ */}
          {activeTab === 'payouts' && (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="flex-1 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-2xl p-5">
                  <p className="text-neutral-400 text-sm font-medium mb-1">Solde disponible</p>
                  <p className="font-display font-black text-2xl text-amber-400">{balance.toLocaleString('fr-DZ')} DA</p>
                  {eligibility && (
                    <p className="text-neutral-500 text-xs mt-1.5">
                      Minimum de retrait : {eligibility.minPayout.toLocaleString('fr-DZ')} DA
                      {eligibility.maxPayout > 0 && ` · Plafond : ${eligibility.maxPayout.toLocaleString('fr-DZ')} DA`}
                    </p>
                  )}
                </div>
                {!showPayoutForm && eligibility?.canRequest && (
                  <button onClick={() => setShowPayoutForm(true)}
                    className="px-5 py-3 bg-amber-500 hover:bg-amber-400 text-black rounded-xl font-bold transition-colors flex items-center gap-2">
                    <Send size={16} /> Demander un retrait
                  </button>
                )}
              </div>

              {/* Pourquoi le retrait est indisponible — au lieu de masquer le bouton */}
              {eligibility && !eligibility.canRequest && (
                <PayoutBlockedNotice eligibility={eligibility} />
              )}

              {/* Vérification d'identité — préalable obligatoire au versement */}
              {eligibility && eligibility.requireIdentity && eligibility.identityStatus !== 'VERIFIED' && (
                <IdentitySubmitCard
                  eligibility={eligibility}
                  form={identityForm}
                  setForm={setIdentityForm}
                  onSubmit={handleIdentitySubmit}
                  submitting={submittingIdentity}
                />
              )}

              {/* Payout Form */}
              {showPayoutForm && (
                <div className="bg-neutral-900/60 border border-amber-500/20 rounded-2xl p-6">
                  <h3 className="font-bold mb-4">Demande de retrait</h3>
                  <form onSubmit={handlePayoutRequest} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-neutral-400 mb-1.5">Montant (DA)</label>
                        <input type="number" required
                          min={eligibility?.minPayout ?? 1000}
                          max={eligibility?.maxPayout > 0 ? Math.min(balance, eligibility.maxPayout) : balance}
                          value={payoutForm.amount}
                          onChange={e => setPayoutForm(f => ({ ...f, amount: e.target.value }))}
                          className="w-full px-4 py-3 bg-neutral-800/50 border border-white/10 rounded-xl text-white outline-none"
                          placeholder={`Min: ${(eligibility?.minPayout ?? 1000).toLocaleString('fr-DZ')} DA`} />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-neutral-400 mb-1.5">Méthode</label>
                        <select value={payoutForm.method} onChange={e => setPayoutForm(f => ({ ...f, method: e.target.value }))}
                          className="w-full px-4 py-3 bg-neutral-800/50 border border-white/10 rounded-xl text-white outline-none">
                          <option value="CCP">CCP</option>
                          <option value="BARIDIMOB">BaridiMob</option>
                          <option value="EDAHABIA">Edahabia</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-neutral-400 mb-1.5">Info compte (numéro CCP, etc.)</label>
                      <input type="text" value={payoutForm.accountInfo} onChange={e => setPayoutForm(f => ({ ...f, accountInfo: e.target.value }))}
                        className="w-full px-4 py-3 bg-neutral-800/50 border border-white/10 rounded-xl text-white placeholder-neutral-600 outline-none" placeholder="Votre numéro de compte" />
                    </div>
                    <div className="flex gap-3">
                      <button type="submit" disabled={requestingPayout}
                        className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-black rounded-xl font-bold transition-colors disabled:opacity-50">
                        {requestingPayout ? 'Envoi...' : 'Envoyer la demande'}
                      </button>
                      <button type="button" onClick={() => setShowPayoutForm(false)}
                        className="px-6 py-3 bg-neutral-800 hover:bg-neutral-700 rounded-xl font-bold transition-colors">
                        Annuler
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Payout History */}
              <h2 className="font-bold text-lg">Historique des retraits</h2>
              {payouts.length === 0 ? (
                <p className="text-neutral-500 text-sm">Aucun retrait pour le moment.</p>
              ) : (
                <div className="bg-neutral-900/40 border border-white/5 rounded-2xl overflow-hidden">
                  <div className="divide-y divide-white/5">
                    {payouts.map((p, i) => (
                      <div key={p.id || i} className="px-5 py-4 flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <p className="font-semibold text-sm">{p.amount.toLocaleString('fr-DZ')} DA</p>
                          <p className="text-neutral-500 text-xs mt-0.5">
                            {p.method} • {new Date(p.createdAt).toLocaleDateString('fr-DZ')}
                          </p>
                          {/* Référence communicable à l'administration */}
                          {p.reference && (
                            <p className="text-neutral-600 text-[11px] font-mono mt-1">Réf. {p.reference}</p>
                          )}
                          {p.processedAt && (
                            <p className="text-neutral-600 text-[11px] mt-0.5">
                              Traité le {new Date(p.processedAt).toLocaleDateString('fr-DZ')}
                            </p>
                          )}
                          {p.notes && (
                            <p className="text-neutral-500 text-xs mt-1 italic">{p.notes}</p>
                          )}
                        </div>
                        <PayoutStatusBadge status={p.status} />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

// ── Course Item Component ─────────────────────────────────────
function CourseItem({ course, onEdit, onDelete, onAddLesson, onDeleteLesson }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="bg-neutral-900/40 border border-white/5 rounded-2xl overflow-hidden hover:border-white/10 transition-all">
      <div className="p-5 flex items-start gap-4">
        {/* Thumbnail */}
        {course.thumbnail && (
          <img src={course.thumbnail} alt="" className="w-20 h-14 rounded-lg object-cover shrink-0 border border-white/5" />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-bold text-sm truncate">{course.title}</h3>
              <p className="text-neutral-500 text-xs mt-0.5">
                {course.price.toLocaleString('fr-DZ')} DA • {course.lessonsCount} leçons • {course.salesCount} ventes
              </p>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              {course.approvedByAdmin ? (
                <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Publiée</span>
              ) : (
                <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">En attente</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="px-5 pb-4 flex items-center gap-2 flex-wrap">
        <button onClick={onEdit} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 text-neutral-300 hover:bg-white/10 text-xs font-bold transition-colors">
          <Edit3 size={13} /> Modifier
        </button>
        <button onClick={() => setExpanded(!expanded)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 text-neutral-300 hover:bg-white/10 text-xs font-bold transition-colors">
          <Film size={13} /> Leçons ({course.lessons?.length || 0})
          {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        </button>
        <button onClick={onAddLesson} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 text-xs font-bold transition-colors">
          <Plus size={13} /> Leçon
        </button>
        <button onClick={onDelete} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 text-xs font-bold transition-colors ml-auto">
          <Trash2 size={13} /> Supprimer
        </button>
      </div>

      {/* Lessons */}
      {expanded && course.lessons && (
        <div className="border-t border-white/5">
          {course.lessons.length === 0 ? (
            <p className="px-5 py-4 text-neutral-500 text-xs">Aucune leçon</p>
          ) : (
            course.lessons.map((lesson, idx) => (
              <div key={lesson.id} className="px-5 py-3 flex items-center justify-between border-b border-white/5 last:border-0 hover:bg-white/[0.02]">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center text-[10px] font-bold text-neutral-500">{idx + 1}</span>
                  <div>
                    <p className="text-sm font-medium">{lesson.title}</p>
                    {lesson.duration && <p className="text-neutral-500 text-[10px]">{lesson.duration}</p>}
                  </div>
                </div>
                <button onClick={() => onDeleteLesson(lesson.id)} className="text-neutral-600 hover:text-red-400 transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}

// ── Payout Status Badge ───────────────────────────────────────
function PayoutStatusBadge({ status }) {
  const config = {
    PENDING: { cls: 'bg-amber-500/10 text-amber-400 border-amber-500/20', label: 'En attente' },
    COMPLETED: { cls: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', label: 'Effectué' },
    REJECTED: { cls: 'bg-red-500/10 text-red-400 border-red-500/20', label: 'Rejeté' },
  }[status] || { cls: 'bg-white/5 text-neutral-400', label: status }

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${config.cls}`}>
      {config.label}
    </span>
  )
}

// ── Motif de blocage du retrait ────────────────────────────────
// Le formateur doit toujours savoir pourquoi il ne peut pas retirer.
function PayoutBlockedNotice({ eligibility }) {
  const { blockedReason, balance, minPayout, pendingPayout, identityStatus } = eligibility

  const notices = {
    PAYOUTS_DISABLED: {
      cls: 'bg-red-500/5 border-red-500/20 text-red-300',
      title: 'Retraits temporairement suspendus',
      body: 'L\'administration a suspendu les retraits. Réessayez plus tard ou contactez le support.',
    },
    IDENTITY_REQUIRED: {
      cls: 'bg-blue-500/5 border-blue-500/20 text-blue-300',
      title: identityStatus === 'PENDING'
        ? 'Vérification d\'identité en cours'
        : 'Vérification d\'identité requise',
      body: identityStatus === 'PENDING'
        ? 'Votre document est en cours d\'examen par l\'administration. Vous pourrez demander un retrait dès sa validation.'
        : 'Pour des raisons de conformité, votre identité doit être vérifiée avant tout versement.',
    },
    PENDING_PAYOUT: {
      cls: 'bg-amber-500/5 border-amber-500/20 text-amber-300',
      title: 'Une demande est déjà en cours',
      body: pendingPayout
        ? `Demande de ${pendingPayout.amount.toLocaleString('fr-DZ')} DA (réf. ${pendingPayout.reference}) en attente de traitement. Une seule demande à la fois.`
        : 'Vous avez déjà une demande en attente de traitement.',
    },
    BELOW_MINIMUM: {
      cls: 'bg-neutral-500/5 border-white/10 text-neutral-300',
      title: 'Solde insuffisant pour un retrait',
      body: `Votre solde est de ${balance.toLocaleString('fr-DZ')} DA. Le minimum requis est de ${minPayout.toLocaleString('fr-DZ')} DA — il vous manque ${(minPayout - balance).toLocaleString('fr-DZ')} DA.`,
    },
  }

  const notice = notices[blockedReason]
  if (!notice) return null

  return (
    <div className={`border rounded-2xl p-4 flex items-start gap-3 ${notice.cls}`}>
      <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
      <div>
        <p className="font-bold text-sm">{notice.title}</p>
        <p className="text-xs mt-1 opacity-80 leading-relaxed">{notice.body}</p>
      </div>
    </div>
  )
}

// ── Soumission de la pièce d'identité ──────────────────────────
function IdentitySubmitCard({ eligibility, form, setForm, onSubmit, submitting }) {
  const { identityStatus, identityNotes } = eligibility

  // En attente d'examen : rien à saisir, on informe seulement.
  if (identityStatus === 'PENDING') {
    return (
      <div className="bg-neutral-900/60 border border-blue-500/20 rounded-2xl p-5 flex items-start gap-3">
        <Clock size={18} className="text-blue-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-bold text-sm">Document en cours de vérification</p>
          <p className="text-neutral-400 text-xs mt-1">
            L'administration examine votre pièce d'identité. Vous recevrez une notification dès validation.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-neutral-900/60 border border-blue-500/20 rounded-2xl p-6">
      <h3 className="font-bold mb-1.5 flex items-center gap-2">
        <Users size={16} className="text-blue-400" />
        Vérification d'identité
      </h3>
      <p className="text-neutral-400 text-xs mb-4 leading-relaxed">
        Obligatoire avant tout retrait. Le nom saisi doit correspondre exactement à celui de votre
        pièce d'identité et au compte qui recevra les versements. Document visible uniquement par l'administration.
      </p>

      {/* Motif de refus précédent */}
      {identityStatus === 'REJECTED' && identityNotes && (
        <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-3 mb-4 flex items-start gap-2">
          <XCircle size={15} className="text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-red-300 text-xs font-bold">Document refusé</p>
            <p className="text-red-300/80 text-xs mt-0.5">{identityNotes}</p>
          </div>
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-neutral-400 mb-1.5">
            Nom légal complet (tel qu'il figure sur la pièce)
          </label>
          <input type="text" required minLength={3} value={form.fullName}
            onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))}
            className="w-full px-4 py-3 bg-neutral-800/50 border border-white/10 rounded-xl text-white placeholder-neutral-600 outline-none"
            placeholder="Prénom NOM" />
        </div>
        <div>
          <label className="block text-xs font-bold text-neutral-400 mb-1.5">
            Pièce d'identité (CNI, passeport ou permis) — JPG, PNG ou WEBP, max 5 Mo
          </label>
          <input type="file" required accept="image/jpeg,image/png,image/webp"
            onChange={e => setForm(f => ({ ...f, file: e.target.files[0] || null }))}
            className="w-full px-4 py-3 bg-neutral-800/50 border border-white/10 rounded-xl text-neutral-300 text-sm outline-none
                       file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-blue-500/20 file:text-blue-300 file:text-xs file:font-bold" />
        </div>
        <button type="submit" disabled={submitting}
          className="px-6 py-3 bg-blue-500 hover:bg-blue-400 text-white rounded-xl font-bold transition-colors disabled:opacity-50 flex items-center gap-2">
          <Upload size={16} />
          {submitting ? 'Envoi...' : 'Envoyer pour vérification'}
        </button>
      </form>
    </div>
  )
}
