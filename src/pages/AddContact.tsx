import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, UserPlus, QrCode, Keyboard, ScanLine, Check, X, Wifi, Signal, SignalLow, SignalMedium, SignalHigh } from "lucide-react";
import { Html5Qrcode } from "html5-qrcode";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useApp } from "@/contexts/AppContext";
import { getUserProfile } from "./Onboarding";
import { nearbyUsers, type NearbyUser } from "@/data/nearbyUsers";
import { toast } from "sonner";

export interface SavedContact {
  id: string;
  username: string;
  uniqueCode: string;
  addedAt: string;
}

export function getSavedContacts(): SavedContact[] {
  try {
    return JSON.parse(localStorage.getItem("zanjeer_contacts") || "[]");
  } catch {
    return [];
  }
}

export function saveContact(contact: SavedContact) {
  const contacts = getSavedContacts();
  if (contacts.some((c) => c.uniqueCode === contact.uniqueCode)) return false;
  contacts.push(contact);
  localStorage.setItem("zanjeer_contacts", JSON.stringify(contacts));
  return true;
}

type Tab = "nearby" | "manual" | "qr";

const signalIcon = (signal: NearbyUser["signal"]) => {
  switch (signal) {
    case "strong": return <SignalHigh className="w-4 h-4 text-green-500" />;
    case "medium": return <SignalMedium className="w-4 h-4 text-yellow-500" />;
    case "weak": return <SignalLow className="w-4 h-4 text-orange-500" />;
  }
};

const signalLabel = (signal: NearbyUser["signal"], isUrdu: boolean) => {
  switch (signal) {
    case "strong": return isUrdu ? "مضبوط" : "Strong";
    case "medium": return isUrdu ? "درمیانہ" : "Medium";
    case "weak": return isUrdu ? "کمزور" : "Weak";
  }
};

