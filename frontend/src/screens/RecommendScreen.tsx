import React, {
  useEffect,
  useRef,
  useState,
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
} from '@react-navigation/native';

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

import {
  analyzeImage,
} from '../api/recommend';

const RecommendScreen = () => {
  const route =
  useRoute<RouteProp<any>>();

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

  const [useMyCloset, setUseMyCloset] =
    useState(false);

  const [showOptions, setShowOptions] =
    useState(false);

  const [menuChatId, setMenuChatId] =
    useState<number | null>(null);

  const [analysisResult, setAnalysisResult] =
    useState<any>(null);

  const [inputText, setInputText] =
  useState('');

  const {
    currentChat,
    loading,
    chatRooms,
    setChatRooms,
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

  const handleTest = async () => {
    try {
      const result =
        await analyzeImage(
          'user1',
          'blouse.jpg',
        );

      setAnalysisResult(result);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    const prompt =
      route.params?.prompt;

    if (prompt) {
      handleSend(prompt);
    }
  }, [route.params]);

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

      return updated.sort(
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
        }
      >
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
            message => (
              <ChatBubble
                key={message.id}
                role={message.role}
                text={message.text}
              />
            ),
          )}

          {loading && (
            <ChatBubble
              role="ai"
              text="코디를 추천하는 중이에요..."
            />
          )}

          {currentChat.messages
            .length >= 3 && (
            <OutfitCarousel
              onItemPress={
                handleItemPress
              }
            />
          )}

          <View
            style={{height: 20}}
          />
        </ScrollView>

        {/* Bottom Section */}
        <RecommendBottomSection
          useMyCloset={
            useMyCloset
          }
          setUseMyCloset={
            setUseMyCloset
          }
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
            onSend={text => {
              handleSend(text);

              setInputText('');
            }}
          />
        </RecommendBottomSection>

        {/* Item Detail Modal */}
        <ItemDetailModal
          visible={modalVisible}
          item={selectedItem}
          onClose={() =>
            setModalVisible(
              false,
            )
          }
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