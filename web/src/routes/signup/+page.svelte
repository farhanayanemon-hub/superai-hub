<script lang="ts">
  import Icon from '$lib/components/Icon.svelte';
  import {
    signupWithEmail,
    loginOrCreateWithGoogle,
    checkUserExists,
    isAuthenticated,
    currentUser
  } from '$lib/stores/userStore';
  import { goto } from '$app/navigation';
  import { onMount, onDestroy } from 'svelte';

  // Step state: 'form' -> 'otp'
  let step = $state<'form' | 'otp'>('form');

  // Form fields
  let name = $state('');
  let email = $state('');
  let password = $state('');
  let confirmPassword = $state('');
  let showPassword = $state(false);
  let agreeTerms = $state(true);

  // OTP state
  let otpCode = $state('');
  let otpVerifying = $state(false);
  let otpSending = $state(false);
  let otpNotice = $state('');
  let resendCountdown = $state(60);
  let countdownTimer: any = null;

  // General loading & errors
  let isLoading = $state(false);
  let errorMessage = $state('');

  onMount(() => {
    if ($isAuthenticated) {
      if ($currentUser?.isSubscribed) {
        goto('/dashboard');
      } else {
        goto('/plans');
      }
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

  onDestroy(() => {
    if (countdownTimer) clearInterval(countdownTimer);
  });

  function startResendCountdown() {
    resendCountdown = 60;
    if (countdownTimer) clearInterval(countdownTimer);
    countdownTimer = setInterval(() => {
      if (resendCountdown > 0) {
        resendCountdown--;
      } else {
        clearInterval(countdownTimer);
      }
    }, 1000);
  }

  async function handleEmailSignup(e: Event) {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password || !confirmPassword) {
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

    if (checkUserExists(email.trim())) {
      errorMessage = 'An account with this email already exists. Please sign in instead.';
      return;
    }

    isLoading = true;
    errorMessage = '';
    otpNotice = '';

    try {
      // Trigger 6-Digit Email OTP
      const res = await fetch('/api/auth/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          name: name.trim(),
          action: 'signup'
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        errorMessage = data.error || 'Failed to send verification code. Please try again.';
        return;
      }

      step = 'otp';
      startResendCountdown();
      if (data.debugCode) {
        otpNotice = `Test Mode: Your verification code is ${data.debugCode}`;
      }
    } catch (err: any) {
      errorMessage = err.message || 'An unexpected error occurred.';
    } finally {
      isLoading = false;
    }
  }

  async function handleVerifyOtp(e: Event) {
    e.preventDefault();
    if (!otpCode.trim() || otpCode.trim().length < 6) {
      errorMessage = 'Please enter the complete 6-digit verification code.';
      return;
    }

    otpVerifying = true;
    errorMessage = '';

    try {
      // 1. Verify OTP with backend
      const res = await fetch('/api/auth/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          code: otpCode.trim(),
          action: 'signup'
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        errorMessage = data.error || 'Invalid verification code.';
        return;
      }

      // 2. Code verified! Create account in user store
      const signupRes = await signupWithEmail(name.trim(), email.trim(), password);
      if (signupRes.success) {
        // Redirect to /plans paywall gate
        goto('/plans');
      } else {
        errorMessage = signupRes.error || 'Registration failed. Please try again.';
      }
    } catch (err: any) {
      errorMessage = err.message || 'Failed to verify code.';
    } finally {
      otpVerifying = false;
    }
  }

  async function handleResendOtp() {
    if (resendCountdown > 0 || otpSending) return;
    otpSending = true;
    errorMessage = '';
    otpNotice = '';

    try {
      const res = await fetch('/api/auth/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          name: name.trim(),
          action: 'signup'
        })
      });

      const data = await res.json();
      if (data.success) {
        startResendCountdown();
        if (data.debugCode) {
          otpNotice = `Test Mode: Your new verification code is ${data.debugCode}`;
        } else {
          otpNotice = 'New code sent! Please check your email.';
        }
      } else {
        errorMessage = data.error || 'Failed to resend verification code.';
      }
    } catch (err: any) {
      errorMessage = err.message || 'Network error.';
    } finally {
      otpSending = false;
    }
  }

  const GOOGLE_CLIENT_ID = import.meta.env.PUBLIC_GOOGLE_CLIENT_ID || '471395556203-1ovc836o66irvc58nk2isc4kadnimp8u.apps.googleusercontent.com';

  async function ensureGoogleGisLoaded(): Promise<boolean> {
    if (typeof window === 'undefined') return false;
    if ((window as any).google?.accounts?.oauth2) return true;

    return new Promise((resolve) => {
      let script = document.querySelector('script[src="https://accounts.google.com/gsi/client"]') as HTMLScriptElement;
      if (!script) {
        script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);
      }
      script.addEventListener('load', () => resolve(true), { once: true });
      script.addEventListener('error', () => resolve(false), { once: true });
      setTimeout(() => {
        resolve(!!(window as any).google?.accounts?.oauth2);
      }, 1500);
    });
  }

  async function handleGoogleSignup() {
    errorMessage = '';
    const isReady = await ensureGoogleGisLoaded();

    if (!isReady || typeof window === 'undefined' || !(window as any).google?.accounts?.oauth2) {
      errorMessage = 'Unable to reach Google Sign-In service. Please check your connection and try again.';
      return;
    }

    try {
      isLoading = true;
      const tokenClient = (window as any).google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CLIENT_ID,
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
              if (res.user?.isSubscribed) {
                goto('/dashboard');
              } else {
                goto('/plans');
              }
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
    } catch (e: any) {
      isLoading = false;
      errorMessage = e.message || 'Google Sign-Up error.';
    }
  }
