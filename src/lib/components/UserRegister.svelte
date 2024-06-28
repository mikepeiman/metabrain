<script lang="ts">
    import { goto } from '$app/navigation';
    
    import { getPb } from '$utils/pocketbaseUtils';
    const pb = getPb();

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

            const createdUser = await pb.collection('users').create(data);
            
            // Optionally, you can automatically log in the user after registration
            await pb.collection('users').authWithPassword(email, password);

            // Redirect to home page or dashboard
            goto('/');
        } catch (error) {
            console.error('Registration error:', error);
            errorMessage = error.message;
        }
    }
</script>

<form on:submit|preventDefault={handleRegister}>
    <input type="email" bind:value={email} placeholder="Email" required>
    <input type="password" bind:value={password} placeholder="Password" required>
    <input type="password" bind:value={passwordConfirm} placeholder="Confirm Password" required>
    <button type="submit">Register</button>
    {#if errorMessage}
        <p class="error">{errorMessage}</p>
    {/if}
</form>