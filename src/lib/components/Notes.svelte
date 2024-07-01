<script lang="ts">
	import { onMount } from 'svelte';
	import { pb, currentUser } from '$utils/pocketbase';
	import MarkdownEditor from './MarkdownEditor.svelte';
	import TimestampList from './TimestampList.svelte';
	import fuzzysort from 'fuzzysort';

	let notes: any[] = [];
	let currentNote: any = null;
	let preparedTags: any[] = [];

	onMount(async () => {
		if ($currentUser) {
			await fetchOrCreateDailyNote();
			await fetchTags();
		} else {
			console.log('No user is currently logged in');
		}
	});

	async function fetchOrCreateDailyNote() {
  const today = new Date().toISOString().split('T')[0];
  try {
    const resultList = await pb.collection('objects').getList(1, 1, {
      filter: `type = "note" && created = "${$currentUser.id}"`,
      sort: '-created',
      expand: 'properties(object_id),relationships(from_object_id)'
    });

    if (resultList.items.length > 0) {
      currentNote = resultList.items[0];
      // Check if the note is from today
      const noteDate = new Date(currentNote.created).toISOString().split('T')[0];
      if (noteDate !== today) {
        // If not, create a new note for today
        currentNote = await pb.collection('objects').create({
          type: 'note',
          created: $currentUser.id
        });
      }
    } else {
      currentNote = await pb.collection('objects').create({
        type: 'note',
        created: $currentUser.id
      });
    }

    notes = [currentNote];
    console.log('Current note:', currentNote);
  } catch (error) {
    console.error('Error fetching or creating daily note:', error);
  }
}

	async function handleNoteUpdate({ content, newTags }) {
		try {
			if (!currentNote) {
				console.error('No current note selected');
				return;
			}

			// Update or create content property
			let contentProperty = currentNote.expand?.['properties(object_id)']?.find(
				(prop) => prop.key === 'content'
			);

			if (contentProperty) {
				await pb.collection('properties').update(contentProperty.id, {
					value: JSON.stringify(content)
				});
			} else {
				await pb.collection('properties').create({
					object_id: currentNote.id,
					key: 'content',
					value: JSON.stringify(content)
				});
			}

			// Handle new tags
			if (Array.isArray(newTags)) {
				for (const tagName of newTags) {
					let tagObject = await pb
						.collection('objects')
						.getFirstListItem(`type="tag" && name="${tagName}"`)
						.catch(() => null);

					if (!tagObject) {
						tagObject = await pb.collection('objects').create({
							type: 'tag',
							name: tagName
						});
					}

					// Check if relationship already exists
					const existingRelationship = await pb
						.collection('relationships')
						.getFirstListItem(
							`from_object_id="${currentNote.id}" && to_object_id="${tagObject.id}" && type="tagged"`
						)
						.catch(() => null);

					if (!existingRelationship) {
						await pb.collection('relationships').create({
							from_object_id: currentNote.id,
							to_object_id: tagObject.id,
							type: 'tagged'
						});
					}
				}
			}

			await fetchOrCreateDailyNote();
		} catch (error) {
			console.error('Error updating note:', error);
		}
	}
	$: console.log('Current user:', $currentUser);
	$: console.log('Current notes:', notes);
	$: console.log('CurrentNote:', currentNote);


	async function fetchTags() {
		try {
			console.log('Fetching tags');
			const resultList = await pb.collection('objects').getList(1, 50, {
				filter: 'type = "tag"',
				expand: 'properties(object_id)'
			});
			const tags = resultList.items;
			console.log('Fetched tags:', tags);
			preparedTags = tags.map((tag) => ({
				original: tag,
				prepared: fuzzysort.prepare(tag.name || '')
			}));
			console.log('Prepared tags:', preparedTags);
		} catch (error) {
			console.error('Error fetching tags:', error);
		}
	}

	function handleNoteSelect(event) {
		console.log('Note selected:', event.detail);
		currentNote = event.detail;
	}
</script>

<div class="flex h-screen w-screen text-black">
	<!-- Main content -->
	<div class="flex w-full">
		<!-- Timestamp list -->
		<div class="w-48 border-r border-gray-200">
			<TimestampList note={currentNote} />
		</div>

		<!-- Markdown editor -->
		<div class="flex w-full">
			<MarkdownEditor
				note={currentNote}
				{preparedTags}
				{notes}
				on:update={handleNoteUpdate}
				on:select={handleNoteSelect}
			/>
		</div>
	</div>
</div>
