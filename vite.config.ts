import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import copy from 'rollup-plugin-copy';
const { resolve } = require('path');
import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers';

// https://vitejs.dev/config/
export default ({ mode }) => {
  const chromeExtensionsName = mode === 'test' ? 'test' : 'MOCK-PLUS';
  return defineConfig({
    base: './',
    server: {
      host: true,
      https: false,
      open: false,
    },
    build: {
      emptyOutDir: mode !== 'crx',
      outDir: chromeExtensionsName,
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
          dir: chromeExtensionsName,
        },
      },
    },
    resolve: {
      alias: {
        '@': resolve(__dirname, './src'),
        '~': resolve(__dirname, '.'),
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
          { src: 'crx/manifest.json', dest: chromeExtensionsName },
          { src: 'README.md', dest: chromeExtensionsName },
          { src: 'crx/devtools.html', dest: chromeExtensionsName },
          { src: 'crx/assets', dest: chromeExtensionsName },
        ],
        hook: 'writeBundle',
      }),
    ],
  });
}
