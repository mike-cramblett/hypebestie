import React, { useRef, useState } from 'react';
import { Download, Share2, Check, Flame, ShieldCheck } from 'lucide-react';
import { toPng } from 'html-to-image';
import { ScanResult } from '../types';

interface HypeReceiptProps {
  scanResult: ScanResult;
  userImage: string;
}

export const HypeReceipt: React.FC<HypeReceiptProps> = ({ scanResult, userImage }) => {
  const receiptRef = useRef<HTMLDivElement | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [copied, setCopied] = useState(false);

  const txId = useRef(`HB-${Math.floor(100000 + Math.random() * 900000)}-X7`).current;
  const timestamp = useRef(new Date().toISOString().replace('T', ' ').substring(0, 10)).current;

  const handleDownload = async () => {
    if (!receiptRef.current) return;
    try {
      setIsDownloading(true);
      const dataUrl = await toPng(receiptRef.current, {
        quality: 0.95,
        pixelRatio: 2,
        cacheBust: true,
        backgroundColor: '#1a1a1a',
      });

      const link = document.createElement('a');
      link.download = 'HYPEBESTIE_RECEIPT.png';
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to export receipt PNG:', err);
      alert('Could not export receipt image. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleCopyText = () => {
    const shareText = `🔥 HYPEBESTIE RECEIPT 🔥\n\nStyle Archetype: ${scanResult.styleName}\nMain Character Energy: ${scanResult['MCE%']}\n\n"${scanResult.hypeText}"\n\n#HypeBESTIE #VibeScanner`;
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full flex flex-col items-center gap-5 my-2">
      {/* Receipt Action Toolbar */}
      <div className="flex flex-wrap items-center justify-center gap-3 w-full max-w-md">
        <button
          onClick={handleDownload}
          disabled={isDownloading}
          className="flex-1 flex items-center justify-center gap-2 py-3 px-5 bg-white text-black font-black uppercase text-xs tracking-widest hover:bg-cyan-400 transition-colors cursor-pointer shadow-lg active:scale-95"
        >
          <Download className="w-4 h-4" />
          <span>{isDownloading ? 'EXPORTING...' : 'DOWNLOAD PNG RECEIPT'}</span>
        </button>

        <button
          onClick={handleCopyText}
          className="flex items-center justify-center gap-2 py-3 px-4 bg-[#1a1a1a] hover:bg-[#222] border border-white/10 text-gray-200 font-bold text-xs uppercase tracking-wider active:scale-95 transition-all cursor-pointer"
          title="Share Hype Text"
        >
          {copied ? <Check className="w-4 h-4 text-cyan-400" /> : <Share2 className="w-4 h-4" />}
          <span>{copied ? 'COPIED!' : 'SHARE'}</span>
        </button>
      </div>

      {/* THERMAL RECEIPT CANVAS CONTAINER */}
      <div
        ref={receiptRef}
        className="relative w-full max-w-md bg-[#1a1a1a] shadow-2xl overflow-hidden font-mono text-xs border border-white/10 rounded-sm"
      >
        {/* Top Paper Tooth Pattern */}
        <div
          className="h-2.5 bg-[#1a1a1a] w-full"
          style={{
            background: 'repeating-linear-gradient(45deg, #111, #111 10px, #1a1a1a 10px, #1a1a1a 20px)',
          }}
        />

        <div className="p-6 sm:p-8 space-y-6">
          {/* RECEIPT HEADER (Shortened to fit single line) */}
          <div className="text-center space-y-1 border-b border-white/10 pb-4">
            <h3 className="font-mono text-xs text-gray-300 font-bold uppercase tracking-wider flex items-center justify-center gap-2 whitespace-nowrap">
              <Flame className="w-4 h-4 text-cyan-400 shrink-0 fill-cyan-400/20" />
              <span>HYPEBESTIE RECEIPT</span>
            </h3>
            <p className="font-mono text-[10px] text-gray-500 whitespace-nowrap">
              ID: {txId} // {timestamp}
            </p>
          </div>

          {/* PHOTO THUMBNAIL & ARCHETYPE BLOCK */}
          <div className="flex items-start gap-4">
            <div className="w-20 h-20 bg-gray-900 rounded-sm overflow-hidden border border-white/10 shrink-0 grayscale contrast-125">
              <img
                src={userImage}
                alt="Scan Target"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0 space-y-2">
              {/* BADGE CONTAINER (Single line badges) */}
              <div className="flex flex-wrap gap-2 items-center">
                <span className="bg-cyan-500 text-black text-[10px] font-black px-2 py-0.5 rounded uppercase whitespace-nowrap">
                  MCE: {scanResult['MCE%']}
                </span>
                <span className="bg-pink-500 text-black text-[10px] font-black px-2 py-0.5 rounded uppercase whitespace-nowrap">
                  ALPHA_CORE
                </span>
              </div>
              <h4 className="text-sm sm:text-base font-black italic tracking-tight text-white uppercase leading-snug break-words">
                {scanResult.styleName}
              </h4>
            </div>
          </div>

          {/* BIOMETRIC SPECS */}
          <div className="space-y-1.5 py-3 border-y border-dashed border-white/10">
            {scanResult.biometricSpecs.map((spec, idx) => (
              <p key={idx} className="font-mono text-[10px] text-cyan-400 tracking-normal leading-normal break-words">
                {spec.startsWith('>') ? spec : `> ${spec}`}
              </p>
            ))}
          </div>

          {/* BESTIE TRIBUTE */}
          <div className="space-y-2">
            <span className="text-[9px] uppercase tracking-widest text-pink-400 font-bold block">
              BESTIE VALIDATION REPORT:
            </span>
            <p className="text-xs text-gray-200 font-sans font-medium leading-relaxed italic bg-black/40 p-3.5 rounded border border-white/5 break-words">
              "{scanResult.hypeText}"
            </p>
          </div>

          {/* CLEAN RECEIPT FOOTER (Shortened to fit single line) */}
          <div className="pt-4 border-t border-white/10 flex flex-col items-center gap-1 text-center">
            <div className="flex items-center gap-1.5 text-[10px] text-gray-400 uppercase font-mono whitespace-nowrap">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span>CERTIFIED BY GEMINI 3.6</span>
            </div>
            <span className="font-mono text-[9px] text-gray-500 tracking-widest uppercase">
              *{txId}*
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};