/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type HookStatus = 'IDLE' | 'LOADING' | 'SUCCESS' | 'ERROR' | 'EMPTY';

export interface HookResult<T> {
  data: T | null;
  status: HookStatus;
  error: Error | null;
  loading: boolean;
  retry: () => Promise<void>;
}
