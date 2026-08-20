import React, { useState } from 'react';
import { Star, X, MessageSquareHeart } from 'lucide-react';
import api from '../api/axios';
import { useToast } from '../hooks/useToast';

const RATING_LABELS = {
  1: "Décevant 😞",
  2: "Moyen 😕",
  3: "Correct 🙂",
  4: "Très bien ! 😊",
  5: "Excellent ! 🤩"
};

export default function LeaveReviewModal({ courseId, courseName, onClose }) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const { success, error: toastError } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      toastError("Veuillez sélectionner une note entre 1 et 5 étoiles.");
      return;
    }
    
    setSubmitting(true);
    try {
      await api.post(`/courses/${courseId}/reviews`, { rating, comment: '' });
      success("Merci pour votre avis ! Il a été enregistré.");
      onClose();
    } catch (err) {
      toastError(err.response?.data?.error || "Erreur lors de l'envoi de l'avis.");
    } finally {
      setSubmitting(false);
    }
  };

  const currentVal = hoverRating || rating;

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative max-w-md w-full bg-gradient-to-b from-neutral-900 to-black border border-white/10 rounded-3xl p-8 shadow-2xl animate-fade-up z-10">
        <button 
          onClick={onClose} 
          className="absolute -top-4 -right-4 w-10 h-10 bg-neutral-800 rounded-full flex items-center justify-center text-neutral-400 dark:text-academy-textMain/40 hover:text-white border border-white/10 shadow-lg transition-transform hover:scale-110"
        >
          <X size={20} />
        </button>
        
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-yellow-500/20 shadow-inner">
            <MessageSquareHeart size={32} className="text-yellow-500" />
          </div>
          <h2 className="font-display font-bold text-3xl text-white mb-2 tracking-tight">
            Votre Avis Compte
          </h2>
          <p className="text-neutral-400 dark:text-academy-textMain/40 text-sm px-4">
            Qu'avez-vous pensé de la formation <br/><strong className="text-white">{courseName}</strong> ?
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div>
            <div className="flex justify-center gap-3 mb-3">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                  className="focus:outline-none transition-transform hover:scale-125 duration-200"
                >
                  <Star 
                    size={44} 
                    className={`transition-all duration-300 drop-shadow-md ${(hoverRating || rating) >= star ? 'text-yellow-400 fill-yellow-400 scale-110' : 'text-neutral-700 dark:text-academy-textMain/75 hover:text-neutral-500'}`}
                  />
                </button>
              ))}
            </div>
            <div className="h-6 text-center">
              {currentVal > 0 && (
                <span className="text-yellow-400 font-bold text-sm animate-fade-up">
                  {RATING_LABELS[currentVal]}
                </span>
              )}
            </div>
          </div>

          <button 
            type="submit"
            disabled={submitting}
            className="w-full bg-gradient-to-r from-yellow-500 to-yellow-400 hover:from-yellow-400 hover:to-yellow-300 text-black font-extrabold text-lg py-4 px-6 rounded-2xl transition-all transform hover:scale-[1.02] shadow-xl shadow-yellow-500/20 disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2"
          >
            {submitting ? 'Envoi en cours...' : 'Publier mon avis'}
          </button>
        </form>
      </div>
    </div>
  );
}
