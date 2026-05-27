import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  header: {
    paddingTop: 12,
    paddingBottom: 12,

    paddingHorizontal: 20,
  },

  headerTop: {
    flexDirection: 'row',

    justifyContent:
      'space-between',

    alignItems: 'center',
  },

  headerTitle: {
    fontSize: 24,

    fontWeight: '700',

    color: '#111111',
  },

  headerSubtitle: {
    fontSize: 13,

    color: '#666666',

    marginTop: 6,
  },

  menuButton: {
    fontSize: 24,

    fontWeight: '600',

    color: '#111111',
  },

  content: {
  flexGrow: 1,

  paddingHorizontal: 16,
  paddingTop: 12,
  paddingBottom: 20,
},

  bottomSection: {
    backgroundColor: '#FFFFFF',

    paddingTop: 10,
  },

  closetToggleWrapper: {
    paddingHorizontal: 16,

    paddingBottom: 10,
  },

  toggleButton: {
    flexDirection: 'row',

    alignItems: 'center',
  },

  toggleCircle: {
    width: 18,
    height: 18,

    borderRadius: 999,

    borderWidth: 2,

    borderColor: '#FF5C8A',

    marginRight: 8,
  },

  toggleCircleActive: {
    backgroundColor: '#FF5C8A',
  },

  toggleText: {
    fontSize: 13,

    fontWeight: '500',

    color: '#111111',
  },

  optionToggle: {
    flexDirection: 'row',

    alignItems: 'center',

    justifyContent:
      'space-between',

    backgroundColor: '#F8F8F8',

    borderRadius: 14,

    marginHorizontal: 16,
    marginBottom: 10,

    paddingVertical: 12,
    paddingHorizontal: 14,
  },

  optionToggleText: {
    fontSize: 15,

    fontWeight: '600',

    color: '#111111',
  },

  optionArrow: {
    fontSize: 18,

    color: '#666666',
  },

  optionContent: {
    backgroundColor: '#F8F8F8',

    borderRadius: 20,

    marginHorizontal: 16,
    marginBottom: 10,

    paddingTop: 4,
    paddingBottom: 4,
  },

  quickHeader: {
    flexDirection: 'row',

    justifyContent:
      'space-between',

    alignItems: 'center',

    marginTop: 8,

    paddingHorizontal: 10,

    marginBottom: 10,
  },

  quickTitle: {
    fontSize: 14,

    fontWeight: '600',

    color: '#111111',
  },

  editText: {
    fontSize: 14,

    fontWeight: '600',

    color: '#FF5C8A',
  },

  quickPromptContainer: {
    flexDirection: 'row',

    flexWrap: 'wrap',

    paddingHorizontal: 16,
  },

  quickItemWrap: {
    position: 'relative',

    marginRight: 8,
    marginBottom: 8,
  },

  quickPromptButton: {
  backgroundColor: '#FFFFFF',

  borderWidth: 1,

  borderColor: '#F0DCE5',

  borderRadius: 999,

  height: 30,

  paddingHorizontal: 15,

  justifyContent: 'center',

  alignItems: 'center',
},

  quickPromptText: {
    fontSize: 12,

    fontWeight: '500',

    color: '#111111',
  },

  deleteButton: {
    position: 'absolute',

    top: -6,
    right: -6,

    width: 18,
    height: 18,

    borderRadius: 999,

    backgroundColor: '#FF5C8A',

    justifyContent: 'center',

    alignItems: 'center',

    zIndex: 10,
  },

  deleteText: {
    color: '#FFFFFF',

    fontSize: 10,

    fontWeight: '700',
  },

  addChip: {
    height: 34,

    paddingHorizontal: 14,

    borderRadius: 999,

    borderWidth: 1,

    borderColor: '#FF5C8A',

    justifyContent: 'center',

    alignItems: 'center',

    marginBottom: 8,
  },

  addChipText: {
    color: '#FF5C8A',

    fontSize: 12,

    fontWeight: '600',
  },

  modalOverlay: {
  flex: 1,

  backgroundColor:
    'rgba(0,0,0,0.25)',

  justifyContent: 'flex-end',
},

  menuModal: {
  backgroundColor: '#FFFFFF',

  borderTopLeftRadius: 24,
  borderTopRightRadius: 24,

  padding: 20,
  paddingBottom: 34,

  width: '100%',

  marginTop: 'auto',
},

  newChatButton: {
    alignItems: 'center',

    backgroundColor: '#FF5C8A',

    borderRadius: 14,

    paddingVertical: 14,

    marginBottom: 20,
  },

  newChatText: {
    fontSize: 15,

    fontWeight: '700',

    color: '#FFFFFF',
  },

  chatTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  pinIcon: {
    marginLeft: 6,
  },

  chatRoomItem: {
    flexDirection: 'row',

    alignItems: 'center',

    justifyContent:
      'space-between',

    backgroundColor: '#F2F0F1',

    borderRadius: 14,

    paddingVertical: 14,
    paddingHorizontal: 16,

    marginBottom: 12,

    overflow: 'visible',

    position: 'relative',
  },

  activeChatRoom: {
    borderWidth: 1.5,

    borderColor: '#FF5C8A',
  },

  chatRoomLeft: {
    flex: 1,

    marginRight: 12,
  },

  chatRoomText: {
    fontSize: 14,

    fontWeight: '500',

    color: '#111111',
  },

  activeChatRoomText: {
    color: '#FF5C8A',

    fontWeight: '700',
  },

  closeButton: {
    alignItems: 'center',

    marginTop: 10,
  },

  closeButtonText: {
    fontSize: 14,

    fontWeight: '600',

    color: '#999999',
  },

  handleBar: {
    width: 40,
    height: 5,
    borderRadius: 999,
    backgroundColor: '#D1D1D6',
    alignSelf: 'center',
    marginTop: 8,
    marginBottom: 14,
  },

  moreButton: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },

  moreText: {
    fontSize: 24,
    color: '#999999',
    lineHeight: 24,
  },

  actionOverlay: {
    position: 'absolute',

    top: 0,
    left: 0,
    right: 0,
    bottom: 0,

    backgroundColor:
      'rgba(0,0,0,0.25)',

    justifyContent: 'flex-end',
  },

  actionSheet: {
    backgroundColor: '#FFFFFF',

    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,

    paddingTop: 12,
    paddingBottom: 34,
    paddingHorizontal: 22,
  },

  actionItem: {
    height: 56,

    justifyContent: 'center',

    borderBottomWidth: 1,
    borderBottomColor: '#F2F0F1',
  },

  actionText: {
    fontSize: 16,
    color: '#111111',
  },

  deleteActionText: {
    fontSize: 16,
    color: '#FF5C8A',
    fontWeight: '600',
  },

