<script>
  import { pb, currentUser } from '$utils/pocketbase';
  import { onMount } from 'svelte';

  export let currentNote;

  let content = '';

  $: if (currentNote) {
    content = currentNote.content;
  }

  async function saveNote() {
    if (!$currentUser) return;

    try {
      if (currentNote) {
        await pb.collection('notes').update(currentNote.id, {
          content,
          user_id: $currentUser.id,
        });
      } else {
        const data = {
          content,
          user_id: $currentUser.id,
          date: new Date().toISOString().split('T')[0],
        };
        await pb.collection('notes').create(data);
      }
    } catch (error) {
      console.error('Failed to save note', error);
    }
  }
</script>

<textarea bind:value={content} on:input={saveNote}></textarea>