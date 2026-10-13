export interface AgentConfig {
  n: number;
  name: string;
  cat: string;
  role?: string;
  tag?: string;
  d?: string;
  c?: string;
  e?: string;
  eyes?: string;
  ear?: string;
  ant?: string;
  hat?: string;
  prop?: string;
  icon?: string;
  [key: string]: any;
}

export const ROBOT_DEFS: string;
export function createRobot(b: AgentConfig, o?: { label?: string }): string;
