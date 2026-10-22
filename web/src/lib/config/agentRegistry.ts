import { writable, get, type Readable, type Writable } from 'svelte/store';
import type { Component } from 'svelte';
import type { ToolInput } from './tools';

/**
 * Metadata defining a bespoke agent's identity, capabilities, and parameters.
 */
export interface BespokeAgentMetadata {
  id: string;
  name: string;
  nameEn?: string;
  description: string;
  shortDesc?: string;
  icon?: string;
  badge?: string;
  category?: string;
  systemPrompt?: string;
  keywords?: string[];
  inputs?: ToolInput[];
  author?: 'system' | 'user';
  createdAt?: string;
  version?: string;
  settings?: Record<string, any>;
}

/**
 * Complete Bespoke Agent definition mapping metadata to a dedicated Svelte UI component.
 * Allows custom layout styles and workflows without being locked into a generic drawer.
 */
export interface BespokeAgent extends BespokeAgentMetadata {
  /**
   * Dedicated Svelte component rendered when this agent is opened.
   * If undefined or null, the platform renders a standard full-screen studio layout.
   */
  component?: Component<any> | null;

  /**
   * Preferred view container:
   * - 'fullscreen': Full-viewport studio workspace
   * - 'drawer': Slide-over panel
   * - 'dialog': Centered modal dialog
   * - 'inline': Directly embedded in dashboard view
   */
  viewPreference?: 'fullscreen' | 'drawer' | 'dialog' | 'inline';
}

/**
 * Initial empty registry: clean workspace as required by R3.
 */
export const DEFAULT_REGISTERED_AGENTS: BespokeAgent[] = [];

// Internal writable registry store
const _agents = writable<BespokeAgent[]>(DEFAULT_REGISTERED_AGENTS);

/**
 * Public readable store of all registered bespoke agents.
 */
export const registeredAgents = {
  subscribe: _agents.subscribe,
  set: _agents.set,
  update: _agents.update
};

/**
 * Active bespoke agent currently open in the workspace.
 */
export const activeBespokeAgent: Writable<BespokeAgent | null> = writable<BespokeAgent | null>(null);

/**
 * Register a new bespoke agent into the platform.
 */
export function registerAgent(agent: BespokeAgent): void {
  _agents.update((current) => {
    const existingIndex = current.findIndex((a) => a.id === agent.id);
    if (existingIndex >= 0) {
      const updated = [...current];
      updated[existingIndex] = agent;
      return updated;
    }
    return [...current, agent];
  });
}

/**
 * Unregister an agent by ID.
 */
export function unregisterAgent(agentId: string): boolean {
  let removed = false;
  _agents.update((current) => {
    const filtered = current.filter((a) => a.id !== agentId);
    removed = filtered.length !== current.length;
    return filtered;
  });
  if (get(activeBespokeAgent)?.id === agentId) {
    activeBespokeAgent.set(null);
  }
  return removed;
}

/**
 * Retrieve all registered agents synchronously.
 */
export function getRegisteredAgents(): BespokeAgent[] {
  return get(_agents);
}

/**
 * Look up a registered agent by ID.
 */
export function getAgentById(agentId: string): BespokeAgent | undefined {
  return get(_agents).find((a) => a.id === agentId);
}

/**
 * Open a bespoke agent in its dedicated UI.
 */
export function openBespokeAgent(agentOrId: BespokeAgent | string): void {
  if (typeof agentOrId === 'string') {
    const found = getAgentById(agentOrId);
    if (found) activeBespokeAgent.set(found);
  } else {
    activeBespokeAgent.set(agentOrId);
  }
}

/**
 * Close the currently active bespoke agent workspace.
 */
export function closeBespokeAgent(): void {
  activeBespokeAgent.set(null);
}
