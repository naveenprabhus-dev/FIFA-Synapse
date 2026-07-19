/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { HelpCircle } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useNavigate } from 'react-router-dom';

export function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="flex-1 flex items-center justify-center py-24 px-4 relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-blue-600/10 rounded-full blur-[80px] pointer-events-none" />
      
      <Card className="max-w-md w-full border border-blue-500/20 bg-[#0c0d1e]/85 backdrop-blur-xl text-center p-8 space-y-6 rounded-2xl shadow-2xl shadow-blue-950/20 relative z-10">
        <div className="mx-auto w-14 h-14 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-center justify-center text-blue-400 shadow-md">
          <HelpCircle className="w-7 h-7" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-black text-slate-100 font-sans uppercase tracking-wider bg-gradient-to-r from-blue-400 to-sky-300 bg-clip-text text-transparent">
            Sector Not Found
          </h3>
          <p className="text-xs text-slate-400 font-sans leading-relaxed">
            The coordinates or sector you requested lies outside the dynamic stadium mapping configuration.
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
