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
	import Paragraph from '@editorjs/paragraph';
	import List from '@editorjs/list';
	import Checklist from '@editorjs/checklist';
	import ImageTool from '@editorjs/image';
	import Quote from '@editorjs/quote';
	import CodeTool from '@editorjs/code';
	import Delimiter from '@editorjs/delimiter';
	import Table from '@editorjs/table';
	import { tasklist } from '@mdit/plugin-tasklist';
	import tasklists from 'markdown-it-task-lists';

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
	$: noteId = localStorage.getItem('lastEditedNoteId');
	$: console.log(`🚀 ~ noteId:`, noteId);

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

	const md = new MarkdownIt().use(tasklists);

	function markdownToEditorJS(markdown) {
		const html = md.render(markdown);
		const blocks = [];
		const parser = new DOMParser();
		const doc = parser.parseFromString(html, 'text/html');

		doc.body.childNodes.forEach((node) => {
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
						if (node.classList.contains('contains-task-list')) {
							blocks.push({
								type: 'checklist',
								data: {
									items: Array.from(node.children).map((li) => {
										const checkbox = li.querySelector('input[type="checkbox"]');
										return {
											text: li.textContent.replace(/^\[[ xX]\]\s*/, '').trim(),
											checked: checkbox ? checkbox.checked : false
										};
									})
								}
							});
						} else {
							blocks.push({
								type: 'list',
								data: {
									style: 'unordered',
									items: Array.from(node.children).map((li) => li.innerHTML.trim())
								}
							});
						}
						break;
					case 'ol':
						if (node.classList.contains('contains-task-list')) {
							blocks.push({
								type: 'checklist',
								data: {
									items: Array.from(node.children).map((li) => {
										const checkbox = li.querySelector('input[type="checkbox"]');
										return {
											text: li.textContent.replace(/^\d+\.\s*\[[ xX]\]\s*/, '').trim(),
											checked: checkbox ? checkbox.checked : false
										};
									})
								}
							});
						} else {
							blocks.push({
								type: 'list',
								data: {
									style: 'ordered',
									items: Array.from(node.children).map((li) => li.innerHTML.trim())
								}
							});
						}
						break;
						blocks.push({
							type: 'list',
							data: {
								style: 'ordered',
								items: Array.from(node.children).map((li) => li.innerHTML.trim())
							}
						});
						break;
					case 'img':
						blocks.push({
							type: 'image',
							data: {
								file: {
									url: node.src
								},
								caption: node.alt || '',
								withBorder: node.className.includes('with-border'),
								withBackground: node.className.includes('with-background'),
								stretched: node.className.includes('stretched')
							}
						});
						break;
					case 'blockquote':
						blocks.push({
							type: 'quote',
							data: {
								text: node.innerHTML,
								caption: node.getAttribute('cite') || ''
							}
						});
						break;
					case 'pre':
						blocks.push({
							type: 'code',
							data: {
								code: node.textContent
							}
						});
						break;
					case 'hr':
						blocks.push({
							type: 'delimiter',
							data: {}
						});
						break;
					case 'table':
						blocks.push({
							type: 'table',
							data: {
								content: node.innerHTML
							}
						});
						break;
				}
			}
		});

		return { blocks };
	}

	function editorJSToMarkdown(data) {
		let markdown = '';
		data.blocks.forEach((block) => {
			switch (block.type) {
				case 'header':
					markdown += '#'.repeat(block.data.level) + ' ' + block.data.text + '\n\n';
					break;
				case 'paragraph':
					markdown += block.data.text + '\n\n';
					break;

				case 'list':
					block.data.items.forEach((item, index) => {
						const indent = '  '.repeat(item.indent || 0);
						if (block.data.style === 'ordered') {
							markdown += `${indent}${index + 1}. ${item}\n`;
						} else {
							markdown += `${indent}- ${item}\n`;
						}
					});
					markdown += '\n';
					break;
				case 'checklist':
					block.data.items.forEach((item) => {
						markdown += `- [${item.checked ? 'x' : ' '}] ${item.text}\n`;
					});
					markdown += '\n';
					break;

				case 'image':
					const caption = block.data.caption ? ` "${block.data.caption}"` : '';
					markdown += `![${block.data.caption || ''}](${block.data.file.url}${caption})`;
					if (block.data.withBorder) markdown += '{.with-border}';
					if (block.data.withBackground) markdown += '{.with-background}';
					if (block.data.stretched) markdown += '{.stretched}';
					markdown += '\n\n';
					break;
				case 'quote':
					markdown += `> ${block.data.text}\n`;
					if (block.data.caption) {
						markdown += `> — ${block.data.caption}\n`;
					}
					markdown += '\n';
					break;
				case 'code':
					markdown += '```\n' + block.data.code + '\n```\n\n';
					break;
				case 'delimiter':
					markdown += '---\n\n';
					break;
				case 'table':
					markdown += block.data.content + '\n\n';
					break;
				// Add more cases as needed
			}
		});
		return markdown.trim();
	}

	function preprocessMarkdown(markdown) {
		return markdown.replace(/^(\d+\.|\*|-)\s*\[([ xX])\]\s*/gm, (match, listMarker, checked) => {
			const isOrdered = /^\d+\./.test(listMarker);
			const checkedStatus = checked.toLowerCase().trim() === 'x' ? 'x' : ' ';
			return `${isOrdered ? '1. ' : '- '}[${checkedStatus}] `;
		});
	}

	// Use this function before converting to EditorJS format
	// const editorJSData = markdownToEditorJS(preprocessMarkdown(markdownContent));

	async function initializeEditor() {
		const lastEditedNoteId = localStorage.getItem('lastEditedNoteId');
		if (lastEditedNoteId) {
			currentNote = notes.find((note) => note.id === lastEditedNoteId);
			console.log(`🚀 ~ initializeEditor ~ currentNote:`, currentNote);
		}
		editor = new EditorJS({
			holder: 'editor',
			tools: {
				header: Header,
				code: CodeTool,
				delimiter: Delimiter,
				table: Table,
				quote: Quote,
				listCycle: {
					class: ListCycleTool,
					shortcut: 'CMD+\\'
				},
				list: {
					class: List,
					inlineToolbar: true
				},
				checklist: {
					class: CustomChecklistTool,
					inlineToolbar: true
				},
				paragraph: Paragraph,
				image: {
					class: CustomImageTool,
					config: {
						endpoints: {
							byFile: '/api/uploadImage',
							byUrl: '/api/fetchImageUrl'
						},
						additionalRequestData: {
							noteId: currentNote ? currentNote?.id : null
						},
						field: 'image',
						types: 'image/*'
					},
					uploader: {
						uploadByFile(file) {
							console.log(`🚀 ~ uploadByFile ~ file:`, file);
							console.log(`🚀 ~ uploadByFile ~ currentNote:`, currentNote);
							const formData = new FormData();
							formData.append('image', file);
							formData.append('noteId', currentNote.id);
							formData.append('caption', file.caption);

							return fetch('/api/uploadImage', {
								method: 'POST',
								body: formData
							})
								.then((response) => response.json())
								.then((result) => {
									console.log('Upload result:', result);
									if (result.success) {
										return {
											success: 1,
											file: {
												url: result.file.url,
												id: result.file.id
											}
										};
									}
									throw new Error(result.error || 'Upload failed');
								});
						}
					}
				}
			},
			shortcuts: {
				'CMD+\\': (event) => {
					console.log('Shortcut CMD+\\ triggered');
					event.preventDefault();
					const tool = editor.toolbar.toolsInstances.listCycle;
					if (tool) {
						tool.surround(editor.selection.range);
					}
				}
			},
			onChange: () => {
				handleInput();
			},
			data: currentNote ? markdownToEditorJS(currentNote.content) : {}
		});
		if (currentNote) {
			title = currentNote.title;
			editor.isReady.then(() => {
				console.log(`🚀 ~ initializeEditor ~ currentNote:`, currentNote);
				console.log('Image tool:', editor.configuration.tools.image);
				editor.render(markdownToEditorJS(currentNote.content));
			});
		}
	}

	class CustomImageTool extends ImageTool {
		constructor({ data, config, api, block, readOnly }) {
			super({ data, config, api, block, readOnly });
			this.api = api;
			console.log('CustomImageTool initialized');
		}

		render() {
			console.log('CustomImageTool render method called');
			return super.render();
		}

		save(blockContent) {
			const savedData = super.save(blockContent);
			console.log('CustomImageTool save method called', savedData);

			if (savedData.file && savedData.file.id) {
				// Update the block by its actual index or ID
				this.api.blocks.update(savedData.id, savedData);
			} else {
				// If the image block does not have an ID, you might need to insert it into the block list
				const newIndex = this.api.blocks.insert('image', savedData);
				if (newIndex !== -1) {
					this.api.blocks.update(newIndex, savedData);
				}
			}

			return savedData;
		}

		// Override the validate method if needed
		validate(savedData) {
			return super.validate(savedData);
		}
	}

	class CustomChecklistTool extends Checklist {
		static get sanitize() {
			return {
				items: {
					text: true,
					checked: false
				}
			};
		}

		static get pasteConfig() {
			return {
				patterns: {
					checkbox: /^\s*(\[[ xX]\])\s*(.*)/gm
				},
				callbacks: {
					checkbox: (matches) => {
						return {
							text: matches[2].trim(),
							checked: matches[1].toLowerCase().includes('x')
						};
					}
				}
			};
		}
	}

	class ListCycleTool {
		static get isInline() {
			return true;
		}

		get state() {
			return this._state;
		}

		set state(state) {
			this._state = state;
			this.button.classList.toggle(this.api.styles.inlineToolButtonActive, state);
		}

		constructor({ api }) {
			this.api = api;
			this.button = null;
			this._state = false;
		}

		render() {
			this.button = document.createElement('button');
			this.button.type = 'button';
			this.button.innerHTML = '⇌';
			this.button.classList.add(this.api.styles.inlineToolButton);
			return this.button;
		}

		surround(range) {
			console.log('ListCycleTool surround method called');
			if (!range) {
				return;
			}

			const parentBlock = this.api.blocks.getBlockByIndex(this.api.blocks.getCurrentBlockIndex());

			if (!parentBlock) {
				return;
			}

			const blockType = parentBlock.name;
			const blockData = parentBlock.call('core', 'sanitizeConfig');

			let newType, newData;

			switch (blockType) {
				case 'paragraph':
					newType = 'list';
					newData = {
						style: 'unordered',
						items: [range.extractContents().textContent]
					};
					break;
				case 'list':
					if (blockData.style === 'unordered') {
						newType = 'checklist';
						newData = {
							items: [
								{
									text: range.extractContents().textContent,
									checked: false
								}
							]
						};
					} else {
						newType = 'list';
						newData = {
							style: 'unordered',
							items: [range.extractContents().textContent]
						};
					}
					break;
				case 'checklist':
					const item = blockData.items.find(
						(item) => item.text === range.extractContents().textContent
					);
					if (item && !item.checked) {
						item.checked = true;
						newType = 'checklist';
						newData = blockData;
					} else {
						newType = 'paragraph';
						newData = {
							text: range.extractContents().textContent
						};
					}
					break;
				default:
					return;
			}

			this.api.blocks.delete(this.api.blocks.getCurrentBlockIndex());
			this.api.blocks.insert(newType, newData);
		}

		checkState() {
			console.log('ListCycleTool checkState method called');
			const block = this.api.blocks.getBlockByIndex(this.api.blocks.getCurrentBlockIndex());
			this.state = block && (block.name === 'list' || block.name === 'checklist');
		}

		static get shortcut() {
			return 'CMD+\\';
		}
	}

	async function selectNote(note) {
		if (!note) return console.error('Attempted to select undefined note');
		if (currentNote) await saveNoteImmediately();
		currentNote = note;
		title = note.title;
		localStorage.setItem('lastEditedNoteId', note.id);

		editor.isReady.then(async () => {
			let editorData;
			if (note.editorJSData && note.editorJSData?.length > 0) {
				try {
					editorData = JSON.parse(note.editorJSData);
					// Ensure image URLs are up to date
					for (let block of editorData.blocks) {
						if (block.type === 'image' && block.data.file.id) {
							const image = await pb.collection('images').getOne(block.data.file.id);
							block.data.file.url = pb.files.getUrl(image, image.file);
						}
					}
				} catch (error) {
					console.error('Failed to parse EditorJS data:', error);
				}
			}
			if (!editorData) {
				editorData = markdownToEditorJS(note.content);
			}
			console.log('Loading note:', editorData);
			editor.render(editorData);
		});
	}

	async function createNewNote() {
		if (!$currentUser) return;
		try {
			const newNote = await pb.collection('notes').create({
				title: 'New Note',
				content: '', // Empty markdown content
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
			console.log(`🚀 ~ handleInput ~ savedData:`, savedData);
			currentNote.content = editorJSToMarkdown(savedData);
			currentNote.title = title;
			saveNote();
			updateNoteInList(currentNote.id, title);
		}
	}, 200);

	async function saveNote() {
		if (!currentNote || !$currentUser) return;

		try {
			const savedData = await editor.save();
			savedData.blocks.forEach((block) => {
				console.log(`🚀 ~ savedData.blocks.forEach ~ block:`, block)
				if (block.type === 'image' && block.data.file.id) {
					const image = pb.collection('images').getOne(block.data.file.id);
					block.data.file.url = pb.files.getUrl(image, image.file);
				}
			})
			console.log(
				'Image IDs:',
				savedData.blocks
					.filter((block) => block.type === 'image')
					.map((block) => block.data.file.id)
			);
			console.log(
				'Image URLs:',
				savedData.blocks
					.filter((block) => block.type === 'image')
					.map((block) => block.data.file.url)
			);

			if (savedData.blocks.length > 0 && savedData.blocks[0].type === 'image') {
				const imageBlockIndex = this.api.blocks.indexOf(savedData.blocks[0]);

				console.log('Image block index:', imageBlockIndex);
				console.log('Image block ID:', savedData.blocks[imageBlockIndex].data.file.id);
				console.log('Image block URL:', savedData.blocks[imageBlockIndex].data.file.url);
			}
			const markdownContent = editorJSToMarkdown(savedData);
			console.log(`🚀 ~ saveNote ~ markdownContent:`, markdownContent);
			// Extract image IDs from the saved data
			const imageIds = savedData.blocks
				.filter((block) => block.type === 'image')
				.map((block) => block.data.file.id);

			await pb.collection('notes').update(currentNote.id, {
				title,
				content: markdownContent,
				editorJSData: JSON.stringify(savedData),
				images: imageIds // Update the relation to images
			});
			console.log('Note saved:', { markdown: markdownContent, editorJS: savedData });
			localStorage.setItem('lastEditedNoteId', currentNote.id);
			updateNoteInList(currentNote.id, title);
			console.log(
				'Image IDs:',
				savedData.blocks
					.filter((block) => block.type === 'image')
					.map((block) => block.data.file.id)
			);
			console.log(
				'Image URLs:',
				savedData.blocks
					.filter((block) => block.type === 'image')
					.map((block) => block.data.file.url)
			);
		} catch (error) {
			console.error('Failed to save note', error);
		}
		const note = await pb.collection('notes').getOne(noteId);
		console.log('Database image IDs:', note.images);
		console.log(
			'Database image URLs:',
			note.images.map((imageId) => pb.files.getUrl(imageId))
		);
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
			console.log(`🚀 ~ loadNotes ~ notes:`, notes);

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
		const note = await pb.collection('notes').getOne(noteId);
		console.log('Note content:', note.content);
		// console.log(
		// 	'Image IDs:',
		// 	JSON.parse(note.editorJSData)
		// 		.blocks?.filter((block) => block.type === 'image')
		// 		.map((block) => block.data.file.id)
		// );
		// console.log(
		// 	'Image URLs:',
		// 	JSON.parse(note.editorJSData)
		// 		.blocks?.filter((block) => block.type === 'image')
		// 		.map((block) => block.data.file.url)
		// );
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

<div class="notes-container overflow-hidden">
	<!-- ... (your existing notes list UI) ... -->
	<main class="editorjs-notes bg-slate-1 text-slate-12 dark:bg-slate-12 dark:text-slate-1">
		<Resizable.PaneGroup direction="horizontal" class="h-full ">
			<Resizable.Pane defaultSize={25} minSize={15} maxSize={40}>
				<div class="notes-list overflow-y-auto bg-slate-2 p-4 dark:bg-slate-12">
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
													class={item.isDanger
														? 'text-red-9 hover:bg-red-3 hover:text-red-11 dark:text-red-3 dark:hover:bg-red-9 dark:hover:text-red-1'
														: 'text-slate-11 hover:bg-slate-3 hover:text-slate-12 dark:text-slate-2 dark:hover:bg-slate-10 dark:hover:text-slate-1'}
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
					<div class="relative flex flex-grow flex-col overflow-y-scroll p-4">
						<div id="editor" class="note-editor h-full w-full">
							<div class="mb-4 flex items-center">
								<IconNote class="mr-2 text-slate-11 dark:text-slate-2" />
								<input
									type="text"
									bind:value={title}
									bind:this={titleInput}
									on:input={handleInput}
									on:keydown={handleKeydown}
									class="w-full border-none bg-transparent text-2xl font-bold text-slate-12 placeholder-slate-11 outline-none focus:outline-none dark:text-slate-1 dark:placeholder-slate-3"
									placeholder="Note Title"
									disabled={!currentNote}
								/>
							</div>

							<div id="editorjs"></div>
						</div>
					</div>
				</div>
			</Resizable.Pane>
		</Resizable.PaneGroup>
	</main>
</div>

<style>
	/* Add any global styles here if needed */
	:global(.codex-editor) {
		/* Styles for the Editor.js container */
	}

	:global(.ce-block) {
		/* Styles for Editor.js blocks */
	}

	#editor,
	.notes-list {
		height: calc(100vh - 64px);
		margin-top: 8rem;
	}

	:global(.simple-image) {
		padding: 20px;
		background-color: #f3f3f3;
		border: 1px solid #e3e3e3;
		border-radius: 3px;
	}

	:global(.simple-image input) {
		width: 100%;
		padding: 10px;
		border: 1px solid #e3e3e3;
		border-radius: 3px;
		margin-bottom: 10px;
	}

	:global(.simple-image button) {
		background-color: #4caf50;
		border: none;
		color: white;
		padding: 10px 20px;
		text-align: center;
		text-decoration: none;
		display: inline-block;
		font-size: 16px;
		margin: 4px 2px;
		cursor: pointer;
		border-radius: 3px;
	}

	:global(.simple-image__dropzone) {
		border: 2px dashed #ccc;
		border-radius: 20px;
		width: 100%;
		margin: 10px 0;
		padding: 20px;
		text-align: center;
	}

	:global(.simple-image__dropzone.highlight) {
		border-color: purple;
	}

	:global(.simple-image__picture) {
		max-width: 100%;
		cursor: pointer;
	}

	:global(.simple-image__picture--preview) {
		max-width: 200px;
		max-height: 200px;
		object-fit: contain;
	}

	:global(.simple-image__url) {
		width: 100%;
		margin-top: 10px;
	}

	/* Add more global styles for Editor.js elements as needed */
</style>
