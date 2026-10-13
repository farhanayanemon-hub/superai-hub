<script lang="ts">
  import Icon from './Icon.svelte';
</script>

<footer class="border-t border-[#E3ECF7] bg-white py-12 sm:py-14 text-[#4B6382] text-xs sm:text-sm">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
    <!-- Brand Info -->
    <div class="space-y-3.5">
      <div class="flex items-center gap-2.5">
        <img src="/logo.png" alt="EzboAgents" class="w-8 h-8 object-contain drop-shadow-xs" />
        <span class="font-extrabold text-lg text-[#102A56]">Ezbo<span class="text-[#1677FF]">Agents</span></span>
      </div>
      <p class="text-xs text-[#4B6382] leading-relaxed">
        The premier private AI executive consortium. 50+ vetted autonomous agents and a private, self-chat WhatsApp automation engine for founders, creators, and operators.
      </p>
      <div class="flex items-center gap-2 text-[11px] text-[#1677FF] font-semibold">
        <Icon name="Shield" size={13} class="text-[#1677FF]" />
        <span>100% Anti-Ban Encrypted Architecture</span>
      </div>
    </div>

    <!-- 50+ Tools Categories -->
    <div>
      <h4 class="font-bold text-xs uppercase tracking-wider text-[#102A56] mb-3.5">Specialist Domains</h4>
      <ul class="space-y-2.5 text-xs">
        <li><a href="#tools" class="hover:text-[#1677FF] transition-colors">E-Commerce & Sales (15 Specialists)</a></li>
        <li><a href="#tools" class="hover:text-[#1677FF] transition-colors">Social Media & Virality (12 Specialists)</a></li>
        <li><a href="#tools" class="hover:text-[#1677FF] transition-colors">Career & Executive Ops (12 Specialists)</a></li>
        <li><a href="#tools" class="hover:text-[#1677FF] transition-colors">Technical & Engineering (11 Specialists)</a></li>
      </ul>
    </div>

    <!-- Highlights & Tech -->
    <div>
      <h4 class="font-bold text-xs uppercase tracking-wider text-[#102A56] mb-3.5">Platform Infrastructure</h4>
      <ul class="space-y-2.5 text-xs">
        <li><a href="#simulator" class="hover:text-[#1677FF] transition-colors">WhatsApp Engine & Simulator</a></li>
        <li><a href="#sandbox" class="hover:text-[#1677FF] transition-colors">Specialist Sandbox Console</a></li>
        <li><a href="#pricing" class="hover:text-[#1677FF] transition-colors">Zero-Markup BYOK Architecture</a></li>
        <li><a href="#pricing" class="hover:text-[#1677FF] transition-colors">High-Speed Image & Media Engine</a></li>
      </ul>
    </div>

    <!-- Payment & Support -->
    <div>
      <h4 class="font-bold text-xs uppercase tracking-wider text-[#102A56] mb-3.5">Security & Concierge</h4>
      <p class="text-xs text-[#4B6382] mb-3.5 leading-relaxed">
        Instant activation with bank-grade encryption. Instant access via bKash, Nagad, Visa, and Mastercard with grace period protection.
      </p>
      <div class="p-3 rounded-xl bg-[#F3F8FF] border border-[#E3ECF7] text-[11px] text-[#102A56] break-words">
        Concierge Desk: <span class="text-[#1677FF] font-mono font-semibold break-all">support@ezboagents.com</span>
      </div>
    </div>
  </div>

  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 border-t border-[#E3ECF7] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#5E7694] text-center sm:text-left">
    <p>© 2026 EzboAgents. All rights reserved.</p>
    <p>Powered by Google Gemini 1.5/2.0 Flash (BYOK) & WhatsApp Baileys Protocol</p>
  </div>
</footer>
