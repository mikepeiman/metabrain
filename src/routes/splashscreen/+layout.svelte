<script lang="ts">
    import type { LayoutData } from './$types';
    
    export let data: LayoutData;
</script>
<div class="bg-white text-black absolute flex align-center justify-center min-h-screen w-screen dark:text-white dark:bg-black">

    <slot><!-- optional fallback --></slot>
</div>