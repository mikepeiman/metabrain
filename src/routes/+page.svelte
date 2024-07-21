<script lang="ts">
	import { onMount } from 'svelte';
	import { currentUser, currentUserProfile } from '$utils/pocketbase';

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
