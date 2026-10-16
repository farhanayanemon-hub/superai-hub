<script lang="ts">
  let {
    name = '',
    modelId = '',
    size = 20,
    class: className = ''
  } = $props<{
    name?: string;
    modelId?: string;
    size?: number;
    class?: string;
  }>();

  // Deduce brand from name or modelId prefix (e.g. "meta-llama/...", "google/...", "deepseek/...")
  const resolvedBrand = $derived.by(() => {
    const raw = (name || '').toLowerCase().trim();
    if (raw) {
      if (raw.includes('gemini') || raw.includes('google')) return 'gemini';
      if (raw.includes('openrouter')) return 'openrouter';
      if (raw.includes('openai') || raw.includes('gpt') || raw.includes('chatgpt')) return 'openai';
      if (raw.includes('claude') || raw.includes('anthropic')) return 'anthropic';
      if (raw.includes('deepseek')) return 'deepseek';
      if (raw.includes('grok') || raw.includes('xai') || raw.includes('x-ai')) return 'grok';
      if (raw.includes('llama') || raw.includes('meta')) return 'meta';
      if (raw.includes('mistral')) return 'mistral';
      if (raw.includes('cohere')) return 'cohere';
      if (raw.includes('replicate') || raw.includes('flux')) return 'replicate';
      if (raw.includes('qwen') || raw.includes('alibaba')) return 'qwen';
      return raw;
    }

    const m = (modelId || '').toLowerCase().trim();
    if (m.startsWith('google/') || m.includes('gemini')) return 'gemini';
    if (m.startsWith('meta-llama/') || m.includes('llama') || m.startsWith('meta/')) return 'meta';
    if (m.startsWith('openai/') || m.includes('gpt-')) return 'openai';
    if (m.startsWith('anthropic/') || m.includes('claude')) return 'anthropic';
    if (m.startsWith('deepseek/') || m.includes('deepseek')) return 'deepseek';
    if (m.startsWith('x-ai/') || m.includes('grok')) return 'grok';
    if (m.startsWith('mistralai/') || m.includes('mistral') || m.includes('mixtral')) return 'mistral';
    if (m.startsWith('cohere/')) return 'cohere';
    if (m.startsWith('qwen/')) return 'qwen';
    if (m.includes('flux') || m.startsWith('black-forest-labs/') || m.includes('replicate')) return 'replicate';

    return 'generic';
  });
</script>

