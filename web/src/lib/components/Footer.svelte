<script lang="ts">
  import Icon from './Icon.svelte';
</script>

<footer class="border-t border-slate-800/80 bg-slate-950 py-12 text-slate-400 text-xs sm:text-sm">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
    <!-- Brand Info -->
    <div class="space-y-3 md:col-span-1">
      <div class="flex items-center gap-2">
        <div class="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
          <Icon name="Sparkles" size={16} />
        </div>
        <span class="font-bold text-base text-white">Super<span class="text-emerald-400">AI</span> Hub</span>
      </div>
      <p class="text-xs text-slate-400 leading-relaxed">
        The all-in-one AI Micro-SaaS platform providing 50+ specialized AI helpers and an automated personal WhatsApp assistant for entrepreneurs, creators, and freelancers.
      </p>
      <div class="flex items-center gap-2 text-[11px] text-emerald-400">
        <Icon name="Shield" size={13} />
        <span>100% Anti-Ban Protected Self-Chat Architecture</span>
      </div>
    </div>

    <!-- 50+ Tools Categories -->
    <div>
      <h4 class="font-bold text-xs uppercase tracking-wider text-white mb-3">Tool Categories</h4>
      <ul class="space-y-2 text-xs">
        <li><a href="#tools" class="hover:text-emerald-400 transition-colors">E-Commerce & Sales (15 Tools)</a></li>
        <li><a href="#tools" class="hover:text-emerald-400 transition-colors">Social Media & Content (12 Tools)</a></li>
        <li><a href="#tools" class="hover:text-emerald-400 transition-colors">Career & Productivity (12 Tools)</a></li>
        <li><a href="#tools" class="hover:text-emerald-400 transition-colors">Technical & Freelancing (11 Tools)</a></li>
      </ul>
    </div>

    <!-- Highlights & Tech -->
    <div>
      <h4 class="font-bold text-xs uppercase tracking-wider text-white mb-3">Features & Tech</h4>
      <ul class="space-y-2 text-xs">
        <li><a href="#simulator" class="hover:text-emerald-400 transition-colors">WhatsApp Chat Simulator</a></li>
        <li><a href="#sandbox" class="hover:text-emerald-400 transition-colors">Free Interactive Sandbox</a></li>
        <li><a href="#pricing" class="hover:text-emerald-400 transition-colors">BYOK Free Gemini Integration</a></li>
        <li><a href="#pricing" class="hover:text-emerald-400 transition-colors">Flux / Pollinations Image Generator</a></li>
      </ul>
    </div>

    <!-- Payment & Support -->
    <div>
      <h4 class="font-bold text-xs uppercase tracking-wider text-white mb-3">Billing & Security</h4>
      <p class="text-xs text-slate-400 mb-3 leading-relaxed">
        Instant activation supporting bKash, Nagad, Rocket, Visa & Mastercard with a 3-day safety grace period.
      </p>
      <div class="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-300">
        Support & Contact: <span class="text-emerald-400 font-mono">support@superaihub.io</span>
      </div>
    </div>
  </div>

  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
    <p>© 2026 SuperAI Hub. All rights reserved.</p>
    <p>Powered by Google Gemini 1.5/2.0 Flash (BYOK) & WhatsApp Baileys Protocol</p>
  </div>
</footer>
