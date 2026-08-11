import React, {
  useState,
  useEffect,
  useRef,
} from 'react';

import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Pressable,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useLocalSearchParams } from 'expo-router';

import ItemDetailModal from '../src/components/modal/ItemDetailModal';
import { OutfitItem } from '../src/types/outfit';
import { Ionicons } from '@expo/vector-icons';
import LookbookSelector from '../src/components/lookbook/LookbookSelector';
import axios from 'axios';


type Outfit = {
  id: string;
  modelImage: any;
  items: OutfitItem[];
};

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL!;

export default function RecommendOutfitDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  let outfits: Outfit[] = [];
  let parsedInitialIndex = 0;

  try {
    if (params.outfits) {
      outfits = JSON.parse(params.outfits as string);
    }
    if (params.initialIndex) {
      parsedInitialIndex = Number(params.initialIndex);
    }
  } catch (e) {
    console.log('데이터 파싱 에러', e);
  }

  const [index] = useState<number>(parsedInitialIndex);
  const [inputText, setInputText] = useState('');
  const [selectedItem, setSelectedItem] = useState<OutfitItem | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const current = outfits[index];
  const [faceImage, setFaceImage] = useState<string | null>(null);

  const [tryOnImage, setTryOnImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false); 
  const tryOnStarted = useRef(false);

  const [saveModalVisible, setSaveModalVisible] = useState(false);
  const [lookbookTitle, setLookbookTitle] = useState('');
  const [lookbookMemo, setLookbookMemo] = useState('');
  const [collections, setCollections] = useState<any[]>([]);
  const [selectedCollections, setSelectedCollections] = useState<any[]>([]);  const [isCollectionOpen, setIsCollectionOpen] = useState(false);

  const [showCreateInput, setShowCreateInput] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');

  const [isFavorite, setIsFavorite] = useState(false);

  const toggleCollection = (collection: any) => {
    setSelectedCollections(prev => {
      const exists = prev.some(c => c.id === collection.id);

      if (exists) {
        return prev.filter(c => c.id !== collection.id);
      }

      return [...prev, collection];
    });
  };

  const loadCollections = async () => {
    try {
      const res = await axios.get(
        `${API_BASE_URL}/get-collections`
      );

      if (res.data.success) {
        setCollections(res.data.collections);
      }

    } catch (e) {
      console.log(e);
    }
  };

  const createCollection = async () => {
    if (!newCollectionName.trim()) return;

    try {
      const res = await 
      axios.post(
        `${API_BASE_URL}/create-collection`,
        {
          name: newCollectionName,
        }
      );

      if (res.data.success) {

        // 목록 다시 불러오기
        await loadCollections();

        // 새로 만든 룩북 자동 선택
        setSelectedCollections([res.data.collection]);

        // 드롭다운 닫기
        setIsCollectionOpen(false);

        // 입력창 닫기
        setShowCreateInput(false);

        // 입력값 초기화
        setNewCollectionName('');
      }

    } catch (e) {
      console.log(e);
    }
  };

  const saveLookbook = async () => {
    if (selectedCollections.length === 0) {
      alert('룩북을 선택해주세요.');
      return;
    }

    const top = current.items.find(item =>
      [
        '반팔 티셔츠',
        '긴팔 티셔츠',
        '셔츠/블라우스',
        '니트/스웨터',
        '맨투맨/후드',
        '슬리브리스',
      ].includes(item.category)
    )?.id;

    const bottom = current.items.find(item =>
      [
        '데님 팬츠',
        '슬랙스',
        '반바지',
        '트레이닝 팬츠',
        '스커트',
      ].includes(item.category)
    )?.id;

    const dress = current.items.find(item =>
      ['원피스'].includes(item.category)
    )?.id;

    const outer = current.items.find(item =>
      [
        '코트',
        '패딩',
        '자켓',
        '가디건',
        '집업',
      ].includes(item.category)
    )?.id;

    const shoes = current.items.find(item =>
      [
        '운동화/스니커즈',
        '구두/로퍼',
        '힐',
        '부츠',
        '샌들/슬리퍼',
      ].includes(item.category)
    )?.id;

    const bag = current.items.find(item =>
      [
        '백팩',
        '숄더백/토트백',
        '크로스백',
        '클러치',
      ].includes(item.category)
    )?.id;

    const accessory = current.items.find(item =>
      [
        '모자',
        '머플러/스카프',
        '벨트',
        '안경/선글라스',
        '주얼리',
      ].includes(item.category)
    )?.id;

    try {
      const today = new Date();

      await axios.post(
        `${API_BASE_URL}/save-outfit`,
        {
          collection_ids: selectedCollections.map(c => c.id),

          title:
            lookbookTitle.trim() ||
            '새 코디',
          memo: lookbookMemo,

          images: {
            top,
            bottom,
            dress,
            outer,
            shoes,
            bag,
            accessory,
          },
        }
      );

      setSaveModalVisible(false);
      setLookbookTitle('');
      setLookbookMemo('');

      alert('룩북에 저장되었습니다.');
    } catch (e) {
      console.log(e);
      alert('저장에 실패했습니다.');
    }
  };

  const saveFavorite = async () => {
    try {

      const favoriteRes = await axios.get(
        `${API_BASE_URL}/favorite-collection`
      );

      const favoriteId = favoriteRes.data.collection_id;

      const top = current.items.find(item =>
        ['반팔 티셔츠','긴팔 티셔츠','셔츠/블라우스','니트/스웨터','맨투맨/후드','슬리브리스']
        .includes(item.category)
      )?.id;

      const bottom = current.items.find(item =>
        ['데님 팬츠','슬랙스','반바지','트레이닝 팬츠','스커트']
        .includes(item.category)
      )?.id;

      const dress = current.items.find(item =>
        ['원피스'].includes(item.category)
      )?.id;

      const outer = current.items.find(item =>
        ['코트','패딩','자켓','가디건','집업']
        .includes(item.category)
      )?.id;

      const shoes = current.items.find(item =>
        ['운동화/스니커즈','구두/로퍼','힐','부츠','샌들/슬리퍼']
        .includes(item.category)
      )?.id;

      const bag = current.items.find(item =>
        ['백팩','숄더백/토트백','크로스백','클러치']
        .includes(item.category)
      )?.id;

      const accessory = current.items.find(item =>
        ['모자','머플러/스카프','벨트','안경/선글라스','주얼리']
        .includes(item.category)
      )?.id;

      const saveRes = await axios.post(
        `${API_BASE_URL}/save-outfit`,
        {
          collection_id: favoriteId,
          title: lookbookTitle.trim() || '새 코디',
          memo: lookbookMemo,
          images: {
            top,
            bottom,
            dress,
            outer,
            shoes,
            bag,
            accessory,
          },
        }
      );

      await axios.post(
        `${API_BASE_URL}/toggle-favorite`,
        {
          saved_id: saveRes.data.saved_id,
          title: lookbookTitle.trim() || '새 코디',
          memo: lookbookMemo,
        }
      );

      setSaveModalVisible(false);
      setLookbookTitle('');
      setLookbookMemo('');
      setIsFavorite(true);

      Alert.alert(
        '완료',
        '즐겨찾기에 저장되었습니다.'
      );

    } catch (e) {
      console.log(e);
    }
  };

  if (!current) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text>데이터를 불러올 수 없습니다.</Text>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 20 }}>
          <Text style={{ color: '#FF5C8A', fontWeight: 'bold' }}>뒤로 가기</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const generateTryOn = async () => {
    if (tryOnStarted.current) {
      return;
    }

    tryOnStarted.current = true;

    try {
      const avatarPath = await AsyncStorage.getItem(
        'USER_AVATAR_IMAGE'
      );

      if (!avatarPath || !current) {
        console.log('❌ 아바타 또는 코디 정보가 없음');
        return;
      }

      setFaceImage(avatarPath);
      setIsGenerating(true);

      const prompt = current.items
        .map(item => {
          const category = item.category || '의류';

          return `- ${category}: ${item.name}`;
        })
        .join('\n');

      console.log('🔥 아바타 경로:', avatarPath);
      console.log('🔥 옷 입히기 prompt:', prompt);

      const response = await axios.post(
        `${API_BASE_URL}/generate-outfit`,
        {
          avatar_path: avatarPath,
          prompt: prompt,
          item_images: current.items.map(item => ({
            name: item.name,
            category: item.category,
            image: item.image,
          })),
        }
      );

      console.log('🔥 옷 입히기 응답:', response.data);
      console.log('🔥 최종 tryOn 이미지:', response.data.image_url);

      if (
        response.data.success &&
        response.data.image_url
      ) {
        setTryOnImage(response.data.image_url.trim());
      }
    } catch (error) {
      console.log('❌ 옷 입히기 오류:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    if (!current) return;

    generateTryOn();
  }, []);

  return (
    <>
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backButton}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>채팅</Text>
        </View>

        <Text style={styles.outfitTitle}>추천 코디</Text>

        <View style={styles.content}>
          <View style={styles.avatarWrapper}>
            {isGenerating ? (
              <View style={styles.loadingAvatar}>
                <Text style={styles.loadingAvatarText}>
                  코디를 입히는 중...
                </Text>
              </View>
            ) : tryOnImage ? (
              <Image
                source={{ uri: tryOnImage }}
                style={styles.modelImage}
                resizeMode="contain"
              />
            ) : faceImage ? (
              <Image
                source={{
                  uri: tryOnImage || `${API_BASE_URL}/${faceImage}`,
                }}
                style={styles.modelImage}
                resizeMode="contain"
              />
            ) : (
              <View style={styles.emptyAvatar}>
                <Text style={styles.emptyAvatarText}>
                  AI 아바타
                </Text>
              </View>
            )}
          </View>

          <View style={styles.itemBox}>
            <Text style={styles.itemTitle}>코디 아이템</Text>
            <View style={styles.itemsContainer}>
              {current.items.map((item: OutfitItem, idx: number) => (
                <TouchableOpacity
                  key={idx}
                  activeOpacity={0.8}
                  style={styles.itemRow}
                  onPress={() => {
                    setSelectedItem(item);
                    setModalVisible(true);
                  }}>
                  <Image
                    source={typeof item.image === 'string' ? { uri: item.image } : item.image}
                    style={styles.itemImage}
                    resizeMode="contain"
                  />
                  <View style={{ flex: 1 }}>
                    <Text numberOfLines={1} style={styles.itemName}>{item.name}</Text>
                    <Text style={styles.itemSub}>{item.type === 'closet' ? '내 옷장' : '추천 상품'}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        <View style={styles.questionSection}>
          <View style={styles.actionContainer}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => {
                setLookbookTitle('');
                setLookbookMemo('');
                loadCollections();  
                setSaveModalVisible(true);
              }}
            >
              <Ionicons
                name="folder-open-outline"
                size={20}
                color="#FF5C8A"
              />
              <Text style={styles.actionText}>룩북에 저장</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => {
                setLookbookTitle('');
                setLookbookMemo('');
                loadCollections();
                setSelectedCollections([]);
                setSaveModalVisible(true);
                setIsFavorite(true);
              }}
            >
              <Ionicons
                name={isFavorite ? 'heart' : 'heart-outline'}
                size={20}
                color="#FF5C8A"
              />

              <Text
                style={[
                  styles.actionText,
                  { color: '#050505' }
                ]}
              >
                좋아요
              </Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.questionTitle}>추천 질문</Text>
          <TouchableOpacity style={styles.questionButton} onPress={() => setInputText('오늘 날씨에 맞게 수정해줘')}>
            <Text style={styles.questionText}>✨ 오늘 날씨에 맞게 수정해줘</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.inputWrapper}>
        <TextInput
          value={inputText}
          onChangeText={setInputText}
          placeholder="수정하고 싶은 점을 입력해보세요"
          style={styles.input}
        />
        <TouchableOpacity
          style={styles.sendButton}
          onPress={async () => {
            const trimmed = inputText.trim();
            if (!trimmed) return;
            await AsyncStorage.setItem('PENDING_PROMPT', trimmed);
            router.back();
            setInputText('');
          }}>
          <Text style={styles.sendText}>➜</Text>
        </TouchableOpacity>
      </View>

      <ItemDetailModal
        visible={modalVisible}
        item={selectedItem}
        onClose={() => { setModalVisible(false); setSelectedItem(null); }}
        onRecommendQuestion={(prompt) => { setInputText(prompt); setModalVisible(false); setSelectedItem(null); }}
      />

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
            onPress={() => {
              setSaveModalVisible(false);
              setIsCollectionOpen(false);
            }}
          >
            <Pressable
              style={styles.saveModal}
              onPress={(e) => e.stopPropagation()}
            >

            <Text style={styles.modalTitle}>
              {isFavorite ? '즐겨찾기 저장' : '룩북 저장'}
            </Text>

            {!isFavorite && (
              <>
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
              </>
            )}

            <TextInput
              placeholder="코디 이름"
              value={lookbookTitle}
              onChangeText={setLookbookTitle}
              style={styles.modalInput}
            />

            <TextInput
              placeholder="메모(선택)"
              value={lookbookMemo}
              onChangeText={setLookbookMemo}
              multiline
              style={styles.memoInput}
            />

            <TouchableOpacity
              style={styles.createButton}
              onPress={() => {
                if (isFavorite) {
                  saveFavorite();
                } else {
                  saveLookbook();
                }
              }}
            >
              <Text style={styles.saveButtonText}>
                저장
              </Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF', paddingHorizontal: 20, paddingTop: 54, paddingBottom: 140 },
  headerRow: { flexDirection: 'row', alignItems: 'center' },
  backButton: { fontSize: 38, color: '#111', marginRight: 8, marginTop: -4 },
  headerTitle: { fontSize: 18, fontWeight: '600', color: '#111', marginTop: 2 },
  outfitTitle: { fontSize: 22, fontWeight: '700', color: '#111', marginTop: 13, marginBottom: 12 },
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

  itemBox: { width: 160, height: 340, marginLeft: 18, borderWidth: 1, borderColor: '#F1D8E1', borderRadius: 20, padding: 12 },
  itemTitle: { color: '#FF5C8A', fontWeight: '700', fontSize: 15, marginBottom: 14, marginLeft: 2 },
  itemRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  itemImage: { width: 46, height: 46, borderRadius: 10, marginRight: 10 },
  itemsContainer: { flex: 1, justifyContent: 'space-evenly' },
  itemName: { fontSize: 12, fontWeight: '600', color: '#111' },
  itemSub: { fontSize: 11, color: '#777', marginTop: 2 },
  questionSection: { marginTop: 25, gap: 10 },
  actionContainer: {
  flexDirection: 'row',
  gap: 12,
  marginTop: 10,
  marginBottom: 24,
},

