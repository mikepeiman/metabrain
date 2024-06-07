<script lang="ts">
    import * as Resizable from "$lib/components/ui/resizable/index.js";
    import CommandPalette from "$lib/components/CommandPalette.svelte";
  </script>
   
  <Resizable.PaneGroup direction="horizontal" class="w-full h-screen rounded-lg border">
    <Resizable.Pane defaultSize={120}>
      <div class="flex h-[200px] items-center justify-center p-6 bg-slate-600">
        <span class="font-semibold">One</span>
      </div>
    </Resizable.Pane>
    <Resizable.Handle />
    <Resizable.Pane defaultSize={500}>
      <Resizable.PaneGroup direction="vertical">
        <Resizable.Pane defaultSize={250}>
          <div class="flex h-full items-center justify-center p-6">
            <CommandPalette />
          </div>
        </Resizable.Pane>
        <Resizable.Handle />
        <Resizable.Pane defaultSize={275}>
          <div class="flex h-full items-center justify-center p-6">
            <span class="font-semibold">Three</span>
          </div>
        </Resizable.Pane>
      </Resizable.PaneGroup>
    </Resizable.Pane>
  </Resizable.PaneGroup>
  