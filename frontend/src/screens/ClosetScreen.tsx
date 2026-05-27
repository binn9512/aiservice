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

const lookbooks = [
  {
    id: 'add',
    type: 'add',
  },

  {
    id: '1',
    title: '데이트룩',
    count: 16,
    image:
      'https://images.unsplash.com/photo-1483985988355-763728e1935b',
  },

  {
    id: '2',
    title: '봄 코디',
    count: 18,
    image:
      'https://images.unsplash.com/photo-1496747611176-843222e1e57c',
  },

  {
    id: '3',
    title: '출근룩',
    count: 12,
    image:
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f',
  },

  {
    id: '4',
    title: '데일리룩',
    count: 24,
    image:
      'https://images.unsplash.com/photo-1529139574466-a303027c1d8b',
  },
];

const ClosetScreen = () => {
  const [selectedCategory,
    setSelectedCategory] =
    useState('전체');

  const [selectedTab,
    setSelectedTab] =
    useState('옷');

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

      setClothesData([
        {
          id: 'add',
          type: 'add',
        },
        ...data,
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

          headers: {
            'Content-Type':
              'application/json',
          },

          body: JSON.stringify({
            user_id: 'user1',
            image_path: 'blouse.jpg',
          }),
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
        setClothesData(prev => [
          ...prev,
          data.item,
        ]);

        Alert.alert(
          '완료',
          '옷이 자동 분석되어 옷장에 추가되었습니다.',
        );
      }
    } catch (error: any) {
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

  const filteredData =
    selectedCategory === '전체'
      ? clothesData
      : clothesData.filter(
          item =>
            item.category ===
            selectedCategory,
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
          style={styles.itemCard}>
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

            <TouchableOpacity
              style={
                styles.iconButton
              }>
              <Ionicons
                name="options-outline"
                size={24}
                color="#111111"
              />
            </TouchableOpacity>
          </View>
        </View>

        <View
          style={
            styles.topTabContainer
          }>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() =>
              setSelectedTab(
                '옷',
              )
            }
            style={
              styles.topTabButton
            }>
            <Text
              style={[
                styles.topTabText,
                selectedTab ===
                  '옷' &&
                  styles.activeTopTabText,
              ]}>
              옷
            </Text>

            {selectedTab ===
              '옷' && (
              <View
                style={
                  styles.activeLine
                }
              />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() =>
              setSelectedTab(
                '룩북',
              )
            }
            style={
              styles.topTabButton
            }>
            <Text
              style={[
                styles.topTabText,
                selectedTab ===
                  '룩북' &&
                  styles.activeTopTabText,
              ]}>
              룩북
            </Text>

            {selectedTab ===
              '룩북' && (
              <View
                style={
                  styles.activeLine
                }
              />
            )}
          </TouchableOpacity>
        </View>

        {selectedTab === '옷' ? (
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
                data={filteredData}
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
        ) : (
          <View
            style={
              styles.lookbookContainer
            }>
            <View
              style={
                styles.lookbookGrid
              }>
              {lookbooks.map(
                item => {
                  if (
                    item.type ===
                    'add'
                  ) {
                    return (
                      <TouchableOpacity
                        key={
                          item.id
                        }
                        style={
                          styles.lookbookAddCard
                        }>
                        <Ionicons
                          name="add"
                          size={40}
                          color="#FF5C8A"
                        />

                        <Text
                          style={
                            styles.lookbookAddText
                          }>
                          새 룩북 만들기
                        </Text>
                      </TouchableOpacity>
                    );
                  }

                  return (
                    <TouchableOpacity
                      key={item.id}
                      style={
                        styles.lookbookCard
                      }>
                      <Image
                        source={{
                          uri:
                            item.image,
                        }}
                        style={
                          styles.lookbookImage
                        }
                      />

                      <View
                        style={
                          styles.lookbookInfo
                        }>
                        <Text
                          style={
                            styles.lookbookTitle
                          }>
                          {
                            item.title
                          }
                        </Text>

                        <Text
                          style={
                            styles.lookbookCount
                          }>
                          {
                            item.count
                          }
                          개
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                },
              )}
            </View>
          </View>
        )}
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

  topTabContainer: {
    flexDirection: 'row',

    marginBottom: 24,

    borderBottomWidth: 1,
    borderBottomColor:
      '#F1F1F1',
  },

  topTabButton: {
    flex: 1,

    alignItems: 'center',
    justifyContent:
      'center',

    paddingBottom: 12,

    position: 'relative',
  },

  topTabText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#999999',
  },

  activeTopTabText: {
    color: '#FF5C8A',
    fontWeight: '700',
  },

  activeLine: {
    position: 'absolute',
    bottom: 0,

    left: 0,
    right: 0,

    height: 2,

    backgroundColor:
      '#FF5C8A',
  },

  summaryCard: {
    marginHorizontal: 20,
    marginBottom: 20,

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
      'space-between',

    marginBottom: 10,
  },

  itemCard: {
    width: '31%',

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

  lookbookContainer: {
    paddingHorizontal: 20,
    paddingBottom: 120,
  },

  lookbookGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent:
      'space-between',
  },

  lookbookAddCard: {
    width: '48%',
    aspectRatio: 1,

    borderRadius: 18,

    borderWidth: 1.5,

    borderStyle: 'dashed',

    borderColor:
      '#FFB7CB',

    backgroundColor:
      '#FFF8FA',

    justifyContent:
      'center',

    alignItems: 'center',

    marginBottom: 18,
  },

  lookbookAddText: {
    marginTop: 10,

    fontSize: 14,
    fontWeight: '600',

    color: '#FF5C8A',
  },

  lookbookCard: {
    width: '48%',
    aspectRatio: 1,

    borderRadius: 20,

    backgroundColor:
      '#FFFFFF',

    overflow: 'hidden',

    marginBottom: 18,

    borderWidth: 1,

    borderColor:
      '#F3F3F3',
  },

  lookbookImage: {
    width: '100%',
    height: '70%',
  },

  lookbookInfo: {
    flex: 1,

    paddingHorizontal: 14,

    paddingTop: 12,

    paddingBottom: 12,

    justifyContent:
      'center',
  },

  lookbookTitle: {
    fontSize: 15,
    fontWeight: '700',

    color: '#111111',

    marginTop: 4,
    marginBottom: 4,
  },

  lookbookCount: {
    fontSize: 13,
    color: '#999999',
  },
});