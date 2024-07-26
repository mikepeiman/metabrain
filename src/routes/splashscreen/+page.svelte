<script lang="ts">
    import type { PageData } from './$types';
    
    export let data: PageData;
</script>

<div class="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 ">
    <div class="text-center">
      <img src="images/metabrain-logo.svg" alt="Metabrain Logo" class="w-64 h-64 mx-auto mb-8 animate-pulse">
      <h1 class="text-5xl font-bold mb-4 tracking-wide animate-fade-in-up">Metabrain</h1>
      <p class="text-xl animate-fade-in-up animation-delay-300">Your Operating System For Life</p>
    </div>
  </div>
  
  <style>
    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  
    .animate-fade-in-up {
      animation: fadeInUp 0.6s ease-out forwards;
    }
  
    .animation-delay-300 {
      animation-delay: 300ms;
    }
  
    @keyframes pulse {
      0%, 100% {
        opacity: 1;
      }
      50% {
        opacity: 0.7;
      }
    }
  
    .animate-pulse {
      animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }
  </style>