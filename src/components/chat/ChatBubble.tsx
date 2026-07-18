import React from 'react';

import {
  View,
  Text,
} from 'react-native';

import {
  Role,
} from '../../types/chat';

import styles from './ChatBubble.styles';

type Props = {
  role: Role;

  text: string;
};

const ChatBubble = ({
  role,
  text,
}: Props) => {
  const isUser =
    role === 'user';

  return (
    <View
      style={[
        styles.wrapper,

        isUser
          ? styles.userWrapper
          : styles.aiWrapper,
      ]}>
      <View
        style={[
          styles.bubble,

          isUser
            ? styles.userBubble
            : styles.aiBubble,
        ]}>
        <Text style={styles.text}>
          {text}
        </Text>
      </View>
    </View>
  );
};

export default ChatBubble;