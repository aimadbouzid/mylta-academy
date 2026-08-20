import React, { useState } from 'react';
import { MessageCircle, X, Send, AlertCircle, LogIn, BookOpen, CreditCard, UserPlus, HelpCircle } from 'lucide-react';
import { useSiteSettings } from '../context/SiteSettingsContext';

export default function WhatsAppButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState('');
  const [customMessage, setCustomMessage] = useState('');

  const WHATSAPP_NUMBER = "213795103743";

  const { settings } = useSiteSettings();
  const modules = settings?.modules || {};

  const topics = [
    { id: 'tech', label: 'Problème technique ou bug', icon: AlertCircle, prefix: 'Bonjour, je rencontre un problème technique :' },
    { id: 'login', label: 'Problème de connexion', icon: LogIn, prefix: "Bonjour, je n'arrive pas à me connecter à mon compte." },
    { id: 'course', label: 'Question sur une formation', icon: BookOpen, prefix: "Bonjour, j'ai une question concernant une formation :" },
    { id: 'payment', label: 'Problème de paiement', icon: CreditCard, prefix: 'Bonjour, je rencontre un souci avec mon paiement.' },
  ];

  if (modules.instructorEnabled !== false) {
    topics.push({ id: 'instructor', label: 'Devenir formateur', icon: UserPlus, prefix: 'Bonjour, je souhaite postuler pour devenir formateur.' });
  }

  topics.push({ id: 'other', label: 'Autre demande', icon: HelpCircle, prefix: 'Bonjour,' });

  const handleSend = (e) => {
    e.preventDefault();
    if (!selectedTopic) return;
    
    const topic = topics.find(t => t.id === selectedTopic);
    let finalMessage = topic.prefix;
    if (customMessage.trim()) {
      finalMessage += `\n\n${customMessage.trim()}`;
    }

    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(finalMessage)}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    setIsOpen(false);
    setSelectedTopic('');
    setCustomMessage('');
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 bg-green-500 text-white rounded-full shadow-xl shadow-green-500/30 hover:bg-green-600 transition-all hover:-translate-y-1 group"
        aria-label="Contactez-nous sur WhatsApp"
      >
        {/* Animation de pulse */}
        <div className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-20 group-hover:opacity-0" />
        
        <div className="relative z-10 flex items-center justify-center">
          <MessageCircle size={28} />
        </div>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in" onClick={() => setIsOpen(false)}>
          <div 
            className="w-full max-w-md bg-white dark:bg-academy-surfaceDark rounded-3xl shadow-2xl overflow-hidden animate-fade-up max-h-[90vh] flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-5 border-b border-gray-100 dark:border-academy-border flex items-center justify-between bg-green-50 dark:bg-green-500/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white">
                  <MessageCircle size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-academy-textMain">Assistance WhatsApp</h3>
                  <p className="text-xs text-green-600 dark:text-green-400 font-medium">Réponse rapide</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 text-gray-400 dark:text-academy-textMain/40 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 hide-scrollbar">
              <p className="text-sm font-semibold text-gray-700 dark:text-academy-textMain/75 mb-4">De quoi s'agit-il ?</p>
              
              <div className="space-y-2 mb-6">
                {topics.map(topic => {
                  const Icon = topic.icon;
                  const isSelected = selectedTopic === topic.id;
                  return (
                    <button
                      key={topic.id}
                      type="button"
                      onClick={() => setSelectedTopic(topic.id)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all duration-200 ${
                        isSelected 
                          ? 'border-green-500 bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-300 shadow-sm' 
                          : 'border-gray-200 dark:border-academy-border hover:border-green-300 hover:bg-green-50/50 text-gray-700 dark:text-academy-textMain/75'
                      }`}
                    >
                      <Icon size={18} className={isSelected ? 'text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-academy-textMain/40'} />
                      <span className="text-sm font-medium">{topic.label}</span>
                    </button>
                  );
                })}
              </div>

              {selectedTopic && (
                <div className="animate-fade-in">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-academy-textMain/75 mb-2">
                    Précisez votre demande (optionnel)
                  </label>
                  <textarea
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    placeholder="Détaillez votre problème ici..."
                    className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-academy-border rounded-xl p-3 text-sm focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 resize-none h-24 transition-all"
                  />
                </div>
              )}
            </div>

            <div className="p-5 border-t border-gray-100 dark:border-academy-border bg-gray-50 dark:bg-white/5">
              <button
                onClick={handleSend}
                disabled={!selectedTopic}
                className="w-full flex items-center justify-center gap-2 py-3 bg-green-500 text-white rounded-xl font-bold hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send size={18} />
                <span>Envoyer sur WhatsApp</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
