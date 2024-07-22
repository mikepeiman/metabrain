<script lang="ts">
	import { IconSearch } from '@tabler/icons-svelte';
	import DarkModeToggle from '$components/DarkModeToggle.svelte';

	let searchQuery = '';
</script>

<header class="fixed top-0 left-16 right-0 z-10 bg-white dark:bg-black border-b border-slate-200 dark:border-slate-800">
	<div class="flex items-center justify-between h-16 px-4">
		<div class="flex-1 max-w-2xl mx-auto">
			<div class="relative">
				<IconSearch
					class="absolute left-3 top-1/2 -translate-y-1/2 transform text-slate-400 dark:text-slate-500"
					size={20}
				/>
				<input
					type="text"
					bind:value={searchQuery}
					placeholder="Search..."
					class="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-black text-slate-900 dark:text-slate-100 py-2 pl-10 pr-4 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 placeholder-slate-400 dark:placeholder-slate-500"
				/>
			</div>
		</div>
		<div class="ml-4">
			<DarkModeToggle />
		</div>
	</div>
</header>

<style>
	/* Add any additional styles here if needed */
</style>