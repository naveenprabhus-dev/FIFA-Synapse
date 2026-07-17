/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

interface LoadingSpinnerProps {
  message?: string;
  fullScreen?: boolean;
}

export function LoadingSpinner({ message = 'Orchestrating Synapse Intelligence...', fullScreen = false }: LoadingSpinnerProps) {
  const content = (
    <div className="flex flex-col items-center justify-center p-6 text-center space-y-4">
      {/* Premium Multi-Ring Spinner representing the Synapse loop */}
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 border-4 border-blue-500/10 rounded-full" />
        <div className="absolute inset-0 border-4 border-t-blue-500 rounded-full animate-spin" />
        <div className="absolute inset-2 border-4 border-slate-800/80 rounded-full" />
        <div className="absolute inset-2 border-4 border-b-amber-500 rounded-full animate-spin [animation-duration:1.5s]" />
      </div>
      <div className="space-y-1">
        <p className="text-sm font-medium tracking-wider text-slate-200 font-sans uppercase">FIFA Synapse</p>
        <p className="text-xs text-slate-400 font-mono">{message}</p>
      </div>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950">
        {content}
      </div>
    );
  }

  return content;
}
