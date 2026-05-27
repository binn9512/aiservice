import React, {
  ReactNode,
} from 'react';

import {
  View,
} from 'react-native';

import ClosetToggle from './ClosetToggle';
import QuickPromptSection from './QuickPromptSection';

import styles from '../../styles/recommend.styles';

type Props = {
  useMyCloset: boolean;

  setUseMyCloset: (
    value: boolean,
  ) => void;

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
  useMyCloset,
  setUseMyCloset,
  showOptions,
  setShowOptions,
  quickPrompts,
  onQuickPromptPress,
  children,
}: Props) => {
  const handleToggleCloset =
    () => {
      setUseMyCloset(
        !useMyCloset,
      );
    };

  const handleToggleOptions =
    () => {
      setShowOptions(
        !showOptions,
      );
    };

  return (
    <View style={styles.bottomSection}>
      <ClosetToggle
        value={useMyCloset}
        onToggle={
          handleToggleCloset
        }
      />

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