<script>
	import {
		IconExternalLink,
		IconArrowRight,
		IconWindowMaximize,
		IconCopy,
		IconArrowRightCircle,
		IconBookmark,
		IconGitMerge,
		IconLink,
		IconClock,
		IconAppWindow,
		IconFolder,
		IconEdit,
		IconNote,
		IconPlus,
		IconLoader2,
		IconChevronUp,
		IconChevronDown,
		IconTrash
	} from '@tabler/icons-svelte';
	import { onMount, afterUpdate } from 'svelte';
	import { pb, currentUser } from '$utils/pocketbase';
	import * as Resizable from '$lib/components/ui/resizable';
	import * as Select from '$lib/components/ui/select';
	import { Button } from '$lib/components/ui/button';
	import { toast } from 'svelte-sonner';
	import * as ContextMenu from '$lib/components/ui/context-menu/index.ts';
	import { format, parseISO } from 'date-fns';
	import { goto } from '$app/navigation';
	import { debounce } from 'lodash-es';
	import EditorJS from '@editorjs/editorjs';
	import Header from '@editorjs/header';
	import List from '@editorjs/list';
	import Checklist from '@editorjs/checklist';
	import Paragraph from '@editorjs/paragraph';

	let titleInput;
	let notes = [];
	let currentNote = null;
	let contentArea;
	let title = '';
	let sortBy = 'updated';
	let sortDirection = 'desc';
	let isLoading = false;
	let error = null;
	let editor;


	
    const contextMenuItems = [
        { icon: IconExternalLink, text: 'Open in new tab' },
        { icon: IconArrowRight, text: 'Open to the right' },
        { icon: IconWindowMaximize, text: 'Open in new window' },
        { isSeparator: true },
        { icon: IconCopy, text: 'Make a copy' },
        { icon: IconArrowRightCircle, text: 'Move file to...' },
        { icon: IconBookmark, text: 'Bookmark...' },
        { icon: IconGitMerge, text: 'Merge entire file with...' },
        { icon: IconLink, text: 'Copy Obsidian URL' },
        { isSeparator: true },
        { icon: IconClock, text: 'Open version history' },
        { icon: IconAppWindow, text: 'Open in default app' },
        { icon: IconFolder, text: 'Show in system explorer' },
        { isSeparator: true },
        { icon: IconEdit, text: 'Rename...' },
        { icon: IconTrash, text: 'Delete', isDanger: true, action: deleteNote }
    ];
	onMount(async () => {
		if (!$currentUser) return goto('/login');
		await loadNotes();
		initializeEditor();
		window.addEventListener('keydown', handleShortcut);

		return () => {
			window.removeEventListener('keydown', handleShortcut);
			if (editor) {
				editor.destroy();
			}
		};
	});

	import MarkdownIt from 'markdown-it';

const md = new MarkdownIt();

function markdownToEditorJS(markdown) {
    const html = md.render(markdown);
    const blocks = [];
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    doc.body.childNodes.forEach(node => {
        if (node.nodeType === Node.ELEMENT_NODE) {
            switch (node.tagName.toLowerCase()) {
                case 'h1':
                case 'h2':
                case 'h3':
                case 'h4':
                case 'h5':
                case 'h6':
                    blocks.push({
                        type: 'header',
                        data: {
                            text: node.textContent,
                            level: parseInt(node.tagName[1])
                        }
                    });
                    break;
                case 'p':
                    blocks.push({
                        type: 'paragraph',
                        data: {
                            text: node.innerHTML
                        }
                    });
                    break;
                case 'ul':
                case 'ol':
                    blocks.push({
                        type: 'list',
                        data: {
                            style: node.tagName.toLowerCase() === 'ul' ? 'unordered' : 'ordered',
                            items: Array.from(node.children).map(li => li.innerHTML)
                        }
                    });
                    break;
                // Add more cases as needed
            }
        }
    });
    
    return { blocks };
}

