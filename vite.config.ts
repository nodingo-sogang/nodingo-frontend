import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'https://nodingo-core.ddns.net',
        changeOrigin: true,
      },
      // /oauth2, /login, /auth/callback 은 직접 URL 또는 React 라우트이므로 프록시 제외
    },
  },
})
