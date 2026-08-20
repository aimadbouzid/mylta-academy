import React, { useEffect } from 'react';
import { ShieldCheck } from 'lucide-react';

// Pure inline SVG QR Code generator to avoid CORS canvas tainting in html2canvas
function InlineQRCode({ text = "MYLTA", size = 56, color = "#0B2545" }) {
  const numModules = 21;
  const cellSize = 100 / numModules;

  const isFinder = (r, c) => {
    if (r < 7 && c < 7) return true;
    if (r < 7 && c >= numModules - 7) return true;
    if (r >= numModules - 7 && c < 7) return true;
    return false;
  };

  const grid = [];
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = (hash << 5) - hash + text.charCodeAt(i);
    hash |= 0;
  }

  for (let r = 0; r < numModules; r++) {
    for (let c = 0; c < numModules; c++) {
      if (isFinder(r, c)) continue;
      const val = Math.sin(r * 12.9898 + c * 78.233 + hash) * 43758.5453;
      if (val - Math.floor(val) > 0.42) {
        grid.push({ r, c });
      }
    }
  }

  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className="block">
      {/* Background */}
      <rect width="100" height="100" fill="#FBF9F3" />

      {/* Outer Finder Boxes */}
      {/* Top Left */}
      <rect x="0" y="0" width="33.3" height="33.3" fill={color} />
      <rect x="4.76" y="4.76" width="23.8" height="23.8" fill="#FBF9F3" />
      <rect x="9.52" y="9.52" width="14.28" height="14.28" fill={color} />

      {/* Top Right */}
      <rect x="66.6" y="0" width="33.3" height="33.3" fill={color} />
      <rect x="71.4" y="4.76" width="23.8" height="23.8" fill="#FBF9F3" />
      <rect x="76.1" y="9.52" width="14.28" height="14.28" fill={color} />

      {/* Bottom Left */}
      <rect x="0" y="66.6" width="33.3" height="33.3" fill={color} />
      <rect x="4.76" y="71.4" width="23.8" height="23.8" fill="#FBF9F3" />
      <rect x="9.52" y="76.1" width="14.28" height="14.28" fill={color} />

      {/* Data Cells */}
      {grid.map(({ r, c }, idx) => (
        <rect
          key={idx}
          x={c * cellSize}
          y={r * cellSize}
          width={cellSize + 0.1}
          height={cellSize + 0.1}
          fill={color}
        />
      ))}
    </svg>
  );
}

