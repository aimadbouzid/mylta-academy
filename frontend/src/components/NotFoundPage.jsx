import { Link } from 'react-router-dom'
import { Home } from 'lucide-react'
import SEOHead from './SEOHead' // We will put SEOHead in components
import { useLanguage } from '../context/LanguageContext'

export default function NotFoundPage() {
  const { t } = useLanguage()
  return (
    <div className="min-h-screen bg-academy-surface flex flex-col items-center justify-center p-4">
      <SEOHead title={t('not_found.title')} description={t('not_found.description')} canonicalPath="/404" />
      <div className="text-center max-w-lg">
        <h1 className="text-9xl font-black text-academy-primary mb-4 drop-shadow-sm">404</h1>
        <h2 className="text-2xl font-bold text-academy-textMain mb-4">{t('not_found.heading')}</h2>
        <p className="text-academy-textMain/60 mb-8">
          {t('not_found.description')}
        </p>
        <Link to="/" className="btn-primary inline-flex items-center gap-2">
          <Home size={18} />
          {t('not_found.back_home')}
        </Link>
      </div>
    </div>
  )
}
