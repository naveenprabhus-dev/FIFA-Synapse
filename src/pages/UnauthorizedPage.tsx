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
    <div className="flex-1 flex items-center justify-center py-24 px-4 relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-rose-600/10 rounded-full blur-[80px] pointer-events-none" />
      
      <Card className="max-w-md w-full border border-rose-500/20 bg-[#0c0d1e]/85 backdrop-blur-xl text-center p-8 space-y-6 rounded-2xl shadow-2xl shadow-rose-950/20 relative z-10">
        <div className="mx-auto w-14 h-14 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center justify-center text-rose-400 shadow-md">
          <ShieldAlert className="w-7 h-7" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-black text-slate-100 font-sans uppercase tracking-wider bg-gradient-to-r from-rose-400 to-amber-300 bg-clip-text text-transparent">
            Access Unauthorized
          </h3>
          <p className="text-xs text-slate-400 font-sans leading-relaxed">
            Your current active security role does not hold sufficient cryptographic clearance keys for this decision segment.
          </p>
        </div>
        <div className="pt-2">
          <Button variant="outline" size="sm" onClick={() => navigate('/')} className="w-full font-mono uppercase tracking-wider text-[11px] py-2">
            Return to Command Center
          </Button>
        </div>
      </Card>
    </div>
  );
}
