export type Role =
  | 'user'
  | 'ai';

export type Message = {
  id: number;
  role: Role;
  text: string;
};

export type ChatRoom = {
  id: number;
  title: string;
  messages: Message[];
  pinned: boolean;
};