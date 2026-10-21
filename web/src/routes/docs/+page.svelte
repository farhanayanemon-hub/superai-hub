<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';

  onMount(() => {
    goto('/docs/channels');
  });
</script>

<div class="min-h-screen flex items-center justify-center font-['Poppins',sans-serif] bg-white">
  <div class="text-center space-y-3">
    <div class="w-8 h-8 border-2 border-[#1677FF] border-t-transparent rounded-full animate-spin mx-auto"></div>
    <p class="text-sm font-medium text-[#4B6382]">Redirecting to Documentation...</p>
    <a href="/docs/channels" class="text-xs font-semibold text-[#1677FF] underline">Click here if not redirected</a>
  </div>
</div>
