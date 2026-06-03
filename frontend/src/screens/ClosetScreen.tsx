import React, {
  useEffect,
  useState,
} from 'react';

import {
  launchImageLibrary,
} from 'react-native-image-picker';

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
} from 'react-native';

import Ionicons
from 'react-native-vector-icons/Ionicons';

const API_BASE_URL =
  'http://127.0.0.1:5001';

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
  const [selectedCategory,
    setSelectedCategory] =
    useState('전체');

  const [sortOrder,
  setSortOrder] =
  useState('latest');

  const [clothesData,
    setClothesData] =
    useState<any[]>([
      {
        id: 'add',
        type: 'add',
      },
    ]);

  const [isUploading,
    setIsUploading] =
    useState(false);

  useEffect(() => {
    loadClosetItems();
  }, []);

  async function loadClosetItems() {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/closet`,
      );

      const data =
        await response.json();

      const sortedData = [...data].sort(
        (a, b) => b.id - a.id,
      );

      setClothesData([
        {
          id: 'add',
          type: 'add',
        },
        ...sortedData,
      ]);
    } catch (error) {
      console.log(
        '옷장 데이터 불러오기 실패:',
        error,
      );
    }
  }

  async function pickImageFromLibrary() {
    launchImageLibrary(
      {
        mediaType: 'photo',
        quality: 1,
      },
      response => {
        if (response.didCancel) {
          return;
        }

        if (response.errorCode) {
          Alert.alert(
            '오류',
            '이미지를 불러올 수 없습니다.',
          );

          return;
        }

        if (
          response.assets &&
          response.assets.length > 0
        ) {
          uploadImage(
            response.assets[0],
          );
        }
      },
    );
  }

  async function uploadImage(
    asset: any,
  ) {
    try {
      setIsUploading(true);

      const uriParts =
        asset.uri.split('.');

      const fileType =
        uriParts[
          uriParts.length - 1
        ] || 'jpg';

      const formData =
        new FormData();

      formData.append('photo', {
        uri: asset.uri,
        name: `clothes.${fileType}`,
        type: `image/${fileType}`,
      } as any);

      formData.append(
        'user_id',
        'user1',
      );

      const response = await fetch(
        `${API_BASE_URL}/analyze`,
        {
          method: 'POST',
          body: formData,
        },
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            data.message ||
            '업로드 실패',
        );
      }

      if (data.success) {
        await loadClosetItems();
      }

        Alert.alert(
          '완료',
          '옷이 자동 분석되어 옷장에 추가되었습니다.',
        );
    }
    catch (error: any) {
      console.log(
        '사진 업로드 실패:',
        error,
      );

      Alert.alert(
        '오류',
        String(error.message || error),
      );
    } finally {
      setIsUploading(false);
    }
  }

  async function deleteClothes(
  itemId: number,
) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/closet/${itemId}`,
      {
        method: 'DELETE',
      },
    );

    if (!response.ok) {
      throw new Error(
        '삭제 실패',
      );
    }

    await loadClosetItems();

    Alert.alert(
      '삭제 완료',
      '옷이 삭제되었습니다.',
    );
  } catch (error) {
    console.log(error);

    Alert.alert(
      '오류',
      '삭제에 실패했습니다.',
    );
  }
}

  const filteredData =
  selectedCategory === '전체'
    ? clothesData
    : clothesData.filter(item => {
        if (item.type === 'add') {
          return true;
        }

        if (selectedCategory === '상의') {
          return [
            '반팔 티셔츠',
            '긴팔 티셔츠',
            '셔츠/블라우스',
            '니트/스웨터',
            '맨투맨/후드',
            '슬리브리스',
          ].includes(item.category);
        }

        if (selectedCategory === '하의') {
          return [
            '데님 팬츠',
            '슬랙스',
            '반바지',
            '트레이닝 팬츠',
            '스커트',
          ].includes(item.category);
        }

        if (selectedCategory === '원피스') {
          return [
            '원피스',
          ].includes(item.category);
        }

        if (selectedCategory === '아우터') {
          return [
            '코트',
            '패딩',
            '자켓',
            '가디건',
            '집업',
          ].includes(item.category);
        }

        if (selectedCategory === '신발') {
          return [
            '운동화/스니커즈',
            '구두/로퍼',
            '힐',
            '부츠',
            '샌들/슬리퍼',
          ].includes(item.category);
        }

        if (selectedCategory === '가방') {
          return [
            '백팩',
            '숄더백/토트백',
            '크로스백',
            '클러치',
          ].includes(item.category);
        }

        return false;
      });

      const sortedData =
        [...filteredData].sort(
          (a, b) => {
            if (
              a.type === 'add'
            )
              return -1;

            if (
              b.type === 'add'
            )
              return 1;

            if (
              sortOrder ===
              'latest'
            ) {
              return (
                b.id - a.id
              );
            }

            return (
              a.id - b.id
            );
          },
        );

  const renderClothingItem =
    ({item}: any) => {
      if (item.type === 'add') {
        return (
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.addButton}
            onPress={
              pickImageFromLibrary
            }>
            <Ionicons
              name="add"
              size={34}
              color="#FF5C8A"
            />

            <Text
              style={styles.addText}>
              {isUploading
                ? '분석 중...'
                : '사진 추가'}
            </Text>
          </TouchableOpacity>
        );
      }

      return (
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.itemCard}
          onLongPress={() =>
            Alert.alert(
              '옷 삭제',
              '이 옷을 삭제할까요?',
              [
                {
                  text: '취소',
                  style: 'cancel',
                },
                {
                  text: '삭제',
                  style: 'destructive',
                  onPress: () =>
                    deleteClothes(item.id),
                },
              ],
            )
          }>
          <Image
            source={{
              uri:
                item.imageUrl ||
                item.image,
            }}
            style={styles.itemImage}
          />
        </TouchableOpacity>
      );
    };

  return (
    <SafeAreaView
      style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={
          false
        }>
        <View style={styles.header}>
          <Text
            style={
              styles.headerTitle
            }>
            내 옷장
          </Text>

            <View
              style={
                styles.headerIcons
              }>
              
              {/* 검색 */}
              <TouchableOpacity
                style={
                  styles.iconButton
                }>
                <Ionicons
                  name="search-outline"
                  size={24}
                  color="#111111"
                />
              </TouchableOpacity>

              {/* 정렬 */}
              <TouchableOpacity
                style={
                  styles.iconButton
                }
                onPress={() =>
                  Alert.alert(
                    '정렬',
                    '정렬 방식을 선택하세요',
                    [
                      {
                        text: '최신순',
                        onPress: () =>
                          setSortOrder(
                            'latest',
                          ),
                      },
                      {
                        text: '오래된순',
                        onPress: () =>
                          setSortOrder(
                            'oldest',
                          ),
                      },
                      {
                        text: '취소',
                        style: 'cancel',
                      },
                    ],
                  )
                }>
                <Ionicons
                  name="options-outline"
                  size={24}
                  color="#111111"
                />
              </TouchableOpacity>

</View>
          </View>
          <>
            <View
              style={
                styles.summaryCard
              }>
              <View
                style={
                  styles.summaryIcon
                }>
                <Ionicons
                  name="shirt-outline"
                  size={34}
                  color="#FF5C8A"
                />
              </View>

              <View
                style={
                  styles.summaryContent
                }>
                <Text
                  style={
                    styles.summaryTitle
                  }>
                  AI가 인식한 내 옷
                </Text>

                <View
                  style={
                    styles.countRow
                  }>
                  <Text
                    style={
                      styles.countText
                    }>
                    {
                      clothesData.filter(
                        item =>
                          item.type !==
                          'add',
                      ).length
                    }
                  </Text>

                  <Text
                    style={
                      styles.countLabel
                    }>
                    개
                  </Text>
                </View>

                <Text
                  style={
                    styles.updateText
                  }>
                  최근 업데이트:
                  방금 전
                </Text>
              </View>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={
                false
              }
              contentContainerStyle={
                styles.categoryContainer
              }>
              {categories.map(
                category => {
                  const isSelected =
                    selectedCategory ===
                    category;

                  return (
                    <TouchableOpacity
                      key={category}
                      activeOpacity={
                        0.8
                      }
                      onPress={() =>
                        setSelectedCategory(
                          category,
                        )
                      }
                      style={[
                        styles.categoryChip,
                        isSelected &&
                          styles.selectedChip,
                      ]}>
                      <Text
                        style={[
                          styles.categoryText,
                          isSelected &&
                            styles.selectedCategoryText,
                        ]}>
                        {category}
                      </Text>
                    </TouchableOpacity>
                  );
                },
              )}
            </ScrollView>

            <View
              style={
                styles.gridContainer
              }>
              <FlatList
                data={sortedData}
                renderItem={
                  renderClothingItem
                }
                keyExtractor={item =>
                  item.id.toString()
                }
                numColumns={3}
                scrollEnabled={false}
                columnWrapperStyle={
                  styles.columnWrapper
                }
              />
            </View>
          </>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ClosetScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor:
      '#FFFFFF',
  },

  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 12,

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

  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  iconButton: {
    marginLeft: 14,
  },

  summaryCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    marginTop: 5,

    backgroundColor:
      '#FFF3F7',

    borderRadius: 20,

    padding: 16,

    flexDirection: 'row',
    alignItems: 'center',
  },

  summaryIcon: {
    width: 64,
    height: 64,

    borderRadius: 18,

    backgroundColor:
      '#FFE3EE',

    justifyContent:
      'center',

    alignItems: 'center',

    marginRight: 16,
  },

  summaryContent: {
    flex: 1,
    justifyContent:
      'center',
  },

  summaryTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#444',
    marginBottom: 2,
  },

  countRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',

    marginTop: 2,
    marginBottom: 2,
  },

  countText: {
    fontSize: 34,
    fontWeight: '700',
    color: '#FF5C8A',
    lineHeight: 36,
  },

  countLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF5C8A',

    marginLeft: 4,
    marginBottom: 8,
  },

  updateText: {
    fontSize: 12,
    color: '#777777',
  },

  categoryContainer: {
    paddingLeft: 20,
    paddingRight: 8,
    marginBottom: 22,
  },

  categoryChip: {
    backgroundColor:
      '#F3F3F3',

    paddingHorizontal: 16,
    paddingVertical: 9,

    borderRadius: 999,

    marginRight: 10,
  },

  selectedChip: {
    backgroundColor:
      '#FF5C8A',
  },

  categoryText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#555555',
  },

  selectedCategoryText: {
    color: '#FFFFFF',
  },

  gridContainer: {
    paddingHorizontal: 20,
    paddingBottom: 120,
  },

  columnWrapper: {
    justifyContent:
      'flex-start',

    marginBottom: 10,
  },

  itemCard: {
    width: '31%',

    marginRight: 10,

    aspectRatio: 1,

    borderRadius: 14,

    backgroundColor:
      '#F7F7F7',

    overflow: 'hidden',
  },

  itemImage: {
    width: '100%',
    height: '100%',
  },

  addButton: {
    width: '31%',

    marginRight: 10,
    
    aspectRatio: 1,

    borderRadius: 18,

    borderWidth: 1.5,

    borderStyle: 'dashed',

    borderColor:
      '#FFB7CB',

    justifyContent:
      'center',

    alignItems: 'center',

    backgroundColor:
      '#FFF8FA',
  },

  addText: {
    marginTop: 8,

    fontSize: 13,
    fontWeight: '600',

    color: '#FF5C8A',
  },
});