<script lang="ts">
  import {
    Megaphone, ShieldAlert, Percent, FileText, Truck, RotateCcw,
    MessageSquareCheck, Star, Sparkles, Clock, Crown, Flame, Layers,
    Video, HelpCircle, Image, Wand2, Smartphone, Layout,
    Calendar, Zap, Smile, Mic, Languages, Mail,
    Award, UserCheck, GraduationCap, HeartPulse, Utensils, AlignLeft,
    PiggyBank, UserX, Target, BookOpen, Table, BriefcaseBusiness,
    Bug, Globe, CodeXml, Database, FileJson, GitBranch, Palette,
    Terminal, Receipt, ShoppingBag, Share2, Briefcase, Code, Grid,
    Bot, Key, QrCode, ExternalLink, Copy, Check, Search, X,
    ChevronRight, Play, CheckCircle2, AlertCircle, RefreshCw,
    ArrowRight, Shield, MessageSquare, Send, CheckCheck, Loader2,
    LogOut, Settings, CreditCard, User, ChevronLeft, Gift,
    Eye, EyeOff, Lock
  } from '@lucide/svelte';

  let { name = 'Sparkles', size = 20, class: className = '' } = $props<{
    name?: string;
    size?: number;
    class?: string;
  }>();

  const iconMap: Record<string, any> = {
    Megaphone, ShieldAlert, Percent, FileText, Truck, RotateCcw,
    MessageSquareCheck, Star, Sparkles, Clock, Crown, Flame, Layers,
    Video, HelpCircle, Image, Wand2, Smartphone, Layout,
    Calendar, Zap, Smile, Mic, Languages, Mail,
    Award, UserCheck, GraduationCap, HeartPulse, Utensils, AlignLeft,
    PiggyBank, UserX, Target, BookOpen, Table, BriefcaseBusiness,
    Bug, Globe, CodeXml, Database, FileJson, GitBranch, Palette,
    Terminal, Receipt, ShoppingBag, Share2, Briefcase, Code, Grid,
    Bot, Key, QrCode, ExternalLink, Copy, Check, Search, X,
    ChevronRight, Play, CheckCircle2, AlertCircle, RefreshCw,
    ArrowRight, Shield, MessageSquare, Send, CheckCheck, Loader2,
    LogOut, Settings, CreditCard, User, ChevronLeft, Gift,
    Eye, EyeOff, Lock,
    // Aliases for social
    Youtube: Video,
    Linkedin: Share2,
    Twitter: MessageSquare
  };

  const Component = $derived(iconMap[name] || Sparkles);
</script>

{#snippet renderIcon()}
  {@const IconComponent = Component}
  <IconComponent {size} class={className} />
{/snippet}

{@render renderIcon()}
