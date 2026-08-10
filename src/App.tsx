import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { PhotoUploader } from './components/PhotoUploader';
import { HypeReceipt } from './components/HypeReceipt';
import { PatreonModal } from './components/PatreonModal';
import { ScanResult, CreditsResponse, ScanApiResponse } from './types';
import { AlertTriangle, Cpu, Flame } from 'lucide-react';

export default function App() {
  const [userId, setUserId] = useState<string>('');
  const [creditsRemaining, setCreditsRemaining] = useState<number | null>(null);
  const [patreonUrl, setPatreonUrl] = useState<string>('https://patreon.com/hypebestie');

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>('image/jpeg');

  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPatreonModalOpen, setIsPatreonModalOpen] = useState<boolean>(false);

  // Initialize persistent user ID & fetch credits
  useEffect(() => {
    let storedId = localStorage.getItem('hypebestie_user_id');
    if (!storedId) {
      storedId = 'user_' + Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
      localStorage.setItem('hypebestie_user_id', storedId);
    }
    setUserId(storedId);

    fetchCredits(storedId);
  }, []);

  const fetchCredits = async (uid: string) => {
    try {
      const res = await fetch('/api/credits', {
        headers: {
          Authorization: `Bearer ${uid}`,
        },
      });
      if (res.ok) {
        const data: CreditsResponse = await res.json();
        setCreditsRemaining(data.creditsRemaining);
        if (data.patreonUrl) {
          setPatreonUrl(data.patreonUrl);
        }
      }
    } catch (err) {
      console.error('Failed to fetch user credits:', err);
    }
  };

  const handleImageSelected = (base64: string, type: string) => {
    setSelectedImage(base64);
    setMimeType(type);
    setScanResult(null);
    setErrorMessage(null);
  };

  const handleClearImage = () => {
    setSelectedImage(null);
    setScanResult(null);
    setErrorMessage(null);
  };

  const handleStartScan = async () => {
    if (!selectedImage || !userId) return;

    setIsScanning(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userId}`,
        },
        body: JSON.stringify({
          imageBase64: selectedImage,
          mimeType,
        }),
      });

      const data: ScanApiResponse = await res.json();

      if (res.status === 402 || data.needsPatreon) {
        setCreditsRemaining(0);
        setIsPatreonModalOpen(true);
        setErrorMessage(data.error || 'Scan credits depleted. Upgrade on Patreon for 50/day!');
        return;
      }

      if (!res.ok || !data.success || !data.scanResult) {
        throw new Error(data.error || 'Failed to analyze vibe image.');
      }

      setScanResult(data.scanResult);
      if (typeof data.creditsRemaining === 'number') {
        setCreditsRemaining(data.creditsRemaining);
      }
    } catch (err: any) {
      console.error('Scan error:', err);
      setErrorMessage(err.message || 'An error occurred while scanning. Please try again.');
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-black">
      {/* Header */}
      <Header
        creditsRemaining={creditsRemaining}
        onOpenPatreon={() => setIsPatreonModalOpen(true)}
      />

      {/* Main Grid View */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 min-h-0">
        {/* Left Column: Control Room / Input Stage */}
        <section className="lg:col-span-5 p-6 sm:p-10 lg:p-12 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-white/5 bg-[#0d0d0d] relative overflow-hidden">
          {/* Subtle grid background pattern */}
          <div
            className="absolute inset-0 opacity-10 pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(#444 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }}
          />

          <div className="relative z-10 space-y-8">
            <div className="space-y-4">
              <h2 className="text-4xl sm:text-5xl font-black italic uppercase leading-none tracking-tighter text-white">
                Feed the <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-pink-500 to-yellow-400">
                  Machine.
                </span>
              </h2>
              <p className="text-gray-400 text-xs sm:text-sm max-w-sm leading-relaxed">
                Upload your selfie for a technical aura diagnostic and a thermal-grade validation receipt. Our Gemini 3.6 core is hungry for your vibe.
              </p>
            </div>

            {/* Error Banner */}
            {errorMessage && (
              <div className="bg-red-950/60 border border-red-500/30 text-red-200 p-4 rounded-xl flex items-start gap-3 shadow-lg">
                <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                <div className="flex-1 text-xs font-medium">
                  <p>{errorMessage}</p>
                  {creditsRemaining === 0 && (
                    <button
                      onClick={() => setIsPatreonModalOpen(true)}
                      className="mt-2 text-xs font-bold text-yellow-400 hover:underline cursor-pointer"
                    >
                      Refill credits on Patreon &rarr;
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Photo Uploader */}
            <PhotoUploader
              selectedImage={selectedImage}
              onImageSelected={handleImageSelected}
              onClearImage={handleClearImage}
              onStartScan={handleStartScan}
              isScanning={isScanning}
              creditsRemaining={creditsRemaining}
            />
          </div>

          {/* System Status Pill */}
          <div className="mt-8 relative z-10 p-4 bg-yellow-500/5 border border-yellow-500/20 rounded-xl flex items-center gap-3.5">
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-400 animate-pulse shrink-0" />
            <p className="text-[10px] text-yellow-400/90 font-mono leading-tight uppercase tracking-wider">
              System active: {isScanning ? 'AURA SCANNING IN PROGRESS...' : selectedImage ? 'Target locked. Ready for scan execution.' : 'Waiting for visual input... Gemini 3.6 Flash Engine Warm.'}
            </p>
          </div>
        </section>

        {/* Right Column: Receipt Output Stage */}
        <section className="lg:col-span-7 bg-[#050505] p-6 sm:p-10 lg:p-12 flex flex-col items-center justify-center relative overflow-hidden min-h-[500px]">
          {/* Ambient Glow Orbs */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 blur-[130px] rounded-full pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-pink-500/10 blur-[130px] rounded-full pointer-events-none" />

          {scanResult && selectedImage ? (
            <div className="w-full flex justify-center animate-fade-in relative z-10">
              <HypeReceipt scanResult={scanResult} userImage={selectedImage} />
            </div>
          ) : (
            <div className="relative z-10 text-center max-w-sm p-8 border border-white/5 bg-[#0f0f0f]/60 rounded-2xl backdrop-blur-md space-y-4">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-cyan-400">
                <Cpu className="w-8 h-8 animate-pulse" />
              </div>
              <div>
                <h3 className="text-base font-black italic uppercase tracking-wider text-white">
                  Receipt Output Stage
                </h3>
                <p className="text-xs text-gray-500 mt-1 font-mono">
                  {selectedImage
                    ? 'Target image loaded. Click "RUN HYPE SCAN" on the left to print your thermal receipt.'
                    : 'Select a photo or take a selfie to generate your certified thermal vibe receipt.'}
                </p>
              </div>
              <div className="pt-2 flex justify-center items-center gap-2 text-[10px] text-gray-600 font-mono uppercase tracking-widest">
                <Flame className="w-3.5 h-3.5 text-pink-500" />
                <span>HYPEBESTIE ENGINE READY</span>
              </div>
            </div>
          )}
        </section>
      </main>

      {/* Patreon Upgrade Modal */}
      <PatreonModal
        isOpen={isPatreonModalOpen}
        onClose={() => setIsPatreonModalOpen(false)}
        creditsRemaining={creditsRemaining}
        patreonUrl={patreonUrl}
      />

      {/* Footer */}
      <footer className="px-6 sm:px-8 py-3 bg-[#0a0a0a] border-t border-white/5 flex flex-wrap justify-between items-center text-[9px] text-gray-600 font-mono tracking-widest uppercase gap-2">
        <p className="flex items-center gap-2">
          <span>NODE_ENV: PRODUCTION</span>
          <span>//</span>
          <span>CLOUD_STATUS: OPTIMAL</span>
        </p>
        <div className="flex items-center gap-4">
          <span>V3.6.0-STABLE</span>
          <span>//</span>
          <span>GEMINI 3.6 FLASH</span>
        </div>
      </footer>
    </div>
  );
}

