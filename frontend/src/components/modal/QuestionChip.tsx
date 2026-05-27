import React from 'react';

import {
  TouchableOpacity,
  Text,
} from 'react-native';

import styles from './itemDetail.styles';

type Props = {
  text: string;

  onPress?: () => void;
};

const QuestionChip = ({
  text,
  onPress,
}: Props) => {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      style={styles.questionChip}
      onPress={onPress}>
      <Text
        style={
          styles.questionIcon
        }>
        ✨
      </Text>

      <Text
        numberOfLines={2}
        style={
          styles.questionText
        }>
        {text}
      </Text>
    </TouchableOpacity>
  );
};

export default QuestionChip;