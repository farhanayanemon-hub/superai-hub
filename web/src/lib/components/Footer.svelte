<script lang="ts">
  import Icon from './Icon.svelte';
</script>

<footer class="border-t border-slate-200 bg-slate-50/70 py-14 text-slate-600 text-xs sm:text-sm">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
    <!-- Brand Info -->
    <div class="space-y-3.5 md:col-span-1">
      <div class="flex items-center gap-2.5">
        <div class="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shadow-xs">
          <Icon name="Sparkles" size={16} />
        </div>
        <span class="font-extrabold text-lg text-slate-900">Ezbo<span class="text-blue-600">Agents</span></span>
      </div>
      <p class="text-xs text-slate-500 leading-relaxed">
        The premier private AI executive consortium. 50+ vetted autonomous agents and a private, self-chat WhatsApp automation engine for founders, creators, and operators.
      </p>
      <div class="flex items-center gap-2 text-[11px] text-blue-700 font-medium">
        <Icon name="Shield" size={13} class="text-blue-600" />
        <span>100% Anti-Ban Encrypted Architecture</span>
      </div>
    </div>

    <!-- 50+ Tools Categories -->
    <div>
      <h4 class="font-bold text-xs uppercase tracking-wider text-slate-900 mb-3.5">Specialist Domains</h4>
      <ul class="space-y-2 text-xs">
        <li><a href="#tools" class="hover:text-blue-600 transition-colors">E-Commerce & Sales (15 Specialists)</a></li>
        <li><a href="#tools" class="hover:text-blue-600 transition-colors">Social Media & Virality (12 Specialists)</a></li>
        <li><a href="#tools" class="hover:text-blue-600 transition-colors">Career & Executive Ops (12 Specialists)</a></li>
        <li><a href="#tools" class="hover:text-blue-600 transition-colors">Technical & Engineering (11 Specialists)</a></li>
      </ul>
    </div>

    <!-- Highlights & Tech -->
    <div>
      <h4 class="font-bold text-xs uppercase tracking-wider text-slate-900 mb-3.5">Platform Infrastructure</h4>
      <ul class="space-y-2 text-xs">
        <li><a href="#simulator" class="hover:text-blue-600 transition-colors">WhatsApp Engine & Simulator</a></li>
        <li><a href="#sandbox" class="hover:text-blue-600 transition-colors">Specialist Sandbox Console</a></li>
        <li><a href="#pricing" class="hover:text-blue-600 transition-colors">Zero-Markup BYOK Architecture</a></li>
        <li><a href="#pricing" class="hover:text-blue-600 transition-colors">High-Speed Image & Media Engine</a></li>
      </ul>
    </div>

    <!-- Payment & Support -->
    <div>
      <h4 class="font-bold text-xs uppercase tracking-wider text-slate-900 mb-3.5">Security & Concierge</h4>
      <p class="text-xs text-slate-500 mb-3.5 leading-relaxed">
        Instant activation with bank-grade encryption. Instant access via bKash, Nagad, Visa, and Mastercard with grace period protection.
      </p>
      <div class="p-3 rounded-xl bg-white border border-slate-200 text-[11px] text-slate-700 shadow-xs">
        Concierge Desk: <span class="text-blue-600 font-mono font-medium">support@ezboagents.com</span>
      </div>
    </div>
  </div>

  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
    <p>© 2026 EzboAgents. All rights reserved.</p>
    <p>Powered by Google Gemini 1.5/2.0 Flash (BYOK) & WhatsApp Baileys Protocol</p>
  </div>
</footer>
