<script lang="ts">
    import type { PageData } from './$types';
    export let data: PageData;

    import { pb } from '$utils/pocketbase';
    import { goto } from '$app/navigation';

    import Register from '$components/Register.svelte';

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

<Register user={data.user} />