import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Wifi, WifiOff, Radio, Shield, Bluetooth, Zap } from "lucide-react";
import logo from "@/assets/zanjeer-logo-generated.png";

const SplashScreen = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setStep(1), 800),
      setTimeout(() => setStep(2), 1600),
      setTimeout(() => setStep(3), 2400),
      setTimeout(() => {
        const profile = localStorage.getItem("zanjeer_user_profile");
        navigate(profile ? "/chats" : "/onboarding", { replace: true });
      }, 4000),
    ];
    return () => timers.forEach(clearTimeout);
  }, [navigate]);

  const features = [
    { icon: WifiOff, text: "انٹرنیٹ کی ضرورت نہیں", textEn: "No Internet Needed" },
    { icon: Bluetooth, text: "بلوٹوتھ / وائی فائی ڈائریکٹ", textEn: "Bluetooth / WiFi Direct" },
    { icon: Shield, text: "اینڈ ٹو اینڈ انکرپٹڈ", textEn: "End-to-End Encrypted" },
  ];

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background relative overflow-hidden">
      {/* Animated mesh network background */}
      <div className="absolute inset-0">
        {/* Floating mesh nodes */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full bg-primary/20"
            initial={{ 
              x: `${15 + Math.random() * 70}%`, 
              y: `${15 + Math.random() * 70}%`,
              opacity: 0 
            }}
            animate={{ 
              x: [`${15 + Math.random() * 70}%`, `${15 + Math.random() * 70}%`],
              y: [`${15 + Math.random() * 70}%`, `${15 + Math.random() * 70}%`],
              opacity: [0, 0.6, 0] 
            }}
            transition={{ duration: 4 + Math.random() * 3, repeat: Infinity, delay: i * 0.4 }}
          />
        ))}

        {/* Pulse rings */}
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full border border-primary/10"
          animate={{ scale: [0.5, 2.5], opacity: [0.4, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeOut" }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full border border-accent/10"
          animate={{ scale: [0.5, 2.5], opacity: [0.3, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeOut", delay: 1 }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full border border-primary/8"
          animate={{ scale: [0.5, 2.5], opacity: [0.2, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeOut", delay: 2 }}
        />
      </div>

      {/* Main content */}
      <motion.div
        initial={{ scale: 0.3, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1, ease: "easeOut", type: "spring", stiffness: 100 }}
        className="relative z-10 flex flex-col items-center gap-5"
      >
        {/* Logo with glow */}
        <div className="relative">
          <motion.div
            className="absolute inset-0 rounded-2xl bg-primary/20 blur-xl"
            animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 2.5, repeat: Infinity }}
          />
          <motion.img
            src={logo}
            alt="ZANJEER"
            className="w-28 h-28 rounded-2xl shadow-2xl object-contain relative z-10"
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>

        {/* Title */}
        <motion.div className="text-center">
          <h1 className="text-4xl font-bold mesh-gradient-text tracking-tight">
            ZANJEER
          </h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-muted-foreground text-sm font-urdu mt-1"
          >
            بغیر انٹرنیٹ · میش نیٹ ورک میسنجر
          </motion.p>
        </motion.div>

        {/* Scanning animation */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col items-center gap-3"
        >
          <div className="relative w-14 h-14">
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-primary"
              style={{ borderTopColor: "transparent" }}
              animate={{ rotate: 360 }}
              transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
            />
            <motion.div
              className="absolute inset-2 rounded-full border border-accent"
              style={{ borderBottomColor: "transparent" }}
              animate={{ rotate: -360 }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "linear" }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <Radio className="w-5 h-5 text-primary" />
            </div>
          </div>
          <p className="text-muted-foreground text-xs font-urdu">
            قریبی آلات تلاش ہو رہے ہیں...
          </p>
        </motion.div>
      </motion.div>

      {/* Feature badges - appear one by one */}
      <div className="absolute bottom-24 left-0 right-0 flex flex-col items-center gap-2 px-8">
        <AnimatePresence>
          {features.map((feat, i) => (
            step > i && (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 15, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="flex items-center gap-2.5 bg-card/80 backdrop-blur-sm rounded-full px-4 py-2 border border-border shadow-sm"
              >
                <feat.icon className="w-4 h-4 text-primary shrink-0" />
                <span className="text-xs text-foreground font-medium">{feat.textEn}</span>
                <span className="text-[10px] text-muted-foreground font-urdu">· {feat.text}</span>
              </motion.div>
            )
          ))}
        </AnimatePresence>
      </div>

      {/* Bottom branding */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="absolute bottom-6 flex flex-col items-center gap-1"
      >
        <div className="flex items-center gap-1.5">
          <Zap className="w-3 h-3 text-primary" />
          <span className="text-[10px] text-muted-foreground">
            Powered by Mesh Technology
          </span>
        </div>
        <span className="text-[9px] text-muted-foreground/60">
          No SIM · No Data · No WiFi Required
        </span>
      </motion.div>
    </div>
  );
};

export default SplashScreen;
