<script lang="ts">
	import { Home, CalendarDays, Layout, Settings, User } from 'lucide-svelte';
	import { IconNotes, IconSearch, IconPhoto, IconArrowRightBar } from '@tabler/icons-svelte';
	import * as Tooltip from '$lib/components/ui/tooltip/index.js';
	import { pb, currentUser, currentUserProfile } from '$utils/pocketbase';
	import { onMount } from 'svelte';

	let isExpanded = false;
	$: sidebarWidth = isExpanded ? '14rem' : '4rem';
	$: console.log(`🚀 ~ sidebarWidth:`, sidebarWidth);
	$: document.documentElement.style.setProperty('--sidebar-width', sidebarWidth);
	const menuItems = [
		{ href: '#', action: 'expandSidebar', icon: IconArrowRightBar, label: 'collapse menu' },
		{ href: '/', icon: Home, label: 'Home' },
		{ href: '/notes', icon: IconNotes, label: "Today's Note" },
		{ href: '/calendar', icon: CalendarDays, label: 'Calendar View' },
		{ href: '#', action: 'openCommandPalette', icon: IconSearch, label: 'Quick Switcher' },
		{ href: '/dashboard', icon: Layout, label: 'Layouts Dashboard' },
		{ href: '/gallery', icon: IconPhoto, label: 'Media Gallery' }
	];

	const recentFiles = [
		{ name: 'Document 1', href: '/file1' },
		{ name: 'Image 2', href: '/file2' },
		{ name: 'Note 3', href: '/file3' }
	];

	$: profile = $currentUserProfile;
	$: avatarPreview = profile?.avatar ? pb.getFileUrl(profile, profile.avatar) : null;

	$: isLoggedIn = !!$currentUser;

	onMount(() => {
		const savedState = localStorage.getItem('sidebarExpanded');
		if (savedState !== null) {
			isExpanded = JSON.parse(savedState);
		}
	});
	function toggleSidebar(e) {
		console.log(`🚀 ~ toggleSidebar ~ e:`, e.target);
		isExpanded = !isExpanded;
		localStorage.setItem('sidebarExpanded', JSON.stringify(isExpanded));
	}

	function triggerCommandPalette() {
		const keyboardEvent = new KeyboardEvent('keydown', {
			key: 'k',
			ctrlKey: true
		});
		document.dispatchEvent(keyboardEvent);
	}

	function handleItemClick(item) {
		if (item.action === 'openCommandPalette') {
			triggerCommandPalette();
		}
	}
</script>

<aside
	class="border-slate-200 dark:border-slate-800 fixed inset-y-0 left-0 z-10 flex flex-col border-r bg-white text-blue-11 transition-all duration-300 ease-in-out dark:bg-black dark:text-white {isExpanded
		? 'w-[14rem]'
		: 'w-[4rem]'}"
>
	<nav class="relative flex flex-col gap-2 overflow-y-auto px-2 py-4">


		<div class="relative mt-[3rem] flex flex-col gap-2 overflow-y-auto px-2 py-4">
			{#each menuItems as item}
				<Tooltip.Root>
					<Tooltip.Trigger asChild let:builder>
						<a
							href={item.href}
							rel="prefetch"
							class="sidebar-item text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 flex h-8 w-full items-center rounded-lg p-2 transition-colors"
							use:builder.action
							{...builder}
							on:click|stopPropagation={(e) => handleItemClick(item)}
						>
							{#if item.action === 'expandSidebar'}
								<div
									on:click={(e) => toggleSidebar(e)}
									class="flex h-5 w-5 flex-shrink-0 items-center justify-center"
								>
									<svelte:component
										this={item.icon}
										class="h-5 w-5 transition-transform duration-500 {isExpanded
											? 'rotate-180 transform'
											: ''}"
									/>
								</div>
									{#if isExpanded}
										<span on:click={(e) => toggleSidebar(e)} class="ml-3 overflow-hidden text-ellipsis whitespace-nowrap"
											>{item.label}</span
										>
									{/if}
							{:else}
								<div class="flex h-5 w-5 flex-shrink-0 items-center justify-center">
									<svelte:component this={item.icon} class="h-5 w-5" />
								</div>
							{/if}
							{#if isExpanded && item.action !== 'expandSidebar'}
								<span class="ml-3 overflow-hidden text-ellipsis whitespace-nowrap"
									>{item.label}</span
								>
							{/if}
							<span class="sr-only">{item.label}</span>
						</a>
					</Tooltip.Trigger>
					<Tooltip.Content side="right">{item.label}</Tooltip.Content>
				</Tooltip.Root>
			{/each}
		</div>

		{#if isExpanded}
			<div class="border-slate-200 dark:border-slate-800 my-4 w-full border-t"></div>
			<div class="w-full">
				<h3 class="text-slate-900 dark:text-slate-100 mb-2 px-2 text-sm font-semibold">
					Recent Files
				</h3>
				<ul class="space-y-1">
					{#each recentFiles as file}
						<li>
							<a
								href={file.href}
								class="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center rounded-lg p-2 text-sm"
							>
								<div class="flex h-4 w-4 flex-shrink-0 items-center justify-center">
									<IconNotes class="h-4 w-4" />
								</div>
								<span class="ml-3 overflow-hidden text-ellipsis whitespace-nowrap">{file.name}</span
								>
							</a>
						</li>
					{/each}
				</ul>
			</div>
		{/if}
	</nav>
	<div
		on:click={(e) => toggleSidebar(e)}
		class="border-slate-200 dark:border-slate-800 flex flex-1 flex-grow border-t"
	></div>
	<div
		class="border-slate-200 dark:border-slate-800 mt-auto flex flex-col gap-2 border-t px-2 py-4"
	>
		<Tooltip.Root>
			<Tooltip.Trigger asChild let:builder>
				<a
					href="/settings"
					class="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 flex w-full items-center justify-start rounded-lg p-2 transition-colors"
					use:builder.action
					{...builder}
				>
					<div class="ml-2 flex h-5 w-5 flex-shrink-0 items-center justify-center">
						<Settings class="h-5 w-5" />
					</div>
					{#if isExpanded}
						<span class="ml-5 overflow-hidden text-ellipsis whitespace-nowrap">Settings</span>
					{/if}
					<span class="sr-only">Settings</span>
				</a>
			</Tooltip.Trigger>
			<Tooltip.Content side="right">Settings</Tooltip.Content>
		</Tooltip.Root>

		<div class="flex items-center p-2">
			{#if isLoggedIn}
				{#if avatarPreview}
					<img src={avatarPreview} alt="User Avatar" class="h-9 w-9 rounded-full" />
				{:else}
					<div
						class="bg-slate-200 dark:bg-slate-700 flex h-9 w-9 items-center justify-center rounded-full"
					>
						<span class="text-slate-600 dark:text-slate-400 text-sm"
							>{profile?.firstname?.[0] || 'U'}</span
						>
					</div>
				{/if}
				{#if isExpanded}
					<span
						class="text-slate-600 dark:text-slate-400 ml-3 overflow-hidden text-ellipsis whitespace-nowrap"
						>{profile?.username || 'User'}</span
					>
				{/if}
			{:else}
				<a href="/login" class="flex w-full items-center">
					<div class="flex "></div>
					{#if isExpanded}
						<span
							class="text-slate-600 dark:text-slate-400 ml-3 overflow-hidden text-ellipsis whitespace-nowrap"
							>Login</span
						>
					{/if}
				</a>
			{/if}
		</div>
	</div>
</aside>

<style>
</style>
