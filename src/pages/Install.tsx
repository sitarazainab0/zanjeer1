import { useNavigate } from "react-router-dom";
import { Download, Share, MoreVertical, Check, Smartphone, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useApp } from "@/contexts/AppContext";
import { usePWA } from "@/contexts/PWAContext";

const Install = () => {
  const { language } = useApp();
  const navigate = useNavigate();
  const { isInstalled, deferredPrompt, triggerInstall, isIOS } = usePWA();
  const isUrdu = language === "ur";

  if (isInstalled) {
    return (
      <div className="min-h-screen flex flex-col bg-background" dir={isUrdu ? "rtl" : "ltr"}>
        <div className="flex items-center gap-2 p-4">
          <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center">
            <ArrowLeft className={`w-5 h-5 text-foreground ${isUrdu ? "rotate-180" : ""}`} />
          </button>
          <h2 className={`text-sm font-semibold text-foreground ${isUrdu ? "font-urdu" : ""}`}>
            {isUrdu ? "ایپ انسٹال کریں" : "Install App"}
          </h2>
        </div>
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 rounded-full mesh-gradient flex items-center justify-center mx-auto">
              <Check className="w-8 h-8 text-primary-foreground" />
            </div>
            <h1 className={`text-2xl font-bold text-foreground ${isUrdu ? "font-urdu" : ""}`}>
              {isUrdu ? "ایپ انسٹال ہو چکی ہے!" : "App is installed!"}
            </h1>
            <p className={`text-muted-foreground ${isUrdu ? "font-urdu" : ""}`}>
              {isUrdu ? "ZANJEER آپ کی ہوم سکرین پر دستیاب ہے" : "ZANJEER is available on your home screen"}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background" dir={isUrdu ? "rtl" : "ltr"}>
      <div className="flex items-center gap-2 p-4">
        <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center">
          <ArrowLeft className={`w-5 h-5 text-foreground ${isUrdu ? "rotate-180" : ""}`} />
        </button>
        <h2 className={`text-sm font-semibold text-foreground ${isUrdu ? "font-urdu" : ""}`}>
          {isUrdu ? "ایپ انسٹال کریں" : "Install App"}
        </h2>
      </div>
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-sm w-full space-y-8 text-center">
          <div className="space-y-4">
            <div className="w-20 h-20 rounded-2xl mesh-gradient flex items-center justify-center mx-auto shadow-lg">
              <Smartphone className="w-10 h-10 text-primary-foreground" />
            </div>
            <h1 className={`text-2xl font-bold text-foreground ${isUrdu ? "font-urdu" : ""}`}>
              {isUrdu ? "ZANJEER انسٹال کریں" : "Install ZANJEER"}
            </h1>
            <p className={`text-muted-foreground ${isUrdu ? "font-urdu" : ""}`}>
              {isUrdu
                ? "ایپ کو اپنی ہوم سکرین پر انسٹال کریں — بغیر ایپ اسٹور کے"
                : "Install the app on your home screen — no app store needed"}
            </p>
          </div>

          {deferredPrompt ? (
            <Button onClick={triggerInstall} size="lg" className="w-full mesh-gradient text-primary-foreground gap-2">
              <Download className="w-5 h-5" />
              <span className={isUrdu ? "font-urdu" : ""}>{isUrdu ? "ابھی انسٹال کریں" : "Install Now"}</span>
            </Button>
          ) : isIOS ? (
            <div className="space-y-4 p-4 rounded-xl bg-card border border-border">
              <p className={`font-semibold text-foreground ${isUrdu ? "font-urdu" : ""}`}>
                {isUrdu ? "آئی فون پر انسٹال کریں:" : "Install on iPhone:"}
              </p>
              <div className="space-y-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                    <Share className="w-4 h-4 text-secondary-foreground" />
                  </div>
                  <span className={isUrdu ? "font-urdu text-right" : ""}>
                    {isUrdu ? "Safari میں Share بٹن دبائیں" : "Tap the Share button in Safari"}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                    <Download className="w-4 h-4 text-secondary-foreground" />
                  </div>
                  <span className={isUrdu ? "font-urdu text-right" : ""}>
                    {isUrdu ? '"Add to Home Screen" منتخب کریں' : 'Select "Add to Home Screen"'}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4 p-4 rounded-xl bg-card border border-border">
              <p className={`font-semibold text-foreground ${isUrdu ? "font-urdu" : ""}`}>
                {isUrdu ? "اینڈرائڈ پر انسٹال کریں:" : "Install on Android:"}
              </p>
              <div className="space-y-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                    <MoreVertical className="w-4 h-4 text-secondary-foreground" />
                  </div>
                  <span className={isUrdu ? "font-urdu text-right" : ""}>
                    {isUrdu ? "براؤزر مینو (⋮) کھولیں" : "Open browser menu (⋮)"}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                    <Download className="w-4 h-4 text-secondary-foreground" />
                  </div>
                  <span className={isUrdu ? "font-urdu text-right" : ""}>
                    {isUrdu ? '"Install app" یا "Add to Home Screen" منتخب کریں' : 'Select "Install app" or "Add to Home Screen"'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Install;
