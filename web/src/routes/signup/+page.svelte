<script lang="ts">
  import Icon from '$lib/components/Icon.svelte';
  import GoogleAuthModal from '$lib/components/GoogleAuthModal.svelte';
  import {
    signupWithEmail,
    loginWithGoogle,
    loginOrCreateWithGoogle,
    checkUserExists,
    isAuthenticated
  } from '$lib/stores/userStore';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';

  let name = $state('');
  let email = $state('');
  let password = $state('');
  let confirmPassword = $state('');
  let showPassword = $state(false);
  let agreeTerms = $state(true);
  let isLoading = $state(false);
  let errorMessage = $state('');

  // Google Modal State
  let isGoogleModalOpen = $state(false);

  onMount(() => {
    if ($isAuthenticated) {
      goto('/dashboard');
    }

    const clientId = import.meta.env.PUBLIC_GOOGLE_CLIENT_ID;
    if (clientId && typeof window !== 'undefined') {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }
  });

  async function handleEmailSignup(e: Event) {
    e.preventDefault();
    if (!name || !email || !password || !confirmPassword) {
      errorMessage = 'Please fill out all fields.';
      return;
    }

    if (password.length < 6) {
      errorMessage = 'Password must be at least 6 characters long.';
      return;
    }

    if (password !== confirmPassword) {
      errorMessage = 'Passwords do not match. Please verify both entries.';
      return;
    }

    if (!agreeTerms) {
      errorMessage = 'Please accept the terms and conditions to proceed.';
      return;
    }

    isLoading = true;
    errorMessage = '';

    try {
      const res = await signupWithEmail(name, email, password);
      if (res.success) {
        goto('/dashboard');
      } else {
        errorMessage = res.error || 'Registration failed. Please try again.';
      }
    } catch (err: any) {
      errorMessage = err.message || 'An unexpected error occurred.';
    } finally {
      isLoading = false;
    }
  }

  async function handleGoogleSignup() {
    errorMessage = '';
    const cleanEmail = email.trim().toLowerCase();

    // Direct Login optimization: If user already entered an existing email, log in directly!
    if (cleanEmail && cleanEmail.includes('@') && checkUserExists(cleanEmail)) {
      isLoading = true;
      try {
        const res = await loginOrCreateWithGoogle({ email: cleanEmail });
        if (res.success) {
          goto('/dashboard');
          return;
        }
      } catch (err: any) {
        errorMessage = err.message || 'Direct login failed.';
      } finally {
        isLoading = false;
      }
    }

    const clientId = import.meta.env.PUBLIC_GOOGLE_CLIENT_ID;

    if (clientId && typeof window !== 'undefined' && (window as any).google?.accounts?.oauth2) {
      try {
        isLoading = true;
        const tokenClient = (window as any).google.accounts.oauth2.initTokenClient({
          client_id: clientId,
          scope: 'email profile openid',
          callback: async (tokenResponse: any) => {
            if (tokenResponse.error) {
              errorMessage = 'Google authorization was cancelled.';
              isLoading = false;
              return;
            }
            try {
              const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
              });
              const data = await userInfoRes.json();
              const res = await loginOrCreateWithGoogle({
                email: data.email,
                name: data.name || data.given_name,
                avatar: data.picture,
                sub: data.sub
              });
              if (res.success) {
                goto('/dashboard');
              } else {
                errorMessage = res.error || 'Google signup failed.';
              }
            } catch (err: any) {
              errorMessage = err.message || 'Failed to retrieve Google profile.';
            } finally {
              isLoading = false;
            }
          }
        });
        tokenClient.requestAccessToken();
        return;
      } catch (e) {
        isLoading = false;
      }
    }

    isGoogleModalOpen = true;
  }
</script>

<svelte:head>
  <title>Sign Up - SuperAI Hub (ezboagents.com)</title>
  <meta name="description" content="Create your free SuperAI Hub account to unlock 50+ specialized AI tools and your personal WhatsApp assistant." />
</svelte:head>

