import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  base: './', // 确保使用相对路径
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        newtab: resolve(__dirname, 'index.html')
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
  },
  // 复制公共资源到构建目录
  publicDir: 'public'
})
