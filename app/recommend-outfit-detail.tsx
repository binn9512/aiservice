import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useLocalSearchParams } from 'expo-router';

// 올바른 경로 수정: app/에서 src/로 바로 접근
import ItemDetailModal from '../src/components/modal/ItemDetailModal';
import { OutfitItem } from '../src/types/outfit';

type Outfit = {
  id: string;
  modelImage: any;
  items: OutfitItem[];
};

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

  useEffect(() => {
    const loadFaceImage = async () => {
      const savedImage = await AsyncStorage.getItem('USER_AVATAR_IMAGE');
      if (savedImage) {
        setFaceImage(savedImage);
      }
    };
    loadFaceImage();
  }, []);

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
          {faceImage ? (
            <View style={styles.avatarWrapper}>
              <Image
                source={typeof current.modelImage === 'string' ? { uri: current.modelImage } : current.modelImage}
                style={styles.modelImage}
                resizeMode="contain"
              />
            </View>
          ) : (
            <View style={styles.emptyAvatar}>
              <Text style={styles.emptyAvatarText}>AI 아바타</Text>
            </View>
          )}

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
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF', paddingHorizontal: 20, paddingTop: 54, paddingBottom: 140 },
  headerRow: { flexDirection: 'row', alignItems: 'center' },
  backButton: { fontSize: 38, color: '#111', marginRight: 8, marginTop: -4 },
  headerTitle: { fontSize: 18, fontWeight: '600', color: '#111', marginTop: 2 },
  outfitTitle: { fontSize: 22, fontWeight: '700', color: '#111', marginTop: 13, marginBottom: 12 },
  content: { flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-start', position: 'relative' },
  modelImage: { width: 240, height: 450, borderRadius: 24, resizeMode: 'cover', marginVertical: -55, marginLeft: -45 },
  avatarWrapper: { width: 160, height: 340, position: 'relative' },
  itemBox: { width: 160, height: 340, marginLeft: 18, borderWidth: 1, borderColor: '#F1D8E1', borderRadius: 20, padding: 12 },
  itemTitle: { color: '#FF5C8A', fontWeight: '700', fontSize: 15, marginBottom: 14, marginLeft: 2 },
  itemRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  itemImage: { width: 46, height: 46, borderRadius: 10, marginRight: 10 },
  itemsContainer: { flex: 1, justifyContent: 'space-evenly' },
  itemName: { fontSize: 12, fontWeight: '600', color: '#111' },
  itemSub: { fontSize: 11, color: '#777', marginTop: 2 },
  questionSection: { marginTop: 25, gap: 10 },
  questionTitle: { fontSize: 22, fontWeight: '700', color: '#111', marginBottom: -4 },
  questionButton: { backgroundColor: '#FFF5F8', borderWidth: 1, borderColor: '#FFD6E3', borderRadius: 999, paddingVertical: 12, paddingHorizontal: 12 },
  questionText: { fontSize: 14, color: '#FF5C8A', fontWeight: '600' },
  inputWrapper: { position: 'absolute', left: 16, right: 16, bottom: 24, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#EAEAEA', borderRadius: 999, paddingLeft: 18, paddingRight: 8, height: 58, backgroundColor: '#FFFFFF' },
  input: { flex: 1, fontSize: 15, color: '#111', paddingVertical: 0 },
  sendButton: { width: 46, height: 46, borderRadius: 23, backgroundColor: '#FF5C8A', justifyContent: 'center', alignItems: 'center' },
  sendText: { color: '#FFF', fontSize: 18, fontWeight: '700' },
  emptyAvatar: { width: 160, height: 340, borderRadius: 24, backgroundColor: '#F5F5F5', justifyContent: 'center', alignItems: 'center' },
  emptyAvatarText: { fontSize: 20, fontWeight: '700', color: '#666' },
});