{#if resolvedBrand === 'gemini'}
  <!-- Official Google Gemini 4-Point Sparkling Star -->
  <svg
    viewBox="0 0 24 24"
    fill="none"
    width={size}
    height={size}
    class={className}
    aria-label="Google Gemini"
  >
    <path
      d="M12 2C12 7.52285 7.52285 12 2 12C7.52285 12 12 16.4771 12 22C12 16.4771 16.4771 12 22 12C16.4771 12 12 7.52285 12 2Z"
      fill="url(#gemini-gradient-{size})"
    />
    <defs>
      <linearGradient id="gemini-gradient-{size}" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
        <stop stop-color="#1BA1E3"/>
        <stop offset="0.45" stop-color="#5B73E8"/>
        <stop offset="1" stop-color="#A855F7"/>
      </linearGradient>
    </defs>
  </svg>

{:else if resolvedBrand === 'openrouter'}
  <!-- Official OpenRouter Cube Gateway Icon -->
  <svg
    viewBox="0 0 24 24"
    fill="none"
    width={size}
    height={size}
    class={className}
    aria-label="OpenRouter"
  >
    <rect width="24" height="24" rx="6" fill="#0F172A"/>
    <path d="M12 4L19 8V16L12 20L5 16V8L12 4Z" stroke="#38BDF8" stroke-width="1.8" stroke-linejoin="round"/>
    <path d="M12 4V20M5 8L19 16M19 8L5 16" stroke="#818CF8" stroke-width="1.2"/>
    <circle cx="12" cy="12" r="2.5" fill="#38CFFF"/>
  </svg>

{:else if resolvedBrand === 'openai'}
  <!-- Official OpenAI Rosette Spiral -->
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    width={size}
    height={size}
    class="{className} text-[#10A37F]"
    aria-label="OpenAI"
  >
    <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3428 7.897a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3427 7.897zm16.5976 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.4036-.6655zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.6069 1.4997-2.602-1.4997z"/>
  </svg>

{:else if resolvedBrand === 'anthropic'}
  <!-- Official Anthropic / Claude Logo -->
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    width={size}
    height={size}
    class="{className} text-[#D97757]"
    aria-label="Anthropic Claude"
  >
    <path d="M13.827 4.167h4.757L24 19.833h-4.757l-5.416-15.666zM5.416 19.833L0 4.167h4.757l3.038 8.788 3.039-8.788h4.757l-5.416 15.666H5.416z" />
  </svg>

{:else if resolvedBrand === 'deepseek'}
  <!-- Official DeepSeek Blue Whale -->
  <svg
    viewBox="0 0 24 24"
    fill="none"
    width={size}
    height={size}
    class={className}
    aria-label="DeepSeek"
  >
    <path
      d="M3.2 13.5C2.4 11.2 3.1 8.6 4.8 6.9C6.9 4.8 10.2 4.1 13 5.2C15.8 6.3 17.8 8.8 18.2 11.8C18.6 14.8 20.6 17.2 23.5 17.5C20.5 19.8 16.5 19.9 13.8 18.1C11.6 16.7 9.8 16.2 7.2 16.8C5.5 17.2 4.1 16.5 3.5 15.2L3.2 13.5Z"
      fill="#089CD0"
    />
    <circle cx="7.5" cy="10" r="1.3" fill="#FFFFFF"/>
    <path d="M12.5 12C13.8 12.3 15.2 13 16 14.2" stroke="#FFFFFF" stroke-width="1.3" stroke-linecap="round"/>
  </svg>

{:else if resolvedBrand === 'grok'}
  <!-- Official xAI Grok Mathematical Slash-X -->
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    width={size}
    height={size}
    class="{className} text-[#0F172A]"
    aria-label="xAI Grok"
  >
    <path d="M18.9 2h3.6l-7.9 9 9.3 11h-7.3l-5.7-7.2-6.5 7.2H.8l8.4-9.6L0 2h7.4l5.2 6.6L18.9 2zm-1.3 17.8h2L7.3 4.1H5.1l12.5 15.7z"/>
  </svg>

{:else if resolvedBrand === 'meta'}
  <!-- Official Meta Infinity Loop Logo -->
  <svg
    viewBox="0 0 24 24"
    fill="#0668E1"
    width={size}
    height={size}
    class={className}
    aria-label="Meta Llama"
  >
    <path d="M12 7.8c-2.3 0-4.3 1.2-5.7 3.1C5 9.1 3.2 7.8 1.1 7.8.5 7.8 0 8.3 0 8.9v6.2c0 .6.5 1.1 1.1 1.1 2.1 0 3.9-1.3 5.2-3.1 1.4 1.9 3.4 3.1 5.7 3.1s4.3-1.2 5.7-3.1c1.3 1.8 3.1 3.1 5.2 3.1.6 0 1.1-.5 1.1-1.1V8.9c0-.6-.5-1.1-1.1-1.1-2.1 0-3.9 1.3-5.2 3.1-1.4-1.9-3.4-3.1-5.7-3.1zm-8.8 6.4c-.9 0-1.6-.7-1.6-1.6v-1.2c0-.9.7-1.6 1.6-1.6 1.4 0 2.6.9 3.5 2.2-.9 1.3-2.1 2.2-3.5 2.2zm17.6 0c-1.4 0-2.6-.9-3.5-2.2.9-1.3 2.1-2.2 3.5-2.2.9 0 1.6.7 1.6 1.6v1.2c0 .9-.7 1.6-1.6 1.6zM12 14.2c-1.2 0-2.2-.9-2.7-2.2.5-1.3 1.5-2.2 2.7-2.2s2.2.9 2.7 2.2c-.5 1.3-1.5 2.2-2.7 2.2z"/>
  </svg>

{:else if resolvedBrand === 'mistral'}
  <!-- Official Mistral Orange Pixel Steps -->
  <svg
    viewBox="0 0 24 24"
    fill="#FF7000"
    width={size}
    height={size}
    class={className}
    aria-label="Mistral AI"
  >
    <rect x="3" y="3" width="3.6" height="3.6" rx="0.5" />
    <rect x="17.4" y="3" width="3.6" height="3.6" rx="0.5" />
    <rect x="3" y="7.8" width="3.6" height="3.6" rx="0.5" />
    <rect x="7.8" y="7.8" width="3.6" height="3.6" rx="0.5" />
    <rect x="12.6" y="7.8" width="3.6" height="3.6" rx="0.5" />
    <rect x="17.4" y="7.8" width="3.6" height="3.6" rx="0.5" />
    <rect x="3" y="12.6" width="3.6" height="3.6" rx="0.5" />
    <rect x="10.2" y="12.6" width="3.6" height="3.6" rx="0.5" />
    <rect x="17.4" y="12.6" width="3.6" height="3.6" rx="0.5" />
    <rect x="3" y="17.4" width="3.6" height="3.6" rx="0.5" />
    <rect x="17.4" y="17.4" width="3.6" height="3.6" rx="0.5" />
  </svg>

{:else if resolvedBrand === 'cohere'}
  <!-- Official Cohere Organic Shape -->
  <svg
    viewBox="0 0 24 24"
    fill="none"
    width={size}
    height={size}
    class={className}
    aria-label="Cohere"
  >
    <circle cx="8" cy="8" r="5" fill="#D4806A"/>
    <circle cx="15.5" cy="14" r="5.5" fill="#39594D"/>
    <circle cx="7" cy="16" r="4" fill="#C2D2B0"/>
  </svg>

{:else if resolvedBrand === 'qwen'}
  <!-- Official Qwen Prism -->
  <svg
    viewBox="0 0 24 24"
    fill="none"
    width={size}
    height={size}
    class={className}
    aria-label="Qwen"
  >
    <path d="M12 2L20.5 7V17L12 22L3.5 17V7L12 2Z" stroke="#6366F1" stroke-width="1.8" fill="none"/>
    <path d="M12 6L17 9V15L12 18L7 15V9L12 6Z" fill="#818CF8"/>
  </svg>

{:else if resolvedBrand === 'replicate'}
  <!-- Official Replicate Stepped Blocks -->
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    width={size}
    height={size}
    class="{className} text-[#1677FF]"
    aria-label="Replicate"
  >
    <path d="M3 4h18v3.5H3V4zm0 6.5h11V14H3v-3.5zm0 6.5h6.5v3.5H3V17z" />
  </svg>

{:else}
  <!-- Generic High-Tech AI Chip Fallback -->
  <svg
    viewBox="0 0 24 24"
    fill="none"
    width={size}
    height={size}
    class="{className} text-[#1677FF]"
    stroke="currentColor"
    stroke-width="1.8"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-label="AI Model"
  >
    <rect x="4" y="4" width="16" height="16" rx="2" />
    <rect x="9" y="9" width="6" height="6" />
    <path d="M9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 14h3M1 9h3M1 14h3" />
  </svg>
{/if}
