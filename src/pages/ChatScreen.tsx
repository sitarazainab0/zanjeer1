import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Send,
  Mic,
  Shield,
  Radio,
  CheckCheck,
  Check,
  Paperclip,
  Smile,
  ChevronDown,
  Image as ImageIcon,
  FileText,
  X,
  Download,
  Camera,
  Play,
  Pause,
} from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { peers, chatMessages, groups, type Message } from "@/data/mockData";
import { getSavedContacts } from "./AddContact";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";


const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

// Detect if text is RTL (Urdu/Arabic/Persian)
const isRTLText = (text: string): boolean => {
  const rtlRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
  // Check first meaningful characters
  const stripped = text.replace(/[\s\d\p{P}\p{S}]/gu, '');
  if (!stripped) return false;
  return rtlRegex.test(stripped.charAt(0));
};

const ChatScreen = () => { 
const { id } = useParams<{ id: string }>();
const navigate = useNavigate();
const { t, language, clearedData } = useApp();
// --- لائن 49 پر یہ کوڈ پیسٹ کریں ---
const [userName, setUserName] = useState(() => localStorage.getItem('zanjeer_name') || "آپ کا نام");
const [profilePic, setProfilePic] = useState<string | null>(localStorage.getItem('userProfilePic') || null);
const [isEditingName, setIsEditingName] = useState(false);

const handleProfilePicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (file) {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setProfilePic(base64String);
      localStorage.setItem('zanjeer_pic', base64String); // یہ تصویر کو ہمیشہ کے لیے سیو کر دے گا
    };
    reader.readAsDataURL(file);
  }
};


const [messages, setMessages] = useState<Message[]>([]);
const [input, setInput] = useState("");
const [isRecording, setIsRecording] = useState(false);
const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);
const [showScrollDown, setShowScrollDown] = useState(false);
const [showAttachMenu, setShowAttachMenu] = useState(false);
const [previewImage, setPreviewImage] = useState<string | null>(null);
const [pendingFile, setPendingFile] = useState<{ url: string; name: string; size: string; type: "image" | "file" } | null>(null);
const bottomRef = useRef<HTMLDivElement>(null);
const scrollAreaRef = useRef<HTMLDivElement>(null);
const fileInputRef = useRef<HTMLInputElement>(null);
const imageInputRef = useRef<HTMLInputElement>(null);


const peer = peers.find((p) => p.id === id);
const savedContact = !peer ? getSavedContacts().find((c) => c.id === id) : null;
const group = groups.find((g) => g.id === id);
const isGroup = !!group;

// Load messages from localStorage, fallback to mock data
useEffect(() => {
  if (clearedData.messages) {
    setMessages([]);
    if (id) localStorage.removeItem(`zanjeer_chat_${id}`);
    return;
  }
  if (!id) return;
  const saved = localStorage.getItem(`zanjeer_chat_${id}`);
  if (saved) {
    try {
      setMessages(JSON.parse(saved));
    } catch {
      setMessages(chatMessages[id] ? [...chatMessages[id]] : []);
    }
  } else if (chatMessages[id]) {
    setMessages([...chatMessages[id]]);
  }
}, [id, clearedData.messages]);

// Persist messages to localStorage on change
useEffect(() => {
  if (id && messages.length > 0) {
    localStorage.setItem(`zanjeer_chat_${id}`, JSON.stringify(messages));
  }
}, [id, messages]);

useEffect(() => {
  bottomRef.current?.scrollIntoView({ behavior: "smooth" });
}, [messages]);

const handleScroll = () => {
  if (!scrollAreaRef.current) return;
  const { scrollTop, scrollHeight, clientHeight } = scrollAreaRef.current;
  setShowScrollDown(scrollHeight - scrollTop - clientHeight > 100);
};

const scrollToBottom = () => {
  bottomRef.current?.scrollIntoView({ behavior: "smooth" });
};

const chatName = isGroup
  ? (language === "ur" ? group.nameUr : group.name)
  : peer
    ? (language === "ur" ? peer.nameUr : peer.name)
    : savedContact?.username || "";
const chatAvatar = isGroup ? group.avatar : peer?.avatar || (savedContact ? savedContact.username.slice(0, 2).toUpperCase() : "?");
const hopCount = isGroup ? 2 : peer?.hopCount || 1;
const isOnline = isGroup ? true : peer?.online || (savedContact ? true : false);
const status = isGroup ? "group" : peer?.status || "direct";
const distance = peer?.distance || "—";

if (!peer && !group && !savedContact) return null;

