import React, { Suspense, useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import ErrorBoundary from './components/ErrorBoundary'
import Toast from './components/Toast'
import InstallPWA from './components/InstallPWA'
import ProtectedAdminRoute from './pages/ProtectedAdminRoute'
import NotFoundPage from './components/NotFoundPage'
import ChatBot from './components/ChatBot'
import FloatingReportButton from './components/FloatingReportButton'
import { Loader } from 'lucide-react'

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

const SuspenseFallback = () => (
  <div className="min-h-screen flex items-center justify-center">
    <Loader className="animate-spin text-academy-primary" size={32} />
  </div>
)

export default function App() {
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
              <Route path="/resources" element={<ResourcesPage />} />
              <Route path="/ressources" element={<ResourcesPage />} />

              {/* Catalogue de formations */}
              <Route path="/courses" element={<CoursesPage />} />
              <Route path="/courses/:id" element={<CourseDetails />} />
              <Route path="/formations" element={<CoursesPage />} />

              {/* Espace Étudiant (Formations débloquées & Lecteur Vidéo) */}
              <Route path="/my-courses" element={<MyCoursesPage />} />
              <Route path="/watch/:courseId" element={<WatchCoursePage />} />

              {/* Paramètres compte (Profil, Mot de passe, Confidentialité) */}
              <Route path="/settings" element={<SettingsPage />} />

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

          {/* Chatbot IA Local & Report Button */}
          <ChatBot />
          <FloatingReportButton />

          {/* Système de notifications toast — global */}
          <Toast />
          
          {/* PWA Install Prompt */}
          <InstallPWA />
        </div>
      </div>
    </ErrorBoundary>
  )
}
