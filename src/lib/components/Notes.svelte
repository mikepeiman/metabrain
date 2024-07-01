<script>
	import { pb, currentUser } from '$utils/pocketbase';
	import { onMount } from 'svelte';
	import NoteList from './NoteList.svelte';
	import { IconNote } from '@tabler/icons-svelte';
	import MarkdownIt from 'markdown-it';
  
	let currentNote = null;
	let content = '';
	const md = new MarkdownIt();

	onMount(() => {
    if ($currentUser) {
      console.log('User is authenticated:', $currentUser);
    } else {
      console.log('User is not authenticated');
    }
  })
  
	function handleNoteSelect(event) {
	  currentNote = event.detail;
	  content = currentNote ? currentNote.content : '';
	}
  
	async function saveNote() {
    if (!$currentUser) {
      console.error('User not authenticated');
      return;
    }

    try {
      const data = {
        content,
        user_id: $currentUser.id,
        date: new Date().toISOString().split('T')[0],
      };

      if (currentNote) {
        await pb.collection('notes').update(currentNote.id, data);
      } else {
        await pb.collection('notes').create(data);
      }
      console.log('Note saved successfully');
    } catch (error) {
      console.error('Failed to save note', error);
      if (error.data) {
        console.error('Error data:', error.data);
      }
    }
  }
  </script>
  
  <main class="flex h-screen bg-gray-100 text-gray-800">
	<aside class="w-1/4 bg-white p-4 overflow-y-auto border-r border-gray-200">
	  <NoteList on:noteSelect={handleNoteSelect} />
	</aside>
	<section class="w-3/4 p-4 flex flex-col">
	  <div class="flex items-center mb-4">
		<IconNote class="mr-2" />
		<h1 class="text-2xl font-bold">Notes</h1>
	  </div>
	  <div class="flex-grow flex">
		<div class="w-1/2 pr-2">
		  <textarea
			bind:value={content}
			on:input={saveNote}
			class="w-full h-full p-2 bg-white border border-gray-300 rounded resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
			placeholder="Write your markdown here..."
		  ></textarea>
		</div>
		<div class="w-1/2 pl-2">
		  <div class="w-full h-full p-2 bg-white border border-gray-300 rounded overflow-y-auto">
			{@html md.render(content)}
		  </div>
		</div>
	  </div>
	</section>
  </main>
  
  <style>
	:global(body) {
	  @apply bg-gray-100 text-gray-800;
	}
  </style>