const sendMessage = () => {
  if (!input.trim() && !pendingFile) return;

  const newMsg: Message = {
    id: `msg-${Date.now()}`,
    text: input || (pendingFile?.type === "image" ? t("📷 Photo", "📷 تصویر") : `📎 ${pendingFile?.name}`),
    sender: "me",
    time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    status: "sent",
    hopCount: hopCount,
    ...(pendingFile && {
      fileType: pendingFile.type,
      fileName: pendingFile.name,
      fileSize: pendingFile.size,
      fileUrl: pendingFile.url,
    }),
  };
  setMessages((prev) => [...prev, newMsg]);
  setInput("");
  setPendingFile(null);

  setTimeout(() => {
    setMessages((prev) =>
      prev.map((m) => (m.id === newMsg.id ? { ...m, status: "delivered" } : m))
    );
  }, 1000);

};

const handleDownload = (fileUrl: string, fileName?: string) => {
  if (!fileUrl) {
    alert("فائل نہیں مل سکی");
    return;
  }
  const link = document.createElement('a');
  link.href = fileUrl;
  link.download = fileName || 'zanjeer-image.jpg';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};


const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: "image" | "file") => {
  const file = e.target.files?.[0];
  if (!file) return;

  const url = URL.createObjectURL(file);
  setPendingFile({
    url,
    name: file.name,
    size: formatFileSize(file.size),
    type,
  });
  setShowAttachMenu(false);
  // Reset input so same file can be selected again
  e.target.value = "";
};

const handleVoice = async () => {
  try {
    // اگر ریکارڈنگ شروع نہیں ہوئی تو شروع کریں
    if (!isRecording) {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(blob);

        // یہ وہ 'پیکج' ہے جو ایپ کو چاہیے تاکہ وہ کریش نہ ہو
        const voiceMsg: any = {
          id: `voice-${Date.now()}`,
          audioUrl: audioUrl,
          text: "🎤 Voice Message", // تحریر لازمی ہے
          name: "Me",
          sender: "me",
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isVoice: true,
          status: "sent"
        };

        // میسجز کی لسٹ کو محفوظ طریقے سے اپ ڈیٹ کرنا
        setMessages((prev: any) => {
          const currentList = Array.isArray(prev) ? prev : [];
          return [...currentList, voiceMsg];
        });
      };

      recorder.start();
      setIsRecording(true);
      (window as any).currentRecorder = recorder;

    } else {
      // ریکارڈنگ روکنے کا عمل
      const recorder = (window as any).currentRecorder;
      if (recorder && recorder.state !== "inactive") {
        recorder.stop();
        setIsRecording(false);
        // مائیکروفون کو فارغ کرنا تاکہ دوبارہ استعمال ہو سکے
        recorder.stream.getTracks().forEach((track: any) => track.stop());
      }
    }
  } catch (err) {
    console.error("Mic Error:", err);
    alert("مائیکروفون نہیں چل رہا۔ براہ کرم براؤزر میں مائیک کی اجازت دیں (Allow کریں۔");
  }
};
const playVoiceMessage = (msgId: string) => {
  if (playingVoiceId === msgId) {
    setPlayingVoiceId(null);
    return;
  }
  setPlayingVoiceId(msgId);
  try {

    const msg = (messages as any[]).find((m: any) => m.id === msgId);
    if (msg && msg.audioUrl) {
      const audio = new Audio(msg.audioUrl);
      audio.play();
      audio.onended = () => setPlayingVoiceId(null);
      return;
    }
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const duration = 3;
    const sampleRate = audioCtx.sampleRate;
    const buffer = audioCtx.createBuffer(1, sampleRate * duration, sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      const time = i / sampleRate;
      const envelope = Math.sin(Math.PI * time / duration);
      const speech =
        Math.sin(2 * Math.PI * 180 * time) * 0.3 +
        Math.sin(2 * Math.PI * 240 * time) * 0.2 +
        Math.sin(2 * Math.PI * 320 * time) * 0.1 +
        (Math.random() - 0.5) * 0.05;
      const pausePattern = Math.sin(2 * Math.PI * 1.5 * time) > -0.3 ? 1 : 0.1;
      data[i] = speech * envelope * pausePattern * 0.4;
    }
    const source = audioCtx.createBufferSource();
    source.buffer = buffer;
    const filter = audioCtx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 2000;
    source.connect(filter);
    filter.connect(audioCtx.destination);
    source.start();
    source.onended = () => {
      setPlayingVoiceId(null);
      audioCtx.close();
    };
  } catch (e) {
    console.error("Audio playback error:", e);
    setPlayingVoiceId(null);
  }
};

