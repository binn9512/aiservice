import React, {
  useState,
} from 'react';

import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Text,
} from 'react-native';

type Props = {
  value: string;

  onChangeText: (
    text: string,
  ) => void;

  onSend: (
    text: string,
  ) => void;
};

const ChatInput = ({
  value,
  onChangeText,
  onSend,
}: Props) => {

  const isDisabled =
    !value.trim();

  return (
    <View style={styles.wrapper}>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder="원하는 코디를 입력해보세요"
        placeholderTextColor="#999999"
        style={styles.input}
        multiline={false}
        returnKeyType="send"
        autoCorrect={false}
        autoCapitalize="none"
        onSubmitEditing={() =>
          onSend(value)
        }
      />

      <TouchableOpacity
        activeOpacity={0.8}
        disabled={isDisabled}
        style={[
          styles.sendButton,

          isDisabled &&
            styles.disabledButton,
        ]}
        onPress={() =>
          onSend(value)
        }
        >
        <Text
          style={styles.sendIcon}>
          ↑
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default ChatInput;

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',

    alignItems: 'center',

    backgroundColor: '#FFFFFF',

    borderTopWidth: 1,

    borderTopColor: '#EAEAEA',

    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 52,
  },

  input: {
    flex: 1,

    height: 44,

    fontSize: 14,

    color: '#111111',

    backgroundColor: '#F2F0F1',

    borderRadius: 22,

    paddingHorizontal: 16,
  },

  sendButton: {
    width: 44,
    height: 44,

    justifyContent: 'center',
    alignItems: 'center',

    backgroundColor: '#FF5C8A',

    borderRadius: 22,

    marginLeft: 10,
  },

  disabledButton: {
    opacity: 0.5,
  },

  sendIcon: {
    fontSize: 20,

    fontWeight: '700',

    color: '#FFFFFF',

    marginTop: -2,
  },
});