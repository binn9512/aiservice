import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
} from 'react';

import {
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  View,
} from 'react-native';

import {
  useRoute,
  RouteProp,
  useNavigation,
  useFocusEffect,
} from '@react-navigation/native';

import AsyncStorage from '@react-native-async-storage/async-storage';

import ChatBubble from '../components/chat/ChatBubble';

import ChatInput from '../components/chat/ChatInput';

import OutfitCarousel from '../components/outfit/OutfitCarousel';

import ItemDetailModal from '../components/modal/ItemDetailModal';

import ChatListModal from '../components/modal/ChatListModal';

import RecommendHeader from '../components/recommend/RecommendHeader';

import RecommendBottomSection from '../components/recommend/RecommendBottomSection';

import useRecommendChat from '../hooks/useRecommendChat';

import {
  OutfitItem,
} from '../data/mockOutfits';

import quickPrompts from '../data/quickPrompts';

import styles from '../styles/recommend.styles';

const RecommendScreen = () => {
  const route =
    useRoute<RouteProp<any>>();

  const navigation = 
    useNavigation<any>();

  const scrollRef =
    useRef<ScrollView>(null);

  const [selectedItem, setSelectedItem] =
    useState<OutfitItem | null>(
      null,
    );

  const [modalVisible, setModalVisible] =
    useState(false);

  const [menuVisible, setMenuVisible] =
    useState(false);

  const [showOptions, setShowOptions] =
    useState(false);

  const [menuChatId, setMenuChatId] =
    useState<number | null>(null);

  const [inputText, setInputText] =
    useState('');

  const {
    currentChat,
    loading,
    chatRooms,
    setChatRooms,
    recommendedItems,
    recommendedOutfits,
    handleSend,
    handleNewChat,
    handleDeleteChat,
    handleSelectChat,
    handleRenameChat,
  } = useRecommendChat();

  const handleItemPress = (
    item: OutfitItem,
  ) => {
    setSelectedItem(item);

    setModalVisible(true);
  };

  useFocusEffect(
    useCallback(() => {
      const loadPrompt =
        async () => {
          console.log('🔥 loadPrompt 실행');

          const prompt =
            await AsyncStorage.getItem(
              'PENDING_PROMPT',
            );

          console.log('🔥 PENDING_PROMPT =', prompt);

          if (!prompt) {
            return;
          }

          await AsyncStorage.removeItem(
            'PENDING_PROMPT',
          );

          console.log('🔥 handleSend 호출');

          handleSend(prompt);
        };

      loadPrompt();
    }, []),
  );

  const handlePinChat = (
    roomId: number,
  ) => {
    setChatRooms(prev => {
      const updated = prev.map(
        room =>
          room.id === roomId
            ? {
                ...room,
                pinned:
                  !room.pinned,
              }
            : room,
      );

      const sortedRooms =
        [...updated].sort(
          (a, b) => {
            if (
              a.pinned ===
              b.pinned
            ) {
              return 0;
            }

            return a.pinned
              ? -1
              : 1;
          },
        );

      return sortedRooms;
    });

    setMenuChatId(null);
  };

  return (
    <SafeAreaView
      style={styles.container}>
      
      <KeyboardAvoidingView
        style={{flex: 1}}
        behavior={
          Platform.OS === 'ios'
            ? 'padding'
            : 'height'
        }
        keyboardVerticalOffset={
          -38
        }>

        {/* Header */}
        <RecommendHeader
          onPressMenu={() =>
            setMenuVisible(true)
          }
        />

        {/* Chat Area */}
        <ScrollView
          ref={scrollRef}
          style={{flex: 1}}
          contentContainerStyle={
            styles.content
          }
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={
            false
          }
          onContentSizeChange={() =>
            scrollRef.current?.scrollToEnd(
              {
                animated: true,
              },
            )
          }>

          {currentChat.messages.map(
            item => {
              if (
                item.type ===
                'message'
              ) {
                return (
                  <View
                    key={item.id}
                    style={{
                      marginBottom: 0,
                    }}>
                    <ChatBubble
                      role={item.role}
                      text={item.text}
                    />
                  </View>
                );
              }

              return (
                <View
                  key={item.id}
                  style={{
                    marginBottom:
                      item.type === 'outfit'
                        ? 16
                        : 16,
                  }}>
                  <OutfitCarousel
                    recommendedOutfits={
                      item.outfits
                    }
                    onItemPress={
                      handleItemPress
                    }
                  />
                </View>
              );
            },
          )}

          {loading && (
            <ChatBubble
              role="ai"
              text="코디를 추천하는 중이에요..."
            />
          )}

          

          <View
            style={{height: 20}}
          />
        </ScrollView>

        {/* Bottom Section */}
        <RecommendBottomSection
          showOptions={
            showOptions
          }
          setShowOptions={
            setShowOptions
          }
          quickPrompts={
            quickPrompts
          }
          onQuickPromptPress={
            handleSend
          }>

          <ChatInput
            value={inputText}
            onChangeText={
              setInputText
            }
            onSend={async text => {
              await handleSend(text);

              setInputText('');
            }}
          />
        </RecommendBottomSection>

        {/* Item Detail Modal */}
        <ItemDetailModal
          visible={modalVisible}
          item={selectedItem}
          onClose={() => {
            setModalVisible(false);
          }}
          onRecommendQuestion={async (
            prompt,
          ) => {
            setModalVisible(false);

            await handleSend(prompt);
          }}
        />

        {/* Chat List Modal */}
        <ChatListModal
          visible={menuVisible}
          currentChatId={
            currentChat.id
          }
          chatRooms={chatRooms}
          onClose={() =>
            setMenuVisible(
              false,
            )
          }
          onNewChat={
            handleNewChat
          }
          onSelectChat={
            handleSelectChat
          }
          onDeleteChat={
            handleDeleteChat
          }
          onOpenMenu={
            setMenuChatId
          }
          menuChatId={
            menuChatId
          }
          setMenuChatId={
            setMenuChatId
          }
          onRenameChat={
            handleRenameChat
          }
          onPinChat={
            handlePinChat
          }
          selectedChatId={
            menuChatId
          }
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default RecommendScreen;