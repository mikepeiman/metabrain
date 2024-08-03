<!-- DarkModeToggle.svelte -->
<script>
	import { browser } from '$app/environment';
	import { IconSun, IconMoon } from '@tabler/icons-svelte';
	import { onDestroy } from 'svelte';

	let isDarkMode = false;
	let mediaQuery;

	if (browser) {
		mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
		isDarkMode = mediaQuery.matches;

		const handleChange = (e) => {
			isDarkMode = e.matches;
		};

		mediaQuery.addEventListener('change', handleChange);

		onDestroy(() => {
			mediaQuery.removeEventListener('change', handleChange);
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
			class="rounded-sm bg-slate-3 bg-none px-4 py-2 text-black dark:bg-blue-12"
		>
			<IconSun /></button
		>
	{:else}
		<button
			id="theme-toggle"
			on:click={toggleDarkMode}
			class="rounded-sm bg-blue-12 px-4 py-2 text-blue-1"
		>
			<IconMoon /></button
		>
	{/if}
</span>
