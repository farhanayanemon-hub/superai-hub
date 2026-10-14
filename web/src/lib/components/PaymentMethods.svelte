<script lang="ts">
  let { class: className = '' } = $props<{ class?: string }>();

  const methods = [
    { name: 'bKash', icon: '/payment-methods/bkash.svg', class: 'h-6 sm:h-7 w-auto max-w-[76px]' },
    { name: 'Nagad', icon: '/payment-methods/nagad.svg', class: 'h-6 sm:h-7 w-auto max-w-[76px]' },
    { name: 'Rocket', icon: '/payment-methods/rocket.svg', class: 'h-6 sm:h-7 w-auto max-w-[72px]' },
    { name: 'Visa', icon: '/payment-methods/visa.svg', class: 'h-4.5 sm:h-5.5 w-auto max-w-[62px]' },
    { name: 'Mastercard', icon: '/payment-methods/mastercard.svg', class: 'h-6 sm:h-7 w-auto max-w-[56px]' }
  ];
</script>

<div class="flex flex-wrap items-center justify-center gap-2 sm:gap-3 {className}">
  {#each methods as m}
    <div
      class="h-9 sm:h-10 px-3 sm:px-4 rounded-xl bg-white border border-[#CFE2FA] shadow-2xs hover:shadow-sm hover:border-[#1677FF]/50 hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center group/pay cursor-default"
      title="{m.name} Verified Payment"
    >
      <img
        src={m.icon}
        alt={m.name}
        class="{m.class} object-contain transition-transform duration-200 group-hover/pay:scale-105"
        loading="lazy"
      />
    </div>
  {/each}
</div>
