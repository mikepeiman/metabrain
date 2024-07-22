<script lang="ts">
  import { Home, CalendarDays, Layout, Settings, User } from 'lucide-svelte';
  import { IconNotes, IconSearch, IconPhoto } from '@tabler/icons-svelte';
  import * as Tooltip from "$lib/components/ui/tooltip/index.js";

  const menuItems = [
    { href: '/', icon: Home, label: 'Home' },
    { href: '/today', icon: IconNotes, label: "Today's Note" },
    { href: '/calendar', icon: CalendarDays, label: 'Calendar View' },
    { href: '/command', icon: IconSearch, label: 'Quick Switcher' },
    { href: '/dashboard', icon: Layout, label: 'Layouts Dashboard' },
    { href: '/gallery', icon: IconPhoto, label: 'Media Gallery' },
  ];

  const bottomMenuItem = {
    href: '/settings',
    icon: Settings,
    label: 'User Settings'
  };
</script>

<aside class="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex">
  <nav class="flex flex-col items-center gap-4 px-2 py-4">
    <a
      href="/"
      class="group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:h-8 md:w-8 md:text-base"
    >
      <User class="h-4 w-4 transition-all group-hover:scale-110" />
      <span class="sr-only">Metabrain</span>
    </a>
    {#each menuItems as item}
      <Tooltip.Root>
        <Tooltip.Trigger asChild let:builder>
          <a
            href={item.href}
            class="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
            use:builder.action
            {...builder}
          >
            <svelte:component this={item.icon} class="h-5 w-5" />
            <span class="sr-only">{item.label}</span>
          </a>
        </Tooltip.Trigger>
        <Tooltip.Content side="right">{item.label}</Tooltip.Content>
      </Tooltip.Root>
    {/each}
  </nav>
  <nav class="mt-auto flex flex-col items-center gap-4 px-2 py-4">
    <Tooltip.Root>
      <Tooltip.Trigger asChild let:builder>
        <a
          href={bottomMenuItem.href}
          class="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
          use:builder.action
          {...builder}
        >
          <svelte:component this={bottomMenuItem.icon} class="h-5 w-5" />
          <span class="sr-only">{bottomMenuItem.label}</span>
        </a>
      </Tooltip.Trigger>
      <Tooltip.Content side="right">{bottomMenuItem.label}</Tooltip.Content>
    </Tooltip.Root>
  </nav>
</aside>