<script lang="ts">
  import { AGENTS, CATEGORIES } from './agents';
  import { createRobot, ROBOT_DEFS, type AgentConfig } from './createRobot';
  import './robots.css';

  export type Agent = AgentConfig;

  interface Props {
    ceoSrc?: string;
    signupUrl?: string;
    defaultCategory?: string;
    studioUrl?: ((agent: Agent) => string) | string;
  }

  let {
    ceoSrc = '/ezbo-ceo.png',
    signupUrl = '/signup',
    defaultCategory = 'all',
    studioUrl
  }: Props = $props();

  // svelte-ignore state_referenced_locally
  let cat = $state(defaultCategory);
  let active = $state<{ agent: Agent; el: HTMLElement } | null>(null);

  let wrapEl = $state<HTMLElement | null>(null);
  let gridEl = $state<HTMLElement | null>(null);
  let bubEl = $state<HTMLElement | null>(null);

  // Pre-render every robot SVG once
  const svgs: Record<number, string> = Object.fromEntries(
    AGENTS.map((a: Agent) => [a.n, createRobot(a)])
  );

  export interface DeptMeta {
    key: string;
    badge: string;
    title: string;
    shortTitle: string;
    tagline: string;
    description: string;
    icon: string;
    gradient: string;
    accentColor: string;
    badgeClass: string;
    glowClass: string;
    highlights: string[];
  }

  export const DEPARTMENTS: Record<string, DeptMeta> = {
    ads: {
      key: 'ads',
      badge: 'Department 01 • Paid Media & ROAS',
      title: 'Ads & Performance Marketing',
      shortTitle: 'Ads & Marketing',
      tagline: 'High-Converting Ad Copy, Multi-Platform Campaigns & ROAS Multipliers',
      description: 'Autonomous ad directors that write scroll-stopping copy for Facebook, Instagram, Google Search, and TikTok. Architect irresistible promo offers, spy on competitors, write high-converting landing pages, and scale ad returns.',
      icon: 'ti ti-speakerphone',
      gradient: 'from-[#1677FF] to-[#38CFFF]',
      accentColor: '#1677FF',
      badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
      glowClass: 'bg-blue-500/10',
      highlights: ['Facebook & IG High-ROI Copy', 'Google Search RSA Sets', 'TikTok 3s Hook Scripts', 'Competitor Spy Engine', 'Landing Page Copywriter']
    },
    social: {
      key: 'social',
      badge: 'Department 02 • Virality & Audience',
      title: 'Social Media & Viral Content Hub',
      shortTitle: 'Social Media',
      tagline: 'Relentless Organic Authority, 30-Day Calendars & Content Repurposing',
      description: 'Turn organic social media into client-attracting engines across LinkedIn, Instagram, X, and YouTube. Craft viral hooks, multi-slide carousels, video scripts, and multiply 1 core idea into 10 ready-to-post assets.',
      icon: 'ti ti-brand-tiktok',
      gradient: 'from-[#7C3AED] to-[#38CFFF]',
      accentColor: '#7C3AED',
      badgeClass: 'bg-purple-50 text-purple-700 border-purple-200',
      glowClass: 'bg-purple-500/10',
      highlights: ['30-Day Editorial Calendars', 'Viral Hook & Headline Generator', 'LinkedIn Authority Posts', 'Carousel Slide Planner', '1-to-10 Content Multiplier']
    },
    writing: {
      key: 'writing',
      badge: 'Department 03 • Natural Voice & Copy',
      title: 'Writing & AI Humanizer Suite',
      shortTitle: 'Writing & Humanizer',
      tagline: '100% Undetectable Natural Human Tone, B2B Outreach & Translation',
      description: 'Remove artificial robotic phrasing and write authentic, persuasive human prose. Features deep contextual paraphrasing, instant Bangla-to-English executive translation, high-reply cold email sequences, press releases, and speeches.',
      icon: 'ti ti-feather',
      gradient: 'from-[#059669] to-[#10B981]',
      accentColor: '#059669',
      badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      glowClass: 'bg-emerald-500/10',
      highlights: ['100% AI Text Humanizer', 'Bangla-to-English Business Translator', 'Cold B2B Outreach Sequences', 'Executive Tone Shifter', 'Grammar & Paraphrase Suite']
    },
    image: {
      key: 'image',
      badge: 'Department 04 • Creative Studio',
      title: 'AI Image & Visual Design Studio',
      shortTitle: 'Image & Design',
      tagline: 'Commercial Product Photography, Vector Logos & Ad Visual Briefs',
      description: 'Studio-grade commercial visuals, prompt engineering, and visual design direction. Generate photorealistic ad mockups, business logos, high-CTR thumbnails, and packaging concepts without an expensive agency.',
      icon: 'ti ti-photo',
      gradient: 'from-[#EC4899] to-[#F43F5E]',
      accentColor: '#EC4899',
      badgeClass: 'bg-pink-50 text-pink-700 border-pink-200',
      glowClass: 'bg-pink-500/10',
      highlights: ['Midjourney & Flux Pro Prompts', 'AI Business Logo Concepts', 'Studio Product Photography', 'High-CTR Thumbnail Designer', 'Brand Visual Palettes']
    },
    seo: {
      key: 'seo',
      badge: 'Department 05 • Organic Search',
      title: 'SEO & Organic Search Dominance',
      shortTitle: 'SEO & Traffic',
      tagline: 'Top Google Rankings, Topic Clusters & Semantic Authority',
      description: 'Capture compounding organic search traffic with structured search engine optimization. Uncover low-competition buyer keywords, write NLP articles with heading hierarchies, generate schema markup, and build topic clusters.',
      icon: 'ti ti-search',
      gradient: 'from-[#0284C7] to-[#0EA5E9]',
      accentColor: '#0284C7',
      badgeClass: 'bg-sky-50 text-sky-700 border-sky-200',
      glowClass: 'bg-sky-500/10',
      highlights: ['Low-Competition Keyword Research', 'NLP Longform Blog Writer', 'JSON-LD Schema Markup Bot', '15-Article Cluster Planner', 'Local Google Maps SEO']
    },
    growth: {
      key: 'growth',
      badge: 'Department 06 • Peak Performance',
      title: 'Personal Growth & Executive Mindset',
      shortTitle: 'Personal Growth',
      tagline: 'Stoic Resilience, Deep Work Focus & Rapid Skill Acquisition',
      description: 'Cognitive clarity and relentless execution routines for founders and operators. Structure daily flow state routines, eliminate procrastination with 5-second activation drills, master mental models, and accelerate skill learning.',
      icon: 'ti ti-flame',
      gradient: 'from-[#D97706] to-[#F59E0B]',
      accentColor: '#D97706',
      badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
      glowClass: 'bg-amber-500/10',
      highlights: ['90-Day Sprint & Goal Architect', 'Deep Work & Laser Focus Trigger', 'Stoic Resilience & Burnout Shield', 'Feynman Rapid Skill Acquisition', 'Procrastination Action Catalyst']
    },
    biz: {
      key: 'biz',
      badge: 'Department 07 • Operations & Scale',
      title: 'Business Automation & Operations',
      shortTitle: 'Business Automation',
      tagline: 'Standard Operating Procedures, Financial Calculators & Sales Closer',
      description: 'Automate repetitive day-to-day operations and organize tasks into predictable workflows. Generate complex Excel/Sheets formulas, calculate profit margins and breakeven ROAS, close inbox price objections, and draft SOPs.',
      icon: 'ti ti-briefcase',
      gradient: 'from-[#0D9488] to-[#14B8A6]',
      accentColor: '#0D9488',
      badgeClass: 'bg-teal-50 text-teal-700 border-teal-200',
      glowClass: 'bg-teal-500/10',
      highlights: ['Inbox Sales Objection Closer', 'Complex Sheets & Excel Formulas', 'Step-by-Step SOP Generator', 'Profit Margin & ROAS Calculator', 'Customer De-escalation & Retention']
    }
  };

  const activeDepts = $derived(
    cat === 'all'
      ? Object.keys(DEPARTMENTS).map((k) => ({
          ...DEPARTMENTS[k],
          agents: AGENTS.filter((a: Agent) => a.cat === k)
        }))
      : [DEPARTMENTS[cat]]
          .filter((d) => Boolean(d))
          .map((d) => ({
            ...d,
            agents: AGENTS.filter((a: Agent) => a.cat === d.key)
          }))
  );

  const list = $derived(
    AGENTS.filter((a: Agent) => cat === 'all' || a.cat === cat)
  );

  const counts: Record<string, number> = Object.fromEntries(
    CATEGORIES.map((c: { key: string }) => [
      c.key,
      c.key === 'all'
        ? AGENTS.length
        : AGENTS.filter((a: Agent) => a.cat === c.key).length
    ])
  );

  // Pause animations for robots that are off screen
  $effect(() => {
    // Read list and activeDepts to establish reactive tracking
    const _current = list;
    const _depts = activeDepts;
    if (!wrapEl || typeof IntersectionObserver === 'undefined') return;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((x) => x.target.classList.toggle('rb-vis', x.isIntersecting));
      },
      { rootMargin: '120px' }
    );

    const cells = wrapEl.querySelectorAll('.rb-cell');
    cells.forEach((el) => io.observe(el));

    return () => {
      io.disconnect();
    };
  });

  // Close the bubble on Escape or background tap
  $effect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActive(null);
      }
    };

    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      if (!active) return;
      const target = e.target as Node | null;
      if (
        bubEl &&
        !bubEl.contains(target) &&
        active.el &&
        !active.el.contains(target)
      ) {
        setActive(null);
      }
    };

    window.addEventListener('keydown', onKey);
    window.addEventListener('pointerdown', onPointerDown);

    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('pointerdown', onPointerDown);
    };
  });

  // Position the bubble under the robot (or above it in the last row), clamped to the container
  $effect(() => {
    if (!active || !bubEl || !wrapEl) return;

    const updatePos = () => {
      if (!active || !bubEl || !wrapEl) return;
      const el = active.el;
      const w = 240;
      const wrapRect = wrapEl.getBoundingClientRect();
      const elRect = el.getBoundingClientRect();
      const x = Math.max(
        0,
        Math.min(elRect.left - wrapRect.left + elRect.width / 2 - w / 2, wrapEl.clientWidth - w)
      );
      const below = elRect.bottom - wrapRect.top - 6;
      const y =
        below + bubEl.offsetHeight > wrapEl.clientHeight + 20
          ? Math.max(0, elRect.top - wrapRect.top - bubEl.offsetHeight + 10)
          : below;
      bubEl.style.left = `${x}px`;
      bubEl.style.top = `${y}px`;
    };

    updatePos();
    window.addEventListener('resize', updatePos);

    return () => {
      window.removeEventListener('resize', updatePos);
    };
  });

  function setActive(val: { agent: Agent; el: HTMLElement } | null) {
    active = val;
  }

  function pick(agent: Agent) {
    return (e: MouseEvent | FocusEvent) => {
      setActive({ agent, el: e.currentTarget as HTMLElement });
    };
  }

  const a = $derived(active?.agent);
  const pad = (n: number) => String(n).padStart(2, '0');
