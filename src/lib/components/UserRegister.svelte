<script lang="ts">
    import { goto } from '$app/navigation';
    
    import { pb } from '$utils/pocketbase';
 

    let email = '';
    let password = '';
    let passwordConfirm = '';
    let errorMessage = '';

    async function handleRegister() {
        if (password !== passwordConfirm) {
            errorMessage = "Passwords don't match";
            return;
        }

        try {
            const data = {
                email: email,
                password: password,
                passwordConfirm: passwordConfirm,
            };

            const createdUser = await pb.collection('users').create(data);
            
            // Optionally, you can automatically log in the user after registration
            await pb.collection('users').authWithPassword(email, password);

            // Redirect to home page or dashboard
            goto('/');
        } catch (error) {
            console.error('Registration error:', error);
            errorMessage = error.message;
        }
    }
</script>
<form on:submit|preventDefault={handleRegister} class="max-w-md mx-auto mt-12 p-8 bg-white rounded-xl shadow-2xl space-y-6">
    <h2 class="text-3xl font-extrabold text-center text-gray-800 mb-8">Create Account</h2>
    
    <div class="relative">
      <input 
        type="email" 
        bind:value={email} 
        placeholder="Email" 
        required 
        autocomplete="email"
        class="w-full px-4 py-3 text-gray-700 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:bg-white transition-colors duration-300 peer pl-10"
      />
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2 peer-focus:text-blue-500 transition-colors duration-300" viewBox="0 0 20 20" fill="currentColor">
        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
      </svg>
    </div>
    
    <div class="relative">
      <input 
        type="password" 
        bind:value={password} 
        placeholder="Password" 
        required 
        autocomplete="new-password"
        class="w-full px-4 py-3 text-gray-700 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:bg-white transition-colors duration-300 peer pl-10"
      />
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2 peer-focus:text-blue-500 transition-colors duration-300" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd" />
      </svg>
    </div>
    
    <div class="relative">
      <input 
        type="password" 
        bind:value={passwordConfirm} 
        placeholder="Confirm Password" 
        required 
        autocomplete="new-password"
        class="w-full px-4 py-3 text-gray-700 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:bg-white transition-colors duration-300 peer pl-10"
      />
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2 peer-focus:text-blue-500 transition-colors duration-300" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
      </svg>
    </div>
    
    <button 
      type="submit" 
      class="w-full px-6 py-3 text-white bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-all duration-300 transform hover:scale-105"
    >
      Create Account
    </button>
    
    {#if errorMessage}
      <p class="mt-4 text-red-500 text-sm bg-red-100 border border-red-400 rounded-lg p-3">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 inline mr-1 text-red-500" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
        </svg>
        {errorMessage}
      </p>
    {/if}
  </form>