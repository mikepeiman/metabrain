<!-- src/routes/+page.svelte -->
<script>
    import { onMount } from 'svelte';
    import { importSkypeChat } from '$utils/importSkypeChat';
    import { analyzeSkypeChat } from '$utils/analyzeSkypeChat';
    import DataTable from '$lib/components/DataTable.svelte';
    import TimelineView from '$lib/components/TimelineView.svelte';
  
    let file;
    let analysisResult = null;
    let db;
  
    onMount(async () => {
      db = await importSkypeChat.initDB();
      const existingData = await db.chatData.toArray();
      if (existingData.length > 0) {
        analysisResult = await analyzeSkypeChat(existingData[0].data);
      }
    });
  
    async function handleFileImport() {
      if (file) {
        const fileContent = await file.text();
        const jsonData = JSON.parse(fileContent);
        await db.chatData.clear();
        await db.chatData.add({ data: jsonData });
        analysisResult = await analyzeSkypeChat(jsonData);
      }
    }
  </script>
  
  <main>
    <h1>Skype Chat Analyzer</h1>
    
    <input type="file" accept=".json" bind:files={file} on:change={handleFileImport}>
    
    {#if analysisResult}
      <h2>Analysis Results</h2>
      <DataTable data={analysisResult} />
      <TimelineView data={analysisResult.timeline} />
    {/if}
  </main>