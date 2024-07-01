<script lang="ts">
	import { goto } from '$app/navigation';
	import { pb } from '$lib/utils/pocketbase';
    import { IconBrandGithub, IconBrandGoogle, IconMail, IconLock } from '@tabler/icons-svelte';
	let email = '';
	let password = '';
	let errorMessage = '';

    async function handleLogin() {
    try {
      await pb.collection('users').authWithPassword(email, password);
      goto('/dashboard');
    } catch (error) {
      errorMessage = 'Invalid email or password';
    }
  }

  async function loginWithProvider(provider: 'github' | 'google') {
    try {
      const authData = await pb.collection('users').authWithOAuth2({ 
        provider,
        redirectUrl: `${window.location.origin}/auth/${provider}/callback`
      });
      
      if (authData.meta?.isNew) {
        console.log("New user signed up!");
      }

      goto('/dashboard');
    } catch (error) {
      console.error("OAuth error:", error);
      errorMessage = `Failed to login with ${provider}`;
    }
  }
</script>
<form on:submit|preventDefault={handleLogin} class="max-w-md mx-auto mt-12 p-8 bg-white rounded-xl shadow-2xl space-y-6">
    <h2 class="text-3xl font-extrabold text-center text-gray-800 mb-8">Login</h2>
    
    <div class="relative">
      <input 
        type="email" 
        bind:value={email} 
        placeholder="Email" 
        required 
        autocomplete="email"
        class="w-full px-4 py-3 text-gray-700 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:bg-white transition-colors duration-300 peer pl-10"
      />
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2 peer-focus:text-blue-500 transition-colors duration-300" viewBox="0 0 20 20" fill="currentColor">
        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
      </svg>
    </div>
    
    <div class="relative">
      <input 
        type="password" 
        bind:value={password} 
        placeholder="Password" 
        required 
        autocomplete="current-password"
        class="w-full px-4 py-3 text-gray-700 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:bg-white transition-colors duration-300 peer pl-10"
      />
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2 peer-focus:text-blue-500 transition-colors duration-300" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd" />
      </svg>
    </div>
    
    <div class="flex items-center justify-between">
      <label class="flex items-center">
        <input type="checkbox" class="form-checkbox h-5 w-5 text-blue-500 rounded focus:ring-blue-500">
        <span class="ml-2 text-sm text-gray-600">Remember me</span>
      </label>
      <a href="#" class="text-sm text-blue-500 hover:underline">Forgot password?</a>
    </div>
    
    <button 
      type="submit" 
      class="w-full px-6 py-3 text-white bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-all duration-300 transform hover:scale-105"
    >
      Sign In
    </button>
    
    {#if errorMessage}
      <p class="mt-4 text-red-500 text-sm bg-red-100 border border-red-400 rounded-lg p-3">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 inline mr-1 text-red-500" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
        </svg>
        {errorMessage}
      </p>
    {/if}
    <div class="mt-6">
        <div class="relative">
          <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t border-gray-300"></div>
          </div>
          <div class="relative flex justify-center text-sm">
            <span class="px-2 bg-white text-gray-500">Or continue with</span>
          </div>
        </div>
    
        <div class="mt-6 grid grid-cols-2 gap-3">
          <button
            on:click={() => loginWithProvider('github')}
            class="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
          >
            <IconBrandGithub class="h-5 w-5" />
            <span class="ml-2">GitHub</span>
          </button>
          <button
            on:click={() => loginWithProvider('google')}
            class="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
          >
            <IconBrandGoogle class="h-5 w-5" />
            <span class="ml-2">Google</span>
          </button>
        </div>
      </div>
    <p class="text-center text-sm text-gray-500">
      Don't have an account? 
      <a href="#" class="text-blue-500 hover:underline">Sign up</a>
    </p>
  </form>