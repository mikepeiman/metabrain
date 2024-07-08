<script lang="ts">
	import Calendar from 'svelte-radix/Calendar.svelte';
	import EnvelopeClosed from 'svelte-radix/EnvelopeClosed.svelte';
	import Face from 'svelte-radix/Face.svelte';
	import Gear from 'svelte-radix/Gear.svelte';
	import Person from 'svelte-radix/Person.svelte';
	import Rocket from 'svelte-radix/Rocket.svelte';

	import * as Command from '$lib/components/ui/command/index.js';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	let open = false;

	onMount(() => {
		function handleKeydown(e: KeyboardEvent) {
			if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
				e.preventDefault();
				open = !open;
			}
		}

		document.addEventListener('keydown', handleKeydown);

		return () => {
			document.removeEventListener('keydown', handleKeydown);
		};
	});

	function handleSelect(path: string) {
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

      <Command.Item>
        <button 
          class="w-full text-start" 
          on:click={() => handleSelect('/')}
          on:keydown={(e) => handleKeydown(e, '/')}
        >
          Home
        </button>
      </Command.Item>
      <Command.Item>
        <button 
          class="w-full text-start" 
          on:click={() => handleSelect('/skype')}
          on:keydown={(e) => handleKeydown(e, '/skype')}
        >
          Skype parsing
        </button>
      </Command.Item>
      <Command.Item>
        <button 
          class="w-full text-start" 
          on:click={() => handleSelect('/notes')}
          on:keydown={(e) => handleKeydown(e, '/notes')}
        >
          Notes DB
        </button>
      </Command.Item>
      <Command.Item>
        <button 
          class="w-full text-start" 
          on:click={() => handleSelect('/dashboard')}
          on:keydown={(e) => handleKeydown(e, '/dashboard')}
        >
          Dashboard
        </button>
      </Command.Item>
		</Command.Group>
		<Command.Group heading="Suggestions">
			<Command.Item>
				<Calendar class="mr-2 h-4 w-4" />
				<span>Calendar</span>
			</Command.Item>
			<Command.Item>
				<Face class="mr-2 h-4 w-4" />
				<span>Search Emoji</span>
			</Command.Item>
			<Command.Item>
				<Rocket class="mr-2 h-4 w-4" />
				<span>Launch</span>
			</Command.Item>
		</Command.Group>
		<Command.Separator />
		<Command.Group heading="Settings">
			<Command.Item>
				<Person class="mr-2 h-4 w-4" />
				<span>Profile</span>
				<Command.Shortcut>⌘P</Command.Shortcut>
			</Command.Item>
			<Command.Item>
				<EnvelopeClosed class="mr-2 h-4 w-4" />
				<span>Mail</span>
				<Command.Shortcut>⌘B</Command.Shortcut>
			</Command.Item>
			<Command.Item>
				<Gear class="mr-2 h-4 w-4" />
				<span>Settings</span>
				<Command.Shortcut>⌘S</Command.Shortcut>
			</Command.Item>
		</Command.Group>
	</Command.List>
</Command.Dialog>
