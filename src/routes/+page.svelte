<script lang="ts">
	import * as Resizable from '$lib/components/ui/resizable/index.js';

	import Button from '$lib/components/ui/button/button.svelte';
	// import Notes from '$lib/components/Notes.svelte';
	import PocketBase from 'pocketbase';
	import { onMount } from 'svelte';
	import MilkdownNotes from '@/components/MilkdownNotes.svelte';

	import { pb, currentUser, currentUserProfile } from '$utils/pocketbase';

	onMount(async () => {
		console.log(`🚀 ~ currentUserProfile:`, currentUserProfile);
		console.log(`🚀 ~ currentUser:`, currentUser);
	});
</script>

<div class="flex w-screen flex-col items-center justify-center">
	{#if $currentUser}
		<h1>Welcome to Metabrain {$currentUserProfile.username}!</h1>
	{/if}
</div>
