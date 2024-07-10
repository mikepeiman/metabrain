<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
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

	import { Editor, rootCtx, defaultValueCtx, commandsCtx, editorViewCtx, parserCtx } from '@milkdown/core';
	import { commonmark } from '@milkdown/preset-commonmark';
	import { history } from '@milkdown/plugin-history';
	import { nord } from '@milkdown/theme-nord';
	import '@milkdown/theme-nord/style.css';
	import { listener, listenerCtx } from '@milkdown/plugin-listener';
	import { replaceAll } from '@milkdown/utils';
	// import { } from '@milkdown/utils';
	import { format, parseISO } from 'date-fns';
	import { goto } from '$app/navigation';
	import { debounce } from 'lodash-es';

	let notes = [];
	let currentNote = null;
	let content = '';
	let title = '';
	let sortBy = 'updated';
	let sortDirection = 'desc';
	let isLoading = false;
	let error = null;

	let editor: Editor | null = null;
	let editorReady = false;

	onMount(async () => {
		if ($currentUser) {
			await loadNotes();
		} else {
			goto('/login');
		}

		editor = await Editor.make()
			.config((ctx) => {
				ctx.set(rootCtx, document.querySelector('#editor'));
				ctx.set(defaultValueCtx, '');
				ctx
					.get(listenerCtx)
					.mounted(() => {
						editorReady = true;
						if (currentNote) {
							updateEditorContent(currentNote.content);
						}
					})
					.markdownUpdated((_, markdown) => {
						if (editorReady && currentNote) {
							content = markdown;
							handleInput();
						}
					});
			})
			.use(nord)
			.use(commonmark)
			.use(history)
			.use(listener)
			.create();

		const lastEditedNoteId = localStorage.getItem('lastEditedNoteId');
		if (lastEditedNoteId) {
			const note = notes.find((n) => n.id === lastEditedNoteId);
			if (note) {
				selectNote(note);
			}
		}
	});

	onDestroy(() => {
		if (editor) {
			editor.destroy();
		}
	});
	function updateEditorContent(newContent: string) {
		console.log('Updating editor content:', newContent);
		if (editor && editorReady) {
			editor.action((ctx) => {
				ctx.get(commandsCtx).call(replaceAll.key, {
					content: newContent || ''
				});
			});
		} else {
			console.log('Editor not ready or not initialized');
		}
	}

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
			error =
				err.status === 401
					? 'Authentication error. Please log in again.'
					: `Failed to load notes: ${err.message}`;
		} finally {
			isLoading = false;
		}
	}

	function handleSortChange(event) {
		const newSortBy = event.value;
		sortDirection = newSortBy === sortBy ? (sortDirection === 'asc' ? 'desc' : 'asc') : 'desc';
		sortBy = newSortBy;
		loadNotes();
	}

	function selectNote(note) {
		if (currentNote) {
			saveNoteImmediately();
		}
		currentNote = note;
		title = note.title;
		content = note.content;
		localStorage.setItem('lastEditedNoteId', note.id);
		if (editorReady) {
			updateEditorContent(note.content);
		}
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

	const saveNote = debounce(async () => {
		if (!currentNote || !$currentUser) return;
		try {
			await pb.collection('notes').update(currentNote.id, { title, content });
			localStorage.setItem('lastEditedNoteId', currentNote.id);
		} catch (error) {
			console.error('Failed to save note', error);
		}
	}, 1000);

	function handleInput() {
		if (currentNote) {
			currentNote.content = content;
			currentNote.title = title;
			saveNote();
		}
	}

	async function saveNoteImmediately() {
		if (!currentNote || !$currentUser) return;
		try {
			await pb.collection('notes').update(currentNote.id, { title, content });
			localStorage.setItem('lastEditedNoteId', currentNote.id);
		} catch (error) {
			console.error('Failed to save note', error);
		}
	}

	function formatDate(dateString: string): string {
		return format(parseISO(dateString), 'yyyy-MM-dd');
	}

	function getSortIcon(field) {
		return sortBy === field ? (sortDirection === 'asc' ? IconChevronUp : IconChevronDown) : null;
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
						class="w-full border-none bg-transparent text-2xl font-bold text-black focus:outline-none"
						placeholder="Note Title"
						disabled={!currentNote}
					/>
				</div>
				<div class="flex-grow">
					<div id="editor" class="h-full w-full"></div>
				</div>
			</div>
		</Resizable.Pane>
	</Resizable.PaneGroup>
</main>