promptOverlay: {
  flex: 1,

  backgroundColor:
    'rgba(0,0,0,0.25)',

  justifyContent: 'center',

  alignItems: 'center',
},

promptModal: {
  width: '88%',

  backgroundColor: '#FFFFFF',

  borderRadius: 28,

  paddingHorizontal: 22,

  paddingTop: 24,

  paddingBottom: 20,
},

promptTitle: {
  fontSize: 17,

  fontWeight: '700',

  color: '#111111',

  marginBottom: 16,
},

promptInput: {
  height: 46,

  borderWidth: 1,

  borderColor: '#EAEAEA',

  borderRadius: 14,

  paddingHorizontal: 14,

  fontSize: 14,

  color: '#111111',
},

promptButtonRow: {
  flexDirection: 'row',

  justifyContent: 'flex-end',

  marginTop: 18,
},

cancelButton: {
  marginRight: 10,

  paddingHorizontal: 16,

  height: 40,

  justifyContent: 'center',
},

cancelButtonText: {
  fontSize: 14,

  color: '#666666',
},

addButton: {
  backgroundColor: '#FF5C8A',

  borderRadius: 12,

  paddingHorizontal: 18,

  height: 40,

  justifyContent: 'center',
},

addButtonText: {
  fontSize: 14,

  fontWeight: '600',

  color: '#FFFFFF',
},

});

export default styles;