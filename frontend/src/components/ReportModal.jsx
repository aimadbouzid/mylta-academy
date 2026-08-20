import { useState } from 'react';
import { X, AlertTriangle, MessageCircle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function ReportModal({ isOpen, onClose }) {
  const { t, currentLang } = useLanguage();
  const [selectedTopic, setSelectedTopic] = useState('');
  const [details, setDetails] = useState('');

  if (!isOpen) return null;

  const topics = [
    { id: 'payment', label: t('report.topics.payment') || 'Problème de paiement / Reçu' },
    { id: 'access', label: t('report.topics.access') || 'Impossible d\'accéder à ma formation' },
    { id: 'bug', label: t('report.topics.bug') || 'J\'ai trouvé un bug sur le site' },
    { id: 'behavior', label: t('report.topics.behavior') || 'Signaler un comportement inapproprié' },
    { id: 'other', label: t('report.topics.other') || 'Autre problème' }
  ];

  const handleSend = () => {
    if (!selectedTopic) {
      alert(t('report.select_subject') || 'Veuillez sélectionner le sujet de votre signalement.');
      return;
    }

    const topicLabel = topics.find(t => t.id === selectedTopic)?.label || selectedTopic;
    const title = t('report.whatsapp_title') || '🚨 *Nouveau Signalement*';
    const subjLine = t('report.whatsapp_subject') || '*Sujet:*';
    const detsLine = t('report.whatsapp_details') || '*Détails:*';
    
    let text = `${title}\n\n${subjLine} ${topicLabel}\n`;
    if (details.trim()) {
      text += `${detsLine} ${details.trim()}`;
    }

    const encodedText = encodeURIComponent(text);
    const whatsappUrl = `https://wa.me/213795103743?text=${encodedText}`;
    window.open(whatsappUrl, '_blank');
    onClose();
    
    // Reset state after close
    setTimeout(() => {
      setSelectedTopic('');
      setDetails('');
    }, 300);
  };

  const isRtl = currentLang === 'ar';

  return (
    <div className={`fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 ${isRtl ? 'dir-rtl' : 'dir-ltr'}`}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-md max-h-[95vh] flex flex-col bg-white dark:bg-academy-surfaceDark rounded-2xl shadow-2xl overflow-hidden animate-fade-up">
        {/* Header */}
        <div className="bg-red-50 dark:bg-red-500/10 p-4 sm:p-6 flex items-start justify-between border-b border-red-100 dark:border-red-500/20 flex-shrink-0">
          <div className="flex gap-4">
            <div className="w-12 h-12 bg-red-100 dark:bg-red-500/15 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center shrink-0">
              <AlertTriangle size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-red-900">{t('report.title') || 'Signaler un problème'}</h3>
              <p className="text-xs text-red-700/80 mt-1 leading-relaxed">
                {t('report.desc') || 'Aidez-nous à améliorer la plateforme. Votre signalement sera pré-rempli et envoyé directement à notre équipe via WhatsApp.'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-red-400 hover:text-red-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-academy-textMain/75 mb-2">{t('report.subject_label') || 'Quel est le sujet ? *'}</label>
            <div className="space-y-2">
              {topics.map(topic => (
                <label key={topic.id} className={`flex items-center gap-3 p-2.5 rounded-xl border cursor-pointer transition-all ${selectedTopic === topic.id ? 'bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/25 text-red-800 dark:text-red-300' : 'bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-academy-border text-gray-600 dark:text-academy-textMain/60 hover:bg-gray-100'}`}>
                  <input
                    type="radio"
                    name="report_topic"
                    value={topic.id}
                    checked={selectedTopic === topic.id}
                    onChange={(e) => setSelectedTopic(e.target.value)}
                    className="w-4 h-4 text-red-600 dark:text-red-400 focus:ring-red-500"
                  />
                  <span className="text-sm font-medium">{topic.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-academy-textMain/75 mb-2">{t('report.details_label') || 'Détails supplémentaires (Optionnel)'}</label>
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder={t('report.details_placeholder') || 'Décrivez votre problème en quelques mots...'}
              className="w-full h-20 p-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-academy-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 resize-none transition-all text-gray-800 dark:text-academy-textMain/85"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-6 bg-gray-50 dark:bg-white/5 border-t border-gray-100 dark:border-academy-border flex justify-end gap-3 flex-shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-bold text-gray-600 dark:text-academy-textMain/60 hover:text-gray-800 transition-colors"
          >
            {t('report.cancel') || 'Annuler'}
          </button>
          <button
            onClick={handleSend}
            disabled={!selectedTopic}
            className={`flex items-center gap-2 px-6 py-2.5 bg-[#25D366] hover:bg-[#128C7E] disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold rounded-xl shadow-lg shadow-[#25D366]/30 transition-all active:scale-95 ${isRtl ? 'flex-row-reverse' : ''}`}
          >
            <MessageCircle size={18} />
            {t('report.send') || 'Envoyer sur WhatsApp'}
          </button>
        </div>
      </div>
    </div>
  );
}
