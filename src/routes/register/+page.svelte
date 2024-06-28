<script lang="ts">
    import type { PageData } from './$types';
    
    export let data: PageData;

    import { getPb } from '$utils/pocketbaseUtils';
    const pb = getPb();
    import { goto } from '$app/navigation';

    let email = '';
    let password = '';
    let passwordConfirm = '';
    let errorMessage = '';

    async function handleRegister() {
        if (password !== passwordConfirm) {
            errorMessage = "Passwords don't match";
            return;
        }

        try {
            const data = {
                email: email,
                password: password,
                passwordConfirm: passwordConfirm,
            };

            await pb.collection('users').create(data);
            await pb.collection('users').authWithPassword(email, password);
            goto('/');
        } catch (error) {
            console.error('Registration error:', error);
            errorMessage = error.message;
        }
    }
</script>

<h1>Register</h1>

<form on:submit|preventDefault={handleRegister}>
    <input type="email" bind:value={email} placeholder="Email" required>
    <input type="password" bind:value={password} placeholder="Password" required>
    <input type="password" bind:value={passwordConfirm} placeholder="Confirm Password" required>
    <button type="submit">Register</button>
    {#if errorMessage}
        <p class="error">{errorMessage}</p>
    {/if}
</form>