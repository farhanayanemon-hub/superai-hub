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
    defaultCategory = 'ads',
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
    // Read list to establish reactive tracking when category filter changes
    const _current = list;
    if (!gridEl || typeof IntersectionObserver === 'undefined') return;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((x) => x.target.classList.toggle('rb-vis', x.isIntersecting));
      },
      { rootMargin: '120px' }
    );

    const cells = gridEl.querySelectorAll('.rb-cell');
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
    if (!active || !bubEl || !wrapEl || !gridEl) return;

    const updatePos = () => {
      if (!active || !bubEl || !wrapEl || !gridEl) return;
      const el = active.el;
      const w = 240;
      const x = Math.max(
        0,
        Math.min(el.offsetLeft + el.offsetWidth / 2 - w / 2, wrapEl.clientWidth - w)
      );
      const below = el.offsetTop + el.offsetHeight - 6;
      const y =
        below + bubEl.offsetHeight > gridEl.offsetHeight + 20
          ? Math.max(0, el.offsetTop - bubEl.offsetHeight + 10)
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

  <div class="rb-wrap" bind:this={wrapEl}>
    <div class="rb-grid" bind:this={gridEl}>
      {#each list as agent, i (agent.n)}
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

  <p class="rb-hint">Hover or tap a robot</p>
</section>
