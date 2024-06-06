<script lang="ts">
	import { format } from 'date-fns';

	import { Button } from '$lib/components/ui/Button';
	import { Dropdown } from '$lib/components/ui/dropdown-menu';
	import { Input } from '$lib/components/ui/Input';
	import { Tag } from '$lib/components/ui/badge';

    import DatePicker from '$lib/components/ui/date-picker/date-picker.svelte';
	let newItem = '';
	let tags: string[] = [];
	let items: { id: string; content: string; tags: string[]; createdAt: Date }[] = [];

	function addItem() {
		if (newItem.trim()) {
			items.unshift({
				id: crypto.randomUUID(),
				content: newItem.trim(),
				tags,
				createdAt: new Date()
			});
			items = items;
			newItem = '';
			tags = [];
		}
	}

	function addTag(tag: string) {
		if (!tags.includes(tag)) {
			tags = [...tags, tag];
		}
	}
</script>

<header class="flex items-center justify-between bg-gray-800 px-4 py-2 text-white">
	<div class="flex space-x-4">
		<Button href="/calendar">Calendar</Button>
		<Button href="/timeline">Timeline</Button>
		<Button href="/kanban">Kanban</Button>
	</div>
	<div class="flex space-x-4">
		<Button href="/login">Login</Button>
		<Button href="/settings">Settings</Button>
	</div>
</header>

<main class="p-4">
	<div class="mb-4 flex space-x-4">
		<Input
			bind:value={newItem}
			on:keydown={(e) => {
				if (e.key === 'Enter') {
					addItem();
				}
			}}
			placeholder="Add a new item..."
			class="flex-1"
		>
			<svelte:fragment slot="right">
				{#each tags as tag}
					<Tag on:click={() => addTag(tag)}>{tag}</Tag>
				{/each}
				<Dropdown
					on:select={(e) => addTag(e.detail)}
					items={['#work', '#personal', '#shopping', '#travel']}
				/>
			</svelte:fragment>
		</Input>
		<Button on:click={addItem}>Add</Button>
	</div>

	<div class="space-y-4">
		{#each items as item}
			<div class="flex items-center space-x-4 rounded-md bg-gray-100 p-4">
				<DatePicker value={item.createdAt} />
				<div class="flex-1">{item.content}</div>
				<div class="flex space-x-2">
					{#each item.tags as tag}
						<Tag>{tag}</Tag>
					{/each}
				</div>
			</div>
		{/each}
	</div>
</main>
