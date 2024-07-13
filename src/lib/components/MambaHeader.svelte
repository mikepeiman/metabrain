<script lang="ts">
	import { onMount } from 'svelte';
	import { pb, currentUser} from '$utils/pocketbase';
	import { goto } from '$app/navigation';
	import { IconSearch, IconDashboard, IconCalendar, IconClock, IconSettings, IconLogout, IconLogin, IconUserPlus, IconMenu2 } from '@tabler/icons-svelte';
  
	let isDrawerOpen = false;
	let searchQuery = '';
  
	const navLinks = [
	  { name: 'Dashboard', href: '/dashboard', icon: IconDashboard },
	  { name: 'Calendar', href: '/calendar', icon: IconCalendar },
	  { name: 'Today', href: '/today', icon: IconClock },
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
	  <div class="header-grid">
		<a href="/" class="logo-area" aria-label="Back to homepage">
		  <img src="/images/metabrain-logo.svg" alt="MetaBrain Logo" class="h-8 w-auto">
		</a>
		<div class="search-area">
		  <div class="relative">
			<IconSearch class="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-9" size={20} />
			<input
			  type="text"
			  bind:value={searchQuery}
			  placeholder="Search..."
			  class="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-7 focus:outline-none focus:ring-2 focus:ring-blue-8 focus:border-transparent bg-white dark:bg-slate-2"
			/>
		  </div>
		</div>
		<nav class="nav-area hidden lg:flex space-x-8">
		  {#each navLinks as link}
			<a
			  href={link.href}
			  class="text-base font-medium text-slate-11 hover:text-slate-12 transition-colors duration-300 flex items-center"
			>
			  <svelte:component this={link.icon} class="mr-2" size={20} />
			  {link.name}
			</a>
		  {/each}
		</nav>
		<div class="account-area hidden lg:flex items-center space-x-4">
		  {#if $currentUser}
			<button
			  class="text-base font-medium text-slate-11 hover:text-slate-12 transition-colors duration-300 flex items-center"
			>
			  <IconSettings class="mr-2" size={20} />
			  Account Settings
			</button>
			<button
			  on:click={logout}
			  class="text-base font-medium text-slate-11 hover:text-slate-12 transition-colors duration-300 flex items-center"
			>
			  <IconLogout class="mr-2" size={20} />
			  Logout
			</button>
		  {:else}
			<a
			  href="/login"
			  class="text-base font-medium text-slate-11 hover:text-slate-12 transition-colors duration-300 flex items-center"
			>
			  <IconLogin class="mr-2" size={20} />
			  Login
			</a>
			<a
			  href="/register"
			  class="px-4 py-2 text-base font-medium text-white bg-gradient-to-r from-blue-9 to-indigo-9 rounded-lg hover:from-blue-10 hover:to-indigo-10 focus:outline-none focus:ring-2 focus:ring-blue-8 focus:ring-opacity-50 transition-all duration-300 transform hover:scale-105 flex items-center"
			>
			  <IconUserPlus class="mr-2" size={20} />
			  Register
			</a>
		  {/if}
		</div>
		<button class="menu-button p-2 lg:hidden" on:click={toggleDrawer}>
		  <IconMenu2 size={24} />
		</button>
	  </div>
	</div>
	
	{#if isDrawerOpen}
	  <div class="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
		<div class="fixed inset-0 bg-slate-8 bg-opacity-75" aria-hidden="true" on:click={toggleDrawer}></div>
		<nav class="fixed top-0 right-0 bottom-0 flex flex-col w-64 max-w-sm py-4 bg-white shadow-xl">
		  <div class="px-4 flex items-center justify-between">
			<h2 class="text-lg font-medium text-slate-12">Menu</h2>
			<button type="button" class="-mr-2 w-10 h-10 bg-white rounded-md p-2 inline-flex items-center justify-center text-slate-11 hover:text-slate-12 hover:bg-slate-3 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-8" on:click={toggleDrawer}>
			  <span class="sr-only">Close menu</span>
			  <IconMenu2 size={24} />
			</button>
		  </div>
		  <div class="mt-5 flex-1 flex flex-col justify-between">
			<div class="px-2 space-y-1">
			  {#each navLinks as link}
				<a href={link.href} class="block px-3 py-2 rounded-md text-base font-medium text-slate-12 hover:bg-slate-3 hover:text-slate-12">
				  <svelte:component this={link.icon} class="mr-4 inline" size={20} />
				  {link.name}
				</a>
			  {/each}
			</div>
			<div class="px-2 space-y-1">
			  {#if $currentUser}
				<button class="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-slate-12 hover:bg-slate-3 hover:text-slate-12">
				  <IconSettings class="mr-4 inline" size={20} />
				  Account Settings
				</button>
				<button on:click={logout} class="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-slate-12 hover:bg-slate-3 hover:text-slate-12">
				  <IconLogout class="mr-4 inline" size={20} />
				  Logout
				</button>
			  {:else}
				<a href="/login" class="block px-3 py-2 rounded-md text-base font-medium text-slate-12 hover:bg-slate-3 hover:text-slate-12">
				  <IconLogin class="mr-4 inline" size={20} />
				  Login
				</a>
				<a href="/register" class="block px-3 py-2 rounded-md text-base font-medium text-white bg-blue-9 hover:bg-blue-10">
				  <IconUserPlus class="mr-4 inline" size={20} />
				  Register
				</a>
			  {/if}
			</div>
		  </div>
		</nav>
	  </div>
	{/if}
  </header>
  <style>
	.header-grid {
	  display: grid;
	  grid-template-columns: auto 1fr auto auto;
	  grid-template-areas: "logo search nav account";
	  gap: 1rem;
	  align-items: center;
	  height: 4rem;
	}
  
	.logo-area {
	  grid-area: logo;
	}
  
	.search-area {
	  grid-area: search;
	}
  
	.nav-area {
	  grid-area: nav;
	}
  
	.account-area {
	  grid-area: account;
	}
  
	.menu-button {
	  display: none;
	}
  
	@media (max-width: 1023px) {
	  .header-grid {
		grid-template-columns: auto 1fr auto;
		grid-template-areas: 
		  "logo search menu"
		  "nav nav nav"
		  "account account account";
	  }
  
	  .nav-area, .account-area {
		display: none;
	  }
  
	  .menu-button {
		display: block;
		grid-area: menu;
		justify-self: end;
	  }
	}
  </style>