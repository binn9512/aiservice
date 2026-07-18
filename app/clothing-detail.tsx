import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
  Alert,
  Modal,
  TextInput,
} from 'react-native';

// 1️⃣ expo-router 훅 및 아이콘 import로 교체
import { useRouter, useLocalSearchParams } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL!;

export default function ClothingDetailScreen() {
  // 2️⃣ router 및 파라미터 파싱 처리
  const router = useRouter();
  const params = useLocalSearchParams();

  let item: any = {};
  try {
    if (params.item) {
      item = JSON.parse(params.item as string);
    }
  } catch (e) {
    console.log('데이터 파싱 에러', e);
  }

  const [showEditModal, setShowEditModal] = useState(false);

  const getClothingType = (category: string) => {
    if (['반팔 티셔츠', '긴팔 티셔츠', '셔츠/블라우스', '니트/스웨터', '맨투맨/후드', '슬리브리스'].includes(category)) return '상의';
    if (['데님 팬츠', '슬랙스', '반바지', '트레이닝 팬츠', '스커트'].includes(category)) return '하의';
    if (category === '원피스') return '원피스';
    if (['코트', '패딩', '자켓', '가디건', '집업'].includes(category)) return '아우터';
    if (['운동화/스니커즈', '구두/로퍼', '힐', '부츠', '샌들/슬리퍼'].includes(category)) return '신발';
    if (['백팩', '숄더백/토트백', '크로스백', '클러치'].includes(category)) return '가방';
    if (['모자', '머플러/스카프', '벨트', '안경/선글라스', '주얼리'].includes(category)) return '액세서리';
    return '-';
  };

  const categoryMap = {
    상의: ['반팔 티셔츠', '긴팔 티셔츠', '셔츠/블라우스', '니트/스웨터', '맨투맨/후드', '슬리브리스'],
    하의: ['데님 팬츠', '슬랙스', '반바지', '트레이닝 팬츠', '스커트'],
    원피: ['원피스'],
    아우터: ['코트', '패딩', '자켓', '가디건', '집업'],
    신발: ['운동화/스니커즈', '구두/로퍼', '힐', '부츠', '샌들/슬리퍼'],
    가방: ['백팩', '숄더백/토트백', '크로스백', '클러치'],
    액세서리: ['모자', '머플러/스카프', '벨트', '안경/선글라스', '주얼리'],
  };

  const [editType, setEditType] = useState(getClothingType(item.category || ''));
  const [editCategory, setEditCategory] = useState(item.category || '');
  const [editStyle, setEditStyle] = useState(item.style || '');
  const [editColor, setEditColor] = useState(item.color || '');

  // 3️⃣ navigation.goBack() ➡️ router.back()으로 모두 변경
  async function updateClothingName(newName: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/closet/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: item.category,
          style: item.style,
          color: item.color,
          name: newName,
        }),
      });

      if (!response.ok) throw new Error();
      Alert.alert('완료', '이름이 수정되었습니다.');
      router.back();
    } catch {
      Alert.alert('오류', '수정 실패');
    }
  }

  async function updateClothingInfo() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/closet/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: editCategory,
          style: editStyle,
          color: editColor,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      Alert.alert('수정 완료', '정보가 저장되었습니다.');
      setShowEditModal(false);
      router.back();
    } catch (error: any) {
      console.log(error);
      Alert.alert('오류', String(error));
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={26} color="#111111" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>옷 상세 정보</Text>

        <TouchableOpacity
          style={styles.trashButton}
          onPress={() =>
            Alert.alert('옷 삭제', '이 옷을 삭제할까요?', [
              { text: '취소', style: 'cancel' },
              {
                text: '삭제',
                style: 'destructive',
                onPress: async () => {
                  try {
                    await fetch(`${API_BASE_URL}/api/closet/${item.id}`, { method: 'DELETE' });
                    Alert.alert('삭제 완료');
                    router.back();
                  } catch (error) {
                    Alert.alert('오류', '삭제 실패');
                  }
                },
              },
            ])
          }>
          <Ionicons name="trash-outline" size={23} color="#FF5C8A" />
        </TouchableOpacity>
      </View>

      <Image source={{ uri: item.imageUrl || item.image }} style={styles.image} resizeMode="contain" />

      <View style={styles.nameRow}>
        <Text style={styles.name}>
          {item.name?.trim() ? item.name : `${item.color} ${item.category}`}
        </Text>

        <TouchableOpacity
          style={styles.pencilButton}
          onPress={() =>
            Alert.prompt(
              '의류 이름 수정',
              '',
              text => {
                if (!text?.trim()) return;
                updateClothingName(text.trim());
              },
              'plain-text',
              item.name || '',
            )
          }>
          <Ionicons name="pencil" size={21} color="#FF5C8A" />
        </TouchableOpacity>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.label}>의류 유형</Text>
        <Text style={styles.value}>{getClothingType(item.category)}</Text>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.label}>카테고리</Text>
        <Text style={styles.value}>{item.category}</Text>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.label}>스타일</Text>
        <Text style={styles.value}>{item.style}</Text>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.label}>색상</Text>
        <Text style={styles.value}>{item.color}</Text>
      </View>

      <TouchableOpacity style={styles.editButton} onPress={() => setShowEditModal(true)}>
        <Text style={styles.editButtonText}>정보 수정</Text>
      </TouchableOpacity>

      <Modal visible={showEditModal} transparent animationType="slide">
        <TouchableOpacity activeOpacity={1} style={styles.modalOverlay} onPress={() => setShowEditModal(false)}>
          <TouchableOpacity activeOpacity={1} style={styles.modalContent} onPress={() => {}}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>정보 수정</Text>
              <TouchableOpacity onPress={() => setShowEditModal(false)}>
                <Ionicons name="close" size={24} color="#111111" />
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>의류 유형</Text>
            <TouchableOpacity
              style={styles.selectBox}
              onPress={() =>
                Alert.alert('의류 유형 선택', '', [
                  { text: '상의', onPress: () => { setEditType('상의'); setEditCategory('반팔 티셔츠'); } },
                  { text: '하의', onPress: () => { setEditType('하의'); setEditCategory('데님 팬츠'); } },
                  { text: '원피스', onPress: () => { setEditType('원피스'); setEditCategory('원피스'); } },
                  { text: '아우터', onPress: () => { setEditType('아우터'); setEditCategory('코트'); } },
                  { text: '신발', onPress: () => { setEditType('신발'); setEditCategory('운동화/스니커즈'); } },
                  { text: '가방', onPress: () => { setEditType('가방'); setEditCategory('백팩'); } },
                  { text: '액세서리', onPress: () => { setEditType('액세서리'); setEditCategory('모자'); } },
                  { text: '취소', style: 'cancel' },
                ])
              }>
              <Text style={styles.selectText}>{editType}</Text>
              <Ionicons name="chevron-forward" size={18} color="#999999" />
            </TouchableOpacity>

            <Text style={styles.inputLabel}>카테고리</Text>
            <TouchableOpacity
              style={styles.selectBox}
              onPress={() =>
                Alert.alert('카테고리 선택', '', [
                  ...categoryMap[editType as keyof typeof categoryMap].map(category => ({
                    text: category,
                    onPress: () => setEditCategory(category),
                  })),
                  { text: '취소', style: 'cancel' },
                ])
              }>
              <Text style={styles.selectText}>{editCategory}</Text>
              <Ionicons name="chevron-forward" size={18} color="#999999" />
            </TouchableOpacity>

            <Text style={styles.inputLabel}>스타일</Text>
            <TouchableOpacity
              style={styles.selectBox}
              onPress={() =>
                Alert.alert('스타일 선택', '', [
                  { text: '미니멀', onPress: () => setEditStyle('미니멀') },
                  { text: '캐주얼', onPress: () => setEditStyle('캐주얼') },
                  { text: '페미닌', onPress: () => setEditStyle('페미닌') },
                  { text: '비즈니스룩', onPress: () => setEditStyle('비즈니스룩') },
                  { text: '빈티지', onPress: () => setEditStyle('빈티지') },
                  { text: '취소', style: 'cancel' },
                ])
              }>
              <Text style={styles.selectText}>{editStyle}</Text>
              <Ionicons name="chevron-forward" size={18} color="#999999" />
            </TouchableOpacity>

            <Text style={styles.inputLabel}>색상</Text>
            <TouchableOpacity
              style={styles.selectBox}
              onPress={() =>
                Alert.alert('색상 선택', '', [
                  { text: '블랙', onPress: () => setEditColor('블랙') },
                  { text: '화이트', onPress: () => setEditColor('화이트') },
                  { text: '그레이', onPress: () => setEditColor('그레이') },
                  { text: '베이지/브라운', onPress: () => setEditColor('베이지/브라운') },
                  { text: '네이비/블루', onPress: () => setEditColor('네이비/블루') },
                  { text: '데님', onPress: () => setEditColor('데님') },
                  { text: '레드/핑크', onPress: () => setEditColor('레드/핑크') },
                  { text: '그린/카키', onPress: () => setEditColor('그린/카키') },
                  { text: '보라', onPress: () => setEditColor('보라') },
                  { text: '민트', onPress: () => setEditColor('민트') },
                  { text: '오렌지', onPress: () => setEditColor('오렌지') },
                  { text: '옐로우', onPress: () => setEditColor('옐로우') },
                  { text: '취소', style: 'cancel' },
                ])
              }>
              <Text style={styles.selectText}>{editColor}</Text>
              <Ionicons name="chevron-forward" size={18} color="#999999" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.saveButton} onPress={updateClothingInfo}>
              <Text style={styles.saveButtonText}>저장</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF', padding: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, marginTop: 6, marginHorizontal: 10 },
  backButton: { marginTop: 2 },
  trashButton: { marginTop: 4 },
  headerTitle: { fontSize: 19, fontWeight: '700', color: '#111111', marginTop: 4 },
  image: { width: '80%', aspectRatio: 1, borderRadius: 20, backgroundColor: '#F7F7F7', marginBottom: 20, marginHorizontal: '10%' },
  name: { fontSize: 24, fontWeight: '700', color: '#111111', alignSelf: 'center', marginTop: 2, marginBottom: 20, marginHorizontal: 20 },
  infoCard: { backgroundColor: '#FFF3F7', borderRadius: 16, padding: 12, marginBottom: 12, marginHorizontal: 20 },
  label: { fontSize: 12, color: '#777777', marginBottom: 4, paddingHorizontal: 2 },
  value: { fontSize: 16, fontWeight: '600', color: '#111111', paddingHorizontal: 4 },
  editButton: { marginTop: 5, marginHorizontal: 20, height: 52, borderRadius: 20, backgroundColor: '#FF5C8A', justifyContent: 'center', alignItems: 'center' },
  editButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20 },
  modalTitle: { fontSize: 18, fontWeight: '800', marginTop: 2 },
  selectBox: { backgroundColor: '#F8F8F8', borderRadius: 18, minHeight: 50, paddingHorizontal: 18, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  selectText: { fontSize: 16, fontWeight: '500', color: '#111111' },
  saveButton: { backgroundColor: '#FF5C8A', height: 50, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginTop: 6 },
  saveButtonText: { color: '#FFFFFF', fontWeight: '700', fontSize: 16, marginBottom: 1 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  inputLabel: { fontSize: 14, fontWeight: '500', color: '#555555', marginBottom: 8, marginTop: 6, marginHorizontal: 5 },
  nameRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 2, gap: 8 },
  pencilButton: { marginLeft: -15, marginBottom: 16 },
});