<script lang="ts">
	import { onMount } from 'svelte';

	import { pb, currentUser } from '$utils/pocketbase';
	$: console.log(`currentUser ---`, $currentUser);
	const filter = `user = "${$currentUser.id}"`;
	console.log('Filter:', filter);
	let notes: any[] = [];

	onMount(async () => {
		try {
			if ($currentUser) {
				// Fetch entries that belong to the current user
				const resultList = await pb.collection('notes').getList(1, 50, {
					filter: `id = "${$currentUser.id}"`
				});
				notes = resultList.items;
			} else {
				console.log('No user is currently logged in');
			}
		} catch (error) {
			console.error('Error fetching notes:', error);
		}
	});
</script>

<div class="flex items-center justify-center text-black dark:text-white">
	<div class="flex">
		<ul>
			{#each notes as note}
				<li>{note.content}</li>
			{/each}
		</ul>
	</div>
</div>
