<!-- src/lib/components/DataTable.svelte -->
<script>
    import { onMount } from 'svelte';
    import Papa from 'papaparse';
  
    export let data;
    let csvString;
  
    onMount(() => {
      const flatData = {
        'Message Intervals (Average)': data.messageIntervals.average,
        'Message Intervals (Min)': data.messageIntervals.min,
        'Message Intervals (Max)': data.messageIntervals.max,
        'Message Intervals (Median)': data.messageIntervals.median,
        'Call Intervals (Average)': data.callIntervals.average,
        'Call Intervals (Min)': data.callIntervals.min,
        'Call Intervals (Max)': data.callIntervals.max,
        'Call Intervals (Median)': data.callIntervals.median,
        'Call Durations (Average)': data.callDurations.average,
        'Call Durations (Min)': data.callDurations.min,
        'Call Durations (Max)': data.callDurations.max,
        'Call Durations (Median)': data.callDurations.median,
        'Sentiment (Average)': data.sentiments.average,
        'Sentiment (Min)': data.sentiments.min,
        'Sentiment (Max)': data.sentiments.max,
        'Sentiment (Median)': data.sentiments.median,
      };
      csvString = Papa.unparse([flatData]);
    });
  </script>
  
  <div>
    <h3>Analysis Results</h3>
    <pre>{csvString}</pre>
  </div>