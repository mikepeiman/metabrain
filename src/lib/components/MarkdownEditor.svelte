<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import MarkdownIt from 'markdown-it';
  
    export let note: any;
  
    const dispatch = createEventDispatcher();
    const md = new MarkdownIt();
  
    let content = '';
    let lastUpdateTimestamp = Date.now();
  
    $: if (note) {
      const contentProperty = note.expand['properties(object_id)'].find(
        (prop) => prop.key === 'content'
      );
      content = contentProperty ? JSON.parse(contentProperty.value) : '';
    }
  
    function handleInput() {
      const currentTimestamp = Date.now();
      if (currentTimestamp - lastUpdateTimestamp >= 60000) {
        content += '\n\n' + new Date().toISOString() + '\n';
        lastUpdateTimestamp = currentTimestamp;
      }
      dispatch('update', content);
    }
  </script>
  
  <div class="h-full flex flex-col">
    <textarea
      bind:value={content}
      on:input={handleInput}
      class="flex-1 p-2 resize-none"
      placeholder="Start writing your note..."
    ></textarea>
    <div class="p-2 bg-gray-100">
      {@html md.render(content)}
    </div>
  </div>