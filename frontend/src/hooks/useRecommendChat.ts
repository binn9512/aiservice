import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  Alert,
} from 'react-native';

import {
  ChatRoom,
  ChatMessage,
  ChatItem,
  OutfitMessage,
} from '../types/chat';

import {
  initialMessage,
} from '../data/mockMessages';

const model1 = require(
  '../assets/images/model1.jpeg',
);

const CHAT_STORAGE_KEY =
  'MYVFF_CHAT_DATA';

const useRecommendChat = () => {

  const [loading, setLoading] =
    useState(false);
    
  const [recommendedItems, setRecommendedItems] =
    useState<any>(null);

  const [recommendedOutfits, setRecommendedOutfits] =
    useState<any[]>([]);

  const [chatRooms, setChatRooms] =
    useState<ChatRoom[]>([
      {
        id: 1,
        title: '새 채팅',
        messages: [initialMessage],
        pinned: false,
      },
    ]);

  const [currentChatId, setCurrentChatId] =
    useState(1);

    useEffect(() => {
      const loadChats =
        async () => {
          try {
            const saved =
              await AsyncStorage.getItem(
                CHAT_STORAGE_KEY,
              );

            console.log(
              'SAVED CHAT DATA:',
               saved,
            );

            if (!saved) {
              return;
            }

            const parsed =
              JSON.parse(saved);

            if (
              parsed.chatRooms &&
              parsed.currentChatId
            ) {
              setChatRooms(
                parsed.chatRooms,
              );

              setCurrentChatId(
                parsed.currentChatId,
              );
            }
          } catch (error) {
            console.log(
              'CHAT LOAD ERROR',
              error,
            );
          }
        };

      loadChats();
      }, []);

    useEffect(() => {
    const saveChats =
      async () => {
        try {
          await AsyncStorage.setItem(
            CHAT_STORAGE_KEY,
            JSON.stringify({
              chatRooms,
              currentChatId,
            }),
          );
        } catch (error) {
          console.log(
            'CHAT SAVE ERROR',
            error,
          );
        }
      };

    saveChats();
  }, [
    chatRooms,
    currentChatId,
  ]);

  const currentChat = useMemo(() => {
    return (
      chatRooms.find(
        room =>
          room.id ===
          currentChatId,
      ) || chatRooms[0]
    );
  }, [
    chatRooms,
    currentChatId,
  ]);

  const handleSend = async (
    text: string,
  ) => {
    console.log(
      'handleSend:',
      text,
    );

    const trimmedText =
      text.trim();

    if (!trimmedText) {
      return;
    }

    const userMessage: ChatMessage = {
      id: Date.now(),
      type: 'message',
      role: 'user',
      text: trimmedText,
    };

    setChatRooms(prev =>
      prev.map(room => {
        if (
          room.id ===
          currentChatId
        ) {
          return {
            ...room,

            title:
              room.title ===
              '새 채팅'
                ? trimmedText.slice(
                    0,
                    12,
                  )
                : room.title,

            messages: [
              ...room.messages,
              userMessage,
            ],
          };
        }

        return room;
      }),
    );

    setLoading(true);

    try {
      const response =
        await fetch(
          'http://127.0.0.1:5001/chat',
          {
            method: 'POST',

            headers: {
              'Content-Type':
                'application/json',
            },

            body: JSON.stringify(
              {
                message:
                  trimmedText,
              },
            ),
          },
        );

      console.log(
        'RESPONSE STATUS:',
        response.status,
      );

      const rawText =
        await response.text();

      console.log(
        'RAW RESPONSE:',
        rawText,
      );

      let data;

      try {
        data = JSON.parse(
          rawText,
        );
      } catch (parseError) {

        console.log(
          'JSON PARSE ERROR:',
          parseError,
        );

        Alert.alert(
          'JSON ERROR',
          rawText,
        );

        throw parseError;
      }

      console.log(
        'AI RESPONSE:',
        data,
      );

      console.log(
        'RECOMMENDED ITEMS:',
        JSON.stringify(
          data.items,
          null,
          2,
        ),
      );

      setRecommendedItems(data.items);

      const items = [
        data.items?.outer,
        data.items?.top,
        data.items?.bottom,
        data.items?.dress,
        data.items?.shoes,
        data.items?.bag,
      ]
        .filter(Boolean)
        .map((item: any) => ({
          id: String(item.id),
          name: item.name || item.category,
          image: `http://127.0.0.1:5001/${item.image}`,
          type: 'closet',
          tags: item.style
            ? item.style
                .split(',')
                .map((tag: string) =>
                  tag.trim(),
                )
            : [],
          similarItems: [],
        }));

      const aiMessage: ChatMessage = {
        id: Date.now() + 1,
        type: 'message',
        role: 'ai',
        text:
          data.message ||
          '코디 추천 결과가 도착했어요 ✨',
      };

      const outfitMessage: OutfitMessage = {
        id: Date.now() + 2,
        type: 'outfit',
        outfits: [
          {
            id: String(Date.now()),
            modelImage: model1,
            items,
          },
        ],
      };

      setChatRooms(prev =>
        prev.map(room => {
          if (
            room.id ===
            currentChatId
          ) {
            return {
              ...room,

              messages: [
                ...room.messages,
                aiMessage,
                outfitMessage,
              ],
            };
          }

          return room;
        }),
      );

    } catch (error: any) {

      console.log(
        'CHAT ERROR:',
        error,
      );

      console.log(
        'CHAT ERROR STRING:',
        String(error),
      );

      console.log(
        'CHAT ERROR JSON:',
        JSON.stringify(
          error,
          null,
          2,
        ),
      );

      Alert.alert(
        'ERROR',
        String(error),
      );

      const errorMessage: ChatMessage =
        {
          id: Date.now() + 1,
          type: 'message',
          role: 'ai',

          text:
            '서버 연결 중 오류가 발생했어요 🥲',
        };

      setChatRooms(prev =>
        prev.map(room => {
          if (
            room.id ===
            currentChatId
          ) {
            return {
              ...room,

              messages: [
                ...room.messages,
                errorMessage,
              ],
            };
          }

          return room;
        }),
      );
    }

    setLoading(false);
  };

  const handleNewChat = () => {
    const newChatId =
      Date.now();

    const newChat: ChatRoom = {
      id: newChatId,

      title: '새 채팅',

      messages: [
        initialMessage,
      ],

      pinned: false,
    };

    setChatRooms(prev => {
      const pinnedChats =
        prev.filter(
          room => room.pinned,
        );

      const normalChats =
        prev.filter(
          room => !room.pinned,
        );

      return [
        ...pinnedChats,
        newChat,
        ...normalChats,
      ];
    });

    setCurrentChatId(
      newChatId,
    );
  };

  const handleSelectChat = (
    chatId: number,
  ) => {
    setCurrentChatId(chatId);
  };

  const handleDeleteChat = (
    chatId: number,
  ) => {
    const filtered =
      chatRooms.filter(
        room =>
          room.id !== chatId,
      );

    if (
      filtered.length === 0
    ) {
      const newChat: ChatRoom =
        {
          id: Date.now(),

          title: '새 채팅',

          messages: [
            initialMessage,
          ],

          pinned: false,
        };

      setChatRooms([
        newChat,
      ]);

      setCurrentChatId(
        newChat.id,
      );

      return;
    }

    setChatRooms(filtered);

    if (
      currentChatId ===
      chatId
    ) {
      setCurrentChatId(
        filtered[0].id,
      );
    }
  };

  const handleRenameChat = (
    chatId: number,
    newTitle: string,
  ) => {
    const trimmedTitle =
      newTitle.trim();

    if (!trimmedTitle) {
      return;
    }

    setChatRooms(prev =>
      prev.map(room => {
        if (
          room.id === chatId
        ) {
          return {
            ...room,

            title:
              trimmedTitle,
          };
        }

        return room;
      }),
    );
  };

  return {
    loading,
    currentChat,
    chatRooms,
    setChatRooms,
    currentChatId,
    recommendedItems,
    recommendedOutfits,
    handleSend,
    handleNewChat,
    handleSelectChat,
    handleDeleteChat,
    handleRenameChat,
  };
};

export default useRecommendChat;