/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { ErrorInfo, ReactNode } from 'react';
import { AlertOctagon } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in FIFA Synapse Applet:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
          <Card className="max-w-md w-full border border-rose-500/20 bg-slate-900/40 backdrop-blur-lg">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="p-3 bg-rose-500/10 rounded-full text-rose-400">
                <AlertOctagon className="w-8 h-8" />
              </div>
              <div className="space-y-1.5">
                <h2 className="text-lg font-bold text-slate-100 font-sans uppercase tracking-wider">
                  Cognitive Link Interrupted
                </h2>
                <p className="text-sm text-slate-400 font-sans leading-relaxed">
                  A critical system exception was intercepted within the Synapse render cycle.
                </p>
                {this.state.error && (
                  <pre className="text-[10px] bg-slate-950 border border-slate-800 rounded p-3 text-rose-300 font-mono text-left max-h-32 overflow-y-auto w-full">
                    {this.state.error.message}
                  </pre>
                )}
              </div>
              <Button variant="outline" size="sm" onClick={this.handleReset} className="w-full">
                Restart Intelligence Session
              </Button>
            </div>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

