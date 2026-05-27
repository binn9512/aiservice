import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  wrapper: {
    paddingHorizontal: 10,

    marginBottom: 10,
  },

  userWrapper: {
    alignItems: 'flex-end',
  },

  aiWrapper: {
    alignItems: 'flex-start',
  },

  bubble: {
    maxWidth: '80%',

    borderRadius: 20,

    paddingVertical: 10,
    paddingHorizontal: 14,
  },

  userBubble: {
    backgroundColor: '#FFE3EE',
  },

  aiBubble: {
    backgroundColor: '#F2F0F1',
  },

  text: {
    fontSize: 14,

    lineHeight: 20,

    color: '#111111',
  },
});