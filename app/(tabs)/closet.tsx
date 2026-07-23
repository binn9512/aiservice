import React, { useEffect, useState, useCallback } from 'react';

import * as ImagePicker from 'expo-image-picker';

import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  Image,
  ScrollView,
  Alert,
  TextInput,
} from 'react-native';

// 1️⃣ expo-router에서 라우팅과 FocusEffect 훅 가져오기
import { useRouter, useFocusEffect } from 'expo-router';

// 2️⃣ 엑스포 내장 아이콘 사용
import Ionicons from '@expo/vector-icons/Ionicons';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL!;

const categories = [
  '전체',
  '상의',
  '하의',
  '원피스',
  '아우터',
  '신발',
  '가방',
];

const ClosetScreen = () => {
  // 3️⃣ navigation 대신 router 사용
  const router = useRouter();

  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [isSearching, setIsSearching] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [sortOrder, setSortOrder] = useState('latest');

  const [clothesData, setClothesData] = useState<any[]>([
    { id: 'add', type: 'add' },
  ]);

  const [isUploading, setIsUploading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadClosetItems();
    }, [])
  );

  async function loadClosetItems() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/closet`);
      const data = await response.json();

      console.log("📥 백엔드에서 받은 실제 데이터:", data); // 터미널/로그로 형태 확인용

      // 1. data가 배열인 경우 (백엔드가 [ {...}, {...} ] 로 준 경우)
      if (Array.isArray(data)) {
        const sortedData = [...data].sort((a, b) => b.id - a.id);
        setClothesData([{ id: 'add', type: 'add' }, ...sortedData]);
      }
      // 2. data가 객체 안의 배열인 경우 (예: { success: true, result: [...] })
      else if (data && Array.isArray(data.result)) {
        const sortedData = [...data.result].sort((a, b) => b.id - a.id);
        setClothesData([{ id: 'add', type: 'add' }, ...sortedData]);
      }
      // 3. 백엔드에서 에러 메시지나 예상치 못한 형태로 온 경우
      else {
        console.warn("⚠️ 백엔드 응답이 배열 형태가 아닙니다:", data);
        setClothesData([{ id: 'add', type: 'add' }]); // 기본 추가 버튼만 유지
      }
    } catch (error) {
      console.log('옷장 데이터 불러오기 실패:', error);
    }
  }

  async function pickImageFromLibrary() {
    // 권한 요청 (Expo 필수)
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert('권한 필요', '사진첩 접근 권한이 필요합니다.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 1,
    });

    if (!result.canceled) {
      uploadImage(result.assets[0]);
    }
  }

  async function uploadImage(asset: any) {
    try {
      setIsUploading(true);

      // 파일 정보 추출
      const filename = asset.uri.split('/').pop();
      const match = /\.(\w+)$/.exec(filename || '');
      const type = match ? `image/${match[1]}` : `image/jpeg`;

      const formData = new FormData();
      // Expo 환경에 최적화된 FormData 구성
      formData.append('photo', {
        uri: asset.uri,
        name: filename,
        type: type,
      } as any);
      formData.append('user_id', 'user1');

      const response = await fetch(`${API_BASE_URL}/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || '업로드 실패');

      if (data.success) {
        await loadClosetItems();
        Alert.alert('완료', '옷이 추가되었습니다.');
      }
    } catch (error: any) {
      Alert.alert('오류', String(error.message));
    } finally {
      setIsUploading(false);
    }
  }

  async function deleteClothes(itemId: number) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/closet/${itemId}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('삭제 실패');
      await loadClosetItems();
      Alert.alert('삭제 완료', '옷이 삭제되었습니다.');
    } catch (error) {
      console.log(error);
      Alert.alert('오류', '삭제에 실패했습니다.');
    }
  }

  const filteredData =
    selectedCategory === '전체'
      ? clothesData
      : clothesData.filter(item => {
        if (item.type === 'add') return true;
        if (selectedCategory === '상의') return ['반팔 티셔츠', '긴팔 티셔츠', '셔츠/블라우스', '니트/스웨터', '맨투맨/후드', '슬리브리스'].includes(item.category);
        if (selectedCategory === '하의') return ['데님 팬츠', '슬랙스', '반바지', '트레이닝 팬츠', '스커트'].includes(item.category);
        if (selectedCategory === '원피스') return ['원피스'].includes(item.category);
        if (selectedCategory === '아우터') return ['코트', '패딩', '자켓', '가디건', '집업'].includes(item.category);
        if (selectedCategory === '신발') return ['운동화/스니커즈', '구두/로퍼', '힐', '부츠', '샌들/슬리퍼'].includes(item.category);
        if (selectedCategory === '가방') return ['백팩', '숄더백/토트백', '크로스백', '클러치'].includes(item.category);
        return false;
      });

  const searchedData = filteredData.filter(item => {
    if (item.type === 'add') return true;
    const keyword = searchText.toLowerCase();
    return (
      item.name?.toLowerCase().includes(keyword) ||
      item.category?.toLowerCase().includes(keyword) ||
      item.style?.toLowerCase().includes(keyword) ||
      item.color?.toLowerCase().includes(keyword)
    );
  });

  const sortedData = [...searchedData].sort((a, b) => {
    if (a.type === 'add') return -1;
    if (b.type === 'add') return 1;
    if (sortOrder === 'latest') return b.id - a.id;
    return a.id - b.id;
  });

  const latestItem = clothesData
    .filter(item => item.type !== 'add' && item.analyzed_at)
    .sort((a, b) => new Date(b.analyzed_at).getTime() - new Date(a.analyzed_at).getTime())[0];

  const latestUpdateText = latestItem?.analyzed_at ? latestItem.analyzed_at.split(' ')[0].replaceAll('-', '.') : '-';

  const renderClothingItem = ({ item }: any) => {
    if (item.type === 'add') {
      return (
        <TouchableOpacity activeOpacity={0.8} style={styles.addButton} onPress={pickImageFromLibrary}>
          <Ionicons name="add" size={34} color="#FF5C8A" />
          <Text style={styles.addText}>{isUploading ? '분석 중...' : '사진 추가'}</Text>
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity
        activeOpacity={0.8}
        style={styles.itemCard}
        onPress={() => {
          // 4️⃣ 화면 이동 시 객체 데이터를 JSON 문자열로 변환하여 전달
          router.push({
            pathname: '/clothing-detail',
            params: { item: JSON.stringify(item) },
          });
        }}>
        <Image source={{ uri: item.imageUrl || item.image }} style={styles.itemImage} resizeMode="contain" />
        {isEditMode && (
          <TouchableOpacity
            style={styles.deleteBadge}
            onPress={() =>
              Alert.alert('옷 삭제', '이 옷을 삭제할까요?', [
                { text: '취소', style: 'cancel' },
                { text: '삭제', style: 'destructive', onPress: () => deleteClothes(item.id) },
              ])
            }>
            <Ionicons name="close" size={14} color="#FFFFFF" />
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          {isSearching ? (
            <TextInput
              style={styles.searchHeaderInput}
              placeholder="옷의 이름, 색상, 스타일, 카테고리로 검색"
              value={searchText}
              onChangeText={setSearchText}
              autoFocus
            />
          ) : (
            <Text style={styles.headerTitle}>내 옷장</Text>
          )}

          <View style={styles.headerIcons}>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => {
                setIsSearching(!isSearching);
                if (isSearching) setSearchText('');
              }}>
              <Ionicons name={isSearching ? 'close' : 'search-outline'} size={24} color="#111111" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.iconButton} onPress={() => setIsEditMode(!isEditMode)}>
              <Ionicons name="trash-outline" size={24} color={isEditMode ? '#FF5C8A' : '#111111'} />
            </TouchableOpacity>
          </View>
        </View>

        <>
          <View style={styles.summaryCard}>
            <View style={styles.summaryIcon}>
              <Ionicons name="shirt-outline" size={34} color="#FF5C8A" />
            </View>
            <View style={styles.summaryContent}>
              <Text style={styles.summaryTitle}>AI가 분석한 내 옷</Text>
              <View style={styles.countRow}>
                <Text style={styles.countText}>{clothesData.filter(item => item.type !== 'add').length}</Text>
                <Text style={styles.countLabel}>개</Text>
              </View>
              <Text style={styles.updateText}>최근 업데이트: {` ${latestUpdateText}`}</Text>
            </View>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryContainer}>
            {categories.map(category => {
              const isSelected = selectedCategory === category;
              return (
                <TouchableOpacity
                  key={category}
                  activeOpacity={0.8}
                  onPress={() => setSelectedCategory(category)}
                  style={[styles.categoryChip, isSelected && styles.selectedChip]}>
                  <Text style={[styles.categoryText, isSelected && styles.selectedCategoryText]}>{category}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <View style={styles.sortRow}>
            <Text style={styles.totalText}>전체 {clothesData.filter(item => item.type !== 'add').length}개</Text>
            <TouchableOpacity
              onPress={() =>
                Alert.alert('정렬', '정렬 방식을 선택하세요', [
                  { text: '최신순', onPress: () => setSortOrder('latest') },
                  { text: '오래된순', onPress: () => setSortOrder('oldest') },
                  { text: '취소', style: 'cancel' },
                ])
              }>
              <Text style={styles.sortText}>{sortOrder === 'latest' ? '최신순' : '오래된순'} ▼</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.gridContainer}>
            <FlatList
              data={sortedData}
              renderItem={renderClothingItem}
              keyExtractor={item => item.id.toString()}
              numColumns={3}
              scrollEnabled={false}
              columnWrapperStyle={styles.columnWrapper}
            />
          </View>
        </>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ClosetScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { fontSize: 24, fontWeight: '700', color: '#111111' },
  headerIcons: { flexDirection: 'row', alignItems: 'center' },
  iconButton: { marginLeft: 12, marginRight: 8 },
  summaryCard: { marginHorizontal: 20, marginBottom: 20, marginTop: 5, backgroundColor: '#FFF3F7', borderRadius: 20, padding: 16, flexDirection: 'row', alignItems: 'center' },
  summaryIcon: { width: 64, height: 64, borderRadius: 18, backgroundColor: '#FFE3EE', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  summaryContent: { flex: 1, justifyContent: 'center' },
  summaryTitle: { fontSize: 14, fontWeight: '600', color: '#444', marginBottom: 2 },
  countRow: { flexDirection: 'row', alignItems: 'flex-end', marginTop: 2, marginBottom: 2 },
  countText: { fontSize: 34, fontWeight: '700', color: '#FF5C8A', lineHeight: 36 },
  countLabel: { fontSize: 16, fontWeight: '600', color: '#FF5C8A', marginLeft: 4, marginBottom: 8 },
  updateText: { fontSize: 12, color: '#777777' },
  categoryContainer: { paddingLeft: 20, paddingRight: 8, marginBottom: 15 },
  categoryChip: { backgroundColor: '#F3F3F3', paddingHorizontal: 16, paddingVertical: 9, borderRadius: 999, marginRight: 10 },
  selectedChip: { backgroundColor: '#FF5C8A' },
  categoryText: { fontSize: 13, fontWeight: '600', color: '#555555' },
  selectedCategoryText: { color: '#FFFFFF' },
  gridContainer: { paddingHorizontal: 20, paddingBottom: 120 },
  columnWrapper: { justifyContent: 'flex-start', marginBottom: 10 },
  itemCard: { width: '31%', marginRight: 10, aspectRatio: 1, borderRadius: 14, backgroundColor: '#F7F7F7', overflow: 'hidden' },
  itemImage: { width: '100%', height: '100%' },
  addButton: { width: '31%', marginRight: 10, aspectRatio: 1, borderRadius: 18, borderWidth: 1.5, borderStyle: 'dashed', borderColor: '#FFB7CB', justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFF8FA' },
  addText: { marginTop: 8, fontSize: 13, fontWeight: '600', color: '#FF5C8A' },
  sortRow: { marginHorizontal: 20, marginBottom: 15, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalText: { fontSize: 13, fontWeight: '500', color: '#777777' },
  sortText: { fontSize: 13, fontWeight: '600', color: '#444444' },
  deleteButton: { backgroundColor: '#FFE3EE', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999 },
  deleteButtonText: { color: '#FF5C8A', fontSize: 13, fontWeight: '700' },
  deleteBadge: { position: 'absolute', top: 6, right: 6, width: 22, height: 22, borderRadius: 11, backgroundColor: '#FF5C8A', justifyContent: 'center', alignItems: 'center', zIndex: 999 },
  searchHeaderInput: { flex: 1, fontSize: 15, fontWeight: '700', color: '#111111', marginRight: 10 },
});