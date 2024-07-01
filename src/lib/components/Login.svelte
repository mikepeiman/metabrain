<script lang="ts">
	import { goto } from '$app/navigation';
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
				console.log('New user signed up!');
			}

			goto('/dashboard');
		} catch (error) {
			console.error('OAuth error:', error);
			errorMessage = `Failed to login with ${provider}`;
		}
	}
</script>

<form
	on:submit|preventDefault={handleLogin}
	class="mx-auto mt-12 max-w-md space-y-6 rounded-xl bg-white p-8 shadow-2xl"
>
	<h2 class="mb-8 text-center text-3xl font-extrabold text-gray-800">Login</h2>

	<div class="relative">
		<input
			type="email"
			bind:value={email}
			placeholder="Email"
			required
			autocomplete="email"
			class="peer w-full rounded-lg border-2 border-gray-200 bg-gray-50 px-4 py-3 pl-10 text-gray-700 transition-colors duration-300 focus:border-blue-500 focus:bg-white focus:outline-none"
		/>
		<svg
			xmlns="http://www.w3.org/2000/svg"
			class="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 transform text-gray-400 transition-colors duration-300 peer-focus:text-blue-500"
			viewBox="0 0 20 20"
			fill="currentColor"
		>
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
			class="peer w-full rounded-lg border-2 border-gray-200 bg-gray-50 px-4 py-3 pl-10 text-gray-700 transition-colors duration-300 focus:border-blue-500 focus:bg-white focus:outline-none"
		/>
		<svg
			xmlns="http://www.w3.org/2000/svg"
			class="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 transform text-gray-400 transition-colors duration-300 peer-focus:text-blue-500"
			viewBox="0 0 20 20"
			fill="currentColor"
		>
			<path
				fill-rule="evenodd"
				d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
				clip-rule="evenodd"
			/>
		</svg>
	</div>

	<div class="flex items-center justify-between">
		<label class="flex items-center">
			<input
				type="checkbox"
				class="form-checkbox h-5 w-5 rounded text-blue-500 focus:ring-blue-500"
			/>
			<span class="ml-2 text-sm text-gray-600">Remember me</span>
		</label>
		<a href="#" class="text-sm text-blue-500 hover:underline">Forgot password?</a>
	</div>

	<button
		type="submit"
		class="w-full transform rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-3 text-white transition-all duration-300 hover:scale-105 hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
	>
		Sign In
	</button>

	{#if errorMessage}
		<p class="mt-4 rounded-lg border border-red-400 bg-red-100 p-3 text-sm text-red-500">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				class="mr-1 inline h-5 w-5 text-red-500"
				viewBox="0 0 20 20"
				fill="currentColor"
			>
				<path
					fill-rule="evenodd"
					d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
					clip-rule="evenodd"
				/>
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
				<span class="bg-white px-2 text-gray-500">Or continue with</span>
			</div>
		</div>

		<div class="mt-6 grid grid-cols-2 gap-3">
			<button
				on:click={() => loginWithProvider('github')}
				class="inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-500 shadow-sm hover:bg-gray-50"
			>
				<IconBrandGithub class="h-5 w-5" />
				<span class="ml-2">GitHub</span>
			</button>
			<button
				on:click={() => loginWithProvider('google')}
				class="inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-500 shadow-sm hover:bg-gray-50"
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
