import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import copy from 'rollup-plugin-copy';
// import legacy from '@vitejs/plugin-legacy';
const { resolve } = require('path');
import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers';

// https://vitejs.dev/config/
export default ({ mode }) => defineConfig({
    base: './',
    server: {
      host: true,
      https: false,
      open: false,
    },
    build: {
      emptyOutDir: mode !== 'crx',
      sourcemap: mode === 'crx',
      minify: mode === 'crx' ? false: 'esbuild',
      rollupOptions: {
        input: [
          ...(mode === 'crx' ? [] : [resolve(__dirname, 'index.html')]),
          resolve(__dirname, 'crx/background.ts'),
          resolve(__dirname, 'crx/content-script.ts'),
          resolve(__dirname, 'crx/devtools.ts'),
          resolve(__dirname, 'crx/inject.ts'),
        ],
        output: {
          chunkFileNames: 'assets/[name].[hash].js',
          assetFileNames: 'assets/[name].[hash].[ext]',
          entryFileNames: '[name].js',
          dir: 'dist',
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
      AutoImport({
        resolvers: [ElementPlusResolver()],
      }),
      Components({
        resolvers: [ElementPlusResolver()],
      }),
      copy({
        targets: [
          { src: 'crx/manifest.json', dest: 'dist' },
          { src: 'README.md', dest: 'dist' },
          { src: 'crx/devtools.html', dest: 'dist' },
          { src: 'assets', dest: 'dist' },
        ],
        hook: 'writeBundle',
      }),
      // legacy(),
    ],
  });
