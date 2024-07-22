<script>
	import '../app.css';
	import { register } from '@tauri-apps/plugin-global-shortcut';
	import CommandPalette from '$lib/components/CommandPalette.svelte';
	import { Toaster } from '$lib/components/ui/sonner';
	import MambaHeader from '$lib/components/MambaHeader.svelte';
	import SideMenuLeft from '$components/SideMenuLeft.svelte';
</script>

<CommandPalette />
<MambaHeader />

<SideMenuLeft />
<div
	class="bg-zinc-100 flex min-h-screen w-full items-center justify-center text-white dark:bg-black"
>
	<Toaster />
	<slot></slot>
</div>

<style>
	/* :global(body) {
		min-height: 100vh;
	} */
</style>
