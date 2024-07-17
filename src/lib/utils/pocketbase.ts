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

// Create a writable store for the user profile
function createCurrentUserProfile() {
    const { subscribe, set } = writable(null);

    return {
        subscribe,
        set,
        update: async (data) => {
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

// Update currentUser store when auth state changes
pb.authStore.onChange((auth) => {
    console.log('AuthStore changed', auth);
    currentUser.set(pb.authStore.model);
    if (auth) {
        refreshUserProfile();
    } else {
        currentUserProfile.set(null);
    }
});

// Function to refresh the user profile
async function refreshUserProfile() {
    const user = pb.authStore.model;
    if (user) {
        try {
            const profile = await pb.collection('users').getOne(user.id);
            currentUserProfile.set(profile);
        } catch (err) {
            console.error('Failed to fetch user profile:', err);
            currentUserProfile.set(null);
        }
    } else {
        currentUserProfile.set(null);
    }
}

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
    return currentUserProfile.update(data);
}