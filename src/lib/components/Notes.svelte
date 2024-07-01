<script lang="ts">
	import { onMount } from 'svelte';
	import { pb, currentUser } from '$utils/pocketbase';
	import MarkdownEditor from './MarkdownEditor.svelte';
	import TimestampList from './TimestampList.svelte';
	import NotesList from './NotesList.svelte';
	import TagManager from './TagManager.svelte';
	import { IconAi } from '@tabler/icons-svelte';
	import { fuzzySearch } from '$lib/utils/fuzzySearch'; // Implement this utility function
	import fuzzysort from 'fuzzysort';
	$: console.log('Current user:', $currentUser);
	$: console.log('Current notes:', notes);
	let notes: any[] = [];
	let currentNote: any = null;
	let tags: any[] = [];

	let preparedTags: any[] = [];

	onMount(async () => {
		if ($currentUser) {
			await fetchNotes();
			await fetchTags();
			preparedTags = tags.map((tag) => ({
				original: tag,
				prepared: fuzzysort.prepare(
					tag.expand['properties(object_id)'].find((p) => p.key === 'name')?.value
				)
			}));
		} else {
			console.log('No user is currently logged in');
		}
	});

	async function handleNoteUpdate(updatedContent: string, newTags: string[] = []) {
		try {
			if (!currentNote) return;

			// Update content
			const contentProperty = currentNote.expand?.['properties(object_id)']?.find(
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

			// Create new tags and tag the note
			for (const tagName of newTags) {
				let tag = tags.find((t) =>
					t.expand['properties(object_id)'].find(
						(p) => p.key === 'name' && JSON.parse(p.value) === tagName
					)
				);

				if (!tag) {
					tag = await createTag(tagName);
				}

				await tagNote(tag.id);
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

	async function createTag(tagName: string) {
		const newTag = await pb.collection('objects').create({
			type: 'tag'
		});

		await pb.collection('properties').create({
			object_id: newTag.id,
			key: 'name',
			value: JSON.stringify(tagName)
		});

		await fetchTags();
		return newTag;
	}

	async function tagNote(tagId: string) {
		if (!currentNote) return;

		const existingRelation = currentNote.expand?.['relationships(from_object_id)']?.find(
			(rel) => rel.to_object_id === tagId && rel.type === 'tagged'
		);

		if (!existingRelation) {
			await pb.collection('relationships').create({
				from_object_id: currentNote.id,
				to_object_id: tagId,
				type: 'tagged'
			});
		}
	}
	async function fetchNotes() {
		try {
			if ($currentUser) {
				const resultList = await pb.collection('objects').getList(1, 50, {
					filter: `type = "note"`
				});
				// const resultList = await pb.collection('objects').getList(1, 50, {
				// 	filter: `type = "note" && created = "${$currentUser.id}"`,
				// 	sort: '-created',
				// 	expand: 'properties(object_id),relationships(from_object_id)'
				// });
				notes = resultList.items;
				if (notes.length > 0) {
					currentNote = notes[0];
				}
			} else {
				console.log('No user is currently logged in');
			}
		} catch (error) {
			console.error('Error fetching notes:', error);
			if (error.status === 400) {
				console.log('Bad request. Please check the filter syntax.');
			}
		}
	}

	async function fetchTags() {
		try {
			const resultList = await pb.collection('objects').getList(1, 50, {
				filter: 'type = "tag"',
				expand: 'properties(object_id)'
			});
			tags = resultList.items;
			preparedTags = tags.map((tag) => ({
				original: tag,
				prepared: fuzzysort.prepare(
					tag.expand['properties(object_id)'].find((p) => p.key === 'name')?.value || ''
				)
			}));
		} catch (error) {
			console.error('Error fetching tags:', error);
			if (error.status === 400) {
				console.log('Bad request. Please check the filter syntax.');
			}
		}
	}

	async function handleNoteSelect(note: any) {
		currentNote = note;
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
		<h2 class="mb-4 text-xl font-bold">Notes</h2>
		<NotesList {notes} on:select={handleNoteSelect} />
		<TagManager {tags} on:createTag={handleTagCreate} on:tagNote={handleTagNote} />
	</div>

	<!-- Main content -->
	<div class="flex flex-1">
		<!-- Timestamp list -->
		<div class="w-48 border-r border-gray-200">
			<TimestampList note={currentNote} />
		</div>

		<!-- Markdown editor -->
		<div class="flex-1">
			<MarkdownEditor note={currentNote} {preparedTags} on:update={handleNoteUpdate} />
		</div>
	</div>
</div>
