<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { Input } from "$lib/components/ui/input";
  import { Label } from "$lib/components/ui/label";
  import { Avatar } from "$lib/components/ui/avatar";
  import { Card, CardContent, CardHeader, CardTitle } from "$lib/components/ui/card";
  import { Separator } from "$lib/components/ui/separator";

  let username = "";
  let firstName = "";
  let lastName = "";
  let avatarFile: File | null = null;
  let bannerFile: File | null = null;
  let avatarPreview: string | null = null;
  let bannerPreview: string | null = null;

  function handleAvatarUpload(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      avatarFile = input.files[0];
      avatarPreview = URL.createObjectURL(avatarFile);
    }
  }

  function handleBannerUpload(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      bannerFile = input.files[0];
      bannerPreview = URL.createObjectURL(bannerFile);
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

  function handleSubmit() {
    // Handle form submission here
    console.log({ username, firstName, lastName, avatarFile, bannerFile });
  }
</script>

<Card class="w-full max-w-3xl mx-auto">
  <CardHeader>
    <CardTitle>User Profile Settings</CardTitle>
  </CardHeader>
  <CardContent>
    <form on:submit|preventDefault={handleSubmit} class="space-y-6">
      <div class="space-y-4">
        <Label for="username">Username</Label>
        <Input id="username" bind:value={username} placeholder="Enter username" />
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div class="space-y-2">
          <Label for="firstName">First Name</Label>
          <Input id="firstName" bind:value={firstName} placeholder="Enter first name" />
        </div>
        <div class="space-y-2">
          <Label for="lastName">Last Name</Label>
          <Input id="lastName" bind:value={lastName} placeholder="Enter last name" />
        </div>
      </div>

      <Separator />

      <div class="space-y-4">
        <Label>Avatar Image</Label>
        <div 
          class="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer"
          on:drop|preventDefault={(e) => handleDrop(e, 'avatar')}
          on:dragover={handleDragOver}
        >
          {#if avatarPreview}
            <Avatar src={avatarPreview} alt="Avatar preview" class="w-32 h-32 mx-auto mb-4" />
          {:else}
            <p>Drag and drop an image here, or click to select</p>
          {/if}
          <Input 
            type="file" 
            accept="image/*" 
            on:change={handleAvatarUpload} 
            class="hidden" 
            id="avatarUpload"
          />
          <Label for="avatarUpload" class="cursor-pointer">
            <Button type="button" variant="outline">Choose File</Button>
          </Label>
        </div>
      </div>

      <Separator />

      <div class="space-y-4">
        <Label>Banner Image</Label>
        <div 
          class="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer h-40 relative overflow-hidden"
          on:drop|preventDefault={(e) => handleDrop(e, 'banner')}
          on:dragover={handleDragOver}
        >
          {#if bannerPreview}
            <img src={bannerPreview} alt="Banner preview" class="absolute inset-0 w-full h-full object-cover" />
          {:else}
            <p class="absolute inset-0 flex items-center justify-center">Drag and drop an image here, or click to select</p>
          {/if}
          <Input 
            type="file" 
            accept="image/*" 
            on:change={handleBannerUpload} 
            class="hidden" 
            id="bannerUpload"
          />
          <Label for="bannerUpload" class="cursor-pointer absolute inset-0 flex items-center justify-center">
            <Button type="button" variant="outline" class="bg-white bg-opacity-50">Choose File</Button>
          </Label>
        </div>
      </div>

      <Button type="submit" class="w-full">Save Changes</Button>
    </form>
  </CardContent>
</Card>