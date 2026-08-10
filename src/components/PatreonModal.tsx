import React from 'react';
import { HeartHandshake, Sparkles, X, ExternalLink, CheckCircle } from 'lucide-react';

interface PatreonModalProps {
  isOpen: boolean;
  onClose: () => void;
  creditsRemaining: number | null;
  patreonUrl?: string;
}

export const PatreonModal: React.FC<PatreonModalProps> = ({
  isOpen,
  onClose,
  creditsRemaining,
  patreonUrl = 'https://patreon.com/hypebestie',
}) => {
  if (!isOpen) return null;

  const isDepleted = creditsRemaining === 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-[#151515] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl overflow-hidden text-gray-100 font-sans">
        {/* Glow backdrop effects */}
        <div className="absolute -top-16 -right-16 w-32 h-32 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-32 h-32 bg-pink-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex flex-col items-center text-center space-y-4 pt-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-400 via-pink-500 to-yellow-400 p-[2px] shadow-lg shadow-cyan-500/20">
            <div className="w-full h-full bg-[#0a0a0a] rounded-[14px] flex items-center justify-center">
              <HeartHandshake className="w-7 h-7 text-pink-400" />
            </div>
          </div>

          <div>
            <h2 className="text-xl font-black text-white uppercase italic tracking-tight">
              {isDepleted ? 'SCAN CREDITS DEPLETED' : 'JOIN THE BESTIE PACK'}
            </h2>
            <p className="text-xs text-gray-400 mt-1 max-w-xs leading-relaxed">
              {isDepleted
                ? 'Your free scan quota is empty. Upgrade on Patreon for 50 daily high-speed scans!'
                : 'Unlock high-power daily scans, priority processing, and VIP Bestie perks!'}
            </p>
          </div>

          {/* Current Status Pill */}
          <div className="w-full bg-[#0a0a0a] border border-white/5 rounded-xl p-3.5 flex items-center justify-between text-xs font-mono">
            <span className="text-gray-400">BESTIE CREDIT STATUS:</span>
            <span className={`font-bold ${isDepleted ? 'text-red-400' : 'text-cyan-400'}`}>
              {creditsRemaining !== null ? `${creditsRemaining} REMAINING` : '0 REMAINING'}
            </span>
          </div>

          {/* Benefits list */}
          <div className="w-full text-left space-y-2.5 py-1 text-xs text-gray-300">
            <div className="flex items-center gap-2.5">
              <CheckCircle className="w-4 h-4 text-cyan-400 shrink-0" />
              <span><strong>50 Daily High-Speed Scans</strong> recharged every 24h</span>
            </div>
            <div className="flex items-center gap-2.5">
              <CheckCircle className="w-4 h-4 text-cyan-400 shrink-0" />
              <span><strong>HD Thermal Receipt Exports</strong> with custom badges</span>
            </div>
            <div className="flex items-center gap-2.5">
              <CheckCircle className="w-4 h-4 text-cyan-400 shrink-0" />
              <span><strong>Support Independent Hype AI</strong> development</span>
            </div>
          </div>

          {/* Patreon Call To Action Button */}
          <a
            href={patreonUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-xl bg-gradient-to-r from-cyan-400 via-pink-500 to-yellow-400 hover:brightness-110 text-black font-black uppercase text-xs tracking-widest shadow-xl shadow-cyan-500/20 transition-all active:scale-98"
          >
            <Sparkles className="w-4 h-4" />
            <span>UPGRADE ON PATREON</span>
            <ExternalLink className="w-4 h-4 ml-1" />
          </a>

          <p className="text-[10px] text-gray-500 font-mono uppercase tracking-widest">
            CANCEL ANYTIME • INSTANT REFILL UPON JOINING
          </p>
        </div>
      </div>
    </div>
  );
};

