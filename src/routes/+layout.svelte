<script lang="ts">
	import '../app.css';
	import { register } from '@tauri-apps/plugin-global-shortcut';
	import CommandPalette from '$lib/components/CommandPalette.svelte';
	import { Toaster } from '$lib/components/ui/sonner';
	import MambaHeader from '$lib/components/MambaHeader.svelte';
	import SideMenuLeft from '$components/SideMenuLeft.svelte';
	import Login from '$components/Login.svelte';
	import Register from '$components/Register.svelte';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { pb, currentUser } from '$utils/pocketbase';
	import { invoke } from '@tauri-apps/api/tauri';
	import { browser } from '$app/environment';
	import {
		saveWindowState,
		restoreStateCurrent,
		StateFlags
	} from '@tauri-apps/plugin-window-state';

	let isLoggedIn = false;

	onMount(async () => {
		if (browser && window.__TAURI_IPC__) {
			try {
				const response = await invoke('greet', { name: 'Mike' });
				console.log(response);
			} catch (error) {
				console.error('Error invoking Tauri command:', error);
			}
			const unlisten = window.__TAURI__.event.listen('navigate', (event) => {
				goto(event.payload);
			});
			// Save the state of all open windows
			saveWindowState(StateFlags.ALL);
			
			// Restore the state of the current window
			restoreStateCurrent(StateFlags.ALL);
			return () => {
				unlisten();
			};
		}
		
		// Check if the user is logged in
		isLoggedIn = pb.authStore.isValid;

		// Subscribe to auth state changes
		pb.authStore.onChange((auth) => {
			isLoggedIn = auth;
			if (!isLoggedIn) {
				goto('/login'); // Redirect to login page if logged out
			}
		});
	});

	// Function to handle successful login
	function handleLogin() {
		isLoggedIn = true;
		goto('/'); // Redirect to home page after login
	}
	function handleRegister() {
		isLoggedIn = true;
		goto('/'); // Redirect to home page after registration
	}

	$: isRegisterRoute = $page.url.pathname === '/register';
	$: isSplashscreen = $page.url.pathname === '/splashscreen';
</script>

<div id="app" class="bg-zinc-100 absolute flex min-h-screen w-full text-white dark:bg-black">
	{#if isSplashscreen}
		<slot></slot>
	{:else}
		<MambaHeader />
		<SideMenuLeft />
		<div class="layout-wrapper flex h-full w-full items-center justify-center overflow-y-hidden">
			{#if isLoggedIn}
				<CommandPalette />
				<Toaster />
				<slot></slot>
			{:else if isRegisterRoute}
				<Register on:register={handleRegister} />
			{:else}
				<Login on:login={handleLogin} />
			{/if}
		</div>
	{/if}
</div>

<style>
	#app {
		left: var(--sidebar-width);
		width: calc(100% - var(--sidebar-width));
		height: 100%;
		transition: all 0.3s ease;
	}
</style>
