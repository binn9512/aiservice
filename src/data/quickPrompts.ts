export interface QuickPrompt {
  id: string;
  category: string;
  text: string;
}

export const quickPrompts = [
  {
    id: '1',
    category: '날씨/상황',
    text: '오늘 날씨에 맞는 코디 추천해줘',
  },
  {
    id: '2',
    category: '스타일',
    text: '데이트룩으로 좋은 스타일 추천해줘',
  },
  {
    id: '3',
    category: '스타일',
    text: '출근할 때 입기 좋은 깔끔한 룩 추천해줘',
  },
  {
    id: '4',
    category: '스타일',
    text: '미니멀룩 추천해줘',
  },
  {
    id: '5',
    category: '일정/캘린더',
    text: '내일 일정에 어울리는 코디 추천해줘',
  },
];

export default quickPrompts;