/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ShieldAlert } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useNavigate } from 'react-router-dom';

export function UnauthorizedPage() {
  const navigate = useNavigate();

  return (
    <div className="flex-1 flex items-center justify-center py-12 px-4">
      <Card className="max-w-md w-full border border-rose-500/20 text-center space-y-5">
        <div className="mx-auto w-12 h-12 bg-rose-500/10 rounded-full flex items-center justify-center text-rose-400">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <div className="space-y-1.5">
          <h3 className="text-lg font-bold text-slate-100 font-sans uppercase tracking-wider">
            Access Unauthorized
          </h3>
          <p className="text-sm text-slate-400 font-sans leading-relaxed">
            Your current active security role does not hold authorization metadata for this decision segment.
          </p>
        </div>
        <div className="pt-2">
          <Button variant="outline" size="sm" onClick={() => navigate('/')} className="w-full">
            Return to Gate Portal
          </Button>
        </div>
      </Card>
    </div>
  );
}
