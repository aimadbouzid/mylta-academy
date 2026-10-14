import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      includeAssets: ['favicon.svg', 'logo-256.png', 'logo-128.png'],
      manifest: {
        name: 'Mylta Academy — Formation Premium',
        short_name: 'Mylta Academy',
        description: 'La plateforme de formation numéro 1 en Algérie. Marketing, Tech, Business.',
        start_url: '/',
        scope: '/',
        theme_color: '#2563EB',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait-primary',
        categories: ['education', 'business'],
        lang: 'fr',
        dir: 'ltr',
        icons: [
          {
            src: '/logo-128.png',
            sizes: '128x128',
            type: 'image/png',
          },
          {
            src: '/logo-256.png',
            sizes: '256x256',
            type: 'image/png',
          },
          // Une icône 512×512 est exigée pour qu'une PWA soit installable
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
        screenshots: [],
      },
      workbox: {
        // Précharger UNIQUEMENT la coquille de l'application.
        //
        // Le motif précédent (`**/*.{js,png,…}`) embarquait tout : 9 Mo étaient
        // téléchargés dès la première visite, dont les gros chunks de routes
        // pourtant chargées à la demande (React.lazy) — ce qui annulait le
        // découpage de code. Sur mobile en Algérie, c'est un coût direct en
        // données pour l'utilisateur.
        globPatterns: [
          '**/*.{css,html,woff,woff2,svg}',
          'assets/index-*.js',
          'assets/vendor-*.js',
          'logo-*.png',
          'pwa-*.png',
        ],
        // Filet de sécurité : rien d'anormalement lourd ne rentre dans le précache
        maximumFileSizeToCacheInBytes: 1.5 * 1024 * 1024,
        // Ne pas cacher les API
        navigateFallback: 'index.html',
        navigateFallbackDenylist: [/^\/api\//, /^\/uploads\//],
        runtimeCaching: [
          // Google Fonts stylesheets
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'google-fonts-stylesheets',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365,
              },
            },
          },
          // Google Fonts webfont files
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-webfonts',
              expiration: {
                maxEntries: 30,
                maxAgeSeconds: 60 * 60 * 24 * 365,
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          // Chunks de routes (React.lazy) : mis en cache À L'USAGE plutôt que
          // préchargés. L'utilisateur ne paie que les pages qu'il visite, et
          // la seconde visite reste instantanée.
          {
            urlPattern: /\/assets\/.*\.js$/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'route-chunks',
              expiration: {
                maxEntries: 60,
                maxAgeSeconds: 60 * 60 * 24 * 30,
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          // Thumbnails des formations (cache 7 jours)
          {
            urlPattern: /\/uploads\/thumbnails\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'course-thumbnails',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 7,
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          // ⚠️ Ne JAMAIS cacher /api/courses ici : la réponse contient hasAccess,
          // propre à chaque compte. Le service worker est partagé par tout le
          // navigateur, donc la réponse d'un acheteur était resservie à un
          // visiteur déconnecté (formations affichées comme déjà acquises).
          // API config (cache long) — réglages publics identiques pour tous
          {
            urlPattern: /\/api\/config\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'api-config',
              expiration: {
                maxEntries: 5,
                maxAgeSeconds: 60 * 30, // 30 minutes
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
      },
      // Dev options pour tester en développement
      devOptions: {
        enabled: false, // Mettre true pour tester le SW en dev
      },
    }),
  ],
  // Traiter les fichiers .js comme JSX
  esbuild: {
    loader: 'jsx',
    include: /src\/.*\.[jt]sx?$/,
    exclude: [],
  },
  optimizeDeps: {
    esbuildOptions: {
      loader: { '.js': 'jsx' },
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      '/socket.io': {
        target: 'http://localhost:3001',
        ws: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // Seul le cœur React est commun à toutes les pages ; un simple
            // includes('react') aspirait aussi plyr-react et chargeait tout le
            // lecteur vidéo (chunk media) dès l'ouverture du site.
            if (/node_modules\/(react|react-dom|react-router|react-router-dom|scheduler)\//.test(id)) return 'vendor';
            if (id.includes('lucide-react')) return 'ui';
            if (id.includes('plyr') || id.includes('plyr-react')) return 'media';
            if (id.includes('socket.io-client')) return 'realtime';
            if (id.includes('@react-oauth/google')) return 'auth';
          }
        },
      },
    },
  },
})
