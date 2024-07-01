<script lang="ts">
    import { createEventDispatcher, onMount } from 'svelte';
    import MarkdownIt from 'markdown-it';
    import fuzzysort from 'fuzzysort';
  
    export let note: any;
    export let preparedTags: any[];
    export let notes: any[];
  
    const dispatch = createEventDispatcher();
    const md = new MarkdownIt();
  
    let content = '';
    let lastUpdateTimestamp = Date.now();
  
    onMount(() => {
      const savedContent = localStorage.getItem('currentNoteContent');
      if (savedContent) {
        content = savedContent;
      }
    });
  
    $: {
      if (note) {
        const contentProperty = note.expand?.['properties(object_id)']?.find(
          (prop) => prop.key === 'content'
        );
        content = contentProperty ? JSON.parse(contentProperty.value) || '' : '';
        localStorage.setItem('currentNoteContent', content);
      }
    }
  
    function handleInput(event) {
      content = event.target.value;
      localStorage.setItem('currentNoteContent', content);
      const newTags = extractNewTags(content);
      dispatch('update', { content, newTags });
    }
  
    function extractNewTags(text) {
      const tagRegex = /#(\w+)/g;
      const matches = text.match(tagRegex);
      return matches ? [...new Set(matches.map(tag => tag.slice(1)))] : [];
    }
  
    function selectNote(selectedNote) {
      dispatch('select', selectedNote);
    }
  </script>
  
  <div class="flex h-full w-full text-black">
    <div class="w-64 border-r border-gray-200 p-4">
      <h2 class="text-xl font-bold mb-4">Notes</h2>
      <ul>
        {#each notes as noteItem}
          <li
            class="cursor-pointer p-2 hover:bg-gray-100"
            on:click={() => selectNote(noteItem)}
          >
            {noteItem.id}
          </li>
        {/each}
      </ul>
    </div>
    <div class="flex-1 flex flex-col p-4">
      <textarea
        bind:value={content}
        on:input={handleInput}
        class="flex-1 p-2 resize-none border rounded bg-white text-black"
        placeholder="Start writing your note..."
      />
      <div class="mt-4 p-2 bg-gray-100 rounded">
        {@html md.render(content)}
      </div>
    </div>
  </div>