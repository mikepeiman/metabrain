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
    let isUpdatingContent = false;

    onMount(async () => {
        if ($currentUser) {
            await loadNotes();
        } else {
            // Handle unauthenticated user
        }

        editor = await Editor.make()
            .config((ctx) => {
                ctx.set(rootCtx, document.querySelector('#editor'));
                ctx.set(defaultValueCtx, '');
                ctx.get(listenerCtx)
                    .mounted(() => {
                        console.log('Editor is ready');
                    })
                    .markdownUpdated((ctx, markdown, prevMarkdown) => {
                        if (!isUpdatingContent) {
                            content = markdown;
                            debouncedSaveNote();
                        }
                    });
            })
            .use(nord)
            .use(commonmark)
            .use(listener)
            .create();

        if (notes.length > 0) {
            await selectNote(notes[0]);
        }
    });

    async function loadNotes() {
        try {
            const resultList = await pb.collection('notes').getList(1, 50, {
                filter: `user_id = "${$currentUser.id}"`,
                sort: '-updated'
            });
            notes = resultList.items;
        } catch (error) {
            console.error('Failed to load notes', error);
        }
    }

    async function selectNote(note) {
        if (currentNote && currentNote.id !== note.id) {
            await saveNote(); // Save the current note before switching
        }
        currentNote = note;
        title = note.title;
        isUpdatingContent = true;
        if (editor) {
            editor.action((ctx) => {
                ctx.set(defaultValueCtx, note.content);
            });
        }
        content = note.content;
        isUpdatingContent = false;
    }

    async function createNewNote() {
        try {
            const newNote = await pb.collection('notes').create({
                title: 'New Note',
                content: '',
                user_id: $currentUser.id
            });
            notes = [newNote, ...notes];
            await selectNote(newNote);
        } catch (error) {
            console.error('Failed to create new note', error);
        }
    }

    const debouncedSaveNote = debounce(saveNote, 1000);

    async function saveNote() {
        if (!currentNote || isUpdatingContent) return;
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
        if (!isUpdatingContent) {
            debouncedSaveNote();
        }
    }

    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
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
            class="w-full mb-4 p-2 text-xl font-bold border-b-2 border-gray-300 focus:border-blue-500 outline-none text-black"
        />
        <div id="editor" class="prose max-w-none text-black"></div>
    </div>
</main>