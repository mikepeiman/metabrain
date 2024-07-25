<script lang="ts">
	import { onMount } from 'svelte';
	import { pb, currentUser, currentUserProfile } from '$utils/pocketbase';
	import UserProfile from '$components/UserProfile.svelte';
	import Login from '$components/Login.svelte';

	// Subscribe to the stores
	$: user = $currentUser;
	$: profile = $currentUserProfile;

	// Flag to determine if a user is logged in
	$: isLoggedIn = !!user;

	onMount(async () => {
		console.log(`🚀 ~ currentUserProfile:`, $currentUserProfile);
		console.log(`🚀 ~ currentUser:`, $currentUser);
	});
</script>

<div class="mx-auto mt-8 w-auto max-w-3xl px-4">
	{#if isLoggedIn}
		<UserProfile />
	{:else}
		<Login />
	{/if}
</div>