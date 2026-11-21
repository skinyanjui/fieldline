import React from 'react';
import { Button } from '@/components/ui/button';

interface ErrorBoundaryState {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    let displayMessage = 'An unexpected error occurred while loading community data.';
    try {
      const parsed = JSON.parse(error.message) as { error?: string; operationType?: string };
      if (parsed.error) {
        if (parsed.error.includes('Quota exceeded')) {
          displayMessage =
            'Daily database quota has been reached. Quota resets tomorrow—please try again later.';
        } else if (parsed.error.includes('permission')) {
          displayMessage =
            'You do not have permission to complete that action. Try signing in with a verified Google account.';
        } else {
          displayMessage = parsed.error;
        }
      }
    } catch {
      if (error.message) {
        displayMessage = error.message;
      }
    }
    return { hasError: true, message: displayMessage };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo): void {
    console.error('Application ErrorBoundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-6 py-16">
          <div className="max-w-md w-full border border-border bg-card rounded-lg p-8 space-y-4">
            <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
              Fieldline Recovery
            </p>
            <h1 className="font-serif text-2xl font-medium text-foreground">
              Something interrupted your trail session.
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {this.state.message}
            </p>
            <div className="pt-2 flex items-center gap-3">
              <Button
                onClick={() => {
                  this.setState({ hasError: false, message: '' });
                  window.location.reload();
                }}
              >
                Reload Fieldline
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
