<script>
	import { onMount } from 'svelte';
	import { pb } from '$utils/pocketbase';
	import { currentUser } from '@/utils/pocketbase';
	import { goto } from '$app/navigation';
  
	let isDrawerOpen = false;
	let searchQuery = '';
  
	const navLinks = [
	  { name: 'Dashboard', href: '/dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
	  { name: 'Calendar', href: '/calendar', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
	  { name: 'Today', href: '/today', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
	];
  
	function logout() {
	  pb.authStore.clear();
	  goto('/login');
	}
  
	function toggleDrawer() {
	  isDrawerOpen = !isDrawerOpen;
	}
  
	onMount(() => {
	  const handleResize = () => {
		if (window.innerWidth >= 1024) {
		  isDrawerOpen = false;
		}
	  };
	  window.addEventListener('resize', handleResize);
	  return () => window.removeEventListener('resize', handleResize);
	});
  </script>
  
  <header class="bg-white shadow-md relative">
	<div class="container mx-auto px-4 sm:px-6 lg:px-8">
	  <div class="flex justify-between items-center h-16">
		<div class="flex items-center flex-grow">
		  <a
			rel="noopener noreferrer"
			href="/"
			aria-label="Back to homepage"
			class="flex-shrink-0 mr-4"
		  >
			<svg
			  xmlns="http://www.w3.org/2000/svg"
			  fill="currentColor"
			  viewBox="0 0 32 32"
			  class="h-8 w-8 text-blue-500"
			>
			  <!-- SVG path data -->
			</svg>
		  </a>
		  <div class="w-full max-w-xl">
			<input
			  type="text"
			  bind:value={searchQuery}
			  placeholder="Search..."
			  class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
			/>
		  </div>
		</div>
		<nav class="hidden lg:flex space-x-8">
		  {#each navLinks as link}
			<a
			  href={link.href}
			  class="text-base font-medium text-gray-500 hover:text-gray-900 transition-colors duration-300"
			>
			  {link.name}
			</a>
		  {/each}
		</nav>
		<div class="hidden lg:flex items-center space-x-4">
		  {#if $currentUser}
			<button
			  class="text-base font-medium text-gray-500 hover:text-gray-900 transition-colors duration-300 flex items-center"
			>
			  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
			  </svg>
			  Account Settings
			</button>
			<button
			  on:click={logout}
			  class="text-base font-medium text-gray-500 hover:text-gray-900 transition-colors duration-300"
			>
			  Logout
			</button>
		  {:else}
			<a
			  href="/login"
			  class="text-base font-medium text-gray-500 hover:text-gray-900 transition-colors duration-300"
			>
			  Login
			</a>
			<a
			  href="/register"
			  class="px-4 py-2 text-base font-medium text-white bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-all duration-300 transform hover:scale-105"
			>
			  Register
			</a>
		  {/if}
		</div>
		<button class="p-2 lg:hidden" on:click={toggleDrawer}>
		  <svg
			xmlns="http://www.w3.org/2000/svg"
			fill="none"
			viewBox="0 0 24 24"
			stroke="currentColor"
			class="h-6 w-6 text-gray-800"
		  >
			<path
			  stroke-linecap="round"
			  stroke-linejoin="round"
			  stroke-width="2"
			  d="M4 6h16M4 12h16M4 18h16"
			></path>
		  </svg>
		</button>
	  </div>
	</div>
	
	{#if isDrawerOpen}
	  <div class="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
		<div class="fixed inset-0 bg-gray-600 bg-opacity-75" aria-hidden="true" on:click={toggleDrawer}></div>
		<nav class="fixed top-0 right-0 bottom-0 flex flex-col w-64 max-w-sm py-4 bg-white shadow-xl">
		  <div class="px-4 flex items-center justify-between">
			<h2 class="text-lg font-medium text-gray-900">Menu</h2>
			<button type="button" class="-mr-2 w-10 h-10 bg-white rounded-md p-2 inline-flex items-center justify-center text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500" on:click={toggleDrawer}>
			  <span class="sr-only">Close menu</span>
			  <svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
			  </svg>
			</button>
		  </div>
		  <div class="mt-5 flex-1 flex flex-col justify-between">
			<div class="px-2 space-y-1">
			  {#each navLinks as link}
				<a href={link.href} class="block px-3 py-2 rounded-md text-base font-medium text-gray-900 hover:bg-gray-50 hover:text-gray-900">
				  <svg class="mr-4 h-6 w-6 text-gray-400 inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={link.icon} />
				  </svg>
				  {link.name}
				</a>
			  {/each}
			</div>
			<div class="px-2 space-y-1">
			  {#if $currentUser}
				<button class="block px-3 py-2 rounded-md text-base font-medium text-gray-900 hover:bg-gray-50 hover:text-gray-900">
				  <svg class="mr-4 h-6 w-6 text-gray-400 inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
				  </svg>
				  Account Settings
				</button>
				<button on:click={logout} class="block px-3 py-2 rounded-md text-base font-medium text-gray-900 hover:bg-gray-50 hover:text-gray-900">
				  Logout
				</button>
			  {:else}
				<a href="/login" class="block px-3 py-2 rounded-md text-base font-medium text-gray-900 hover:bg-gray-50 hover:text-gray-900">
				  Login
				</a>
				<a href="/register" class="block px-3 py-2 rounded-md text-base font-medium text-white bg-blue-600 hover:bg-blue-700">
				  Register
				</a>
			  {/if}
			</div>
		  </div>
		</nav>
	  </div>
	{/if}
  </header>