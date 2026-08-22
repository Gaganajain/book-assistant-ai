import React, { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class CanvasErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.warn('Canvas Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="w-full h-full flex items-center justify-center p-4 text-center text-xs text-indigo-400/80">
            <div className="rounded-xl bg-slate-900/60 p-4 border border-indigo-500/20 backdrop-blur-xs">
              <span className="font-semibold">3D Scene rendering in standard mode</span>
            </div>
          </div>
        )
      );
    }
    return this.props.children;
  }
}
