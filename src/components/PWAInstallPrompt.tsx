"use client";

import { useEffect, useRef, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function PWAInstallPrompt() {
  const [show, setShow] = useState(false);
  const deferredPrompt = useRef<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    // Register service worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }

    // Already installed (standalone mode)
    if (window.matchMedia("(display-mode: standalone)").matches) return;

    // Already dismissed by the user
    if (localStorage.getItem("pwa-dismissed") === "1") return;

    const handler = (e: Event) => {
      e.preventDefault();
      deferredPrompt.current = e as BeforeInstallPromptEvent;
      setShow(true);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  async function handleInstall() {
    const prompt = deferredPrompt.current;
    if (!prompt) return;
    await prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === "dismissed") {
      localStorage.setItem("pwa-dismissed", "1");
    }
    deferredPrompt.current = null;
    setShow(false);
  }

  function handleDismiss() {
    localStorage.setItem("pwa-dismissed", "1");
    setShow(false);
  }

  if (!show) return null;

  return (
    <div
      role="dialog"
      aria-label="Install HolySnacks"
      className="fixed bottom-4 left-1/2 z-50 w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 rounded-2xl border border-white/10 bg-[#111827]/95 p-4 shadow-2xl backdrop-blur-md"
      style={{ animation: "slideUp 0.3s ease-out" }}
    >
      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translate(-50%, 1.5rem); }
          to   { opacity: 1; transform: translate(-50%, 0); }
        }
      `}</style>

      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-pink-500 text-2xl font-black text-white shadow-lg">
          H
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-[#f5f0eb]">
            Install HolySnacks
          </p>
          <p className="mt-0.5 text-xs text-[#f5f0eb]/60">
            Add to your home screen for quick access — works offline too.
          </p>
        </div>

        {/* Close */}
        <button
          onClick={handleDismiss}
          aria-label="Dismiss"
          className="shrink-0 text-[#f5f0eb]/40 hover:text-[#f5f0eb]/80 transition-colors text-lg leading-none"
        >
          ×
        </button>
      </div>

      <button
        onClick={handleInstall}
        className="mt-3 w-full rounded-xl bg-[#f0c855] py-2.5 text-sm font-semibold text-[#0b1220] hover:bg-[#f5d570] active:scale-95 transition-all"
      >
        Download app
      </button>
    </div>
  );
}