const StatusIcon = ({ status }: { status: string }) => {
  if (status === "sent") return <Check className="w-3 h-3 text-muted-foreground" />;
  if (status === "delivered") return <CheckCheck className="w-3 h-3 text-muted-foreground" />;
  return <CheckCheck className="w-3 h-3 text-mesh-teal" />;
};

const getMessagePosition = (index: number) => {
  const current = messages[index];
  const prev = messages[index - 1];
  const next = messages[index + 1];
  const isFirst = !prev || prev.sender !== current.sender;
  const isLast = !next || next.sender !== current.sender;
  if (isFirst && isLast) return "single";
  if (isFirst) return "first";
  if (isLast) return "last";
  return "middle";
};

const getBubbleRadius = (sender: "me" | "peer", position: string) => {
  if (sender === "me") {
    switch (position) {
      case "single": return "rounded-2xl rounded-br-md";
      case "first": return "rounded-2xl rounded-br-md";
      case "middle": return "rounded-2xl rounded-r-md";
      case "last": return "rounded-2xl rounded-tr-md";
      default: return "rounded-2xl";
    }
  } else {
    switch (position) {
      case "single": return "rounded-2xl rounded-bl-md";
      case "first": return "rounded-2xl rounded-bl-md";
      case "middle": return "rounded-2xl rounded-l-md";
      case "last": return "rounded-2xl rounded-tl-md";
      default: return "rounded-2xl";
    }
  }
};

