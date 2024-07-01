<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import MarkdownIt from 'markdown-it';
    import fuzzysort from 'fuzzysort';
  
    export let note: any;
    export let preparedTags: any[];
  
    const dispatch = createEventDispatcher();
    const md = new MarkdownIt();
  
    let content = '';
    let lastUpdateTimestamp = Date.now();
    let tagSuggestions: any[] = [];
    let tagInputActive = false;
    let currentTagInput = '';
  
    $: if (note) {
      const contentProperty = note.expand?.['properties(object_id)']?.find(
        (prop) => prop.key === 'content'
      );
      content = contentProperty ? JSON.parse(contentProperty.value) : '';
    }
  
    function handleInput(event) {
      const currentTimestamp = Date.now();
      if (currentTimestamp - lastUpdateTimestamp >= 60000) {
        content += '\n\n' + new Date().toISOString() + '\n';
        lastUpdateTimestamp = currentTimestamp;
      }
  
      const inputElement = event.target;
      const cursorPosition = inputElement.selectionStart;
      const textBeforeCursor = content.slice(0, cursorPosition);
      const lastHashIndex = textBeforeCursor.lastIndexOf('#');
  
      if (lastHashIndex !== -1 && !textBeforeCursor.slice(lastHashIndex).includes(' ')) {
        tagInputActive = true;
        currentTagInput = textBeforeCursor.slice(lastHashIndex + 1);
        tagSuggestions = fuzzysort.go(currentTagInput, preparedTags, {
          limit: 5,
          threshold: -10000,
          key: 'prepared'
        }).map(result => result.obj.original);
      } else {
        tagInputActive = false;
        tagSuggestions = [];
      }
  
      const newTags = extractNewTags(content);
      dispatch('update', { content, newTags });
    }
  
    function extractNewTags(text) {
      const tagRegex = /#(\w+)(?=\s|$)/g;
      const matches = text.match(tagRegex);
      return matches ? matches.map(tag => tag.slice(1)) : [];
    }
  
    function selectTag(tag) {
      const lastHashIndex = content.lastIndexOf('#');
      content = content.slice(0, lastHashIndex) + '#' + tag.expand['properties(object_id)'].find(p => p.key === 'name')?.value + ' ' + content.slice(lastHashIndex + currentTagInput.length + 1);
      tagInputActive = false;
      tagSuggestions = [];
    }
  </script>
  
  <div class="h-full flex flex-col relative">
    <textarea
      bind:value={content}
      on:input={handleInput}
      class="flex-1 p-2 resize-none"
      placeholder="Start writing your note..."
    ></textarea>
    {#if tagInputActive && tagSuggestions.length > 0}
      <div class="absolute bottom-0 left-0 bg-white border rounded shadow-lg">
        {#each tagSuggestions as tag}
          <div class="p-2 hover:bg-gray-100 cursor-pointer" on:click={() => selectTag(tag)}>
            {tag.expand['properties(object_id)'].find(p => p.key === 'name')?.value}
          </div>
        {/each}
      </div>
    {/if}
    <div class="p-2 bg-gray-100">
      {@html md.render(content)}
    </div>
  </div>