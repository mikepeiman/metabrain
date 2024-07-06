<!-- src/lib/components/TimelineView.svelte -->
<script>
    import { Timeline } from 'svelte-timeline';
    
    export let data;
  </script>
  
  <Timeline {data} />