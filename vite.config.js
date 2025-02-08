import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [sveltekit()],
    build: {
      target: 'esnext',
      minify: 'esbuild',
      cssMinify: true,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['svelte']
          }
        }
      }
    },
    optimizeDeps: {
      include: ['svelte', 'svelte/internal', 'svelte/store', 'svelte/easing']
    },
    server: {
      port: 3000,
      strictPort: false,
      host: true,
      fs: {
        strict: true
      }
    },
    resolve: {
      dedupe: ['svelte'],
      alias: {
        $types: '/src/types'
      }
    },
    define: {
      'process.env.DISCORD_CLIENT_ID': JSON.stringify(env.DISCORD_CLIENT_ID),
      'process.env.DISCORD_CLIENT_SECRET': JSON.stringify(env.DISCORD_CLIENT_SECRET)
    }
  };
});
