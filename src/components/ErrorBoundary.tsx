import React, { Component, ErrorInfo, ReactNode } from 'react';
import { RefreshCw, AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in React component tree:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleReset = () => {
    try {
      localStorage.clear();
    } catch {
      // ignore
    }
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#F7F7F8] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center border border-gray-100">
            <div className="w-16 h-16 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-[#0B1833] mb-2">Une erreur est survenue</h2>
            <p className="text-gray-600 text-sm mb-6">
              L&apos;application a rencontré un problème inattendu lors de l&apos;affichage.
            </p>
            {this.state.error && (
              <div className="bg-gray-50 p-3 rounded-lg text-left text-xs font-mono text-gray-700 mb-6 overflow-x-auto max-h-32 border border-gray-200">
                {this.state.error.message}
              </div>
            )}
            <div className="flex flex-col gap-3">
              <button
                onClick={this.handleReload}
                className="w-full flex items-center justify-center gap-2 bg-[#8FD8C3] hover:bg-[#7bc5b0] text-[#0B1833] font-semibold py-3 px-6 rounded-xl transition-colors cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                Actualiser la page
              </button>
              <button
                onClick={this.handleReset}
                className="w-full text-xs text-gray-500 hover:text-gray-800 py-2 transition-colors cursor-pointer"
              >
                Réinitialiser les données locales et recharger
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
