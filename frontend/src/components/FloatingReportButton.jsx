import { useState } from 'react';
import { Bot, AlertTriangle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import ReportModal from './ReportModal';

export default function FloatingReportButton() {
  const { t, currentLang } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-32 right-6 z-[90] flex items-center justify-center w-14 h-14 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-[0_0_15px_rgba(220,38,38,0.5)] hover:-translate-y-1 transition-all duration-300 group border border-red-500"
        title={t('report.title') || 'Signaler un problème'}
      >
        <div className="relative">
          <Bot size={28} className="group-hover:animate-bounce" />
          <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-yellow-400 rounded-full animate-pulse border border-red-600"></div>
        </div>
      </button>

      <ReportModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
