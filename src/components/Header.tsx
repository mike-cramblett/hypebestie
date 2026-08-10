import React from 'react';
import { HeartHandshake } from 'lucide-react';

interface HeaderProps {
  creditsRemaining: number | null;
  onOpenPatreon: () => void;
}

export const Header: React.FC<HeaderProps> = ({ creditsRemaining, onOpenPatreon }) => {
  const credits = creditsRemaining !== null ? creditsRemaining : 20;
  const progressPercent = Math.min(100, Math.max(0, (credits / 20) * 100));

  return (
    <header className="sticky top-0 z-40 flex flex-wrap items-center justify-between px-4 sm:px-8 py-3.5 border-b border-white/10 bg-[#0f0f0f] backdrop-blur-md">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 bg-gradient-to-tr from-cyan-400 to-pink-500 rounded-lg flex items-center justify-center shadow-lg shadow-cyan-500/20 shrink-0">
          <span className="font-black text-black text-lg italic tracking-tighter">HB</span>
        </div>
        <div>
          <h1 className="text-lg sm:text-xl font-bold tracking-tighter uppercase italic text-white flex items-center gap-1.5">
            HypeBESTIE <span className="text-cyan-400 italic">3.6</span>
          </h1>
          <p className="text-[10px] text-gray-500 uppercase tracking-widest font-mono hidden xs:block">
            AI Vibe Scanner &amp; Thermal Engine
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-6">
        {/* Bestie Credit Status Bar */}
        <div className="bg-[#1a1a1a] px-3.5 py-1.5 rounded-full border border-white/5 flex items-center gap-2.5 shadow-inner">
          <span className="text-[10px] text-gray-400 font-bold uppercase hidden md:inline">Bestie Status:</span>
          <div className="flex items-center gap-2">
            <div className="w-16 sm:w-20 h-2 bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-pink-500 transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className={`text-xs font-mono font-bold ${creditsRemaining === 0 ? 'text-red-400' : 'text-pink-500'}`}>
              {creditsRemaining !== null ? `${creditsRemaining}/20` : '--/20'}
            </span>
          </div>
        </div>

        {/* Upgrade Patreon Button */}
        <button
          onClick={onOpenPatreon}
          className="bg-pink-500/10 text-pink-400 border border-pink-500/20 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs font-bold hover:bg-pink-500 hover:text-white transition-colors uppercase tracking-tight flex items-center gap-1.5 cursor-pointer"
          title="Upgrade to Patreon"
        >
          <HeartHandshake className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Upgrade to Patreon</span>
          <span className="sm:hidden">Patreon</span>
        </button>
      </div>
    </header>
  );
};

