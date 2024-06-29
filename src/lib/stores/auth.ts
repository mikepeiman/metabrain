// src/lib/stores/auth.ts
import { writable } from 'svelte/store';
    import { pb } from '$lib/utils/pocketbase';
 

export const authStore = writable(pb.authStore);

pb.authStore.onChange(() => {
    authStore.set(pb.authStore);
});