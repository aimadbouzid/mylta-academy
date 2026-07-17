import React, { useState } from 'react';
import axios from 'axios';
import { User, Mail, Phone, UploadCloud, CheckCircle, FileText, X, Loader2, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

/**
 * Composant RegistrationForm pour la plateforme "MYLTA ACADEMY"
 * Permet aux utilisateurs de s'inscrire et de téléverser leur preuve de paiement (Reçu).
 * Design sombre, minimaliste et premium.
 */
const RegistrationForm = ({ onSuccess }) => {
  const { t } = useLanguage();
  // États du formulaire
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
  });
  const [receiptFile, setReceiptFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Gestion du changement des champs textuels
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError(null);
  };

  // Traitement et vérification du fichier sélectionné
  const handleFileSelect = (file) => {
    if (!file) return;

    // Validation du type de fichier (Images ou PDF)
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      setError(t('register.file_error'));
      return;
    }

    // Validation de la taille (ex: max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError(t('register.file_too_large'));
      return;
    }

    setError(null);
    setReceiptFile(file);
  };

  // Gestion de l'input d'upload classique
  const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    handleFileSelect(file);
  };

  // Gestion du Drag & Drop
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleFileSelect(file);
  };

  // Supprimer le fichier sélectionné
  const handleRemoveFile = () => {
    setReceiptFile(null);
  };

  // Soumission du formulaire (Compatible Multer / multipart/form-data)
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!receiptFile) {
      setError(t('register.receipt_required'));
      return;
    }

    setLoading(true);
    setError(null);

    try {
      /*
       * -----------------------------------------------------------------------
       * LOGIQUE DE TRANSMISSION VIA MULTIPART/FORM-DATA (MULTER BACKEND)
       * -----------------------------------------------------------------------
       * Pour envoyer un fichier aux côtés de données textuelles vers un backend Node/Express
       * utilisant le middleware 'multer', nous devons construire un objet FormData.
       */
      const data = new FormData();
      data.append('fullName', formData.fullName);
      data.append('email', formData.email);
      data.append('phone', formData.phone);
      
      // La clé 'receipt' doit correspondre au nom attendu par Multer dans votre route Express 
      // Exemple backend : upload.single('receipt')
      data.append('receipt', receiptFile);

      /*
       * Exemple d'appel API avec Axios :
       * Note : Axios définit automatiquement le header 'Content-Type' avec le bon boundary
       * lorsque vous lui passez une instance de FormData.
       */
      
      // const response = await axios.post('/api/register', data, {
      //   headers: {
      //     'Content-Type': 'multipart/form-data', // Facultatif mais explicite
      //   },
      // });

      // Simulation d'attente réseau pour la démonstration (1.5 sec)
      await new Promise((resolve) => setTimeout(resolve, 1500));

      setIsSubmitted(true);
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error('Erreur lors de la soumission :', err);
      setError(
        err.response?.data?.message ||
          t('common.error')
      );
    } finally {
      setLoading(false);
    }
  };

  // Écran de succès post-soumission
  if (isSubmitted) {
    return (
      <div className="w-full max-w-xl mx-auto bg-neutral-950 border border-neutral-800/80 rounded-2xl p-8 text-center shadow-2xl backdrop-blur-sm animate-fade-in">
        <div className="w-16 h-16 bg-blue-500/10 border border-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-8 h-8 text-blue-400" />
        </div>
        <h3 className="text-2xl font-bold text-academy-textMain mb-2 tracking-tight">
          {t('register.success_title')}
        </h3>
        <p className="text-neutral-400 mb-6 text-sm leading-relaxed">
          Merci <span className="text-academy-textMain font-medium">{formData.fullName}</span>. {t('register.success_desc')} <strong className="text-blue-400">MYLTA ACADEMY</strong>. {t('register.success_email')}
        </p>
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-neutral-900 border border-neutral-800 text-xs text-neutral-400">
          <ShieldCheck className="w-4 h-4 text-blue-400" />
          {t('register.verifying')}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-xl mx-auto bg-neutral-950 border border-neutral-800/80 rounded-2xl p-6 sm:p-10 shadow-2xl backdrop-blur-md">
      {/* 1. En-tête du formulaire */}
      <div className="text-center mb-8">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-academy-textMain tracking-wider uppercase mb-3">
          {t('register.title')}
        </h2>
        <p className="text-neutral-400 text-sm sm:text-base leading-relaxed max-w-md mx-auto">
          {t('register.subtitle')}
        </p>
      </div>

      {/* Message d'erreur global */}
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-start justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-red-400 hover:text-red-300">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 2. Le Formulaire */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Champ Nom Complet */}
        <div>
          <label htmlFor="fullName" className="block text-xs font-medium text-neutral-300 uppercase tracking-wider mb-2">
            {t('register.full_name')}
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500">
              <User className="w-5 h-5" />
            </div>
            <input
              type="text"
              id="fullName"
              name="fullName"
              required
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Ex: Sarah Benali"
              className="w-full pl-11 pr-4 py-3.5 bg-neutral-900 border border-neutral-800 rounded-xl text-academy-textMain placeholder-neutral-600 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-200"
            />
          </div>
        </div>

        {/* Champ Adresse Email */}
        <div>
          <label htmlFor="email" className="block text-xs font-medium text-neutral-300 uppercase tracking-wider mb-2">
            {t('register.email')}
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500">
              <Mail className="w-5 h-5" />
            </div>
            <input
              type="email"
              id="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="sarah.benali@example.com"
              className="w-full pl-11 pr-4 py-3.5 bg-neutral-900 border border-neutral-800 rounded-xl text-academy-textMain placeholder-neutral-600 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-200"
            />
          </div>
        </div>

        {/* Champ Numéro de Téléphone */}
        <div>
          <label htmlFor="phone" className="block text-xs font-medium text-neutral-300 uppercase tracking-wider mb-2">
            {t('register.phone')}
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500">
              <Phone className="w-5 h-5" />
            </div>
            <input
              type="tel"
              id="phone"
              name="phone"
              required
              value={formData.phone}
              onChange={handleChange}
              placeholder="06 12 34 56 78"
              className="w-full pl-11 pr-4 py-3.5 bg-neutral-900 border border-neutral-800 rounded-xl text-academy-textMain placeholder-neutral-600 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-200"
            />
          </div>
        </div>

        {/* Zone d'Upload de Fichier (Reçu) */}
        <div>
          <label className="block text-xs font-medium text-neutral-300 uppercase tracking-wider mb-2">
            {t('register.receipt')}
          </label>
          
          <input
            type="file"
            id="receipt-upload"
            accept="image/*,.pdf"
            onChange={handleFileInputChange}
            className="hidden"
          />

          {!receiptFile ? (
            <label
              htmlFor="receipt-upload"
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`flex flex-col items-center justify-center w-full h-40 px-4 transition-all duration-200 border-2 border-dashed rounded-xl cursor-pointer bg-neutral-900/50 hover:bg-neutral-900 ${
                isDragging
                  ? 'border-blue-500 bg-blue-500/10'
                  : 'border-neutral-800 hover:border-neutral-700'
              }`}
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center">
                <div className="w-12 h-12 mb-3 rounded-full bg-neutral-800/80 flex items-center justify-center text-neutral-400 group-hover:text-academy-textMain transition-colors">
                  <UploadCloud className="w-6 h-6 text-neutral-400" />
                </div>
                <p className="mb-1 text-sm text-neutral-300">
                  <span className="font-semibold text-blue-400">{t('register.upload_click')}</span> {t('register.upload_drop')}
                </p>
                <p className="text-xs text-neutral-500">
                  {t('register.upload_formats')}
                </p>
              </div>
            </label>
          ) : (
            /* Affichage du fichier sélectionné */
            <div className="flex items-center justify-between p-4 bg-neutral-900 border border-blue-500/30 rounded-xl">
              <div className="flex items-center space-x-3 truncate">
                <div className="p-2.5 rounded-lg bg-blue-500/10 text-blue-400 flex-shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="truncate">
                  <p className="text-sm font-medium text-academy-textMain truncate">
                    {receiptFile.name}
                  </p>
                  <p className="text-xs text-neutral-500">
                    {(receiptFile.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleRemoveFile}
                className="p-2 text-neutral-400 hover:text-academy-textMain rounded-lg hover:bg-neutral-800 transition-colors"
                title="Supprimer le fichier"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>

        {/* 3. Bouton de Soumission */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 px-6 mt-4 bg-blue-600 hover:bg-blue-500 text-academy-textMain font-semibold rounded-xl shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_25px_rgba(59,130,246,0.5)] transition-all duration-300 flex items-center justify-center space-x-2 text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin text-academy-textMain" />
              <span>{t('register.processing')}</span>
            </>
          ) : (
            <span>{t('register.submit')}</span>
          )}
        </button>
      </form>
    </div>
  );
};

export default RegistrationForm;
