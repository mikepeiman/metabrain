import { writable } from 'svelte/store';

import { getPb } from '$utils/pocketbaseUtils';
const pb = getPb();

export const currentUser = writable(pb.authStore.model);

pb.authStore.onChange((auth) => {
    console.log('AuthStore changed', auth);
    currentUser.set(pb.authStore.model);
});