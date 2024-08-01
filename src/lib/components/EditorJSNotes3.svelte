<script>
	import { onMount } from 'svelte';
	import EditorJS from '@editorjs/editorjs';
	import Header from '@editorjs/header';
	import List from '@editorjs/list';
	import Checklist from '@editorjs/checklist';
	import Paragraph from '@editorjs/paragraph';
	import Image from '@editorjs/image';
	import { pb } from '$utils/pocketbase'; // Adjust this import based on your PocketBase setup
  
	export let noteId = null;
	let editor;
  
	onMount(async () => {
	  const tools = {
		header: Header,
		list: List,
		checklist: Checklist,
		paragraph: Paragraph,
		image: {
		  class: Image,
		  config: {
			uploader: {
			  uploadByFile(file) {
				return uploadImage(file).then((url) => {
				  return {
					success: 1,
					file: {
					  url,
					},
				  };
				});
			  },
			},
		  },
		},
	  };
  
	  const data = noteId ? await loadNote(noteId) : {};
  
	  editor = new EditorJS({
		holder: 'editorjs',
		tools,
		data,
		onChange: debounce(saveNote, 1000),
	  });
	});
  
	async function loadNote(id) {
	  try {
		const record = await pb.collection('notes').getOne(id);
		return JSON.parse(record.content);
	  } catch (error) {
		console.error('Error loading note:', error);
		return {};
	  }
	}
  
	async function saveNote() {
	  if (!editor) return;
  
	  const content = await editor.save();
	  
	  try {
		if (noteId) {
		  await pb.collection('notes').update(noteId, {
			content: JSON.stringify(content),
		  });
		} else {
		  const record = await pb.collection('notes').create({
			content: JSON.stringify(content),
		  });
		  noteId = record.id;
		}
		console.log('Note saved successfully');
	  } catch (error) {
		console.error('Error saving note:', error);
	  }
	}
  
	async function uploadImage(file) {
	  try {
		const formData = new FormData();
		formData.append('file', file);
		
		const record = await pb.collection('images').create(formData);
		return pb.getFileUrl(record, record.file);
	  } catch (error) {
		console.error('Error uploading image:', error);
		throw error;
	  }
	}
  
	function debounce(func, wait) {
	  let timeout;
	  return function (...args) {
		const context = this;
		clearTimeout(timeout);
		timeout = setTimeout(() => func.apply(context, args), wait);
	  };
	}
  </script>
  
  <div id="editorjs" />
  
  <style>
	:global(.codex-editor) {
	  border: 1px solid #ccc;
	  border-radius: 4px;
	  padding: 10px;
	}
  </style>