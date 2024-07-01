<script>
  import { pb, currentUser } from '$utils/pocketbase';
  import { onMount } from 'svelte';
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();

  let notes = [];
  let error = null;

  onMount(async () => {
    if ($currentUser) {
      await loadNotes();
    }
  });

  $: if ($currentUser) {
    loadNotes();
  }

  async function loadNotes() {
    try {
      error = null;
      const resultList = await pb.collection('notes').getList(1, 50, {
        filter: `user_id = "${$currentUser.id}"`,
        sort: '-created',
      });
      notes = resultList.items;
    } catch (err) {
      console.error('Failed to load notes', err);
      error = `Failed to load notes: ${err.message}`;
      if (err.data) {
        console.error('Error data:', err.data);
      }
    }
  }

  function selectNote(note) {
    dispatch('noteSelect', note);
  }
</script>

{#if error}
  <p class="text-red-500">{error}</p>
{:else}
  <ul>
    {#each notes as note}
      <li on:click={() => selectNote(note)}>{note.date}</li>
    {/each}
  </ul>
{/if}