</script>

<svelte:head>
  <title>Create Account • EzboAgents</title>
  <meta name="description" content="Create your EzboAgents account to unlock 50+ specialized AI executives and your private encrypted WhatsApp assistant." />
</svelte:head>

<div class="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden font-sans selection:bg-blue-600 selection:text-white">
  <!-- Background Ambient Spotlights -->
  <div class="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[320px] bg-blue-500/10 blur-[130px] pointer-events-none rounded-full"></div>
  <div class="absolute bottom-1/4 left-1/4 w-[320px] h-[260px] bg-indigo-500/5 blur-[100px] pointer-events-none rounded-full"></div>

  <!-- Header / Logo -->
  <div class="mb-8 text-center relative z-10">
    <a href="/" class="inline-flex items-center gap-2.5 group">
      <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black shadow-lg shadow-blue-500/25 group-hover:scale-105 transition-transform">
        <Icon name="Sparkles" size={20} />
      </div>
      <span class="font-extrabold text-2xl tracking-tight text-slate-900">
        Ezbo<span class="text-blue-600">Agents</span>
      </span>
    </a>
    <p class="text-xs text-slate-500 mt-2 font-medium">Deploy your private executive AI consortium</p>
  </div>

  <!-- Auth Card -->
  <div class="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/50 relative z-10">
    {#if step === 'form'}
      <!-- STEP 1: REGISTRATION FORM -->
      <h1 class="text-xl sm:text-2xl font-bold text-slate-900 mb-2 text-center">Create Your Account</h1>
      <p class="text-xs text-slate-500 text-center mb-6">Unlock 50+ specialists, WhatsApp engine, and zero-markup BYOK</p>

      {#if errorMessage}
        <div class="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <Icon name="AlertCircle" size={16} class="shrink-0" />
          <span>{errorMessage}</span>
        </div>
      {/if}

      <!-- Google Sign Up Button -->
      <button
        type="button"
        onclick={handleGoogleSignup}
        disabled={isLoading}
        class="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 hover:border-blue-400 text-slate-700 font-semibold text-sm flex items-center justify-center gap-3 transition-all hover:shadow-sm cursor-pointer disabled:opacity-50"
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
        <div class="absolute inset-0 flex items-center"><div class="w-full border-t border-slate-200"></div></div>
        <span class="relative px-3 bg-white text-[11px] font-semibold tracking-wider text-slate-400 uppercase">Or with email</span>
      </div>

      <!-- Registration Form -->
      <form onsubmit={handleEmailSignup} class="space-y-4">
        <div>
          <label for="signup-name" class="block text-xs font-semibold text-slate-700 mb-1.5">Full Name</label>
          <input
            id="signup-name"
            type="text"
            bind:value={name}
            required
            placeholder="Farhan Ayan"
            class="w-full bg-slate-50 border border-slate-200 focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-100 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all"
          />
        </div>

        <div>
          <label for="signup-email" class="block text-xs font-semibold text-slate-700 mb-1.5">Email Address</label>
          <input
            id="signup-email"
            type="email"
            bind:value={email}
            required
            placeholder="you@domain.com"
            class="w-full bg-slate-50 border border-slate-200 focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-100 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all"
          />
        </div>

        <div>
          <label for="signup-password" class="block text-xs font-semibold text-slate-700 mb-1.5">Password</label>
          <div class="relative">
            <input
              id="signup-password"
              type={showPassword ? 'text' : 'password'}
              bind:value={password}
              required
              minlength="6"
              placeholder="At least 6 characters"
              class="w-full bg-slate-50 border border-slate-200 focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-100 rounded-xl px-3.5 py-2.5 pr-10 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all"
            />
            <button
              type="button"
              onclick={() => (showPassword = !showPassword)}
              class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer p-1"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              <Icon name={showPassword ? 'EyeOff' : 'Eye'} size={16} />
            </button>
          </div>
        </div>

        <div>
          <label for="signup-confirm-password" class="block text-xs font-semibold text-slate-700 mb-1.5">Confirm Password</label>
          <div class="relative">
            <input
              id="signup-confirm-password"
              type={showPassword ? 'text' : 'password'}
              bind:value={confirmPassword}
              required
              minlength="6"
              placeholder="Repeat password"
              class="w-full bg-slate-50 border border-slate-200 focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-100 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all"
            />
          </div>
        </div>

        <div class="flex items-start gap-2 pt-1">
          <input
            type="checkbox"
            id="terms"
            bind:checked={agreeTerms}
            class="mt-1 rounded bg-white border-slate-300 text-blue-600 focus:ring-blue-500"
          />
          <label for="terms" class="text-[11px] text-slate-500 leading-snug">
            I agree to the <span class="text-blue-600 font-medium hover:underline cursor-pointer">Terms of Service</span> and <span class="text-blue-600 font-medium hover:underline cursor-pointer">Privacy Policy</span>.
          </label>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          class="w-full py-3 px-4 rounded-xl blue-btn text-white font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2 shadow-md shadow-blue-500/20"
        >
          {#if isLoading}
            <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>Sending verification code...</span>
          {:else}
            <span>Send Verification Code</span>
            <Icon name="ArrowRight" size={16} />
          {/if}
        </button>
      </form>

      <!-- Sign In Link -->
      <p class="text-xs text-slate-500 text-center mt-6">
        Already have an account?
        <a href="/login" class="text-blue-600 font-bold hover:underline ml-1">Client Sign In</a>
      </p>

    {:else}
      <!-- STEP 2: 6-DIGIT EMAIL OTP VERIFICATION -->
      <div class="text-center space-y-4">
        <div class="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center mx-auto shadow-md shadow-blue-500/10">
          <Icon name="Mail" size={26} />
        </div>

        <div>
          <h2 class="text-xl font-bold text-slate-900">Verify Your Email</h2>
          <p class="text-xs text-slate-500 mt-1">
            We've sent a 6-digit verification code to
          </p>
          <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold mt-2">
            <span>{email}</span>
          </div>
        </div>

        {#if otpNotice}
          <div class="p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 text-xs font-medium text-left">
            {otpNotice}
          </div>
        {/if}

        {#if errorMessage}
          <div class="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 text-left">
            <Icon name="AlertCircle" size={16} class="shrink-0" />
            <span>{errorMessage}</span>
          </div>
        {/if}

        <form onsubmit={handleVerifyOtp} class="space-y-4 pt-2">
          <div>
            <label for="otp-code" class="block text-xs font-semibold text-slate-700 mb-2">Enter 6-Digit Code</label>
            <input
              id="otp-code"
              type="text"
              inputmode="numeric"
              pattern="[0-9]*"
              maxlength="6"
              bind:value={otpCode}
              required
              placeholder="••••••"
              class="w-full bg-slate-50 border border-slate-200 focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-100 rounded-2xl px-4 py-3 text-center text-2xl font-mono font-bold tracking-[8px] text-slate-900 placeholder-slate-300 outline-none transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={otpVerifying || otpCode.length < 6}
            class="w-full py-3.5 px-4 rounded-xl blue-btn text-white font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shadow-md shadow-blue-500/20"
          >
            {#if otpVerifying}
              <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Verifying code...</span>
            {:else}
              <Icon name="CheckCircle2" size={16} />
              <span>Verify & Continue to Plans</span>
            {/if}
          </button>
        </form>

        <div class="pt-3 flex flex-col items-center gap-2 text-xs">
          {#if resendCountdown > 0}
            <span class="text-slate-400">
              Resend code in <strong class="text-slate-600">{resendCountdown}s</strong>
            </span>
          {:else}
            <button
              type="button"
              onclick={handleResendOtp}
              disabled={otpSending}
              class="text-blue-600 hover:text-blue-700 font-bold transition-colors cursor-pointer flex items-center gap-1.5"
            >
              {#if otpSending}
                <div class="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <span>Sending new code...</span>
              {:else}
                <Icon name="RefreshCw" size={12} />
                <span>Resend 6-Digit Code</span>
              {/if}
            </button>
          {/if}

          <button
            type="button"
            onclick={() => { step = 'form'; errorMessage = ''; otpNotice = ''; }}
            class="text-slate-500 hover:text-slate-800 transition-colors mt-2 text-[11px] underline cursor-pointer"
          >
            ← Change email or edit details
          </button>
        </div>
      </div>
    {/if}
  </div>

  <!-- Footer link back -->
  <div class="mt-8 text-center text-xs text-slate-500">
    <a href="/" class="hover:text-slate-800 transition-colors inline-flex items-center gap-1.5 font-medium">
      <Icon name="ChevronLeft" size={14} />
      <span>Back to Homepage</span>
    </a>
  </div>
</div>