return (
  <div className="flex h-screen flex-col bg-background w-full max-w-md md:max-w-lg lg:max-w-xl mx-auto md:shadow-2xl md:border-x md:border-border">
    {/* Header */}
    <div className="mesh-gradient px-3 py-3 flex items-center gap-3 shadow-md z-10">
      <motion.button

        whileTap={{ scale: 0.85 }}
        onClick={() => navigate(isGroup ? "/groups" : "/chats")}
        className="text-primary-foreground p-1.5 rounded-full hover:bg-primary-foreground/10 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
      </motion.button>
      {/* --- فائنل ڈیزائن: یہاں سے پیسٹ کریں --- */}
      <div className="flex items-center gap-3 ml-2">
        {/* تصویر اور کیمرے کا حصہ */}
        <label className="relative cursor-pointer block group">
          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary/30 bg-muted flex items-center justify-center shadow-sm">
            {profilePic ? (
              <img src={profilePic} className="w-full h-full object-cover" alt="Profile" />
            ) : (
              <Camera className="w-5 h-5 text-muted-foreground" />
            )}
          </div>

          <input id="profile-upload" type="file" className="hidden" accept="image/*" onChange={handleProfilePicChange} />

          {/* یہ ہے وہ کیمرے کا نشان جو آپ کو چاہیے */}
          <div className="absolute -bottom-1 -right-1 bg-primary text-white p-1 rounded-full shadow-md border-2 border-background">
            <Camera className="w-3 h-3" />
          </div>
        </label>

        {/* نام اور آن لائن اسٹیٹس */}
        <div className="flex flex-col">
          {isEditingName ? (
            <input
              type="text"
              value={userName}
              onChange={(e) => {
                setUserName(e.target.value);
                localStorage.setItem('zanjeer_name', e.target.value);
              }}
              onBlur={() => setIsEditingName(false)}
              onKeyDown={(e) => e.key === 'Enter' && setIsEditingName(false)}
              className="text-sm font-bold border-b border-primary outline-none bg-transparent w-24 text-primary-foreground"
              autoFocus
            />
          ) : (
            <h2
              className="text-sm font-bold cursor-pointer text-primary-foreground flex items-center gap-1"
              onClick={() => setIsEditingName(true)}
            >
              {userName} <span className="text-[10px] opacity-70">✎</span>
            </h2>
          )}
          <span className="text-[10px] text-primary-foreground/60 leading-none">آن لائن</span>
        </div>
      </div>
      {/* --- ڈیزائن مکمل ہو گیا --- */}

      <div className="flex items-center gap-1">
        {isEditingName ? (
          <input
            type="text"

            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            onBlur={() => setIsEditingName(false)}
            onKeyDown={(e) => e.key === 'Enter' && setIsEditingName(false)}
            className="text-xs font-semibold border-b border-primary outline-none bg-transparent w-20"
            autoFocus
          />
        ) : (
          <h2
            className="text-xs font-semibold cursor-pointer hover:text-primary transition-colors flex items-center gap-1 whitespace-nowrap"
            onClick={() => setIsEditingName(true)}
          >
            {userName} <span className="text-[10px] text-muted-foreground">✎</span>
          </h2>
        )}
      </div>
    </div>
    <Avatar className="w-10 h-10 ring-2 ring-primary-foreground/20">
      <AvatarFallback className={`text-primary-foreground text-xs font-bold ${isGroup ? "bg-primary-foreground/20 text-lg" : "bg-primary-foreground/20"}`}>
        {chatAvatar}
      </AvatarFallback>
    </Avatar>
    <div className="flex-1 min-w-0">
      <p className={`text-sm font-bold text-primary-foreground leading-tight ${language === "ur" ? "font-urdu" : ""}`}>
        {chatName}
      </p>
      <div className="flex items-center gap-1.5 mt-0.5">
        <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? (status === "direct" ? "bg-green-400 animate-pulse" : "bg-blue-400 animate-pulse") : "bg-muted-foreground/50"}`} />
        <span className="text-[10px] text-primary-foreground/70 font-medium">
          {isGroup
            ? t(`${group!.members} members · Mesh`, `${group!.members} ممبرز · میش`)
            : isOnline
              ? status === "direct"
                ? t(`Direct · ${distance}`, `براہ راست · ${distance}`)
                : t(`Relay · Hop ×${hopCount}`, `ریلے · ہاپ ×${hopCount}`)
              : t("Offline", "آف لائن")}
        </span>
      </div>
    </div>

    <div className="flex items-center gap-0.5">
      <div className="p-1.5 rounded-full bg-primary-foreground/10">
        <Shield className="w-3.5 h-3.5 text-primary-foreground/70" />
      </div>
      <div className="p-1.5 rounded-full bg-primary-foreground/10">
        <Radio className="w-3.5 h-3.5 text-primary-foreground/70" />
      </div>
    </div>


    <div className="px-4 py-1.5 bg-secondary/80 backdrop-blur-sm border-b border-border">
      <div className="flex items-center gap-1">
        {Array.from({ length: hopCount }).map((_, i) => (
          <div key={i} className="flex items-center">
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: i * 0.15 }}
              className="w-2 h-2 rounded-full bg-primary"
            />
            {i < hopCount - 1 && (
              <motion.span
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: i * 0.15 + 0.1 }}
                className="w-4 h-[1px] bg-primary/40 origin-left mx-0.5"
              />
            )}
          </div>
        ))}
      </div>
      <span className="text-[10px] text-primary-foreground/70 font-medium mt-1 block">
        {t(`Hop Count: ${hopCount}`, `ہاپ کاؤنٹ: ${hopCount}`)}
      </span>
    </div>
    {/* Messages */}
    <div
      ref={scrollAreaRef}
      onScroll={handleScroll}
      className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5 relative"
      style={{
        backgroundImage: `radial-gradient(circle at 20% 50%, hsl(var(--primary) / 0.03) 0%, transparent 50%),
                            radial-gradient(circle at 80% 20%, hsl(var(--accent) / 0.03) 0%, transparent 50%)`,
      }}
    >
      {/* Encryption & offline notice */}
      <div className="flex flex-col items-center gap-1.5 mb-4">
        <div className="flex items-center gap-1.5 bg-secondary/80 backdrop-blur-sm rounded-full px-3 py-1 border border-border">
          <Shield className="w-3 h-3 text-primary" />
          <span className="text-[10px] text-muted-foreground">
            {t("End-to-end encrypted · No internet used", "اینڈ ٹو اینڈ انکرپٹڈ · انٹرنیٹ استعمال نہیں")}
          </span>
        </div>
        <span className="text-[9px] text-muted-foreground/70">
          {t("Via Bluetooth/WiFi Direct mesh", "بلوٹوتھ/وائی فائی ڈائریکٹ میش کے ذریعے")}
        </span>
      </div>

      <AnimatePresence>
        {messages.map((msg, index) => {
          const position = getMessagePosition(index);
          const isMe = msg.sender === "me";
          const showAvatar = !isMe && (position === "single" || position === "last");

          return (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 15, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className={`flex items-end gap-1.5 ${isMe ? "justify-end" : "justify-start"} ${position === "first" || position === "single" ? "mt-3" : "mt-0.5"
                }`}
            >
              {!isMe && (
                <div className="w-6 shrink-0">
                  {showAvatar && (
                    <Avatar className="w-6 h-6">
                      <AvatarFallback className="mesh-gradient text-primary-foreground text-[8px] font-bold">
                        {chatAvatar}
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              )}

              <div
                className={`max-w-[78%] shadow-sm overflow-hidden ${getBubbleRadius(msg.sender, position)} ${isMe
                  ? "bubble-sent"
                  : "bubble-received border border-border/50"
                  }`}
              >
                {/* Image attachment */}
                {msg.fileType === "image" && msg.fileUrl && (
                  <div
                    className="cursor-pointer relative group"
                    onClick={() => setPreviewImage(msg.fileUrl!)}
                  >
                    <img
                      src={msg.fileUrl}
                      alt={msg.fileName || "Image"}
                      className="w-full max-h-52 object-cover"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                  </div>
                )}

                {/* File attachment */}
                {msg.fileType === "file" && (
                  <div className="mx-3 mt-2 p-2.5 rounded-lg bg-muted/50 border border-border/50 flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-lg mesh-gradient flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5 text-primary-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-foreground truncate">{msg.fileName}</p>
                      <p className="text-[10px] text-muted-foreground">{msg.fileSize}</p>
                    </div>
                    <button
                      onClick={() => handleDownload(msg.fileUrl, msg.fileName)}
                      className="p-1 hover:bg-black/5 rounded-full transition-colors"
                    >
                      <Download className="w-4 h-4 text-muted-foreground shrink-0" />
                    </button>
                  </div>
                )}

                <div className="px-3 py-2">
                  {msg.isVoice && (
                    <button
                      onClick={(e) => { e.stopPropagation(); playVoiceMessage(msg.id); }}
                      className="flex items-center gap-2 mb-1 w-full"
                    >
                      <motion.div
                        animate={playingVoiceId === msg.id ? { scale: [1, 1.15, 1] } : {}}
                        transition={{ repeat: Infinity, duration: 0.8 }}
                        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${playingVoiceId === msg.id ? "bg-primary text-primary-foreground" : "bg-primary/20"
                          }`}
                      >
                        {playingVoiceId === msg.id ? (
                          <Pause className="w-4 h-4" />
                        ) : (
                          <Play className="w-4 h-4 text-primary ml-0.5" />
                        )}
                      </motion.div>
                      <div className="flex gap-[2px] items-end">
                        {[3, 5, 2, 7, 4, 6, 3, 5, 2, 4, 6, 3, 5, 7, 2].map((h, i) => (
                          <motion.div
                            key={i}
                            animate={playingVoiceId === msg.id
                              ? { height: [2, h * 2.5, 2], opacity: [0.4, 1, 0.4] }
                              : { height: h * 2.5 }
                            }
                            transition={playingVoiceId === msg.id
                              ? { delay: i * 0.1, duration: 0.6, repeat: Infinity }
                              : { delay: i * 0.05, duration: 0.3 }
                            }
                            className="w-[2px] bg-primary/60 rounded-full"
                          />
                        ))}
                      </div>
                      <span className="text-[10px] text-muted-foreground ml-1">
                        {playingVoiceId === msg.id ? t("Playing...", "چل رہا ہے...") : msg.time}
                      </span>
                    </button>
                  )}
                  {/* Hide text if it's just the auto-generated file caption and there's a file */}
                  {(!msg.fileType || input.trim()) && (() => {
                    const displayText = language === "ur" && msg.textUr ? msg.textUr : msg.text;
                    const rtl = isRTLText(displayText);
                    return (
                      <p dir={rtl ? "rtl" : "ltr"} className={`text-[13.5px] leading-relaxed text-foreground ${rtl ? "font-urdu text-right" : "text-left"}`}>
                        {displayText}
                      </p>
                    );
                  })()};
                  <div className={`flex items-center gap-1 mt-0.5 ${isMe ? "justify-end" : ""}`}>
                    <span className="text-[9px] text-muted-foreground/70">{msg.time}</span>
                    {isMe && <StatusIcon status={msg.status} />}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
      <div ref={bottomRef} />
    </div>

    {/* Scroll to bottom FAB */}
    <AnimatePresence>
      {showScrollDown && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          onClick={scrollToBottom}
          className="absolute bottom-20 right-4 z-20 w-9 h-9 rounded-full bg-card shadow-lg border border-border flex items-center justify-center"
        >
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        </motion.button>
      )}
    </AnimatePresence>

    {/* Image preview lightbox */}
    <AnimatePresence>
      {previewImage && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setPreviewImage(null)}
        >
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 text-white"
          >
            <X className="w-5 h-5" />
          </motion.button>
          <motion.img
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            src={previewImage}
            alt="Preview"
            className="max-w-full max-h-[80vh] object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </motion.div>
      )}
    </AnimatePresence>

    {/* Attachment menu */}
    <AnimatePresence>
      {showAttachMenu && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          className="absolute bottom-16 left-3 z-30 bg-card rounded-2xl border border-border shadow-xl p-3 flex gap-3"
        >
          <button
            onClick={() => imageInputRef.current?.click()}
            className="flex flex-col items-center gap-1.5 p-3 rounded-xl hover:bg-muted transition-colors"
          >
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <ImageIcon className="w-5 h-5 text-primary" />
            </div>
            <span className="text-[10px] text-foreground font-medium">{t("Gallery", "گیلری")}</span>
          </button>
          <button
            onClick={() => imageInputRef.current?.click()}
            className="flex flex-col items-center gap-1.5 p-3 rounded-xl hover:bg-muted transition-colors"
          >
            <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
              <Camera className="w-5 h-5 text-accent" />
            </div>
            <span className="text-[10px] text-foreground font-medium">{t("Camera", "کیمرا")}</span>
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center gap-1.5 p-3 rounded-xl hover:bg-muted transition-colors"
          >
            <div className="w-12 h-12 rounded-full bg-mesh-blue/10 flex items-center justify-center">
              <FileText className="w-5 h-5 text-mesh-blue" />
            </div>
            <span className="text-[10px] text-foreground font-medium">{t("File", "فائل")}</span>
          </button>
        </motion.div>
      )}
    </AnimatePresence>

    {/* Hidden file inputs */}
    <>
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFileSelect(e, "image")}
      />
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={(e) => handleFileSelect(e, "file")}
      />
    </>
    {/* Pending file preview */}
    <AnimatePresence>
      {pendingFile && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="border-t border-border bg-card px-3 py-2"
        >
          <div className="flex items-center gap-2.5">
            {pendingFile.type === "image" ? (
              <img src={pendingFile.url} alt="Preview" className="w-14 h-14 rounded-lg object-cover border border-border" />
            ) : (
              <div className="w-14 h-14 rounded-lg mesh-gradient flex items-center justify-center">
                <FileText className="w-6 h-6 text-primary-foreground" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-foreground truncate">{pendingFile.name}</p>
              <p className="text-[10px] text-muted-foreground">{pendingFile.size}</p>
            </div>
            <button
              onClick={() => setPendingFile(null)}
              className="p-1.5 rounded-full hover:bg-muted transition-colors"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>

    {/* Input area */}
    <div className="px-3 py-2.5 border-t border-border bg-card/95 backdrop-blur-sm flex items-end gap-2">
      <motion.button
        whileTap={{ scale: 0.9 }}
        className="p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0 mb-0.5"
      >
        <Smile className="w-5 h-5" />
      </motion.button>

      <div className="flex-1 bg-muted/70 rounded-2xl border border-border/50 flex items-end transition-all focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary/30">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              sendMessage();
            }
          }}
          placeholder={t("Type a message...", "پیغام لکھیں...")}
          rows={1}
          dir={isRTLText(input) ? "rtl" : "ltr"}
          className={`flex-1 bg-transparent px-3.5 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none resize-none max-h-24 ${isRTLText(input) ? "font-urdu text-right" : "text-left"}`}
          style={{ minHeight: "36px" }}
        />
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setShowAttachMenu(!showAttachMenu)}
          className={`p-2 rounded-full transition-colors shrink-0 ${showAttachMenu ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
        >
          <Paperclip className="w-4 h-4" />
        </motion.button>
      </div>

      {input.trim() || pendingFile ? (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileTap={{ scale: 0.85 }}
          onClick={sendMessage}
          className="p-2.5 rounded-full mesh-gradient text-primary-foreground shadow-md shrink-0 mb-0.5"
        >
          <Send className="w-4.5 h-4.5" />
        </motion.button>
      ) : (
        <motion.button
          whileTap={{ scale: 0.85 }}
          onClick={handleVoice}
          className={`p-2.5 rounded-full transition-all shrink-0 mb-0.5 ${isRecording
            ? "bg-destructive text-destructive-foreground shadow-lg shadow-destructive/30 animate-pulse"
            : "mesh-gradient text-primary-foreground shadow-md"
            }`}
        >
          <Mic className="w-4.5 h-4.5" />
        </motion.button>
      )}
    </div>
  </div>
);
};    

export default ChatScreen; 