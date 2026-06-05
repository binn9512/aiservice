export type Role =
  | 'user'
  | 'ai';

export type OutfitMessage = {
  id: number;
  type: 'outfit';
  outfits: any[];
};

export type ChatMessage = {
  id: number;
  type: 'message';
  role: Role;
  text: string;
};

export type ChatItem =
  | ChatMessage
  | OutfitMessage;

export type ChatRoom = {
  id: number;
  title: string;
  messages: ChatItem[];
  pinned: boolean;
};