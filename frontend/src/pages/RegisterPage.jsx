import React from 'react'
import Navbar from '../components/Navbar'
import RegistrationForm from '../components/RegistrationForm'
import SEOHead from '../components/SEOHead'
import { useLanguage } from '../context/LanguageContext'

export default function RegisterPage() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-neutral-950 text-academy-textMain flex flex-col justify-between">
      <SEOHead 
        title={t('register.page_title')}
        description={t('register.page_desc')}
        canonicalPath="/register" 
      />
      <Navbar />
      <main className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <RegistrationForm />
      </main>
      <footer className="py-6 text-center text-xs text-neutral-600 border-t border-neutral-900">
        © {new Date().getFullYear()} MYLTA ACADEMY — {t('common.all_rights')}
      </footer>
    </div>
  )
}
