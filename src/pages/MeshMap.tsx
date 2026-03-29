import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Radio, Wifi, SignalHigh, SignalLow, Activity } from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { meshNodes, meshConnections, peers } from "@/data/mockData";
import { useState, useEffect } from "react";
import BottomNav from "@/components/BottomNav";

const MeshMap = () => {
  const navigate = useNavigate();
  const { t, language } = useApp();
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [activePulse, setActivePulse] = useState<number>(0);
  const [scanAngle, setScanAngle] = useState(0);

  const onlinePeers = peers.filter((p) => p.online).length;

  useEffect(() => {
    const interval = setInterval(() => {
      setScanAngle((prev) => (prev + 2) % 360);
    }, 30);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActivePulse((prev) => (prev + 1) % meshConnections.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const selectedPeer = selectedNode ? peers.find((p) => p.id === selectedNode) : null;
  const selectedMeshNode = selectedNode ? meshNodes.find((n) => n.id === selectedNode) : null;

  return (
    <div className="flex min-h-screen flex-col bg-background w-full max-w-md md:max-w-lg lg:max-w-xl mx-auto md:shadow-2xl md:border-x md:border-border">
      {/* Header */}
      <div className="mesh-gradient px-4 py-3 flex items-center gap-3">
        <Radio className="w-5 h-5 text-primary-foreground" />
        <h1 className="text-lg font-semibold text-primary-foreground">
          {t("Mesh Network", "میش نیٹ ورک")}
        </h1>
        <div className="ml-auto flex items-center gap-1.5 bg-primary-foreground/15 rounded-full px-2.5 py-1">
          <Activity className="w-3 h-3 text-primary-foreground" />
          <span className="text-[10px] text-primary-foreground font-medium">
            {t("LIVE", "لائیو")}
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="px-4 py-3 grid grid-cols-3 gap-2">
        {[
          { value: onlinePeers, label: t("Active Nodes", "فعال نوڈز"), color: "text-primary" },
          { value: meshConnections.length, label: t("Links", "لنکس"), color: "text-accent" },
          { value: "3", label: t("Max Hops", "زیادہ سے زیادہ ہاپ"), color: "text-mesh-blue" },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-card rounded-xl p-3 text-center border border-border"
          >
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            <p className="text-[10px] text-muted-foreground">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Mesh radar visualization */}
      <div className="mx-4 bg-card rounded-2xl border border-border relative overflow-hidden" style={{ height: 300 }}>
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
          {[12, 24, 36].map((r, i) => (
            <circle key={i} cx="50" cy="50" r={r} fill="none" stroke="hsl(var(--border))" strokeWidth="0.3" strokeDasharray="1.5 1" opacity={0.6} />
          ))}
          <defs>
            <linearGradient id="radarSweep" gradientTransform={`rotate(${scanAngle} 50 50)`}>
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.25" />
              <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path
            d={`M 50 50 L ${50 + 40 * Math.cos((scanAngle * Math.PI) / 180)} ${50 + 40 * Math.sin((scanAngle * Math.PI) / 180)} A 40 40 0 0 0 ${50 + 40 * Math.cos(((scanAngle - 45) * Math.PI) / 180)} ${50 + 40 * Math.sin(((scanAngle - 45) * Math.PI) / 180)} Z`}
            fill="url(#radarSweep)"
          />
          {meshConnections.map((conn, i) => {
            const from = meshNodes.find((n) => n.id === conn.from);
            const to = meshNodes.find((n) => n.id === conn.to);
            if (!from || !to) return null;
            const isActive = activePulse === i;
            return (
              <g key={`conn-${i}`}>
                <motion.line initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 0.35 }} transition={{ delay: i * 0.2, duration: 0.6 }} x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke="hsl(var(--primary))" strokeWidth="0.4" strokeDasharray="1.5 1" />
                {isActive && <motion.circle initial={{ cx: from.x, cy: from.y, opacity: 1 }} animate={{ cx: to.x, cy: to.y, opacity: 0.3 }} transition={{ duration: 1.5, ease: "easeInOut" }} r="1.2" fill="hsl(var(--accent))" />}
                <motion.circle cx={(from.x + to.x) / 2} cy={(from.y + to.y) / 2} r="0.6" fill="hsl(var(--primary))" animate={{ opacity: [0.3, 0.8, 0.3] }} transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }} />
              </g>
            );
          })}
        </svg>

        {meshNodes.map((node, i) => {
          const isMe = node.isMe;
          const isSelected = selectedNode === node.id;
          return (
            <motion.div key={node.id} initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.3 + i * 0.12, type: "spring", stiffness: 200 }} className="absolute flex flex-col items-center cursor-pointer" style={{ left: `${node.x}%`, top: `${node.y}%`, transform: "translate(-50%, -50%)" }} onClick={() => !isMe && setSelectedNode(isSelected ? null : node.id)}>
              {isMe && (
                <>
                  <motion.div className="absolute rounded-full bg-primary/15" animate={{ width: [32, 56], height: [32, 56], opacity: [0.6, 0] }} transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }} />
                  <motion.div className="absolute rounded-full bg-primary/10" animate={{ width: [32, 72], height: [32, 72], opacity: [0.4, 0] }} transition={{ duration: 2, repeat: Infinity, ease: "easeOut", delay: 0.5 }} />
                </>
              )}
              {isSelected && <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="absolute w-11 h-11 rounded-full border-2 border-accent" />}
              <motion.div whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.95 }} animate={!isMe ? { scale: [1, 1.05, 1], opacity: [0.85, 1, 0.85] } : {}} transition={!isMe ? { duration: 3, repeat: Infinity, delay: i * 0.4 } : {}} className={`w-9 h-9 rounded-full flex items-center justify-center text-[10px] font-bold shadow-lg z-10 ${isMe ? "mesh-gradient text-primary-foreground shadow-primary/30" : (node as any).status === "direct" ? "bg-primary text-primary-foreground shadow-primary/20" : "bg-accent text-accent-foreground shadow-accent/20"}`}>
                {isMe ? <Wifi className="w-4 h-4" /> : (language === "ur" ? node.nameUr : node.name).slice(0, 2)}
              </motion.div>
              <span className="text-[8px] text-muted-foreground mt-1 whitespace-nowrap font-medium">
                {language === "ur" ? node.nameUr : node.name}
              </span>
            </motion.div>
          );
        })}

        <AnimatePresence>
          {selectedPeer && selectedMeshNode && (
            <motion.div initial={{ opacity: 0, y: 8, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: 0.95 }} className="absolute bottom-3 left-3 right-3 bg-background/95 backdrop-blur-md rounded-xl p-3 border border-border shadow-lg">
              <div className="flex items-center gap-2.5">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold ${selectedPeer.status === "direct" ? "bg-primary text-primary-foreground" : "bg-accent text-accent-foreground"}`}>
                  {selectedPeer.avatar}
                </div>
                <div className="flex-1">
                  <p className={`text-sm font-semibold text-foreground ${language === "ur" ? "font-urdu" : ""}`}>
                    {language === "ur" ? selectedPeer.nameUr : selectedPeer.name}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${selectedPeer.status === "direct" ? "bg-primary/10 text-primary" : "bg-accent/10 text-accent"}`}>
                      {selectedPeer.status === "direct" ? t("Direct", "براہ راست") : t(`Relay ×${selectedPeer.hopCount}`, `ریلے ×${selectedPeer.hopCount}`)}
                    </span>
                    <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                      {selectedPeer.status === "direct" ? <SignalHigh className="w-3 h-3" /> : <SignalLow className="w-3 h-3" />}
                      {selectedPeer.distance}
                    </span>
                  </div>
                </div>
                <button onClick={() => navigate(`/chat/${selectedPeer.id}`)} className="px-3 py-1.5 mesh-gradient text-primary-foreground text-xs font-medium rounded-full">
                  {t("Chat", "چیٹ")}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Node list */}
      <div className="px-4 py-3 flex-1 overflow-y-auto">
        <h2 className={`text-sm font-semibold text-foreground mb-2 ${language === "ur" ? "font-urdu text-right" : ""}`}>
          {t("Network Nodes", "نیٹ ورک نوڈز")}
        </h2>
        <div className="space-y-2">
          {peers.map((peer, i) => (
            <motion.div key={peer.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + i * 0.08 }} onClick={() => setSelectedNode(selectedNode === peer.id ? null : peer.id)} className={`flex items-center gap-3 bg-card rounded-xl p-3 border transition-colors cursor-pointer ${selectedNode === peer.id ? "border-primary" : "border-border"}`}>
              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold ${peer.status === "direct" ? "bg-primary text-primary-foreground" : "bg-accent text-accent-foreground"}`}>
                {peer.avatar}
              </div>
              <div className="flex-1">
                <p className={`text-sm font-medium text-foreground ${language === "ur" ? "font-urdu" : ""}`}>
                  {language === "ur" ? peer.nameUr : peer.name}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${peer.status === "direct" ? "bg-primary/10 text-primary" : "bg-accent/10 text-accent"}`}>
                    {peer.status === "direct" ? t("Direct", "براہ راست") : t(`Relay ×${peer.hopCount}`, `ریلے ×${peer.hopCount}`)}
                  </span>
                  <span className="text-[10px] text-muted-foreground">{peer.distance}</span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <div className={`w-2 h-2 rounded-full ${peer.online ? "bg-primary" : "bg-muted-foreground"}`} />
                {peer.status === "direct" ? <SignalHigh className="w-3.5 h-3.5 text-primary" /> : <SignalLow className="w-3.5 h-3.5 text-accent" />}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default MeshMap;
