<script lang="ts">
	import { onMount } from 'svelte';
	import { pb, currentUser, currentUserProfile } from '$utils/pocketbase';

	// Subscribe to the stores
	$: user = $currentUser;
	$: profile = $currentUserProfile;
    $: if (profile) updateImagePreviews();
    let avatarPreview: string | null = null;
    let bannerPreview: string | null = null;
	onMount(async () => {
		console.log(`🚀 ~ currentUserProfile:`, $currentUserProfile);
		console.log(`🚀 ~ currentUser:`, $currentUser);
	});
  import { IconBrandTwitter, IconBrandGithub, IconBrandLinkedin, IconMail } from '@tabler/icons-svelte';

  // Function to format date
  function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  function updateImagePreviews() {
        if (profile) {
            avatarPreview = profile.avatar ? pb.getFileUrl(profile, profile.avatar) : null;
            bannerPreview = profile.banner ? pb.getFileUrl(profile, profile.banner) : null;
        }
    }


</script>

<div class="w-full max-w-3xl mx-auto mt-8 px-4">
  {#if user && profile}
    <div class="bg-slate-1 dark:bg-slate-2 rounded-lg shadow-lg overflow-hidden">
      <!-- Banner -->
      <div class="h-48 bg-cover bg-center" style="background-image: url({bannerPreview})"></div>
      
      <!-- Profile Info -->
      <div class="relative px-4 py-5 sm:px-6">
        <!-- Profile Picture -->
        <div class="absolute -mt-20 w-32 h-32 rounded-full border-4 border-slate-1 dark:border-slate-2 overflow-hidden">
          <img src={avatarPreview} alt="Profile" class="w-full h-full object-cover" />
        </div>
        
        <!-- User Info -->
        <div class="ml-36 pt-2">
          <h2 class="text-2xl font-bold text-slate-12 dark:text-slate-12">{profile.firstname} {profile.lastname}</h2>
          <p class="text-sm text-slate-11 dark:text-slate-11">@{profile.username}</p>
        </div>
        
        <!-- Social Links -->
        <div class="mt-4 flex space-x-3">
          <IconBrandTwitter class="text-blue-9 hover:text-blue-10 cursor-pointer" />
          <IconBrandGithub class="text-slate-9 hover:text-slate-10 cursor-pointer dark:text-slate-9 dark:hover:text-slate-10" />
          <IconBrandLinkedin class="text-blue-9 hover:text-blue-10 cursor-pointer" />
          <IconMail class="text-slate-9 hover:text-slate-10 cursor-pointer" />
        </div>
      </div>
      
      <!-- Profile Details -->
      <div class="border-t border-slate-6 dark:border-slate-6 px-4 py-5 sm:px-6">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <dt class="text-sm font-medium text-slate-11 dark:text-slate-11">Email</dt>
            <dd class="mt-1 text-sm text-slate-12 dark:text-slate-12">{profile.email}</dd>
          </div>
          <div>
            <dt class="text-sm font-medium text-slate-11 dark:text-slate-11">Username</dt>
            <dd class="mt-1 text-sm text-slate-12 dark:text-slate-12">{profile.username}</dd>
          </div>
          <div>
            <dt class="text-sm font-medium text-slate-11 dark:text-slate-11">Joined</dt>
            <dd class="mt-1 text-sm text-slate-12 dark:text-slate-12">{formatDate(profile.created)}</dd>
          </div>
          <div>
            <dt class="text-sm font-medium text-slate-11 dark:text-slate-11">Last Updated</dt>
            <dd class="mt-1 text-sm text-slate-12 dark:text-slate-12">{formatDate(profile.updated)}</dd>
          </div>
          <div>
            <dt class="text-sm font-medium text-slate-11 dark:text-slate-11">Verified</dt>
            <dd class="mt-1 text-sm text-slate-12 dark:text-slate-12">{profile.verified ? 'Yes' : 'No'}</dd>
          </div>
        </div>
      </div>
    </div>
  {/if}
  
  <!-- Command Palette Prompt -->
  <div class="mt-8 text-center">
    <p class="text-lg text-slate-11 dark:text-slate-11">
      Press
      <kbd class="px-2 py-1.5 text-xs font-semibold text-slate-12 bg-slate-3 border border-slate-7 rounded-lg shadow-sm dark:bg-slate-3 dark:text-slate-12 dark:border-slate-6">
        <span class="text-sm mr-1">⌘</span>K
      </kbd>
      to open the command palette
    </p>
  </div>
</div>