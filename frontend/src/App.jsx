import React, { Suspense, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import ErrorBoundary from './components/ErrorBoundary'
import Toast from './components/Toast'
import InstallPWA from './components/InstallPWA'
import ProtectedAdminRoute from './pages/ProtectedAdminRoute'
import NotFoundPage from './components/NotFoundPage'
import WhatsAppButton from './components/WhatsAppButton'
import InAppBrowserGuard from './components/InAppBrowserGuard'
import ClickTracker from './components/ClickTracker'
import FacebookPixel from './components/FacebookPixel'
import CookieBanner from './components/CookieBanner'
import { Loader } from 'lucide-react'
import { useSiteSettings } from './context/SiteSettingsContext'
import { useSocket } from './context/SocketContext'
import { useToast } from './hooks/useToast'

// Code Splitting with React.lazy
const LandingPage = React.lazy(() => import('./pages/LandingPage'))
const CoursesPage = React.lazy(() => import('./pages/CoursesPage'))
const CourseDetails = React.lazy(() => import('./pages/CourseDetails'))
const MyCoursesPage = React.lazy(() => import('./pages/MyCoursesPage'))
const WatchCoursePage = React.lazy(() => import('./pages/WatchCoursePage'))
const SettingsPage = React.lazy(() => import('./pages/SettingsPage'))
const AdminDashboard = React.lazy(() => import('./pages/AdminDashboard'))
const RegisterPage = React.lazy(() => import('./pages/RegisterPage'))
const MissionPage = React.lazy(() => import('./pages/MissionPage'))
const ResourcesPage = React.lazy(() => import('./pages/ResourcesPage'))
const InstructorApplyPage = React.lazy(() => import('./pages/InstructorApplyPage'))
const InstructorDashboard = React.lazy(() => import('./pages/InstructorDashboard'))
const TermsPage = React.lazy(() => import('./pages/TermsPage'))
const PrivacyPage = React.lazy(() => import('./pages/PrivacyPage'))
const ResetPasswordPage = React.lazy(() => import('./pages/ResetPasswordPage'))
const PaymentSuccessPage = React.lazy(() => import('./pages/PaymentSuccessPage'))
const PaymentFailurePage = React.lazy(() => import('./pages/PaymentFailurePage'))
const CoachingPage = React.lazy(() => import('./pages/CoachingPage'))

const SuspenseFallback = () => (
  <div className="min-h-screen flex items-center justify-center">
    <Loader className="animate-spin text-academy-primary" size={32} />
  </div>
)

const ModuleRoute = ({ moduleName, children }) => {
  const { settings, loadingSettings } = useSiteSettings()
  if (loadingSettings) return <SuspenseFallback />
  
  const isEnabled = settings?.modules?.[moduleName] !== false
  if (!isEnabled) {
    return <Navigate to="/" replace />
  }
  return children
}

export default function App() {
  const { socket } = useSocket()
  const { success } = useToast()
  const { settings } = useSiteSettings()
  // Actif par défaut, y compris pendant le chargement des réglages : on ne
  // veut jamais laisser passer un visiteur Instagram/TikTok dans le
  // navigateur intégré le temps que /config/site réponde.
  const inAppGuardEnabled = settings?.modules?.inAppBrowserGuardEnabled !== false

  useEffect(() => {
    if (!socket) return

    const handleReceiptApproved = (data) => {
      success(`✅ Paiement validé pour "${data.courseTitle}" ! Votre formation est débloquée.`)
    }

    const handleForceLogout = (data) => {
      // Clear token and user data
      localStorage.removeItem('mylta_token')
      localStorage.removeItem('myltaacademy_user')
      // Redirect to login or home
      window.location.href = '/'
      // We can also alert the user but a redirect is safest to cut access immediately
    }

    socket.on('receipt_approved', handleReceiptApproved)
    socket.on('force_logout', handleForceLogout)

    return () => {
      socket.off('receipt_approved', handleReceiptApproved)
      socket.off('force_logout', handleForceLogout)
    }
  }, [socket, success])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const ref = params.get('ref')
    if (ref) {
      localStorage.setItem('mylta_referral', ref)
      console.log('Saved referral code:', ref)
    }
  }, [])

  return (
    <ErrorBoundary>
      <InAppBrowserGuard enabled={inAppGuardEnabled}>
        <ClickTracker />
        <FacebookPixel />
        <div className="min-h-screen bg-academy-surface text-academy-textMain relative overflow-hidden">
        {/* Lightweight background — GPU-accelerated, no blur filter */}
        <div className="absolute inset-0 z-0 pointer-events-none select-none" style={{ background: 'radial-gradient(ellipse 80% 60% at 20% 10%, rgba(59,130,246,0.06) 0%, transparent 70%), radial-gradient(ellipse 70% 50% at 80% 70%, rgba(99,102,241,0.05) 0%, transparent 70%)', willChange: 'auto' }} />

        <div className="relative z-10">
          <Suspense fallback={<SuspenseFallback />}>
            <Routes>
              {/* Page d'accueil publique */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/mission" element={<MissionPage />} />
              <Route path="/coaching" element={<CoachingPage />} />
              <Route path="/resources" element={<ModuleRoute moduleName="resourcesEnabled"><ResourcesPage /></ModuleRoute>} />
              <Route path="/ressources" element={<ModuleRoute moduleName="resourcesEnabled"><ResourcesPage /></ModuleRoute>} />
              <Route path="/terms" element={<TermsPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />

              {/* Catalogue de formations */}
              <Route path="/courses" element={<CoursesPage />} />
              <Route path="/courses/:id" element={<CourseDetails />} />
              <Route path="/formations" element={<CoursesPage />} />


              {/* Pages de retour paiement Chargily */}
              <Route path="/payment/success" element={<PaymentSuccessPage />} />
              <Route path="/payment/failure" element={<PaymentFailurePage />} />

              {/* Espace Étudiant (Formations débloquées & Lecteur Vidéo) */}
              <Route path="/my-courses" element={<MyCoursesPage />} />
              <Route path="/watch/:courseId" element={<WatchCoursePage />} />

              {/* Paramètres compte (Profil, Mot de passe, Confidentialité) */}
              <Route path="/settings" element={<SettingsPage />} />

              {/* Marketplace — Devenir Formateur */}
              <Route path="/become-instructor" element={<ModuleRoute moduleName="instructorEnabled"><InstructorApplyPage /></ModuleRoute>} />
              <Route path="/instructor" element={<ModuleRoute moduleName="instructorEnabled"><InstructorDashboard /></ModuleRoute>} />
              <Route path="/instructor/*" element={<ModuleRoute moduleName="instructorEnabled"><InstructorDashboard /></ModuleRoute>} />

              {/* Dashboard Admin — protégé */}
              <Route
                path="/admin"
                element={
                  <ProtectedAdminRoute>
                    <AdminDashboard />
                  </ProtectedAdminRoute>
                }
              />
              <Route
                path="/admin/*"
                element={
                  <ProtectedAdminRoute>
                    <AdminDashboard />
                  </ProtectedAdminRoute>
                }
              />

              {/* 404 */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Suspense>

          {/* Cookie Consent Banner */}
          <CookieBanner />

          {/* WhatsApp Button */}
          <WhatsAppButton />

          {/* Système de notifications toast — global */}
          <Toast />
          
          {/* PWA Install Prompt */}
          <InstallPWA />
        </div>
      </div>
      </InAppBrowserGuard>
    </ErrorBoundary>
  )
}
