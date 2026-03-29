import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Copy, Check, Share2, QrCode, User, Shield } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { useApp } from "@/contexts/AppContext";
import { getUserProfile } from "./Onboarding";
import BottomNav from "@/components/BottomNav";
import { toast } from "sonner";

const MyProfile = () => {
  const navigate = useNavigate();
  const { t, language } = useApp();
  const isUrdu = language === "ur";
  const profile = getUserProfile();
  const [copied, setCopied] = useState(false);

  const myQrData = profile
    ? JSON.stringify({ app: "ZANJEER", username: profile.username, code: profile.uniqueCode })
    : "";

  const handleCopy = async () => {
    if (!profile) return;
    try {
      await navigator.clipboard.writeText(profile.uniqueCode);
      setCopied(true);
      toast.success(t("Code copied!", "کوڈ کاپی ہو گیا!"));
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error(t("Could not copy", "کاپی نہیں ہو سکا"));
    }
  };

  const handleShare = async () => {
    if (!profile) return;
    const text = `🔗 ZANJEER\n👤 ${profile.username}\n🔑 ${profile.uniqueCode}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: "ZANJEER ID", text });
      } else {
        await navigator.clipboard.writeText(text);
        toast.success(t("Code copied to clipboard!", "کوڈ کاپی ہو گیا!"));
      }
    } catch {
      try {
        await navigator.clipboard.writeText(text);
        toast.success(t("Code copied!", "کوڈ کاپی ہو گیا!"));
      } catch {}
    }
  };

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
            {t("My Profile", "میری پروفائل")}
          </h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-md mx-auto p-5 space-y-6">
          {profile ? (
            <>
              {/* Avatar & Name */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center gap-3 pt-4"
              >
                <div className="w-20 h-20 rounded-full mesh-gradient flex items-center justify-center shadow-lg">
                  <span className="text-2xl font-bold text-primary-foreground">
                    {profile.username.slice(0, 2).toUpperCase()}
                  </span>
                </div>
                <h2 className={`text-xl font-bold text-foreground ${isUrdu ? "font-urdu" : ""}`}>
                  {profile.username}
                </h2>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Shield className="w-3.5 h-3.5 text-primary" />
                  <span>{t("End-to-End Encrypted", "اینڈ ٹو اینڈ انکرپٹڈ")}</span>
                </div>
              </motion.div>

              {/* ZNJ-ID Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="p-5 rounded-2xl bg-card border border-border shadow-sm space-y-3"
              >
                <div className="flex items-center gap-2 mb-2">
                  <QrCode className="w-4 h-4 text-primary" />
                  <span className={`text-sm font-semibold text-foreground ${isUrdu ? "font-urdu" : ""}`}>
                    {t("Your ZNJ-ID", "آپ کا ZNJ-ID")}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-muted/50 border border-border">
                  <span className="font-mono text-lg font-bold tracking-widest text-foreground">
                    {profile.uniqueCode}
                  </span>
                  <button
                    onClick={handleCopy}
                    className="p-2 rounded-lg hover:bg-muted transition-colors"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-primary" />
                    ) : (
                      <Copy className="w-4 h-4 text-muted-foreground" />
                    )}
                  </button>
                </div>
                <p className={`text-xs text-muted-foreground ${isUrdu ? "font-urdu" : ""}`}>
                  {t(
                    "Share this code with others so they can add you as a contact",
                    "یہ کوڈ دوسروں کو دیں تاکہ وہ آپ کو کانٹیکٹ میں شامل کر سکیں"
                  )}
                </p>
              </motion.div>

              {/* QR Code */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex flex-col items-center gap-4 p-6 rounded-2xl bg-card border border-border shadow-sm"
              >
                <span className={`text-sm font-semibold text-foreground ${isUrdu ? "font-urdu" : ""}`}>
                  {t("Your QR Code", "آپ کا QR کوڈ")}
                </span>
                <div className="p-5 rounded-2xl bg-white">
                  <QRCodeSVG
                    value={myQrData}
                    size={180}
                    bgColor="#ffffff"
                    fgColor="hsl(160, 70%, 38%)"
                    level="M"
                  />
                </div>
                <p className={`text-xs text-muted-foreground text-center ${isUrdu ? "font-urdu" : ""}`}>
                  {t(
                    "Others can scan this to add you instantly",
                    "دوسرے اسے اسکین کر کے آپ کو فوراً شامل کر سکتے ہیں"
                  )}
                </p>
              </motion.div>

              {/* Actions */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex gap-3"
              >
                <Button
                  onClick={handleShare}
                  className="flex-1 mesh-gradient text-primary-foreground gap-2"
                  size="lg"
                >
                  <Share2 className="w-5 h-5" />
                  <span className={isUrdu ? "font-urdu" : ""}>
                    {t("Share", "شیئر کریں")}
                  </span>
                </Button>
                <Button
                  onClick={() => navigate("/add-contact")}
                  variant="outline"
                  className="flex-1 gap-2"
                  size="lg"
                >
                  <User className="w-5 h-5" />
                  <span className={isUrdu ? "font-urdu" : ""}>
                    {t("Add Contact", "کانٹیکٹ شامل کریں")}
                  </span>
                </Button>
              </motion.div>

              {/* Info */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="p-4 rounded-xl bg-primary/5 border border-primary/10 space-y-2"
              >
                <p className={`text-xs text-muted-foreground leading-relaxed ${isUrdu ? "font-urdu text-right" : ""}`}>
                  {t(
                    "Your ZNJ-ID is your unique identity on the ZANJEER mesh network. Share it with trusted people so they can message you directly or via relay nodes — all without internet.",
                    "آپ کا ZNJ-ID زنجیر میش نیٹ ورک پر آپ کی منفرد شناخت ہے۔ اسے قابل اعتماد لوگوں کو دیں تاکہ وہ آپ کو براہ راست یا ریلے نوڈز کے ذریعے پیغام بھیج سکیں — سب بغیر انٹرنیٹ کے۔"
                  )}
                </p>
              </motion.div>
            </>
          ) : (
            <div className="flex flex-col items-center gap-4 py-16">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                <User className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className={`text-muted-foreground ${isUrdu ? "font-urdu" : ""}`}>
                {t("No profile found. Please set up your account first.", "کوئی پروفائل نہیں ملی۔ پہلے اپنا اکاؤنٹ بنائیں۔")}
              </p>
              <Button onClick={() => navigate("/onboarding")} className="mesh-gradient text-primary-foreground">
                {t("Set Up Account", "اکاؤنٹ بنائیں")}
              </Button>
            </div>
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default MyProfile;
