import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ShieldAlert } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="h-screen w-full bg-black text-red-500 p-10 font-mono flex flex-col items-center justify-center text-center">
          <ShieldAlert className="w-16 h-16 mb-4" />
          <h1 className="text-2xl font-black mb-2 uppercase">System Compromised</h1>
          <p className="text-gray-400 max-w-md mb-6 uppercase text-sm">
            A critical error has occurred in the neural core.
          </p>
          <div className="bg-zinc-900 border border-red-500/30 p-4 rounded-lg text-left w-full max-w-xl overflow-auto text-xs">
            <pre>{this.state.error?.stack || this.state.error?.message || 'Unknown Error'}</pre>
          </div>
          <button 
            onClick={() => window.location.reload()}
            className="mt-8 bg-red-600 hover:bg-red-500 text-white font-bold py-2 px-6 rounded-full transition-all"
          >
            REBOOT SYSTEM
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
