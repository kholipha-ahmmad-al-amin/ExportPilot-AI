import React from 'react';

interface State {
  failed: boolean;
}

/**
 * Guards the lazy 3D brand canvas: devices without WebGL (or with a failed
 * context) fall back instantly to the flat SVG master mark instead of
 * crashing the landing page.
 */
export class CanvasErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  componentDidCatch(): void {
    // WebGL unavailable: the SVG fallback below is the accepted rendering.
  }

  render(): React.ReactNode {
    if (this.state.failed) {
      return (
        <div className="flex items-center justify-center h-full" aria-hidden="true">
          <img src="/icon.svg" alt="" width={120} height={120} className="opacity-90" />
        </div>
      );
    }
    return this.props.children;
  }
}
