// src/lib/stores/auth.ts
import { writable } from 'svelte/store';
import { getPb } from '$lib/utils/pocketbaseUtils';
const pb = getPb();

export const authStore = writable(pb.authStore);

pb.authStore.onChange(() => {
    authStore.set(pb.authStore);
});