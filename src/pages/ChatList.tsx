import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Radio, Sun, Moon, Globe, Shield, Search, X, Plus, MoreVertical, Settings, Wifi, Share2, Trash2, VolumeX, Pin, Archive, QrCode } from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { toast } from "sonner";
import { peers, type Peer } from "@/data/mockData";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import BottomNav from "@/components/BottomNav";
import logo from "@/assets/zanjeer-logo-generated.png";
import { getUserProfile } from "./Onboarding";
import { getSavedContacts } from "./AddContact";

const MessageStatus = ({ status }: { status: 'sent' | 'delivered' | 'read' }) => {
  // رنگوں کا فیصلہ: ریڈ (نیلا) ورنہ سرمئی
  const color = status === 'read' ? '#34B7F1' : '#888';

  return (
    <div style={{ display: 'flex', alignItems: 'center', marginLeft: '5px' }}>
      {status === 'sent' ? (
        <span style={{ color: color, fontSize: '12px' }}>✓</span> /* ایک ٹک */
      ) : ( 
        <span style={{ color: color, fontSize: '12px', letterSpacing: '-3px', fontWeight: 'bold' }}>
          ✓✓ {/* دو ٹک */}
        </span>
      )}
    </div>
  );
};
const ChatList = () => {
  const navigate = useNavigate();
  const { t, language, setLanguage, isDark, toggleTheme } = useApp();
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [selectedChats, setSelectedChats] = useState<Set<string>>(new Set());
  const [deletedChats, setDeletedChats] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem("zanjeer_deleted_chats");
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch { return new Set(); }
  });
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
// وائس ریکارڈنگ کا وقت نوٹ کرنے کے لیے
  const voiceStartTime = useRef<number>(0);
  // Close menu on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };
    if (showMenu) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showMenu]);

  // Merge saved contacts (top) + mock peers
  const savedContacts = getSavedContacts();
  const savedAsPeers: Peer[] = savedContacts.map((c) => ({
    id: c.id,
    name: c.username,
    nameUr: c.username,
    avatar: c.username.slice(0, 2).toUpperCase(),
    status: "direct" as const,
    distance: "—",
    lastMessage: "Tap to start chatting",
    lastMessageUr: "چیٹ شروع کرنے کے لیے ٹیپ کریں",
    lastTime: new Date(c.addedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    online: true,
    hopCount: 1,
    lastMessageStatus: "sent",
  }));

  const allPeers = [...savedAsPeers, ...peers];
  const onlinePeers = allPeers.filter((p) => p.online).length;
  const isSelecting = selectedChats.size > 0;

  const filteredPeers = allPeers.filter((p) => {
    if (deletedChats.has(p.id)) return false;
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return p.name.toLowerCase().includes(q) || p.nameUr.includes(q);
  });

  const longPressTriggered = useRef(false);

  const handleLongPressStart = useCallback((peerId: string) => {
    longPressTriggered.current = false;
    longPressTimer.current = setTimeout(() => {
      longPressTriggered.current = true;
      setSelectedChats((prev) => new Set(prev).add(peerId));
    }, 500);
  }, []);

  const handleLongPressEnd = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, []);

  const toggleSelect = (peerId: string) => {
    setSelectedChats((prev) => {
      const next = new Set(prev);
      if (next.has(peerId)) next.delete(peerId);
      else next.add(peerId);
      return next;
    });
  };

  const handleDeleteSelected = () => {
    setDeletedChats((prev) => {
      const next = new Set(prev);
      selectedChats.forEach((id) => next.add(id));
      localStorage.setItem("zanjeer_deleted_chats", JSON.stringify([...next]));
      return next;
    });
    setSelectedChats(new Set());
  };

  // No mock unread counts - only real ones will be tracked
  const unreadCounts: Record<string, number> = {};


  return (
    <div className="flex min-h-screen flex-col bg-background w-full max-w-md md:max-w-lg lg:max-w-xl mx-auto md:shadow-2xl md:border-x md:border-border">
      {/* Header - Selection mode or normal */}
      <AnimatePresence mode="wait">
        {isSelecting ? (
          <motion.div
            key="select-header"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="bg-card border-b border-border px-4 py-3 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <button onClick={() => setSelectedChats(new Set())} className="p-1">
                <X className="w-5 h-5 text-foreground" />
              </button>
              <span className="text-lg font-semibold text-foreground">{selectedChats.size}</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={handleDeleteSelected}
                className="p-2.5 rounded-full hover:bg-destructive/10 transition-colors"
              >
                <Trash2 className="w-5 h-5 text-destructive" />
              </button>
              <button
                onClick={() => setSelectedChats(new Set())}
                className="p-2.5 rounded-full hover:bg-muted transition-colors"
              >
                <VolumeX className="w-5 h-5 text-foreground" />
              </button>
              <button
                onClick={() => setSelectedChats(new Set())}
                className="p-2.5 rounded-full hover:bg-muted transition-colors"
              >
                <Pin className="w-5 h-5 text-foreground" />
              </button>
              <button
                onClick={() => setSelectedChats(new Set())}
                className="p-2.5 rounded-full hover:bg-muted transition-colors"
              >
                <Archive className="w-5 h-5 text-foreground" />
              </button>
            </div>
          </motion.div>
        ) : (
          <div key="normal-header" className="mesh-gradient px-4 py-3 pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <img src={logo} alt="ZANJEER" className="w-11 h-11 rounded-lg object-contain shadow-sm border border-primary-foreground/20" />
                <h1 className="text-xl font-bold text-primary-foreground">ZANJEER</h1>
              </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSearch(!showSearch)}
              className="p-2 rounded-full bg-primary-foreground/20 text-primary-foreground"
            >
              {showSearch ? <X className="w-4 h-4" /> : <Search className="w-4 h-4" />}
            </button>

            {/* Three dots menu */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-2 rounded-full bg-primary-foreground/20 text-primary-foreground"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              <AnimatePresence>
                {showMenu && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: -5 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: -5 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-11 w-52 bg-card border border-border rounded-xl shadow-xl z-50 overflow-hidden"
                  >
                    {/* Peers nearby */}
                    <div className="px-4 py-3 flex items-center gap-3 border-b border-border bg-muted/30">
                      <Wifi className="w-4 h-4 text-primary" />
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-sm text-foreground font-medium">
                          {t(`Peers Nearby: ${onlinePeers}`, `قریبی آلات: ${onlinePeers}`)}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => { setLanguage(language === "en" ? "ur" : "en"); setShowMenu(false); }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-foreground hover:bg-muted/60 transition-colors"
                    >
                      <Globe className="w-4 h-4 text-primary" />
                      <span>{language === "en" ? "اردو" : "English"}</span>
                    </button>
                    <button
                      onClick={() => { toggleTheme(); setShowMenu(false); }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-foreground hover:bg-muted/60 transition-colors"
                    >
                      {isDark ? <Sun className="w-4 h-4 text-primary" /> : <Moon className="w-4 h-4 text-primary" />}
                      <span>{t("Light Mode", "لائٹ موڈ")}</span>
                    </button>
                    <div className="h-px bg-border" />
                    <button
                      onClick={() => { navigate("/my-profile"); setShowMenu(false); }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-foreground hover:bg-muted/60 transition-colors"
                    >
                      <QrCode className="w-4 h-4 text-primary" />
                      <span>{t("My QR Code", "میرا QR کوڈ")}</span>
                    </button>
                    <button
                      onClick={async () => {
                        setShowMenu(false);
                        const profile = getUserProfile();
                        if (!profile) {
                          toast.error(t("Create your account first", "پہلے اپنا اکاؤنٹ بنائیں"));
                          return;
                        }
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
                            toast.success(t("Code copied to clipboard!", "کوڈ کاپی ہو گیا!"));
                          } catch {
                            toast.error(t("Could not share", "شیئر نہیں ہو سکا"));
                          }
                        }
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-foreground hover:bg-muted/60 transition-colors"
                    >
                      <Share2 className="w-4 h-4 text-primary" />
                      <span>{t("Share My Code", "اپنا کوڈ شیئر کریں")}</span>
                    </button>
                    <div className="h-px bg-border" />
                    <button
                      onClick={() => { navigate("/settings"); setShowMenu(false); }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-foreground hover:bg-muted/60 transition-colors"
                    >
                      <Settings className="w-4 h-4 text-primary" />
                      <span>{t("Settings", "سیٹنگز")}</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Search bar */}
        {showSearch && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3"
          >
            <input
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("Search peers...", "تلاش کریں...")}
              className={`w-full bg-primary-foreground/15 text-primary-foreground placeholder:text-primary-foreground/50 rounded-full px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-foreground/30 ${language === "ur" ? "font-urdu text-right" : ""}`}
            />
          </motion.div>
        )}
          </div>
        )}
      </AnimatePresence>

      {/* Chat list */}
      <div className="flex-1 divide-y divide-border overflow-y-auto">
        {filteredPeers.map((peer, i) => (
          <motion.button
            key={peer.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            onClick={() => {
              if (longPressTriggered.current) return;
              if (isSelecting) {
                toggleSelect(peer.id);
              } else {
                navigate(`/chat/${peer.id}`);
              }
            }}
            onTouchStart={() => handleLongPressStart(peer.id)}
            onTouchEnd={handleLongPressEnd}
            onTouchCancel={handleLongPressEnd}
            onMouseDown={() => handleLongPressStart(peer.id)}
            onMouseUp={handleLongPressEnd}
            onMouseLeave={handleLongPressEnd}
            onContextMenu={(e) => {
              e.preventDefault();
              setSelectedChats((prev) => new Set(prev).add(peer.id));
            }}
            className={`w-full px-4 py-3 flex items-center gap-3 transition-colors text-left ${
              selectedChats.has(peer.id)
                ? "bg-primary/10"
                : "hover:bg-muted/50 active:bg-muted"
            }`}
          >
            {/* Selection checkbox or Avatar */}
            <div className="relative">
              {isSelecting && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className={`absolute -left-1 -top-1 z-10 w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    selectedChats.has(peer.id)
                      ? "bg-primary border-primary"
                      : "bg-card border-muted-foreground/30"
                  }`}
                >
                  {selectedChats.has(peer.id) && (
                    <svg className="w-3 h-3 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </motion.div>
              )}
              <Avatar className="w-12 h-12">
                <AvatarFallback className="mesh-gradient text-primary-foreground font-semibold text-sm">
                  {peer.avatar}
                </AvatarFallback>
              </Avatar>
              {!isSelecting && (
                <span
                  className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-background ${
                    peer.status === "direct"
                      ? "bg-green-500"
                      : "bg-mesh-blue"
                  }`}
                />
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className={`font-semibold text-foreground truncate ${language === "ur" ? "font-urdu" : ""}`}>
                  {language === "ur" ? peer.nameUr : peer.name}
                </span>
                <span className="text-[10px] text-muted-foreground ml-2 shrink-0">
                  {peer.lastTime}
                </span>
              </div>
              <div className="flex items-center justify-between mt-0.5">
                <div className="flex items-center gap-1.5">
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                      peer.status === "direct"
                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                    }`}
                  >
                    {peer.status === "direct"
                      ? t("Direct", "براہ راست")
                      : t(`Relay ×${peer.hopCount}`, `ریلے ×${peer.hopCount}`)}
                  </span>
                  <span className="text-xs text-muted-foreground truncate">
                    {language === "ur" ? peer.lastMessageUr : peer.lastMessage}<MessageStatus status={(peer as any).lastMessageStatus || 'sent'} />
                  </span>
                </div>
                {unreadCounts[peer.id] && !isSelecting && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-5 h-5 rounded-full mesh-gradient text-primary-foreground text-[10px] font-bold flex items-center justify-center shrink-0 ml-1"
                  >
                    {unreadCounts[peer.id]}
                  </motion.span>
                )}
              </div>
            </div>
          </motion.button>
        ))}
      </div>

      {/* FAB - Add Contact */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => navigate("/add-contact")}
        className="fixed bottom-24 right-5 w-14 h-14 rounded-full mesh-gradient shadow-lg flex items-center justify-center z-20"
      >
        <Plus className="w-6 h-6 text-primary-foreground" />
      </motion.button>

      <BottomNav />
    </div>
  );
};

export default ChatList;
