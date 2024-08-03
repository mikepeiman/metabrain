<script>
	import NoteList from './NoteList.svelte';
	import NoteEditor from './NoteEditor.svelte';
	import { notes, currentNote, isLoading, error } from './utils/editorjs-utils.js';
  </script>
  
  <div class="flex w-screen flex-col overflow-hidden">
	<NoteList {notes} {currentNote} {isLoading} {error} />
	<NoteEditor {currentNote} />
  </div>