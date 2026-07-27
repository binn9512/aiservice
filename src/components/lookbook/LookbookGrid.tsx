import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Modal,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

import LookbookCard from './LookbookCard';

import { useRouter } from 'expo-router';

const initialLookbooks = [
  {
    id: 'add',
    type: 'add',
  },
  {
    id: '1',
    title: '데이트룩',
    count: 16,
    images: [
      'https://picsum.photos/200?1',
      'https://picsum.photos/200?2',
      'https://picsum.photos/200?3',
      'https://picsum.photos/200?4',
    ],
  },
  {
    id: '2',
    title: '출근룩',
    count: 12,
    images: [
      'https://picsum.photos/200?5',
      'https://picsum.photos/200?6',
      'https://picsum.photos/200?7',
      'https://picsum.photos/200?8',
    ],
  },
  {
    id: '3',
    title: '캐주얼',
    count: 9,
    images: [
      'https://picsum.photos/200?9',
      'https://picsum.photos/200?10',
      'https://picsum.photos/200?11',
      'https://picsum.photos/200?12',
    ],
  },
];

export default function LookbookGrid() {
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(false);
  const [lookbookName, setLookbookName] = useState('');
  const [lookbooks, setLookbooks] = useState(initialLookbooks);

  return (
    <View style={styles.container}>
      <FlatList
        data={lookbooks}
        keyExtractor={item => item.id}
        numColumns={2}
        scrollEnabled={false}
        renderItem={({ item }) => (
          <LookbookCard
            item={item}
            onPress={() => {
              if (item.type === 'add') {
                setModalVisible(true);
              } else {
                router.push('/lookbook-detail');
              }
            }}
          />
        )}
        columnWrapperStyle={styles.row}
        contentContainerStyle={{ paddingBottom: 120 }}
      />

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <Pressable
            style={styles.modalOverlay}
            onPress={() => setModalVisible(false)}
          >
            <Pressable onPress={() => {}} style={styles.modalBox}>
            <View style={styles.handle} />

            <Text style={styles.modalTitle}>새 룩북 만들기</Text>

            <Text style={styles.label}>룩북 이름</Text>

            <TextInput
              placeholder="예) 데이트룩"
              placeholderTextColor="#A8A8A8"
              value={lookbookName}
              onChangeText={setLookbookName}
              style={styles.input}
            />

            <View style={styles.buttonRow}>
              <Pressable
                style={styles.cancelButton}
                onPress={() => {
                  setLookbookName('');
                  setModalVisible(false);
                }}
              >
                <Text style={styles.cancelText}>취소</Text>
              </Pressable>

              <Pressable
                style={styles.createButton}
                onPress={() => {
                  if (!lookbookName.trim()) return;

                  const newLookbook = {
                    id: Date.now().toString(),
                    title: lookbookName,
                    count: 0,
                    images: [],
                  };

                  setLookbooks(prev => [
                    prev[0],          // + 카드 유지
                    newLookbook,      // 새 룩북
                    ...prev.slice(1), // 기존 룩북
                  ]);

                  setLookbookName('');
                  setModalVisible(false);
                }}
              >
                <Text style={styles.createButtonText}>생성</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 15,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-end',
  },

  modalBox: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 14,
    paddingBottom: 34,
  },

  handle: {
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#D9D9D9',
    alignSelf: 'center',
    marginBottom: 24,
  },

  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111',
    marginBottom: 18,
  },

  label: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
    marginBottom: 8,
  },

  input: {
    height: 52,
    borderRadius: 14,
    backgroundColor: '#F6F6F6',
    paddingHorizontal: 16,
    fontSize: 16,
  },

  buttonRow: {
    flexDirection: 'row',
    marginTop: 28,
  },

  cancelButton: {
    flex: 1,
    height: 50,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E6E6E6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },

  cancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },

  createButton: {
    flex: 1,
    height: 50,
    borderRadius: 14,
    backgroundColor: '#FF5C8A',
    justifyContent: 'center',
    alignItems: 'center',
  },

  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});