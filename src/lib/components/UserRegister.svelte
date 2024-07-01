<script lang="ts">
    import { pb } from '$utils/pocketbase';
    import { goto } from '$app/navigation';
    import { IconBrandGithub, IconBrandGoogle, IconMail, IconLock, IconShieldCheck, IconAlertCircle } from '@tabler/icons-svelte';
  
    let email = '';
    let password = '';
    let passwordConfirm = '';
    let errorMessage = '';
  
    async function handleRegister() {
      // ... (existing registration logic)
    }
  
    async function registerWithProvider(provider: 'github' | 'google') {
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
        errorMessage = `Failed to register with ${provider}`;
      }
    }
  </script>
  
  <div class="max-w-md mx-auto mt-12 p-8 bg-white rounded-xl shadow-2xl space-y-6">
    <h2 class="text-3xl font-extrabold text-center text-gray-800 mb-8">Create Account</h2>
    
    <form on:submit|preventDefault={handleRegister} class="space-y-6">
      <div class="relative">
        <input 
          type="email" 
          bind:value={email} 
          placeholder="Email" 
          required 
          autocomplete="email"
          class="w-full px-4 py-3 text-gray-700 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:bg-white transition-colors duration-300 peer pl-10"
        />
        <IconMail class="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2 peer-focus:text-blue-500 transition-colors duration-300" />
      </div>
      
      <div class="relative">
        <input 
          type="password" 
          bind:value={password} 
          placeholder="Password" 
          required 
          autocomplete="new-password"
          class="w-full px-4 py-3 text-gray-700 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:bg-white transition-colors duration-300 peer pl-10"
        />
        <IconLock class="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2 peer-focus:text-blue-500 transition-colors duration-300" />
      </div>
      
      <div class="relative">
        <input 
          type="password" 
          bind:value={passwordConfirm} 
          placeholder="Confirm Password" 
          required 
          autocomplete="new-password"
          class="w-full px-4 py-3 text-gray-700 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:bg-white transition-colors duration-300 peer pl-10"
        />
        <IconShieldCheck class="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2 peer-focus:text-blue-500 transition-colors duration-300" />
      </div>
      
      <button 
        type="submit" 
        class="w-full px-6 py-3 text-white bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-all duration-300 transform hover:scale-105"
      >
        Create Account
      </button>
    </form>
    
    {#if errorMessage}
      <p class="mt-4 text-red-500 text-sm bg-red-100 border border-red-400 rounded-lg p-3 flex items-center">
        <IconAlertCircle class="h-5 w-5 inline mr-1 text-red-500" />
        {errorMessage}
      </p>
    {/if}
  
    <div class="relative">
      <div class="absolute inset-0 flex items-center">
        <div class="w-full border-t border-gray-300"></div>
      </div>
      <div class="relative flex justify-center text-sm">
        <span class="px-2 bg-white text-gray-500">Or register with</span>
      </div>
    </div>
  
    <div class="mt-6 grid grid-cols-2 gap-3">
      <button
        on:click={() => registerWithProvider('github')}
        class="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors duration-300"
      >
        <IconBrandGithub class="h-5 w-5 text-gray-700" />
        <span class="ml-2">GitHub</span>
      </button>
      <button
        on:click={() => registerWithProvider('google')}
        class="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors duration-300"
      >
        <IconBrandGoogle class="h-5 w-5 text-gray-700" />
        <span class="ml-2">Google</span>
      </button>
    </div>
  
    <p class="mt-8 text-center text-sm text-gray-600">
      Already have an account?
      <a href="/login" class="font-medium text-indigo-600 hover:text-indigo-500 transition-colors duration-300">
        Sign in
      </a>
    </p>
  </div>