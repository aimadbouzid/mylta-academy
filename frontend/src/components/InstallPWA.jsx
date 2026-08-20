import React, { useState, useEffect } from 'react';
import { X, Download, Share, PlusSquare, Smartphone, ChevronRight } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import Logo from './Logo';

const DISMISS_KEY = 'pwa-prompt-dismissed';
const DISMISS_TTL_DAYS = 7;

function isDismissed() {
  try {
    const raw = localStorage.getItem(DISMISS_KEY);
    if (!raw) return false;
    const ts = parseInt(raw, 10);
    if (isNaN(ts)) return false;
    return Date.now() - ts < DISMISS_TTL_DAYS * 24 * 60 * 60 * 1000;
  } catch {
    return false;
  }
}

const InstallPWA = () => {
  const { t } = useLanguage();
  const [supportsPWA, setSupportsPWA] = useState(false);
  const [promptInstall, setPromptInstall] = useState(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [dismissed, setDismissed] = useState(true);
  const [visible, setVisible] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    const standaloneMode =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true ||
      document.referrer.includes('android-app://');
    setIsStandalone(standaloneMode);

    if (standaloneMode) return;
    if (isDismissed()) {
      setDismissed(true);
      return;
    }

    const ua = window.navigator.userAgent.toLowerCase();
    const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(ua);
    
    // Disable custom prompt on desktop to avoid UI bugs. 
    // Desktop browsers handle PWA installation natively via the URL bar.
    if (!isMobile) return;

    const iosDevice = /iphone|ipad|ipod/.test(ua) && !ua.includes('crios');
    const androidDevice = /android/.test(ua);
    setIsIOS(iosDevice);
    setIsAndroid(androidDevice);
    
    let promptFired = false;

    if (iosDevice || androidDevice) {
      const timer = setTimeout(() => {
        if (!promptFired) {
          setDismissed(false);
          requestAnimationFrame(() => setVisible(true));
        }
      }, 3000);

      const handler = (e) => {
        e.preventDefault();
        promptFired = true;
        setSupportsPWA(true);
        setPromptInstall(e);
        setDismissed(false);
        requestAnimationFrame(() => setVisible(true));
      };
      
      window.addEventListener('beforeinstallprompt', handler);
      
      const appInstalledHandler = () => {
        setInstalled(true);
        setTimeout(() => setVisible(false), 2000);
      };
      window.addEventListener('appinstalled', appInstalledHandler);

      return () => {
        clearTimeout(timer);
        window.removeEventListener('beforeinstallprompt', handler);
        window.removeEventListener('appinstalled', appInstalledHandler);
      };
    } else {
      const handler = (e) => {
        e.preventDefault();
        setSupportsPWA(true);
        setPromptInstall(e);
        setDismissed(false);
        requestAnimationFrame(() => setVisible(true));
      };
      const appInstalledHandler = () => {
        setInstalled(true);
        setTimeout(() => setVisible(false), 2000);
      };
      window.addEventListener('beforeinstallprompt', handler);
      window.addEventListener('appinstalled', appInstalledHandler);
      return () => {
        window.removeEventListener('beforeinstallprompt', handler);
        window.removeEventListener('appinstalled', appInstalledHandler);
      };
    }
  }, []);

  const onClickInstall = async (evt) => {
    evt.preventDefault();
    if (!promptInstall) return;

    try {
      await promptInstall.prompt();
      const { outcome } = await promptInstall.userChoice;
      if (outcome === 'accepted') {
        setInstalled(true);
        setTimeout(() => setVisible(false), 2000);
      }
    } catch (err) {
      console.warn('[PWA] Install prompt failed:', err);
    }
  };

  const handleDismiss = () => {
    setVisible(false);
    setTimeout(() => {
      setDismissed(true);
      try {
        localStorage.setItem(DISMISS_KEY, String(Date.now()));
      } catch {}
    }, 400);
  };

  if (isStandalone || dismissed) return null;
  if (!supportsPWA && !isIOS) return null;

  if (installed) {
    return (
      <div className={`fixed bottom-0 left-0 right-0 z-[9999] p-4 sm:p-6 transition-all duration-500 ease-out ${visible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}`}>
        <div className="max-w-md mx-auto bg-emerald-500/90 backdrop-blur-xl border border-emerald-400/30 rounded-2xl p-4 flex items-center justify-center gap-3 shadow-[0_20px_60px_rgba(16,185,129,0.3)] text-white font-medium">
          <Smartphone className="w-6 h-6" />
          <span>✅ {t('pwa.success')}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`md:hidden fixed bottom-0 left-0 right-0 z-[9999] p-4 sm:p-6 transition-all duration-700 cubic-bezier(0.16, 1, 0.3, 1) ${visible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}`}>
      <div className="max-w-[420px] mx-auto bg-neutral-900/95 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-[0_30px_100px_rgba(0,0,0,0.4)] p-6 relative overflow-hidden group">
        
        {/* Background ambient glow */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Bouton fermer */}
        <button
          onClick={handleDismiss}
          aria-label="Fermer"
          className="absolute top-4 right-4 p-2 rounded-full bg-white/5 dark:bg-academy-surfaceDark/5 text-white/50 hover:bg-white/10 hover:text-white transition-all z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Section */}
        <div className="flex items-start gap-4 mb-6 relative z-10">
          <div className="w-16 h-16 rounded-2xl bg-black border border-white/10 flex items-center justify-center shrink-0 shadow-lg relative overflow-hidden">
             <img 
               src="/logo-128.png" 
               alt="Mylta Academy" 
               className="w-full h-full object-cover"
               onError={(e) => {
                 e.target.onerror = null; 
                 e.target.src = '/logo-256.png';
               }}
             />
          </div>
          <div className="pt-1">
            <h3 className="font-display font-bold text-white text-lg leading-tight mb-1">
              Installez l'application
            </h3>
            <p className="text-neutral-400 dark:text-academy-textMain/40 text-sm leading-relaxed">
              Pour une expérience 100% optimisée, fluide et hors-ligne.
            </p>
          </div>
        </div>

        {/* iOS Instructions (Premium dark mode UI) */}
        {isIOS ? (
          <div className="bg-black/40 border border-white/5 rounded-2xl p-5 relative z-10">
            <p className="text-[10px] font-bold text-neutral-500 dark:text-academy-textMain/50 uppercase tracking-widest mb-4">
              {t('pwa.ios_how_to')}
            </p>

            <div className="space-y-4">
              {/* Étape 1 */}
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-bold shrink-0 border border-blue-500/30">1</div>
                <div className="text-sm text-neutral-300 flex items-center flex-wrap gap-1.5 leading-relaxed">
                  Appuyez sur l'icône <span className="inline-flex items-center gap-1.5 bg-white/10 dark:bg-academy-surfaceDark/10 text-white px-2.5 py-1 rounded-md text-xs font-semibold border border-white/10"><Share className="w-3.5 h-3.5 text-blue-400" /> Partager</span>
                </div>
              </div>

              {/* Ligne de liaison */}
              <div className="w-px h-4 bg-white/10 dark:bg-academy-surfaceDark/10 ml-3.5 -my-2" />

              {/* Étape 2 */}
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-bold shrink-0 border border-blue-500/30">2</div>
                <div className="text-sm text-neutral-300 flex items-center flex-wrap gap-1.5 leading-relaxed">
                  Sélectionnez <span className="inline-flex items-center gap-1.5 bg-white/10 dark:bg-academy-surfaceDark/10 text-white px-2.5 py-1 rounded-md text-xs font-semibold border border-white/10"><PlusSquare className="w-3.5 h-3.5" /> Sur l'écran d'accueil</span>
                </div>
              </div>
            </div>
          </div>
        ) : isAndroid && !promptInstall ? (
          <div className="bg-black/40 border border-white/5 rounded-2xl p-5 relative z-10">
            <p className="text-[10px] font-bold text-neutral-500 dark:text-academy-textMain/50 uppercase tracking-widest mb-4">
              {t('pwa.android_how_to')}
            </p>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-bold shrink-0 border border-blue-500/30">1</div>
                <div className="text-sm text-neutral-300 flex items-center flex-wrap gap-1.5 leading-relaxed">
                  Appuyez sur le menu <span className="inline-flex items-center gap-1.5 bg-white/10 dark:bg-academy-surfaceDark/10 text-white px-2.5 py-1 rounded-md text-xs font-semibold border border-white/10">⋮ Options</span>
                </div>
              </div>
              <div className="w-px h-4 bg-white/10 dark:bg-academy-surfaceDark/10 ml-3.5 -my-2" />
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-bold shrink-0 border border-blue-500/30">2</div>
                <div className="text-sm text-neutral-300 flex items-center flex-wrap gap-1.5 leading-relaxed">
                  Sélectionnez <span className="inline-flex items-center gap-1.5 bg-white/10 dark:bg-academy-surfaceDark/10 text-white px-2.5 py-1 rounded-md text-xs font-semibold border border-white/10">Ajouter à l'écran d'accueil</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Android / Desktop : Bouton d'installation */
          <button
            onClick={onClickInstall}
            className="w-full relative group z-10 overflow-hidden rounded-2xl p-0.5"
          >
            {/* Animated border gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 opacity-70 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative bg-black/50 backdrop-blur-md px-6 py-4 rounded-2xl flex items-center justify-center gap-2 group-hover:bg-black/40 transition-colors duration-300">
              <Download className="w-5 h-5 text-white" />
              <span className="text-white font-bold text-[15px]">{t('pwa.install_btn')}</span>
            </div>
          </button>
        )}
      </div>
    </div>
  );
};

export default InstallPWA;
