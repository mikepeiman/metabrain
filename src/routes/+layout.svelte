<script>
	import '../app.css';
	import { register } from '@tauri-apps/plugin-global-shortcut';
	import CommandPalette from '$lib/components/CommandPalette.svelte';
	// await register('CommandOrControl+Shift+C', (event) => {
	// 	console.log(`🚀 ~ awaitregister ~ event:`, event)
	// 	if (event.state === 'Pressed') {
	// 		console.log('Shortcut triggered');
	// 	}
	// });
import MambaHeader from '$lib/components/MambaHeader.svelte';

</script>
<CommandPalette />
<MambaHeader />
<div class="flex min-h-screen w-full items-center justify-center bg-zinc-100 dark:bg-black text-white">
	<slot></slot>
</div>

<style>
 /* :global(body) {
		min-height: 100vh;
	} */
</style>
