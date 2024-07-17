<script lang="ts">
	import * as Resizable from '$lib/components/ui/resizable/index.js';

	import Button from '$lib/components/ui/button/button.svelte';
	// import Notes from '$lib/components/Notes.svelte';
	import PocketBase from 'pocketbase';
	import { onMount } from 'svelte';
	import MilkdownNotes from '@/components/MilkdownNotes.svelte';

  import { currentUser, currentUserProfile, getCurrentUser, getUserProfile } from '$utils/pocketbase';

// Subscribe to the stores
$: user = $currentUser;
$: profile = $currentUserProfile;

	onMount(async () => {
		console.log(`🚀 ~ currentUserProfile:`, $currentUserProfile);
		console.log(`🚀 ~ currentUser:`, $currentUser);
	});
</script>

<div class="flex w-screen flex-col items-center justify-center">
  {#if user}
  <p>Welcome, {user.email}</p>
  {#if profile}
      <p>Your name is {profile.username}</p>
  {/if}
{/if}
</div>
