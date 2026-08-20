# Mylta Academy

Bienvenue sur le dépôt de **Mylta Academy**, une plateforme complète d'e-learning et de formations premium. 

Cette plateforme est divisée en deux parties principales :
- Un **Frontend** interactif développé en React.js et Vite.
- Un **Backend** robuste développé en Node.js, Express et Prisma ORM.

---

## 🚀 Fonctionnalités Principales

- **Authentification Sécurisée** : Connexion classique (JWT) et via Google OAuth.
- **E-Learning** : Catalogue de cours, suivi de la progression (leçons terminées), lecteur vidéo intégré (Plyr).
- **Marketplace Formateurs** : Les utilisateurs peuvent postuler pour devenir formateurs, publier des cours, et gérer leurs revenus (système de commission).
- **Système de Parrainage (Referral)** : Les utilisateurs peuvent parrainer de nouveaux membres et gagner des récompenses (cours gratuits).
- **Temps Réel** : Notifications push et mises à jour en temps réel via WebSockets (Socket.io).
- **Paiements Locaux** : Prise en charge des paiements via CCP, BaridiMob, et CIB avec validation de reçus par les administrateurs.

---

## 🛠️ Stack Technologique

### Frontend (`/frontend`)
- **React 18** & **Vite** (Build rapide)
- **Tailwind CSS** (Styling)
- **React Router v6** (Navigation)
- **Axios** (Requêtes HTTP)
- **Zustand / Context API** (Gestion d'état globale)
- **Socket.io-client** (Temps réel)

### Backend (`/backend`)
- **Node.js** & **Express.js**
- **Prisma ORM** (Gestion de la base de données)
- **Base de données** : SQLite (pour le développement) / PostgreSQL (recommandé pour la production)
- **Socket.io** (Serveur WebSocket)
- **Multer** (Upload de fichiers et d'images)
- **Sécurité** : JWT, Argon2/Bcrypt, Helmet, XSS-clean, Rate Limiting

---

## ⚙️ Prérequis

Avant de commencer, assurez-vous d'avoir installé sur votre machine :
- [Node.js](https://nodejs.org/) (version 18+ recommandée)
- [npm](https://www.npmjs.com/) ou [pnpm](https://pnpm.io/)

---

## 💻 Installation & Démarrage (Développement)

### 1. Cloner le projet

```bash
# Clonez ce dépôt sur votre machine locale
git clone <URL_DU_DEPOT>
cd myAcademy
```

### 2. Configuration du Backend

```bash
# Se déplacer dans le dossier backend
cd backend

# Installer les dépendances
npm install

# Créer un fichier d'environnement (et configurer vos variables)
cp .env.example .env
```

**Configuration de la base de données :**
Par défaut, le projet utilise SQLite pour le développement local. Initialisez la base de données :

```bash
# Générer le client Prisma et exécuter les migrations
npx prisma generate
npx prisma migrate dev --name init

# (Optionnel) Alimenter la base de données avec des données de test
npm run db:seed
```

**Démarrer le serveur backend :**
```bash
npm run dev
# Le backend sera accessible sur http://localhost:5000
```

### 3. Configuration du Frontend

Ouvrez un nouveau terminal et positionnez-vous à la racine du projet :

```bash
# Se déplacer dans le dossier frontend
cd frontend

# Installer les dépendances
npm install

# Créer un fichier d'environnement
cp .env.example .env
# Assurez-vous que VITE_API_URL pointe vers votre backend (ex: http://localhost:5000/api)
```

**Démarrer l'application React :**
```bash
npm run dev
# Le frontend sera accessible sur http://localhost:5173
```

---

## 🗄️ Commandes Utiles (Prisma)

Depuis le dossier `backend/`, vous pouvez utiliser les commandes suivantes pour gérer votre base de données :

- `npx prisma studio` : Ouvre une interface graphique dans votre navigateur pour voir et modifier les données de la base de données.
- `npm run db:migrate` : Exécute les nouvelles migrations si vous modifiez le `schema.prisma`.
- `npm run db:reset` : Réinitialise complètement la base de données (⚠️ Supprime toutes les données).

---

## 🔒 Sécurité et Bonnes Pratiques

- **Variables d'environnement** : Ne commitez jamais vos fichiers `.env` contenant des clés secrètes ou des mots de passe.
- **Uploads** : En production, privilégiez un stockage cloud (AWS S3, Cloudinary) au lieu du dossier local `uploads/` du backend.
- **Mots de passe** : Les mots de passe sont hachés de manière sécurisée avant d'être stockés en base de données.

---

## 🤝 Contribution

1. Créez une branche pour votre fonctionnalité (`git checkout -b feature/ma-fonctionnalite`)
2. Commitez vos changements (`git commit -m 'Ajout de ma fonctionnalité'`)
3. Poussez vers la branche (`git push origin feature/ma-fonctionnalite`)
4. Ouvrez une Pull Request.
