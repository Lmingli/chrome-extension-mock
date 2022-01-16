import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
// import legacy from '@vitejs/plugin-legacy';
const { resolve } = require('path');
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

// https://vitejs.dev/config/
export default (({ mode }) => defineConfig({
  base: './',
  assetsDir: 'static',
  server: {
    host: true,
    https: false,
    open: false,
  },
  build: {
    outDir: mode === 'staging' ? 'staging' : 'dist',
    sourcemap: mode === 'staging',
    terserOptions: {
      compress: {
        drop_console: mode === 'production',
      },
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  plugins: [
    vue(),
    Components({
      resolvers: [
        ElementPlusResolver(),
      ],
    }),
    // legacy(),
  ],
}))
