import React, { useState, useRef, useEffect } from 'react';
import { Download, Award, Calendar, User, BookOpen } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import api from '../api/axios';
import LuxuryCertificate from './LuxuryCertificate';

export default function CertificateGenerator() {
  const [studentName, setStudentName] = useState('');
  const [courseName, setCourseName] = useState('');
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const [generating, setGenerating] = useState(false);
  const certificateRef = useRef(null);

  // Identifiant unique de certificat pour un rendu professionnel
  const certId = useRef(`MYL-${Math.floor(100000 + Math.random() * 900000)}`).current;

  const [studentsList, setStudentsList] = useState([]);
  const [coursesList, setCoursesList] = useState([]);

  useEffect(() => {
    // Fetch students and courses for autocomplete
    const fetchData = async () => {
      try {
        const [resStudents, resCourses] = await Promise.all([
          api.get('/admin/users/students'),
          api.get('/admin/courses')
        ]);
        setStudentsList(resStudents.data || []);
        setCoursesList(resCourses.data?.courses || []);
      } catch (error) {
        console.error("Erreur lors du chargement des données pour le certificat:", error);
      }
    };
    fetchData();
  }, []);

  const generatePDF = async () => {
    if (!studentName || !courseName) {
      alert("Veuillez remplir le nom de l'étudiant et la formation.");
      return;
    }

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
      pdf.save(`Certificat_${studentName.trim().replace(/\s+/g, '_')}_MyltaAcademy.pdf`);
    } catch (error) {
      console.error("Erreur lors de la génération du PDF", error);
      alert("Une erreur est survenue lors de la génération du certificat.");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-up">
      {/* Element de capture masqué hors écran sans AUCUN transform CSS */}
      <div 
        style={{ 
          position: 'fixed', 
          left: '-9999px', 
          top: '-9999px', 
          zIndex: -9999,
          pointerEvents: 'none'
        }}
      >
        <div ref={certificateRef}>
          <LuxuryCertificate 
            studentName={studentName}
            courseName={courseName}
            issueDate={issueDate}
            certId={certId}
          />
        </div>
      </div>

      <div>
        <h1 className="font-display font-bold text-4xl text-white mb-2 tracking-tight">Générateur de Certificats</h1>
        <p className="text-neutral-400 dark:text-academy-textMain/40">Générez un certificat de réussite nominatif en PDF pour un étudiant.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Formulaire */}
        <div className="lg:col-span-1 bg-neutral-900/30 border border-white/5 backdrop-blur-xl rounded-3xl p-6 h-fit">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Award className="text-[#d25b5b]" size={24} />
            Détails du certificat
          </h2>

          
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-neutral-400 dark:text-academy-textMain/40 mb-1.5">Nom complet de l'étudiant</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User size={18} className="text-neutral-500 dark:text-academy-textMain/50" />
                </div>
                <input
                  type="text"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="Ex: Yacine Benali"
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/30 transition-all"
                  list="students-datalist"
                />
                <datalist id="students-datalist">
                  {studentsList.map(s => <option key={s.id} value={s.name || s.email} />)}
                </datalist>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-400 dark:text-academy-textMain/40 mb-1.5">Nom de la formation</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <BookOpen size={18} className="text-neutral-500 dark:text-academy-textMain/50" />
                </div>
                <input
                  type="text"
                  value={courseName}
                  onChange={(e) => setCourseName(e.target.value)}
                  placeholder="Ex: Maîtrise du E-commerce 2026"
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/30 transition-all"
                  list="courses-datalist"
                />
                <datalist id="courses-datalist">
                  {coursesList.map(c => <option key={c.id} value={c.title} />)}
                </datalist>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-400 dark:text-academy-textMain/40 mb-1.5">Date de délivrance</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar size={18} className="text-neutral-500 dark:text-academy-textMain/50" />
                </div>
                <input
                  type="date"
                  value={issueDate}
                  onChange={(e) => setIssueDate(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/30 transition-all [color-scheme:dark]"
                />
              </div>
            </div>

            <button
              onClick={generatePDF}
              disabled={generating || !studentName || !courseName}
              className="w-full mt-4 flex items-center justify-center gap-2 bg-white dark:bg-academy-surfaceDark text-black py-3 rounded-xl font-bold hover:bg-neutral-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-white/5"
            >
              {generating ? (
                <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
              ) : (
                <Download size={20} />
              )}
              {generating ? 'Génération...' : 'Télécharger le PDF'}
            </button>
          </div>
        </div>

        {/* Aperçu du certificat */}
        <div className="lg:col-span-2 overflow-x-auto rounded-3xl bg-neutral-900/20 border border-white/5 p-4 flex justify-center items-start">
          <div 
            className="bg-white dark:bg-academy-surfaceDark text-black relative shadow-2xl flex-shrink-0 rounded-sm overflow-hidden"
            style={{ 
              width: '1123px', 
              height: '794px', 
              transform: 'scale(0.62)', 
              transformOrigin: 'top center', 
              marginBottom: '-300px' 
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

      </div>
    </div>
  );
}

