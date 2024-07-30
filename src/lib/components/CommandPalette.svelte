<script lang="ts">
	import Calendar from 'svelte-radix/Calendar.svelte';
	import EnvelopeClosed from 'svelte-radix/EnvelopeClosed.svelte';
	import Face from 'svelte-radix/Face.svelte';
	import Gear from 'svelte-radix/Gear.svelte';
	import Person from 'svelte-radix/Person.svelte';
	import Rocket from 'svelte-radix/Rocket.svelte';
	import Exit from 'svelte-radix/Exit.svelte';
	import { logout } from '$utils/pocketbase';
	import * as Command from '$lib/components/ui/command/index.js';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	let open = false;

	const navigationItems = [
    { label: 'Home', path: '/' },
    { label: 'Skype parsing', path: '/skype' },
    { label: 'Notes Milkdown', path: '/notes' },
    { label: 'Notes EditorJS', path: '/notes2' },
    { label: 'Dashboard', path: '/dashboard' }
  ];

  const suggestionItems = [
    { label: 'Calendar', icon: Calendar },
    { label: 'Search Emoji', icon: Face },
    { label: 'Launch', icon: Rocket }
  ];

  const settingsItems = [
    { label: 'Profile', icon: Person, shortcut: '⌘P' },
    { label: 'Settings', icon: Gear, shortcut: '⌘S' },
    { label: 'Logout', icon: Exit, shortcut: '⌘Q', action: logout }
  ];

	function getInputElement(): HTMLInputElement | null {
		return document.querySelector('[data-cmdk-input]');
	}

	function handleGlobalKeydown(e: KeyboardEvent) {
		// console.log(`🚀 ~ handleGlobalKeydown ~ e:`, e)
		if ((e.key === 'k' || e.key === 'p') && (e.metaKey || e.ctrlKey)) {
			e.preventDefault();
			// open = !open;
			open = true
		} else if (e.key === 'Escape' || e.key === 'Enter') {
      open = false
    }
	}
	onMount(() => {
		document.addEventListener('keydown', handleGlobalKeydown);

		return () => {
			document.removeEventListener('keydown', handleGlobalKeydown);
		};
	});

	function handleSelect(path: string) {
		console.log(`🚀 ~ handleSelect ~ path:`, path)
		goto(path);
		open = false;
	}

	function handleKeydown(event: KeyboardEvent, path: string) {
		console.log(`🚀 ~ handleKeydown ~ event:`, event)
		if (event.key === 'Enter' || event.key === 'Tab') {
			event.preventDefault();
			handleSelect(path);
		}
	}
</script>

<Command.Dialog bind:open class="max-w-[450px] rounded-lg border shadow-md">
	<Command.Input placeholder="Type a command or search..." />
	<Command.List>
	  <Command.Empty>No results found.</Command.Empty>
	  <Command.Group heading="Navigation">
		{#each navigationItems as item}
		  <Command.Item onSelect={() => handleSelect(item.path)}>
			<button
			  class="w-full text-start focus:outline-none"
			  on:click={() => handleSelect(item.path)}
			  on:keydown={(e) => handleKeydown(e, item.path)}
			>
			  {item.label}
			</button>
		  </Command.Item>
		{/each}
	  </Command.Group>
  
	  <Command.Group heading="Suggestions">
		{#each suggestionItems as item}
		  <Command.Item>
			<svelte:component this={item.icon} class="mr-2 h-4 w-4" />
			<span>{item.label}</span>
		  </Command.Item>
		{/each}
	  </Command.Group>
  
	  <Command.Separator />
  
	  <Command.Group heading="Settings">
		{#each settingsItems as item}
		  <Command.Item onSelect={item.action || (() => {})}>
			<svelte:component this={item.icon} class="mr-2 h-4 w-4" />
			<span>{item.label}</span>
			{#if item.shortcut}
			  <Command.Shortcut>{item.shortcut}</Command.Shortcut>
			{/if}
		  </Command.Item>
		{/each}
	  </Command.Group>
	</Command.List>
  </Command.Dialog>