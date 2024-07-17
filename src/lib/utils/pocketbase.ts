import PocketBase from 'pocketbase';
import { writable, derived } from 'svelte/store';

// Create PocketBase instance
export const pb = new PocketBase('http://127.0.0.1:8090');

// Create a writable store for the current user
function createCurrentUser() {
    const { subscribe, set } = writable(pb.authStore.model);

    return {
        subscribe,
        set,
        update: (cb) => {
            subscribe(user => {
                set(cb(user));
            });
        }
    };
}

export const currentUser = createCurrentUser();

// Create a derived store for the user profile
export const currentUserProfile = derived(currentUser, ($currentUser, set) => {
    if ($currentUser) {
        pb.collection('users').getOne($currentUser.id)
            .then(profile => set(profile))
            .catch(err => {
                console.error('Failed to fetch user profile:', err);
                set(null);
            });
    } else {
        set(null);
    }
}, null);

// Update currentUser store when auth state changes
pb.authStore.onChange((auth) => {
    console.log('AuthStore changed', auth);
    currentUser.set(pb.authStore.model);
});

// Test connection
pb.health.check().then(() => {
    console.log('Connected to PocketBase successfully');
}).catch(err => {
    console.error('Failed to connect to PocketBase:', err);
});

// Helper function to get current user synchronously
export function getCurrentUser() {
    return pb.authStore.model;
}

// Helper function to get user profile (returns a promise)
export async function getUserProfile() {
    const user = getCurrentUser();
    if (user) {
        return pb.collection('users').getOne(user.id);
    }
    return null;
}