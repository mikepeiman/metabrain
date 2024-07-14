<!-- src/lib/components/DetailedMessageTable.svelte -->
<script>
    import { formatTimeInterval, formatTimeDifference } from '$utils/analyzeSkypeChat';
    
    export let groupedMessagesList;
  
    function formatDate(dateString) {
      return new Date(dateString).toLocaleString();
    }
</script>

<div class="grid grid-rows-[auto,1fr] h-full overflow-hidden border border-slate-6 dark:border-slate-7">
  <div class="grid grid-cols-[auto,auto,auto,auto,auto,1fr] gap-px bg-slate-2 dark:bg-slate-12 sticky top-0 z-10">
    <div class="p-2 font-bold bg-slate-2 text-slate-12 dark:bg-slate-12 dark:text-slate-1">Timestamp</div>
    <div class="p-2 font-bold bg-slate-2 text-slate-12 dark:bg-slate-12 dark:text-slate-1">Interval</div>
    <div class="p-2 font-bold bg-slate-2 text-slate-12 dark:bg-slate-12 dark:text-slate-1">Type</div>
    <div class="p-2 font-bold bg-slate-2 text-slate-12 dark:bg-slate-12 dark:text-slate-1">From</div>
    <div class="p-2 font-bold bg-slate-2 text-slate-12 dark:bg-slate-12 dark:text-slate-1">Duration/Length</div>
    <div class="p-2 font-bold bg-slate-2 text-slate-12 dark:bg-slate-12 dark:text-slate-1">Content</div>
  </div>
  
  <div class="overflow-y-auto flex flex-col">
    {#each groupedMessagesList as group}
      <div class="grid grid-cols-[auto,auto,auto,auto,auto,1fr] border-b-2 border-slate-6 dark:border-slate-7">
        <div class="gap-px bg-slate-3 dark:bg-slate-10">
          <div class="p-2 bg-slate-1 text-slate-12 dark:bg-slate-12 dark:text-slate-1">{formatDate(group.groupTimestamp)}</div>
          <div class="p-2 bg-slate-1 text-slate-12 dark:bg-slate-12 dark:text-slate-1">{formatTimeDifference(group.timeSincePreviousGroup)}</div>
          <div class="p-2 bg-slate-1 text-slate-12 dark:bg-slate-12 dark:text-slate-1">
            <div>{group.messageType}</div>
            <div class="text-sm text-slate-11 dark:text-slate-3">{group.messagesInGroup.length} item(s)</div>
          </div>
        </div>
        <div class="flex flex-col">
          {#each group.messagesInGroup as message}
            <div class="grid grid-cols-[auto,auto,1fr] gap-px">
              <div class="p-2 bg-slate-1 text-slate-12 dark:bg-slate-12 dark:text-slate-1">{message.senderInfo}</div>
              <div class="p-2 bg-slate-1 text-slate-12 dark:bg-slate-12 dark:text-slate-1">
                {#if message.messageType === "Event/Call"}
                  {formatTimeInterval(message.callDuration)}
                {:else}
                  {message.contentLength} chars
                {/if}
              </div>
              <div class="p-2 bg-slate-1 text-slate-12 dark:bg-slate-12 dark:text-slate-1 whitespace-pre-wrap">
                {message.messageContent}
                <br>
                <span class="text-xs text-slate-11 dark:text-slate-3">
                  Exact time: {message.exactTimestamp.toLocaleString()}
                </span>
                {#if group.uniqueMessages.get(message.messageContent) > 1}
                  <span class="text-sm text-slate-11 dark:text-slate-3 ml-2">
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