<script lang="ts">
    export let note: any;
  
    $: timestamps = note
      ? note.expand['properties(object_id)']
          .find((prop) => prop.key === 'content')
          ?.value.match(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/g) || []
      : [];
  </script>
  
  <ul class="p-2">
    {#each timestamps as timestamp}
      <li class="text-sm text-gray-600 mb-2">{new Date(timestamp).toLocaleString()}</li>
    {/each}
  </ul>