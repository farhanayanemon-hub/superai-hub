<script lang="ts">
  import Icon from './Icon.svelte';
</script>

<footer class="border-t border-amber-500/20 bg-[#08090d] py-14 text-slate-400 text-xs sm:text-sm">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
    <!-- Brand Info -->
    <div class="space-y-3.5 md:col-span-1">
      <div class="flex items-center gap-2.5">
        <div class="w-8 h-8 rounded-lg bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400">
          <Icon name="Sparkles" size={16} />
        </div>
        <span class="font-extrabold text-lg text-white">Ezbo<span class="text-amber-400">Agents</span></span>
      </div>
      <p class="text-xs text-slate-400 leading-relaxed">
        The premier private AI executive consortium. 50+ vetted autonomous agents and a private, self-chat WhatsApp automation engine for founders, creators, and operators.
      </p>
      <div class="flex items-center gap-2 text-[11px] text-amber-300">
        <Icon name="Shield" size={13} class="text-amber-400" />
        <span>100% Anti-Ban Encrypted Architecture</span>
      </div>
    </div>

    <!-- 50+ Tools Categories -->
    <div>
      <h4 class="font-bold text-xs uppercase tracking-wider text-white mb-3.5">Specialist Domains</h4>
      <ul class="space-y-2 text-xs">
        <li><a href="#tools" class="hover:text-amber-400 transition-colors">E-Commerce & Sales (15 Specialists)</a></li>
        <li><a href="#tools" class="hover:text-amber-400 transition-colors">Social Media & Virality (12 Specialists)</a></li>
        <li><a href="#tools" class="hover:text-amber-400 transition-colors">Career & Executive Ops (12 Specialists)</a></li>
        <li><a href="#tools" class="hover:text-amber-400 transition-colors">Technical & Engineering (11 Specialists)</a></li>
      </ul>
    </div>

    <!-- Highlights & Tech -->
    <div>
      <h4 class="font-bold text-xs uppercase tracking-wider text-white mb-3.5">Platform Infrastructure</h4>
      <ul class="space-y-2 text-xs">
        <li><a href="#simulator" class="hover:text-amber-400 transition-colors">WhatsApp Engine & Simulator</a></li>
        <li><a href="#sandbox" class="hover:text-amber-400 transition-colors">Specialist Sandbox Console</a></li>
        <li><a href="#pricing" class="hover:text-amber-400 transition-colors">Zero-Markup BYOK Architecture</a></li>
        <li><a href="#pricing" class="hover:text-amber-400 transition-colors">High-Speed Image & Media Engine</a></li>
      </ul>
    </div>

    <!-- Payment & Support -->
    <div>
      <h4 class="font-bold text-xs uppercase tracking-wider text-white mb-3.5">Security & Concierge</h4>
      <p class="text-xs text-slate-400 mb-3.5 leading-relaxed">
        Instant activation with bank-grade encryption. Instant access via bKash, Nagad, Visa, and Mastercard with grace period protection.
      </p>
      <div class="p-3 rounded-xl bg-[#12141d] border border-amber-500/20 text-[11px] text-slate-300">
        Concierge Desk: <span class="text-amber-400 font-mono">support@ezboagents.com</span>
      </div>
    </div>
  </div>

  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
    <p>© 2026 EzboAgents. All rights reserved.</p>
    <p>Powered by Google Gemini 1.5/2.0 Flash (BYOK) & WhatsApp Baileys Protocol</p>
  </div>
</footer>

