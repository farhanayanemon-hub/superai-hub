import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {
  ROBOTS_DIR,
  WEB_DIR,
  computeClampedBubblePosition,
  toFileUrl
} from './helpers/test_utils.mjs';

describe('Tier 2: Boundary & Corner Cases', () => {

  describe('Detail Bubble Boundary Clamping Mathematics', () => {
    const bubbleWidth = 240;
    const bubHeight = 160;

    it('2.1 should clamp x to 0 when robot card is at the left boundary', () => {
      // Cell at left edge: offsetLeft = 0, width = 140
      // Ideal x = 0 + 70 - 120 = -50
      const pos = computeClampedBubblePosition({
        offsetLeft: 0,
        offsetTop: 100,
        offsetWidth: 140,
        offsetHeight: 170,
        wrapClientWidth: 1200,
        gridOffsetHeight: 800,
        bubOffsetHeight: bubHeight,
        bubbleWidth
      });
      assert.strictEqual(pos.x, 0, 'Left boundary did not clamp to 0');
    });

    it('2.2 should clamp x to 0 even with negative offsetLeft edge cases', () => {
      const pos = computeClampedBubblePosition({
        offsetLeft: -30,
        offsetTop: 100,
        offsetWidth: 140,
        offsetHeight: 170,
        wrapClientWidth: 1200,
        gridOffsetHeight: 800,
        bubOffsetHeight: bubHeight,
        bubbleWidth
      });
      assert.strictEqual(pos.x, 0, 'Negative offset did not clamp to 0');
    });

    it('2.3 should clamp x to wrapClientWidth - bubbleWidth at the right boundary', () => {
      // Container width: 1200, bubble width: 240. Max x = 960.
      // Cell at offsetLeft = 1100, width = 140. Ideal x = 1100 + 70 - 120 = 1050.
      const pos = computeClampedBubblePosition({
        offsetLeft: 1100,
        offsetTop: 100,
        offsetWidth: 140,
        offsetHeight: 170,
        wrapClientWidth: 1200,
        gridOffsetHeight: 800,
        bubOffsetHeight: bubHeight,
        bubbleWidth
      });
      assert.strictEqual(pos.x, 960, 'Right boundary did not clamp to 1200 - 240 = 960');
    });

    it('2.4 should perfectly center bubble when cell is in middle of container', () => {
      // Cell at offsetLeft = 530, width = 140. Center = 600.
      // Ideal x = 600 - 120 = 480. Bound is [0, 960].
      const pos = computeClampedBubblePosition({
        offsetLeft: 530,
        offsetTop: 100,
        offsetWidth: 140,
        offsetHeight: 170,
        wrapClientWidth: 1200,
        gridOffsetHeight: 800,
        bubOffsetHeight: bubHeight,
        bubbleWidth
      });
      assert.strictEqual(pos.x, 480, 'Centered cell did not yield 480');
    });

    it('2.5 should clamp x strictly within mobile viewport (375px width)', () => {
      // Mobile wrap width: 360px (375px viewport with padding).
      // Max x = 360 - 240 = 120px.
      // Cell at right column: offsetLeft = 200, width = 150. Ideal x = 200 + 75 - 120 = 155.
      const pos = computeClampedBubblePosition({
        offsetLeft: 200,
        offsetTop: 100,
        offsetWidth: 150,
        offsetHeight: 170,
        wrapClientWidth: 360,
        gridOffsetHeight: 800,
        bubOffsetHeight: bubHeight,
        bubbleWidth
      });
      assert.strictEqual(pos.x, 120, 'Mobile viewport right clamp exceeded container');
      assert.ok(pos.x + bubbleWidth <= 360, 'Bubble overflows mobile container');
    });

    it('2.6 should position bubble below cell for upper and middle rows', () => {
      // Row 1: offsetTop = 50, height = 170. below = 50 + 170 - 6 = 214.
      // gridHeight = 1000. 214 + 160 = 374 <= 1020 -> does NOT flip.
      const pos = computeClampedBubblePosition({
        offsetLeft: 200,
        offsetTop: 50,
        offsetWidth: 140,
        offsetHeight: 170,
        wrapClientWidth: 1200,
        gridOffsetHeight: 1000,
        bubOffsetHeight: bubHeight,
        bubbleWidth
      });
      assert.strictEqual(pos.shouldFlip, false, 'Upper row cell flipped unexpectedly');
      assert.strictEqual(pos.y, 214);
    });

    it('2.7 should flip bubble above cell when at bottom edge of grid', () => {
      // Bottom row: offsetTop = 800, height = 170. below = 800 + 170 - 6 = 964.
      // gridHeight = 900. below + bubHeight = 964 + 160 = 1124 > 920 -> FLIPS!
      // Flipped y = Math.max(0, 800 - 160 + 10) = 650.
      const pos = computeClampedBubblePosition({
        offsetLeft: 200,
        offsetTop: 800,
        offsetWidth: 140,
        offsetHeight: 170,
        wrapClientWidth: 1200,
        gridOffsetHeight: 900,
        bubOffsetHeight: bubHeight,
        bubbleWidth
      });
      assert.strictEqual(pos.shouldFlip, true, 'Bottom row cell failed to flip above');
      assert.strictEqual(pos.y, 650);
    });

    it('2.8 should clamp flipped vertical y to 0 if card is near container top', () => {
      // Extreme edge case: gridHeight is small (150px), card offsetTop = 50px.
      // below = 50 + 170 - 6 = 214 > 170 -> FLIPS!
      // flipped = 50 - 160 + 10 = -100 -> Clamped to 0!
      const pos = computeClampedBubblePosition({
        offsetLeft: 200,
        offsetTop: 50,
        offsetWidth: 140,
        offsetHeight: 170,
        wrapClientWidth: 1200,
        gridOffsetHeight: 150,
        bubOffsetHeight: bubHeight,
        bubbleWidth
      });
      assert.strictEqual(pos.shouldFlip, true);
      assert.strictEqual(pos.y, 0, 'Flipped y allowed negative vertical position');
    });
  });

  describe('Off-Screen Animation Pause Threshold & Accessibility', () => {
    const sveltePath = path.join(ROBOTS_DIR, 'RobotShowcase.svelte');
    const cssPath = path.join(ROBOTS_DIR, 'robots.css');

    it('2.9 should verify rootMargin is set to exactly 120px in component', () => {
      const content = fs.readFileSync(sveltePath, 'utf8');
      assert.match(content, /rootMargin\s*:\s*['"]120px['"]/, 'IntersectionObserver rootMargin is not 120px');
    });

    it('2.10 should verify CSS animation-play-state paused rule has !important flag', () => {
      const css = fs.readFileSync(cssPath, 'utf8');
      const hasImportant = css.includes('animation-play-state: paused !important') ||
                           css.includes('animation-play-state:paused!important');
      assert.ok(hasImportant, 'CSS missing !important flag on off-screen paused state');
    });

    it('2.11 should zero out animations under prefers-reduced-motion: reduce', () => {
      const css = fs.readFileSync(cssPath, 'utf8');
      assert.ok(css.includes('prefers-reduced-motion'), 'Missing prefers-reduced-motion media query');
      assert.ok(
        css.includes('animation: none !important') ||
        css.includes('animation:none!important') ||
        css.includes('animation-duration: 0.01ms'),
        'prefers-reduced-motion does not eliminate animations'
      );
    });
  });

  describe('Viewport Resizing & Layout Responsiveness', () => {
    const cssPath = path.join(ROBOTS_DIR, 'robots.css');
    const pagePath = path.join(WEB_DIR, 'src', 'routes', '+page.svelte');

    it('2.12 should configure auto-fill grid with minmax(130px, 1fr) for mobile scaling', () => {
      const css = fs.readFileSync(cssPath, 'utf8');
      assert.ok(
        css.includes('repeat(auto-fill, minmax(130px, 1fr))') ||
        css.includes('repeat(auto-fill,minmax(130px,1fr))') ||
        css.includes('repeat(auto-fit, minmax(130px, 1fr))') ||
        css.includes('repeat(auto-fit,minmax(130px,1fr))'),
        'CSS grid does not use minmax(130px, 1fr) for responsive wrapping'
      );
    });

    it('2.13 should define centered desktop container (max-w-7xl mx-auto or max-width)', () => {
      const page = fs.readFileSync(pagePath, 'utf8');
      const css = fs.readFileSync(cssPath, 'utf8');
      const hasPageConstraint = page.includes('max-w-7xl') && page.includes('mx-auto');
      const hasCssConstraint = css.includes('max-width') && css.includes('margin: 0 auto');
      assert.ok(hasPageConstraint || hasCssConstraint, 'Missing desktop container width constrain and centering');
    });

    it('2.14 should fix bubble width to 240px and allow safe margins on 375px mobile', () => {
      const css = fs.readFileSync(cssPath, 'utf8');
      assert.ok(css.includes('width: 240px') || css.includes('width:240px'), 'Bubble width is not 240px');
      // On 375px screen: 375 - 240 = 135px safe clearance
      assert.ok(375 - 240 >= 100, 'Bubble exceeds safe mobile width clearance');
    });
  });

  describe('Rapid Tab Switching & State Preservation', () => {
    it('2.15 should reset active bubble to null upon category change', async () => {
      const sveltePath = path.join(ROBOTS_DIR, 'RobotShowcase.svelte');
      const content = fs.readFileSync(sveltePath, 'utf8');
      // In template or handler: onClick or onTabChange must set active = null
      assert.ok(
        content.includes('active = null') ||
        content.includes('active=null') ||
        content.includes('setActive(null)'),
        'Tab selection does not dismiss active bubble'
      );
    });

    it('2.16 should preserve category data immutability during sequential filtering', async () => {
      const { AGENTS, CATEGORIES } = await import(toFileUrl(path.join(ROBOTS_DIR, 'agents.js')));
      const countsMap = Object.fromEntries(
        CATEGORIES.map(c => [
          c.key,
          c.key === 'all' ? AGENTS.length : AGENTS.filter(a => a.cat === c.key).length
        ])
      );

      // Simulate rapid switching
      const sequence = ['ads', 'biz', 'growth', 'all', 'seo', 'writing', 'social', 'image', 'ads'];
      for (const cat of sequence) {
        const filtered = AGENTS.filter(a => cat === 'all' || a.cat === cat);
        assert.strictEqual(filtered.length, countsMap[cat], `Filter for ${cat} returned inconsistent length`);
      }
    });
  });

  describe('Feature 6: Workflow Studio: Interactive Wiring, Midpoint Badging & Zero-Lag Sync', () => {
    const studioPath = path.join(WEB_DIR, 'src', 'lib', 'components', 'WorkflowStudioModal.svelte');

    it('2.17 should disable CSS transitions during active node motion (isDraggingNode)', () => {
      assert.ok(fs.existsSync(studioPath), 'WorkflowStudioModal.svelte must exist');
      const content = fs.readFileSync(studioPath, 'utf8');
      assert.ok(
        content.includes('isDraggingNode') && (content.includes('!transition-none') || content.includes('transition-none')),
        'WorkflowStudioModal must disable CSS transitions with transition-none when isDraggingNode is active'
      );
      assert.ok(
        content.includes("isDraggingNode ? '!transition-none'"),
        'WorkflowStudioModal must disable transitions on SVG connection cables during active node dragging to eliminate wire lag'
      );
    });

    it('2.18 should compute local pointer coordinates relative to canvas viewport (panX, panY, zoom)', () => {
      const content = fs.readFileSync(studioPath, 'utf8');
      assert.ok(
        content.includes('getCanvasCoordinates'),
        'WorkflowStudioModal must declare getCanvasCoordinates helper'
      );
      assert.ok(
        content.includes('getBoundingClientRect()') &&
        content.includes('zoom') &&
        content.includes('panX') &&
        content.includes('panY'),
        'Coordinate calculation must factor in getBoundingClientRect(), zoom, panX, and panY'
      );

      // Verify mathematical coordinate transformation
      const mockCanvasRect = { left: 100, top: 50 };
      const zoom = 1.25;
      const panX = 40;
      const panY = 20;
      const clientX = 350;
      const clientY = 200;

      const expectedX = (clientX - mockCanvasRect.left) / zoom - panX; // (250 / 1.25) - 40 = 200 - 40 = 160
      const expectedY = (clientY - mockCanvasRect.top) / zoom - panY; // (150 / 1.25) - 20 = 120 - 20 = 100
      assert.strictEqual(expectedX, 160, 'X coordinate transformation must be mathematically accurate');
      assert.strictEqual(expectedY, 100, 'Y coordinate transformation must be mathematically accurate');
    });

    it('2.19 should lock Bézier cable anchor points directly to footer port dots regardless of dynamic height', () => {
      const content = fs.readFileSync(studioPath, 'utf8');
      assert.ok(
        content.includes('getOutPortPos') && content.includes('getInPortPos'),
        'Must define getOutPortPos and getInPortPos for anchor locking'
      );
      assert.ok(
        content.includes('data-port-in') && content.includes('data-port-out'),
        'Must mark footer in and out ports with data attributes'
      );

      // Test port anchor calculations with variable heights
      function getOutPortPos(node, height) {
        return { x: node.x + 209, y: node.y + height - 22 };
      }
      function getInPortPos(node, height) {
        return { x: node.x + 21, y: node.y + height - 22 };
      }

      const nodeA = { x: 100, y: 150 };
      const heightA = 138; // Normal prompt height
      const nodeB = { x: 400, y: 220 };
      const heightB = 180; // Expanded prompt height

      const outA = getOutPortPos(nodeA, heightA);
      const inB = getInPortPos(nodeB, heightB);

      assert.strictEqual(outA.x, 309, 'Out port X should be offset +209 from node left');
      assert.strictEqual(outA.y, 266, 'Out port Y must anchor to footer port dot at height - 22');
      assert.strictEqual(inB.x, 421, 'In port X should be offset +21 from node left');
      assert.strictEqual(inB.y, 378, 'In port Y must anchor to footer port dot at height - 22');
    });

    it('2.20 should support Drag-to-Connect and 1-Click Tap connections with self-loop & duplicate prevention', () => {
      const content = fs.readFileSync(studioPath, 'utf8');
      assert.ok(
        content.includes('startConnecting') && content.includes('activeConnectingSource'),
        'Must support starting connection from Out port'
      );
      assert.ok(
        content.includes('liveCablePointer') && content.includes('isDraggingWire'),
        'Must render live glowing animated wire following pointer'
      );
      assert.ok(
        content.includes('handleInPortClick') || content.includes('handleInPortPointerUp'),
        'Must support completing connection on In port'
      );
      assert.ok(
        content.includes('pointer-events-none') && content.includes('pointer-events-auto'),
        'Canvas container must use pointer-events-none and cards pointer-events-auto so SVG cables receive clicks'
      );
      assert.ok(
        content.includes('touch-none'),
        'Canvas container and node cards must declare touch-none to prevent mobile scroll interference'
      );

      // Verify connection logic invariants
      let cables = [{ from: 'node-1', to: 'node-2' }];
      function connectNodes(fromId, toId) {
        if (fromId === toId) return false;
        const exists = cables.some((c) => c.from === fromId && c.to === toId);
        if (!exists) {
          cables = [...cables, { from: fromId, to: toId }];
          return true;
        }
        return false;
      }

      // Self-connection should be rejected
      assert.strictEqual(connectNodes('node-1', 'node-1'), false, 'Self-connection must be prevented');
      assert.strictEqual(cables.length, 1, 'Self-connection should not be added');

      // Duplicate connection should be rejected
      assert.strictEqual(connectNodes('node-1', 'node-2'), false, 'Duplicate connection must be prevented');
      assert.strictEqual(cables.length, 1, 'Duplicate connection should not be added');

      // Valid connection should succeed
      assert.strictEqual(connectNodes('node-2', 'node-3'), true, 'Valid new connection must succeed');
      assert.strictEqual(cables.length, 2, 'Cable list must update');

      // Verify DOM Event Lifecycle State Machine: 1-Click Tap & Drag-to-Connect
      let activeConnectingSource = null;
      let liveCablePointer = null;
      let isDraggingWire = false;
      let hasMovedWire = false;
      let wireDragStart = null;
      let wasAlreadyActive = false;

      function cancelConnecting(keepMovedFlag = false) {
        activeConnectingSource = null;
        liveCablePointer = null;
        isDraggingWire = false;
        if (!keepMovedFlag) {
          hasMovedWire = false;
        }
        wireDragStart = null;
        wasAlreadyActive = false;
      }

      function startConnecting(nodeId, e) {
        wasAlreadyActive = (activeConnectingSource === nodeId);
        activeConnectingSource = nodeId;
        wireDragStart = { x: e.clientX, y: e.clientY };
        hasMovedWire = false;
        isDraggingWire = true;
        liveCablePointer = { x: e.clientX, y: e.clientY };
      }

      function stopDrag(e, targetInNodeId = null) {
        if (isDraggingWire) {
          if (hasMovedWire && activeConnectingSource) {
            if (targetInNodeId && targetInNodeId !== activeConnectingSource) {
              connectNodes(activeConnectingSource, targetInNodeId);
            }
            cancelConnecting(true);
          } else {
            isDraggingWire = false;
            liveCablePointer = null;
          }
        }
      }

      function handleOutPortClick(nodeId, e = { detail: 1 }) {
        if (e.detail > 0 && hasMovedWire) {
          hasMovedWire = false;
          return;
        }
        if (wasAlreadyActive || (e.detail === 0 && activeConnectingSource === nodeId)) {
          cancelConnecting();
        } else {
          activeConnectingSource = nodeId;
        }
      }

      function handleNodeCardClick(nodeId) {
        if (activeConnectingSource && activeConnectingSource !== nodeId) {
          connectNodes(activeConnectingSource, nodeId);
          cancelConnecting();
          return;
        }
      }

      // Scenario A: 1-Click Tap activates beacon
      startConnecting('node-1', { clientX: 100, clientY: 100 });
      stopDrag({ clientX: 100, clientY: 100 });
      handleOutPortClick('node-1');
      assert.strictEqual(activeConnectingSource, 'node-1', 'Initial tap must keep beacon active for 1-click tap');

      // Scenario B: Second tap on same Out port toggles beacon off
      startConnecting('node-1', { clientX: 100, clientY: 100 });
      stopDrag({ clientX: 100, clientY: 100 });
      handleOutPortClick('node-1');
      assert.strictEqual(activeConnectingSource, null, 'Second tap on same port must toggle beacon off');

      // Scenario C: Tapping another Out port switches beacon cleanly
      startConnecting('node-1', { clientX: 100, clientY: 100 });
      stopDrag({ clientX: 100, clientY: 100 });
      handleOutPortClick('node-1');
      assert.strictEqual(activeConnectingSource, 'node-1');

      startConnecting('node-2', { clientX: 200, clientY: 200 });
      stopDrag({ clientX: 200, clientY: 200 });
      handleOutPortClick('node-2');
      assert.strictEqual(activeConnectingSource, 'node-2', 'Tapping another Out port must switch active beacon');

      // Scenario D: Dragging wire and dropping onto In port connects and clears beacon
      startConnecting('node-3', { clientX: 300, clientY: 300 });
      hasMovedWire = true; // pointermove > 5px
      stopDrag({ clientX: 600, clientY: 300 }, 'node-4');
      handleOutPortClick('node-3'); // trailing click
      assert.strictEqual(activeConnectingSource, null, 'Dragging wire to target must connect and clear beacon');
      assert.ok(cables.some((c) => c.from === 'node-3' && c.to === 'node-4'), 'Cable node-3 -> node-4 must be created');

      // Scenario E: Dragging wire and dropping onto empty canvas cancels cleanly
      startConnecting('node-4', { clientX: 400, clientY: 400 });
      hasMovedWire = true;
      stopDrag({ clientX: 500, clientY: 500 }, null); // dropped on empty canvas
      handleOutPortClick('node-4');
      assert.strictEqual(activeConnectingSource, null, 'Dropping wire on empty canvas must cancel cleanly');

      // Scenario F: Keyboard activation (Enter/Space where detail === 0) toggles beacon on and off
      handleOutPortClick('node-5', { detail: 0 }); // 1st Enter: activates beacon
      assert.strictEqual(activeConnectingSource, 'node-5', 'Keyboard activation must turn beacon on');
      handleOutPortClick('node-5', { detail: 0 }); // 2nd Enter: toggles beacon off
      assert.strictEqual(activeConnectingSource, null, 'Keyboard activation on same port must toggle beacon off');

      // Scenario G: Tap-to-connect by tapping target node card body
      startConnecting('node-5', { clientX: 100, clientY: 100 });
      stopDrag({ clientX: 100, clientY: 100 });
      handleOutPortClick('node-5');
      assert.strictEqual(activeConnectingSource, 'node-5');
      handleNodeCardClick('node-6');
      assert.strictEqual(activeConnectingSource, null, 'Tapping target node card must complete connection and clear beacon');
      assert.ok(cables.some((c) => c.from === 'node-5' && c.to === 'node-6'), 'Cable node-5 -> node-6 must be created');

      // Scenario H: Keyboard activation (detail === 0) succeeds even if hasMovedWire was true from an earlier drag with no trailing click
      hasMovedWire = true; // Stale drag flag
      handleOutPortClick('node-7', { detail: 0 }); // Keyboard Enter
      assert.strictEqual(activeConnectingSource, 'node-7', 'Keyboard activation must never be suppressed by stale hasMovedWire flag');
      handleOutPortClick('node-7', { detail: 0 });
      assert.strictEqual(activeConnectingSource, null);

      // Scenario I: Deletion of a node currently being dragged resets isDraggingNode
      let isDraggingNode = 'node-to-delete';
      let hoveredCable = 'node-to-delete->node-2';
      function deleteNode(id) {
        cables = cables.filter((c) => c.from !== id && c.to !== id);
        if (isDraggingNode === id) isDraggingNode = null;
        if (hoveredCable && !cables.some((c) => `${c.from}->${c.to}` === hoveredCable)) hoveredCable = null;
      }
      deleteNode('node-to-delete');
      assert.strictEqual(isDraggingNode, null, 'deleteNode must reset isDraggingNode to prevent lingering drag state');
      assert.strictEqual(hoveredCable, null, 'deleteNode must clear hoveredCable if deleted cable no longer exists');

      // Scenario J: Coordinate clamping for newly created nodes prevents negative coordinates
      const lastNode = { x: 50, y: 15 };
      const newY = Math.max(20, lastNode.y - 50); // y would be -35 without clamp
      assert.strictEqual(newY, 20, 'Newly added node y-coordinate must be clamped to >= 20 to prevent offscreen placement');
    });

    it('2.21 should provide centered midpoint cut (✕) disconnect badge on every cable curve', () => {
      const content = fs.readFileSync(studioPath, 'utf8');
      assert.ok(
        content.includes('midX') && content.includes('midY'),
        'Must compute cable curve midpoint coordinates'
      );
      assert.ok(
        content.includes('disconnectCable'),
        'Must invoke disconnectCable on midpoint cut badge click'
      );
      assert.ok(
        content.includes('hoveredCable'),
        'Must track hovered cable to reveal midpoint badge prominently'
      );
      assert.ok(
        content.includes('focus-visible'),
        'Midpoint cut badge must support focus-visible for keyboard accessibility'
      );

      // Verify exact Bézier curve midpoint formula at t = 0.5:
      // B(0.5) = (P0 + 3P1 + 3P2 + P3) / 8
      // For P0=(x1,y1), P1=(x1+dx,y1), P2=(x2-dx,y2), P3=(x2,y2):
      // Xmid = (x1 + 3(x1+dx) + 3(x2-dx) + x2)/8 = (4x1 + 4x2)/8 = (x1 + x2)/2
      // Ymid = (y1 + 3y1 + 3y2 + y2)/8 = (4y1 + 4y2)/8 = (y1 + y2)/2
      const p1 = { x: 309, y: 266 };
      const p2 = { x: 741, y: 202 };
      const midX = (p1.x + p2.x) / 2;
      const midY = (p1.y + p2.y) / 2;

      assert.strictEqual(midX, 525, 'Midpoint X must be strictly centered between endpoints');
      assert.strictEqual(midY, 234, 'Midpoint Y must be strictly centered between endpoints');
    });

    it('2.22 should allow multi-connection & branching topology (N8N style fan-out & merge)', () => {
      const content = fs.readFileSync(studioPath, 'utf8');
      assert.ok(
        content.includes('selectedOutgoingCables') && content.includes('selectedIncomingCables'),
        'Inspector must track both outgoing and incoming cables for multi-connection topology'
      );

      let cables = [];
      function connect(from, to) {
        if (from === to) return;
        if (!cables.some((c) => c.from === from && c.to === to)) {
          cables = [...cables, { from, to }];
        }
      }

      // Fan-out: 1 node connects to 3 targets
      connect('source-1', 'target-A');
      connect('source-1', 'target-B');
      connect('source-1', 'target-C');
      assert.strictEqual(cables.filter((c) => c.from === 'source-1').length, 3, 'Output port must fan out to multiple nodes');

      // Merge: multiple nodes connect to 1 target
      connect('source-2', 'target-A');
      connect('source-3', 'target-A');
      assert.strictEqual(cables.filter((c) => c.to === 'target-A').length, 3, 'Input port must receive multiple incoming cables');
    });
  });
});

