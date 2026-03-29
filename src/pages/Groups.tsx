import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Plus, Users, Shield, Radio } from "lucide-react";
import { toast } from "sonner";
import { useApp } from "@/contexts/AppContext";
import { groups } from "@/data/mockData";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import BottomNav from "@/components/BottomNav";

const Groups = () => {
  const navigate = useNavigate();
  const { t, language } = useApp();

  return (
    <div className="flex min-h-screen flex-col bg-background w-full max-w-md md:max-w-lg lg:max-w-xl mx-auto md:shadow-2xl md:border-x md:border-border">
      {/* Header */}
      <div className="mesh-gradient px-4 py-3 pb-4">
        <div className="flex items-center justify-between">
           <div className="flex items-center gap-2">
             <Users className="w-6 h-6 text-primary-foreground" />
             <h1 className="text-xl font-bold text-primary-foreground">
               {t("Groups", "گروپس")}
             </h1>
           </div>
           <button
             onClick={() => {
               toast.info(t("Create Group feature coming soon!", "گروپ بنانے کا فیچر جلد آ رہا ہے!"));
             }}
             className="p-2 rounded-full bg-primary-foreground/20 text-primary-foreground"
           >
             <Plus className="w-5 h-5" />
           </button>
        </div>
        <div className="mt-3 flex items-center gap-2 bg-primary-foreground/10 rounded-full px-3 py-1.5 w-fit">
          <Radio className="w-3 h-3 text-primary-foreground" />
          <span className="text-xs text-primary-foreground">
            {t("Broadcast to all nearby devices", "تمام قریبی آلات کو نشر کریں")}
          </span>
        </div>
      </div>

      {/* Encryption banner */}
      <div className="px-4 py-2 flex items-center justify-center gap-1.5 bg-secondary">
        <Shield className="w-3 h-3 text-primary" />
        <span className="text-[10px] text-muted-foreground">
          {t("Group messages are encrypted & relayed via mesh", "گروپ پیغامات انکرپٹڈ ہیں اور میش کے ذریعے ریلے ہوتے ہیں")}
        </span>
      </div>

      {/* Group list */}
      <div className="flex-1 divide-y divide-border">
        {groups.map((group, i) => (
          <motion.button
            key={group.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            onClick={() => navigate(`/chat/${group.id}`)}
            className="w-full px-4 py-3 flex items-center gap-3 hover:bg-muted/50 transition-colors text-left"
          >
            <Avatar className="w-12 h-12">
              <AvatarFallback className="bg-secondary text-2xl">
                {group.avatar}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className={`font-semibold text-foreground truncate ${language === "ur" ? "font-urdu" : ""}`}>
                  {language === "ur" ? group.nameUr : group.name}
                </span>
                <span className="text-[10px] text-muted-foreground ml-2 shrink-0">
                  {group.lastTime}
                </span>
              </div>
              <div className="flex items-center justify-between mt-0.5">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary">
                    {t(`${group.members} members`, `${group.members} ممبرز`)}
                  </span>
                  <span className="text-xs text-muted-foreground truncate">
                    {language === "ur" ? group.lastMessageUr : group.lastMessage}
                  </span>
                </div>
                {group.unread > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-5 h-5 rounded-full mesh-gradient text-primary-foreground text-[10px] font-bold flex items-center justify-center shrink-0"
                  >
                    {group.unread}
                  </motion.span>
                )}
              </div>
            </div>
          </motion.button>
        ))}
      </div>

      <BottomNav />
    </div>
  );
};

export default Groups;
