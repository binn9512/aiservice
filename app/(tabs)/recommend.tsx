import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  View,
} from 'react-native';

// 1️⃣ expo-router에서 useFocusEffect 불러오기
import { useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

import ChatBubble from '../../src/components/chat/ChatBubble';
import ChatInput from '../../src/components/chat/ChatInput';
import OutfitCarousel from '../../src/components/outfit/OutfitCarousel';
import ScheduleCard from '../../src/components/chat/ScheduleCard';
import ItemDetailModal from '../../src/components/modal/ItemDetailModal';
import ChatListModal from '../../src/components/modal/ChatListModal';
import RecommendHeader from '../../src/components/recommend/RecommendHeader';
import RecommendBottomSection from '../../src/components/recommend/RecommendBottomSection';
import useRecommendChat from '../../src/hooks/useRecommendChat';
import quickPrompts from '../../src/data/quickPrompts';
import styles from '../../src/styles/recommend.styles';
import { OutfitItem } from '../../src/types/outfit';

const RecommendScreen = () => {
  // 2️⃣ 기존에 선언만 해두고 사용하지 않던 route, navigation 변수 삭제 (코드 최적화)

  const scrollRef = useRef<ScrollView>(null);
  const [selectedItem, setSelectedItem] = useState<OutfitItem | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [menuChatId, setMenuChatId] = useState<number | null>(null);
  const [inputText, setInputText] = useState('');

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

  const handleItemPress = (item: OutfitItem) => {
    setSelectedItem(item);
    setModalVisible(true);
  };

  useFocusEffect(
    useCallback(() => {
      const loadPrompt = async () => {
        const prompt = await AsyncStorage.getItem('PENDING_PROMPT');
        if (!prompt) {
          return;
        }
        await AsyncStorage.removeItem('PENDING_PROMPT');
        await handleSend(prompt);
      };
      loadPrompt();
    }, []),
  );

  const handlePinChat = (roomId: number) => {
    setChatRooms(prev => {
      const updated = prev.map(room =>
        room.id === roomId ? { ...room, pinned: !room.pinned } : room,
      );

      const sortedRooms = [...updated].sort((a, b) => {
        if (a.pinned === b.pinned) {
          return 0;
        }
        return a.pinned ? -1 : 1;
      });

      return sortedRooms;
    });
    setMenuChatId(null);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={-38}>
        
        {/* Header */}
        <RecommendHeader onPressMenu={() => setMenuVisible(true)} />

        {/* Chat Area */}
        <ScrollView
          ref={scrollRef}
          style={{ flex: 1 }}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() =>
            scrollRef.current?.scrollToEnd({ animated: true })
          }>
          {currentChat.messages.map(item => {
            if (item.type === 'message') {
              return (
                <View key={item.id} style={{ marginBottom: 0 }}>
                  <ChatBubble role={item.role} text={item.text} />
                </View>
              );
            }
            if (item.type === 'schedule') {
              return (
                <View key={item.id} style={{ marginBottom: 16, paddingHorizontal: 10 }}>
                  <ScheduleCard
                    dateLabel={item.dateLabel}
                    events={item.events}
                    clarifyingQuestion={item.clarifyingQuestion}
                    suggestedActions={item.suggestedActions}
                    transitionPlan={item.transitionPlan}
                    onActionPress={handleSend}
                  />
                </View>
              );
            }
            return (
              <View key={item.id} style={{ marginBottom: 16 }}>
                <OutfitCarousel
                  recommendedOutfits={item.outfits}
                  onItemPress={handleItemPress}
                />
              </View>
            );
          })}

          {loading && (
            <ChatBubble role="ai" text="코디를 추천하는 중이에요..." />
          )}

          <View style={{ height: 20 }} />
        </ScrollView>

        {/* Bottom Section */}
        <RecommendBottomSection
          showOptions={showOptions}
          setShowOptions={setShowOptions}
          quickPrompts={quickPrompts}
          onQuickPromptPress={handleSend}>
          <ChatInput
            value={inputText}
            onChangeText={setInputText}
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
          onRecommendQuestion={async prompt => {
            setModalVisible(false);
            await handleSend(prompt);
          }}
        />

        {/* Chat List Modal */}
        <ChatListModal
          visible={menuVisible}
          currentChatId={currentChat.id}
          chatRooms={chatRooms}
          onClose={() => setMenuVisible(false)}
          onNewChat={handleNewChat}
          onSelectChat={handleSelectChat}
          onDeleteChat={handleDeleteChat}
          onOpenMenu={setMenuChatId}
          menuChatId={menuChatId}
          setMenuChatId={setMenuChatId}
          onRenameChat={handleRenameChat}
          onPinChat={handlePinChat}
          selectedChatId={menuChatId}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default RecommendScreen;