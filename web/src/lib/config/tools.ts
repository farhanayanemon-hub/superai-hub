export interface ToolInput {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'select';
  placeholder?: string;
  required?: boolean;
  options?: string[];
  defaultValue?: string;
}

export interface AITool {
  id: string;
  name: string;
  nameEn: string;
  category: 'fcommerce' | 'social' | 'career' | 'technical';
  categoryName: string;
  description: string;
  icon: string;
  badge?: string;
  inputs: ToolInput[];
  systemPrompt: string;
  keywords: string[];
  agentName: string;
  agentRole: string;
  agentTagline: string;
  agentAvatar: string;
}

export const CATEGORIES = [
  {
    id: "all",
    name: "All AI Agents",
    icon: "Grid",
    count: 0
  },
  {
    id: "fcommerce",
    name: "E-Commerce & Sales",
    icon: "ShoppingBag",
    count: 0
  },
  {
    id: "social",
    name: "Social Media & Content",
    icon: "Share2",
    count: 0
  },
  {
    id: "career",
    name: "Career & Productivity",
    icon: "Briefcase",
    count: 0
  },
  {
    id: "technical",
    name: "Technical & Freelancing",
    icon: "Code",
    count: 0
  }
] as const;

// All agents cleared per user instruction. Custom agents will be added one-by-one as requested.
export const TOOLS: AITool[] = [];
