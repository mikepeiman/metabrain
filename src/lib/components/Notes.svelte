<script lang="ts">
	import { onMount } from 'svelte';
	import { pb, currentUser } from '$utils/pocketbase';
	import * as Resizable from "$lib/components/ui/resizable";
	import * as Select from "$lib/components/ui/select";
	import { Button } from "$lib/components/ui/button";
	import { IconNote, IconPlus } from '@tabler/icons-svelte';
	import MarkdownIt from 'markdown-it';
	import { format, parseISO } from 'date-fns';
  
	let notes = [];
	let currentNote = null;
	let content = '';
	let title = '';
	let sortBy = 'updated';
	const md = new MarkdownIt();
  
	onMount(async () => {
	  if ($currentUser) {
	  console.log(`🚀 ~ onMount ~ $currentUser:`, $currentUser)
		await loadNotes();
	  }
	  const lastEditedNoteId = localStorage.getItem('lastEditedNoteId');
	  if (lastEditedNoteId) {
		currentNote = notes.find(note => note.id === lastEditedNoteId);
		if (currentNote) {
		  content = currentNote.content;
		  title = currentNote.title;
		}
	  }
	});
  
	async function loadNotes() {
	  try {
		const resultList = await pb.collection('notes').getList(1, 50, {
		  filter: `user_id = "${$currentUser.id}"`,
		  sort: `-${sortBy}`,
		});
		notes = resultList.items;
	  } catch (error) {
		console.error('Failed to load notes', error);
	  }
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
		  user_id: $currentUser.id,
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
  
	$: {
	  if (sortBy) {
		loadNotes();
	  }
	}
  </script>
  
  <main class="h-screen bg-gray-100 text-gray-800">
	<Resizable.PaneGroup direction="horizontal" class="h-full">
	  <Resizable.Pane defaultSize={25} minSize={15} maxSize={40}>
		<div class="h-full p-4 bg-white overflow-y-auto">
		  <div class="flex justify-between items-center mb-4">
			<h2 class="text-xl font-bold">Notes</h2>
			<Button on:click={createNewNote} variant="outline" size="sm">
			  <IconPlus class="mr-2 h-4 w-4" />
			  Create
			</Button>
		  </div>
		  <div class="mb-4">
			<Select.Root bind:value={sortBy}>
			  <Select.Trigger class="w-full">
				<Select.Value placeholder="Sort by..." />
			  </Select.Trigger>
			  <Select.Content>
				<Select.Item value="created">Created Date</Select.Item>
				<Select.Item value="updated">Updated Date</Select.Item>
				<Select.Item value="title">Title</Select.Item>
			  </Select.Content>
			</Select.Root>
		  </div>
		  <ul>
			{#each notes as note (note.id)}
			  <li
				class="cursor-pointer p-2 hover:bg-gray-100 {currentNote?.id === note.id ? 'bg-blue-100' : ''}"
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
		</div>
	  </Resizable.Pane>
	  <Resizable.Handle />
	  <Resizable.Pane defaultSize={75} minSize={60} maxSize={85}>
		<div class="h-full p-4 flex flex-col">
		  <div class="flex items-center mb-4">
			<IconNote class="mr-2" />
			<input
			  type="text"
			  bind:value={title}
			  on:input={handleInput}
			  on:blur={saveNote}
			  class="text-2xl font-bold bg-transparent border-none focus:outline-none w-full"
			  placeholder="Note Title"
			  disabled={!currentNote}
			/>
		  </div>
		  <div class="flex-grow flex">
			<div class="w-1/2 pr-2">
			  <textarea
				bind:value={content}
				on:input={handleInput}
				on:blur={saveNote}
				class="w-full h-full p-2 bg-white border border-gray-300 rounded resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
				placeholder="Write your markdown here..."
				disabled={!currentNote}
			  ></textarea>
			</div>
			<div class="w-1/2 pl-2">
			  <div class="w-full h-full p-2 bg-white border border-gray-300 rounded overflow-y-auto">
				{@html md.render(content)}
			  </div>
			</div>
		  </div>
		</div>
	  </Resizable.Pane>
	</Resizable.PaneGroup>
  </main>