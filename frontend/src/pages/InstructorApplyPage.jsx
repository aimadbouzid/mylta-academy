// InstructorApplyPage.jsx — Page pour devenir formateur (Marketplace)
// Design premium, matching the platform's aesthetic

import { useState, useEffect } from 'react'
import {
  GraduationCap, Upload, Send, CheckCircle, Clock, XCircle,
  DollarSign, Users, BookOpen, TrendingUp, ArrowLeft, Sparkles,
  Award, Rocket, Target, ShieldCheck, Check
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'
import { useToast } from '../hooks/useToast'
import Navbar from '../components/Navbar'
import SEOHead from '../components/SEOHead'
import api from '../api/axios'

export default function InstructorApplyPage() {
  const { user, isAuthenticated, isInstructor, isAdmin } = useAuth()
  const { t } = useLanguage()
  const { success, error: showError } = useToast()
  const navigate = useNavigate()

  const ADVANTAGES = [
    { icon: DollarSign, title: t('instructor_apply.advantages.rev_title') || 'Gagnez des revenus', desc: t('instructor_apply.advantages.rev_desc') || 'Vendez vos formations et touchez jusqu\'à 100% sur chaque vente.' },
    { icon: Users, title: t('instructor_apply.advantages.audience_title') || 'Audience existante', desc: t('instructor_apply.advantages.audience_desc') || 'Profitez de notre base d\'étudiants actifs pour atteindre plus de monde.' },
    { icon: ShieldCheck, title: t('instructor_apply.advantages.security_title') || 'Plateforme sécurisée', desc: t('instructor_apply.advantages.security_desc') || 'Infrastructure robuste, paiements sécurisés et support technique.' },
    { icon: TrendingUp, title: t('instructor_apply.advantages.analytics_title') || 'Dashboard analytics', desc: t('instructor_apply.advantages.analytics_desc') || 'Suivez vos ventes, revenus et retraits en temps réel.' },
  ]

  const SUBSCRIPTION_PLANS = [
    {
      id: 'starter',
      name: 'Starter',
      price: 25000,
      features: [
        t('instructor_apply.plans.starter.f1') || '1 formation active',
        t('instructor_apply.plans.starter.f2') || '80% de commission par vente',
        t('instructor_apply.plans.starter.f3') || 'Dashboard analytique basique',
        t('instructor_apply.plans.starter.f4') || 'Support par email'
      ]
    },
    {
      id: 'pro',
      name: 'Pro',
      price: 45000,
      popular: true,
      features: [
        t('instructor_apply.plans.pro.f1') || 'Jusqu\'à 5 formations actives',
        t('instructor_apply.plans.pro.f2') || '90% de commission par vente',
        t('instructor_apply.plans.pro.f3') || 'Mise en avant sur la plateforme',
        t('instructor_apply.plans.pro.f4') || 'Support prioritaire WhatsApp'
      ]
    },
    {
      id: 'elite',
      name: 'Elite',
      price: 75000,
      features: [
        t('instructor_apply.plans.elite.f1') || 'Jusqu\'à 10 formations actives',
        t('instructor_apply.plans.elite.f2') || '100% de commission par vente',
        t('instructor_apply.plans.elite.f3') || 'Badge Formateur Elite',
        t('instructor_apply.plans.elite.f4') || 'Accompagnement marketing dédié'
      ]
    }
  ]

  const [status, setStatus] = useState(null) // null | loading data
  const [application, setApplication] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  // Form
  const [selectedPlan, setSelectedPlan] = useState('pro')
  const [message, setMessage] = useState('')
  const [specialty, setSpecialty] = useState('')

  // Redirect if already instructor
  useEffect(() => {
    if (isInstructor) {
      navigate('/instructor')
      return
    }
    if (isAdmin) {
      navigate('/admin')
      return
    }
  }, [isInstructor, isAdmin, navigate])

  // Fetch application status
  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false)
      return
    }

    const fetchStatus = async () => {
      try {
        const { data } = await api.get('/instructor/status')
        setApplication(data.application)
        setStatus(data)
      } catch {
        // Ignore
      } finally {
        setLoading(false)
      }
    }
    fetchStatus()
  }, [isAuthenticated])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (submitting) return

    const plan = SUBSCRIPTION_PLANS.find(p => p.id === selectedPlan)

    setSubmitting(true)
    try {
      const whatsappMessage = `🎓 ${t('instructor_apply.whatsapp.new_app') || '*Nouvelle Candidature Formateur*'} 🎓\n\n` +
        `👤 *Candidat :* ${user?.name || 'Utilisateur'}\n` +
        `📧 *Email :* ${user?.email || 'Non renseigné'}\n` +
        `💎 ${t('instructor_apply.whatsapp.plan') || '*Abonnement Choisi :*'} ${plan.name} (${plan.price.toLocaleString('fr-DZ')} DA)\n` +
        `🎯 ${t('instructor_apply.whatsapp.specialty') || '*Spécialité :*'} ${specialty.trim()}\n\n` +
        `💭 ${t('instructor_apply.whatsapp.motivation') || '*Motivations :*'}\n` +
        `"${message.trim()}"`;
      const encodedMessage = encodeURIComponent(whatsappMessage);
      const whatsappUrl = `https://wa.me/213795103743?text=${encodedMessage}`;
      
      window.open(whatsappUrl, '_blank');
      success(t('instructor_apply.form.whatsapp_redirect') || "Redirection vers WhatsApp...");
    } catch (err) {
      showError(t('instructor_apply.form.whatsapp_error') || 'Erreur lors de la redirection.');
    } finally {
      setSubmitting(false)
    }
  }

  const renderStatusBadge = () => {
    if (!application) return null

    const config = {
      PENDING: { icon: Clock, color: 'text-amber-400 bg-amber-500/10 border-amber-500/20', label: t('instructor_apply.pending.status_label') || 'En attente' },
      APPROVED: { icon: CheckCircle, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20', label: t('instructor_apply.approved.status_label') || 'Approuvée' },
      REJECTED: { icon: XCircle, color: 'text-red-400 bg-red-500/10 border-red-500/20', label: t('instructor_apply.rejected.status_label') || 'Refusée' },
    }[application.status] || { icon: Clock, color: 'text-neutral-400 dark:text-academy-textMain/40 bg-white/5 dark:bg-academy-surfaceDark/5', label: application.status }

    const Icon = config.icon
    return (
      <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold border ${config.color}`}>
        <Icon size={16} /> {config.label}
      </span>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <SEOHead title={t('instructor_apply.seo_title') || "Devenir Formateur"} />
      <Navbar />

      {/* Hero */}
      <div className="relative pt-40 pb-20 px-4">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-600/10 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-bold mb-6">
            <Sparkles size={16} /> {t('instructor_apply.marketplace_badge') || 'Marketplace Formateurs'}
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-black mb-4 tracking-tight">
            {t('instructor_apply.title_start') || 'Devenez'} <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">{t('instructor_apply.title_highlight') || 'Formateur'}</span>
          </h1>
          <p className="text-neutral-400 dark:text-academy-textMain/40 text-lg max-w-2xl mx-auto leading-relaxed">
            {t('instructor_apply.subtitle') || 'Vendez vos formations sur notre plateforme et touchez des revenus sur chaque vente. Rejoignez notre communauté d\'experts.'}
          </p>
        </div>
      </div>

      {/* Advantages */}
      <div className="max-w-5xl mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {ADVANTAGES.map((adv, i) => (
            <div key={i} className="bg-neutral-900/60 border border-white/5 rounded-2xl p-6 hover:border-white/10 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-4 group-hover:bg-blue-500/20 transition-colors">
                <adv.icon size={22} className="text-blue-400" />
              </div>
              <h3 className="font-bold text-white mb-2">{adv.title}</h3>
              <p className="text-neutral-500 dark:text-academy-textMain/50 text-sm leading-relaxed">{adv.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Offres & Prix — toujours visibles, même sans connexion */}
      <div className="max-w-4xl mx-auto px-4 pb-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-display font-black mb-4">{t('instructor_apply.plans.title') || 'Choisissez votre abonnement'}</h2>
          <p className="text-neutral-400 dark:text-academy-textMain/40">{t('instructor_apply.plans.subtitle') || 'Sélectionnez le plan qui correspond le mieux à vos objectifs.'}</p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {SUBSCRIPTION_PLANS.map((plan) => (
            <div
              key={plan.id}
              onClick={() => setSelectedPlan(plan.id)}
              className={`relative cursor-pointer rounded-3xl p-6 transition-all duration-300 ${
                selectedPlan === plan.id
                  ? 'bg-blue-600/10 border-2 border-blue-500 transform scale-[1.02] shadow-xl shadow-blue-500/10'
                  : 'bg-neutral-900/40 border-2 border-white/5 hover:border-white/20'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full text-[10px] font-bold uppercase tracking-widest text-white shadow-sm">
                  {t('instructor_apply.plans.popular') || 'Le plus choisi'}
                </div>
              )}

              <div className="mb-4">
                <h3 className={`text-xl font-bold mb-2 ${selectedPlan === plan.id ? 'text-blue-400' : 'text-white'}`}>{plan.name}</h3>
                <div className="flex flex-wrap items-baseline gap-2">
                  <span className="text-3xl font-black">{plan.price.toLocaleString('fr-DZ')}</span>
                  <span className={`text-sm font-bold px-2.5 py-1 rounded-lg border ${selectedPlan === plan.id ? 'bg-white/20 dark:bg-academy-surfaceDark/20 text-white border-white/30' : 'bg-blue-500/10 text-blue-400 border-blue-500/20'}`}>
                    {t('instructor_apply.plans.currency') || 'DA / 6 mois'}
                  </span>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                {plan.features.map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <Check size={16} className={`shrink-0 mt-0.5 ${selectedPlan === plan.id ? 'text-blue-400' : 'text-neutral-500 dark:text-academy-textMain/50'}`} />
                    <span className="text-sm text-neutral-300 leading-snug">{feature}</span>
                  </div>
                ))}
              </div>

              <div className={`w-full py-2.5 rounded-xl text-center text-sm font-bold transition-colors ${
                selectedPlan === plan.id
                  ? 'bg-blue-500 text-white'
                  : 'bg-white/5 dark:bg-academy-surfaceDark/5 text-white hover:bg-white/10'
              }`}>
                {selectedPlan === plan.id ? (t('instructor_apply.plans.btn_selected') || 'Sélectionné') : (t('instructor_apply.plans.btn_choose') || 'Choisir ce plan')}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Application Form or Status */}
      <div className="max-w-4xl mx-auto px-4 pb-32">
        {!isAuthenticated ? (
          /* Not logged in — les prix sont visibles au-dessus, la connexion n'est requise que pour postuler/acheter */
          <div className="bg-neutral-900/60 border border-white/5 rounded-3xl p-8 text-center max-w-2xl mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center mx-auto mb-6">
              <GraduationCap size={28} className="text-blue-400" />
            </div>
            <h2 className="text-xl font-bold mb-3">{t('instructor_apply.login_required.title') || 'Connectez-vous pour postuler'}</h2>
            <p className="text-neutral-400 dark:text-academy-textMain/40 mb-6">
              {t('instructor_apply.login_required.desc_prefix') || 'Vous devez avoir un compte pour souscrire au plan'} <span className="text-white font-bold">{SUBSCRIPTION_PLANS.find(p => p.id === selectedPlan).name}</span> {t('instructor_apply.login_required.desc_suffix') || 'et soumettre votre candidature.'}
            </p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-white dark:bg-academy-surfaceDark text-black rounded-full font-bold hover:bg-neutral-200 transition-colors"
            >
              {t('instructor_apply.login_required.btn') || 'Se connecter'}
            </button>
          </div>
        ) : loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : application?.status === 'PENDING' ? (
          /* Pending application */
          <div className="bg-neutral-900/60 border border-amber-500/20 rounded-3xl p-8 text-center max-w-2xl mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center mx-auto mb-6">
              <Clock size={28} className="text-amber-400" />
            </div>
            <h2 className="text-xl font-bold mb-3">{t('instructor_apply.pending.title') || 'Candidature en cours d\'examen'}</h2>
            <p className="text-neutral-400 dark:text-academy-textMain/40 mb-4">
              {t('instructor_apply.pending.desc_prefix') || 'Votre candidature a été soumise le'} {new Date(application.createdAt).toLocaleDateString('fr-DZ')}
              {t('instructor_apply.pending.desc_suffix') || '. L\'admin va l\'examiner et vous recevrez une notification.'}
            </p>
            {renderStatusBadge()}
          </div>
        ) : application?.status === 'APPROVED' ? (
          /* Approved */
          <div className="bg-neutral-900/60 border border-emerald-500/20 rounded-3xl p-8 text-center max-w-2xl mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-6">
              <CheckCircle size={28} className="text-emerald-400" />
            </div>
            <h2 className="text-xl font-bold mb-3">{t('instructor_apply.approved.title') || 'Vous êtes formateur ! 🎉'}</h2>
            <p className="text-neutral-400 dark:text-academy-textMain/40 mb-6">{t('instructor_apply.approved.desc') || 'Votre candidature a été approuvée. Accédez à votre dashboard.'}</p>
            <button
              onClick={() => navigate('/instructor')}
              className="px-6 py-3 bg-emerald-500 text-white rounded-full font-bold hover:bg-emerald-600 transition-colors"
            >
              <Rocket className="inline mr-2" size={18} /> {t('instructor_apply.approved.btn') || 'Accéder au Dashboard'}
            </button>
          </div>
        ) : (
          /* Application form (les offres/prix sont affichés au-dessus, communs aux visiteurs et connectés) */
          <div>
            <div className="bg-neutral-900/60 border border-white/5 rounded-3xl p-8 max-w-2xl mx-auto">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                  <Send size={22} className="text-blue-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">{t('instructor_apply.form.title') || 'Détails de la candidature'}</h2>
                  <p className="text-neutral-500 dark:text-academy-textMain/50 text-sm">
                    {t('instructor_apply.form.plan_chosen') || 'Plan choisi :'} <span className="text-white font-bold">{SUBSCRIPTION_PLANS.find(p => p.id === selectedPlan).name}</span>
                  </p>
                </div>
              </div>

              {application?.status === 'REJECTED' && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6 text-sm">
                  <p className="text-red-400 font-bold mb-1">{t('instructor_apply.rejected.title') || 'Candidature précédente refusée'}</p>
                  <p className="text-red-300/70">{application.adminNotes || t('instructor_apply.rejected.default_notes') || 'Vous pouvez soumettre une nouvelle candidature.'}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-neutral-300 mb-2">
                    {t('instructor_apply.form.specialty_label') || 'Votre spécialité *'}
                  </label>
                  <input
                    type="text"
                    value={specialty}
                    onChange={(e) => setSpecialty(e.target.value)}
                    placeholder={t('instructor_apply.form.specialty_placeholder') || "Ex: Marketing Digital, Développement Web, Design..."}
                    required
                    className="w-full px-4 py-3 bg-neutral-800/50 border border-white/10 rounded-xl text-white
                             placeholder-neutral-600 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-neutral-300 mb-2">
                    {t('instructor_apply.form.message_label') || 'Pourquoi voulez-vous devenir formateur ? *'}
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={t('instructor_apply.form.message_placeholder') || "Parlez-nous de votre expérience, vos compétences et ce que vous souhaitez enseigner..."}
                    required
                    rows={4}
                    className="w-full px-4 py-3 bg-neutral-800/50 border border-white/10 rounded-xl text-white
                             placeholder-neutral-600 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all outline-none resize-none"
                  />
                </div>

                <div className="bg-blue-500/5 border border-blue-500/10 rounded-xl p-4 text-sm text-neutral-400 dark:text-academy-textMain/40">
                  <p className="font-bold text-blue-400 mb-1">{t('instructor_apply.form.how_it_works') || '💡 Comment ça marche ?'}</p>
                  <ol className="list-decimal list-inside space-y-1">
                    <li>{t('instructor_apply.form.step1') || 'Soumettez votre candidature via WhatsApp'}</li>
                    <li>{t('instructor_apply.form.step2') || 'L\'admin examine votre profil'}</li>
                    <li>{t('instructor_apply.form.step3') || 'Vous recevez une notification d\'approbation'}</li>
                    <li>{t('instructor_apply.form.step4') || 'Créez et vendez vos formations !'}</li>
                  </ol>
                </div>

                <button
                  type="submit"
                  disabled={submitting || !specialty.trim() || !message.trim()}
                  className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold
                           hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed
                           transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
                >
                  {submitting ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Send size={18} /> {t('instructor_apply.form.submit_btn') || 'Continuer vers WhatsApp'}
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