<div class="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden font-sans selection:bg-emerald-500 selection:text-slate-950">
  <!-- Background Glow Gradients -->
  <div class="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-emerald-500/10 blur-[120px] pointer-events-none rounded-full"></div>
  <div class="absolute bottom-1/4 left-1/4 w-[300px] h-[250px] bg-teal-500/10 blur-[100px] pointer-events-none rounded-full"></div>

  <!-- Header / Logo -->
  <div class="mb-8 text-center relative z-10">
    <a href="/" class="inline-flex items-center gap-2.5 group">
      <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
        <Icon name="Sparkles" size={20} />
      </div>
      <span class="font-extrabold text-2xl tracking-tight text-white">
        Super<span class="text-emerald-400">AI</span> Hub
      </span>
    </a>
    <p class="text-xs text-slate-400 mt-2">Start your AI assistant journey today</p>
  </div>

  <!-- Auth Card -->
  <div class="w-full max-w-md bg-slate-900/80 border border-slate-800/80 rounded-2xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl relative z-10">
    <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-semibold mb-3 mx-auto w-fit">
      <Icon name="Gift" size={13} />
      <span>75% Off Launch Special Active</span>
    </div>

    <h1 class="text-xl sm:text-2xl font-bold text-white mb-2 text-center">Create Your Account</h1>
    <p class="text-xs text-slate-400 text-center mb-6">Unlock 50+ tools, WhatsApp assistant, and BYOK Gemini access</p>

    {#if errorMessage}
      <div class="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
        <Icon name="AlertCircle" size={16} />
        <span>{errorMessage}</span>
      </div>
    {/if}

    <!-- Google Sign Up Button -->
    <button
      type="button"
      onclick={handleGoogleSignup}
      disabled={isLoading}
      class="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-white font-medium text-sm flex items-center justify-center gap-3 transition-all hover:shadow-md cursor-pointer disabled:opacity-50"
    >
      <svg class="w-4 h-4" viewBox="0 0 24 24">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
      </svg>
      <span>Sign up with Google</span>
    </button>

    <!-- Divider -->
    <div class="relative my-6 text-center">
      <div class="absolute inset-0 flex items-center"><div class="w-full border-t border-slate-800"></div></div>
      <span class="relative px-3 bg-slate-900 text-[11px] font-semibold tracking-wider text-slate-500 uppercase">Or with email</span>
    </div>

    <!-- Registration Form -->
    <form onsubmit={handleEmailSignup} class="space-y-4">
      <div>
        <label for="signup-name" class="block text-xs font-semibold text-slate-300 mb-1.5">Full Name</label>
        <input
          id="signup-name"
          type="text"
          bind:value={name}
          required
          placeholder="Farhan Ayan"
          class="w-full bg-slate-950/70 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition-all"
        />
      </div>

      <div>
        <label for="signup-email" class="block text-xs font-semibold text-slate-300 mb-1.5">Email Address</label>
        <input
          id="signup-email"
          type="email"
          bind:value={email}
          required
          placeholder="you@domain.com"
          class="w-full bg-slate-950/70 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition-all"
        />
      </div>

      <div>
        <label for="signup-password" class="block text-xs font-semibold text-slate-300 mb-1.5">Password</label>
        <div class="relative">
          <input
            id="signup-password"
            type={showPassword ? 'text' : 'password'}
            bind:value={password}
            required
            minlength="6"
            placeholder="At least 6 characters"
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
      </div>

      <div>
        <label for="signup-confirm-password" class="block text-xs font-semibold text-slate-300 mb-1.5">Confirm Password</label>
        <div class="relative">
          <input
            id="signup-confirm-password"
            type={showPassword ? 'text' : 'password'}
            bind:value={confirmPassword}
            required
            minlength="6"
            placeholder="Repeat password"
            class="w-full bg-slate-950/70 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition-all"
          />
        </div>
      </div>

      <div class="flex items-start gap-2 pt-1">
        <input
          type="checkbox"
          id="terms"
          bind:checked={agreeTerms}
          class="mt-1 rounded bg-slate-950 border-slate-800 text-emerald-500 focus:ring-emerald-500"
        />
        <label for="terms" class="text-[11px] text-slate-400 leading-snug">
          I agree to the <span class="text-white hover:underline cursor-pointer">Terms of Service</span> and <span class="text-white hover:underline cursor-pointer">Privacy Policy</span>.
        </label>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        class="w-full py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition-all shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
      >
        {#if isLoading}
          <div class="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
          <span>Creating account...</span>
        {:else}
          <span>Create Account & Continue</span>
          <Icon name="ArrowRight" size={16} />
        {/if}
      </button>
    </form>

    <!-- Sign In Link -->
    <p class="text-xs text-slate-400 text-center mt-6">
      Already have an account?
      <a href="/login" class="text-emerald-400 font-semibold hover:underline ml-1">Log In</a>
    </p>
  </div>

  <!-- Footer link back -->
  <div class="mt-8 text-center text-xs text-slate-500">
    <a href="/" class="hover:text-slate-300 transition-colors inline-flex items-center gap-1.5">
      <Icon name="ChevronLeft" size={14} />
      <span>Back to Homepage</span>
    </a>
  </div>
</div>

<!-- Google Sign In Modal -->
<GoogleAuthModal
  bind:isOpen={isGoogleModalOpen}
  initialEmail={email}
  onSuccess={() => goto('/dashboard')}
/>