const AddContact = () => {
  const navigate = useNavigate();
  const { language } = useApp();
  const isUrdu = language === "ur";
  const profile = getUserProfile();

  const [tab, setTab] = useState<Tab>("nearby");
  const [contactName, setContactName] = useState("");
  const [contactCode, setContactCode] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [scanError, setScanError] = useState("");
  const [scannedData, setScannedData] = useState<{ username: string; code: string } | null>(null);
  const [scanning, setScanning] = useState(false);
  const [addedNearby, setAddedNearby] = useState<Set<string>>(() => {
    const saved = getSavedContacts();
    return new Set(saved.map(c => c.uniqueCode));
  });
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scannerContainerId = "qr-reader";

  // Cleanup scanner on unmount
  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
        scannerRef.current.clear();
        scannerRef.current = null;
      }
    };
  }, []);

  // Start/stop scanner when tab changes
  useEffect(() => {
    if (tab === "qr") {
      setScanError("");
      setScannedData(null);
      setScanning(true);
      const timeout = setTimeout(() => startScanner(), 300);
      return () => clearTimeout(timeout);
    } else {
      stopScanner();
      setScanning(false);
    }
  }, [tab]);

  const startScanner = async () => {
    try {
      if (scannerRef.current) {
        await scannerRef.current.stop().catch(() => {});
        scannerRef.current.clear();
      }
      const scanner = new Html5Qrcode(scannerContainerId);
      scannerRef.current = scanner;
      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 220, height: 220 } },
        (decodedText) => {
          handleQrResult(decodedText);
          scanner.stop().catch(() => {});
          setScanning(false);
        },
        () => {}
      );
    } catch {
      setScanError(isUrdu ? "کیمرے تک رسائی نہیں مل سکی۔ نیچے ایک سمیولیٹڈ QR آزمائیں۔" : "Could not access camera. Try the simulated QR below.");
      setScanning(false);
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch {}
      scannerRef.current = null;
    }
  };

  const handleQrResult = (text: string) => {
    try {
      const data = JSON.parse(text);
      if (data.app === "ZANJEER" && data.username && data.code) {
        setScannedData({ username: data.username, code: data.code });
      } else {
        setScanError(isUrdu ? "یہ ZANJEER QR نہیں ہے" : "Not a valid ZANJEER QR");
      }
    } catch {
      setScanError(isUrdu ? "غلط QR کوڈ" : "Invalid QR code");
    }
  };

  const handleSimulatedScan = () => {
    // Simulate scanning a nearby user's QR
    const randomUser = nearbyUsers[Math.floor(Math.random() * nearbyUsers.length)];
    setScannedData({ username: isUrdu ? randomUser.nameUr : randomUser.name, code: randomUser.code });
    setScanning(false);
  };

  const handleSaveScanned = () => {
    if (!scannedData) return;
    if (profile && scannedData.code === profile.uniqueCode) {
      setScanError(isUrdu ? "یہ آپ کا اپنا کوڈ ہے" : "This is your own code");
      return;
    }
    const added = saveContact({
      id: `c_${Date.now()}`,
      username: scannedData.username,
      uniqueCode: scannedData.code,
      addedAt: new Date().toISOString(),
    });
    if (!added) {
      setScanError(isUrdu ? "یہ کانٹیکٹ پہلے سے موجود ہے" : "Contact already exists");
      return;
    }
    setAddedNearby(prev => new Set(prev).add(scannedData.code));
    setSuccess(isUrdu ? "کانٹیکٹ محفوظ ہو گیا!" : "Contact saved!");
    toast.success(isUrdu ? "کانٹیکٹ محفوظ ہو گیا!" : "Contact saved!");
    setTimeout(() => { setSuccess(""); setScannedData(null); }, 2000);
  };

  const handleAddNearby = (user: NearbyUser) => {
    if (addedNearby.has(user.code)) return;
    const added = saveContact({
      id: `c_${Date.now()}`,
      username: isUrdu ? user.nameUr : user.name,
      uniqueCode: user.code,
      addedAt: new Date().toISOString(),
    });
    if (added) {
      setAddedNearby(prev => new Set(prev).add(user.code));
      toast.success(isUrdu ? `${user.nameUr} شامل ہو گیا!` : `${user.name} added!`);
    } else {
      toast.info(isUrdu ? "پہلے سے موجود ہے" : "Already added");
    }
  };

  const handleSave = () => {
    const name = contactName.trim();
    const code = contactCode.trim().toUpperCase();

    if (!name) { setError(isUrdu ? "نام درج کریں" : "Enter a name"); return; }
    if (name.length < 2 || name.length > 30) { setError(isUrdu ? "نام 2 سے 30 حروف کا ہونا چاہیے" : "Name must be 2-30 characters"); return; }
    if (!code) { setError(isUrdu ? "کوڈ درج کریں" : "Enter a code"); return; }
    if (!/^[A-Z0-9]{3,4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(code)) { setError(isUrdu ? "کوڈ کا فارمیٹ غلط ہے" : "Invalid code format"); return; }
    if (profile && code === profile.uniqueCode) { setError(isUrdu ? "یہ آپ کا اپنا کوڈ ہے" : "This is your own code"); return; }

    const added = saveContact({
      id: `c_${Date.now()}`,
      username: name,
      uniqueCode: code,
      addedAt: new Date().toISOString(),
    });

    if (!added) { setError(isUrdu ? "یہ کانٹیکٹ پہلے سے موجود ہے" : "Contact already exists"); return; }

    setError("");
    setSuccess(isUrdu ? "کانٹیکٹ محفوظ ہو گیا!" : "Contact saved!");
    toast.success(isUrdu ? "کانٹیکٹ محفوظ ہو گیا!" : "Contact saved!");
    setContactName("");
    setContactCode("");
    setTimeout(() => setSuccess(""), 2000);
  };

  const tabs: { id: Tab; label: string; labelUr: string; icon: React.ReactNode }[] = [
    { id: "nearby", label: "Nearby", labelUr: "قریبی", icon: <Wifi className="w-4 h-4" /> },
    { id: "manual", label: "Enter Code", labelUr: "کوڈ لکھیں", icon: <Keyboard className="w-4 h-4" /> },
    { id: "qr", label: "Scan QR", labelUr: "QR اسکین", icon: <ScanLine className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background" dir={isUrdu ? "rtl" : "ltr"}>
      {/* Header */}
      <div className="mesh-gradient px-4 py-3 safe-top">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-xl bg-primary-foreground/20 flex items-center justify-center"
          >
            <ArrowLeft className={`w-5 h-5 text-primary-foreground ${isUrdu ? "rotate-180" : ""}`} />
          </button>
          <h1 className={`text-lg font-bold text-primary-foreground ${isUrdu ? "font-urdu" : ""}`}>
            {isUrdu ? "کانٹیکٹ شامل کریں" : "Add Contact"}
          </h1>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-3 bg-secondary/50">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => { setTab(t.id); setError(""); setSuccess(""); }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
              tab === t.id
                ? "mesh-gradient text-primary-foreground shadow-sm"
                : "bg-card text-muted-foreground border border-border"
            }`}
          >
            {t.icon}
            <span className={isUrdu ? "font-urdu" : ""}>{isUrdu ? t.labelUr : t.label}</span>
          </button>
        ))}
      </div>

      {/* Success banner */}
      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mx-4 mt-2"
          >
            <div className="flex items-center gap-2 p-3 rounded-xl bg-primary/10 border border-primary/20">
              <Check className="w-4 h-4 text-primary shrink-0" />
              <p className={`text-sm text-primary font-medium ${isUrdu ? "font-urdu" : ""}`}>{success}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        <AnimatePresence mode="wait">
          {/* Nearby Users */}
          {tab === "nearby" && (
            <motion.div
              key="nearby"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-3"
            >
              <div className="flex items-center gap-2 mb-1">
                <div className="relative">
                  <Wifi className="w-5 h-5 text-primary" />
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                </div>
                <p className={`text-sm text-muted-foreground ${isUrdu ? "font-urdu" : ""}`}>
                  {isUrdu
                    ? `${nearbyUsers.length} قریبی صارفین ملے — ٹیپ کریں شامل کرنے کے لیے`
                    : `${nearbyUsers.length} nearby users found — tap to add`}
                </p>
              </div>

              {nearbyUsers.map((user, i) => {
                const isAdded = addedNearby.has(user.code);
                return (
                  <motion.div
                    key={user.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                      isAdded
                        ? "bg-primary/5 border-primary/20"
                        : "bg-card border-border hover:border-primary/30"
                    }`}
                  >
                    <div className="w-11 h-11 rounded-full mesh-gradient flex items-center justify-center shrink-0">
                      <span className="text-sm font-bold text-primary-foreground">
                        {(isUrdu ? user.nameUr : user.name).slice(0, 2).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-semibold text-foreground text-sm truncate ${isUrdu ? "font-urdu" : ""}`}>
                        {isUrdu ? user.nameUr : user.name}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] font-mono text-muted-foreground">{user.code}</span>
                        <span className="text-[10px] text-muted-foreground">•</span>
                        <span className="text-[10px] text-muted-foreground">{user.distance}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="flex flex-col items-center gap-0.5">
                        {signalIcon(user.signal)}
                        <span className="text-[9px] text-muted-foreground">{signalLabel(user.signal, isUrdu)}</span>
                      </div>
                      {isAdded ? (
                        <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                          <Check className="w-4 h-4 text-primary" />
                        </div>
                      ) : (
                        <button
                          onClick={() => handleAddNearby(user)}
                          className="w-9 h-9 rounded-xl mesh-gradient flex items-center justify-center shadow-sm active:scale-95 transition-transform"
                        >
                          <UserPlus className="w-4 h-4 text-primary-foreground" />
                        </button>
                      )}
                    </div>
                  </motion.div>
                );
              })}

              <div className="p-3 rounded-xl bg-muted/50 border border-border mt-4">
                <p className={`text-xs text-muted-foreground leading-relaxed ${isUrdu ? "font-urdu text-right" : ""}`}>
                  {isUrdu
                    ? "یہ صارفین آپ کے بلوٹوتھ/وائی فائی رینج میں ہیں۔ شامل کرنے کے بعد آپ انہیں پیغام بھیج سکتے ہیں۔"
                    : "These users are within your Bluetooth/WiFi range. After adding, you can message them directly."}
                </p>
              </div>
            </motion.div>
          )}

          {/* Manual Entry */}
          {tab === "manual" && (
            <motion.div
              key="manual"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-5"
            >
              <div className="text-center space-y-1 mb-6">
                <div className="w-14 h-14 rounded-2xl mesh-gradient flex items-center justify-center mx-auto shadow-md">
                  <UserPlus className="w-7 h-7 text-primary-foreground" />
                </div>
                <p className={`text-sm text-muted-foreground mt-3 ${isUrdu ? "font-urdu" : ""}`}>
                  {isUrdu
                    ? "دوسرے شخص کا نام اور کوڈ لکھیں جو اس نے آپ کو دیا ہے"
                    : "Enter the name and unique code shared with you"}
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className={`text-sm font-medium text-foreground ${isUrdu ? "font-urdu" : ""}`}>
                    {isUrdu ? "نام" : "Name"}
                  </label>
                  <Input
                    value={contactName}
                    onChange={(e) => { setContactName(e.target.value); setError(""); }}
                    placeholder={isUrdu ? "مثلاً: احمد خان" : "e.g. Ahmed Khan"}
                    className={`h-12 bg-card border-border ${isUrdu ? "font-urdu text-right" : ""}`}
                    maxLength={30}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className={`text-sm font-medium text-foreground ${isUrdu ? "font-urdu" : ""}`}>
                    {isUrdu ? "منفرد کوڈ" : "Unique Code"}
                  </label>
                  <Input
                    value={contactCode}
                    onChange={(e) => {
                      let val = e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, "");
                      const raw = val.replace(/-/g, "");
                      if (raw.length > 4 && raw.length <= 8) {
                        val = raw.slice(0, 4) + "-" + raw.slice(4);
                      } else if (raw.length > 8) {
                        val = raw.slice(0, 4) + "-" + raw.slice(4, 8) + "-" + raw.slice(8, 12);
                      }
                      setContactCode(val);
                      setError("");
                    }}
                    placeholder="XXXX-XXXX-XXXX"
                    className="h-12 bg-card border-border text-center font-mono text-lg tracking-widest"
                    maxLength={14}
                  />
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-destructive/10 border border-destructive/20">
                  <X className="w-4 h-4 text-destructive shrink-0" />
                  <p className={`text-sm text-destructive ${isUrdu ? "font-urdu" : ""}`}>{error}</p>
                </div>
              )}

              <Button
                onClick={handleSave}
                size="lg"
                className="w-full mesh-gradient text-primary-foreground gap-2 mt-2"
                disabled={!contactName.trim() || !contactCode.trim()}
              >
                <UserPlus className="w-5 h-5" />
                <span className={isUrdu ? "font-urdu" : ""}>
                  {isUrdu ? "کانٹیکٹ محفوظ کریں" : "Save Contact"}
                </span>
              </Button>
            </motion.div>
          )}

          {/* QR Scanner */}
          {tab === "qr" && (
            <motion.div
              key="qr"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center gap-4 py-4"
            >
              {scannedData ? (
                <div className="flex flex-col items-center gap-4 w-full">
                  <div className="w-16 h-16 rounded-full mesh-gradient flex items-center justify-center">
                    <UserPlus className="w-8 h-8 text-primary-foreground" />
                  </div>
                  <div className="text-center space-y-1">
                    <p className="text-lg font-semibold text-foreground">{scannedData.username}</p>
                    <p className="text-sm font-mono text-muted-foreground tracking-wider">{scannedData.code}</p>
                  </div>
                  {scanError && (
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-destructive/10 border border-destructive/20">
                      <X className="w-4 h-4 text-destructive shrink-0" />
                      <p className={`text-sm text-destructive ${isUrdu ? "font-urdu" : ""}`}>{scanError}</p>
                    </div>
                  )}
                  <Button onClick={handleSaveScanned} size="lg" className="w-full mesh-gradient text-primary-foreground gap-2">
                    <UserPlus className="w-5 h-5" />
                    <span className={isUrdu ? "font-urdu" : ""}>{isUrdu ? "کانٹیکٹ محفوظ کریں" : "Save Contact"}</span>
                  </Button>
                  <Button variant="outline" size="lg" className="w-full" onClick={() => { setScannedData(null); setScanError(""); setScanning(true); startScanner(); }}>
                    <ScanLine className="w-5 h-5" />
                    <span className={isUrdu ? "font-urdu" : ""}>{isUrdu ? "دوبارہ اسکین کریں" : "Scan Again"}</span>
                  </Button>
                </div>
              ) : (
                <>
                  <div
                    id={scannerContainerId}
                    className="w-64 h-64 rounded-2xl overflow-hidden bg-card border-2 border-primary/30 relative"
                  >
                    {scanning && (
                      <div className="absolute inset-0 flex items-center justify-center bg-card/80 z-10">
                        <motion.div
                          animate={{ y: [-80, 80, -80] }}
                          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                          className="w-48 h-0.5 bg-primary/60 rounded-full"
                        />
                      </div>
                    )}
                  </div>
                  
                  {scanError ? (
                    <div className="flex flex-col items-center gap-3 w-full">
                      <div className="flex items-center gap-2 p-3 rounded-xl bg-destructive/10 border border-destructive/20">
                        <X className="w-4 h-4 text-destructive shrink-0" />
                        <p className={`text-sm text-destructive ${isUrdu ? "font-urdu" : ""}`}>{scanError}</p>
                      </div>
                      <Button onClick={handleSimulatedScan} size="lg" className="w-full mesh-gradient text-primary-foreground gap-2">
                        <QrCode className="w-5 h-5" />
                        <span className={isUrdu ? "font-urdu" : ""}>
                          {isUrdu ? "سمیولیٹڈ اسکین کریں" : "Simulated Scan"}
                        </span>
                      </Button>
                      <Button variant="outline" onClick={() => { setScanError(""); setScanning(true); startScanner(); }}>
                        {isUrdu ? "دوبارہ کوشش کریں" : "Try Camera Again"}
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3 text-center w-full">
                      <p className={`text-sm text-muted-foreground ${isUrdu ? "font-urdu" : ""}`}>
                        {isUrdu ? "دوسرے شخص کا QR کوڈ کیمرے کے سامنے رکھیں" : "Point camera at the other person's QR code"}
                      </p>
                      <Button onClick={handleSimulatedScan} variant="outline" size="lg" className="w-full gap-2">
                        <QrCode className="w-5 h-5" />
                        <span className={isUrdu ? "font-urdu" : ""}>
                          {isUrdu ? "سمیولیٹڈ اسکین (ٹیسٹ)" : "Simulated Scan (Test)"}
                        </span>
                      </Button>
                    </div>
                  )}
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AddContact;