</script>

<section class="rb-root" aria-label="AI helpers">
  <div>{@html ROBOT_DEFS}</div>

  <div class="rb-ceo">
    <img class="rb-ceo-img" src={ceoSrc} alt="EZBO AI CEO" />
    <div class="rb-ceo-title">AI CEO</div>
    <div class="rb-ceo-sub">Master executive orchestrator</div>
  </div>
  <p class="rb-ceo-copy">
    Tell the AI CEO what you need from the web, WhatsApp, or Telegram and it routes the work to the right helper from #01 to #75.
    <br />
    <a class="rb-go" href={signupUrl}>Command AI CEO</a>
  </p>

  <!-- Department Filter & Navigation Tabs -->
  <div class="sticky top-16 z-30 py-2.5 backdrop-blur-md bg-[#F3F8FF]/90 mb-8 border-y border-[#E3ECF7]/80">
    <div class="rb-tabs" role="group" aria-label="Helper categories">
      {#each CATEGORIES as c (c.key)}
        <button
          type="button"
          class="rb-tab"
          aria-pressed={cat === c.key}
          onclick={() => { cat = c.key; setActive(null); }}
        >
          {c.label} {counts[c.key]}
        </button>
      {/each}
    </div>
  </div>

  <!-- Main Department Sections Container (Transparent, No Card Boxes) -->
  <div class="rb-wrap space-y-12 sm:space-y-16" bind:this={wrapEl}>
    {#each activeDepts as dept, deptIdx (dept.key)}
      <div
        id={`dept-${dept.key}`}
        class="rb-dept-section relative py-4 sm:py-8"
      >
        <!-- Centered Section Header with Details & Description -->
        <div class="text-center max-w-3xl mx-auto mb-8 sm:mb-10 space-y-3 px-4">
          <!-- Centered Department Badge & Count -->
          <div class="flex items-center justify-center gap-2 flex-wrap">
            <span class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase border {dept.badgeClass} shadow-2xs">
              <i class="{dept.icon} text-sm"></i>
              {dept.badge}
            </span>
            <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-white text-[#1677FF] border border-[#E3ECF7] shadow-2xs">
              <span class="w-1.5 h-1.5 rounded-full bg-[#1677FF] animate-pulse"></span>
              {dept.agents.length} AI Specialists
            </span>
          </div>

          <!-- Centered Main Title -->
          <h3 class="text-xl sm:text-3xl md:text-4xl font-extrabold text-[#102A56] tracking-tight break-words">
            {dept.title}
          </h3>

          <!-- Centered Tagline -->
          <p class="text-xs sm:text-sm md:text-base font-semibold text-[#1677FF] max-w-2xl mx-auto">
            {dept.tagline}
          </p>

          <!-- Centered Detailed Description -->
          <p class="text-xs sm:text-sm md:text-base text-[#4B6382] leading-relaxed max-w-2xl mx-auto">
            {dept.description}
          </p>

          <!-- Centered Capabilities Highlights Chips -->
          <div class="flex items-center justify-center gap-2 flex-wrap pt-2">
            {#each dept.highlights as chip}
              <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium bg-white text-[#334E68] border border-[#E3ECF7] shadow-2xs">
                <i class="ti ti-check text-[#1677FF] text-xs"></i>
                {chip}
              </span>
            {/each}
          </div>

          <!-- Centered Quick Action Link -->
          <div class="flex justify-center pt-2">
            <a
              href={signupUrl}
              class="inline-flex items-center gap-1.5 text-xs font-bold text-[#1677FF] hover:text-[#102A56] hover:underline transition-colors"
            >
              <span>Explore {dept.shortTitle} Specialists</span>
              <i class="ti ti-arrow-right text-xs"></i>
            </a>
          </div>
        </div>

        <!-- Robot Showcase Grid for this category (Floating transparently with NO card boxes) -->
        <div class="rb-grid">
          {#each dept.agents as agent, i (agent.n)}
            <button
              type="button"
              class={`rb-cell${a?.n === agent.n ? ' rb-on' : ''}`}
              style="animation-delay: {i * 0.03}s;"
              onmouseenter={pick(agent)}
              onfocus={pick(agent)}
              onclick={pick(agent)}
            >
              <span>{@html svgs[agent.n]}</span>
              <span class="rb-num">#{pad(agent.n)}</span>
              <span class="rb-name">{agent.name}</span>
            </button>
          {/each}
        </div>

        <!-- Subtle centered separator between departments when showing All -->
        {#if cat === 'all' && deptIdx < activeDepts.length - 1}
          <div class="w-32 h-px mx-auto bg-gradient-to-r from-transparent via-[#CBD9EC] to-transparent mt-12 sm:mt-16" aria-hidden="true"></div>
        {/if}
      </div>
    {/each}

    <!-- Shared Interactive Hover / Tap Detail Bubble -->
    <div
      class="rb-bub"
      bind:this={bubEl}
      hidden={!a}
      role="dialog"
      aria-label={a ? `${a.name} details` : undefined}
    >
      {#if a}
        <div class="rb-num">#{pad(a.n)}</div>
        <div class="rb-bub-name">
          {a.name}<span class="rb-live" title="Active"></span>
        </div>
        <div class="rb-bub-tag">{a.tag}</div>
        <div class="rb-bub-desc">{a.d}</div>
        <a
          class="rb-go"
          href={typeof studioUrl === 'function' ? studioUrl(a) : (typeof studioUrl === 'string' ? studioUrl : signupUrl)}
        >
          Launch studio
        </a>
      {/if}
    </div>
  </div>

  <p class="rb-hint">Hover or tap any robot to inspect its intelligence profile and launch its dedicated studio</p>
</section>

<style>
  .rb-tabs {
    margin: 0.25rem 0 !important;
    padding: 0 0.5rem;
  }
  @media (max-width: 640px) {
    .rb-tab {
      font-size: 0.78rem !important;
      padding: 4px 10px !important;
    }
  }
</style>
