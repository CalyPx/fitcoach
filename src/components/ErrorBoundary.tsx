import { Component, type ReactNode } from 'react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { useAppStore } from '@/lib/store'

interface Props {
  children: ReactNode
}

interface State {
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: { componentStack: string }) {
    console.error('Unhandled render error', error, info.componentStack)
  }

  handleReset = () => {
    useAppStore.getState().reset()
    window.location.assign('/onboarding')
  }

  render() {
    if (this.state.error) {
      return (
        <div className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-4 p-6 text-center">
          <Card className="flex flex-col items-center gap-3">
            <p className="text-lg font-semibold text-fg">Something went wrong</p>
            <p className="text-sm text-fg-muted">
              FitCoach hit an unexpected error. You can try reloading, or reset your saved data if
              the problem keeps happening.
            </p>
            <div className="flex w-full flex-col gap-2 pt-2">
              <Button onClick={() => window.location.reload()}>Reload</Button>
              <Button variant="secondary" onClick={this.handleReset}>
                Reset app data
              </Button>
            </div>
          </Card>
        </div>
      )
    }
    return this.props.children
  }
}
