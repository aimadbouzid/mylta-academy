import React, { useState, useRef } from 'react';
import { Download, Award, X } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import LuxuryCertificate from './LuxuryCertificate';

export default function StudentCertificate({ studentName, courseName, onClose }) {
  const [generating, setGenerating] = useState(false);
  const certificateRef = useRef(null);
  const certId = useRef(`MYL-${Math.floor(100000 + Math.random() * 900000)}`).current;
  const issueDate = new Date().toISOString().split('T')[0];

  const generatePDF = async () => {
    setGenerating(true);
    try {
      const element = certificateRef.current;
      if (!element) return;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#FAF8F5',
        logging: false,
        windowWidth: 1123,
        windowHeight: 794
      });
      const imgData = canvas.toDataURL('image/png', 1.0);
      const pdf = new jsPDF('l', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Certificat_${studentName.trim().replace(/\s+/g, '_')}.pdf`);
      onClose(); // Fermer la modale après téléchargement
    } catch (error) {
      console.error("Erreur génération PDF", error);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-neutral-950/90 backdrop-blur-xl" onClick={onClose} />
      <div className="relative max-w-5xl w-full bg-neutral-900 border border-white/10 rounded-3xl p-6 shadow-2xl animate-fade-up z-10 max-h-[95vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 w-10 h-10 bg-neutral-800 rounded-full flex items-center justify-center text-neutral-400 dark:text-academy-textMain/40 hover:text-white border border-white/10 shadow-lg z-20">
          <X size={20} />
        </button>
        
        <div className="text-center mb-6">
          <h2 className="font-display font-bold text-3xl text-white flex items-center justify-center gap-3 mb-2">
            <Award className="text-[#D4AF37]" size={32} /> Félicitations !
          </h2>
          <p className="text-neutral-400 dark:text-academy-textMain/40 text-sm max-w-xl mx-auto">
            Vous avez terminé avec succès la formation <strong className="text-white">"{courseName}"</strong>. Voici votre certificat officiel d'excellence.
          </p>
        </div>

        {/* CONTENEUR CACHÉ POUR LA GÉNÉRATION DU PDF */}
        <div style={{ position: 'fixed', left: '-9999px', top: '-9999px', pointerEvents: 'none' }}>
          <div ref={certificateRef}>
            <LuxuryCertificate 
              studentName={studentName}
              courseName={courseName}
              issueDate={issueDate}
              certId={certId}
            />
          </div>
        </div>

        {/* APERÇU LUXUEUX DANS LA MODALE */}
        <div className="overflow-x-auto rounded-2xl bg-neutral-950/40 border border-white/5 p-4 flex justify-center items-start">
          <div 
            className="bg-white dark:bg-academy-surfaceDark text-black relative shadow-2xl flex-shrink-0 rounded-sm overflow-hidden"
            style={{ 
              width: '1123px', 
              height: '794px', 
              transform: 'scale(0.68)', 
              transformOrigin: 'top center', 
              marginBottom: '-240px' 
            }}
          >
            <LuxuryCertificate 
              studentName={studentName}
              courseName={courseName}
              issueDate={issueDate}
              certId={certId}
            />
          </div>
        </div>
        
        <div className="flex justify-center mt-6">
          <button 
            onClick={generatePDF}
            disabled={generating}
            className="bg-gradient-to-r from-[#D4AF37] via-[#F5D061] to-[#AA7C11] text-black font-extrabold py-4 px-10 rounded-2xl flex items-center gap-3 transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-[#D4AF37]/20 disabled:opacity-50"
          >
            <Download size={22} />
            {generating ? 'Création de votre PDF Haute Définition...' : 'Télécharger mon certificat officiel (PDF HD)'}
          </button>
        </div>
      </div>
    </div>
  );
}

