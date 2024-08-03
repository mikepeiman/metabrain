<script lang="ts">
	import { goto, invalidate } from '$app/navigation';
  import { page } from '$app/stores';
	import { pb } from '$lib/utils/pocketbase';
	import { IconBrandGithub, IconBrandGoogle, IconMail, IconLock } from '@tabler/icons-svelte';
	
	let email = '';
	let password = '';
	let errorMessage = '';
	let rememberMe = false;

	$: {
		const storedEmail = localStorage.getItem('rememberedEmail');
		if (storedEmail) {
			email = storedEmail;
			rememberMe = true;
		}
	}
$:  console.log(`🚀 ~ handleLogin ~ route: ${page.route} $page:`, $page)
  async function handleLogin() {
    try {
        await pb.collection('users').authWithPassword(email, password);

        // Invalidate the current page to force a reload
        // await invalidate((url) => url.pathname === $page.url.pathname);
        
        // Optionally, you can use goto to reload the current page
        // await goto($page.url.pathname, { invalidateAll: true });
        window.location.reload();
        
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
				console.log('New user signed up!');
			}

			// goto('/');
		} catch (error) {
			console.error('OAuth error:', error);
			errorMessage = `Failed to login with ${provider}`;
		}
	}
</script>


  <form
    on:submit|preventDefault={handleLogin}
    class="mx-auto mt-12 max-w-md space-y-6 rounded-xl bg-slate-1 p-8 shadow-2xl dark:bg-slate-12"
  >
    <h2 class="mb-8 text-center text-3xl font-extrabold text-slate-12 dark:text-slate-1">Login</h2>
  
    <div class="relative">
      <input
        type="email"
        bind:value={email}
        placeholder="Email"
        required
        autocomplete="email"
        class="peer w-full rounded-lg border-2 border-slate-6 bg-slate-1 px-4 py-3 pl-10 text-slate-12 transition-colors duration-300 focus:border-blue-8 focus:bg-slate-1 focus:outline-none dark:border-slate-7 dark:bg-slate-12 dark:text-slate-1 dark:focus:border-blue-6 dark:focus:bg-slate-12"
      />
      <IconMail class="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 transform text-slate-9 transition-colors duration-300 peer-focus:text-blue-9 dark:text-slate-6 dark:peer-focus:text-blue-6" />
    </div>
  
    <div class="relative">
      <input
        type="password"
        bind:value={password}
        placeholder="Password"
        required
        autocomplete="current-password"
        class="peer w-full rounded-lg border-2 border-slate-6 bg-slate-1 px-4 py-3 pl-10 text-slate-12 transition-colors duration-300 focus:border-blue-8 focus:bg-slate-1 focus:outline-none dark:border-slate-7 dark:bg-slate-12 dark:text-slate-1 dark:focus:border-blue-6 dark:focus:bg-slate-12"
      />
      <IconLock class="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 transform text-slate-9 transition-colors duration-300 peer-focus:text-blue-9 dark:text-slate-6 dark:peer-focus:text-blue-6" />
    </div>
  
    <div class="flex items-center justify-between">
      <label class="flex items-center">
        <input
          type="checkbox"
          class="form-checkbox h-5 w-5 rounded text-blue-9 focus:ring-blue-8 dark:text-blue-6 dark:focus:ring-blue-7"
        />
        <span class="ml-2 text-sm text-slate-11 dark:text-slate-4">Remember me</span>
      </label>
      <a href="#" class="text-sm text-blue-9 hover:underline dark:text-blue-6">Forgot password?</a>
    </div>
  
    <button
      type="submit"
      class="w-full transform rounded-lg bg-gradient-to-r from-blue-9 to-indigo-9 px-6 py-3 text-slate-1 transition-all duration-300 hover:scale-105 hover:from-blue-10 hover:to-indigo-10 focus:outline-none focus:ring-2 focus:ring-blue-8 focus:ring-opacity-50 dark:from-blue-8 dark:to-indigo-8 dark:text-slate-12 dark:hover:from-blue-9 dark:hover:to-indigo-9 dark:focus:ring-blue-7"
    >
      Sign In
    </button>
  
    {#if errorMessage}
      <p class="mt-4 rounded-lg border border-red-6 bg-red-2 p-3 text-sm text-red-11 dark:border-red-7 dark:bg-red-11 dark:text-red-2">
        <IconMail class="mr-1 inline h-5 w-5 text-red-9 dark:text-red-3" />
        {errorMessage}
      </p>
    {/if}
  
    <div class="mt-6">
      <div class="relative">
        <div class="absolute inset-0 flex items-center">
          <div class="w-full border-t border-slate-6 dark:border-slate-7"></div>
        </div>
        <div class="relative flex justify-center text-sm">
          <span class="bg-slate-1 px-2 text-slate-11 dark:bg-slate-12 dark:text-slate-4">Or continue with</span>
        </div>
      </div>
  
      <div class="mt-6 grid grid-cols-2 gap-3">
        <button
          on:click={() => loginWithProvider('github')}
          class="inline-flex w-full justify-center rounded-md border border-slate-6 bg-slate-1 px-4 py-2 text-sm font-medium text-slate-11 shadow-sm hover:bg-slate-2 dark:border-slate-7 dark:bg-slate-12 dark:text-slate-3 dark:hover:bg-slate-10"
        >
          <IconBrandGithub class="h-5 w-5" />
          <span class="ml-2">GitHub</span>
        </button>
        <button
          on:click={() => loginWithProvider('google')}
          class="inline-flex w-full justify-center rounded-md border border-slate-6 bg-slate-1 px-4 py-2 text-sm font-medium text-slate-11 shadow-sm hover:bg-slate-2 dark:border-slate-7 dark:bg-slate-12 dark:text-slate-3 dark:hover:bg-slate-10"
        >
          <IconBrandGoogle class="h-5 w-5" />
          <span class="ml-2">Google</span>
        </button>
      </div>
    </div>
    <p class="text-center text-sm text-slate-11 dark:text-slate-4">
      Don't have an account?
      <a href="/register" class="text-blue-9 hover:underline dark:text-blue-6">Sign up</a>
    </p>
  </form>
