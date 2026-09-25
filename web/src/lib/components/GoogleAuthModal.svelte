<script lang="ts">
  import Icon from '$lib/components/Icon.svelte';
  import { loginWithGoogle, type GoogleAuthPayload } from '$lib/stores/userStore';

  let { isOpen = $bindable(false), onSuccess } = $props<{
    isOpen: boolean;
    onSuccess: () => void;
  }>();

  let googleEmail = $state('');
  let googleName = $state('');
  let isSubmitting = $state(false);
  let error = $state('');

  function handleClose() {
    isOpen = false;
    error = '';
  }

  async function handleSubmit(e: Event) {
    e.preventDefault();
    if (!googleEmail || !googleEmail.includes('@')) {
      error = 'Please enter a valid Google email address.';
      return;
    }

    isSubmitting = true;
    error = '';

    try {
      const derivedName = googleName.trim() || googleEmail.split('@')[0];
      const payload: GoogleAuthPayload = {
        email: googleEmail.trim().toLowerCase(),
        name: derivedName.charAt(0).toUpperCase() + derivedName.slice(1),
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(derivedName)}&background=4285F4&color=fff`
      };

      const res = await loginWithGoogle(payload);
      if (res.success) {
        isOpen = false;
        onSuccess();
      } else {
        error = res.error || 'Failed to authenticate Google account.';
      }
    } catch (err: any) {
      error = err.message || 'An error occurred during authentication.';
    } finally {
      isSubmitting = false;
    }
  }
</script>

{#if isOpen}
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
    <!-- Modal Dialog -->
    <div
      class="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-7 shadow-2xl relative text-left"
      role="dialog"
      aria-modal="true"
    >
      <!-- Close Button -->
      <button
        onclick={handleClose}
        class="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        aria-label="Close dialog"
      >
        <Icon name="X" size={18} />
      </button>

      <!-- Google Branding Header -->
      <div class="flex items-center gap-3 mb-4">
        <div class="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-md">
          <svg class="w-6 h-6" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
          </svg>
        </div>
        <div>
          <h3 class="text-base font-bold text-white">Continue with Google</h3>
          <p class="text-xs text-slate-400">Sign in with your Google account</p>
        </div>
      </div>

      <!-- Developer Info Banner -->
      <div class="mb-4 p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs">
        <p class="font-semibold mb-1 flex items-center gap-1.5">
          <Icon name="Sparkles" size={14} />
          <span>Google OAuth Setup Notice:</span>
        </p>
        <p class="text-slate-300 leading-relaxed text-[11px]">
          To enable the automatic Google pop-up picker, configure <code class="bg-blue-950/60 px-1 py-0.5 rounded text-blue-200">PUBLIC_GOOGLE_CLIENT_ID</code> in <code class="bg-blue-950/60 px-1 py-0.5 rounded text-blue-200">web/.env</code>.
        </p>
      </div>

      {#if error}
        <div class="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
          <Icon name="AlertCircle" size={16} />
          <span>{error}</span>
        </div>
      {/if}

      <!-- Form for Google Sign In -->
      <form onsubmit={handleSubmit} class="space-y-3.5">
        <div>
          <label for="google-email" class="block text-xs font-semibold text-slate-300 mb-1.5">Your Google Account Email</label>
          <input
            id="google-email"
            type="email"
            bind:value={googleEmail}
            required
            placeholder="your.name@gmail.com"
            class="w-full bg-slate-950/70 border border-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition-all"
          />
        </div>

        <div>
          <label for="google-name" class="block text-xs font-semibold text-slate-300 mb-1.5">Your Name (Optional)</label>
          <input
            id="google-name"
            type="text"
            bind:value={googleName}
            placeholder="e.g. Farhan Ayan"
            class="w-full bg-slate-950/70 border border-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition-all"
          />
        </div>

        <div class="pt-2 flex items-center gap-3">
          <button
            type="button"
            onclick={handleClose}
            class="w-1/3 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            class="w-2/3 py-2.5 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer disabled:opacity-50"
          >
            {#if isSubmitting}
              <div class="w-3.5 h-3.5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
              <span>Connecting...</span>
            {:else}
              <span>Sign In with Google</span>
              <Icon name="ArrowRight" size={14} />
            {/if}
          </button>
        </div>
      </form>
    </div>
  </div>
{/if}