function editorJSToMarkdown(data) {
    let markdown = '';
    data.blocks.forEach(block => {
        switch (block.type) {
            case 'header':
                markdown += '#'.repeat(block.data.level) + ' ' + block.data.text + '\n\n';
                break;
            case 'paragraph':
                markdown += block.data.text + '\n\n';
                break;
            case 'list':
                block.data.items.forEach((item, index) => {
                    if (block.data.style === 'ordered') {
                        markdown += `${index + 1}. ${item}\n`;
                    } else {
                        markdown += `- ${item}\n`;
                    }
                });
                markdown += '\n';
                break;
            // Add more cases as needed
        }
    });
    return markdown.trim();
}

async function initializeEditor() {
    editor = new EditorJS({
        holder: 'editor',
        tools: {
            header: Header,
            list: List,
            checklist: Checklist,
            paragraph: Paragraph
        },
        onChange: () => {
            handleInput();
        },
        data: currentNote ? markdownToEditorJS(currentNote.content) : {}
    });

    const lastEditedNoteId = localStorage.getItem('lastEditedNoteId');
    if (lastEditedNoteId) {
        currentNote = notes.find((note) => note.id === lastEditedNoteId);
        if (currentNote) {
            title = currentNote.title;
            editor.isReady.then(() => {
                editor.render(markdownToEditorJS(currentNote.content));
            });
        }
    }
}

async function selectNote(note) {
    if (!note) return console.error('Attempted to select undefined note');
    if (currentNote) await saveNoteImmediately();
    currentNote = note;
    title = note.title;
    localStorage.setItem('lastEditedNoteId', note.id);

    editor.isReady.then(() => {
        editor.render(markdownToEditorJS(note.content));
    });
}

async function createNewNote() {
    if (!$currentUser) return;
    try {
        const newNote = await pb.collection('notes').create({
            title: 'New Note',
            content: '',  // Empty markdown content
            user_id: $currentUser.id
        });
        notes = [newNote, ...notes];
        await selectNote(newNote);
    } catch (error) {
        console.error('Failed to create new note', error);
    }
    if (titleInput) {
        titleInput.focus();
        titleInput.select();
    }
}

const handleInput = debounce(async () => {
    if (currentNote) {
        const savedData = await editor.save();
        currentNote.content = editorJSToMarkdown(savedData);
        currentNote.title = title;
        saveNote();
        updateNoteInList(currentNote.id, title);
    }
}, 1000);

async function saveNote() {
    if (!currentNote || !$currentUser) return;
    try {
        const savedData = await editor.save();
        await pb.collection('notes').update(currentNote.id, {
            title,
            content: editorJSToMarkdown(savedData)
        });
        localStorage.setItem('lastEditedNoteId', currentNote.id);
        updateNoteInList(currentNote.id, title);
    } catch (error) {
        console.error('Failed to save note', error);
    }
}

