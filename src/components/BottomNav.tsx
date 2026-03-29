import { useNavigate, useLocation } from "react-router-dom";
import { MessageSquare, Radio, Settings, Users, Download, User } from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { usePWA } from "@/contexts/PWAContext";
import { motion } from "framer-motion";

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useApp();
  const { isInstalled, deferredPrompt, triggerInstall, isIOS } = usePWA();

  const showInstall = !isInstalled && (!!deferredPrompt || isIOS);

  const tabs = [
    { path: "/chats", icon: MessageSquare, label: t("Chats", "چیٹس"), badge: 0 },
    { path: "/groups", icon: Users, label: t("Groups", "گروپس"), badge: 0 },
    { path: "/mesh-map", icon: Radio, label: t("Mesh", "میش"), badge: 0 },
    { path: "/my-profile", icon: User, label: t("Profile", "پروفائل"), badge: 0 },
    { path: "/settings", icon: Settings, label: t("Settings", "ترتیبات"), badge: 0 },
  ];

  const isActive = (path: string) => location.pathname === path;

  const handleInstallClick = () => {
    if (deferredPrompt) {
      triggerInstall();
    } else {
      navigate("/install");
    }
  };

  return (
    <div className="border-t border-border bg-card/95 backdrop-blur-md px-2 py-1.5 safe-bottom flex items-center justify-around">
      {tabs.map((tab) => (
        <button
          key={tab.path}
          onClick={() => navigate(tab.path)}
          className="relative flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-colors"
        >
          <div className="relative">
            <tab.icon
              className={`w-5 h-5 transition-colors ${
                isActive(tab.path) ? "text-primary" : "text-muted-foreground"
              }`}
            />
            {tab.badge > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1.5 -right-2 w-4 h-4 rounded-full bg-destructive text-destructive-foreground text-[9px] font-bold flex items-center justify-center"
              >
                {tab.badge}
              </motion.span>
            )}
          </div>
          <span
            className={`text-[10px] font-medium transition-colors ${
              isActive(tab.path) ? "text-primary" : "text-muted-foreground"
            }`}
          >
            {tab.label}
          </span>
          {isActive(tab.path) && (
            <motion.div
              layoutId="activeTab"
              className="absolute -top-1.5 w-8 h-0.5 rounded-full bg-primary"
            />
          )}
        </button>
      ))}
      {showInstall && (
        <button
          onClick={handleInstallClick}
          className="relative flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-colors"
        >
          <motion.div
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Download className="w-5 h-5 text-primary" />
          </motion.div>
          <span className="text-[10px] font-medium text-primary">
            {t("Install", "انسٹال")}
          </span>
        </button>
      )}
    </div>
  );
};

export default BottomNav;
