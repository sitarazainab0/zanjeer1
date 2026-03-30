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

const App = () => (
  <QueryClientProvider client={queryClient}>
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
            {/* ڈاؤن لوڈ بٹن یہاں سے شروع ہو رہا ہے */}
        <div style={{ textAlign: 'center', margin: '20px 0', position: 'relative', zIndex: 1000 }}>
          <p style={{ color: '#666', fontSize: '14px', marginBottom: '8px' }}>
            زنجیر ایپ یہاں سے ڈاؤن لوڈ کریں:
          </p>
          <a href="https://github.com/sitarazainab0/zanjeer1/releases/download/v1.0/ZANJEER.apk" 
             style={{ 
               backgroundColor: '#27ae60', 
               color: 'white', 
               padding: '10px 20px', 
               borderRadius: '50px', 
               textDecoration: 'none', 
               fontWeight: 'bold',
               display: 'inline-block',
               boxShadow: '0 2px 8px rgba(0,0,0,0.2)' 
             }}>
            Download ZANJEER APK
          </a>
        </div>
          </BrowserRouter>
        </TooltipProvider>
      </PWAProvider>
    </AppProvider>
  </QueryClientProvider>
);

export default App;
