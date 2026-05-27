import React, {
  ReactNode,
} from 'react';

import {
  View,
} from 'react-native';

import QuickPromptSection from './QuickPromptSection';

import styles from '../../styles/recommend.styles';

type Props = {
  showOptions: boolean;

  setShowOptions: (
    value: boolean,
  ) => void;

  quickPrompts: {
    id: string;

    title: string;

    prompt: string;
  }[];

  onQuickPromptPress: (
    text: string,
  ) => void;

  children: ReactNode;
};

const RecommendBottomSection = ({
  showOptions,
  setShowOptions,
  quickPrompts,
  onQuickPromptPress,
  children,
}: Props) => {
  const handleToggleOptions =
    () => {
      setShowOptions(
        !showOptions,
      );
    };

  return (
    <View style={styles.bottomSection}>
      <QuickPromptSection
        showOptions={showOptions}
        onToggle={
          handleToggleOptions
        }
        onPromptPress={
          onQuickPromptPress
        }
      />

      {children}
    </View>
  );
};

export default RecommendBottomSection;