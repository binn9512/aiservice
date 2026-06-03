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

    flexDirection: 'row',

    backgroundColor: '#FFFFFF',

    borderRadius: 20,

    padding: 12,

    marginRight: 12,

    shadowColor: '#000',

    shadowOffset: {
      width: 0,
      height: 4,
    },

    shadowOpacity: 0.08,

    shadowRadius: 10,

    elevation: 4,
  },

    modelImage: {
      width: '45%',

      height: 280,

      borderRadius: 16,

      backgroundColor: '#F2F0F1',
    },


  itemSection: {
    flex: 1,
    maxWidth: 170,

    justifyContent: 'center',

    marginLeft: 12,
  },

  itemButton: {
    backgroundColor: '#F2F0F1',

    borderRadius: 12,

    paddingVertical: 12,
    paddingHorizontal: 10,

    marginBottom: 10,
  },

  itemName: {
    fontSize: 13,

    fontWeight: '600',

    color: '#111111',
  },

  typeText: {
    fontSize: 11,

    color: '#666666',

    marginTop: 4,
  },

  tagContainer: {
    flexDirection: 'row',

    flexWrap: 'wrap',

    marginTop: 8,
  },

  tag: {
    backgroundColor: '#FFE3EE',

    borderRadius: 999,

    paddingHorizontal: 8,
    paddingVertical: 4,

    marginRight: 6,
    marginBottom: 6,
  },

  tagText: {
    fontSize: 10,

    fontWeight: '500',

    color: '#FF5C8A',
  },
});