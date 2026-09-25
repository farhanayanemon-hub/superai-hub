<script lang="ts">
  import Icon from '$lib/components/Icon.svelte';
  import { loginOrCreateWithGoogle, checkUserExists } from '$lib/stores/userStore';

  let { isOpen = $bindable(false), initialEmail = '', onSuccess } = $props<{
    isOpen: boolean;
    initialEmail?: string;
    onSuccess: () => void;
  }>();

  let googleEmail = $state('');
  let googleName = $state('');
  let password = $state('');
  let showPassword = $state(false);
  let isExistingUser = $state(false);
  let isSubmitting = $state(false);
  let error = $state('');

  $effect(() => {
    if (isOpen) {
      googleEmail = initialEmail || googleEmail;
      checkEmailState();
    }
  });

  function checkEmailState() {
    error = '';
    const clean = googleEmail.trim().toLowerCase();
    if (clean && clean.includes('@')) {
      isExistingUser = checkUserExists(clean);
      if (!googleName) {
        googleName = clean.split('@')[0];
      }
    } else {
      isExistingUser = false;
    }
  }

  function handleClose() {
    isOpen = false;
    error = '';
    password = '';
  }

  async function handleSubmit(e: Event) {
    e.preventDefault();
    const cleanEmail = googleEmail.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      error = 'Please enter a valid Gmail address.';
      return;
    }

    if (!isExistingUser && password && password.length < 6) {
      error = 'Password must be at least 6 characters long.';
      return;
    }

    isSubmitting = true;
    error = '';

    try {
      const derivedName = googleName.trim() || cleanEmail.split('@')[0];
      const res = await loginOrCreateWithGoogle({
        email: cleanEmail,
        name: derivedName.charAt(0).toUpperCase() + derivedName.slice(1),
        password: password || undefined
      });

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
    <!-- Modal Card -->
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

      <!-- Google Header -->
      <div class="flex items-center gap-3 mb-5">
        <div class="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-md shrink-0">
          <svg class="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
          </svg>
        </div>
        <div>
          <h3 class="text-base font-bold text-white">Sign In with Google</h3>
          <p class="text-xs text-slate-400">Direct instant access with your Gmail</p>
        </div>
      </div>

      {#if error}
        <div class="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
          <Icon name="AlertCircle" size={16} />
          <span>{error}</span>
        </div>
      {/if}

      <!-- Form for Google Sign In / Account Setup -->
      <form onsubmit={handleSubmit} class="space-y-4">
        <div>
          <label for="google-modal-email" class="block text-xs font-semibold text-slate-300 mb-1.5">
            Your Gmail Address
          </label>
          <input
            id="google-modal-email"
            type="email"
            bind:value={googleEmail}
            oninput={checkEmailState}
            required
            placeholder="you@gmail.com"
            class="w-full bg-slate-950/70 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition-all"
          />
        </div>

        {#if googleEmail && googleEmail.includes('@')}
          {#if isExistingUser}
            <!-- Existing Account Detected: Direct 1-Click Login -->
            <div class="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-xs flex items-center gap-2">
              <Icon name="CheckCircle2" size={16} class="shrink-0" />
              <span>Welcome back! Account found for this Gmail. Click below for direct login.</span>
            </div>
          {:else}
            <!-- New User: Option to set a password -->
            <div class="space-y-3.5 pt-1 border-t border-slate-800/60">
              <div class="flex items-center gap-2 text-xs text-emerald-400 font-semibold">
                <Icon name="Sparkles" size={14} />
                <span>New Account Creation</span>
              </div>

              <div>
                <label for="google-modal-name" class="block text-xs font-semibold text-slate-300 mb-1.5">
                  Your Full Name
                </label>
                <input
                  id="google-modal-name"
                  type="text"
                  bind:value={googleName}
                  placeholder="e.g. Farhan Ayan"
                  class="w-full bg-slate-950/70 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition-all"
                />
              </div>

              <div>
                <div class="flex items-center justify-between mb-1.5">
                  <label for="google-modal-password" class="block text-xs font-semibold text-slate-300">
                    Set a Password <span class="text-slate-400 font-normal">(Optional / Recommended)</span>
                  </label>
                </div>
                <div class="relative">
                  <input
                    id="google-modal-password"
                    type={showPassword ? 'text' : 'password'}
                    bind:value={password}
                    minlength="6"
                    placeholder="Create a password (min 6 characters)"
                    class="w-full bg-slate-950/70 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl px-3.5 py-2.5 pr-10 text-sm text-white placeholder-slate-500 outline-none transition-all"
                  />
                  <button
                    type="button"
                    onclick={() => (showPassword = !showPassword)}
                    class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors cursor-pointer p-1"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    <Icon name={showPassword ? 'EyeOff' : 'Eye'} size={16} />
                  </button>
                </div>
                <p class="text-[11px] text-slate-400 mt-1">
                  Setting a password allows you to log in with both Google and email/password anytime.
                </p>
              </div>
            </div>
          {/if}
        {/if}

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
            class="w-2/3 py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-500/20 cursor-pointer disabled:opacity-50"
          >
            {#if isSubmitting}
              <div class="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
              <span>Connecting...</span>
            {:else}
              <span>{isExistingUser ? 'Direct Login with Google' : (password ? 'Create Account & Save Password' : 'Continue to Dashboard')}</span>
              <Icon name="ArrowRight" size={14} />
            {/if}
          </button>
        </div>
      </form>
    </div>
  </div>
{/if}
