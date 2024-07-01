<script lang="ts">
    import { createEventDispatcher } from 'svelte';
  
    export let notes: any[];
  
    const dispatch = createEventDispatcher();
  
    function selectNote(note) {
      dispatch('select', note);
    }
  
    function getNoteContent(note) {
      const contentProperty = note.expand?.['properties(object_id)']?.find(
        prop => prop.key === 'content'
      );
      return contentProperty ? JSON.parse(contentProperty.value) : '';
    }
  </script>
  
  <ul class="space-y-2">
    {#each notes as note}
      <li
        class="cursor-pointer hover:bg-gray-200 p-2 rounded"
        on:click={() => selectNote(note)}
      >
        {getNoteContent(note).substring(0, 50)}...
      </li>
    {/each}
  </ul>