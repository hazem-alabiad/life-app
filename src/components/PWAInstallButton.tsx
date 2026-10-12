import React, { useState } from 'react';
import { Download, Smartphone, X, Check, Share2, PlusSquare } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC<{ variant?: 'header' | 'sidebar' | 'settings' }> = ({
  variant = 'header',
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuide, setShowGuide] = useState(false);

  // If already running in standalone PWA mode, hide install button
  if (isInstalled) {
    return null;
  }

  // Button styling based on variant
  const getButtonClass = () => {
    if (variant === 'sidebar') {
      return 'w-full py-2 px-3 rounded-xl bg-[#171d28] hover:bg-[#202737] border border-white/10 text-xs font-semibold text-slate-300 hover:text-white flex items-center justify-center gap-2 transition-colors cursor-pointer';
    }
    if (variant === 'settings') {
      return 'w-full py-2.5 px-3 rounded-xl bg-[#1e2535] hover:bg-[#283247] border border-cyan-400/30 text-xs font-semibold text-cyan-300 flex items-center justify-center gap-2 transition-colors cursor-pointer';
    }
    // header
    return 'flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#141b24] hover:bg-[#1d2633] border border-[#34d399]/30 text-xs font-semibold text-[#34d399] transition-all cursor-pointer';
  };

  const handleClick = () => {
    if (isInstallable) {
      install();
    } else {
      setShowGuide(true);
    }
  };

  return (
    <>
      <button
        onClick={handleClick}
        className={getButtonClass()}
        title="Install Progressive Web App on mobile home screen"
      >
        <Smartphone className="w-3.5 h-3.5 text-[#34d399]" />
        <span>Install App</span>
      </button>

      {/* Guided PWA Installation Modal (For iOS and desktop browsers) */}
      {showGuide && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-sm bg-[#121620] border border-white/10 rounded-2xl p-5 shadow-2xl space-y-4 text-white">
            <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-[#34d399]" />
                <h3 className="text-sm font-bold text-white">Install Life App (PWA)</h3>
              </div>
              <button
                onClick={() => setShowGuide(false)}
                className="w-7 h-7 rounded-full bg-[#1b212d] text-slate-400 hover:text-white flex items-center justify-center cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {isIOS ? (
              <div className="space-y-3 text-xs text-slate-300">
                <p className="font-semibold text-white">To install on iPhone or iPad:</p>
                <div className="p-3 rounded-xl bg-[#181d28] border border-white/5 space-y-2">
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-[#34d399]/20 text-[#34d399] flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">1</span>
                    <p>Open this page in <strong>Safari</strong>.</p>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-[#34d399]/20 text-[#34d399] flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">2</span>
                    <p className="flex items-center gap-1.5 flex-wrap">
                      Tap the <strong>Share</strong> icon <Share2 className="w-3.5 h-3.5 text-cyan-400 inline" /> at the bottom bar.
                    </p>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-[#34d399]/20 text-[#34d399] flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">3</span>
                    <p className="flex items-center gap-1.5 flex-wrap">
                      Scroll and tap <strong>Add to Home Screen</strong> <PlusSquare className="w-3.5 h-3.5 text-emerald-400 inline" />.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3 text-xs text-slate-300">
                <p className="font-semibold text-white">To install on Android or Desktop:</p>
                <div className="p-3 rounded-xl bg-[#181d28] border border-white/5 space-y-2">
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-[#34d399]/20 text-[#34d399] flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">1</span>
                    <p>Tap the browser menu <strong>(⋮)</strong> in Chrome / Edge.</p>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-[#34d399]/20 text-[#34d399] flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">2</span>
                    <p>Select <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.</p>
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={() => setShowGuide(false)}
              className="w-full py-2.5 rounded-xl bg-[#1f2635] hover:bg-[#283244] text-xs font-bold text-white transition-colors cursor-pointer"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
};
