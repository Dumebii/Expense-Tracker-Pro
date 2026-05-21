'use client';

import { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function InstallPrompt() {
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Already installed as PWA
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // iOS detection
    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent) && !(window.navigator as unknown as { standalone?: boolean }).standalone;
    setIsIOS(ios);

    // Check if user previously dismissed
    const wasDismissed = localStorage.getItem('pwa-prompt-dismissed');
    if (wasDismissed) {
      setDismissed(true);
      return;
    }

    // Capture Chrome's install event
    const handler = (e: Event) => {
      e.preventDefault();
      setInstallEvent(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!installEvent) return;
    await installEvent.prompt();
    const { outcome } = await installEvent.userChoice;
    if (outcome === 'accepted') setIsInstalled(true);
    setInstallEvent(null);
  };

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem('pwa-prompt-dismissed', '1');
  };

  // Don't show if: already installed, dismissed, or not triggered yet (and not iOS)
  if (isInstalled || dismissed || (!installEvent && !isIOS)) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-6 md:w-80">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl p-4 shadow-2xl flex items-start gap-3">
        {/* Icon */}
        <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center shrink-0">
          <Download size={18} className="text-white" />
        </div>

        {/* Copy */}
        <div className="flex-1 min-w-0">
          <p className="text-white font-semibold text-sm">Install Nchiko</p>
          {isIOS ? (
            <p className="text-slate-400 text-xs mt-0.5 leading-relaxed">
              Tap <strong className="text-slate-300">Share</strong> then{' '}
              <strong className="text-slate-300">Add to Home Screen</strong> to install.
            </p>
          ) : (
            <p className="text-slate-400 text-xs mt-0.5 leading-relaxed">
              Add to your home screen for the full app experience.
            </p>
          )}
          {!isIOS && (
            <button
              onClick={handleInstall}
              className="mt-2 px-4 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-semibold rounded-lg transition-colors"
            >
              Install
            </button>
          )}
        </div>

        {/* Dismiss */}
        <button
          onClick={handleDismiss}
          className="text-slate-500 hover:text-slate-300 transition-colors shrink-0 mt-0.5"
          aria-label="Dismiss"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
