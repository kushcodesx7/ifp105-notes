"use client";

import { Component, ReactNode } from "react";

interface Props { children: ReactNode; fallback?: ReactNode; }
interface State { hasError: boolean; error?: Error; }

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="min-h-[50vh] flex flex-col items-center justify-center px-6 text-center">
          <div className="text-4xl mb-4">😵</div>
          <h2 className="text-xl font-bold text-zinc-200 mb-2">Something went wrong</h2>
          <p className="text-sm text-zinc-500 mb-6 max-w-md">
            This page encountered an error. Try refreshing, or go back to the home page.
          </p>
          <a
            href="/"
            className="px-6 py-2.5 rounded-full text-sm font-semibold text-white"
            style={{ background: 'linear-gradient(135deg, #4F46E5, #7C3AED)' }}
          >
            ← Back to Home
          </a>
        </div>
      );
    }
    return this.props.children;
  }
}
