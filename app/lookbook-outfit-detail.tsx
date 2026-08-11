import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import axios from 'axios';
import LookbookSelector from '@/components/lookbook/LookbookSelector';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL!;

export default function LookbookOutfitDetailScreen() {
  const router = useRouter();
  const {
    collectionId,
    savedId,
    title,
  } = useLocalSearchParams<{
    collectionId: string;
    savedId: string;
    title: string;
  }>();

  const [current, setCurrent] = useState<any>(null);
  const [editVisible, setEditVisible] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editMemo, setEditMemo] = useState('');

  const [saveModalVisible, setSaveModalVisible] = useState(false);
  const [favoriteTitle, setFavoriteTitle] = useState('');
  const [favoriteMemo, setFavoriteMemo] = useState('');

  const [collections, setCollections] = useState<any[]>([]);
  const [selectedCollections, setSelectedCollections] = useState<any[]>([]);
  const [isCollectionOpen, setIsCollectionOpen] = useState(false);

  const [showCreateInput, setShowCreateInput] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');

  const [isFavorite, setIsFavorite] = useState(
    collectionId === 'favorite'
  );

  useEffect(() => {
    loadOutfit();
  }, []);

  const loadOutfit = async () => {
    try {

      let res;

      // ❤️ 즐겨찾기
      if (collectionId === 'favorite') {

        res = await axios.get(
          `${API_BASE_URL}/favorite-outfits`
        );

      } else {

        // 일반 룩북
        res = await axios.get(
          `${API_BASE_URL}/collection/${collectionId}`
        );

      }

      if (res.data.success) {

        const found = res.data.outfits.find(
          (item: any) =>
            String(item.saved_id) === String(savedId)
        );

        console.log('🔥 룩북 상세 found:', found);

        if (found) {
          setCurrent(found);
        }

      }

    } catch (e) {
      console.log(e);
    }
  };

  const loadCollections = async () => {
    try {
      const res = await axios.get(
        `${API_BASE_URL}/get-collections`
      );

      if (res.data.success) {
        setCollections(res.data.collections);
        return res.data.collections;   // ⭐ 추가
      }

      return [];
    } catch (e) {
      console.log(e);
      return [];
    }
  };

  const createCollection = async () => {
    if (!newCollectionName.trim()) return;

    try {
      const res = await axios.post(
        `${API_BASE_URL}/create-collection`,
        {
          name: newCollectionName,
        }
      );

      if (res.data.success) {
        await loadCollections();

        setSelectedCollections([
          ...selectedCollections,
          res.data.collection,
        ]);

        setShowCreateInput(false);
        setNewCollectionName('');
      }
    } catch (e) {
      console.log(e);
    }
  };

  const showMenu = () => {
    Alert.alert(
      '코디 관리',
      '',
      [
        {
          text: '수정',
          onPress: async () => {
            setEditTitle(current.title);
            setEditMemo(current.memo || '');

            const collections = await loadCollections();

            const currentCollection = collections.find(
              (item: any) =>
                item.id === Number(collectionId)
            );

            setSelectedCollections(
              currentCollection ? [currentCollection] : []
            );

            setEditVisible(true);
          },
        },
        {
          text: '삭제',
          style: 'destructive',
          onPress: deleteOutfit,
        },
        {
          text: '취소',
          style: 'cancel',
        },
      ]
    );
  };

  const deleteOutfit = () => {
    Alert.alert(
      '코디 삭제',
      '이 코디를 삭제하시겠습니까?',
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
              await axios.delete(
                `${API_BASE_URL}/saved-outfit/${savedId}`
              );

              Alert.alert('삭제되었습니다.');

              router.back();
            } catch (e) {
              console.log(e);
              Alert.alert('삭제에 실패했습니다.');
            }
          },
        },
      ]
    );
  };

  const toggleCollection = (collection: any) => {
    setSelectedCollections(prev => {
      const exists = prev.some(c => c.id === collection.id);

      if (exists) {
        return prev.filter(c => c.id !== collection.id);
      }

      return [...prev, collection];
    });
  };

  const toggleFavorite = () => {

    // 🤍 → 즐겨찾기 저장
    if (!isFavorite) {

      setFavoriteTitle(current.title || '');
      setFavoriteMemo(current.memo || '');

      setSaveModalVisible(true);

      return;
    }

    // ❤️ → 좋아요 취소
    Alert.alert(
      '좋아요 취소',
      '이 코디를 즐겨찾기에서 삭제하시겠습니까?',
      [
        {
          text: '취소',
          style: 'cancel',
        },
        {
          text: '좋아요 취소',
          style: 'destructive',
          onPress: async () => {

            try {

              const res = await axios.post(
                `${API_BASE_URL}/toggle-favorite`,
                {
                  saved_id: current.saved_id,
                }
              );

              if (res.data.success) {

                setIsFavorite(false);

                Alert.alert(
                  '완료',
                  '좋아요가 취소되었습니다.'
                );
              }

            } catch (e) {
              console.log(e);
            }

          },
        },
      ]
    );
  };

  const saveFavorite = async () => {

    try {

      const res = await axios.post(
        `${API_BASE_URL}/toggle-favorite`,
        {
          saved_id: current.saved_id,
          title: favoriteTitle,
          memo: favoriteMemo,
        }
      );

      if (res.data.success) {

        setSaveModalVisible(false);

        setIsFavorite(true);

        setCurrent({
          ...current,
          title: favoriteTitle,
          memo: favoriteMemo,
        });

        Alert.alert(
          '완료',
          '즐겨찾기에 저장되었습니다.'
        );
      }

    } catch (e) {
      console.log(e);
    }

  };

  const updateOutfit = async () => {
    try {
      // 제목 / 메모 수정
      await axios.put(
        `${API_BASE_URL}/saved-outfit/${savedId}`,
        {
          title: editTitle,
          memo: editMemo,
        }
      );

      // 룩북 변경
      await axios.post(
        `${API_BASE_URL}/update-outfit-collections`,
        {
          saved_id: Number(savedId),
          collection_ids: selectedCollections.map(
            item => item.id
          ),
        }
      );

      setEditVisible(false);

      Alert.alert(
        '수정 완료',
        '룩북이 수정되었습니다.',
        [
          {
            text: '확인',
            onPress: () => router.back(),
          },
        ]
      );

    } catch (e) {
      console.log(e);
      Alert.alert('수정 실패');
    }
  };

  const items = useMemo(() => {
    if (!current) return [];

    return Object.values(current.items || {}).filter(Boolean);
  }, [current]);

  if (!current) return null;

  const date = new Date(current.created_at);

  const formattedDate =
    `${date.getFullYear()}.` +
    `${String(date.getMonth() + 1).padStart(2, '0')}.` +
    `${String(date.getDate()).padStart(2, '0')}`;

  const outfitImage =
    (current as any).outfit_image ||
    (items.length > 0 ? (items[0] as any).image : undefined);

  return (
    <>
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
                룩북 수정
              </Text>

              <LookbookSelector
                collections={collections}
                selectedCollections={selectedCollections}
                isCollectionOpen={isCollectionOpen}
                showCreateInput={showCreateInput}
                newCollectionName={newCollectionName}
                onToggleOpen={() =>
                    setIsCollectionOpen(!isCollectionOpen)
                }
                onToggleCollection={toggleCollection}
                onToggleCreateInput={() =>
                    setShowCreateInput(!showCreateInput)
                }
                onChangeNewCollectionName={setNewCollectionName}
                onCreateCollection={createCollection}
            />

              <TextInput
                placeholder="코디 이름"
                value={editTitle}
                onChangeText={setEditTitle}
                style={styles.modalInput}
              />

              <TextInput
                placeholder="메모"
                value={editMemo}
                onChangeText={setEditMemo}
                multiline
                style={styles.memoInput}
              />

              <TouchableOpacity
                style={styles.saveButton}
                onPress={updateOutfit}
              >
                <Text style={styles.saveButtonText}>
                  수정 완료
                </Text>
              </TouchableOpacity>

            </Pressable>
          </Pressable>
        </KeyboardAvoidingView>
      </Modal>

      <Modal
        visible={saveModalVisible}
        animationType="slide"
        transparent
      >
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <Pressable
            style={styles.modalOverlay}
            onPress={() => setSaveModalVisible(false)}
          >
            <Pressable
              style={styles.saveModal}
              onPress={(e) => e.stopPropagation()}
            >

              <Text style={styles.modalTitle}>
                즐겨찾기 저장
              </Text>

              <TextInput
                placeholder="코디 이름"
                value={favoriteTitle}
                onChangeText={setFavoriteTitle}
                style={styles.modalInput}
              />

              <TextInput
                placeholder="메모(선택)"
                value={favoriteMemo}
                onChangeText={setFavoriteMemo}
                multiline
                style={styles.memoInput}
              />

              <TouchableOpacity
                style={styles.saveButton}
                onPress={saveFavorite}
              >
                <Text style={styles.saveButtonText}>
                  저장
                </Text>
              </TouchableOpacity>

            </Pressable>
          </Pressable>
        </KeyboardAvoidingView>
      </Modal>

    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons
            name="chevron-back"
            size={28}
            color="#111"
          />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>
          {title}
        </Text>

        <TouchableOpacity onPress={showMenu}>
          <Ionicons
            name="ellipsis-horizontal"
            size={22}
            color="#111"
          />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.avatarWrapper}>
          <Image
            source={{ uri: outfitImage }}
            style={styles.modelImage}
            resizeMode="cover"
          />
        </View>

        <View style={styles.itemBox}>
          <Text style={styles.itemTitle}>코디 아이템</Text>

          <View style={styles.itemsContainer}>
            {items.map((item: any, idx: number) => (
              <TouchableOpacity
                key={item.id ?? `${item.category}-${idx}`}
                activeOpacity={0.8}
                style={styles.itemRow}
              >
                <Image
                  source={
                    typeof item.image === 'string'
                      ? { uri: item.image }
                      : item.image
                  }
                  style={styles.itemImage}
                  resizeMode="contain"
                />

                <View style={{ flex: 1 }}>
                  <Text
                    numberOfLines={1}
                    style={styles.itemName}
                  >
                    {item.name}
                  </Text>

                  <Text style={styles.itemSub}>
                    {item.type === 'closet' || item.is_shop === false
                      ? '내 옷장'
                      : '추천 상품'}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      <View style={styles.infoBox}>

        <View style={styles.titleRow}>
          <Text style={styles.lookbookTitle}>
            {current.title}
          </Text>

          <TouchableOpacity onPress={toggleFavorite}>
            <Ionicons
              name={isFavorite ? 'heart' : 'heart-outline'}
              size={24}
              color="#FF5C8A"
            />
          </TouchableOpacity>
        </View>

        <Text style={styles.date}>
          {formattedDate}
        </Text>

        <View style={styles.divider} />

        <Text style={styles.memoTitle}>
          메모
        </Text>

        <Text style={styles.memo}>
          {current.memo || '메모가 없습니다.'}
        </Text>

        <TouchableOpacity style={styles.retryButton}>
          <Text style={styles.retryText}>
            비슷한 코디 다시 추천받기
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  </>
);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },

  header: {
    paddingTop: 70,
    paddingHorizontal: 20,
    paddingBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111',
  },

  content: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-start',
  },

  avatarWrapper: {
    width: 200,
    height: 340,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },

  modelImage: {
    width: '100%',
    height: '100%',
    borderRadius: 24,
    resizeMode: 'contain',
  },

  itemBox: {
    width: 160,
    height: 340,
    marginLeft: 18,
    borderWidth: 1,
    borderColor: '#F1D8E1',
    borderRadius: 20,
    padding: 12,
  },

  itemTitle: {
    color: '#FF5C8A',
    fontWeight: '700',
    fontSize: 15,
    marginBottom: 14,
    marginLeft: 2,
  },

  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },

  itemImage: {
    width: 46,
    height: 46,
    borderRadius: 10,
    marginRight: 10,
  },

  itemsContainer: {
    flex: 1,
    justifyContent: 'space-evenly',
  },

  itemName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#111',
  },

  itemSub: {
    fontSize: 11,
    color: '#777',
    marginTop: 2,
  },

  infoBox: {
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 40,
  },

  lookbookTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111',
  },

  date: {
    marginTop: 6,
    fontSize: 14,
    color: '#888',
  },

  divider: {
    height: 1,
    backgroundColor: '#EEEEEE',
    marginVertical: 20,
  },

  memoTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111',
    marginBottom: 10,
  },

  memo: {
    fontSize: 15,
    color: '#555',
    lineHeight: 24,
  },

  retryButton: {
    marginTop: 30,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#FF5C8A',
    justifyContent: 'center',
    alignItems: 'center',
  },

  retryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
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
    marginBottom: 16,
  },

  memoInput: {
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 12,
    padding: 16,
    height: 100,
    textAlignVertical: 'top',
  },

  saveButton: {
    marginTop: 24,
    height: 52,
    borderRadius: 14,
    backgroundColor: '#FF5C8A',
    justifyContent: 'center',
    alignItems: 'center',
  },

  saveButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },

  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  dropdownButton: {
    height: 52,
    backgroundColor: '#F7F7F7',
    borderRadius: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },

  dropdownText: {
    fontSize: 16,
    color: '#666',
  },

  collectionList: {
    maxHeight: 220,
    backgroundColor: '#F7F7F7',
    borderRadius: 14,
    marginBottom: 18,
  },

  collectionItem: {
    minHeight: 42,
    justifyContent: 'center',
    paddingHorizontal: 18,
    paddingVertical: 10,
  },

  collectionText: {
    fontSize: 16,
    color: '#111',
  },

  addCollectionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF5C8A',
    paddingVertical: 14,
  },

  createInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingBottom: 10,
  },

  createInput: {
    flex: 1,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#EAEAEA',
    paddingHorizontal: 14,
  },

  createCircleButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FF5C8A',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
});