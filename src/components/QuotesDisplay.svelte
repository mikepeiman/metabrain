<!-- <script context="module">
    let url = `/todos.dgraph.json`
    console.log(`🚀 ~ file: Todos.svelte ~ line 3 ~ url`, url)
    
	export const load = async ({ fetch }) => {
		const res = await fetch(`/todos.dgraph.json`);
        console.log(`🚀 ~ file: Todos.svelte ~ line 4 ~ load ~ res`, res)
		if (res.ok) {
			const { todos } = await res.json();
            console.log(`🚀 ~ file: Todos.svelte ~ line 6 ~ load ~ todos`, todos)
			return { props: { todos } };
		} else {
            throw new Error(`Failed to load todos: ${res.status}`);
        }
	};
</script> -->

<script>

	export let todos, source, stodos, dtodos
    console.log(`🚀 ~ file: Todos.svelte ~ line 24 ~ stodos, dtodos`, stodos, dtodos)
    console.log(`🚀 ~ file: Todos.svelte ~ line 13 ~ source`, source)
    console.log(`🚀 ~ file: Todos.svelte ~ line 13 ~ todos`, todos)
</script>

<svelte:head>
	<title>Mike's Blog</title>
</svelte:head>
{#if todos}
{#each todos as {author, tags, quoteBody}}
<main class="container max-w-xl mx-auto px-4">
    <div class="card text-center shadow-2xl mb-20">
        <figure class="px-10 pt-10">
            <!-- <img class="rounded-xl" src="{coverImage.url}" alt="{`Cover image for ${title}`}"> -->
        </figure>
        <div class="card-body">
            <h1 class="title">{quoteBody}</h1>
            <p>{author.name}</p>
            <div class="flex justify-center mt-5 space-x-2">
                {#each tags as tag}
                    <div class="badge badge-primary">{tag.tag}</div>
                {/each}
            </div>
            <div class="justify-center card-actions">
                <!-- <a href={`/posts/${slug}`} class="btn btn-primary btn-outline">Read &rArr</a> -->
            </div>
        </div>
    </div>
</main>
{/each}
{/if}