<script lang="ts">
	import { onMount } from 'svelte';
	import { pb, currentUser } from '$utils/pocketbase';
	import { goto } from '$app/navigation';
	import  DarkModeToggle  from '$components/DarkModeToggle.svelte'
	import {
		IconSearch,
		IconDashboard,
		IconCalendar,
		IconClock,
		IconSettings,
		IconLogout,
		IconLogin,
		IconUserPlus,
		IconMenu2,
		IconNote,
		IconSun,
		IconMoon
	} from '@tabler/icons-svelte';

	let isDrawerOpen = false;
	let searchQuery = '';

	const navLinks = [
		{ name: 'Dashboard', href: '/dashboard', icon: IconDashboard },
		{ name: 'Calendar', href: '/calendar', icon: IconCalendar }
		// { name: 'Notes', href: '/notes', icon: IconNote },
		// { name: 'Today', href: '/today', icon: IconClock }
	];

	function logout() {
		pb.authStore.clear();
		goto('/login');
	}

	function toggleDrawer() {
		isDrawerOpen = !isDrawerOpen;
	}

	function toggleDarkMode() {
		document.body.classList.toggle('dark');
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

<header class="relative bg-slate-1 dark:bg-slate-12 shadow-md">
	<div class="container mx-auto px-4 sm:px-6 lg:px-8">
	  <div class="header-grid">
		<a href="/" class="logo-area" aria-label="Back to homepage">
		  <img src="/images/metabrain-logo.svg" alt="MetaBrain Logo" class="h-8 w-auto" />
		</a>
		<div class="search-area">
		  <div class="relative">
			<IconSearch
			  class="absolute left-3 top-1/2 -translate-y-1/2 transform text-slate-9"
			  size={20}
			/>
			<input
			  type="text"
			  bind:value={searchQuery}
			  placeholder="Search..."
			  class="w-full rounded-lg border border-slate-7 bg-slate-2 py-2 pl-10 pr-4 text-slate-12 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-8 dark:bg-slate-2 dark:text-slate-1 dark:border-slate-6 dark:focus:ring-blue-9"
			/>
		  </div>
		</div>
		<nav class="nav-area hidden space-x-8 lg:flex">
		  {#each navLinks as link}
			<a
			  href={link.href}
			  class="flex items-center text-base font-medium text-slate-11 transition-colors duration-300 hover:text-slate-12 dark:text-slate-3 dark:hover:text-slate-1"
			>
			  <svelte:component this={link.icon} class="mr-2" size={20} />
			  {link.name}
			</a>
		  {/each}
		</nav>
		<div class="account-area hidden items-center space-x-4 lg:flex">
		  {#if $currentUser}
			<button
			  class="flex items-center text-base font-medium text-slate-11 transition-colors duration-300 hover:text-slate-12 dark:text-slate-3 dark:hover:text-slate-1"
			>
			  <IconSettings class="mr-2" size={20} />
			  Account Settings
			</button>
			<button
			  on:click={logout}
			  class="flex items-center text-base font-medium text-slate-11 transition-colors duration-300 hover:text-slate-12 dark:text-slate-3 dark:hover:text-slate-1"
			>
			  <IconLogout class="mr-2" size={20} />
			  Logout
			</button>
		  {:else}
			<a
			  href="/login"
			  class="flex items-center text-base font-medium text-slate-11 transition-colors duration-300 hover:text-slate-12 dark:text-slate-3 dark:hover:text-slate-1"
			>
			  <IconLogin class="mr-2" size={20} />
			  Login
			</a>
			<a
			  href="/register"
			  class="flex transform items-center rounded-lg bg-gradient-to-r from-blue-9 to-indigo-9 px-4 py-2 text-base font-medium text-white transition-all duration-300 hover:scale-105 hover:from-blue-10 hover:to-indigo-10 focus:outline-none focus:ring-2 focus:ring-blue-8 focus:ring-opacity-50 dark:from-blue-10 dark:to-indigo-10 dark:hover:from-blue-11 dark:hover:to-indigo-11 dark:focus:ring-blue-9"
			>
			  <IconUserPlus class="mr-2" size={20} />
			  Register
			</a>
		  {/if}
		  <DarkModeToggle />
		</div>
		<button class="menu-button p-2 lg:hidden" on:click={toggleDrawer}>
		  <IconMenu2 size={24} class="text-slate-11 dark:text-slate-3" />
		</button>
	  </div>
	</div>
  
	{#if isDrawerOpen}
	  <div class="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
		<div
		  class="fixed inset-0 bg-slate-8 bg-opacity-75 dark:bg-slate-1 dark:bg-opacity-75"
		  aria-hidden="true"
		  on:click={toggleDrawer}
		></div>
		<nav class="fixed bottom-0 right-0 top-0 flex w-64 max-w-sm flex-col bg-slate-1 py-4 shadow-xl dark:bg-slate-12">
		  <div class="flex items-center justify-between px-4">
			<h2 class="text-lg font-medium text-slate-12 dark:text-slate-1">Menu</h2>
			<button
			  type="button"
			  name="dark-mode-toggle"
			  class="-mr-2 inline-flex h-10 w-10 items-center justify-center rounded-md bg-slate-1 p-2 text-slate-11 hover:bg-slate-3 hover:text-slate-12 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-8 dark:bg-slate-12 dark:text-slate-3 dark:hover:bg-slate-11 dark:hover:text-slate-1 dark:focus:ring-indigo-9"
			  on:click={toggleDrawer}
			>
			  <span class="sr-only">Close menu</span>
			  <IconMenu2 size={24} />
			</button>
		  </div>
		  <div class="mt-5 flex flex-1 flex-col justify-between">
			<div class="space-y-1 px-2">
			  {#each navLinks as link}
				<a
				  href={link.href}
				  class="block rounded-md px-3 py-2 text-base font-medium text-slate-12 hover:bg-slate-3 hover:text-slate-12 dark:text-slate-1 dark:hover:bg-slate-11 dark:hover:text-slate-1"
				>
				  <svelte:component this={link.icon} class="mr-4 inline" size={20} />
				  {link.name}
				</a>
			  {/each}
			</div>
  
			<div class="space-y-1 px-2">
			  {#if $currentUser}
				<button
				  class="block w-full rounded-md px-3 py-2 text-left text-base font-medium text-slate-12 hover:bg-slate-3 hover:text-slate-12 dark:text-slate-1 dark:hover:bg-slate-11 dark:hover:text-slate-1"
				>
				  <IconSettings class="mr-4 inline" size={20} />
				  Account Settings
				</button>
				<button
				  on:click={logout}
				  class="block w-full rounded-md px-3 py-2 text-left text-base font-medium text-slate-12 hover:bg-slate-3 hover:text-slate-12 dark:text-slate-1 dark:hover:bg-slate-11 dark:hover:text-slate-1"
				>
				  <IconLogout class="mr-4 inline" size={20} />
				  Logout
				</button>
			  {:else}
				<a
				  href="/login"
				  class="block rounded-md px-3 py-2 text-base font-medium text-slate-12 hover:bg-slate-3 hover:text-slate-12 dark:text-slate-1 dark:hover:bg-slate-11 dark:hover:text-slate-1"
				>
				  <IconLogin class="mr-4 inline" size={20} />
				  Login
				</a>
				<a
				  href="/register"
				  class="block rounded-md bg-blue-9 px-3 py-2 text-base font-medium text-white hover:bg-blue-10 dark:bg-blue-10 dark:hover:bg-blue-11"
				>
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
		grid-template-areas: 'logo search nav account';
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
				'logo search menu'
				'nav nav nav'
				'account account account';
		}

		.nav-area,
		.account-area {
			display: none;
		}

		.menu-button {
			display: block;
			grid-area: menu;
			justify-self: end;
		}
	}
</style>
