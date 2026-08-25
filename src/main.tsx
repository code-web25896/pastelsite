import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#F7F7F8] px-4">
          <div className="max-w-md w-full rounded-3xl bg-white border border-gray-200 shadow-xl p-6 text-center space-y-4">
            <h1 className="font-['Outfit'] font-black text-2xl text-[#0B1833]">Le site a rencontré un problème</h1>
            <p className="text-sm text-gray-600">Le chargement du front a échoué. Recharge la page une fois, puis si le problème continue, envoie-moi la première erreur rouge de la console.</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="inline-flex items-center justify-center rounded-xl bg-[#0B1833] px-4 py-2.5 text-sm font-bold text-white"
            >
              Recharger la page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const root = createRoot(document.getElementById('root')!);
root.render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);
