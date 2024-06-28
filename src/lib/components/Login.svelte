<script lang="ts">
    import { goto } from '$app/navigation';
    import { getPb } from '$lib/utils/pocketbaseUtils';
    const pb = getPb();

    let email = '';
    let password = '';
    let errorMessage = '';

    async function handleLogin() {
        try {
            const authData = await pb.collection('users').authWithPassword(email, password);
            
            // Redirect to home page or dashboard
            goto('/');
        } catch (error) {
            console.error('Login error:', error);
            errorMessage = 'Invalid email or password';
        }
    }
</script>

<form on:submit|preventDefault={handleLogin}>
    <input type="email" bind:value={email} placeholder="Email" required>
    <input type="password" bind:value={password} placeholder="Password" required>
    <button type="submit">Login</button>
    {#if errorMessage}
        <p class="error">{errorMessage}</p>
    {/if}
</form>