'use client';

import { useEffect, useState } from 'react';
import { Download, Smartphone, CheckCircle } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function AppInstallButton() {
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showIOSSteps, setShowIOSSteps] = useState(false);
  const [installing, setInstalling] = useState(false);

  useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    const ios =
      /iphone|ipad|ipod/i.test(navigator.userAgent) &&
      !(window.navigator as unknown as { standalone?: boolean }).standalone;
    setIsIOS(ios);

    const handler = (e: Event) => {
      e.preventDefault();
      setInstallEvent(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!installEvent) return;
    setInstalling(true);
    await installEvent.prompt();
    const { outcome } = await installEvent.userChoice;
    if (outcome === 'accepted') setIsInstalled(true);
    setInstallEvent(null);
    setInstalling(false);
  };

  if (isInstalled) {
    return (
      <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
        <a
          href="/dashboard"
          className="inline-flex items-center justify-center gap-2.5 px-7 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold rounded-xl transition-all shadow-lg shadow-emerald-500/20"
        >
          <CheckCircle size={18} />
          Open Dashboard
        </a>
      </div>
    );
  }

  if (isIOS) {
    return (
      <div className="flex flex-col gap-3 justify-center lg:justify-start">
        <button
          onClick={() => setShowIOSSteps(!showIOSSteps)}
          className="inline-flex items-center justify-center gap-2.5 px-7 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold rounded-xl transition-all shadow-lg shadow-emerald-500/20"
        >
          <Smartphone size={18} />
          Install on iPhone / iPad
        </button>
        {showIOSSteps && (
          <div className="bg-white/10 border border-white/20 rounded-xl px-5 py-4 text-left">
            <p className="text-white text-sm font-semibold mb-2">To install:</p>
            <ol className="text-slate-300 text-sm space-y-1 list-decimal list-inside">
              <li>Tap the <strong className="text-white">Share</strong> button at the bottom of Safari</li>
              <li>Scroll down and tap <strong className="text-white">Add to Home Screen</strong></li>
              <li>Tap <strong className="text-white">Add</strong> — done!</li>
            </ol>
          </div>
        )}
      </div>
    );
  }

  // Android / Desktop Chrome — install prompt is available
  if (installEvent) {
    return (
      <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
        <button
          onClick={handleInstall}
          disabled={installing}
          className="inline-flex items-center justify-center gap-2.5 px-7 py-3.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-70 text-white font-semibold rounded-xl transition-all shadow-lg shadow-emerald-500/20"
        >
          <Download size={18} />
          {installing ? 'Installing…' : 'Install the App'}
        </button>
      </div>
    );
  }

  // Fallback: prompt not available (already installed, or not yet triggered)
  return (
    <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
      <a
        href="/dashboard"
        className="inline-flex items-center justify-center gap-2.5 px-7 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold rounded-xl transition-all shadow-lg shadow-emerald-500/20"
      >
        <Smartphone size={18} />
        Open the App
      </a>
    </div>
  );
}
