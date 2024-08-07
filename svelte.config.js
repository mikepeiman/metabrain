import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';


/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://kit.svelte.dev/docs/integrations#preprocessors
	// for more information about preprocessors
	preprocess: vitePreprocess(),
	// onwarn: (warning, handler) => {
	// 	if (warning.code.startsWith('a11y-')) {
	// 	  return;
	// 	}
	// 	handler(warning);
	//   },
	kit: {
		// adapter-auto only supports some environments, see https://kit.svelte.dev/docs/adapter-auto for a list.
		// If your environment is not supported, or you settled on a specific environment, switch out the adapter.
		// See https://kit.svelte.dev/docs/adapters for more information about adapters.
		adapter: adapter({
			fallback: 'index.html'
		}),
		files: {
			assets: 'src/static'
		  },
		alias: {
			"@/*": "./src/lib/*",
			"$images": "./src/static/images",
			"$images/*": "./src/static/images/*",
			"$utils": "./src/lib/utils",
			"$utils/*": "./src/lib/utils/*",
			"$stores": "./src/lib/stores",
			"$stores/*": "./src/lib/stores/*",
			"$components": "./src/lib/components",
			"$components/*": "./src/lib/components/*",
		  },
	}
};

export default config;
