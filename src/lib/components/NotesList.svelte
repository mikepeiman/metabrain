<script lang="ts">
    import { createEventDispatcher } from 'svelte';
  
    export let notes: any[];
  
    const dispatch = createEventDispatcher();
  
    function selectNote(note) {
      dispatch('select', note);
    }
  </script>
  
  <ul class="space-y-2">
    {#each notes as note}
      <li
        class="cursor-pointer hover:bg-gray-200 p-2 rounded"
        on:click={() => selectNote(note)}
      >
        {note.expand['properties(object_id)'].find((prop) => prop.key === 'content')?.value.substring(0, 50)}...
      </li>
    {/each}
  </ul>