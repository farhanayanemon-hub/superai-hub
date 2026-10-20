/**
 * Svelte Action: draggableScroll
 * 
 * Enables smooth mouse click-and-drag horizontal scrolling on overflow containers
 * (such as category bars, pill selectors, and horizontal tab carousels).
 * Automatically intercepts and suppresses accidental button click events if the user
 * dragged more than 4 pixels.
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
    startX = e.pageX - node.offsetLeft;
    scrollLeftStart = node.scrollLeft;
  };

  const onMouseMove = (e: MouseEvent) => {
    if (!isDown) return;
    const x = e.pageX - node.offsetLeft;
    const delta = x - startX;
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

  const onMouseLeave = () => {
    // If mouse leaves node during drag, let window listeners handle it until mouseup
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
  node.addEventListener('mouseleave', onMouseLeave);
  node.addEventListener('click', onClickCapture, true);

  if (typeof window !== 'undefined') {
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  }

  return {
    destroy() {
      if (resetDragTimer) clearTimeout(resetDragTimer);
      node.removeEventListener('mousedown', onMouseDown);
      node.removeEventListener('mouseleave', onMouseLeave);
      node.removeEventListener('click', onClickCapture, true);
      if (typeof window !== 'undefined') {
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
      }
    }
  };
}
