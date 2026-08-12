import React from 'react';
import { View } from 'react-native';
import QuickPromptSection from './QuickPromptSection';
import styles from '../../styles/recommend.styles';

type Props = {
  showOptions: boolean;
  setShowOptions: (show: boolean | ((prev: boolean) => boolean)) => void;
  quickPrompts?: any[];
  onQuickPromptPress: (prompt: string) => void;
  children?: React.ReactNode;
};

const RecommendBottomSection = ({
  showOptions,
  setShowOptions,
  onQuickPromptPress,
  children,
}: Props) => {
  return (
    <View style={styles.bottomSection}>
      {/* 1. 룩 프롬프트 영역 */}
      <QuickPromptSection
        showOptions={showOptions}
        onToggle={() => setShowOptions((prev) => !prev)}
        onPromptPress={onQuickPromptPress}
      />

      {/* 2. 하단 채팅 입력창 (ChatInput) */}
      {children}
    </View>
  );
};

export default RecommendBottomSection;