import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, Plugin } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

const suppressHmrPlugin: Plugin = {
  name: 'suppress-hmr-ws-error',
  transformIndexHtml: {
    order: 'pre',
    handler() {
      return [
        {
          tag: 'script',
          children: `
            (function() {
              if (typeof window === 'undefined') return;
              var NativeWS = window.WebSocket;
              if (NativeWS) {
                window.WebSocket = function(url, protocols) {
                  var isVite = protocols === 'vite-hmr' || (Array.isArray(protocols) && protocols.indexOf('vite-hmr') !== -1) || (typeof url === 'string' && url.indexOf('vite-hmr') !== -1);
                  if (isVite) {
                    var target = new EventTarget();
                    return {
                      readyState: 1,
                      CONNECTING: 0,
                      OPEN: 1,
                      CLOSING: 2,
                      CLOSED: 3,
                      url: String(url),
                      protocol: 'vite-hmr',
                      bufferedAmount: 0,
                      extensions: '',
                      binaryType: 'blob',
                      send: function() {},
                      close: function() {},
                      addEventListener: target.addEventListener.bind(target),
                      removeEventListener: target.removeEventListener.bind(target),
                      dispatchEvent: target.dispatchEvent.bind(target),
                      onopen: null,
                      onclose: null,
                      onerror: null,
                      onmessage: null
                    };
                  }
                  return new NativeWS(url, protocols);
                };
                window.WebSocket.prototype = NativeWS.prototype;
                window.WebSocket.CONNECTING = NativeWS.CONNECTING;
                window.WebSocket.OPEN = NativeWS.OPEN;
                window.WebSocket.CLOSING = NativeWS.CLOSING;
                window.WebSocket.CLOSED = NativeWS.CLOSED;
              }
              var origErr = console.error;
              console.error = function() {
                var args = Array.prototype.slice.call(arguments);
                var text = args.map(function(a) { return typeof a === 'object' && a !== null ? (a.message || JSON.stringify(a)) : String(a); }).join(' ');
                if (text.indexOf('WebSocket closed without opened') !== -1 || text.indexOf('failed to connect to websocket') !== -1) {
                  return;
                }
                origErr.apply(console, args);
              };
              window.addEventListener('error', function(e) {
                if (e && e.message && e.message.indexOf('WebSocket') !== -1) {
                  e.stopImmediatePropagation();
                  e.preventDefault();
                }
              }, true);
            })();
          `,
          injectTo: 'head-prepend',
        },
      ];
    },
  },
};

export default defineConfig(() => {
  return {
    base: process.env.VITE_BASE_PATH || (process.env.GITHUB_PAGES === 'true' ? './' : '/'),
    plugins: [
      suppressHmrPlugin,
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['icon.svg', 'apple-touch-icon.png'],
        manifest: {
          id: '/',
          name: 'Life App - Bio-Rhythm OS',
          short_name: 'Life OS',
          description: 'Harmonizing movement, deep focus sprints, and mindful chrononutrition.',
          theme_color: '#080a0f',
          background_color: '#080a0f',
          display: 'standalone',
          start_url: '/',
          scope: '/',
          icons: [
            {
              src: 'pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: 'pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: 'pwa-maskable-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2,jpg,jpeg}'],
        },
        devOptions: {
          enabled: true,
          type: 'module',
        },
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve('.'),
      },
    },
    build: {
      chunkSizeWarningLimit: 1000,
    },
    server: {
      hmr: false,
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
