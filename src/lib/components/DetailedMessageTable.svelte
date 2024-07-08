<!-- src/lib/components/DetailedMessageTable.svelte -->
<script>
    import { formatTimeInterval, formatTimeDifference } from '$utils/analyzeSkypeChat';
    
    export let groupedMessagesList;
  
    function formatDate(dateString) {
      return new Date(dateString).toLocaleString();
    }
  </script>
  
  <div class="grid grid-rows-[auto,1fr] h-full overflow-hidden border border-gray-300">
    <div class="grid grid-cols-[auto,auto,auto,auto,auto,1fr] gap-px bg-gray-100 sticky top-0 z-10">
      <div class="p-2 font-bold bg-gray-100">Timestamp</div>
      <div class="p-2 font-bold bg-gray-100">Interval</div>
      <div class="p-2 font-bold bg-gray-100">Type</div>
      <div class="p-2 font-bold bg-gray-100">From</div>
      <div class="p-2 font-bold bg-gray-100">Duration/Length</div>
      <div class="p-2 font-bold bg-gray-100">Content</div>
    </div>
    
    <div class="overflow-y-auto flex flex-col">
      {#each groupedMessagesList as group}
        <div class="grid grid-cols-[auto,auto,auto,auto,auto,1fr] border-b-2 border-gray-300">
          <div class=" gap-px bg-gray-50">
            <div class="p-2 bg-white">{formatDate(group.groupTimestamp)}</div>
            <div class="p-2 bg-white">{formatTimeDifference(group.timeSincePreviousGroup)}</div>
            <div class="p-2 bg-white">
              <div>{group.messageType}</div>
              <div class="text-sm text-gray-500">{group.messagesInGroup.length} item(s)</div>
            </div>
          </div>
          <div class="flex flex-col">
            {#each group.messagesInGroup as message}
              <div class="grid grid-cols-[auto,auto,1fr] gap-px">
                <div class="p-2 bg-white">{message.senderInfo}</div>
                <div class="p-2 bg-white">
                  {#if message.messageType === "Event/Call"}
                    {formatTimeInterval(message.callDuration)}
                  {:else}
                    {message.contentLength} chars
                  {/if}
                </div>
                <div class="p-2 bg-white whitespace-pre-wrap">
                  {message.messageContent}
                  <br>
                  <span class="text-xs text-gray-500">
                    Exact time: {message.exactTimestamp.toLocaleString()}
                  </span>
                  {#if group.uniqueMessages.get(message.messageContent) > 1}
                    <span class="text-sm text-gray-500 ml-2">
                      (x{group.uniqueMessages.get(message.messageContent)})
                    </span>
                  {/if}
                </div>
              </div>
            {/each}
          </div>
        </div>
      {/each}
    </div>
  </div>