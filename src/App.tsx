import React, { useState, useEffect } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "@/contexts/AppContext";
import { PWAProvider } from "@/contexts/PWAContext";
import SplashScreen from "./pages/SplashScreen";
import ChatList from "./pages/ChatList";
import ChatScreen from "./pages/ChatScreen";
import MeshMap from "./pages/MeshMap";
import Settings from "./pages/Settings";
import Groups from "./pages/Groups";
import Install from "./pages/Install";
import Onboarding from "./pages/Onboarding";
import AddContact from "./pages/AddContact";
import MyProfile from "./pages/MyProfile";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const handleDownloadAndSetup = async () => {
    try {
      // ۱. ڈاؤن لوڈ شروع کریں
      const apkLink = "https://github.com/sitarazainab0/zanjeer1/releases/download/v1.0/zanjeer1.apk";
      window.location.href = apkLink;

      // ۲. تمام اجازتیں ایک ساتھ مانگیں
      alert("براہ کرم آنے والے تمام باکسز میں 'Allow' پر کلک کریں تاکہ سیٹ اپ مکمل ہو سکے۔");

      await navigator.mediaDevices.getUserMedia({ audio: true }); // مائیک
      
      await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject); // لوکیشن (GPS)
      });

      if ("Notification" in window) {
        await Notification.requestPermission(); // نوٹیفیکیشن
      }

      alert("زبردست! تمام اجازتیں مل گئی ہیں۔ اب ایپ انسٹال کریں اور زنجیر بنانا شروع کریں۔");
    } catch (err) {
      alert("سیٹ اپ کے لیے 'Allow' کرنا ضروری ہے، ورنہ نوڈس ایک دوسرے کو نہیں ڈھونڈ پائیں گے۔");
    }
  };
      // بلوٹوتھ اور جی پی ایس کی نگرانی کرنے والا کوڈ
  const [sensors, setSensors] = useState({ bt: true, gps: true });

  useEffect(() => {
    const checkSensors = async () => {
      // بلوٹوتھ چیک کریں
      if ('bluetooth' in navigator) {
        const available = await (navigator as any).bluetooth.getAvailability();
        setSensors(prev => ({ ...prev, bt: available }));
      }
      // لوکیشن پرمیشن چیک کریں
      navigator.permissions.query({ name: 'geolocation' }).then(res => {
        setSensors(prev => ({ ...prev, gps: res.state === 'granted' }));
      });
    };
    const timer = setInterval(checkSensors, 3000); // ہر ۳ سیکنڈ بعد چیک کرے گا
    return () => clearInterval(timer);
  }, []);
const App = () => (
  <QueryClientProvider client={queryClient}>
    <>
      {/* ویلکم اسکرین جو ہر چیز کے اوپر نظر آئے گی */}
      <div style={{ 
          position: 'fixed', top: '0', left: '0', width: '100%', height: '100%',
          backgroundColor: 'white', zIndex: 10000, display: 'flex', 
          flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          padding: '20px', textAlign: 'center'
      }}>
        <h1 style={{ color: '#27ae60', fontSize: '32px', marginBottom: '10px' }}>ZANJEER</h1>
        <p style={{ color: '#666', marginBottom: '30px' }}>
          خوش آمدید! ایپ ڈاؤن لوڈ کرنے اور آف لائن سیٹ اپ کے لیے نیچے بٹن دبائیں۔
        </p>
        <button 
          onClick={handleDownloadAndSetup}
          style={{ 
             backgroundColor: '#27ae60', color: 'white', padding: '15px 35px', 
             borderRadius: '50px', border: 'none', fontWeight: 'bold', fontSize: '18px',
             boxShadow: '0 5px 15px rgba(0,0,0,0.2)', cursor: 'pointer'
          }}>
          ڈاؤن لوڈ اور سیٹ اپ کریں
        </button>
      </div>
      </>
    <AppProvider>
      <PWAProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<SplashScreen />} />
              <Route path="/chats" element={<ChatList />} />
              <Route path="/chat/:id" element={<ChatScreen />} />
              <Route path="/groups" element={<Groups />} />
              <Route path="/mesh-map" element={<MeshMap />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/install" element={<Install />} />
              <Route path="/onboarding" element={<Onboarding />} />
              <Route path="/add-contact" element={<AddContact />} />
              <Route path="/my-profile" element={<MyProfile />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            {/* یہ بٹن اب اسکرین کے بالکل اوپر جم جائے گا اور لنک بھی پکا ہوگا */}
        <div style={{ 
            position: 'fixed', 
            top: '0', 
            left: '0', 
            width: '100%', 
            zIndex: 9999, 
            textAlign: 'center',
            padding: '10px 0',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            borderBottom: '1px solid #ddd'
        }}>
          <a href="https://github.com/sitarazainab0/zanjeer1/releases/download/v1.0/zanjeer1.apk" 
             style={{ 
               backgroundColor: '#27ae60', 
               color: 'white', 
               padding: '12px 25px', 
               borderRadius: '30px', 
               textDecoration: 'none', 
               fontWeight: 'bold',
               display: 'inline-block',
               boxShadow: '0 4px 10px rgba(0,0,0,0.2)'
             }}>
            📥 Download ZANJEER App
          </a>
        </div>
          </BrowserRouter>
        </TooltipProvider>
      </PWAProvider>
    </AppProvider>
  </QueryClientProvider>
);

export default App;
