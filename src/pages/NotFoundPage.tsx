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
    <div className="flex-1 flex items-center justify-center py-12 px-4">
      <Card className="max-w-md w-full border border-slate-800 text-center space-y-5">
        <div className="mx-auto w-12 h-12 bg-slate-950 rounded-full flex items-center justify-center text-blue-400">
          <HelpCircle className="w-6 h-6 animate-bounce" />
        </div>
        <div className="space-y-1.5">
          <h3 className="text-lg font-bold text-slate-100 font-sans uppercase tracking-wider">
            Sector Not Found
          </h3>
          <p className="text-sm text-slate-400 font-sans leading-relaxed">
            The coordinates or section you requested is outside the mapped stadium layout configuration.
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
