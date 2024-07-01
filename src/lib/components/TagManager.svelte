<script lang="ts">
    import { createEventDispatcher } from 'svelte';
  
    export let tags: any[];
  
    const dispatch = createEventDispatcher();
  
    let newTagName = '';
  
    function createTag() {
      if (newTagName.trim()) {
        dispatch('createTag', newTagName.trim());
        newTagName = '';
      }
    }
  
    function tagNote(tagId) {
      dispatch('tagNote', tagId);
    }
  </script>
  
  <div class="mt-4">
    <h3 class="font-bold mb-2">Tags</h3>
    <ul class="space-y-1">
      {#each tags as tag}
        <li>
          <button
            class="text-sm bg-blue-100 text-blue-800 rounded px-2 py-1"
            on:click={() => tagNote(tag.id)}
          >
            {tag.expand['properties(object_id)'].find((prop) => prop.key === 'name')?.value}
          </button>
        </li>
      {/each}
    </ul>
    <div class="mt-2 flex">
      <input
        type="text"
        bind:value={newTagName}
        placeholder="New tag name"
        class="flex-1 border rounded p-1 text-sm"
      />
      <button
        on:click={createTag}
        class="ml-2 bg-blue-500 text-white rounded px-2 py-1 text-sm"
      >
        Add
      </button>
    </div>
  </div>