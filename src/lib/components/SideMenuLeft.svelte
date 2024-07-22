<script lang="ts">
  import { Home, CalendarDays, Layout, Settings, User } from 'lucide-svelte';
  import { IconNotes, IconSearch, IconPhoto } from '@tabler/icons-svelte';
  import * as Tooltip from "$lib/components/ui/tooltip/index.js";
  import { pb, currentUser, currentUserProfile } from '$utils/pocketbase';

  let isExpanded = false;

  const menuItems = [
    { href: '/', icon: Home, label: 'Home' },
    { href: '/today', icon: IconNotes, label: "Today's Note" },
    { href: '/calendar', icon: CalendarDays, label: 'Calendar View' },
    { href: '/command', icon: IconSearch, label: 'Quick Switcher' },
    { href: '/dashboard', icon: Layout, label: 'Layouts Dashboard' },
    { href: '/gallery', icon: IconPhoto, label: 'Media Gallery' },
  ];

  const recentFiles = [
    { name: 'Document 1', href: '/file1' },
    { name: 'Image 2', href: '/file2' },
    { name: 'Note 3', href: '/file3' },
  ];

  $: profile = $currentUserProfile;
  $: avatarPreview = profile?.avatar ? pb.getFileUrl(profile, profile.avatar) : null;

  function toggleSidebar() {
    isExpanded = !isExpanded;
  }
</script>

<aside on:click={toggleSidebar} class="fixed inset-y-0 left-0 z-20 flex flex-col border-r dark:bg-black bg-black transition-all duration-300 ease-in-out {isExpanded ? 'w-64' : 'w-16'}">
  <nav class="flex flex-col gap-2 px-2 py-4 flex-grow overflow-y-auto">
    {#each menuItems as item}
      <Tooltip.Root>
        <Tooltip.Trigger asChild let:builder>
          <a
            href={item.href}
            class="sidebar-item flex items-center rounded-lg text-muted-foreground transition-colors hover:text-foreground hover:bg-accent p-2 w-full h-8"
            use:builder.action
            {...builder}
          >
            <div class="w-5 h-5 flex items-center justify-center flex-shrink-0">
              <svelte:component this={item.icon} class="h-5 w-5" />
            </div>
            {#if isExpanded}
              <span class="ml-3 whitespace-nowrap overflow-hidden text-ellipsis">{item.label}</span>
            {/if}
            <span class="sr-only">{item.label}</span>
          </a>
        </Tooltip.Trigger>
        <Tooltip.Content side="right">{item.label}</Tooltip.Content>
      </Tooltip.Root>
    {/each}

    {#if isExpanded}
      <div class="w-full border-t border-border my-4"></div>
      <div class="w-full">
        <h3 class="mb-2 text-sm font-semibold text-foreground px-2">Recent Files</h3>
        <ul class="space-y-1">
          {#each recentFiles as file}
            <li>
              <a href={file.href} class=" flex items-center text-sm text-muted-foreground hover:text-foreground p-2 rounded-lg hover:bg-accent">
                <div class="w-4 h-4 flex items-center justify-center flex-shrink-0">
                  <IconNotes class="h-4 w-4" />
                </div>
                <span class="ml-3 whitespace-nowrap overflow-hidden text-ellipsis">{file.name}</span>
              </a>
            </li>
          {/each}
        </ul>
      </div>
    {/if}
  </nav>

  <div class="mt-auto flex flex-col gap-2 px-2 py-4">
    <Tooltip.Root>
      <Tooltip.Trigger asChild let:builder>
        <a
          href="/settings"
          class="flex items-center rounded-lg text-muted-foreground transition-colors hover:text-foreground hover:bg-accent p-2 w-full"
          use:builder.action
          {...builder}
        >
          <div class="w-5 h-5 flex items-center justify-center flex-shrink-0">
            <Settings class="h-5 w-5" />
          </div>
          {#if isExpanded}
            <span class="ml-3 whitespace-nowrap overflow-hidden text-ellipsis">Settings</span>
          {/if}
          <span class="sr-only">Settings</span>
        </a>
      </Tooltip.Trigger>
      <Tooltip.Content side="right">Settings</Tooltip.Content>
    </Tooltip.Root>

    <div class="flex items-center p-2">
      {#if avatarPreview}
        <img
          src={avatarPreview}
          alt="User Avatar"
          class="w-9 h-9 rounded-full"
        />
      {:else}
        <div class="w-9 h-9 rounded-full bg-muted flex items-center justify-center">
          <span class="text-muted-foreground text-sm">{profile?.firstname?.[0] || 'U'}</span>
        </div>
      {/if}
      {#if isExpanded}
        <span class="ml-3 whitespace-nowrap overflow-hidden text-ellipsis text-muted-foreground">{profile?.firstname || 'User'}</span>
      {/if}
    </div>
  </div>
</aside>


<style>

.sidebar-item {
  background: rgba(255, 255, 255, 0.05);
}
</style>