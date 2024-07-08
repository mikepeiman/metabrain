<!-- src/lib/components/DetailedMessageTable.svelte -->
<script>
    import { formatTimeInterval } from '$utils/analyzeSkypeChat';
    
    export let groupedMessagesList;
  
    function formatDate(dateString) {
      return new Date(dateString).toLocaleString();
    }

    function setRowSpan(node, count) {
    node.style.setProperty('--row-span', count);
  }
  </script>
  
  <div class="message-table">
    <div class="header">
      <div class="timestamp">Timestamp</div>
      <div class="interval">Interval Since Last</div>
      <div class="type">Type</div>
      <div class="from">From</div>
      <div class="duration">Duration/Length</div>
      <div class="content">Content</div>
    </div>
    
    {#each groupedMessagesList as group}
      <div class="group-container">
        <div class="timestamp" rowspan={group.messagesInGroup.length}>{formatDate(group.groupTimestamp)}</div>
        <div class="interval" rowspan={group.messagesInGroup.length}>{formatTimeInterval(group.timeSincePreviousGroup)}</div>
        <div class="type">
          <div>{group.messageType}</div>
          <div class="item-count">{group.messagesInGroup.length} item(s)</div>
        </div>
        {#each group.messagesInGroup as message, index}
          <div class="message-row" class:first-in-group={index === 0}>
            <div class="from">{message.senderInfo}</div>
            <div class="duration">
              {#if message.messageType === "Event/Call"}
                {formatTimeInterval(message.callDuration)}
              {:else}
                {message.contentLength} chars
              {/if}
            </div>
            <div class="content">
              {message.messageContent}
              <br>
              <span class="exact-time">
                Exact time: {message.exactTimestamp.toLocaleString()}
              </span>
              {#if group.uniqueMessages.get(message.messageContent) > 1}
                <span class="duplicate-count">
                  (x{group.uniqueMessages.get(message.messageContent)})
                </span>
              {/if}
            </div>
          </div>
        {/each}
      </div>
    {/each}
  </div>
  
  <style>
    .message-table {
      display: grid;
      grid-template-columns: auto auto auto auto auto 1fr;
      gap: 1px;
      background-color: #e5e7eb;
      border: 1px solid #d1d5db;
      overflow-x: auto;
    }
  
    .header {
      display: contents;
    }
  
    .header > div {
      background-color: #f3f4f6;
      font-weight: bold;
      padding: 0.5rem 1rem;
    }
  
    .group-container {
      display: contents;
    }
  
    .message-row {
      display: contents;
    }
  
    .group-container > div,
    .message-row > div {
      background-color: white;
      padding: 0.5rem 1rem;
      border-bottom: 1px solid #e5e7eb;
    }
  
    .message-row.first-in-group > div {
      border-top: 2px solid #d1d5db;
    }
  
    .timestamp, .interval, .type {
      grid-row: span var(--row-span, 1);
    }
  
    .type {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
  
    .item-count {
      font-size: 0.8em;
      color: #6b7280;
    }
  
    .exact-time {
      font-size: 0.75rem;
      color: #6b7280;
    }
  
    .duplicate-count {
      font-size: 0.875rem;
      color: #6b7280;
      margin-left: 0.5rem;
    }
  </style>