import { useState, useEffect, createContext, useContext } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

interface PWAContextType {
  deferredPrompt: BeforeInstallPromptEvent | null;
  isInstalled: boolean;
  isIOS: boolean;
  triggerInstall: () => Promise<void>;
}

const PWAContext = createContext<PWAContextType>({
  deferredPrompt: null,
  isInstalled: false,
  isIOS: false,
  triggerInstall: async () => {},
});

export const usePWA = () => useContext(PWAContext);

export const PWAProvider = ({ children }: { children: React.ReactNode }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS] = useState(() => /iPad|iPhone|iPod/.test(navigator.userAgent));

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);

    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
    }

    window.addEventListener("appinstalled", () => setIsInstalled(true));

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const triggerInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") setIsInstalled(true);
    setDeferredPrompt(null);
  };

  return (
    <PWAContext.Provider value={{ deferredPrompt, isInstalled, isIOS, triggerInstall }}>
      {children}
    </PWAContext.Provider>
  );
};
