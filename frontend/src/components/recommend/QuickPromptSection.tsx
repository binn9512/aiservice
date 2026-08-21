import React, {useState} from 'react';

import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  TextInput,
} from 'react-native';

import styles from '../../styles/recommend.styles';

import quickPromptData from '../../data/quickPrompts';

type PromptItem = {
  id: string;

  title: string;

  prompt: string;
};

type Props = {
  showOptions: boolean;

  onToggle: () => void;

  onPromptPress: (
    prompt: string,
  ) => void;
};

const QuickPromptSection = ({
  showOptions,
  onToggle,
  onPromptPress,
}: Props) => {
  const [prompts, setPrompts] =
    useState<PromptItem[]>(
      quickPromptData,
    );

  const [isEditMode, setIsEditMode] =
    useState(false);

  const [inputVisible, setInputVisible] =
    useState(false);

  const [newPrompt, setNewPrompt] =
    useState('');

  return (
    <>
      <View style={styles.optionContent}>
        {/* Header */}
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.quickHeader}
          onPress={onToggle}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
            }}>
            <Text
              style={
                styles.optionToggleText
              }>
              🪽 추천 룩
            </Text>
          </View>

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
            }}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() =>
                setIsEditMode(
                  !isEditMode,
                )
              }>
              <Text
                style={
                  styles.editText
                }>
                {isEditMode
                  ? '완료'
                  : '편집'}
              </Text>
            </TouchableOpacity>

            <Text
              style={[
                styles.optionArrow,
                {
                  marginLeft: 10,
                },
              ]}>
              {showOptions
                ? '▴'
                : '▾'}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Chips */}
        {showOptions && (
          <View
            style={
              styles.quickPromptContainer
            }>
            {prompts.map(item => (
              <View
                key={item.id}
                style={
                  styles.quickItemWrap
                }>
                <TouchableOpacity
                  activeOpacity={0.8}
                  style={
                    styles.quickPromptButton
                  }
                  onPress={() => {
                    if (
                      !isEditMode
                    ) {
                      onPromptPress(
                        item.prompt,
                      );
                    }
                  }}>
                  <Text
                    numberOfLines={1}
                    style={
                      styles.quickPromptText
                    }>
                    {item.title}
                  </Text>
                </TouchableOpacity>

                {isEditMode && (
                  <TouchableOpacity
                    style={
                      styles.deleteButton
                    }
                    onPress={() => {
                      setPrompts(
                        prev =>
                          prev.filter(
                            prompt =>
                              prompt.id !==
                              item.id,
                          ),
                      );
                    }}>
                    <Text
                      style={
                        styles.deleteText
                      }>
                      ✕
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}

            {isEditMode && (
              <TouchableOpacity
                activeOpacity={0.8}
                style={styles.addChip}
                onPress={() =>
                  setInputVisible(true)
                }>
                <Text
                  style={
                    styles.addChipText
                  }>
                  + 추가
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>

      {/* Add Prompt Modal */}
      <Modal
        visible={inputVisible}
        transparent
        animationType="fade">
        <View
          style={styles.promptOverlay}>
          <View
            style={
              styles.promptModal
            }>
            <Text
              style={
                styles.promptTitle
              }>
              추천 룩 추가
            </Text>

            <TextInput
              value={newPrompt}
              onChangeText={
                setNewPrompt
              }
              placeholder="추가할 스타일 입력"
              placeholderTextColor="#999"
              style={
                styles.promptInput
              }
            />

            <View
              style={
                styles.promptButtonRow
              }>
              <TouchableOpacity
                style={
                  styles.cancelButton
                }
                onPress={() => {
                  setInputVisible(
                    false,
                  );

                  setNewPrompt('');
                }}>
                <Text
                  style={
                    styles.cancelButtonText
                  }>
                  취소
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={
                  styles.addButton
                }
                onPress={() => {
                  if (
                    newPrompt.trim()
                  ) {
                    setPrompts(
                      prev => [
                        ...prev,
                        {
                          id: Date.now().toString(),

                          title:
                            newPrompt,

                          prompt: `${newPrompt} 추천해줘`,
                        },
                      ],
                    );

                    setNewPrompt(
                      '',
                    );

                    setInputVisible(
                      false,
                    );
                  }
                }}>
                <Text
                  style={
                    styles.addButtonText
                  }>
                  추가
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

export default QuickPromptSection;