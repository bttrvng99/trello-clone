import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // base: './'
  resolve: { //rút gọn import
    alias: [
      { find: '~', replacement: '/src' }
    ]
  }
})