async function saveNoteImmediately() {
    if (!currentNote || !$currentUser) return;
    try {
        const savedData = await editor.save();
        await pb.collection('notes').update(currentNote.id, {
            title,
            content: editorJSToMarkdown(savedData)
        });
        localStorage.setItem('lastEditedNoteId', currentNote.id);
        updateNoteInList(currentNote.id, title);
    } catch (error) {
        console.error('Failed to save note', error);
        toast.info('Failed to save note', error);
    }
}
	async function loadNotes() {
		isLoading = true;
		error = null;
		try {
			if (!$currentUser) throw new Error('User not authenticated');
			const resultList = await pb.collection('notes').getList(1, 50, {
				filter: `user_id = "${$currentUser.id}" && deleted = false`,
				sort: `${sortDirection === 'desc' ? '-' : ''}${sortBy}`
			});
			notes = resultList.items;

			if (sortBy === 'title') {
				notes.sort((a, b) => {
					const titleA = a.title.toLowerCase();
					const titleB = b.title.toLowerCase();
					return sortDirection === 'asc'
						? titleA.localeCompare(titleB)
						: titleB.localeCompare(titleA);
				});
			}
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
		if (event.value === sortBy) {
			sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
		} else {
			sortBy = event.value;
			sortDirection = 'desc';
		}
		loadNotes();
	}


	function updateNoteInList(id, newTitle) {
		notes = notes.map((note) => (note.id === id ? { ...note, title: newTitle } : note));
	}


	async function deleteNote(noteId) {
		try {
			const note = await pb.collection('notes').getOne(noteId);

			if (!note.content || note.content.trim() === '') {
				await pb.collection('notes').delete(noteId);
				toast.success('Note deleted successfully');
			} else {
				const confirmDelete = confirm(
					'Are you sure you want to delete this note? This action can be undone later.'
				);

				if (confirmDelete) {
					await pb.collection('notes').update(noteId, {
						deleted: true,
						deletedDate: new Date().toISOString()
					});
					toast.success('Note marked as deleted', {
						description: 'You can restore it later from the archive.',
						action: {
							label: 'Undo',
							onClick: () => restoreNote(noteId)
						}
					});
				} else {
					toast.info('Deletion cancelled');
					return;
				}
			}

			await loadNotes();

			if (currentNote?.id === noteId) {
				currentNote = null;
				title = '';
				editor.render({ blocks: [] });
			}
		} catch (error) {
			console.error('Error deleting note:', error);
			toast.error('Failed to delete note');
		}
	}

	async function restoreNote(noteId) {
		try {
			await pb.collection('notes').update(noteId, {
				deleted: false,
				deletedDate: null
			});
			toast.success('Note restored successfully');
			await loadNotes();
		} catch (error) {
			console.error('Error restoring note:', error);
			toast.error('Failed to restore note');
		}
	}

	function formatDate(dateString) {
		return format(parseISO(dateString), 'yyyy-MM-dd');
	}

	function getSortIcon(field) {
		return sortBy === field ? (sortDirection === 'asc' ? IconChevronUp : IconChevronDown) : null;
	}

	function handleKeydown(event) {
		if (event.key === 'Enter') {
			event.preventDefault();
			focusEditor();
		}
	}

	function focusEditor() {
		if (editor) {
			editor.focus();
		}
	}

	function handleShortcut(event) {
		// Add your keyboard shortcut logic here
	}
</script>

<h1>EditorJS</h1>

<div class="notes-container">
	<div class="notes-list">
	  <!-- ... (your existing notes list UI) ... -->
	  <main class="editorjs-notes bg-slate-1 text-slate-12 dark:bg-slate-12 dark:text-slate-1">
		 <Resizable.PaneGroup direction="horizontal" class="h-full">
			 <Resizable.Pane defaultSize={25} minSize={15} maxSize={40}>
				 <div class="h-full overflow-y-auto bg-slate-2 p-4 dark:bg-slate-12">
					 <div class="mb-4 flex items-center justify-between">
						 <h2 class="text-xl font-bold text-slate-12 dark:text-slate-1">Notes</h2>
						 <Button
							 on:click={createNewNote}
							 variant="outline"
							 size="sm"
							 class="bg-slate-3 text-slate-11 hover:bg-slate-4 hover:text-slate-12 dark:bg-slate-10 dark:text-slate-2 dark:hover:bg-slate-9 dark:hover:text-slate-1"
						 >
							 <IconPlus class="mr-2 h-4 w-4" />
							 Create
						 </Button>
					 </div>
					 <div class="mb-4">
						 <Select.Root onSelectedChange={handleSortChange} value={sortBy}>
							 <Select.Trigger
								 class="w-full bg-slate-3 text-slate-4 hover:bg-slate-4 hover:text-slate-12 dark:bg-slate-12 dark:text-slate-2 dark:hover:bg-slate-9 dark:hover:text-slate-1"
							 >
								 <Select.Value placeholder="Sort by..." />
							 </Select.Trigger>
							 <Select.Content class="bg-slate-2 dark:bg-slate-12">
								 {#each ['created', 'updated', 'title'] as field}
									 <Select.Item
										 value={field}
										 class="text-slate-11 hover:bg-slate-4 hover:text-slate-12 dark:text-slate-2 dark:hover:bg-slate-9 dark:hover:text-slate-1"
									 >
										 {field.charAt(0).toUpperCase() + field.slice(1)}
										 <svelte:component this={getSortIcon(field)} class="ml-2 inline-block" />
									 </Select.Item>
								 {/each}
							 </Select.Content>
						 </Select.Root>
					 </div>
					 {#if isLoading}
						 <div class="flex h-32 items-center justify-center">
							 <IconLoader2 class="h-8 w-8 animate-spin text-slate-11 dark:text-slate-2" />
						 </div>
					 {:else if error}
						 <div class="text-red-9 dark:text-red-3">{error}</div>
					 {:else if notes.length === 0}
						 <div class="text-slate-11 dark:text-slate-2">No notes found. Create a new one!</div>
					 {:else}
						 <ul>
							 {#each notes as note (note.id)}
								 <ContextMenu.Root>
									 <ContextMenu.Trigger>
										 <li
											 class="cursor-pointer p-2 hover:bg-slate-3 hover:text-slate-12 dark:hover:bg-slate-10 dark:hover:text-slate-1 {currentNote?.id ===
											 note.id
												 ? 'bg-blue-4 text-slate-12 dark:bg-blue-9 dark:text-slate-1'
												 : ''}"
											 on:click={() => selectNote(note)}
										 >
											 <div class="flex items-center justify-between">
												 <div>
													 <div class="font-semibold text-slate-12 dark:text-slate-1">
														 {note.title}
													 </div>
													 <div class="text-sm text-slate-11 dark:text-slate-3">
														 {note.updated ? 'Updated ' : 'Created '}
														 {formatDate(note.updated || note.created)}
													 </div>
												 </div>
											 </div>
										 </li>
									 </ContextMenu.Trigger>
	 
	 

	
									 <ContextMenu.Content class="w-64 bg-slate-2 dark:bg-slate-12">
										 {#each contextMenuItems as item}
											 {#if item.isSeparator}
												 <ContextMenu.Separator class="bg-slate-6 dark:bg-slate-7" />
											 {:else}
												 <ContextMenu.Item
													 class="{item.isDanger 
														 ? 'text-red-9 hover:bg-red-3 hover:text-red-11 dark:text-red-3 dark:hover:bg-red-9 dark:hover:text-red-1'
														 : 'text-slate-11 hover:bg-slate-3 hover:text-slate-12 dark:text-slate-2 dark:hover:bg-slate-10 dark:hover:text-slate-1'}"
													 on:click={item.action ? () => item.action(note.id) : null}
												 >
													 <span class="flex items-center">
														 <svelte:component this={item.icon} class="mr-2" />
														 {item.text}
													 </span>
												 </ContextMenu.Item>
											 {/if}
										 {/each}
									 </ContextMenu.Content>
								 </ContextMenu.Root>
							 {/each} 
						 </ul>
					 {/if}
				 </div>
			 </Resizable.Pane>
			 <Resizable.Handle class="bg-slate-6 hover:bg-slate-7 dark:bg-slate-7 dark:hover:bg-slate-6" />
			 <Resizable.Pane defaultSize={75} minSize={60} maxSize={85}>
				 <div class="flex h-full">
					 <div class="flex flex-grow flex-col overflow-y-scroll p-4 relative">
						 <div class="mb-4 flex items-center">
							 <IconNote class="mr-2 text-slate-11 dark:text-slate-2" />
							 <input
								 type="text"
								 bind:value={title}
								 bind:this={titleInput}
								 on:input={handleInput}
								 on:keydown={handleKeydown}
								 class="w-full border-none bg-transparent text-2xl font-bold text-slate-12 placeholder-slate-11 focus:outline-none dark:text-slate-1 dark:placeholder-slate-3"
								 placeholder="Note Title"
								 disabled={!currentNote}
							 />
						 </div>
						 <div id="editor" class="note-editor absolute top-[20rem]">
							<input
							  bind:value={title}
							  on:input={handleInput}
							  placeholder="Note title"
							/>
							<div id="editorjs"></div>
						  </div>
					 </div>
				 </div>
			 </Resizable.Pane>
		 </Resizable.PaneGroup>
	 </main> 
	</div>

  </div>

<style>
	/* Add any global styles here if needed */
	:global(.codex-editor) {
		/* Styles for the Editor.js container */
	}

	:global(.ce-block) {
		/* Styles for Editor.js blocks */
	}

	/* Add more global styles for Editor.js elements as needed */
</style>
