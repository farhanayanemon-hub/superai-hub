import type { AgentConfig } from './createRobot';

export interface Category {
  key: string;
  label: string;
}

export const CATEGORIES: Category[];
export const AGENTS: AgentConfig[];
