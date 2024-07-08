<!-- src/lib/components/DetailedMessageTable.svelte -->
<script>
    import { formatTime } from '$utils/analyzeSkypeChat';
    
    export let messages;
  
    function formatDate(date) {
      return new Date(date).toLocaleString();
    }
  </script>
  
  <div class="overflow-x-auto">
    <table class="min-w-full bg-white text-black">
      <thead class="bg-gray-100">
        <tr>
          <th class="px-4 py-2 text-left">Timestamp</th>
          <th class="px-4 py-2 text-left">Type</th>
          <th class="px-4 py-2 text-left">From</th>
          <th class="px-4 py-2 text-left">Interval Since Last</th>
          <th class="px-4 py-2 text-left">Duration/Length</th>
          <th class="px-4 py-2 text-left">Content</th>
        </tr>
      </thead>
      <tbody>
        {#each messages as message}
          <tr>
            <td class="border px-4 py-2">{formatDate(message.timestamp)}</td>
            <td class="border px-4 py-2">{message.type}</td>
            <td class="border px-4 py-2">{message.from}</td>
            <td class="border px-4 py-2">{formatTime(message.intervalSinceLast)}</td>
            <td class="border px-4 py-2">
              {#if message.type === "Event/Call"}
                {formatTime(message.duration)}
              {:else}
                {message.length} chars
              {/if}
            </td>
            <td class="border px-4 py-2">{message.content}</td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>