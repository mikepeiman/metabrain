import PocketBase from 'pocketbase';
import { writable, derived } from 'svelte/store';
import { goto } from '$app/navigation';

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

// Create a writable store for the user profile
function createCurrentUserProfile() {
    const { subscribe, set, update } = writable(null);

    return {
        subscribe,
        set,
        update,
        refresh: async () => {
            const user = pb.authStore.model;
            if (user) {
                try {
                    const profile = await pb.collection('users').getOne(user.id, { requestKey: null });
                    set(profile);
                } catch (err) {
                    console.error('Failed to fetch user profile:', err);
                    set(null);
                }
            } else {
                set(null);
            }
        },
        updateProfile: async (data) => {
            const user = pb.authStore.model;
            if (user) {
                try {
                    const updatedProfile = await pb.collection('users').update(user.id, data);
                    set(updatedProfile);
                    return updatedProfile;
                } catch (err) {
                    console.error('Failed to update user profile:', err);
                    throw err;
                }
            } else {
                console.error('No authenticated user');
                throw new Error('No authenticated user');
            }
        }
    };
}

export const currentUserProfile = createCurrentUserProfile();

export async function refreshAuth() {
    try {
        if (pb.authStore.isValid) {
            await pb.collection('users').authRefresh();
            await currentUserProfile.refresh();
            return true;
        } else {
            console.log('Auth token is not valid, skipping refresh');
            return false;
        }
    } catch (err) {
        console.error('Failed to refresh authentication:', err);
        // Handle authentication failure (e.g., redirect to login)
        return false;
    }
}

// Update currentUser store when auth state changes
pb.authStore.onChange((auth) => {
    console.log('AuthStore changed', auth);
    currentUser.set(pb.authStore.model);
    if (auth) {
        currentUserProfile.refresh();
    } else {
        currentUserProfile.set(null);
    }
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

// Helper function to update user profile
export async function updateUserProfile(data) {
    return currentUserProfile.updateProfile(data);
}

export function logout() {
    console.log('Logging out...');
    pb.authStore.clear();
    goto('/');
}