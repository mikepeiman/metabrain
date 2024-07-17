<!-- src/lib/components/DataTable.svelte -->
<script>
    export let data;
  
    /**
	 * @param {number | undefined} seconds
	 */
    function formatTime(seconds) {
      if (seconds === undefined || isNaN(seconds)) return 'N/A';
      return `${(seconds / 60).toFixed(2)} minutes`;
    }
  
    /**
	 * @param {number | null | undefined} stat
	 */
    function formatStat(stat) {
      if (stat === undefined || stat === null) return 'N/A';
      return formatTime(stat);
    }
  </script>
  
  <div class="overflow-x-auto">
    <table class="min-w-full bg-white text-black">
      <thead class="bg-gray-100">
        <tr>
          <th class="px-4 py-2 text-left">Metric</th>
          <th class="px-4 py-2 text-left">Average</th>
          <th class="px-4 py-2 text-left">Min</th>
          <th class="px-4 py-2 text-left">Max</th>
          <th class="px-4 py-2 text-left">Median</th>
        </tr>
      </thead>
      <tbody>
        {#if data.messageIntervals}
          <tr>
            <td class="border px-4 py-2">Message Intervals</td>
            <td class="border px-4 py-2">{formatStat(data.messageIntervals.average)}</td>
            <td class="border px-4 py-2">{formatStat(data.messageIntervals.min)}</td>
            <td class="border px-4 py-2">{formatStat(data.messageIntervals.max)}</td>
            <td class="border px-4 py-2">{formatStat(data.messageIntervals.median)}</td>
          </tr>
        {/if}
        {#if data.callIntervals}
          <tr>
            <td class="border px-4 py-2">Call Intervals</td>
            <td class="border px-4 py-2">{formatStat(data.callIntervals.average)}</td>
            <td class="border px-4 py-2">{formatStat(data.callIntervals.min)}</td>
            <td class="border px-4 py-2">{formatStat(data.callIntervals.max)}</td>
            <td class="border px-4 py-2">{formatStat(data.callIntervals.median)}</td>
          </tr>
        {/if}
        {#if data.callDurations}
          <tr>
            <td class="border px-4 py-2">Call Durations</td>
            <td class="border px-4 py-2">{formatStat(data.callDurations.average)}</td>
            <td class="border px-4 py-2">{formatStat(data.callDurations.min)}</td>
            <td class="border px-4 py-2">{formatStat(data.callDurations.max)}</td>
            <td class="border px-4 py-2">{formatStat(data.callDurations.median)}</td>
          </tr>
        {/if}
      </tbody>
    </table>
  </div>