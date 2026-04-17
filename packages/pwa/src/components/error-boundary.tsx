import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary] Erro capturado:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#F5EDE0] p-6">
          <div className="w-full max-w-sm text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#C65D3E]/10">
              <svg className="h-8 w-8 text-[#C65D3E]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="mb-2 font-display text-lg font-semibold text-[#0A0F1E]">
              Algo correu mal
            </h2>
            <p className="mb-6 text-sm text-[#0A0F1E]/70">
              Ocorreu um erro inesperado. Tente novamente ou recarregue a pagina.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={this.handleReset}
                className="rounded-lg border border-[#0A0F1E]/20 bg-white px-4 py-2 text-sm font-medium text-[#0A0F1E] transition-colors hover:bg-[#0A0F1E]/5"
              >
                Tentar de novo
              </button>
              <button
                onClick={this.handleReload}
                className="rounded-lg bg-[#C9A84C] px-4 py-2 text-sm font-medium text-[#0A0F1E] transition-colors hover:bg-[#C9A84C]/90"
              >
                Recarregar
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
