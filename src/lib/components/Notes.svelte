<script lang="ts">
	import PocketBase from 'pocketbase';
	import { onMount } from 'svelte';

	const pb = new PocketBase('http://127.0.0.1:8090');
	let notes: any[] = [];

	onMount(async () => {
		try {
			// If authentication is required, add this line:
			await pb.admins.authWithPassword('mikepeiman@gmail.com', 'admin12345');

			notes = await pb.collection('notes').getFullList({
				sort: '-created'
			});
		} catch (error) {
			console.error('Error fetching notes:', error);
		}
	});
</script>

<div class="flex  items-center justify-center text-black dark:text-white ">
<div class="flex">
	<ul>
		{#each notes as note}
			<li>{note.content}</li>
		{/each}
	</ul>
</div>
</div>