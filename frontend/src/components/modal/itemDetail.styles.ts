import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  overlay: {
    flex: 1,

    justifyContent: 'flex-end',

    backgroundColor:
      'rgba(0,0,0,0.4)',
  },

  container: {
    backgroundColor: '#FFFFFF',

    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,

    paddingTop: 12,
    paddingHorizontal: 16,

    maxHeight: '78%',
  },

  handleBar: {
    width: 48,
    height: 5,

    alignSelf: 'center',

    borderRadius: 999,

    backgroundColor: '#DDDDDD',

    marginBottom: 16,
  },

  header: {
    flexDirection: 'row',

    justifyContent:
      'space-between',

    alignItems: 'center',

    marginBottom: 20,
  },

  headerTitle: {
    fontSize: 18,

    fontWeight: '700',

    color: '#111111',
  },

  closeText: {
    fontSize: 22,

    color: '#111111',

    width: 28,

    textAlign: 'center',
  },

  mainSection: {
    flexDirection: 'row',

    marginBottom: 32,
  },

  itemImage: {
    width: 120,
    height: 160,

    borderRadius: 16,

    backgroundColor: '#F2F0F1',
  },

  infoSection: {
    flex: 1,

    justifyContent: 'center',

    marginLeft: 16,
  },

  itemName: {
    fontSize: 18,

    fontWeight: '700',

    color: '#111111',
  },

  itemType: {
    fontSize: 13,

    color: '#666666',

    marginTop: 6,
  },

  tagContainer: {
    flexDirection: 'row',

    flexWrap: 'wrap',

    marginTop: 12,
  },

  tag: {
    backgroundColor: '#FFE3EE',

    borderRadius: 999,

    paddingHorizontal: 10,
    paddingVertical: 6,

    marginRight: 8,
    marginBottom: 8,
  },

  tagText: {
    fontSize: 11,

    fontWeight: '500',

    color: '#FF5C8A',
  },

  section: {
    marginBottom: 32,
  },

  sectionHeader: {
    flexDirection: 'row',

    justifyContent:
      'space-between',

    alignItems: 'center',

    marginBottom: 16,
  },

  sectionTitle: {
    fontSize: 16,

    fontWeight: '600',

    color: '#111111',
  },

  similarCard: {
    width: 100,

    alignItems: 'center',

    marginRight: 16,
  },

  similarImage: {
    width: 100,
    height: 120,

    borderRadius: 14,

    backgroundColor: '#F2F0F1',
  },

  similarName: {
    fontSize: 11,

    color: '#111111',

    textAlign: 'center',

    marginTop: 6,
  },

  infoRow: {
    flexDirection: 'row',

    justifyContent:
      'space-between',

    alignItems: 'center',

    paddingVertical: 14,

    borderBottomWidth: 1,

    borderBottomColor:
      '#F2F0F1',
  },

  infoLabel: {
    fontSize: 14,

    fontWeight: '500',

    color: '#666666',
  },

  infoValue: {
    fontSize: 14,

    fontWeight: '600',

    color: '#111111',
  },

  questionTitle: {
    fontSize: 16,

    fontWeight: '600',

    color: '#111111',

    marginBottom: 16,
  },

  questionChip: {
    flexDirection: 'row',

    alignItems: 'center',

    backgroundColor:
      '#FFF4F8',

    borderRadius: 999,

    paddingVertical: 12,
    paddingHorizontal: 12,

    marginBottom: 10,

    borderWidth: 1,

    borderColor: '#FFE3EE',
  },

  questionIcon: {
    fontSize: 13,

    marginRight: 6,
  },

  questionText: {
    fontSize: 13,

    fontWeight: '600',

    color: '#FF5C8A',
  },

  closeButton: {
    height: 52,

    justifyContent: 'center',
    alignItems: 'center',

    backgroundColor: '#FF5C8A',

    borderRadius: 14,

    marginTop: 4,
    marginBottom: 24,
  },

  closeButtonText: {
    fontSize: 16,

    fontWeight: '700',

    color: '#FFFFFF',
  },
});