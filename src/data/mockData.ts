export interface Peer {
  id: string;
  name: string;
  nameUr: string;
  avatar: string;
  status: "direct" | "relay";
  distance: string;
  lastMessage: string;
  lastMessageUr: string;
  lastTime: string;
  online: boolean;
  hopCount: number;
}

export interface Message {
  id: string;
  text: string;
  textUr?: string;
  sender: "me" | "peer";
  time: string;
  status: "sent" | "delivered" | "read";
  hopCount: number;
  isVoice?: boolean;
  fileType?: "image" | "file";
  fileName?: string;
  fileSize?: string;
  fileUrl?: string;
}

export const peers: Peer[] = [
  {
    id: "1",
    name: "Ahmed Khan",
    nameUr: "احمد خان",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ahmed",
    status: "direct",
    distance: "20m",
    lastMessage: "Hello, how are you?",
    lastMessageUr: "ہیلو، کیا حال ہے؟",
    lastTime: "10:30 AM",
    online: true,
    hopCount: 0
  },
  {
    id: "2",
    name: "Sara Ali",
    nameUr: "سارہ علی",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sara",
    status: "relay",
    distance: "150m",
    lastMessage: "The file is ready.",
    lastMessageUr: "فائل تیار ہے۔",
    lastTime: "Yesterday",
    online: false,
    hopCount: 1
  }
];

export interface Group {
  id: string;
  name: string;
  nameUr: string;
  avatar: string;
  members: number;
  lastMessage: string;
  lastMessageUr: string;
  lastTime: string;
  unread: number;
}

export const groups: Group[] = [];


export const chatMessages: Record<string, Message[]> = {};


export const meshNodes = [
  { id: "me", name: "You", nameUr: "آپ", x: 50, y: 50, isMe: true },
];

export const meshConnections: { from: string; to: string }[] = [];

