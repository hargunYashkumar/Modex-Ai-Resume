import { Component } from 'react'

/**
 * ErrorBoundary — catches uncaught React render errors and shows a fallback UI.
 *
 * Usage:
 *   <ErrorBoundary>
 *     <MyComponent />
 *   </ErrorBoundary>
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    // In production you'd send this to Sentry / CloudWatch
    console.error('[ErrorBoundary]', error, info.componentStack)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-stone-50 flex items-center justify-center px-6">
          <div className="text-center max-w-md">
            <div className="text-5xl text-ink-200 mb-4 select-none">⚠</div>
            <h1 className="text-xl font-serif text-ink-800 mb-2">Something went wrong</h1>
            <p className="text-sm text-ink-400 mb-6 leading-relaxed">
              An unexpected error occurred. Refreshing the page usually fixes it.
            </p>
            {!import.meta.env.PROD && this.state.error && (
              <pre className="text-left text-xs bg-red-50 border border-red-200 rounded p-4 mb-6 overflow-auto max-h-40 text-red-800">
                {this.state.error.message}
              </pre>
            )}
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => this.setState({ hasError: false, error: null })}
                className="btn-outline"
              >
                Try again
              </button>
              <button
                onClick={() => window.location.href = '/dashboard'}
                className="btn-primary"
              >
                Go to dashboard
              </button>
            </div>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
