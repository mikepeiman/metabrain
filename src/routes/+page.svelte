<script lang="ts">
	import { onMount } from 'svelte';
	import { pb, currentUser, currentUserProfile } from '$utils/pocketbase';
	import UserProfile from '$components/UserProfile.svelte';
	// Subscribe to the stores
	$: user = $currentUser;
	$: profile = $currentUserProfile;
	onMount(async () => {
		console.log(`🚀 ~ currentUserProfile:`, $currentUserProfile);
		console.log(`🚀 ~ currentUser:`, $currentUser);
	});
</script>

<div class="mx-auto mt-8 w-full max-w-3xl px-4">
	<UserProfile  />
</div>
