import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';
import i18n from '../i18n/config';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

/**
 * Global ErrorBoundary to catch React component errors
 * Prevents white screen crashes and shows user-friendly message
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ error, errorInfo });

    // Log to external error service (Sentry, LogRocket, etc.)
    if (typeof window !== 'undefined' && (window as any).Sentry) {
      (window as any).Sentry.captureException(error, {
        contexts: { react: { componentStack: errorInfo.componentStack } }
      });
    }
  }

  handleReload = () => {
    // Clear error state and reload
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center mb-4">
              <AlertTriangle className="h-8 w-8 text-red-500 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">{i18n.t('errors.oops')}</h1>
            </div>
            
            <p className="text-gray-700 mb-6">
              {i18n.t('errors.unexpected_error')}
            </p>

            {/* Always show error details for debugging */}
            {this.state.error && (
              <div className="mb-6 p-4 bg-red-50 rounded border border-red-200 overflow-auto max-h-96 text-left">
                <p className="font-bold text-red-800 mb-2">{i18n.t('errors.error_message')}:</p>
                <pre className="text-xs text-red-700 whitespace-pre-wrap font-mono mb-4">
                  {this.state.error.toString()}
                </pre>
                
                {this.state.errorInfo && (
                  <details>
                    <summary className="text-xs font-bold text-red-800 cursor-pointer mb-2">{i18n.t('errors.view_stack_trace')}</summary>
                    <pre className="text-xs text-red-600 whitespace-pre-wrap font-mono">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </details>
                )}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={this.handleReload}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                {i18n.t('errors.reload_page')}
              </button>
              <a
                href="/"
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition text-center"
              >
                {i18n.t('errors.back_to_home')}
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