actionButton: {
  flex: 1,
  height: 52,
  borderRadius: 14,
  backgroundColor: '#fff',
  borderWidth: 1,
  borderColor: '#E5E5E5',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
},

actionText: {
  marginLeft: 6,
  fontSize: 15,
  fontWeight: '600',
  color: '#333',
},
  questionTitle: { fontSize: 22, fontWeight: '700', color: '#111', marginBottom: -4 },
  questionButton: { backgroundColor: '#FFF5F8', borderWidth: 1, borderColor: '#FFD6E3', borderRadius: 999, paddingVertical: 12, paddingHorizontal: 12 },
  questionText: { fontSize: 14, color: '#FF5C8A', fontWeight: '600' },
  inputWrapper: { position: 'absolute', left: 16, right: 16, bottom: 24, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#EAEAEA', borderRadius: 999, paddingLeft: 18, paddingRight: 8, height: 58, backgroundColor: '#FFFFFF' },
  input: { flex: 1, fontSize: 15, color: '#111', paddingVertical: 0 },
  sendButton: { width: 46, height: 46, borderRadius: 23, backgroundColor: '#FF5C8A', justifyContent: 'center', alignItems: 'center' },
  sendText: { color: '#FFF', fontSize: 18, fontWeight: '700' },
  emptyAvatar: { width: 160, height: 340, borderRadius: 24, backgroundColor: '#F5F5F5', justifyContent: 'center', alignItems: 'center' },
  emptyAvatarText: { fontSize: 20, fontWeight: '700', color: '#666' },

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
  height: 80,
  marginBottom: 16,
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

modalLabel: {
  fontSize: 15,
  fontWeight: '600',
  color: '#666',
  marginBottom: 10,
},


collectionList: {
  maxHeight: 220,
  backgroundColor: '#F7F7F7',
  borderRadius: 14,
  marginBottom: 18,
},

collectionItem: {
  height: 42,
  justifyContent: 'center',
  paddingHorizontal: 18,
},

addCollectionText: {
  fontSize: 16,
  fontWeight: '600',
  color: '#FF5C8A',
  paddingTop: 15,
  paddingBottom: 15,
},

collectionText: {
  fontSize: 16,
  color: '#111',
  fontWeight: '400',
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

createModalOverlay: {
  flex: 1,
  backgroundColor: 'rgba(0,0,0,0.35)',
  justifyContent: 'center',
  alignItems: 'center',
},

createModal: {
  width: '85%',
  backgroundColor: '#fff',
  borderRadius: 20,
  padding: 20,
},

createTitle: {
  fontSize: 20,
  fontWeight: '700',
  marginBottom: 18,
},

createButton: {
  height: 44,
  paddingHorizontal: 20,
  borderRadius: 12,
  backgroundColor: '#FF5C8A',
  justifyContent: 'center',
  alignItems: 'center',
},

createButtonRow: {
  flexDirection: 'row',
  justifyContent: 'flex-end',
  marginTop: 18,
},

cancelButton: {
  height: 44,
  paddingHorizontal: 20,
  borderRadius: 12,
  borderWidth: 1,
  borderColor: '#E6E6E6',
  justifyContent: 'center',
  alignItems: 'center',
  marginRight: 10,
},

createInputContainer: {
  flexDirection: 'row',
  alignItems: 'center',
  paddingHorizontal: 14,
  paddingVertical: 8,
  paddingBottom: 8,
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
  borderRadius: 21,
  backgroundColor: '#FF5C8A',
  justifyContent: 'center',
  alignItems: 'center',
  marginLeft: 10,
},

loadingAvatar: {
  width: 160,
  height: 340,
  borderRadius: 24,
  backgroundColor: '#F5F5F5',
  justifyContent: 'center',
  alignItems: 'center',
},

loadingAvatarText: {
  color: '#FF5C8A',
  fontSize: 14,
  fontWeight: '600',
  textAlign: 'center',
},
});