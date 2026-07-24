import { useCallback, useEffect, useState } from "react";

const DISMISS_KEY = "chapaquiz_pwa_install_dismissed";
const DISMISS_DAYS = 7;

function isStandalone() {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.navigator.standalone === true
  );
}

function isIos() {
  if (typeof navigator === "undefined") return false;
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

function isAndroid() {
  if (typeof navigator === "undefined") return false;
  return /android/i.test(navigator.userAgent);
}

function isMobile() {
  return isIos() || isAndroid();
}

/** PWA install over the network requires HTTPS (localhost is the only HTTP exception). */
function canInstallOnThisOrigin() {
  if (typeof window === "undefined") return false;
  if (window.isSecureContext) return true;
  const host = window.location.hostname;
  return host === "localhost" || host === "127.0.0.1";
}

function isDismissed() {
  try {
    const raw = localStorage.getItem(DISMISS_KEY);
    if (!raw) return false;
    const dismissedAt = Number(raw);
    if (!Number.isFinite(dismissedAt)) return false;
    const ms = DISMISS_DAYS * 24 * 60 * 60 * 1000;
    return Date.now() - dismissedAt < ms;
  } catch {
    return false;
  }
}

export function usePwaInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [installed, setInstalled] = useState(isStandalone);
  const [dismissed, setDismissed] = useState(isDismissed);
  const [ios] = useState(isIos);
  const [android] = useState(isAndroid);
  const [mobile] = useState(isMobile);
  const [installableOrigin] = useState(canInstallOnThisOrigin);

  useEffect(() => {
    const onBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const onInstalled = () => {
      setInstalled(true);
      setDeferredPrompt(null);
    };

    const onDisplayMode = () => setInstalled(isStandalone());

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);
    window.matchMedia("(display-mode: standalone)").addEventListener("change", onDisplayMode);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
      window.matchMedia("(display-mode: standalone)").removeEventListener("change", onDisplayMode);
    };
  }, []);

  const dismiss = useCallback(() => {
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch {
      /* ignore */
    }
    setDismissed(true);
  }, []);

  const promptInstall = useCallback(async () => {
    if (!deferredPrompt) return false;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    if (outcome === "accepted") {
      setInstalled(true);
      return true;
    }
    return false;
  }, [deferredPrompt]);

  const canNativeInstall = Boolean(deferredPrompt);
  const showIosHint = ios && !installed && !dismissed;
  const showAndroidNative = android && canNativeInstall && !installed && !dismissed;
  const showAndroidManual = android && !canNativeInstall && !installed && !dismissed;
  const showDesktopInstall = !mobile && canNativeInstall && !installed && !dismissed;
  const showDesktopManual = !mobile && !canNativeInstall && installableOrigin && !installed && !dismissed;
  const showInsecureWarning = mobile && !installableOrigin && !installed && !dismissed;

  const visible =
    showIosHint ||
    showAndroidNative ||
    showAndroidManual ||
    showDesktopInstall ||
    showDesktopManual ||
    showInsecureWarning;

  return {
    visible,
    showIosHint,
    showAndroidNative,
    showAndroidManual,
    showDesktopInstall,
    showDesktopManual,
    showInsecureWarning,
    installableOrigin,
    dismiss,
    promptInstall,
  };
}
