<script lang="ts">
	import { onMount } from 'svelte';
	import { pb, currentUser } from '$utils/pocketbase';
	import * as Resizable from "$lib/components/ui/resizable";
	import { IconNote, IconPlus } from '@tabler/icons-svelte';
	import MarkdownIt from 'markdown-it';
  
	let notes = [];
	let currentNote = null;
	let content = '';
	const md = new MarkdownIt();
  
	onMount(async () => {
	  if ($currentUser) {
		await loadNotes();
	  }
	  // Load last edited note from localStorage
	  const lastEditedNoteId = localStorage.getItem('lastEditedNoteId');
	  if (lastEditedNoteId) {
		currentNote = notes.find(note => note.id === lastEditedNoteId);
		if (currentNote) {
		  content = currentNote.content;
		}
	  }
	});
  
	async function loadNotes() {
	  try {
		const resultList = await pb.collection('notes').getList(1, 50, {
		  filter: `user_id = "${$currentUser.id}"`,
		  sort: '-created',
		});
		notes = resultList.items;
	  } catch (error) {
		console.error('Failed to load notes', error);
	  }
	}
  
	function selectNote(note) {
	  currentNote = note;
	  content = note.content;
	  localStorage.setItem('lastEditedNoteId', note.id);
	}
  
	async function createNewNote() {
	  if (!$currentUser) return;
  
	  try {
		const newNote = await pb.collection('notes').create({
		  content: '',
		  user_id: $currentUser.id,
		  date: new Date().toISOString().split('T')[0],
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
		await pb.collection('notes').update(currentNote.id, { content });
		currentNote.content = content; // Update the local note object
		localStorage.setItem('lastEditedNoteId', currentNote.id);
	  } catch (error) {
		console.error('Failed to save note', error);
	  }
	}
  
	function handleInput() {
	  if (currentNote) {
		currentNote.content = content;
	  }
	}
  </script>
  
  <main class="h-screen bg-gray-100 text-gray-800">
	<Resizable.PaneGroup direction="horizontal" class="h-full">
	  <Resizable.Pane defaultSize={25} minSize={15} maxSize={40}>
		<div class="h-full p-4 bg-white overflow-y-auto">
		  <div class="flex justify-between items-center mb-4">
			<h2 class="text-xl font-bold">Notes</h2>
			<button on:click={createNewNote} class="p-1 rounded hover:bg-gray-200">
			  <IconPlus size={24} />
			</button>
		  </div>
		  <ul>
			{#each notes as note (note.id)}
			  <li
				class="cursor-pointer p-2 hover:bg-gray-100 {currentNote?.id === note.id ? 'bg-blue-100' : ''}"
				on:click={() => selectNote(note)}
			  >
				{note.updated} - {note.content.slice(0, 30)}...
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
			<h1 class="text-2xl font-bold">
			  {currentNote ? `Note from ${currentNote.date}` : 'No note selected'}
			</h1>
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