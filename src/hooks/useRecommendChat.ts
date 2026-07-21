import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useMemo, useState } from 'react';
import { Alert } from 'react-native';
import { ChatRoom, ChatMessage, ChatItem, OutfitMessage, ScheduleMessage } from '../types/chat';

// 서버 주소 변수화
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL!;
const model1 = require('../assets/avatar/base_avatar.png');
const CHAT_STORAGE_KEY = 'MYVFF_CHAT_DATA';

// 초기 메시지 생성 함수 및 변수 선언
const createInitialMessage = (): ChatMessage => ({
  id: 0,
  type: 'message',
  role: 'ai',
  text: '오늘 어떤 코디를 추천해드릴까요?',
});

const initialMessage = createInitialMessage();

const useRecommendChat = () => {
  const [loading, setLoading] = useState(false);
  const [recommendedItems, setRecommendedItems] = useState<any>(null);
  const [recommendedOutfits, setRecommendedOutfits] = useState<any[]>([]);
  
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([
    {
      id: 1,
      title: '새 채팅',
      messages: [initialMessage],
      pinned: false,
    },
  ]);

  const [currentChatId, setCurrentChatId] = useState(1);

  useEffect(() => {
    const loadChats = async () => {
      try {
        const saved = await AsyncStorage.getItem(CHAT_STORAGE_KEY);
        if (!saved) return;
        const parsed = JSON.parse(saved);
        if (parsed.chatRooms && parsed.currentChatId) {
          setChatRooms(parsed.chatRooms);
          setCurrentChatId(parsed.currentChatId);
        }
      } catch (error) {
        console.log('CHAT LOAD ERROR', error);
      }
    };
    loadChats();
  }, []);

  useEffect(() => {
    const saveChats = async () => {
      try {
        await AsyncStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify({ chatRooms, currentChatId }));
      } catch (error) {
        console.log('CHAT SAVE ERROR', error);
      }
    };
    saveChats();
  }, [chatRooms, currentChatId]);

  const currentChat = useMemo(() => {
    return chatRooms.find(room => room.id === currentChatId) || chatRooms[0];
  }, [chatRooms, currentChatId]);

  const handleSend = async (text: string) => {
    const trimmedText = text.trim();
    if (!trimmedText) return;

    const userMessage: ChatMessage = {
      id: Date.now(),
      type: 'message',
      role: 'user',
      text: trimmedText,
    };

    setChatRooms(prev =>
      prev.map(room => {
        if (room.id === currentChatId) {
          return {
            ...room,
            title: room.title === '새 채팅' ? trimmedText.slice(0, 12) : room.title,
            messages: [...room.messages, userMessage],
          };
        }
        return room;
      })
    );

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: trimmedText }),
      });

      const data = await response.json();

      const aiMessage: ChatMessage = {
        id: Date.now() + 1,
        type: 'message',
        role: 'ai',
        text: data.message || '코디 추천 결과가 도착했어요 ✨',
      };

      const newMessages: ChatItem[] = [aiMessage];

      if (data.intent) {
        // 📅 일정 기반 코디 응답 - 일정 카드 + 후속 액션 칩 (옷장 아이템 이미지 합성 없음)
        if (data.events?.length || data.suggestedActions?.length || data.clarifyingQuestion) {
          const scheduleMessage: ScheduleMessage = {
            id: Date.now() + 2,
            type: 'schedule',
            dateLabel: data.dateLabel ?? null,
            events: data.events ?? [],
            clarifyingQuestion: data.clarifyingQuestion ?? null,
            suggestedActions: data.suggestedActions ?? [],
            transitionPlan: data.transitionPlan ?? null,
          };
          newMessages.push(scheduleMessage);
        }
      } else {
        setRecommendedItems(data.items);

        const items = [data.items?.outer, data.items?.top, data.items?.bottom, data.items?.dress, data.items?.shoes, data.items?.bag]
          .filter(Boolean)
          .map((item: any) => ({
            id: String(item.id),
            name: item.name || item.category,
            image: `${API_BASE_URL}/${item.image}`,
            type: 'closet',
            tags: item.style ? item.style.split(',').map((tag: string) => tag.trim()) : [],
            similarItems: [],
          }));

        const outfitMessage: OutfitMessage = {
          id: Date.now() + 3,
          type: 'outfit',
          outfits: [{
            id: String(Date.now()),
            modelImage: data.outfit_image ? `${API_BASE_URL}/${data.outfit_image}` : model1,
            items,
          }],
        };
        newMessages.push(outfitMessage);
      }

      setChatRooms(prev =>
        prev.map(room => room.id === currentChatId ? { ...room, messages: [...room.messages, ...newMessages] } : room)
      );
    } catch (error) {
      Alert.alert('ERROR', String(error));
      const errorMessage: ChatMessage = { id: Date.now() + 1, type: 'message', role: 'ai', text: '서버 연결 중 오류가 발생했어요 🥲' };
      setChatRooms(prev =>
        prev.map(room => room.id === currentChatId ? { ...room, messages: [...room.messages, errorMessage] } : room)
      );
    }
    setLoading(false);
  };

  const handleNewChat = () => {
    const newChatId = Date.now();
    const newChat: ChatRoom = { id: newChatId, title: '새 채팅', messages: [initialMessage], pinned: false };
    setChatRooms(prev => {
      const pinnedChats = prev.filter(room => room.pinned);
      const normalChats = prev.filter(room => !room.pinned);
      return [...pinnedChats, newChat, ...normalChats];
    });
    setCurrentChatId(newChatId);
  };

  const handleSelectChat = (chatId: number) => setCurrentChatId(chatId);

  const handleDeleteChat = (chatId: number) => {
    const filtered = chatRooms.filter(room => room.id !== chatId);
    if (filtered.length === 0) {
      const newChat: ChatRoom = { id: Date.now(), title: '새 채팅', messages: [initialMessage], pinned: false };
      setChatRooms([newChat]);
      setCurrentChatId(newChat.id);
      return;
    }
    setChatRooms(filtered);
    if (currentChatId === chatId) setCurrentChatId(filtered[0].id);
  };

  const handleRenameChat = (chatId: number, newTitle: string) => {
    const trimmedTitle = newTitle.trim();
    if (!trimmedTitle) return;
    setChatRooms(prev => prev.map(room => room.id === chatId ? { ...room, title: trimmedTitle } : room));
  };

  return {
    loading, currentChat, chatRooms, setChatRooms, currentChatId,
    recommendedItems, recommendedOutfits, handleSend, handleNewChat,
    handleSelectChat, handleDeleteChat, handleRenameChat,
  };
};

export default useRecommendChat;