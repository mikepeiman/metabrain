<script lang="ts">
	import { onMount } from 'svelte';
	import { pb, currentUser } from '$utils/pocketbase';
	import MarkdownEditor from './MarkdownEditor.svelte';
	import TimestampList from './TimestampList.svelte';
	import NotesList from './NotesList.svelte';
	import TagManager from './TagManager.svelte';
	import { IconAi } from '@tabler/icons-svelte';
  
	let notes: any[] = [];
	let currentNote: any = null;
	let tags: any[] = [];
  
	onMount(async () => {
	  if ($currentUser) {
		await fetchNotes();
		await fetchTags();
	  } else {
		console.log('No user is currently logged in');
	  }
	});
  
	async function fetchNotes() {
	  try {
		const resultList = await pb.collection('objects').getList(1, 50, {
		  filter: `type = "note" && created.user = "${$currentUser.id}"`,
		  sort: '-created',
		  expand: 'properties(object_id),relationships(from_object_id)'
		});
		notes = resultList.items;
		if (notes.length > 0) {
		  currentNote = notes[0];
		}
	  } catch (error) {
		console.error('Error fetching notes:', error);
	  }
	}
  
	async function fetchTags() {
	  try {
		const resultList = await pb.collection('objects').getList(1, 50, {
		  filter: `type = "tag"`,
		  expand: 'properties(object_id)'
		});
		tags = resultList.items;
	  } catch (error) {
		console.error('Error fetching tags:', error);
	  }
	}
  
	async function handleNoteSelect(note: any) {
	  currentNote = note;
	}
  
	async function handleNoteUpdate(updatedContent: string) {
	  try {
		const contentProperty = currentNote.expand['properties(object_id)'].find(
		  (prop) => prop.key === 'content'
		);
		
		if (contentProperty) {
		  await pb.collection('properties').update(contentProperty.id, {
			value: JSON.stringify(updatedContent)
		  });
		} else {
		  await pb.collection('properties').create({
			object_id: currentNote.id,
			key: 'content',
			value: JSON.stringify(updatedContent)
		  });
		}
  
		await pb.collection('versions').create({
		  object_id: currentNote.id,
		  data: JSON.stringify({ content: updatedContent })
		});
  
		await fetchNotes();
	  } catch (error) {
		console.error('Error updating note:', error);
	  }
	}
  
	async function handleTagCreate(tagName: string) {
	  try {
		const newTag = await pb.collection('objects').create({
		  type: 'tag'
		});
  
		await pb.collection('properties').create({
		  object_id: newTag.id,
		  key: 'name',
		  value: JSON.stringify(tagName)
		});
  
		await fetchTags();
	  } catch (error) {
		console.error('Error creating tag:', error);
	  }
	}
  
	async function handleTagNote(tagId: string) {
	  try {
		await pb.collection('relationships').create({
		  from_object_id: currentNote.id,
		  to_object_id: tagId,
		  type: 'tagged'
		});
  
		await fetchNotes();
	  } catch (error) {
		console.error('Error tagging note:', error);
	  }
	}
  </script>
  
  <div class="flex h-screen">
	<!-- Sidebar -->
	<div class="w-64 bg-gray-100 p-4">
	  <h2 class="text-xl font-bold mb-4">Notes</h2>
	  <NotesList {notes} on:select={handleNoteSelect} />
	  <TagManager {tags} on:createTag={handleTagCreate} on:tagNote={handleTagNote} />
	</div>
  
	<!-- Main content -->
	<div class="flex-1 flex">
	  <!-- Timestamp list -->
	  <div class="w-48 border-r border-gray-200">
		<TimestampList note={currentNote} />
	  </div>
  
	  <!-- Markdown editor -->
	  <div class="flex-1">
		<MarkdownEditor note={currentNote} on:update={handleNoteUpdate} />
	  </div>
	</div>
  </div>