import {
  StyleSheet,
  Dimensions,
} from 'react-native';

const { width } = Dimensions.get(
  'window',
);

const CARD_WIDTH = width * 0.9;

export default StyleSheet.create({
  card: {
    width: CARD_WIDTH,

    aspectRatio: 1.1,

    flexDirection: 'row',

    backgroundColor: '#FFF3F7',

    borderRadius: 20,

    padding: 16,

    marginHorizontal: 4,
  },

  modelContainer: {
    width: '42%',

    height: '100%',

    backgroundColor: '#ffffff',

    borderRadius: 16,

    justifyContent: 'center',

    alignItems: 'center',
  },

  modelImage: {
    width: '100%',

    height: '95%',
  },

  itemSection: {
    flex: 1,

    marginLeft:15,

    height: '100%',

    justifyContent: 'space-between',
  },

  itemButton: {
    flex: 1,

    backgroundColor: '#ffffff',

    borderRadius: 12,

    paddingHorizontal: 18,

    marginBottom: 8,

    flexDirection: 'row',

    alignItems: 'center',
  },

  itemName: {
    fontSize: 13,

    fontWeight: '600',

    color: '#111111',

    marginTop: 1,
  },

  typeText: {
    fontSize: 11,

    color: '#666666',

    marginTop: 4,
  },

  tagContainer: {
    flexDirection: 'row',

    marginTop: 5,
  },

  tag: {
    backgroundColor: '#FFE3EE',

    borderRadius: 999,

    paddingHorizontal: 8,
    paddingVertical: 4,

    marginRight: 6,
  },

  tagText: {
    fontSize: 10,

    fontWeight: '500',

    color: '#FF5C8A',
  },
});