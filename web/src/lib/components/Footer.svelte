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
        বাংলাদেশের ই-কমার্স, উদ্যোক্তা, কন্টেন্ট ক্রিয়েটর ও ফ্রিল্যান্সারদের জন্য ৫০+ AI হেল্পার এবং নিজস্ব WhatsApp অ্যাসিস্ট্যান্ট প্ল্যাটফর্ম।
      </p>
      <div class="flex items-center gap-2 text-[11px] text-emerald-400">
        <Icon name="Shield" size={13} />
        <span>১০০% ব্যান-প্রটেক্টেড সেলফ চ্যাট আর্কিটেকচার</span>
      </div>
    </div>

    <!-- 50+ Tools Categories -->
    <div>
      <h4 class="font-bold text-xs uppercase tracking-wider text-white mb-3">টুলস ক্যাটাগরি</h4>
      <ul class="space-y-2 text-xs">
        <li><a href="#tools" class="hover:text-emerald-400 transition-colors">F-Commerce ও সেলস (১৫টি টুল)</a></li>
        <li><a href="#tools" class="hover:text-emerald-400 transition-colors">সোশ্যাল মিডিয়া ও কনটেন্ট (১২টি টুল)</a></li>
        <li><a href="#tools" class="hover:text-emerald-400 transition-colors">ক্যারিয়ার ও ডেইলি লাইফ (১২টি টুল)</a></li>
        <li><a href="#tools" class="hover:text-emerald-400 transition-colors">টেকনিক্যাল ও ফ্রিল্যান্সিং (১১টি টুল)</a></li>
      </ul>
    </div>

    <!-- Highlights & Tech -->
    <div>
      <h4 class="font-bold text-xs uppercase tracking-wider text-white mb-3">ফিচার্স ও প্রযুক্তি</h4>
      <ul class="space-y-2 text-xs">
        <li><a href="#simulator" class="hover:text-emerald-400 transition-colors">হোয়াটসঅ্যাপ চ্যাট সিমুলেটর</a></li>
        <li><a href="#sandbox" class="hover:text-emerald-400 transition-colors">ফ্রি ইন্টারেক্টিভ স্যান্ডবক্স</a></li>
        <li><a href="#pricing" class="hover:text-emerald-400 transition-colors">BYOK ফ্রি Gemini ইন্টিগ্রেশন</a></li>
        <li><a href="#pricing" class="hover:text-emerald-400 transition-colors">Pollinations.ai / Flux ইমেজ জেনারেটর</a></li>
      </ul>
    </div>

    <!-- Payment & Support -->
    <div>
      <h4 class="font-bold text-xs uppercase tracking-wider text-white mb-3">পেমেন্ট ও সুরক্ষা</h4>
      <p class="text-xs text-slate-400 mb-3 leading-relaxed">
        bKash, Nagad, Rocket ও কার্ডের মাধ্যমে তাৎক্ষণিক অ্যাক্টিভেশন এবং ৩ দিনের সেফটি গ্রেস পিরিয়ড।
      </p>
      <div class="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-300">
        সাপোর্ট ও যোগাযোগ: <span class="text-emerald-400 font-mono">support@superaihub.bd</span>
      </div>
    </div>
  </div>

  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
    <p>© 2026 SuperAI Hub. সর্বস্বত্ব সংরক্ষিত।</p>
    <p>Powered by Google Gemini 1.5/2.0 Flash (BYOK) & WhatsApp Baileys Protocol</p>
  </div>
</footer>
