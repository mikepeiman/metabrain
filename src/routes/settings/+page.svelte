<script lang="ts">
	import { onMount } from 'svelte';
	import { pb, currentUserProfile, updateUserProfile } from '$utils/pocketbase';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Avatar } from '$lib/components/ui/avatar';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Separator } from '$lib/components/ui/separator';
	import { toast } from 'svelte-sonner';
	import { IconX } from '@tabler/icons-svelte';

	let username = '';
	let email = '';
	let emailVisibility = false;
	let firstname = '';
	let lastname = '';
	let avatarPreview: string | null = null;
	let bannerPreview: string | null = null;
	let isLoading = false;
	let avatarFile: File | null = null;
	let bannerFile: File | null = null;

    onMount(async () => {
        if (!$currentUserProfile) {
            await pb.collection('users').authRefresh();
        }

        if ($currentUserProfile) {
            username = $currentUserProfile.username;
            email = $currentUserProfile.email;
            emailVisibility = $currentUserProfile.emailVisibility;
            firstname = $currentUserProfile.firstname || '';
            lastname = $currentUserProfile.lastname || '';
            avatarPreview = $currentUserProfile.avatar ? pb.getFileUrl($currentUserProfile, $currentUserProfile.avatar) : null;
            bannerPreview = $currentUserProfile.banner ? pb.getFileUrl($currentUserProfile, $currentUserProfile.banner) : null;
        }
    });

    function removeImage(type: 'avatar' | 'banner') {
        if (type === 'avatar') {
            avatarFile = null;
            avatarPreview = null;
        } else {
            bannerFile = null;
            bannerPreview = null;
        }
    }

	function updateImagePreviews() {
		if ($currentUserProfile) {
			avatarPreview = $currentUserProfile.avatar
				? pb.getFileUrl($currentUserProfile, $currentUserProfile.avatar)
				: null;
			bannerPreview = $currentUserProfile.banner
				? pb.getFileUrl($currentUserProfile, $currentUserProfile.banner)
				: null;
		}
	}

	async function handleImageUpload(event: Event, type: 'avatar' | 'banner') {
		const input = event.target as HTMLInputElement;
		if (input.files && input.files[0]) {
			await uploadImage(input.files[0], type);
		}
	}

	function handleImageSelect(event: Event, type: 'avatar' | 'banner') {
		const input = event.target as HTMLInputElement;
		if (input.files && input.files[0]) {
			const file = input.files[0];
			if (type === 'avatar') {
				avatarFile = file;
				avatarPreview = URL.createObjectURL(file);
			} else {
				bannerFile = file;
				bannerPreview = URL.createObjectURL(file);
			}
		}
	}

	function handleDrop(event: DragEvent, type: 'avatar' | 'banner') {
		event.preventDefault();
		const file = event.dataTransfer?.files[0];
		if (file) {
			if (type === 'avatar') {
				avatarFile = file;
				avatarPreview = URL.createObjectURL(file);
			} else {
				bannerFile = file;
				bannerPreview = URL.createObjectURL(file);
			}
		}
	}

	function handleDragOver(event: DragEvent) {
		event.preventDefault();
	}

	async function uploadImage(file: File, type: 'avatar' | 'banner') {
		isLoading = true;
		try {
			const formData = new FormData();
			formData.append(type, file);

			await updateUserProfile(formData);
			updateImagePreviews();
			toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} updated successfully`);
		} catch (error) {
			console.error(`Error uploading ${type}:`, error);
			toast.error(`Failed to upload ${type}`);
		} finally {
			isLoading = false;
		}
	}

	async function handleSubmit() {
		isLoading = true;
		try {
			const formData = new FormData();
			formData.append('username', username);
			formData.append('email', email);
			formData.append('emailVisibility', emailVisibility.toString());
			formData.append('firstname', firstname);
			formData.append('lastname', lastname);

			if (avatarFile) {
				formData.append('avatar', avatarFile);
			}
			if (bannerFile) {
				formData.append('banner', bannerFile);
			}

			await updateUserProfile(formData);
			toast.success('Profile updated successfully');
			avatarFile = null;
			bannerFile = null;
		} catch (error) {
			console.error('Error updating profile:', error);
			toast.error(`Failed to update profile: ${error.message}`);
		} finally {
			isLoading = false;
		}
	}

	let avatarInput: HTMLInputElement;
	let bannerInput: HTMLInputElement;
</script>

<Card class="mx-auto w-full max-w-3xl">
	<CardHeader>
		<CardTitle>User Profile Settings</CardTitle>
	</CardHeader>
	<CardContent>
		<form on:submit|preventDefault={handleSubmit} class="space-y-6">
			<div class="space-y-4">
				<Label for="username">Username</Label>
				<Input id="username" bind:value={username} placeholder="Enter username" />
			</div>

			<div class="space-y-4">
				<Label for="email">Email</Label>
				<Input id="email" bind:value={email} type="email" placeholder="Enter email" />
			</div>

			<div class="grid grid-cols-2 gap-4">
				<div class="space-y-2">
					<Label for="firstname">First Name</Label>
					<Input id="firstname" bind:value={firstname} placeholder="Enter first name" />
				</div>
				<div class="space-y-2">
					<Label for="lastname">Last Name</Label>
					<Input id="lastname" bind:value={lastname} placeholder="Enter last name" />
				</div>
			</div>

			<Separator />

			<div class="space-y-4">
				<Label>Avatar Image</Label>
				<div
					class="border-gray-300 relative h-40 cursor-pointer overflow-hidden rounded-lg border-2 border-dashed p-4 text-center"
					on:drop|preventDefault={(e) => handleDrop(e, 'avatar')}
					on:dragover={handleDragOver}
				>
					{#if isLoading}
						<div class="absolute inset-0 flex items-center justify-center space-x-2">
							<div class="dark:bg-cyan-600 h-4 w-4 animate-pulse rounded-full"></div>
							<div class="dark:bg-cyan-600 h-4 w-4 animate-pulse rounded-full"></div>
							<div class="dark:bg-cyan-600 h-4 w-4 animate-pulse rounded-full"></div>
						</div>
					{:else if avatarPreview}
						<img
							src={avatarPreview}
							alt="Avatar preview"
							class="absolute inset-0 h-full w-full object-cover"
						/>
						<button
							type="button"
							class="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full"
							on:click|stopPropagation={() => removeImage('avatar')}
						>
							<X size={20} />
						</button>
					{:else}
						<p class="absolute inset-0 flex items-center justify-center">
							Drag and drop an image here, or click to select
						</p>
					{/if}
					<Input
						bind:this={avatarInput}
						type="file"
						accept="image/*"
						on:change={(e) => handleImageSelect(e, 'avatar')}
						class="hidden"
						id="avatarUpload"
					/>
					<div on:click|stopPropagation={() => avatarInput.click()} class="absolute bottom-2 left-1/2 transform -translate-x-1/2">
						<Button
							type="button"
							variant="outline"
							class="bg-white bg-opacity-50"
						>
							Choose File
						</Button>
					</div>
				</div>
			</div>
			
			<Separator />
			
			<div class="space-y-4">
				<Label>Banner Image</Label>
				<div
					class="border-gray-300 relative h-40 cursor-pointer overflow-hidden rounded-lg border-2 border-dashed p-4 text-center"
					on:drop|preventDefault={(e) => handleDrop(e, 'banner')}
					on:dragover={handleDragOver}
				>
					{#if isLoading}
						<div class="absolute inset-0 flex items-center justify-center space-x-2">
							<div class="dark:bg-cyan-600 h-4 w-4 animate-pulse rounded-full"></div>
							<div class="dark:bg-cyan-600 h-4 w-4 animate-pulse rounded-full"></div>
							<div class="dark:bg-cyan-600 h-4 w-4 animate-pulse rounded-full"></div>
						</div>
					{:else if bannerPreview}
						<img
							src={bannerPreview}
							alt="Banner preview"
							class="absolute inset-0 h-full w-full object-cover"
						/>
						<button
							type="button"
							class="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full"
							on:click|stopPropagation={() => removeImage('banner')}
						>
							<X size={20} />
						</button>
					{:else}
						<p class="absolute inset-0 flex items-center justify-center">
							Drag and drop an image here, or click to select
						</p>
					{/if}
					<Input
						bind:this={bannerInput}
						type="file"
						accept="image/*"
						on:change={(e) => handleImageSelect(e, 'banner')}
						class="hidden"
						id="bannerUpload"
					/>
					<div on:click|stopPropagation={() => bannerInput.click()} class="absolute bottom-2 left-1/2 transform -translate-x-1/2">
						<Button
							type="button"
							variant="outline"
							class="bg-white bg-opacity-50"
						>
							Choose File
						</Button>
					</div>
				</div>
			</div>
			<Button type="submit" class="w-full" disabled={isLoading}>
				{#if isLoading}
					<div class="mr-2 flex items-center justify-center space-x-2">
						<div class="dark:bg-cyan-600 h-4 w-4 animate-pulse rounded-full"></div>
						<div class="dark:bg-cyan-600 h-4 w-4 animate-pulse rounded-full"></div>
						<div class="dark:bg-cyan-600 h-4 w-4 animate-pulse rounded-full"></div>
					</div>
				{/if}
				Save Changes
			</Button>
		</form>
	</CardContent>
</Card>
