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
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-6"
          style={{ backgroundColor: 'var(--brand-surface)' }}
        >
          <div className="w-full max-w-sm text-center">
            <div
              className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full"
              style={{ backgroundColor: 'color-mix(in srgb, var(--brand-secondary) 10%, transparent)' }}
            >
              <svg
                className="h-8 w-8"
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                style={{ color: 'var(--brand-secondary)' }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2
              className="mb-2 font-display text-lg font-semibold"
              style={{ color: 'var(--brand-on-surface)', fontFamily: 'var(--tenant-font-display)' }}
            >
              Algo correu mal
            </h2>
            <p
              className="mb-6 text-sm"
              style={{ color: 'color-mix(in srgb, var(--brand-on-surface) 70%, transparent)' }}
            >
              Ocorreu um erro inesperado. Tente novamente ou recarregue a pagina.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={this.handleReset}
                className="rounded-lg px-4 py-2 text-sm font-medium transition-colors"
                style={{
                  border: '1px solid color-mix(in srgb, var(--brand-on-surface) 20%, transparent)',
                  backgroundColor: 'var(--brand-surface)',
                  color: 'var(--brand-on-surface)',
                }}
              >
                Tentar de novo
              </button>
              <button
                onClick={this.handleReload}
                className="rounded-lg px-4 py-2 text-sm font-medium transition-colors"
                style={{
                  backgroundColor: 'var(--brand-accent)',
                  color: 'var(--brand-surface-dark)',
                }}
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
