import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        newtab: 'index.html'
      },
      output: {
        entryFileNames: 'assets/newtab-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/newtab-[hash].[ext]'
      }
    }
  },
  // Chrome 扩展开发配置
  server: {
    port: 3000,
    open: false
  }
})
