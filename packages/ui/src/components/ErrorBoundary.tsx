import { Component, type ReactNode, type ErrorInfo } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (import.meta.env.DEV) {
      console.error('[ErrorBoundary]', error, info.componentStack)
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback
      return (
        <div role="alert" className="flex flex-col items-center justify-center min-h-[300px] gap-4 p-8">
          <p className="text-sm font-semibold text-gray-900">오류가 발생했습니다</p>
          <p className="text-xs text-gray-500">페이지를 새로고침하거나 잠시 후 다시 시도해 주세요.</p>
          <button
            onClick={() => { this.setState({ hasError: false, error: null }); window.location.reload() }}
            className="px-4 py-2 rounded-xl text-sm font-medium text-white bg-brand-green hover:opacity-90 transition-opacity"
          >
            새로고침
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
