import {
  Message,
} from '../types/chat';

const mockMessages: Message[] = [
  {
    id: 1,

    role: 'ai',

    text:
      '오늘 어떤 스타일 원하세요?',
  },

  {
    id: 2,

    role: 'user',

    text:
      '한강 갈 건데 스트릿 느낌으로 추천해줘',
  },

  {
    id: 3,

    role: 'ai',

    text:
      '이런 코디 추천해드릴게요!',
  },
];

export const initialMessage: Message =
  {
    id: 0,

    role: 'ai',

    text:
      '오늘 어떤 코디를 추천해드릴까요?',
  };

export default mockMessages;