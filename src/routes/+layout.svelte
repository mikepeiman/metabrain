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
	id="app"
	class="absolute bg-zinc-100 flex min-h-screen w-full  text-white dark:bg-black"
>
	<Toaster />
	<slot></slot>
</div>

<style>
	#app {
		left: var(--sidebar-width);
		width: calc(100% - var(--sidebar-width));
		height: 100%;
		transition: all 0.3s ease;
	}
</style>
