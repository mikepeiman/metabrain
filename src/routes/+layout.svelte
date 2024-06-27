<script>
	import '../app.css';
	import { register } from '@tauri-apps/plugin-global-shortcut';
	// await register('CommandOrControl+Shift+C', (event) => {
	// 	console.log(`🚀 ~ awaitregister ~ event:`, event)
	// 	if (event.state === 'Pressed') {
	// 		console.log('Shortcut triggered');
	// 	}
	// });




</script>

<div class="flex min-h-screen w-full items-center justify-center bg-cyan-950">
	<slot></slot>
</div>

<style>
 :global(body) {
		min-height: 100vh;
	}
</style>
