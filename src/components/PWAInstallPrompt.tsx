"use client";

import { useEffect, useRef, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function PWAInstallPrompt() {
  const [show, setShow] = useState(false);
  const [notifState, setNotifState] = useState<"idle" | "loading" | "granted" | "denied">("idle");
  const deferredPrompt = useRef<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }

    if (window.matchMedia("(display-mode: standalone)").matches) return;
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

  async function handleEnableNotifications() {
    if (!("Notification" in window) || !("serviceWorker" in navigator)) return;
    setNotifState("loading");
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      setNotifState("denied");
      return;
    }
    try {
      const reg = await navigator.serviceWorker.ready;
      const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!vapidKey) { setNotifState("granted"); return; }

      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey),
      });
      await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sub),
      });
      setNotifState("granted");
    } catch {
      setNotifState("granted");
    }
  }

  if (!show) return null;

  const showNotifButton =
    typeof window !== "undefined" &&
    "Notification" in window &&
    Notification.permission === "default" &&
    notifState !== "granted";

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

        <button
          onClick={handleDismiss}
          aria-label="Dismiss"
          className="shrink-0 text-[#f5f0eb]/40 hover:text-[#f5f0eb]/80 transition-colors text-lg leading-none"
        >
          ×
        </button>
      </div>

      <div className="mt-3 flex flex-col gap-2">
        <button
          onClick={handleInstall}
          className="w-full rounded-xl bg-[#f0c855] py-2.5 text-sm font-semibold text-[#0b1220] hover:bg-[#f5d570] active:scale-95 transition-all"
        >
          Download app
        </button>

        {showNotifButton && (
          <button
            onClick={handleEnableNotifications}
            disabled={notifState === "loading"}
            className="w-full rounded-xl py-2 text-xs font-medium text-[#f5f0eb]/50 hover:text-[#f5f0eb]/80 border border-white/10 hover:border-white/25 transition-all disabled:opacity-40"
          >
            {notifState === "loading" ? "…" : "🔔 Enable streak reminders"}
          </button>
        )}
        {notifState === "granted" && (
          <p className="text-center text-xs text-green-400/80">🔔 Notifications enabled!</p>
        )}
        {notifState === "denied" && (
          <p className="text-center text-xs text-[#f5f0eb]/30">Notifications blocked in browser settings.</p>
        )}
      </div>
    </div>
  );
}

function urlBase64ToUint8Array(base64String: string): ArrayBuffer {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const arr = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) arr[i] = rawData.charCodeAt(i);
  return arr.buffer as ArrayBuffer;
}
