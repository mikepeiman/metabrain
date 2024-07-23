<!-- DarkModeToggle.svelte -->
<script>
	import { browser } from '$app/environment';
	import { IconSun, IconMoon } from '@tabler/icons-svelte';

	let isDarkMode = false;

	if (browser) {
		isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
		window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
			isDarkMode = e.matches;
		});
	}

	function toggleDarkMode() {
		isDarkMode = !isDarkMode;
		document.documentElement.classList.toggle('dark');
	}
</script>

<span class="mx-2 py-2">
	{#if isDarkMode}
		<button
			id="theme-toggle"
			on:click={toggleDarkMode}
			class="px-4 py-2 bg-none text-black dark:bg-blue-12 bg-slate-3 rounded-sm"
		>
			<IconSun /></button
		>
	{:else}
		<button
			id="theme-toggle"
			on:click={toggleDarkMode}
			class="px-4 py-2  text-blue-1 bg-blue-12  rounded-sm"
		>
			<IconMoon /></button
		>
	{/if}
</span>
