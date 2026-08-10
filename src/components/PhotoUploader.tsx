import React, { useRef } from 'react';
import { Camera, Upload, RefreshCw, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';

interface PhotoUploaderProps {
  selectedImage: string | null;
  onImageSelected: (base64: string, mimeType: string) => void;
  onClearImage: () => void;
  onStartScan: () => void;
  isScanning: boolean;
  creditsRemaining: number | null;
}

export const PhotoUploader: React.FC<PhotoUploaderProps> = ({
  selectedImage,
  onImageSelected,
  onClearImage,
  onStartScan,
  isScanning,
  creditsRemaining,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const mimeType = file.type || 'image/jpeg';
    const reader = new FileReader();

    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        onImageSelected(result, mimeType);
      }
    };

    reader.readAsDataURL(file);
    if (e.target) {
      e.target.value = '';
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Native HTML5 Hidden Inputs */}
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />
      <input
        type="file"
        accept="image/*"
        capture="user"
        ref={cameraInputRef}
        onChange={handleFileChange}
        className="hidden"
      />

      {!selectedImage ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Take Selfie Card */}
          <button
            onClick={() => cameraInputRef.current?.click()}
            className="group relative flex flex-col items-center justify-center gap-4 p-6 sm:p-8 bg-[#151515] border-2 border-dashed border-white/10 rounded-2xl hover:border-cyan-500/50 transition-all cursor-pointer text-center"
          >
            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Camera className="w-6 h-6 text-cyan-400" />
            </div>
            <span className="text-xs font-bold uppercase tracking-widest text-gray-300">
              Take Selfie
            </span>
          </button>

          {/* Upload Image Card */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="group relative flex flex-col items-center justify-center gap-4 p-6 sm:p-8 bg-[#151515] border-2 border-dashed border-white/10 rounded-2xl hover:border-pink-500/50 transition-all cursor-pointer text-center"
          >
            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Upload className="w-6 h-6 text-pink-400" />
            </div>
            <span className="text-xs font-bold uppercase tracking-widest text-gray-300">
              Upload Image
            </span>
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-5 bg-[#151515] p-5 border border-white/10 rounded-2xl">
          <div className="relative group max-w-xs w-full aspect-square rounded-xl overflow-hidden border border-cyan-500/30 shadow-2xl bg-black">
            <img
              src={selectedImage}
              alt="Scan Target"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end justify-between p-3">
              <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-cyan-400" /> TARGET LOCKED
              </span>
              <button
                onClick={onClearImage}
                disabled={isScanning}
                className="text-[10px] font-mono text-gray-400 hover:text-white underline cursor-pointer"
              >
                Change
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
            <button
              onClick={onStartScan}
              disabled={isScanning || creditsRemaining === 0}
              className={`w-full py-4 px-6 rounded-xl font-black uppercase text-xs tracking-widest transition-all cursor-pointer flex items-center justify-center gap-2 ${
                isScanning
                  ? 'bg-zinc-800 text-zinc-400 cursor-not-allowed'
                  : creditsRemaining === 0
                  ? 'bg-zinc-800 text-red-400 border border-red-500/20 cursor-not-allowed'
                  : 'bg-gradient-to-r from-cyan-400 via-pink-500 to-yellow-400 hover:brightness-110 text-black shadow-lg shadow-cyan-500/20 active:scale-98'
              }`}
            >
              {isScanning ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" />
                  <span>ANALYZING AURA SPECTRUM...</span>
                </>
              ) : creditsRemaining === 0 ? (
                <>
                  <AlertCircle className="w-4 h-4 text-red-400" />
                  <span>CREDITS DEPLETED - REFILL ON PATREON</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>RUN HYPE SCAN &amp; PRINT RECEIPT</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

