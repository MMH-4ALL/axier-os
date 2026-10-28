export interface Bounds {
  position: { x: number; y: number };
  size: { width: number; height: number };
}

export function fitWindow(bounds: Bounds, viewport: { width: number; height: number }): Bounds {
  const width = Math.min(bounds.size.width, Math.max(1, viewport.width - 16));
  const height = Math.min(bounds.size.height, Math.max(1, viewport.height - 108));
  return {
    size: { width, height },
    position: {
      x: Math.max(8, Math.min(bounds.position.x, viewport.width - width - 8)),
      y: Math.max(28, Math.min(bounds.position.y, viewport.height - height - 80)),
    },
  };
}
