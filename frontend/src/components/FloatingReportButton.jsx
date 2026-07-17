import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import ReportModal from './ReportModal';

export default function FloatingReportButton() {
  const { t, currentLang } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-[96px] right-6 z-[90] flex items-center justify-center w-14 h-14 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-xl hover:scale-110 transition-transform hover:shadow-red-600/30 group"
        title={t('report.title') || 'Signaler un problème'}
      >
        <AlertTriangle size={24} className="group-hover:animate-bounce" />
      </button>

      <ReportModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
