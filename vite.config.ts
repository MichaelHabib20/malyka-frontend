import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
    // this commented out because it was causing the app to not work on the server
  // base: '/',
  base: '/malyka-frontend/',
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'Malyka',
        short_name: 'Malyka',
        start_url: '/malyka-frontend/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#42b983',
        icons: [
          {
            src: 'pwa-icon-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-icon-512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      workbox: {
        runtimeCaching: [
          {
            urlPattern: /\/api\/.*/,
            handler: 'NetworkFirst',
          }
        ],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024 // 5 MB
      }
      
    })
  ],
  server: {
    allowedHosts: true // 👈 Add this line
  }
})
