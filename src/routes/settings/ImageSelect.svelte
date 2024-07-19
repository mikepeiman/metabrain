<script lang="ts">
    import { onMount } from 'svelte';

    let avatarInput: HTMLInputElement;
    let avatarFile: File | null = null;
    let avatarPreview: string | null = null;

    onMount(() => {
        console.log("Component mounted");
    });

    function handleImageSelect(event: Event) {
        console.log("handleImageSelect called");
        const input = event.target as HTMLInputElement;
        console.log("Input:", input);
        console.log("Files:", input.files);

        if (input.files && input.files.length > 0) {
            const file = input.files[0];
            console.log("Selected file:", file.name);

            avatarFile = file;
            avatarPreview = URL.createObjectURL(file);
            console.log("Avatar preview:", avatarPreview);
        }
    }

    function triggerFileSelect() {
        console.log("Triggering file select");
        if (avatarInput) {
            avatarInput.click();
        } else {
            console.error("Avatar input element not found");
        }
    }

    async function handleSubmit() {
        console.log("Form submitted");
        if (avatarFile) {
            console.log("Uploading file:", avatarFile.name);
            // Your file upload logic here
        } else {
            console.log("No file selected");
        }
    }
</script>

<input
    bind:this={avatarInput}
    type="file"
    accept="image/*"
    on:change={handleImageSelect}
    class="hidden"
    id="avatarUpload"
/>

<button on:click={triggerFileSelect}>
    Choose Avatar
</button>

{#if avatarPreview}
    <img src={avatarPreview} alt="Avatar preview" />
{/if}

<button on:click={handleSubmit}>
    Submit Form
</button>