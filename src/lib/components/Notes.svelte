<script lang="ts">
	import { onMount } from 'svelte';
	import { pb, currentUser } from '$utils/pocketbase';
	import * as Resizable from '$lib/components/ui/resizable';
	import * as Select from '$lib/components/ui/select';
	import { Button } from '$lib/components/ui/button';
	import {
		IconNote,
		IconPlus,
		IconLoader2,
		IconChevronUp,
		IconChevronDown
	} from '@tabler/icons-svelte';
	import MarkdownIt from 'markdown-it';
	import { format, parseISO } from 'date-fns';
	import { goto } from '$app/navigation';

	let notes = [];
	let currentNote = null;
	let content = '';
	let title = '';
	let sortBy = 'updated';
	let sortDirection = 'desc';
	let isLoading = false;
	let error = null;
	const md = new MarkdownIt();

	onMount(async () => {
		if ($currentUser) {
			await loadNotes();
		} else {
			goto('/login'); // Redirect to login if not authenticated
		}
		const lastEditedNoteId = localStorage.getItem('lastEditedNoteId');
		if (lastEditedNoteId) {
			currentNote = notes.find((note) => note.id === lastEditedNoteId);
			if (currentNote) {
				content = currentNote.content;
				title = currentNote.title;
			}
		}
	});

	async function loadNotes() {
		isLoading = true;
		error = null;
		try {
			if (!$currentUser) {
				throw new Error('User not authenticated');
			}
			const resultList = await pb.collection('notes').getList(1, 50, {
				filter: `user_id = "${$currentUser.id}"`,
				sort: `${sortDirection === 'desc' ? '-' : ''}${sortBy}`
			});
			notes = resultList.items;
		} catch (err) {
			console.error('Failed to load notes', err);
			if (err.status === 401) {
				error = 'Authentication error. Please log in again.';
			} else {
				error = `Failed to load notes: ${err.message}`;
			}
		} finally {
			isLoading = false;
		}
	}

	function handleSortChange(event) {
		const newSortBy = event.value;
		if (newSortBy === sortBy) {
			// If clicking on the same field, toggle direction
			sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
		} else {
			// If changing field, default to descending
			sortBy = newSortBy;
			sortDirection = 'desc';
		}
		loadNotes();
	}

	function selectNote(note) {
		currentNote = note;
		content = note.content;
		title = note.title;
		localStorage.setItem('lastEditedNoteId', note.id);
	}

	async function createNewNote() {
		if (!$currentUser) return;

		try {
			const newNote = await pb.collection('notes').create({
				title: 'New Note',
				content: '',
				user_id: $currentUser.id
			});
			notes = [newNote, ...notes];
			selectNote(newNote);
		} catch (error) {
			console.error('Failed to create new note', error);
		}
	}

	async function saveNote() {
		if (!currentNote || !$currentUser) return;

		try {
			await pb.collection('notes').update(currentNote.id, { title, content });
			currentNote.title = title;
			currentNote.content = content;
			localStorage.setItem('lastEditedNoteId', currentNote.id);
			await loadNotes(); // Reload notes to update the list
		} catch (error) {
			console.error('Failed to save note', error);
		}
	}

	function handleInput() {
		if (currentNote) {
			currentNote.content = content;
			currentNote.title = title;
		}
	}

	function formatDate(dateString: string): string {
		return format(parseISO(dateString), 'yyyy-MM-dd');
	}

	// $: {
	//   if (sortBy) {
	// 	loadNotes();
	//   }
	// }
	function getSortIcon(field) {
		if (sortBy === field) {
			return sortDirection === 'asc' ? IconChevronUp : IconChevronDown;
		}
		return null;
	}

</script>

<main class="h-screen bg-gray-100 text-gray-800">
	<Resizable.PaneGroup direction="horizontal" class="h-full">
		<Resizable.Pane defaultSize={25} minSize={15} maxSize={40}>
			<div class="h-full overflow-y-auto bg-white p-4">
				<div class="mb-4 flex items-center justify-between">
					<h2 class="text-xl font-bold">Notes</h2>
					<Button on:click={createNewNote} variant="outline" size="sm">
						<IconPlus class="mr-2 h-4 w-4" />
						Create
					</Button>
				</div>
				<div class="mb-4">
					<Select.Root onSelectedChange={handleSortChange} value={sortBy}>
						<Select.Trigger class="w-full">
							<Select.Value placeholder="Sort by..." />
						</Select.Trigger>
						<Select.Content>
							<Select.Item value="created">
								Created Date
								<svelte:component this={getSortIcon('created')} class="ml-2 inline-block" />
							</Select.Item>
							<Select.Item value="updated">
								Updated Date
								<svelte:component this={getSortIcon('updated')} class="ml-2 inline-block" />
							</Select.Item>
							<Select.Item value="title">
								Title
								<svelte:component this={getSortIcon('title')} class="ml-2 inline-block" />
							</Select.Item>
						</Select.Content>
					</Select.Root>
				</div>
				{#if isLoading}
					<div class="flex h-32 items-center justify-center">
						<IconLoader2 class="h-8 w-8 animate-spin" />
					</div>
				{:else if error}
					<div class="text-red-500">{error}</div>
				{:else if notes.length === 0}
					<div class="text-gray-500">No notes found. Create a new one!</div>
				{:else}
					<ul>
						{#each notes as note (note.id)}
							<li
								class="cursor-pointer p-2 hover:bg-gray-100 {currentNote?.id === note.id
									? 'bg-blue-100'
									: ''}"
								on:click={() => selectNote(note)}
							>
								<div class="font-semibold">{note.title}</div>
								<div class="text-sm text-gray-500">
									{note.updated ? 'Updated ' : 'Created '}
									{formatDate(note.updated || note.created)}
								</div>
							</li>
						{/each}
					</ul>
				{/if}
			</div>
		</Resizable.Pane>
		<Resizable.Handle />
		<Resizable.Pane defaultSize={75} minSize={60} maxSize={85}>
			<div class="flex h-full flex-col p-4">
				<div class="mb-4 flex items-center">
					<IconNote class="mr-2" />
					<input
						type="text"
						bind:value={title}
						on:input={handleInput}
						on:blur={saveNote}
						class="w-full border-none bg-transparent text-2xl font-bold focus:outline-none"
						placeholder="Note Title"
						disabled={!currentNote}
					/>
				</div>
				<div class="flex flex-grow">
					<div class="w-1/2 pr-2">
						<textarea
							bind:value={content}
							on:input={handleInput}
							on:blur={saveNote}
							class="h-full w-full resize-none rounded border border-gray-300 bg-white p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
							placeholder="Write your markdown here..."
							disabled={!currentNote}
						></textarea>
					</div>
					<div class="w-1/2 pl-2">
						<div class="h-full w-full overflow-y-auto rounded border border-gray-300 bg-white p-2">
							{@html md.render(content)}
						</div>
					</div>
				</div>
			</div>
		</Resizable.Pane>
	</Resizable.PaneGroup>
</main>
