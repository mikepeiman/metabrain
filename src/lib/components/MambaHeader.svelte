<script lang="ts">
	import { IconSearch } from '@tabler/icons-svelte';
	import DarkModeToggle from '$components/DarkModeToggle.svelte';
	import Login from '$components/Login.svelte';
	import { goto } from '$app/navigation';
	import Register from '$components/Register.svelte';
	import { currentUser, logout } from '$utils/pocketbase';

	let searchQuery = '';
	$: isLoggedIn = $currentUser !== undefined && $currentUser !== null;
	$: console.log(`🚀 ~ isLoggedIn:`, isLoggedIn);
	$: console.log(`🚀 ~ $currentUser:`, $currentUser);
</script>

<header
	class="border-slate-200 dark:border-slate-800 fixed left-0 right-0 top-0 z-30 w-full border-b bg-white dark:bg-black"
>
	<div class="flex h-16 items-center justify-between pr-4">
		<a
			href="/"
			class=" from-fuchsia-9 flex h-[4rem] w-16 items-center justify-center bg-gradient-to-tl from-blue-12 via-white/70 to-blue-12"
		>
			<img src="/images/metabrain-logo.svg" alt="Metabrain Logo" class="h-8 w-8 rounded-full" />
		</a>
		<div class="mx-auto max-w-2xl flex-1">
			<div class="relative">
				<IconSearch
					class="text-slate-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 transform"
					size={20}
				/>
				<input
					type="text"
					bind:value={searchQuery}
					placeholder="Search..."
					class="border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:ring-blue-500 dark:focus:ring-blue-400 placeholder-slate-400 dark:placeholder-slate-500 w-full rounded-lg border bg-white py-2 pl-10 pr-4 focus:border-transparent focus:outline-none focus:ring-2 dark:bg-black"
				/>
			</div>
		</div>
		<div class="flex items-center space-x-4">
			<DarkModeToggle />
			{#if isLoggedIn}
				<button
					class="rounded bg-blue-12 px-4 py-2 text-blue-1 hover:underline dark:bg-white dark:text-blue-12"
					on:click={logout}>Logout</button
				>
			{:else}
				<button
					class="rounded bg-blue-12 px-4 py-2 text-blue-1 hover:underline dark:bg-white dark:text-blue-12"
					on:click={() => goto('/register')}>Register</button
				>
			{/if}
		</div>
	</div>
</header>

<style>
	/* Add any additional styles here if needed */
</style>
