import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

// Relative base keeps the build portable: it works from a GitHub Pages
// project subpath, from a custom domain, and from the local preview server.
export default defineConfig({
  base: './',
  // Pinned so the Supabase GitHub-OAuth callback always lands back on the
  // running app. The callback URL in the screenshot (`localhost:8000`) hit
  // ERR_CONNECTION_REFUSED because the dev server defaulted to another
  // port; strictPort makes a conflict fail loudly instead of silently
  // breaking sign-in on a different origin (which would also lose the PKCE
  // verifier and fail the code exchange).
  server: { port: 8000, strictPort: true },
  preview: { port: 8000, strictPort: true },
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'Life App',
        short_name: 'Life',
        description: 'A calm companion for movement, focus, and nourishment.',
        start_url: '.',
        scope: '.',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#111316',
        theme_color: '#111316',
        icons: [
          { src: 'icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
          { src: 'icon-maskable.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,webmanifest}'],
        navigateFallback: 'index.html',
      },
    }),
  ],
});
