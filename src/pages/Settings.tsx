import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  User, Sun, Moon, Globe, Shield, Bell, HardDrive, Info, ChevronRight, Wifi, Lock, Palette, Radio, ArrowLeft, Volume2, Vibrate, Delete, Download,
} from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import BottomNav from "@/components/BottomNav";
import { toast } from "sonner";

const Settings = () => {
  const navigate = useNavigate();
  const { t, language, setLanguage, isDark, toggleTheme, clearedData, clearDataCategory, clearAllData } = useApp();
  const [appLock, setAppLock] = useState(() => localStorage.getItem("zanjeer_app_lock") === "true");
  const [notifications, setNotifications] = useState(true);
  const [sound, setSound] = useState(true);
  const [vibration, setVibration] = useState(true);
  const [activePanel, setActivePanel] = useState<string | null>(null);

  // PIN dialog states
  const [showPinDialog, setShowPinDialog] = useState(false);
  const [pinStep, setPinStep] = useState<"set" | "confirm" | "unlock">("set");
  const [pinValue, setPinValue] = useState("");
  const [savedPin, setSavedPin] = useState(() => localStorage.getItem("zanjeer_pin") || "");
  const [firstPin, setFirstPin] = useState("");
  const [pinError, setPinError] = useState("");

  const handleAppLockPress = () => {
    if (!appLock) {
      // Setting up new PIN
      setPinStep("set");
      setPinValue("");
      setFirstPin("");
      setPinError("");
      setShowPinDialog(true);
    } else {
      // Unlocking - ask for PIN
      setPinStep("unlock");
      setPinValue("");
      setPinError("");
      setShowPinDialog(true);
    }
  };

  const handlePinDigit = (digit: string) => {
    if (pinValue.length >= 4) return;
    const newPin = pinValue + digit;
    setPinValue(newPin);
    setPinError("");

    if (newPin.length === 4) {
      setTimeout(() => {
        if (pinStep === "set") {
          setFirstPin(newPin);
          setPinStep("confirm");
          setPinValue("");
        } else if (pinStep === "confirm") {
          if (newPin === firstPin) {
            setSavedPin(newPin);
            localStorage.setItem("zanjeer_pin", newPin);
            setAppLock(true);
            localStorage.setItem("zanjeer_app_lock", "true");
            setShowPinDialog(false);
            toast.success(t("App Lock enabled with PIN", "PIN کے ساتھ ایپ لاک فعال"));
          } else {
            setPinError(t("PINs don't match, try again", "PIN مماثل نہیں، دوبارہ کوشش کریں"));
            setPinValue("");
            setPinStep("set");
            setFirstPin("");
          }
        } else if (pinStep === "unlock") {
          if (newPin === savedPin) {
            setAppLock(false);
            localStorage.removeItem("zanjeer_app_lock");
            setSavedPin("");
            localStorage.removeItem("zanjeer_pin");
            setShowPinDialog(false);
            toast.success(t("App Lock disabled", "ایپ لاک غیر فعال"));
          } else {
            setPinError(t("Wrong PIN, try again", "غلط PIN، دوبارہ کوشش کریں"));
            setPinValue("");
          }
        }
      }, 200);
    }
  };

  const handlePinDelete = () => {
    setPinValue(pinValue.slice(0, -1));
    setPinError("");
  };

  const settingGroups = [
    {
      label: t("Network", "نیٹ ورک"),
      items: [
        { icon: Wifi, label: t("Mesh Network", "میش نیٹ ورک"), desc: t("Always ON · Works without internet/data", "ہمیشہ آن · بغیر انٹرنیٹ/ڈیٹا کام کرتا ہے"), action: "locked" as const, value: true },
        { icon: Radio, label: t("Relay Messages", "ریلے پیغامات"), desc: t("Always ON · Bluetooth/WiFi Direct", "ہمیشہ آن · بلوٹوتھ/وائی فائی ڈائریکٹ"), action: "locked" as const, value: true },
      ],
    },
    {
      label: t("Appearance", "ظاہری شکل"),
      items: [
        { icon: isDark ? Moon : Sun, label: t("Dark Mode", "ڈارک موڈ"), desc: t(isDark ? "Dark theme active" : "Light theme active", isDark ? "ڈارک تھیم فعال" : "لائٹ تھیم فعال"), action: "theme" as const, value: isDark },
        { icon: Globe, label: t("Language", "زبان"), desc: language === "en" ? "English" : "اردو", action: "language" as const },
      ],
    },
    {
      label: t("Privacy & Security", "رازداری اور حفاظت"),
      items: [
        { icon: Lock, label: t("App Lock", "ایپ لاک"), desc: t(appLock ? "PIN lock active ✅" : "Require PIN to open", appLock ? "PIN لاک فعال ✅" : "کھولنے کے لیے PIN درکار"), action: "applock" as const, value: appLock },
        { icon: Shield, label: t("Encryption", "خفیہ کاری"), desc: t("End-to-end encryption active", "اینڈ ٹو اینڈ خفیہ کاری فعال"), action: "panel" as const, panel: "encryption" },
      ],
    },
    {
      label: t("General", "عمومی"),
      items: [
        { icon: Bell, label: t("Notifications", "اطلاعات"), desc: t("Sound and vibration", "آواز اور وائبریشن"), action: "panel" as const, panel: "notifications" },
        { icon: HardDrive, label: t("Storage", "اسٹوریج"), desc: t("12.4 MB used", "12.4 MB استعمال شدہ"), action: "panel" as const, panel: "storage" },
        { icon: Download, label: t("Install App", "ایپ انسٹال کریں"), desc: t("Add to home screen", "ہوم سکرین پر شامل کریں"), action: "navigate" as const, panel: "install" },
        { icon: Info, label: t("About Zanjeer", "زنجیر کے بارے میں"), desc: t("Version 1.0.0", "ورژن 1.0.0"), action: "panel" as const, panel: "about" },
      ],
    },
  ];

  const renderPanel = () => {
    switch (activePanel) {
      case "encryption":
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-primary/10 rounded-xl">
              <Shield className="w-8 h-8 text-primary shrink-0" />
              <div>
                <p className={`text-sm font-semibold text-foreground ${language === "ur" ? "font-urdu" : ""}`}>
                  {t("End-to-End Encryption", "اینڈ ٹو اینڈ خفیہ کاری")}
                </p>
                <p className={`text-xs text-muted-foreground mt-0.5 ${language === "ur" ? "font-urdu" : ""}`}>
                  {t("All messages are fully encrypted before transmission", "تمام پیغامات بھیجنے سے پہلے مکمل طور پر انکرپٹ ہوتے ہیں")}
                </p>
              </div>
            </div>
            <div className="space-y-2">
              {[
                { label: t("Protocol", "پروٹوکول"), value: "AES-256-GCM" },
                { label: t("Key Exchange", "کلید کا تبادلہ"), value: "X25519" },
                { label: t("Status", "حالت"), value: t("✅ Active", "✅ فعال") },
                { label: t("Last Key Rotation", "آخری کلید تبدیلی"), value: t("2 hours ago", "2 گھنٹے پہلے") },
                { label: t("Perfect Forward Secrecy", "پرفیکٹ فارورڈ سیکریسی"), value: t("✅ Enabled", "✅ فعال") },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="flex items-center justify-between p-3 bg-card rounded-xl border border-border"
                >
                  <span className={`text-sm text-muted-foreground ${language === "ur" ? "font-urdu" : ""}`}>{item.label}</span>
                  <span className="text-sm font-medium text-foreground">{item.value}</span>
                </motion.div>
              ))}
            </div>
            <div className="p-3 bg-secondary rounded-xl">
              <p className={`text-xs text-muted-foreground leading-relaxed ${language === "ur" ? "font-urdu text-right" : ""}`}>
                {t(
                  "Your messages are encrypted end-to-end using military-grade encryption. No one, not even Zanjeer, can read your messages. Keys are rotated automatically for maximum security.",
                  "آپ کے پیغامات ملٹری گریڈ خفیہ کاری سے اینڈ ٹو اینڈ انکرپٹڈ ہیں۔ کوئی بھی، یہاں تک کہ زنجیر بھی، آپ کے پیغامات نہیں پڑھ سکتا۔ زیادہ سے زیادہ حفاظت کے لیے کلیدیں خود بخود تبدیل ہوتی ہیں۔"
                )}
              </p>
            </div>
          </div>
        );

      case "notifications":
        return (
          <div className="space-y-3">
            <p className={`text-sm text-muted-foreground px-1 ${language === "ur" ? "font-urdu text-right" : ""}`}>
              {t("Each setting works independently — turn on/off any combination you like.", "ہر ترتیب آزادانہ کام کرتی ہے — جو چاہیں آن/آف کریں۔")}
            </p>
            {[
              {
                icon: Bell,
                label: t("Message Alerts", "پیغام کی اطلاعات"),
                desc: t("Show pop-up notification banner", "پاپ اپ اطلاعاتی بینر دکھائیں"),
                checked: notifications,
                onChange: (v: boolean) => { setNotifications(v); toast.success(v ? t("Alerts enabled", "اطلاعات فعال") : t("Alerts disabled", "اطلاعات غیر فعال")); },
              },
              {
                icon: Volume2,
                label: t("Sound", "آواز"),
                desc: t("Play sound when message arrives (works without alerts)", "پیغام آنے پر آواز چلائیں (بغیر اطلاعات کے بھی چلتی ہے)"),
                checked: sound,
                onChange: (v: boolean) => { setSound(v); toast.success(v ? t("Sound enabled", "آواز فعال") : t("Sound disabled", "آواز غیر فعال")); },
              },
              {
                icon: Vibrate,
                label: t("Vibration", "وائبریشن"),
                desc: t("Vibrate when message arrives (works without alerts)", "پیغام آنے پر وائبریٹ کریں (بغیر اطلاعات کے بھی چلتی ہے)"),
                checked: vibration,
                onChange: (v: boolean) => { setVibration(v); toast.success(v ? t("Vibration enabled", "وائبریشن فعال") : t("Vibration disabled", "وائبریشن غیر فعال")); },
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="flex items-center justify-between p-3 bg-card rounded-xl border border-border"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <item.icon className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className={`text-sm font-medium text-foreground ${language === "ur" ? "font-urdu" : ""}`}>{item.label}</p>
                    <p className={`text-xs text-muted-foreground ${language === "ur" ? "font-urdu" : ""}`}>{item.desc}</p>
                  </div>
                </div>
                <Switch checked={item.checked} onCheckedChange={item.onChange} />
              </motion.div>
            ))}
          </div>
        );

      case "storage":
        return (
          <div className="space-y-3">
            {[
              { key: "messages" as const, label: t("Messages", "پیغامات"), size: clearedData.messages ? "0 B" : "8.2 MB", percent: clearedData.messages ? 0 : 66, color: "bg-primary" },
              { key: "voiceMessages" as const, label: t("Voice Messages", "صوتی پیغامات"), size: clearedData.voiceMessages ? "0 B" : "2.8 MB", percent: clearedData.voiceMessages ? 0 : 22, color: "bg-accent" },
              { key: "files" as const, label: t("Files & Images", "فائلیں اور تصاویر"), size: clearedData.files ? "0 B" : "1.4 MB", percent: clearedData.files ? 0 : 12, color: "bg-mesh-blue" },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="p-3 bg-card rounded-xl border border-border"
              >
                <div className="flex items-center justify-between mb-2">
                 <span className={`text-sm font-medium text-foreground ${language === "ur" ? "font-urdu" : ""}`}>{item.label}</span>
                   <span className="text-sm text-muted-foreground">{item.size}</span>
                </div>
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: `${item.percent}%` }}
                    animate={{ width: `${item.percent}%` }}
                    transition={{ duration: 0.6 }}
                    className={`h-full rounded-full ${item.color}`}
                  />
                </div>
                {!clearedData[item.key] && (
                  <button
                    onClick={() => {
                      clearDataCategory(item.key);
                      toast.success(t(`${item.label} cleared!`, `${item.label} صاف ہو گئے!`));
                    }}
                    className={`mt-2 text-xs text-destructive hover:underline ${language === "ur" ? "font-urdu" : ""}`}
                  >
                    {t(`Clear ${item.label}`, `${item.label} صاف کریں`)}
                  </button>
                )}
                {clearedData[item.key] && (
                  <span className={`mt-2 block text-xs text-primary ${language === "ur" ? "font-urdu" : ""}`}>
                    ✅ {t("Cleared", "صاف ہو گیا")}
                  </span>
                )}
              </motion.div>
            ))}
            {/* Total */}
            <div className="p-3 bg-card rounded-xl border border-border flex items-center justify-between">
              <span className={`text-sm font-semibold text-foreground ${language === "ur" ? "font-urdu" : ""}`}>{t("Total", "کل")}</span>
              <span className="text-sm font-bold text-primary">
                {clearedData.messages && clearedData.voiceMessages && clearedData.files
                  ? "0 B"
                  : `${((!clearedData.messages ? 8.2 : 0) + (!clearedData.voiceMessages ? 2.8 : 0) + (!clearedData.files ? 1.4 : 0)).toFixed(1)} MB`}
              </span>
            </div>
            {/* Clear All */}
            {!(clearedData.messages && clearedData.voiceMessages && clearedData.files) && (
              <button
                onClick={() => {
                  clearAllData();
                  toast.success(t("All data cleared!", "تمام ڈیٹا صاف ہو گیا!"));
                }}
                className="w-full p-3 rounded-xl border border-destructive/30 text-destructive text-sm font-medium hover:bg-destructive/10 transition-colors"
              >
                {t("Clear All Data", "تمام ڈیٹا صاف کریں")}
              </button>
            )}
            {clearedData.messages && clearedData.voiceMessages && clearedData.files && (
              <div className="w-full p-3 rounded-xl bg-primary/10 text-primary text-sm font-medium text-center">
                ✅ {t("All data has been cleared", "تمام ڈیٹا صاف ہو چکا ہے")}
              </div>
            )}
          </div>
        );

      case "about":
        return (
          <div className="space-y-4">
            <div className="flex flex-col items-center gap-3 py-4">
              <div className="w-16 h-16 rounded-2xl mesh-gradient flex items-center justify-center">
                <Radio className="w-8 h-8 text-primary-foreground" />
              </div>
              <h2 className="text-xl font-bold mesh-gradient-text">ZANJEER</h2>
              <p className={`text-sm text-muted-foreground text-center ${language === "ur" ? "font-urdu" : ""}`}>
                {t("Offline Mesh Messenger", "آف لائن میش میسنجر")}
              </p>
              <p className={`text-xs text-muted-foreground/70 text-center max-w-[280px] ${language === "ur" ? "font-urdu" : ""}`}>
                {t("Communicate without internet using Bluetooth and WiFi Direct mesh networking.", "بلوٹوتھ اور وائی فائی ڈائریکٹ میش نیٹ ورکنگ کے ذریعے بغیر انٹرنیٹ بات چیت کریں۔")}
              </p>
            </div>
            {[
              { label: t("Version", "ورژن"), value: "1.0.0" },
              { label: t("Build Date", "بلڈ تاریخ"), value: "2026.03.08" },
              { label: t("Protocol", "پروٹوکول"), value: "Mesh v2" },
              { label: t("Encryption", "خفیہ کاری"), value: "AES-256-GCM" },
              { label: t("Connection", "کنکشن"), value: t("BT + WiFi Direct", "بلوٹوتھ + وائی فائی ڈائریکٹ") },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="flex items-center justify-between p-3 bg-card rounded-xl border border-border"
              >
                <span className={`text-sm text-muted-foreground ${language === "ur" ? "font-urdu" : ""}`}>{item.label}</span>
                <span className="text-sm font-medium text-foreground">{item.value}</span>
              </motion.div>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  const panelTitle: Record<string, string> = {
    encryption: t("Encryption", "خفیہ کاری"),
    notifications: t("Notifications", "اطلاعات"),
    storage: t("Storage", "اسٹوریج"),
    about: t("About Zanjeer", "زنجیر کے بارے میں"),
  };

  const pinTitle = pinStep === "set"
    ? t("Set a 4-digit PIN", "4 ہندسوں کا PIN سیٹ کریں")
    : pinStep === "confirm"
    ? t("Confirm your PIN", "اپنا PIN تصدیق کریں")
    : t("Enter PIN to unlock", "لاک کھولنے کے لیے PIN درج کریں");

  return (
    <div className="flex min-h-screen flex-col bg-background w-full max-w-md md:max-w-lg lg:max-w-xl mx-auto md:shadow-2xl md:border-x md:border-border relative">
      {/* Header */}
      <div className="mesh-gradient px-4 py-3 flex items-center gap-3">
        <button onClick={() => { if (window.history.length > 1) navigate(-1); else navigate("/chats"); }} className="p-2 rounded-lg bg-primary-foreground/20">
          <ArrowLeft className="w-5 h-5 text-primary-foreground" />
        </button>
        <h1 className="text-lg font-semibold text-primary-foreground">
          {t("Settings", "ترتیبات")}
        </h1>
      </div>

      {/* Profile card */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mx-4 mt-4 p-4 bg-card rounded-2xl border border-border flex items-center gap-4">
        <Avatar className="w-16 h-16 ring-2 ring-primary/20">
          <AvatarFallback className="mesh-gradient text-primary-foreground text-lg font-bold">
            <User className="w-7 h-7" />
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <p className={`text-base font-bold text-foreground ${language === "ur" ? "font-urdu" : ""}`}>
            {t("My Device", "میرا آلہ")}
          </p>
          <p className="text-sm text-muted-foreground mt-0.5">
            {t("Node ID: ZNJ-7F3A", "نوڈ آئی ڈی: ZNJ-7F3A")}
          </p>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-xs text-primary font-medium">
              {t("Offline Mesh · No Internet", "آف لائن میش · بغیر انٹرنیٹ")}
            </span>
          </div>
        </div>
        <Palette className="w-5 h-5 text-muted-foreground" />
      </motion.div>

      {/* Settings groups */}
      <div className="px-4 py-3 space-y-4 flex-1 overflow-y-auto pb-20">
        {settingGroups.map((group, gi) => (
          <motion.div key={gi} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: gi * 0.08 }}>
            <h3 className={`text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1 ${language === "ur" ? "font-urdu text-right" : ""}`}>
              {group.label}
            </h3>
            <div className="bg-card rounded-xl border border-border overflow-hidden divide-y divide-border">
              {group.items.map((item, ii) => (
                <button
                  key={ii}
                  onClick={() => {
                    if (item.action === "theme") toggleTheme();
                    else if (item.action === "language") setLanguage(language === "en" ? "ur" : "en");
                    else if (item.action === "applock") handleAppLockPress();
                    else if (item.action === "panel" && "panel" in item) setActivePanel(item.panel);
                    else if (item.action === "navigate" && "panel" in item) navigate(`/${item.panel}`);
                  }}
                  className="w-full px-3.5 py-3.5 flex items-center gap-3 hover:bg-muted/40 active:bg-muted/60 transition-colors text-left"
                >
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <item.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div className={`flex-1 min-w-0 ${language === "ur" ? "text-right" : ""}`}>
                    <p className={`text-sm font-medium text-foreground ${language === "ur" ? "font-urdu" : ""}`}>{item.label}</p>
                    <p className={`text-xs text-muted-foreground mt-0.5 ${language === "ur" ? "font-urdu" : ""}`}>{item.desc}</p>
                  </div>
                  {item.action === "locked" && (
                    <div className="flex items-center gap-1.5 shrink-0">
                      <Lock className="w-3 h-3 text-primary" />
                      <Switch checked={true} disabled className="shrink-0 opacity-70" />
                    </div>
                  )}
                  {item.action === "applock" && (
                    <Switch checked={appLock} className="shrink-0" />
                  )}
                  {item.action === "theme" && (
                    <Switch checked={isDark} className="shrink-0" />
                  )}
                  {item.action === "language" && (
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-sm text-muted-foreground">{language === "en" ? "EN" : "UR"}</span>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                  )}
                  {item.action === "panel" && <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />}
                </button>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      {/* PIN Dialog */}
      <AnimatePresence>
        {showPinDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/95 backdrop-blur-md flex flex-col items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="flex flex-col items-center gap-6 w-full max-w-xs px-4"
            >
              {/* Lock icon */}
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-16 h-16 rounded-full mesh-gradient flex items-center justify-center"
              >
                <Lock className="w-7 h-7 text-primary-foreground" />
              </motion.div>

              {/* Title */}
              <p className={`text-base font-semibold text-foreground text-center ${language === "ur" ? "font-urdu" : ""}`}>
                {pinTitle}
              </p>

              {/* PIN dots */}
              <div className="flex items-center gap-4">
                {[0, 1, 2, 3].map((i) => (
                  <motion.div
                    key={i}
                    animate={pinValue.length === i ? { scale: [1, 1.2, 1] } : {}}
                    transition={{ duration: 0.5, repeat: Infinity }}
                    className={`w-4 h-4 rounded-full border-2 transition-all ${
                      i < pinValue.length
                        ? "bg-primary border-primary"
                        : "border-muted-foreground/30"
                    }`}
                  />
                ))}
              </div>

              {/* Error message */}
              {pinError && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`text-xs text-destructive font-medium ${language === "ur" ? "font-urdu" : ""}`}
                >
                  {pinError}
                </motion.p>
              )}

              {/* Number pad */}
              <div className="grid grid-cols-3 gap-3 w-full">
                {["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "del"].map((key) => (
                  <div key={key || "empty"} className="flex items-center justify-center">
                    {key === "" ? (
                      <div className="w-16 h-16" />
                    ) : key === "del" ? (
                      <button
                        onClick={handlePinDelete}
                        className="w-16 h-16 rounded-2xl flex items-center justify-center hover:bg-muted active:bg-muted/80 transition-colors"
                      >
                        <Delete className="w-5 h-5 text-muted-foreground" />
                      </button>
                    ) : (
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handlePinDigit(key)}
                        className="w-16 h-16 rounded-2xl bg-card border border-border flex items-center justify-center text-xl font-semibold text-foreground hover:bg-muted active:bg-primary active:text-primary-foreground transition-colors"
                      >
                        {key}
                      </motion.button>
                    )}
                  </div>
                ))}
              </div>

              {/* Cancel button */}
              <button
                onClick={() => setShowPinDialog(false)}
                className={`text-sm text-muted-foreground hover:text-foreground transition-colors ${language === "ur" ? "font-urdu" : ""}`}
              >
                {t("Cancel", "منسوخ")}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Detail panel slide-over */}
      <AnimatePresence>
        {activePanel && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 250 }}
            className="fixed inset-0 z-30 bg-background flex flex-col max-w-md md:max-w-lg lg:max-w-xl mx-auto"
          >
            <div className="mesh-gradient px-4 py-3 flex items-center gap-3">
              <button onClick={() => setActivePanel(null)} className="text-primary-foreground p-1">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className={`text-lg font-semibold text-primary-foreground ${language === "ur" ? "font-urdu" : ""}`}>
                {panelTitle[activePanel] || ""}
              </h1>
            </div>
            <div className="flex-1 overflow-y-auto px-4 py-4">
              {renderPanel()}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <BottomNav />
    </div>
  );
};

export default Settings;
