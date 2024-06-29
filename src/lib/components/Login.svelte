<script lang="ts">
	import { goto } from '$app/navigation';
	import { pb } from '$lib/utils/pocketbase';

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

<form on:submit|preventDefault={handleLogin} class="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
    <div class="mb-4">
      <input 
        type="email" 
        bind:value={email} 
        placeholder="Email" 
        autocomplete="email"
        required 
        class="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:border-blue-500"
      />
    </div>
    <div class="mb-6">
      <input 
        type="password" 
        bind:value={password} 
        placeholder="Password" 
        autocomplete="current-password"
        required 
        class="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:border-blue-500"
      />
    </div>
    <button 
      type="submit" 
      class="w-full px-4 py-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors duration-300"
    >
      Login
    </button>
    {#if errorMessage}
      <p class="mt-4 text-red-500 text-sm">{errorMessage}</p>
    {/if}
  </form>
