<script lang="ts">
	// TODO:
	// 1. Fix advanced markdown styling, so we can edit markdown characters as in Obsidian
	// 2. Add tags
	// 3. Add tags dropdown filter and select
	// 4. Add search
	// 5. Add timestamps
	// 6. Add advanced tag feature: properties:values
	// 7. Add slash commands
	// 8. hover actions menu per line in editor, or per styled string/block
	// 9. Add undo/redo
	// 10. add keyuboard shortcuts for styling

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
	import { get } from 'svelte/store';
	import * as ContextMenu from '$lib/components/ui/context-menu/index.js';
	import {
		Editor,
		rootCtx,
		defaultValueCtx,
		commandsCtx,
		editorViewCtx,
		parserCtx
	} from '@milkdown/core';
	import { clipboard } from '@milkdown/plugin-clipboard';

	import {
		commonmark,
		headingAttr,
		listItemSchema,
		bulletListSchema,
		orderedListSchema
	} from '@milkdown/preset-commonmark';
	import { history, undoCommand, redoCommand, historyKeymap } from '@milkdown/plugin-history';
	import { nord } from '@milkdown/theme-nord';
	import '@milkdown/theme-nord/style.css';
	import { listener, listenerCtx } from '@milkdown/plugin-listener';
	import { setAttr, callCommand } from '@milkdown/utils';
	import { format, parseISO } from 'date-fns';
	import { goto } from '$app/navigation';
	import { debounce } from 'lodash-es';

	let titleInput: HTMLInputElement;
	let notes = [];
	let currentNote = null;
	let content = '';
	let contentArea: HTMLDivElement;
	let title = '';
	let sortBy = 'updated';
	let sortDirection = 'desc';
	let isLoading = false;
	let error = null;
	let editor: Editor;
	let editorReady = false;

	onMount(async () => {
		if (!$currentUser) return goto('/login');
		await loadNotes();
		initializeEditor();
		// Add event listener for keyboard shortcuts
		window.addEventListener('keydown', handleShortcut);

		return () => {
			// Clean up event listener on component unmount
			window.removeEventListener('keydown', handleShortcut);
		};
	});

	async function initializeEditor() {
		editor = await Editor.make()
			.config((ctx) => {
				ctx.set(rootCtx, document.getElementById('editor'));
				ctx.set(defaultValueCtx, '');
				ctx
					.get(listenerCtx)
					.mounted(() => {
						editorReady = true;
						if (currentNote) selectNote(currentNote);
					})
					.markdownUpdated((_, markdown) => {
						content = markdown;
						handleInput();
					});
			})
			.use(nord)
			.use(commonmark)
			.use(clipboard)
			.use(history)
			.use(listener)
			.create();

		const lastEditedNoteId = localStorage.getItem('lastEditedNoteId');
		if (lastEditedNoteId) {
			currentNote = notes.find((note) => note.id === lastEditedNoteId);
			if (currentNote) {
				content = currentNote.content;
				title = currentNote.title;
				if (editorReady) selectNote(currentNote);
			}
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
					if (sortDirection === 'asc') {
						return titleA.localeCompare(titleB);
					} else {
						return titleB.localeCompare(titleA);
					}
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

	function selectNote(note) {
		if (!note) return console.error('Attempted to select undefined note');
		if (currentNote) saveNoteImmediately();
		currentNote = note;
		title = note.title;
		localStorage.setItem('lastEditedNoteId', note.id);

		if (editor) {
			editor.action((ctx) => {
				const view = ctx.get(editorViewCtx);
				const noteContent = note.content.trim() !== '' ? note.content : ' ';
				const parser = ctx.get(parserCtx);
				const doc = parser(noteContent);
				view.dispatch(view.state.tr.replaceWith(0, view.state.doc.content.size, doc));
			});
		}
	}

	async function createNewNote() {
		if (!$currentUser) return;
		try {
			const newNote = await pb.collection('notes').create({
				title: 'New Note',
				content: ' ',
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

	function handleInput() {
		if (currentNote) {
			currentNote.content = content;
			currentNote.title = title;
			saveNote();
			updateNoteInList(currentNote.id, title);
		}
	}

	function updateNoteInList(id: string, newTitle: string) {
		notes = notes.map((note) => (note.id === id ? { ...note, title: newTitle } : note));
	}

	const saveNote = debounce(async () => {
		if (!currentNote || !$currentUser) return;
		try {
			await pb.collection('notes').update(currentNote.id, { title, content });
			localStorage.setItem('lastEditedNoteId', currentNote.id);
			updateNoteInList(currentNote.id, title);
		} catch (error) {
			console.error('Failed to save note', error);
		}
	}, 1000);

	async function saveNoteImmediately() {
		if (!currentNote || !$currentUser) return;
		try {
			await pb.collection('notes').update(currentNote.id, { title, content });
			localStorage.setItem('lastEditedNoteId', currentNote.id);
			updateNoteInList(currentNote.id, title);
		} catch (error) {
			console.error('Failed to save note', error);
			toast.info('Failed to save note', error);
		}
	}

	async function deleteNote(noteId: string) {
		try {
			const note = await pb.collection('notes').getOne(noteId);

			if (!note.content || note.content.trim() === '') {
				// If no content, delete outright
				await pb.collection('notes').delete(noteId);
				toast.success('Note deleted successfully');
			} else {
				// If there's content, show confirmation dialog
				const confirmDelete = confirm(
					'Are you sure you want to delete this note? This action can be undone later.'
				);

				if (confirmDelete) {
					// Update the note with deleted flag and deletedDate
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

			// Refresh the notes list
			await loadNotes();

			// Clear the current note if it was the one deleted
			if (currentNote?.id === noteId) {
				currentNote = null;
				title = '';

				// Clear the editor content
				if (editor) {
					editor.action((ctx) => {
						const view = ctx.get(editorViewCtx);
						const { state } = view;
						view.dispatch(state.tr.delete(0, state.doc.content.size));
					});
				}
			}
		} catch (error) {
			console.error('Error deleting note:', error);
			toast.error('Failed to delete note');
		}
	}

	async function restoreNote(noteId: string) {
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

	function formatDate(dateString: string): string {
		return format(parseISO(dateString), 'yyyy-MM-dd');
	}

	function getSortIcon(field) {
		return sortBy === field ? (sortDirection === 'asc' ? IconChevronUp : IconChevronDown) : null;
	}

	function handleKeydown(event) {
		console.log(`🚀 ~ handleKeydown ~ event:`, event);
		if (event.key === 'Enter') {
			event.preventDefault(); // Prevent default behavior (new line)
			focusEditor();
		}
	}

	function focusEditor() {
		if (editor) {
			editor.action((ctx) => {
				const view = ctx.get(editorViewCtx);
				view.focus();
				const { state } = view;
				if (state.doc.content.size > 0) {
					// If the document has content, move cursor to the end
					const { tr } = state;
					const lastPos = state.doc.content.size;
					view.dispatch(
						tr.setSelection(state.selection.constructor.near(state.doc.resolve(lastPos)))
					);
				} else {
					// If the document is empty, just focus without changing selection
					view.focus();
				}
			});
		}
	}

	// Function to convert markdown-style checkboxes to HTML checkboxes
	function convertCheckboxes(text) {
		return text.replace(/- \[(x| )\] /g, (match, checked) => {
			const isChecked = checked === 'x' ? 'checked' : '';
			return `<label class="task-list-item"><input type="checkbox" ${isChecked}> `;
		});
	}

	// Function to convert hashtags to styled tags
	function convertTags(text) {
		return text.replace(/#(\w+)/g, '<span class="tag">#$1</span>');
	}

	// Function to update editor content
	function updateEditor() {
		let updatedContent = editor.innerHTML;
		updatedContent = convertCheckboxes(updatedContent);
		updatedContent = convertTags(updatedContent);
		editor.innerHTML = updatedContent;
	}

	const shortcuts = {
		'audio-recorder:start': [{ modifiers: ['Mod'], key: 'R' }],
		'audio-recorder:stop': [{ modifiers: ['Mod'], key: 'R' }],
		'switcher:open': [
			{ modifiers: [], key: 'F1' },
			{ modifiers: ['Alt'], key: 'Q' }
		],
		'app:open-help': [],
		'window:zoom-in': [{ modifiers: ['Mod'], key: '=' }],
		'window:zoom-out': [{ modifiers: ['Mod'], key: '-' }],
		'daily-notes': [{ modifiers: [], key: 'F2' }],
		'backlink:open': [{ modifiers: [], key: 'F3' }],
		'app:go-back': [{ modifiers: ['Mod'], key: ',' }],
		'app:go-forward': [{ modifiers: ['Mod'], key: '.' }],
		'editor:toggle-checklist-status':[{ modifiers: ['Mod'], key: 'l' }],
		'outline:open': [{ modifiers: ['Alt'], key: 'O' }],
		'obsidian-checklist-plugin:show-checklist-view': [{ modifiers: ['Alt'], key: 'C' }],
		'obsidian-excalidraw-plugin:insert-link-to-element': [],
		'obsidian-markdown-formatting-assistant-plugin:open-command-selector': [],
		'workspace:next-tab': [{ modifiers: ['Mod'], key: 'Tab' }],
		'workspace:previous-tab': [{ modifiers: ['Mod', 'Shift'], key: 'Tab' }],
		'app:toggle-right-sidebar': [{ modifiers: ['Alt'], key: 'R' }],
		'obsidian-outliner:fold': [{ modifiers: ['Mod', 'Shift'], key: ',' }],
		'obsidian-outliner:unfold': [{ modifiers: ['Mod', 'Shift'], key: '.' }],
		'obsidian-outliner:move-list-item-down': [{ modifiers: ['Mod'], key: 'ArrowDown' }],
		'obsidian-outliner:move-list-item-up': [{ modifiers: ['Mod'], key: 'ArrowUp' }],
		'obsidian-outliner:outdent-list': [{ modifiers: ['Mod'], key: '[' }],
		'obsidian-outliner:indent-list': [{ modifiers: ['Mod'], key: ']' }],
		'app:open-settings': [{ modifiers: ['Alt'], key: '/' }],
		'editor:cycle-list-checklist': [{ modifiers: ['Mod'], key: '\\' }],
		'app:toggle-left-sidebar': [{ modifiers: ['Alt'], key: 'L' }]
	};

	function handleShortcut(e) {
		for (const [action, combinations] of Object.entries(shortcuts)) {
			for (const combo of combinations) {
				const modifiersMatch = combo.modifiers.every((mod) => {
					if (mod === 'Mod') return e.ctrlKey || e.metaKey;
					if (mod === 'Alt') return e.altKey;
					if (mod === 'Shift') return e.shiftKey;
					return false;
				});

				if (modifiersMatch && e.key === combo.key) {
					e.preventDefault();
					console.log(`Action triggered: ${action}`);
					performAction(action);
					return;
				}
			}
		}
	}

	let fontSize = 16; // Base font size in pixels

	function toggleChecklistStatus() {
		const selection = window.getSelection();
		const node = selection.anchorNode;
		if (node && node.parentElement && node.parentElement.classList.contains('task-list-item')) {
			const checkbox = node.parentElement.querySelector('input[type="checkbox"]');
			if (checkbox) {
				checkbox.checked = !checkbox.checked;
				updateEditor();
			}
		}
	}

	function performAction(action) {
		switch (action) {
			case 'audio-recorder:start':
			case 'audio-recorder:stop':
				console.log('Toggle audio recording');
				toggleAudioRecording();
				break;
			case 'switcher:open':
				console.log('Open switcher');
				openSwitcher();
				break;
			case 'app:open-help':
				console.log('Open help');
				openHelp();
				break;
			case 'window:zoom-in':
				console.log('Zoom in');
				zoomIn();
				break;
			case 'window:zoom-out':
				console.log('Zoom out');
				zoomOut();
				break;
			case 'daily-notes':
				console.log('Open daily notes');
				openDailyNotes();
				break;
			case 'backlink:open':
				console.log('Open backlinks');
				openBacklinks();
				break;
			case 'app:go-back':
				console.log('Go back');
				goBack();
				break;
			case 'app:go-forward':
				console.log('Go forward');
				goForward();
				break;
			case 'editor:toggle-checklist-status':
				console.log('Toggle checklist status');
				toggleChecklistStatus();
				break;
			case 'outline:open':
				console.log('Open outline');
				openOutline();
				break;
			case 'obsidian-checklist-plugin:show-checklist-view':
				console.log('Show checklist view');
				showChecklistView();
				break;
			case 'obsidian-excalidraw-plugin:insert-link-to-element':
				console.log('Insert link to element');
				insertLinkToElement();
				break;
			case 'obsidian-markdown-formatting-assistant-plugin:open-command-selector':
				console.log('Open command selector');
				openCommandSelector();
				break;
			case 'workspace:next-tab':
				console.log('Go to next tab');
				goToNextTab();
				break;
			case 'workspace:previous-tab':
				console.log('Go to previous tab');
				goToPreviousTab();
				break;
			case 'app:toggle-right-sidebar':
				console.log('Toggle right sidebar');
				toggleRightSidebar();
				break;
			case 'obsidian-outliner:fold':
				console.log('Fold outline');
				foldOutline();
				break;
			case 'obsidian-outliner:unfold':
				console.log('Unfold outline');
				unfoldOutline();
				break;
			case 'obsidian-outliner:move-list-item-down':
				console.log('Move list item down');
				moveListItemDown();
				break;
			case 'obsidian-outliner:move-list-item-up':
				console.log('Move list item up');
				moveListItemUp();
				break;
			case 'obsidian-outliner:outdent-list':
				console.log('Outdent list');
				outdentList();
				break;
			case 'obsidian-outliner:indent-list':
				console.log('Indent list');
				indentList();
				break;
			case 'app:open-settings':
				console.log('Open settings');
				openSettings();
				break;
			case 'editor:cycle-list-checklist':
				console.log('Cycle list/checklist');
				cycleListChecklist();
				break;
			case 'app:toggle-left-sidebar':
				console.log('Toggle left sidebar');
				toggleLeftSidebar();
				break;
			default:
				console.log(`Unhandled action: ${action}`);
		}
	}

	function toggleAudioRecording() {
		// This would require a custom implementation or integration with an audio recording plugin
		console.log('Audio recording toggled');
	}

	function openSwitcher() {
		// Open command palette
		editor.action((ctx) => {
			ctx.get(callCommand)(/* Command for opening command palette */);
		});
	}

	function openHelp() {
		// This would require a custom implementation for your help system
		console.log('Help opened');
	}

	function zoomIn() {
		// Increase font size
		document.body.style.fontSize = `${parseFloat(getComputedStyle(document.body).fontSize) * 1.1}px`;
	}

	function zoomOut() {
		// Decrease font size
		document.body.style.fontSize = `${parseFloat(getComputedStyle(document.body).fontSize) * 0.9}px`;
	}

	function openDailyNotes() {
		// This would require a custom implementation for your daily notes system
		console.log('Daily notes opened');
	}

	function openBacklinks() {
		// This would require a custom implementation for your backlinks system
		console.log('Backlinks opened');
	}

	function goBack() {
		editor.action((ctx) => {
			console.log(`🚀 ~ editor.action ~ ctx:`, ctx);
			console.log(`🚀 ~ editor.action ~ callCommand:`, callCommand);
			ctx.get(callCommand)(undoCommand.key);
		});
	}

	function goForward() {
		editor.action((ctx) => {
			ctx.get(callCommand)(redoCommand.key);
		});
	}

	function openOutline() {
		// This would require a custom implementation for your outline system
		console.log('Outline opened');
	}

	function showChecklistView() {
		// This would require a custom implementation for your checklist view
		console.log('Checklist view shown');
	}

	function insertLinkToElement() {
		// This would require a custom implementation for your link insertion system
		console.log('Link to element inserted');
	}

	function openCommandSelector() {
		// This is likely the same as openSwitcher()
		openSwitcher();
	}

	function goToNextTab() {
		// This would require a custom implementation for your tab system
		console.log('Navigated to next tab');
	}

	function goToPreviousTab() {
		// This would require a custom implementation for your tab system
		console.log('Navigated to previous tab');
	}

	function toggleRightSidebar() {
		// This would require a custom implementation for your sidebar system
		console.log('Right sidebar toggled');
	}

	function foldOutline() {
		// This would require a custom implementation for your outline system
		console.log('Outline folded');
	}

	function unfoldOutline() {
		// This would require a custom implementation for your outline system
		console.log('Outline unfolded');
	}

	function moveListItemDown() {
		// This would require a custom implementation for list manipulation
		console.log('List item moved down');
	}

	function moveListItemUp() {
		// This would require a custom implementation for list manipulation
		console.log('List item moved up');
	}

	function outdentList() {
		// This would require a custom implementation for list manipulation
		console.log('List outdented');
	}

	function indentList() {
		// This would require a custom implementation for list manipulation
		console.log('List indented');
	}

	function openSettings() {
		// This would require a custom implementation for your settings system
		console.log('Settings opened');
	}

	function cycleListChecklist() {
  if (!editor) {
    console.log("Editor not initialized");
    return;
  }

  editor.action((ctx) => {
    const view = ctx.get(editorViewCtx);
    if (!view) {
      console.log("Editor view not found");
      return;
    }

    const { state, dispatch } = view;
    const { selection, doc } = state;
    const { $from } = selection;

    const node = doc.nodeAt($from.pos);
    if (!node) {
      console.log("No node at current position");
      return;
    }

    console.log("Current node type:", node.type.name);

    if (node.type === listItemSchema.type) {
      console.log("Converting to task list item");
      const taskListItemType = state.schema.nodes.taskListItem;
      if (taskListItemType) {
        dispatch(state.tr.setNodeMarkup($from.pos, taskListItemType, { checked: false }));
      } else {
        console.log("taskListItem type not found in schema");
      }
    } else if (node.type.name === 'taskListItem') {
      console.log("Handling task list item");
      if (!node.attrs.checked) {
        console.log("Checking task list item");
        dispatch(state.tr.setNodeMarkup($from.pos, null, { checked: true }));
        const strikeType = state.schema.marks.strike;
        if (strikeType) {
          dispatch(state.tr.addMark($from.pos, $from.pos + node.nodeSize, strikeType.create()));
        } else {
          console.log("Strike mark not found in schema");
        }
      } else {
        console.log("Converting back to regular list item");
        dispatch(state.tr.setNodeMarkup($from.pos, listItemSchema.type));
        const strikeType = state.schema.marks.strike;
        if (strikeType) {
          dispatch(state.tr.removeMark($from.pos, $from.pos + node.nodeSize, strikeType));
        }
      }
    } else {
      console.log("Creating new unordered list item");
      const bulletList = bulletListSchema.type.create();
      const listItem = listItemSchema.type.create();
      dispatch(state.tr
        .insert($from.pos, bulletList)
        .insert($from.pos + 1, listItem)
        .delete($from.pos + 2, $from.pos + 2 + node.nodeSize)
      );
    }

    content = view.state.doc.textContent;
    handleInput();
    console.log("Content updated:", content);
  });
}

	function toggleLeftSidebar() {
		// This would require a custom implementation for your sidebar system
		console.log('Left sidebar toggled');
	}
</script>

<main class="milkdown-notes bg-slate-1 text-slate-12 dark:bg-slate-12 dark:text-slate-1">
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
									<ContextMenu.Item
										class="text-slate-11 hover:bg-slate-3 hover:text-slate-12 dark:text-slate-2 dark:hover:bg-slate-10 dark:hover:text-slate-1"
									>
										<IconExternalLink class="mr-2" />
										Open in new tab
									</ContextMenu.Item>
									<ContextMenu.Item
										class="text-slate-11 hover:bg-slate-3 hover:text-slate-12 dark:text-slate-2 dark:hover:bg-slate-10 dark:hover:text-slate-1"
									>
										<IconArrowRight class="mr-2" />
										Open to the right
									</ContextMenu.Item>
									<ContextMenu.Item
										class="text-slate-11 hover:bg-slate-3 hover:text-slate-12 dark:text-slate-2 dark:hover:bg-slate-10 dark:hover:text-slate-1"
									>
										<IconWindowMaximize class="mr-2" />
										Open in new window
									</ContextMenu.Item>
									<ContextMenu.Separator class="bg-slate-6 dark:bg-slate-7" />
									<ContextMenu.Item
										class="text-slate-11 hover:bg-slate-3 hover:text-slate-12 dark:text-slate-2 dark:hover:bg-slate-10 dark:hover:text-slate-1"
									>
										<IconCopy class="mr-2" />
										Make a copy
									</ContextMenu.Item>
									<ContextMenu.Item
										class="text-slate-11 hover:bg-slate-3 hover:text-slate-12 dark:text-slate-2 dark:hover:bg-slate-10 dark:hover:text-slate-1"
									>
										<IconArrowRightCircle class="mr-2" />
										Move file to...
									</ContextMenu.Item>
									<ContextMenu.Item
										class="text-slate-11 hover:bg-slate-3 hover:text-slate-12 dark:text-slate-2 dark:hover:bg-slate-10 dark:hover:text-slate-1"
									>
										<IconBookmark class="mr-2" />
										Bookmark...
									</ContextMenu.Item>
									<ContextMenu.Item
										class="text-slate-11 hover:bg-slate-3 hover:text-slate-12 dark:text-slate-2 dark:hover:bg-slate-10 dark:hover:text-slate-1"
									>
										<IconGitMerge class="mr-2" />
										Merge entire file with...
									</ContextMenu.Item>
									<ContextMenu.Item
										class="text-slate-11 hover:bg-slate-3 hover:text-slate-12 dark:text-slate-2 dark:hover:bg-slate-10 dark:hover:text-slate-1"
									>
										<IconLink class="mr-2" />
										Copy Obsidian URL
									</ContextMenu.Item>
									<ContextMenu.Separator class="bg-slate-6 dark:bg-slate-7" />
									<ContextMenu.Item
										class="text-slate-11 hover:bg-slate-3 hover:text-slate-12 dark:text-slate-2 dark:hover:bg-slate-10 dark:hover:text-slate-1"
									>
										<IconClock class="mr-2" />
										Open version history
									</ContextMenu.Item>
									<ContextMenu.Item
										class="text-slate-11 hover:bg-slate-3 hover:text-slate-12 dark:text-slate-2 dark:hover:bg-slate-10 dark:hover:text-slate-1"
									>
										<IconAppWindow class="mr-2" />
										Open in default app
									</ContextMenu.Item>
									<ContextMenu.Item
										class="text-slate-11 hover:bg-slate-3 hover:text-slate-12 dark:text-slate-2 dark:hover:bg-slate-10 dark:hover:text-slate-1"
									>
										<IconFolder class="mr-2" />
										Show in system explorer
									</ContextMenu.Item>
									<ContextMenu.Separator class="bg-slate-6 dark:bg-slate-7" />
									<ContextMenu.Item
										class="text-slate-11 hover:bg-slate-3 hover:text-slate-12 dark:text-slate-2 dark:hover:bg-slate-10 dark:hover:text-slate-1"
									>
										<IconEdit class="mr-2" />
										Rename...
									</ContextMenu.Item>

									<ContextMenu.Item
										on:click={() => deleteNote(note.id)}
										class="text-red-9 hover:bg-red-3 hover:text-red-11 dark:text-red-3 dark:hover:bg-red-9 dark:hover:text-red-1"
									>
										<span class="flex items-center">
											<IconTrash class="mr-2" /> Delete
										</span>
									</ContextMenu.Item>
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
				<div class="flex flex-grow flex-col overflow-y-scroll p-4">
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
					<div class="w-full pr-2">
						<div
							id="editor"
							bind:this={contentArea}
							class="h-full w-full bg-slate-1 text-slate-12 dark:bg-slate-12 dark:text-slate-1"
						></div>
					</div>
				</div>
			</div>
		</Resizable.Pane>
	</Resizable.PaneGroup>
</main>

<style>
	.milkdown-notes {
		height: calc(100vh - 64px);
		margin-top: 64px;
	}

	.milkdown :global(.task-list-item input[type='checkbox']) {
		-webkit-appearance: none;
		appearance: none;
		width: 1.2em;
		height: 1.2em;
		border: 2px solid var(--slate-7);
		border-radius: 0.2em;
		margin-right: 0.5em;
		vertical-align: middle;
		position: relative;
		cursor: pointer;
	}

	.milkdown :global(.task-list-item input[type='checkbox']:checked) {
		background-color: var(--green-9);
		border-color: var(--green-9);
	}

	.milkdown :global(.task-list-item input[type='checkbox']:checked::after) {
		content: '✓';
		font-size: 1em;
		color: white;
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
	}

	/* Styles for tags */
	.milkdown :global(.tag) {
		display: inline-block;
		background-color: var(--blue-4);
		color: var(--blue-11);
		padding: 0.2em 0.6em;
		border-radius: 9999px;
		font-size: 0.9em;
		font-weight: 500;
		margin: 0 0.2em;
		transition: background-color 0.2s ease;
	}

	.milkdown :global(.tag:hover) {
		background-color: var(--blue-5);
	}
</style>
