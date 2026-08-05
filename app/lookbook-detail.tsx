import React, {
  useEffect,
  useState,
  useCallback,
} from 'react';

import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  Alert,
  Modal,
  KeyboardAvoidingView,
  Pressable,
  TextInput,
  Platform,
} from 'react-native';

import Ionicons from '@expo/vector-icons/Ionicons';
import axios from 'axios';

import {
  useRouter,
  useLocalSearchParams,
  useFocusEffect,
} from 'expo-router';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL!;


export default function LookbookDetailPage() {
  const router = useRouter();

  const { collectionId, title } =
    useLocalSearchParams<{
      collectionId: string;
      title: string;
    }>();

  const [outfits, setOutfits] = useState<any[]>([]);

  const [editVisible, setEditVisible] = useState(false);
  const [editTitle, setEditTitle] = useState(String(title || ''));

  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const loadOutfits = async () => {
    try {
      const res = await axios.get(
        `${API_BASE_URL}/collection/${collectionId}`
      );

      if (res.data.success) {
        setOutfits(res.data.outfits);
      }
    } catch (e) {
      console.log(e);
    }
  };

  useFocusEffect(
    useCallback(() => {
      if (collectionId) {
        loadOutfits();
      }
    }, [collectionId])
  );

  const showMenu = () => {
    Alert.alert(
      '룩북 관리',
      '',
      [
        {
          text: '제목 수정',
          onPress: () => {
            setEditTitle(String(title || ''));
            setEditVisible(true);
          },
        },
        {
          text: '정렬',
          onPress: showSortMenu,
        },
        {
          text: '삭제',
          style: 'destructive',
          onPress: () => {
            setSelectedIds([]);
            setIsDeleteMode(true);
          },
        },
        {
          text: '취소',
          style: 'cancel',
        },
      ]
    );
  };

  const showSortMenu = () => {
    Alert.alert(
      '정렬',
      '',
      [
        {
          text: '최신순',
          onPress: () => {
            setOutfits(prev =>
              [...prev].sort(
                (a, b) =>
                  new Date(b.created_at).getTime() -
                  new Date(a.created_at).getTime()
              )
            );
          },
        },
        {
          text: '오래된순',
          onPress: () => {
            setOutfits(prev =>
              [...prev].sort(
                (a, b) =>
                  new Date(a.created_at).getTime() -
                  new Date(b.created_at).getTime()
              )
            );
          },
        },
        {
          text: '취소',
          style: 'cancel',
        },
      ]
    );
  };

  const deleteSelected = async () => {
    if (selectedIds.length === 0) {
      Alert.alert('삭제할 코디를 선택해주세요.');
      return;
    }

    Alert.alert(
      '삭제',
      `${selectedIds.length}개의 코디를 삭제하시겠습니까?`,
      [
        {
          text: '취소',
          style: 'cancel',
        },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            try {
              await axios.post(
                `${API_BASE_URL}/delete-saved-outfits`,
                {
                  ids: selectedIds,
                }
              );

              setSelectedIds([]);
              setIsDeleteMode(false);

              await loadOutfits();

            } catch (e) {
              console.log(e);
            }
          },
        },
      ]
    );
  };

  const updateCollection = async () => {
    try {
      await axios.put(
        `${API_BASE_URL}/collection/${collectionId}`,
        {
          name: editTitle,
        }
      );

      setEditVisible(false);

      router.setParams({
        title: editTitle,
      });

    } catch (e) {
      console.log(e);
      Alert.alert('수정에 실패했습니다.');
    }
  };

  const renderItem = ({ item }: any) => (
    <TouchableOpacity
      activeOpacity={0.9}
      style={styles.card}
      onPress={() => {

        if (isDeleteMode) {

          if (selectedIds.includes(item.saved_id)) {
            setSelectedIds(prev =>
              prev.filter(id => id !== item.saved_id)
            );
          } else {
            setSelectedIds(prev => [
              ...prev,
              item.saved_id,
            ]);
          }

          return;
        }

        router.push({
          pathname: '/lookbook-outfit-detail',
          params: {
            savedId: item.saved_id,
            collectionId,
          },
        });
      }}
    >
      {isDeleteMode && (
        <View style={styles.checkCircle}>
          <Ionicons
            name={
              selectedIds.includes(item.saved_id)
                ? 'checkmark-circle'
                : 'ellipse-outline'
            }
            size={26}
            color={
              selectedIds.includes(item.saved_id)
                ? '#FF5C8A'
                : '#BDBDBD'
            }
          />
        </View>
      )}

      <View style={styles.image}>
        <Ionicons
          name="shirt-outline"
          size={46}
          color="#BDBDBD"
          style={{ alignSelf: 'center', marginTop: '50%' }}
        />
      </View>

      <Text
        style={styles.cardTitle}
        numberOfLines={1}
      >
        {item.title || '제목 없음'}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>

      <View style={styles.header}>

        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons
            name="chevron-back"
            size={28}
            color="#111"
          />
        </TouchableOpacity>

        <Text style={styles.title}>
          {title}
        </Text>

        <TouchableOpacity onPress={showMenu}>
          <Ionicons
            name="ellipsis-horizontal"
            size={24}
            color="#111"
          />
        </TouchableOpacity>

      </View>

      <Text style={styles.count}>
        {outfits.length}개의 코디
      </Text>

      <Modal
        visible={editVisible}
        animationType="slide"
        transparent
      >
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <Pressable
            style={styles.modalOverlay}
            onPress={() => setEditVisible(false)}
          >
            <Pressable
              style={styles.saveModal}
              onPress={(e) => e.stopPropagation()}
            >

              <Text style={styles.modalTitle}>
                룩북 이름 수정
              </Text>

              <TextInput
                value={editTitle}
                onChangeText={setEditTitle}
                placeholder="룩북 이름"
                style={styles.modalInput}
              />

              <TouchableOpacity
                style={styles.saveButton}
                onPress={updateCollection}
              >
                <Text style={styles.saveButtonText}>
                  수정 완료
                </Text>
              </TouchableOpacity>

            </Pressable>
          </Pressable>
        </KeyboardAvoidingView>
      </Modal>

      <FlatList
        data={outfits}
        keyExtractor={(item) => String(item.saved_id)}
        renderItem={renderItem}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      {isDeleteMode && (
        <View style={styles.deleteBar}>

          <Text style={styles.selectedText}>
            {selectedIds.length}개 선택됨
          </Text>

          <View style={styles.deleteButtons}>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => {
                setIsDeleteMode(false);
                setSelectedIds([]);
              }}
            >
              <Text style={styles.cancelButtonText}>
                취소
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.deleteButton}
              onPress={deleteSelected}
            >
              <Text style={styles.deleteButtonText}>
                삭제
              </Text>
            </TouchableOpacity>

          </View>

        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  header: {
    height: 60,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  title: {
    fontSize: 23,
    fontWeight: '700',
    color: '#111111',
  },

  count: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111111',
    marginHorizontal: 20,
    marginBottom: 18,
  },

  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 110,
  },

  row: {
    justifyContent: 'space-between',
    marginBottom: 18,
  },

  card: {
    width: '48%',
  },

  image: {
    width: '100%',
    aspectRatio: 0.72,
    borderRadius: 18,
    backgroundColor: '#F2F2F2',
  },

  date: {
    marginTop: 10,
    fontSize: 15,
    color: '#666666',
    fontWeight: '500',
  },

  cardTitle: {
  marginTop: 10,
  fontSize: 16,
  fontWeight: '600',
  color: '#111111',
  marginHorizontal: 4,
},

  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.35)',
  },

  saveModal: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
  },

  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 20,
  },

  modalInput: {
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 50,
    marginBottom: 20,
  },

  saveButton: {
    height: 50,
    borderRadius: 14,
    backgroundColor: '#FF5C8A',
    justifyContent: 'center',
    alignItems: 'center',
  },

  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },

  checkCircle: {
  position: 'absolute',
  top: 10,
  right: 10,
  zIndex: 10,
},

deleteBar: {
  position: 'absolute',
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: '#fff',
  borderTopWidth: 1,
  borderColor: '#ECECEC',
  paddingHorizontal: 20,
  paddingVertical: 16,
},

selectedText: {
  fontSize: 15,
  color: '#666',
  marginBottom: 12,
},

deleteButtons: {
  flexDirection: 'row',
},

deleteButton: {
  flex: 1,
  height: 48,
  backgroundColor: '#FF5C8A',
  borderRadius: 14,
  justifyContent: 'center',
  alignItems: 'center',
  marginLeft: 10,
  marginBottom: 10,
},

deleteButtonText: {
  color: '#fff',
  fontWeight: '700',
  fontSize: 16,
},

cancelButton: {
  width: 90,
  height: 48,
  borderRadius: 14,
  borderWidth: 1,
  borderColor: '#E5E5E5',
  justifyContent: 'center',
  alignItems: 'center',
},

cancelButtonText: {
  color: '#666',
  fontWeight: '600',
},
});