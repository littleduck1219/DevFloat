import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { inlineContentCssPlugin } from './vite-plugin-inline-content-css'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    inlineContentCssPlugin(),
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler']],
      },
    }),
  ],
  build: {
    rollupOptions: {
      input: {
        content: 'src/content.tsx',
        background: 'src/background.ts',
        'injected-source-trace': 'src/features/source-trace/injected.ts'
      },
      output: {
        entryFileNames: 'assets/[name].js',
        chunkFileNames: 'assets/[name].js', 
        assetFileNames: 'assets/[name].[ext]'
      }
    }
  }
})
