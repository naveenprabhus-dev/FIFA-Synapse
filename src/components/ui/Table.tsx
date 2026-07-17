/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ReactNode } from 'react';

export interface TableColumn<T> {
  key: string;
  header: string;
  render?: (row: T, index: number) => ReactNode;
}

export interface TableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  emptyMessage?: string;
}

export function Table<T>({ columns, data, emptyMessage = 'No stadium telemetry records found.' }: TableProps<T>) {
  return (
    <div className="w-full overflow-x-auto rounded-xl border border-slate-900 bg-slate-950/20">
      <table className="w-full text-left border-collapse font-sans text-xs sm:text-sm">
        {/* Table Header */}
        <thead>
          <tr className="border-b border-slate-900 bg-slate-950/40">
            {columns.map((col) => (
              <th
                key={col.key}
                className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400 font-sans"
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>

        {/* Table Body */}
        <tbody className="divide-y divide-slate-900 text-slate-300">
          {data.length > 0 ? (
            data.map((row, rowIdx) => (
              <tr key={rowIdx} className="hover:bg-slate-900/10 transition-colors">
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3 align-middle">
                    {col.render ? col.render(row, rowIdx) : (row as Record<string, unknown>)[col.key] as ReactNode}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length} className="px-4 py-12 text-center text-slate-500 font-sans">
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

// ============================================================================
// Pagination Helper
// ============================================================================
export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between py-3 px-1">
      <span className="text-[10px] sm:text-xs text-slate-500 font-mono uppercase tracking-wider">
        Page {currentPage} of {totalPages}
      </span>
      <div className="flex items-center space-x-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-2.5 py-1 text-xs font-medium font-mono rounded border border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-200 hover:bg-slate-900 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
        >
          Previous
        </button>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-2.5 py-1 text-xs font-medium font-mono rounded border border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-200 hover:bg-slate-900 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
        >
          Next
        </button>
      </div>
    </div>
  );
}
