import { Dimensions, StyleSheet } from 'react-native';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.9;

export default StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    backgroundColor: '#FFF3F7',
    borderRadius: 20,
    padding: 16,
  },

  dateLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FF5C8A',
    marginBottom: 10,
  },

  eventRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 8,
  },

  eventIcon: {
    fontSize: 16,
    marginRight: 10,
    marginTop: 1,
  },

  eventTextWrap: {
    flex: 1,
  },

  eventTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111111',
  },

  eventMeta: {
    fontSize: 11,
    color: '#666666',
    marginTop: 3,
  },

  transitionWrap: {
    marginTop: 4,
    marginBottom: 8,
  },

  transitionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#111111',
    marginBottom: 6,
  },

  transitionStep: {
    fontSize: 12,
    color: '#444444',
    lineHeight: 18,
  },

  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
  },
});
