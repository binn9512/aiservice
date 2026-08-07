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

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL!;

export default function LookbookOutfitDetailScreen() {
  const router = useRouter();
  const { collectionId, savedId } = useLocalSearchParams();

  const [current, setCurrent] = useState<any>(null);
  const [editVisible, setEditVisible] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editMemo, setEditMemo] = useState('');

  const [saveModalVisible, setSaveModalVisible] = useState(false);
  const [favoriteTitle, setFavoriteTitle] = useState('');
  const [favoriteMemo, setFavoriteMemo] = useState('');

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

        if (found) {
          setCurrent(found);
        }

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
          onPress: () => {
            setEditTitle(current.title);
            setEditMemo(current.memo || '');
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
      await axios.put(
        `${API_BASE_URL}/saved-outfit/${savedId}`,
        {
          title: editTitle,
          memo: editMemo,
        }
      );

      setCurrent({
        ...current,
        title: editTitle,
        memo: editMemo,
      });

      setEditVisible(false);

      Alert.alert('수정되었습니다.');
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
  items.length > 0 ? (items[0] as any).image : undefined;

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
          {current.title}
        </Text>

        <TouchableOpacity onPress={showMenu}>
          <Ionicons
            name="ellipsis-horizontal"
            size={22}
            color="#111"
          />
        </TouchableOpacity>
      </View>

      <View style={styles.imageSection}>
        <Image
          source={{ uri: outfitImage }}
          style={styles.outfitImage}
        />

        <View style={styles.itemCard}>
          <Text style={styles.itemTitle}>
            코디 아이템
          </Text>

          {items.map((item: any) => (
            <TouchableOpacity
              key={item.id}
              style={styles.itemRow}
            >
              <Image
                source={{ uri: item.image }}
                style={styles.itemImage}
              />

              <Text
                numberOfLines={1}
                style={styles.itemName}
              >
                {item.name || item.category}
              </Text>
            </TouchableOpacity>
          ))}
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
    paddingTop: 65,
    paddingHorizontal: 20,
    paddingBottom: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111',
  },

  imageSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
  },

  outfitImage: {
    width: 230,
    height: 340,
    borderRadius: 18,
    backgroundColor: '#F3F3F3',
  },

  itemCard: {
    flex: 1,
    marginLeft: 14,
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ECECEC',
    padding: 12,
  },

  itemTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 12,
    color: '#111',
  },

  itemRow: {
    alignItems: 'center',
    marginBottom: 16,
  },

  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
  },

  itemName: {
    marginTop: 6,
    fontSize: 12,
    color: '#555',
    textAlign: 'center',
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
});