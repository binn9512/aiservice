import React from 'react';

import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';

import {
  ChatRoom,
} from '../../types/chat';

import Ionicons from
  'react-native-vector-icons/Ionicons';

import styles from '../../styles/recommend.styles';

type Props = {
  visible: boolean;

  currentChatId: number;

  chatRooms: ChatRoom[];

  onClose: () => void;

  onNewChat: () => void;

  onSelectChat: (
    chatId: number,
  ) => void;

  onDeleteChat: (
    chatId: number,
  ) => void;

  onOpenMenu: (
    chatId: number,
  ) => void;

  menuChatId: number | null;

  setMenuChatId: (
    id: number | null,
  ) => void;

  onRenameChat: (
    chatId: number,
    title: string,
  ) => void;

  onPinChat: (
    chatId: number,
  ) => void;

  selectedChatId: number | null;
};

const ChatListModal = ({
  visible,
  currentChatId,
  chatRooms,
  onClose,
  onNewChat,
  onSelectChat,
  onDeleteChat,
  onOpenMenu,
  menuChatId,
  setMenuChatId,
  onRenameChat,
  onPinChat,
  selectedChatId,
}: Props) => {
  const selectedRoom =
  chatRooms.find(
    room => room.id === selectedChatId,
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide">

      <TouchableOpacity
        activeOpacity={1}
        style={styles.modalOverlay}
        onPress={onClose}>

        {/* Bottom Sheet */}
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => {}}
          style={styles.menuModal}>

          {/* Handle Bar */}
          <View style={styles.handleBar} />

          {/* New Chat */}
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.newChatButton}
            onPress={onNewChat}>

            <Text
              style={
                styles.newChatText
              }>
              + 새 채팅
            </Text>

          </TouchableOpacity>

          {/* Chat List */}
          <ScrollView
            showsVerticalScrollIndicator={
              false
            }>

            {chatRooms.map(room => {
              const isActive =
                room.id ===
                currentChatId;

              const isMenuOpen =
                menuChatId === room.id;

              return (
                <View
                  key={room.id}
                  style={[
                    styles.chatRoomItem,

                    isActive &&
                      styles.activeChatRoom,
                  ]}>

                  <TouchableOpacity
                    activeOpacity={0.8}
                    style={
                      styles.chatRoomLeft
                    }
                    onPress={() =>
                      onSelectChat(
                        room.id,
                      )
                    }>

                    <View style={styles.chatTitleRow}>
                      <Text
                        numberOfLines={1}
                        style={[
                          styles.chatRoomText,

                          isActive &&
                            styles.activeChatRoomText,
                        ]}>
                        {room.title}
                      </Text>

                      {room.pinned && (
                        <Ionicons
                          name="bookmark"
                          size={14}
                          color="#FF5C8A"
                          style={styles.pinIcon}
                        />
                      )}
                    </View>

                  </TouchableOpacity>

                  <TouchableOpacity
                    activeOpacity={0.8}
                    style={
                      styles.moreButton
                    }
                    onPress={() =>
                      setMenuChatId(
                        isMenuOpen
                          ? null
                          : room.id,
                      )
                    }>

                    <Text
                      style={
                        styles.moreText
                      }>
                      ⋯
                    </Text>

                  </TouchableOpacity>

                </View>
              );
            })}

          </ScrollView>

          {/* Close */}
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.closeButton}
            onPress={onClose}>

            <Text
              style={
                styles.closeButtonText
              }>
              닫기
            </Text>

          </TouchableOpacity>

        </TouchableOpacity>

      </TouchableOpacity>

      {/* Action Sheet */}
      {menuChatId !== null && (
        <TouchableOpacity
          activeOpacity={1}
          style={
            styles.actionOverlay
          }
          onPress={() =>
            setMenuChatId(null)
          }>

          <TouchableOpacity
            activeOpacity={1}
            onPress={() => {}}
            style={
              styles.actionSheet
            }>

            <TouchableOpacity
              style={
                styles.actionItem
              }
              onPress={() => {
                if (selectedChatId !== null) {
                  onPinChat(selectedChatId);
                }
              }}>

              <Text
                style={
                  styles.actionText
                }>
                {selectedRoom?.pinned
                  ? '고정 해제'
                  : '고정'}
              </Text>

            </TouchableOpacity>

            <TouchableOpacity
              style={
                styles.actionItem
              }
              onPress={() => {
                Alert.prompt(
                  '채팅 이름 변경',
                  '새 이름을 입력해주세요',
                  [
                    {
                      text: '취소',
                      style: 'cancel',
                    },

                    {
                      text: '확인',

                      onPress: (text?: string) => {
                        if (!text) {
                          return;                        }

                        onRenameChat(
                          menuChatId,
                          text,
                        );

                        setMenuChatId(
                          null,
                        );
                      },
                    },
                  ],
                  'plain-text',
                );
              }}>

              <Text
                style={
                  styles.actionText
                }>
                이름 변경
              </Text>

            </TouchableOpacity>

            <TouchableOpacity
              style={
                styles.actionItem
              }
              onPress={() => {
                onDeleteChat(
                  menuChatId,
                );

                setMenuChatId(
                  null,
                );
              }}>

              <Text
                style={
                  styles.deleteActionText
                }>
                삭제
              </Text>

            </TouchableOpacity>

          </TouchableOpacity>

        </TouchableOpacity>
      )}

    </Modal>
  );
};

export default ChatListModal;