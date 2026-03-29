import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import { User, Copy, Check, ArrowRight, QrCode, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useApp } from "@/contexts/AppContext";

function generateUniqueCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const segments = [];
  for (let s = 0; s < 3; s++) {
    let seg = "";
    for (let i = 0; i < 4; i++) {
      seg += chars[Math.floor(Math.random() * chars.length)];
    }
    segments.push(seg);
  }
  return segments.join("-");
}

export interface UserProfile {
  username: string;
  uniqueCode: string;
  createdAt: string;
}

export function getUserProfile(): UserProfile | null {
  const data = localStorage.getItem("zanjeer_user_profile");
  if (!data) return null;
  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
}

export function saveUserProfile(profile: UserProfile) {
  localStorage.setItem("zanjeer_user_profile", JSON.stringify(profile));
}

const Onboarding = () => {
  const navigate = useNavigate();
  const { language } = useApp();
  const isUrdu = language === "ur";

  const [step, setStep] = useState<"username" | "code" | "qr">("username");
  const [username, setUsername] = useState("");
  const [uniqueCode] = useState(() => generateUniqueCode());
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const existing = getUserProfile();
    if (existing) {
      navigate("/chats", { replace: true });
    }
  }, [navigate]);

  const handleUsernameSubmit = () => {
    const trimmed = username.trim();
    if (trimmed.length < 2) {
      setError(isUrdu ? "نام کم از کم 2 حروف کا ہونا چاہیے" : "Username must be at least 2 characters");
      return;
    }
    if (trimmed.length > 30) {
      setError(isUrdu ? "نام 30 حروف سے زیادہ نہیں ہو سکتا" : "Username must be less than 30 characters");
      return;
    }
    if (!/^[a-zA-Z0-9_\u0600-\u06FF\s]+$/.test(trimmed)) {
      setError(isUrdu ? "صرف حروف، نمبر اور _ استعمال کریں" : "Only letters, numbers, and _ allowed");
      return;
    }
    setError("");
    setStep("code");
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(uniqueCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const handleFinish = () => {
    saveUserProfile({
      username: username.trim(),
      uniqueCode,
      createdAt: new Date().toISOString(),
    });
    navigate("/chats", { replace: true });
  };

  const qrData = JSON.stringify({ app: "ZANJEER", username: username.trim(), code: uniqueCode });

  return (
    <div className="min-h-screen flex flex-col bg-background" dir={isUrdu ? "rtl" : "ltr"}>
      {/* Progress bar */}
      <div className="p-4 pt-6 safe-top">
        <div className="flex gap-2">
          {["username", "code", "qr"].map((s, i) => (
            <div
              key={s}
              className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                ["username", "code", "qr"].indexOf(step) >= i
                  ? "mesh-gradient"
                  : "bg-border"
              }`}
            />
          ))}
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <AnimatePresence mode="wait">
          {/* Step 1: Username */}
          {step === "username" && (
            <motion.div
              key="username"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              className="max-w-sm w-full space-y-8 text-center"
            >
              <div className="space-y-3">
                <div className="w-16 h-16 rounded-2xl mesh-gradient flex items-center justify-center mx-auto shadow-lg">
                  <User className="w-8 h-8 text-primary-foreground" />
                </div>
                <h1 className={`text-2xl font-bold text-foreground ${isUrdu ? "font-urdu" : ""}`}>
                  {isUrdu ? "اپنا نام منتخب کریں" : "Choose Your Username"}
                </h1>
                <p className={`text-sm text-muted-foreground ${isUrdu ? "font-urdu" : ""}`}>
                  {isUrdu
                    ? "یہ نام میش نیٹ ورک پر دوسروں کو نظر آئے گا"
                    : "This name will be visible to others on the mesh network"}
                </p>
              </div>

              <div className="space-y-3">
                <Input
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    setError("");
                  }}
                  onKeyDown={(e) => e.key === "Enter" && handleUsernameSubmit()}
                  placeholder={isUrdu ? "اپنا نام لکھیں..." : "Enter your name..."}
                  className={`text-center text-lg h-12 bg-card border-border ${isUrdu ? "font-urdu" : ""}`}
                  maxLength={30}
                  autoFocus
                />
                {error && (
                  <p className={`text-sm text-destructive ${isUrdu ? "font-urdu" : ""}`}>{error}</p>
                )}
              </div>

              <Button
                onClick={handleUsernameSubmit}
                size="lg"
                className="w-full mesh-gradient text-primary-foreground gap-2"
                disabled={!username.trim()}
              >
                <span className={isUrdu ? "font-urdu" : ""}>{isUrdu ? "آگے بڑھیں" : "Continue"}</span>
                <ArrowRight className={`w-5 h-5 ${isUrdu ? "rotate-180" : ""}`} />
              </Button>
            </motion.div>
          )}

          {/* Step 2: Unique Code */}
          {step === "code" && (
            <motion.div
              key="code"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              className="max-w-sm w-full space-y-8 text-center"
            >
              <div className="space-y-3">
                <div className="w-16 h-16 rounded-2xl mesh-gradient flex items-center justify-center mx-auto shadow-lg">
                  <Shield className="w-8 h-8 text-primary-foreground" />
                </div>
                <h1 className={`text-2xl font-bold text-foreground ${isUrdu ? "font-urdu" : ""}`}>
                  {isUrdu ? "آپ کا منفرد کوڈ" : "Your Unique Code"}
                </h1>
                <p className={`text-sm text-muted-foreground ${isUrdu ? "font-urdu" : ""}`}>
                  {isUrdu
                    ? "یہ کوڈ آپ کی شناخت ہے — اسے محفوظ رکھیں"
                    : "This code is your identity — keep it safe"}
                </p>
              </div>

              {/* Username display */}
              <div className="p-3 rounded-xl bg-card border border-border">
                <p className="text-xs text-muted-foreground mb-1">{isUrdu ? "نام" : "Username"}</p>
                <p className={`text-lg font-semibold text-foreground ${isUrdu ? "font-urdu" : ""}`}>
                  {username.trim()}
                </p>
              </div>

              {/* Unique Code */}
              <div className="p-4 rounded-xl bg-card border border-border space-y-3">
                <p className="text-xs text-muted-foreground">{isUrdu ? "منفرد کوڈ" : "Unique Code"}</p>
                <p className="text-2xl font-mono font-bold tracking-widest text-foreground">
                  {uniqueCode}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyCode}
                  className="gap-2"
                >
                  {copied ? <Check className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4" />}
                  <span className={isUrdu ? "font-urdu" : ""}>
                    {copied ? (isUrdu ? "کاپی ہو گیا!" : "Copied!") : (isUrdu ? "کوڈ کاپی کریں" : "Copy Code")}
                  </span>
                </Button>
              </div>

              <Button
                onClick={() => setStep("qr")}
                size="lg"
                className="w-full mesh-gradient text-primary-foreground gap-2"
              >
                <QrCode className="w-5 h-5" />
                <span className={isUrdu ? "font-urdu" : ""}>{isUrdu ? "QR کوڈ دیکھیں" : "View QR Code"}</span>
              </Button>
            </motion.div>
          )}

          {/* Step 3: QR Code */}
          {step === "qr" && (
            <motion.div
              key="qr"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              className="max-w-sm w-full space-y-8 text-center"
            >
              <div className="space-y-3">
                <h1 className={`text-2xl font-bold text-foreground ${isUrdu ? "font-urdu" : ""}`}>
                  {isUrdu ? "آپ کا QR کوڈ" : "Your QR Code"}
                </h1>
                <p className={`text-sm text-muted-foreground ${isUrdu ? "font-urdu" : ""}`}>
                  {isUrdu
                    ? "دوسرے اسے اسکین کر کے آپ کو شامل کر سکتے ہیں"
                    : "Others can scan this to add you"}
                </p>
              </div>

              {/* QR Code card */}
              <div className="p-6 rounded-2xl bg-card border border-border shadow-lg mx-auto inline-block">
                <QRCodeSVG
                  value={qrData}
                  size={200}
                  bgColor="transparent"
                  fgColor="hsl(160, 70%, 38%)"
                  level="M"
                  includeMargin={false}
                />
              </div>

              <div className="space-y-1">
                <p className={`font-semibold text-foreground ${isUrdu ? "font-urdu" : ""}`}>
                  {username.trim()}
                </p>
                <p className="text-sm font-mono text-muted-foreground">{uniqueCode}</p>
              </div>

              <Button
                onClick={handleFinish}
                size="lg"
                className="w-full mesh-gradient text-primary-foreground gap-2"
              >
                <span className={isUrdu ? "font-urdu" : ""}>{isUrdu ? "شروع کریں" : "Get Started"}</span>
                <ArrowRight className={`w-5 h-5 ${isUrdu ? "rotate-180" : ""}`} />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Onboarding;
