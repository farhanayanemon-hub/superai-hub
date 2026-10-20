/**
 * Svelte Action: draggableScroll
 * 
 * Enables smooth mouse click-and-drag horizontal scrolling on overflow containers
 * (such as category bars, pill selectors, and horizontal tab carousels).
 * Automatically intercepts and suppresses accidental button click events if the user
 * dragged more than 4 pixels.
 * Also enables mouse wheel translation (vertical wheel scrolls horizontally) and
 * prevents native HTML5 drag ghost interference.
 */
export function draggableScroll(node: HTMLElement) {
  let isDown = false;
  let startX = 0;
  let scrollLeftStart = 0;
  let hasDragged = false;
  let resetDragTimer: ReturnType<typeof setTimeout> | null = null;

  const onMouseDown = (e: MouseEvent) => {
    // Only primary (left) button triggers drag
    if (e.button !== 0) return;
    isDown = true;
    hasDragged = false;
    startX = e.clientX;
    scrollLeftStart = node.scrollLeft;
  };

  const onMouseMove = (e: MouseEvent) => {
    if (!isDown) return;
    // Mouse button released outside window check
    if (e.buttons === 0) {
      isDown = false;
      return;
    }
    const delta = e.clientX - startX;
    if (Math.abs(delta) > 4) {
      hasDragged = true;
    }
    if (hasDragged) {
      e.preventDefault();
      node.scrollLeft = scrollLeftStart - delta;
    }
  };

  const onMouseUp = () => {
    if (!isDown) return;
    isDown = false;
    if (hasDragged) {
      // Keep hasDragged true momentarily so the capture-phase click handler intercepts it
      if (resetDragTimer) clearTimeout(resetDragTimer);
      resetDragTimer = setTimeout(() => {
        hasDragged = false;
      }, 80);
    }
  };

  const onDragStart = (e: DragEvent) => {
    // Suppress native HTML5 element/text dragging which breaks mousemove
    e.preventDefault();
  };

  const onWheel = (e: WheelEvent) => {
    // If container can scroll horizontally and wheel event is predominantly vertical
    if (node.scrollWidth > node.clientWidth) {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX) && e.deltaY !== 0) {
        node.scrollLeft += e.deltaY;
        e.preventDefault();
      }
    }
  };

  const onClickCapture = (e: MouseEvent) => {
    if (hasDragged) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      hasDragged = false;
    }
  };

  node.addEventListener('mousedown', onMouseDown);
  node.addEventListener('dragstart', onDragStart);
  node.addEventListener('wheel', onWheel, { passive: false });
  node.addEventListener('click', onClickCapture, true);

  if (typeof window !== 'undefined') {
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('blur', onMouseUp);
  }

  return {
    destroy() {
      if (resetDragTimer) clearTimeout(resetDragTimer);
      node.removeEventListener('mousedown', onMouseDown);
      node.removeEventListener('dragstart', onDragStart);
      node.removeEventListener('wheel', onWheel);
      node.removeEventListener('click', onClickCapture, true);
      if (typeof window !== 'undefined') {
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
        window.removeEventListener('blur', onMouseUp);
      }
    }
  };
}
