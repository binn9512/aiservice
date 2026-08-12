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

export type ScheduleEvent = {
  title: string;
  start: string;
  end?: string | null;
  allDay?: boolean;
  location?: string;
  category?: string;
};

export type ScheduleMessage = {
  id: number;
  type: 'schedule';
  dateLabel: string | null;
  events: ScheduleEvent[];
  clarifyingQuestion?: string | null;
  suggestedActions?: string[];
  transitionPlan?: string[] | null;
};

export type ChatItem =
  | ChatMessage
  | OutfitMessage
  | ScheduleMessage;

export type ChatRoom = {
  id: number;
  title: string;
  messages: ChatItem[];
  pinned: boolean;
};