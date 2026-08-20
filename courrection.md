# Suivi des Failles et Corrections de la Plateforme

Ce fichier est mis à jour à chaque fois qu'un nouveau problème est signalé et/ou corrigé.

| Date | Faille / Problème | Statut | Remarques |
| :--- | :--- | :--- | :--- |
| 25-07-2026 | Problème d'affichage UI ("ne s'affiche pas bien") | ✅ Corrigé | Résolu lors d'une précédente session |
| 25-07-2026 | Configuration de l'email contact@myltaacademy.dz | ✅ Corrigé | Résolu lors d'une précédente session |
| 25-07-2026 | Faille Critique : Contournement de sécurité sur le changement de mot de passe | ✅ Corrigé | Suppression d'une route dupliquée `/change-password` qui n'invalidait pas les sessions et ne validait pas la force du mot de passe (ReDoS). |
| 25-07-2026 | Vulnérabilités NPM (Frontend: react-router-dom, workbox) | ✅ Corrigé | Dépendances forcées (overrides sur brace-expansion) et update react-router v7.17.1 (les 2 alertes restantes RSC n'affectent pas cette app CSR). |
| 25-07-2026 | Vulnérabilités NPM (Backend: multer, xlsx, node-nlp) | ✅ Corrigé | Dépendances obsolètes supprimées ou remplacées (0 vulnérabilité trouvée). |
| 25-07-2026 | Faille ReDoS (Déni de Service par Regex) sur l'authentification | ✅ Corrigé | Limitation stricte de la longueur du mot de passe (.max) dans Zod (Backend) |
| 25-07-2026 | Affichage conditionnel de la section Formateur pour les visiteurs | ✅ Corrigé | Suppression de la condition isAuthenticated pour le lien Devenir Formateur dans la Navbar |
| 25-07-2026 | Stored XSS via Prerendering SEO (Spoofing User-Agent Bot) | ✅ Corrigé | Échappement HTML (escapeHtml) ajouté aux balises OpenGraph (title, description, image) dans server.js |
| 25-07-2026 | Liens Google Drive non reconnus par le lecteur vidéo | ✅ Corrigé | Ajout du support Google Drive dans UniversalVideoPlayer et suppression de la restriction YouTube |
| 26-07-2026 | Logique de remboursement (24h -> 1h) non appliquée dans le backend/frontend | ✅ Corrigé | Remplacement de isWithin24h par isWithin1h et adaptation du popup UI |
| 26-07-2026 | Contradiction Politique de Remboursement dans les CGUV (TermsPage) | ✅ Corrigé | Mise à jour du texte pour mentionner la période d'essai d'une heure au lieu de l'absence de rétractation. |
| 26-07-2026 | Logique de Remboursement | ✅ Corrigé | Ajout d'une bannière de satisfaction automatique (WatchCoursePage) si le délai d'1 heure expire sans choix. |
| 26-07-2026 | Bug Critique Backend (Candidature Formateur) | ✅ Corrigé | L'image du reçu de paiement pour devenir formateur était perdue car non stockée en DB. Ajout de `receiptImage` dans le Prisma schema et `instructor.js`. |
| 26-07-2026 | Tâche planifiée (CRON) | ✅ Corrigé | Le script de nettoyage de fichiers orphelins (cleanupReceipts.js) effaçait par erreur les reçus des formateurs après 24h. Corrigé en vérifiant aussi la table `InstructorApplication` avant délétion. |
| 26-07-2026 | Emails Transactionnels | ✅ Corrigé | Intégration de Nodemailer SMTP pour envoyer de vrais emails d'activation au lieu de simples `console.log`. |
| 26-07-2026 | Interface Admin Formateurs | ✅ Corrigé | Ajout d'un tableau complet "Candidatures" dans le Dashboard Admin pour valider les demandes de formateurs avec affichage des reçus. |
| 26-07-2026 | Certificats Étudiants | ✅ Corrigé | Ajout d'un bouton "Télécharger mon Certificat" qui apparaît uniquement à 100% de progression dans `WatchCoursePage.jsx`, générant un PDF automatique. |
| 26-07-2026 | SEO Dynamique | ✅ Corrigé | Ajout d'images OpenGraph dynamiques sur `CourseDetails.jsx` pour améliorer les partages sur WhatsApp/Facebook. |
| 26-07-2026 | Avis (Reviews) | ✅ Corrigé | Ajout du modèle CourseReview et route API pour noter les formations. Affichage dans UI. |
| 26-07-2026 | WebSockets | ✅ Corrigé | Implémentation du tracking d'événements et notification en temps réel `receipt_approved` via Socket.io. |
| 26-07-2026 | Reprise Vidéo | ✅ Corrigé | Enregistrement temps réel (localStorage) de la position vidéo dans `PremiumPlayer` et `UniversalVideoPlayer`. |
| 26-07-2026 | Sécurité Profil | ✅ Corrigé | Ajout de la route `PUT /auth/change-password` et UI dans `SettingsPage.jsx`. |
| 26-07-2026 | Anti-Partage de compte | ✅ Corrigé | Limite de connexions simultanées via `socket.js` (max 2 IPs) + Watermark vidéo dynamique (email). |
| 26-07-2026 | Coupons de Réduction | ✅ Corrigé | Ajout du modèle, Route API `/coupon/validate` et modification de la `PaymentModal`. |
| 26-07-2026 | Formateurs (Dashboard Pro) | ✅ Corrigé | Graphique d'évolution des revenus (Recharts) + Bouton/Logique pour demande de retrait intégrée. |
| 26-07-2026 | SEO (Sitemap dynamique) | ✅ Corrigé | Intégration du modèle `BlogPost` (et sa route API) dans la génération dynamique `/sitemap.xml`. |
| 26-07-2026 | Privilege Escalation (Fuite de données en temps réel) | ✅ Corrigé | Sécurisation de l'event `join_admin_analytics` dans `socket.js` (uniquement accessible au rôle ADMIN). |
| 26-07-2026 | TOCTOU Race Condition (Bypass d'utilisation Coupons) | ✅ Corrigé | Modification de l'incrémentation des coupons dans `payments.js` via une opération atomique Prisma `updateMany` avec condition `lt: maxUses`. |
| 26-07-2026 | Interfaces d'Administration (Coupons, Payouts, Blog) | ✅ Corrigé | Ajout complet des onglets et composants CRUD dans `AdminDashboard.jsx` pour piloter la Phase 3. |
