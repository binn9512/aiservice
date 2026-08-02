import React, { useEffect, useState } from 'react';
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

import axios from 'axios';

import LookbookCard from './LookbookCard';

import { useRouter } from 'expo-router';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL!;


export default function LookbookGrid() {
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(false);
  const [lookbookName, setLookbookName] = useState('');
  const [lookbooks, setLookbooks] = useState<any[]>([
    {
      id: 'add',
      type: 'add',
    },
  ]);

  const loadLookbooks = async () => {
    try {
      const res = await axios.get(
        `${API_BASE_URL}/get-collections`
      );

      if (res.data.success) {
        setLookbooks([
          {
            id: 'add',
            type: 'add',
          },
          ...res.data.collections.map((item: any) => ({
            id: String(item.id),
            title: item.name,
            count: item.count,
            images: [],
          })),
        ]);
      }
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    loadLookbooks();
  }, []);

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
                router.push({
                  pathname: '/lookbook-detail',
                  params: {
                    collectionId: item.id,
                    title: item.title,
                  },
                });
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
                onPress={async () => {
                  try {
                    await axios.post(
                      `${API_BASE_URL}/create-collection`,
                      {
                        name: lookbookName,
                      }
                    );

                    await loadLookbooks();

                    setLookbookName('');
                    setModalVisible(false);

                  } catch (e) {
                    console.log(e);
                  }
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