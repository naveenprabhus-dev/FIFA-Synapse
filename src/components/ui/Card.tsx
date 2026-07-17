/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { HTMLAttributes, forwardRef } from 'react';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className = '', hoverable = false, children, ...props }, ref) => {
    const baseStyle = 'bg-slate-900/40 backdrop-blur-md border border-slate-800/80 rounded-xl p-5 overflow-hidden';
    const hoverStyle = hoverable ? 'hover:bg-slate-900/70 hover:border-slate-700/80 transition-all duration-300' : '';

    return (
      <div
        ref={ref}
        className={`${baseStyle} ${hoverStyle} ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';
