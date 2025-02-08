import adapter from '@sveltejs/adapter-auto';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://svelte.dev/docs/kit/integrations
	// for more information about preprocessors
	preprocess: vitePreprocess(),

	kit: {
		// adapter-auto only supports some environments, see https://svelte.dev/docs/kit/adapter-auto for a list.
		// If your environment is not supported, or you settled on a specific environment, switch out the adapter.
		// See https://svelte.dev/docs/kit/adapters for more information about adapters.
		adapter: adapter(),
		csrf: {
			checkOrigin: true
		},
		prerender: {
			handleMissingId: 'ignore'
		},
		alias: {
			$components: 'src/components',
			$lib: './src/lib'
		},
		inlineStyleThreshold: 5000
	},
	compilerOptions: {
		dev: true,
		css: 'external',
		enableSourcemap: true,
		hydratable: true,
		immutable: true,
		customElement: false
	}
};

export default config;
