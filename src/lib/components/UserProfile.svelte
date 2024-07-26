<script lang="ts">
	import { onMount, afterUpdate } from 'svelte';
	import { pb, currentUser, getUserProfile } from '$utils/pocketbase';
	import {
		IconBrandTwitter,
		IconBrandGithub,
		IconBrandLinkedin,
		IconMail
	} from '@tabler/icons-svelte';

	// Subscribe to the store
	$: user = $currentUser;
	$: if (user) updateImagePreviews();
	let avatarPreview: string | null = null;
	let bannerPreview: string | null = null;

	onMount(async () => {
		console.log(`🚀 ~ currentUser:`, $currentUser);
		let profile2 = await getUserProfile();
		console.log(`🚀 ~ profile2:`, profile2);
	});

	afterUpdate(() => {
		if (user) {
			avatarPreview = user.avatar ? pb.getFileUrl(user, user.avatar) : null;
			bannerPreview = user.banner ? pb.getFileUrl(user, user.banner) : null;
		}

		console.log(`🚀 ~ afterUpdate ~ user:`, user);
	});

	// Function to format date
	function formatDate(dateString) {
		return new Date(dateString).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});
	}

	function updateImagePreviews() {
		if (user) {
			avatarPreview = user.avatar ? pb.getFileUrl(user, user.avatar) : null;
			bannerPreview = user.banner ? pb.getFileUrl(user, user.banner) : null;
		}
	}
</script>

<div class="mx-auto mt-8 w-full max-w-3xl px-4">
	{#if user }
		<div class="overflow-hidden rounded-lg bg-slate-1 shadow-lg dark:bg-slate-2">
			<!-- Banner -->
			<div class="h-48 bg-cover bg-center" style="background-image: url({bannerPreview})"></div>

			<!-- Profile Info -->
			<div class="relative px-4 py-5 sm:px-6">
				<!-- Profile Picture -->
				<div
					class="absolute -mt-20 h-32 w-32 overflow-hidden rounded-full border-4 border-slate-1 dark:border-slate-2"
				>
					<img src={avatarPreview} alt="Profile" class="h-full w-full object-cover" />
				</div>

				<!-- User Info -->
				<div class="ml-36 pt-2">
					<h2 class="text-2xl font-bold text-slate-12 dark:text-slate-12">
						{user.firstname}
						{user.lastname}
					</h2>
					<p class="text-sm text-slate-11 dark:text-slate-11">@{user.username}</p>
				</div>

				<!-- Social Links -->
				<div class="mt-4 flex space-x-3">
					<IconBrandTwitter class="cursor-pointer text-blue-9 hover:text-blue-10" />
					<IconBrandGithub
						class="cursor-pointer text-slate-9 hover:text-slate-10 dark:text-slate-9 dark:hover:text-slate-10"
					/>
					<IconBrandLinkedin class="cursor-pointer text-blue-9 hover:text-blue-10" />
					<IconMail class="cursor-pointer text-slate-9 hover:text-slate-10" />
				</div>
			</div>

			<!-- Profile Details -->
			<div class="border-t border-slate-6 px-4 py-5 dark:border-slate-6 sm:px-6">
				<div class="grid grid-cols-2 gap-4">
					<div>
						<dt class="text-sm font-medium text-slate-11 dark:text-slate-11">Email</dt>
						<dd class="mt-1 text-sm text-slate-12 dark:text-slate-12">{user.email}</dd>
					</div>
					<div>
						<dt class="text-sm font-medium text-slate-11 dark:text-slate-11">Username</dt>
						<dd class="mt-1 text-sm text-slate-12 dark:text-slate-12">{user.username}</dd>
					</div>
					<div>
						<dt class="text-sm font-medium text-slate-11 dark:text-slate-11">Joined</dt>
						<dd class="mt-1 text-sm text-slate-12 dark:text-slate-12">
							{formatDate(user.created)}
						</dd>
					</div>
					<div>
						<dt class="text-sm font-medium text-slate-11 dark:text-slate-11">Last Updated</dt>
						<dd class="mt-1 text-sm text-slate-12 dark:text-slate-12">
							{formatDate(user.updated)}
						</dd>
					</div>
					<div>
						<dt class="text-sm font-medium text-slate-11 dark:text-slate-11">Verified</dt>
						<dd class="mt-1 text-sm text-slate-12 dark:text-slate-12">
							{user.verified ? 'Yes' : 'No'}
						</dd>
					</div>
				</div>
			</div>
		</div>
	{/if}

	<!-- Command Palette Prompt -->
	<div class="mt-8 text-center">
		<p class="text-lg text-slate-11 dark:text-slate-11">
			Press
			<kbd
				class="rounded-lg border border-slate-7 bg-slate-3 px-2 py-1.5 text-xs font-semibold text-slate-12 shadow-sm dark:border-slate-6 dark:bg-slate-3 dark:text-slate-12"
			>
				<span class="mr-1 text-sm">⌘</span>K
			</kbd>
			to open the command palette
		</p>
	</div>
</div>