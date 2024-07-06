<!-- src/routes/+page.svelte -->
<script>
    import { onMount } from 'svelte';
    import { importSkypeChat } from '$utils/importSkypeChat';
    import { analyzeSkypeChat } from '$utils/analyzeSkypeChat';
    import DataTable from '$lib/components/DataTable.svelte';
    import TimelineView from '$lib/components/TimelineView.svelte';
  
    let fileInput;
    let analysisResult = null;
    let error = null;  // Make sure this line is present
    let db;
  
    function formatDate(dateString) {
      return new Date(dateString).toLocaleDateString();
    }
  
    onMount(async () => {
      try {
        db = await importSkypeChat.initDB();
        const existingData = await db.chatData.toArray();
        if (existingData.length > 0) {
          analysisResult = await analyzeSkypeChat(existingData[0].data);
        }
      } catch (e) {
        console.error('Error during initialization:', e);
        error = 'Failed to initialize or load existing data.';
      }
    });
  
    async function handleFileImport() {
      if (fileInput && fileInput.files.length > 0) {
        try {
          const file = fileInput.files[0];
          const fileContent = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.readAsText(file);
          });
          
          const jsonData = JSON.parse(fileContent);
          await db.chatData.clear();
          await db.chatData.add({ data: jsonData });
          analysisResult = await analyzeSkypeChat(jsonData);
          error = null; // Clear any previous errors
        } catch (e) {
          console.error('Error during file import:', e);
          error = 'Failed to import or analyze the file. Please check the console for more details.';
          analysisResult = null;
        }
      }
    }
  </script>
  
  <main class="container mx-auto p-4 text-black">
    <h1 class="text-3xl font-bold mb-4">Skype Chat Analyzer</h1>
    
    <input 
      type="file" 
      accept=".json" 
      bind:this={fileInput} 
      on:change={handleFileImport}
      class="mb-4 p-2 border border-gray-300 rounded"
    >
    
    {#if error}
      <p class="text-red-600 mb-4">{error}</p>
    {/if}
  
    {#if analysisResult}
      <div class="bg-white shadow-md rounded p-6 mb-4">
        <h2 class="text-2xl font-semibold mb-2">Analysis Results for conversation with {analysisResult.displayName}</h2>
        <p class="mb-2">Analyzed Period: {formatDate(analysisResult.analyzedPeriod.start)} to {formatDate(analysisResult.analyzedPeriod.end)}</p>
        <p class="mb-2">Total Messages: {analysisResult.totalMessages}</p>
        <p class="mb-2">Total Calls: {analysisResult.totalCalls}</p>
      </div>
      <DataTable data={analysisResult} />
      <TimelineView data={analysisResult.timeline} />
    {/if}
  </main>