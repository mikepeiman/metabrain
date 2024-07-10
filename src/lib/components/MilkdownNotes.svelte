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

	import { Editor, rootCtx, defaultValueCtx, commandsCtx, editorViewCtx } from '@milkdown/core';
	import { replaceAll } from '@milkdown/utils';
	import { commonmark } from '@milkdown/preset-commonmark';
	import { history } from '@milkdown/plugin-history';
	import { nord } from '@milkdown/theme-nord';
	import '@milkdown/theme-nord/style.css';
	import { listener, listenerCtx } from '@milkdown/plugin-listener';

	import { format, parseISO } from 'date-fns';
	import { goto } from '$app/navigation';
	import { debounce } from 'lodash-es';

	let notes: any[] = [];
	let currentNote = null;
	$: console.log(`🚀 ~ currentNote:`, currentNote)
	let content = '';
	let title = '';
	let sortBy = 'updated';
	let sortDirection = 'desc';
	let isLoading = false;
	let error = null;

	let editor: Editor;
    let editorReady = false;


    onMount(async () => {
        if ($currentUser) {
            await loadNotes();
        } else {
            goto('/login');
        }

		editor = await Editor.make()
        .config((ctx) => {
            ctx.set(rootCtx, document.getElementById('editor'));
            ctx.set(defaultValueCtx, ''); // Start with an empty editor
            ctx.get(listenerCtx)
                .mounted(() => {
                    editorReady = true;
                    if (currentNote) {
                        selectNote(currentNote); // Call selectNote to update editor content
                    }
                })
                .markdownUpdated((ctx, markdown, prevMarkdown) => {
                    content = markdown;
                    handleInput();
                });
        })
        .use(nord)
        .use(commonmark)
        .use(history)
        .use(listener)
        .create();

        const lastEditedNoteId = localStorage.getItem('lastEditedNoteId');
        if (lastEditedNoteId) {
            currentNote = notes.find((note) => note.id === lastEditedNoteId);
            if (currentNote) {
                content = currentNote.content;
                title = currentNote.title;
                if (editorReady) {
                    selectNote(currentNote);
                }
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
    console.log(`🚀 ~ selectNote ~ note:`, note);
    if (currentNote) {
        saveNoteImmediately();
    }
    if (!note) {
        console.error('Attempted to select undefined note');
        return;
    }
    currentNote = note;
    content = note.content;
    title = note.title;
    localStorage.setItem('lastEditedNoteId', note.id);
    
    // Update editor content
    if (editor) {
        editor.action((ctx) => {
            const view = ctx.get(editorViewCtx);
            view.dispatch(view.state.tr.replaceWith(0, view.state.doc.content.size, view.state.schema.text(note.content)));
        });
    }
}
	async function createNewNote() {
		if (!$currentUser) return;

		console.log(`🚀 ~ createNewNote ~ currentUser:`, $currentUser);
		try {
			const data = {
				title: 'New Note',
				content: '',
				user_id: $currentUser.id
			};
			const newNote = await pb.collection('notes').create(data);
			notes = [newNote, ...notes];
			selectNote(newNote);
		} catch (error) {
			console.error('Failed to create new note', error);
			if (error.data) {
				console.log(`🚀 ~ createNewNote ~ error.data:`, error.data);
				console.log(`🚀 ~ createNewNote ~ error.data.data.content:`, error.data?.data?.content);
			}
		}
	}

	const saveNote = debounce(async () => {
		if (!currentNote || !$currentUser) return;

		try {
			await pb.collection('notes').update(currentNote.id, { title, content });
			localStorage.setItem('lastEditedNoteId', currentNote.id);
			// Consider if you really need to reload all notes here
			// If not, you can remove this line to further reduce server calls
			// await loadNotes();
		} catch (error) {
			console.error('Failed to save note', error);
		}
	}, 1000); // Adjust the delay (in milliseconds) as needed

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
						class="w-full border-none bg-transparent text-2xl font-bold focus:outline-none"
						placeholder="Note Title"
						disabled={!currentNote}
					/>
				</div>
				<div class="flex flex-grow">
					<div class="w-1/2 pr-2">
						<div id="editor" class="h-full w-full"></div>
					</div>
				</div>
			</div>
		</Resizable.Pane>
	</Resizable.PaneGroup>
</main>
