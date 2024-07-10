<script lang="ts">
    import { onMount } from 'svelte';
    import { Editor, rootCtx, defaultValueCtx, editorViewCtx } from '@milkdown/core';
    import { commonmark } from '@milkdown/preset-commonmark';
    import { nord } from '@milkdown/theme-nord';
    import { listener, listenerCtx } from '@milkdown/plugin-listener';
    import { pb, currentUser } from '$utils/pocketbase';

    let editor: Editor;
    let notes = [];
    let currentNote = null;
    let content = '';
    let title = '';
    let isEditorReady = false;

    onMount(async () => {
        if ($currentUser) {
            await loadNotes();
        } else {
            // Handle unauthenticated user
        }

        await initEditor();
    });

    async function initEditor() {
        if (editor) {
            await editor.destroy();
        }
        editor = await Editor.make()
            .config((ctx) => {
                ctx.set(rootCtx, document.querySelector('#editor'));
                ctx.set(defaultValueCtx, content);
                ctx.get(listenerCtx)
                    .mounted(() => {
                        console.log('Editor is ready');
                        isEditorReady = true;
                    })
                    .markdownUpdated((ctx, markdown, prevMarkdown) => {
                        if (isEditorReady) {
                            content = markdown;
                            saveNote();
                        }
                    });
            })
            .use(nord)
            .use(commonmark)
            .use(listener)
            .create();
    }

    async function selectNote(note) {
        if (currentNote && currentNote.id !== note.id) {
            await saveNote(); // Save the current note before switching
        }
        currentNote = note;
        title = note.title;
        content = note.content;
        isEditorReady = false; // Prevent saving during content update
        if (editor) {
            editor.action((ctx) => {
                const view = ctx.get(editorViewCtx);
                const { state } = view;
                const tr = state.tr.replace(0, state.doc.content.size, state.schema.text(note.content));
                view.dispatch(tr);
            });
        }
        isEditorReady = true; // Re-enable saving after content update
    }

    async function saveNote() {
        if (!currentNote || !isEditorReady) return;
        try {
            await pb.collection('notes').update(currentNote.id, {
                title,
                content
            });
            console.log('Note saved');
        } catch (error) {
            console.error('Failed to save note', error);
        }
    }

    function handleTitleChange() {
        if (isEditorReady) {
            saveNote();
        }
    }

    async function loadNotes() {
        try {
            const resultList = await pb.collection('notes').getList(1, 50, {
                filter: `user_id = "${$currentUser.id}"`,
                sort: '-updated'
            });
            notes = resultList.items;
            if (notes.length > 0) {
                selectNote(notes[0]);
            }
        } catch (error) {
            console.error('Failed to load notes', error);
        }
    }

 

    async function createNewNote() {
        try {
            const newNote = await pb.collection('notes').create({
                title: 'New Note',
                content: '',
                user_id: $currentUser.id
            });
            notes = [newNote, ...notes];
            selectNote(newNote);
        } catch (error) {
            console.error('Failed to create new note', error);
        }
    }

</script>

<main class="flex h-screen bg-gray-100">
    <div class="w-64 bg-white shadow-md">
        <div class="p-4">
            <button 
                on:click={createNewNote}
                class="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition duration-200"
            >
                New Note
            </button>
        </div>
        <ul class="space-y-1">
            {#each notes as note (note.id)}
                <li 
                    class="cursor-pointer p-3 hover:bg-gray-100 {currentNote?.id === note.id ? 'bg-gray-200' : ''}"
                    on:click={() => selectNote(note)}
                >
                    <span class="text-gray-800">{note.title}</span>
                </li>
            {/each}
        </ul>
    </div>
    <div class="flex-1 p-6">
        <input 
            type="text" 
            bind:value={title} 
            on:input={handleTitleChange} 
            placeholder="Note Title"
            class="text-black w-full mb-4 p-2 text-xl font-bold border-b-2 border-gray-300 focus:border-blue-500 outline-none"
        />
        <div id="editor" class="text-black prose max-w-none"></div>
    </div>
</main>