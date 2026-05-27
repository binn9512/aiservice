import {
  useMemo,
  useState,
} from 'react';

import {
  Alert,
} from 'react-native';

import {
  ChatRoom,
  Message,
} from '../types/chat';

import {
  initialMessage,
} from '../data/mockMessages';

const useRecommendChat = () => {
  const [loading, setLoading] =
    useState(false);

  const [chatRooms, setChatRooms] =
  useState([
    {
      id: 1,
      title: '새 채팅',
      messages: [initialMessage],
      pinned: false,
    },
  ]);

  const [currentChatId, setCurrentChatId] =
    useState(1);

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

  const userMessage: Message = {
    id: Date.now(),

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

    const data =
      await response.json();

    console.log(
      'AI RESPONSE:',
      data,
    );

    const aiMessage: Message =
      {
        id: Date.now() + 1,

        role: 'ai',

        text:
          data.message ||
          '코디 추천 결과가 도착했어요 ✨',
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
            ],
          };
        }

        return room;
      }),
    );
  } catch (error) {

  Alert.alert(
  'ERROR',
  JSON.stringify(error),
);

  console.log(
    'CHAT ERROR:',
    error,
  );

  const errorMessage: Message =
      {
        id: Date.now() + 1,

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

    setChatRooms(prev => [
      newChat,
      ...prev,
    ]);

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

    handleSend,

    handleNewChat,

    handleSelectChat,

    handleDeleteChat,

    handleRenameChat,
  };
};

export default useRecommendChat;