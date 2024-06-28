<script lang="ts">
    import type { PageData } from './$types';
    
    export let data: PageData;
    import Login from '$lib/components/Login.svelte';
</script>

<Login user={data.user} />