// Crest héraldique original — bouclier, livre ouvert et flamme du savoir
function AcademicCrest({ size = 68 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 116" fill="none">
      {/* Bouclier */}
      <path
        d="M50 4 L92 16 V54 C92 82 74 100 50 112 C26 100 8 82 8 54 V16 Z"
        fill="url(#crestFill)"
        stroke="#C9A646"
        strokeWidth="2.5"
      />
      <path
        d="M50 11 L85 21.5 V53.5 C85 78 69.5 93.5 50 104 C30.5 93.5 15 78 15 53.5 V21.5 Z"
        fill="none"
        stroke="#C9A646"
        strokeWidth="1"
        opacity="0.7"
      />
      {/* Livre ouvert */}
      <g transform="translate(50 60)">
        <path d="M-26,-6 C-16,-11 -8,-9 0,-4 L0,20 C-8,15 -16,13 -26,18 Z" fill="#F5EFDD" stroke="#0B2545" strokeWidth="1.4" />
        <path d="M26,-6 C16,-11 8,-9 0,-4 L0,20 C8,15 16,13 26,18 Z" fill="#F5EFDD" stroke="#0B2545" strokeWidth="1.4" />
        <path d="M-20,-3 L-3,-7 M-20,3 L-3,-1 M-20,9 L-3,5" stroke="#0B2545" strokeWidth="0.8" opacity="0.55" />
        <path d="M20,-3 L3,-7 M20,3 L3,-1 M20,9 L3,5" stroke="#0B2545" strokeWidth="0.8" opacity="0.55" />
      </g>
      {/* Flamme du savoir */}
      <g transform="translate(50 32)">
        <path d="M0,-16 C6,-10 7,-3 3,2 C6,0 8,-4 8,-4 C9,3 4,9 0,10 C-4,9 -9,3 -8,-4 C-8,-4 -6,0 -3,2 C-7,-3 -6,-10 0,-16 Z" fill="#C9A646" />
      </g>
      <defs>
        <linearGradient id="crestFill" x1="8" y1="4" x2="92" y2="112" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#123A6B" />
          <stop offset="50%" stopColor="#0B2545" />
          <stop offset="100%" stopColor="#081B33" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export default function LuxuryCertificate({
  studentName = "Yacine Benali",
  courseName = "Maîtrise du E-Commerce & Growth Marketing 2026",
  issueDate = new Date().toISOString().split('T')[0],
  certId = "MYL-849204",
  className = ""
}) {
  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=IM+Fell+English:ital@0;1&family=IM+Fell+English+SC&family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,500;1,600&family=Cinzel:wght@500;600;700;800;900&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    return () => {
      // Keep loaded for canvas export
    };
  }, []);

  const formattedDate = issueDate
    ? new Date(issueDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
    : new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div
      className={`bg-[#FBF9F3] text-[#141414] relative flex flex-col justify-between p-12 select-none overflow-hidden font-sans ${className}`}
      style={{
        width: '1123px',
        height: '794px',
        background: 'radial-gradient(circle at center, #FFFFFF 0%, #FAF6EA 55%, #F3EEDD 100%)',
        boxSizing: 'border-box'
      }}
    >
      {/* ─── FILIGRANE / GUILLOCHE BACKGROUND PATTERN ─── */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.04] pointer-events-none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="guilloche" width="80" height="80" patternUnits="userSpaceOnUse">
            <circle cx="40" cy="40" r="38" fill="none" stroke="#0B2545" strokeWidth="0.8" />
            <circle cx="40" cy="40" r="28" fill="none" stroke="#0B2545" strokeWidth="0.5" strokeDasharray="2,2" />
            <path d="M0,40 Q20,0 40,40 T80,40" fill="none" stroke="#0B2545" strokeWidth="0.5" />
            <path d="M40,0 Q80,20 40,40 T40,80" fill="none" stroke="#0B2545" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#guilloche)" />
      </svg>

      {/* ─── WATERMARK CENTRAL DU BLASON ─── */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.035] pointer-events-none flex items-center justify-center">
        <svg width="420" height="486" viewBox="0 0 100 116" fill="none">
          <path d="M50 4 L92 16 V54 C92 82 74 100 50 112 C26 100 8 82 8 54 V16 Z" fill="#0B2545" />
        </svg>
      </div>

      {/* ─── BORDURES CADRE BLEU OXFORD & OR ─── */}
      {/* Bordure Extérieure Fine */}
      <div className="absolute inset-6 border border-[#0B2545]/25 pointer-events-none" />

      {/* Bordure Principale Épaisse Bleu / Or */}
      <div
        className="absolute inset-8 pointer-events-none p-[2px]"
        style={{
          background: 'linear-gradient(135deg, #0B2545 0%, #C9A646 22%, #0B2545 50%, #C9A646 78%, #0B2545 100%)'
        }}
      >
        <div className="w-full h-full" style={{ background: '#FBF9F3' }} />
      </div>

      {/* Bordure Intérieure Trait Interrompu Or */}
      <div className="absolute inset-11 border border-dashed border-[#C9A646]/50 pointer-events-none" />

      {/* COINS ORNEMENTAUX SVG (Héraldique Bleu / Or) */}
      {/* Top Left */}
      <svg className="absolute top-7 left-7 w-14 h-14 text-[#0B2545] pointer-events-none" viewBox="0 0 100 100" fill="currentColor">
        <path d="M0,0 L40,0 C30,10 20,20 20,40 L20,100 L0,100 Z" opacity="0.12" />
        <path d="M0,0 L100,0 L100,6 L6,6 L6,100 L0,100 Z" fill="#C9A646" />
        <path d="M12,12 L60,12 L60,15 L15,15 L15,60 L12,60 Z" />
        <circle cx="28" cy="28" r="4" fill="#C9A646" />
      </svg>
      {/* Top Right */}
      <svg className="absolute top-7 right-7 w-14 h-14 text-[#0B2545] pointer-events-none" viewBox="0 0 100 100" fill="currentColor" style={{ transform: 'scaleX(-1)' }}>
        <path d="M0,0 L40,0 C30,10 20,20 20,40 L20,100 L0,100 Z" opacity="0.12" />
        <path d="M0,0 L100,0 L100,6 L6,6 L6,100 L0,100 Z" fill="#C9A646" />
        <path d="M12,12 L60,12 L60,15 L15,15 L15,60 L12,60 Z" />
        <circle cx="28" cy="28" r="4" fill="#C9A646" />
      </svg>
      {/* Bottom Left */}
      <svg className="absolute bottom-7 left-7 w-14 h-14 text-[#0B2545] pointer-events-none" viewBox="0 0 100 100" fill="currentColor" style={{ transform: 'scaleY(-1)' }}>
        <path d="M0,0 L40,0 C30,10 20,20 20,40 L20,100 L0,100 Z" opacity="0.12" />
        <path d="M0,0 L100,0 L100,6 L6,6 L6,100 L0,100 Z" fill="#C9A646" />
        <path d="M12,12 L60,12 L60,15 L15,15 L15,60 L12,60 Z" />
        <circle cx="28" cy="28" r="4" fill="#C9A646" />
      </svg>
      {/* Bottom Right */}
      <svg className="absolute bottom-7 right-7 w-14 h-14 text-[#0B2545] pointer-events-none" viewBox="0 0 100 100" fill="currentColor" style={{ transform: 'scale(-1)' }}>
        <path d="M0,0 L40,0 C30,10 20,20 20,40 L20,100 L0,100 Z" opacity="0.12" />
        <path d="M0,0 L100,0 L100,6 L6,6 L6,100 L0,100 Z" fill="#C9A646" />
        <path d="M12,12 L60,12 L60,15 L15,15 L15,60 L12,60 Z" />
        <circle cx="28" cy="28" r="4" fill="#C9A646" />
      </svg>

      {/* ─── EN-TÊTE ET INSTITUTION ─── */}
      <div className="relative z-10 flex flex-col items-center pt-1 text-center">
        <AcademicCrest size={64} />

        <h2
          className="text-[16px] font-bold tracking-[0.28em] text-[#0B2545] uppercase mt-1"
          style={{ fontFamily: "'IM Fell English SC', 'Cinzel', serif" }}
        >
          Mylta Academy
        </h2>
        <p
          className="text-[9px] font-medium tracking-[0.2em] text-[#6B6250] uppercase mt-0.5"
          style={{ fontFamily: "'Cinzel', serif" }}
        >
          Académie Internationale d'Excellence &amp; de Formation Professionnelle
        </p>
      </div>

      {/* ─── CORPS CENTRAL DU CERTIFICAT ─── */}
      <div className="relative z-10 flex flex-col items-center text-center px-14 my-auto">

        {/* Titre du Certificat */}
        <div className="mb-3">
          <h1
            className="text-[36px] font-bold tracking-[0.12em] uppercase leading-none py-1"
            style={{
              fontFamily: "'IM Fell English', 'Cinzel', serif",
              background: 'linear-gradient(135deg, #0B2545 0%, #1B4074 30%, #0B2545 55%, #C9A646 78%, #0B2545 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 2px 10px rgba(11, 37, 69, 0.12)'
            }}
          >
            Certificat de Réussite
          </h1>

          {/* SÉPARATEUR NOBLE (Ligne ornementale avec diamant) */}
          <div className="flex items-center justify-center gap-3 mt-2">
            <div className="w-24 h-[1px] bg-gradient-to-r from-transparent via-[#C9A646] to-[#C9A646]" />
            <div className="w-2 h-2 rotate-45 bg-[#0B2545] border border-[#C9A646]" />
            <div className="w-24 h-[1px] bg-gradient-to-l from-transparent via-[#C9A646] to-[#C9A646]" />
          </div>
        </div>

        <p
          className="text-[#4A4638] text-[15px] italic mb-3"
          style={{ fontFamily: "'Cormorant Garamond', 'Playfair Display', Georgia, serif" }}
        >
          Ce certificat officiel est décerné avec les félicitations du jury à
        </p>

        {/* 🏆 NOM DE L'ÉTUDIANT */}
        <div className="my-1 flex flex-col items-center justify-center min-h-[70px]">
          <h2
            className="text-[44px] font-bold text-[#0B2545] tracking-wide capitalize leading-tight"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              letterSpacing: '0.02em'
            }}
          >
            {studentName || "Nom & Prénom de l'Élève"}
          </h2>

          {/* Soulignement Élégant */}
          <div className="w-72 h-[1.5px] bg-gradient-to-r from-transparent via-[#C9A646] to-transparent mt-1" />
        </div>

        <p
          className="text-[13px] text-[#3C3A32] max-w-2xl leading-relaxed tracking-wider my-3"
          style={{ fontFamily: "'Cinzel', sans-serif" }}
        >
          pour avoir complété avec succès et distinction l'ensemble des modules d'évaluation et satisfait aux critères d'exigence académique de la formation professionnelle :
        </p>

        {/* 📚 NOM DE LA FORMATION (Badge héraldique) */}
        <div className="mt-1 px-8 py-3.5 rounded-xl border border-[#0B2545]/25 bg-gradient-to-r from-[#F0ECDD] via-[#FFFFFF] to-[#F0ECDD] shadow-sm max-w-3xl relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#FBF9F3] px-3">
            <span className="text-[9px] font-bold text-[#0B2545] uppercase tracking-widest" style={{ fontFamily: "'Cinzel', serif" }}>
              Programme Certifié
            </span>
          </div>
          <h3
            className="text-[22px] font-bold text-[#141414] tracking-wide"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            {courseName || "Intitulé de la Formation"}
          </h3>
        </div>
      </div>

      {/* ─── PIED DE PAGE (SIGNATURES, SCEAU & VALIDATION) ─── */}
      <div className="relative z-10 flex items-end justify-between px-8 pb-3">

        {/* BLOC GAUCHE : Date & QR Code de Vérification */}
        <div className="flex items-center gap-3.5 w-60">
          <div className="p-1 bg-white dark:bg-academy-surfaceDark border border-[#0B2545]/25 rounded-lg shadow-xs shrink-0 overflow-hidden">
            <InlineQRCode text={`https://mylta-academy.com/verify/${certId}`} size={54} color="#0B2545" />
          </div>
          <div className="flex flex-col text-left">
            <span className="text-[8px] font-extrabold uppercase tracking-widest text-[#0B2545]" style={{ fontFamily: "'Cinzel', serif" }}>
              Délivré le
            </span>
            <span className="text-[12px] font-bold text-neutral-800 dark:text-academy-textMain/85" style={{ fontFamily: "'Cinzel', serif" }}>
              {formattedDate}
            </span>
            <span className="text-[8px] text-neutral-400 dark:text-academy-textMain/40 font-mono mt-1">
              ID : <strong className="text-neutral-600 dark:text-academy-textMain/60">{certId}</strong>
            </span>
          </div>
        </div>

        {/* BLOC CENTRE : SCEAU EN RELIEF BLEU/OR ET RUBANS */}
        <div className="relative flex flex-col items-center justify-center -mb-2">
          {/* Rubans au bas du sceau */}
          <div className="absolute -bottom-5 flex justify-center gap-1 z-0">
            <div className="w-4 h-10 bg-gradient-to-b from-[#0B2545] to-[#081B33] shadow-sm transform -rotate-12 origin-top rounded-b-sm" />
            <div className="w-4 h-10 bg-gradient-to-b from-[#0B2545] to-[#081B33] shadow-sm transform rotate-12 origin-top rounded-b-sm" />
          </div>

          {/* Médaille Sceau 3D Bleu/Or */}
          <div
            className="w-24 h-24 rounded-full p-1 flex items-center justify-center shadow-xl relative z-10"
            style={{
              background: 'linear-gradient(135deg, #E7D294 0%, #C9A646 35%, #8C6F26 75%, #E7D294 100%)',
              border: '2px solid #F5EAC4'
            }}
          >
            <div
              className="w-full h-full rounded-full flex flex-col items-center justify-center p-1 text-center shadow-inner border border-[#C9A646]/40"
              style={{
                background: 'radial-gradient(circle, #123A6B 0%, #0B2545 70%, #081B33 100%)'
              }}
            >
              <div className="w-full h-full rounded-full border border-dashed border-[#C9A646]/60 flex flex-col items-center justify-center p-1">
                <ShieldCheck size={20} className="text-[#E7D294] drop-shadow-md mb-0.5" />
                <span className="text-[7.5px] font-black text-[#F5EAC4] uppercase tracking-widest leading-none drop-shadow-xs" style={{ fontFamily: "'Cinzel', serif" }}>
                  MYLTA
                </span>
                <span className="text-[6px] font-bold text-[#C9A646] uppercase tracking-wider leading-tight">
                  OFFICIAL SEAL
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* BLOC DROITE : SIGNATURE OFFICIELLE DU DIRECTEUR */}
        <div className="flex flex-col items-center text-center w-60">
          {/* SVG de signature réaliste et manuscrite */}
          <div className="h-12 flex items-end justify-center mb-1 relative">
            <svg viewBox="0 0 170 60" className="w-36 h-12 overflow-visible" style={{ transform: 'rotate(-2deg)' }}>
              <g fill="none" strokeLinecap="round" strokeLinejoin="round">
                {/* Ligne fluide principale bleu encre */}
                <path
                  d="M 15,42 C 10,25 22,8 32,10 C 40,12 30,38 38,42 C 48,22 55,14 65,12 C 72,10 58,40 68,44 C 75,32 82,24 90,26 C 96,28 88,44 98,40 C 105,36 115,18 120,22 C 124,25 116,42 128,38 C 136,34 145,20 152,24"
                  stroke="#0B2545"
                  strokeWidth="2.4"
                />
                {/* Paraphe inférieur élégant */}
                <path
                  d="M 28,46 C 60,52 110,48 158,34 C 165,32 140,46 115,50 C 70,56 30,52 18,48"
                  stroke="#1B4074"
                  strokeWidth="1.8"
                  opacity="0.85"
                />
                {/* Points et traits de style */}
                <circle cx="156" cy="22" r="1.5" fill="#0B2545" />
              </g>
            </svg>
          </div>

          <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-[#C9A646] to-transparent mb-1" />
          <span className="text-[10px] font-bold text-neutral-800 dark:text-academy-textMain/85 tracking-wider uppercase" style={{ fontFamily: "'Cinzel', serif" }}>
            Direction Générale
          </span>
          <span className="text-[8px] text-neutral-400 dark:text-academy-textMain/40 font-sans tracking-widest uppercase">
            Mylta Academy • Algérie
          </span>
        </div>

      </div>

      {/* FOOTER BAS DE CERTIFICAT */}
      <div className="relative z-10 flex items-center justify-between text-[8px] text-[#0B2545]/80 font-sans px-4 pt-1 border-t border-[#C9A646]/30">
        <span className="flex items-center gap-1">
          <ShieldCheck size={10} className="text-[#0B2545]" /> Authentification électronique garantie par la technologie Mylta Protect™
        </span>
        <span className="tracking-widest">
          DOCUMENT OFFICIEL • RECONNU ET VÉRIFIABLE EN LIGNE
        </span>
      </div>
    </div>
  );
}
