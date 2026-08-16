import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';

export default defineConfig({
  base: './', // Ensures relative assets resolution for GitHub Pages subpaths
  server: {
    host: true, // Listen on all local IP addresses (0.0.0.0)
    port: 5173,
  },
  preview: {
    host: true,
    port: 4173,
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'kurals.json', 'kural-embeddings.bin'],
      manifest: {
        name: 'திருக்குறள் வழிகாட்டி - Thirukkural Guide',
        short_name: 'குறள் வழிகாட்டி',
        description: '100% Offline Semantic Search & Situational Guidance for Thirukkural',
        theme_color: '#FAF9F5',
        background_color: '#FAF9F5',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          {
            src: 'favicon.svg',
            sizes: '192x192 512x512',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        maximumFileSizeToCacheInBytes: 6000000, // 6 MB to support precomputed embeddings & JSON
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json,bin}']
      }
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  worker: {
    format: 'es'
  }
});
