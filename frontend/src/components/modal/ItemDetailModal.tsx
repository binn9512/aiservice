import React, {
  useState,
} from 'react';

import {
  Modal,
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
} from 'react-native';

import {
  useNavigation,
  NavigationProp,
} from '@react-navigation/native';

import SimilarItemCard from './SimilarItemCard';
import QuestionChip from './QuestionChip';

import {
  OutfitItem,
} from '../../data/mockOutfits';

import styles from './itemDetail.styles';

type Props = {
  visible: boolean;
  item: OutfitItem | null;
  onClose: () => void;
};

const ItemDetailModal = ({
  visible,
  item,
  onClose,
}: Props) => {
  const navigation =
    useNavigation<
      NavigationProp<any>
    >();

  const [
    selectedSimilarItem,
    setSelectedSimilarItem,
  ] = useState<any>(null);

  if (!item) {
    return null;
  }

  const currentItem: any =
    selectedSimilarItem || item;

  const isClosetItem =
    currentItem?.type ===
    'closet';

  return (
    <>
      {/* 메인 모달 */}
      <Modal
        visible={
          visible &&
          !selectedSimilarItem
        }
        animationType="slide"
        transparent>
        <View style={styles.overlay}>
          <View style={styles.container}>
            {/* Handle */}
            <View
              style={
                styles.handleBar
              }
            />

            {/* Header */}
            <View
              style={
                styles.header
              }>
              <Text
                style={
                  styles.headerTitle
                }>
                아이템 상세
              </Text>

              <TouchableOpacity
                activeOpacity={
                  0.8
                }
                onPress={
                  onClose
                }>
                <Text
                  style={
                    styles.closeText
                  }>
                  ✕
                </Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={
                false
              }>
              {/* Main Item */}
              <View
                style={
                  styles.mainSection
                }>
                <Image
                  source={
                    typeof item?.image ===
                    'string'
                      ? {
                          uri:
                            item.image,
                        }
                      : item?.image
                  }
                  style={
                    styles.itemImage
                  }
                  resizeMode="cover"
                />

                <View
                  style={
                    styles.infoSection
                  }>
                  <Text
                    style={
                      styles.itemName
                    }>
                    {item?.name ||
                      '아이템'}
                  </Text>

                  <Text
                    style={
                      styles.itemType
                    }>
                    {isClosetItem
                      ? '내 옷장'
                      : '추천 상품'}
                  </Text>

                  {item?.tags
                    ?.length > 0 && (
                    <View
                      style={
                        styles.tagContainer
                      }>
                      {item.tags.map(
                        (
                          tag: string,
                        ) => (
                          <View
                            key={
                              tag
                            }
                            style={
                              styles.tag
                            }>
                            <Text
                              style={
                                styles.tagText
                              }>
                              #{tag}
                            </Text>
                          </View>
                        ),
                      )}
                    </View>
                  )}
                </View>
              </View>

              {/* Similar Items */}
              {item
                ?.similarItems
                ?.length > 0 && (
                <View
                  style={
                    styles.section
                  }>
                  <View
                    style={
                      styles.sectionHeader
                    }>
                    <Text
                      style={
                        styles.sectionTitle
                      }>
                      대체 아이템
                    </Text>
                  </View>

                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={
                      false
                    }>
                    {item.similarItems.map(
                      (
                        similar: any,
                      ) => (
                        <TouchableOpacity
                          key={
                            similar?.id
                          }
                          activeOpacity={
                            0.8
                          }
                          onPress={() =>
                            setSelectedSimilarItem(
                              similar,
                            )
                          }>
                          <SimilarItemCard
                            item={
                              similar
                            }
                          />
                        </TouchableOpacity>
                      ),
                    )}
                  </ScrollView>
                </View>
              )}

              {/* AI Questions */}
              <View
                style={
                  styles.section
                }>
                <Text
                  style={
                    styles.questionTitle
                  }>
                  추천 질문
                </Text>

                <QuestionChip
                  text="이 아이템으로 다른 코디 추천해줘"
                  onPress={() => {
                    onClose();

                    navigation.navigate(
                      '코디추천',
                      {
                        prompt: `${item.name} (${item.tags?.join(', ')})으로 다른 코디 추천해줘`
                      },
                    );
                  }}
                />

                <QuestionChip
                  text="이 아이템 빼고 다시 코디해줘"
                  onPress={() => {
                    onClose();

                    navigation.navigate(
                      '코디추천',
                      {
                        prompt: `${item.name} (${item.tags?.join(', ')}) 빼고 다시 코디해줘`,
                      },
                    );
                  }}
                />
              </View>
            </ScrollView>

            {/* Bottom Button */}
            <TouchableOpacity
              activeOpacity={
                0.8
              }
              style={
                styles.closeButton
              }
              onPress={
                onClose
              }>
              <Text
                style={
                  styles.closeButtonText
                }>
                닫기
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* 대체 아이템 상세 모달 */}
      <Modal
        visible={
          !!selectedSimilarItem
        }
        animationType="slide"
        transparent>
        <View style={styles.overlay}>
          <View style={styles.container}>
            {/* Handle */}
            <View
              style={
                styles.handleBar
              }
            />

            {/* Header */}
            <View
              style={
                styles.header
              }>
              <TouchableOpacity
                activeOpacity={
                  0.8
                }
                onPress={() =>
                  setSelectedSimilarItem(
                    null,
                  )
                }>
                <Text
                  style={
                    styles.closeText
                  }>
                  ‹
                </Text>
              </TouchableOpacity>

              <Text
                style={
                  styles.headerTitle
                }>
                대체 아이템 상세
              </Text>

              <TouchableOpacity
                activeOpacity={
                  0.8
                }
                onPress={() =>
                  setSelectedSimilarItem(
                    null,
                  )
                }>
                <Text
                  style={
                    styles.closeText
                  }>
                  ✕
                </Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={
                false
              }>
              {/* Main Item */}
              <View
                style={
                  styles.mainSection
                }>
                <Image
                  source={
                    typeof currentItem?.image ===
                    'string'
                      ? {
                          uri:
                            currentItem.image,
                        }
                      : currentItem?.image ||
                        item.image
                  }
                  style={
                    styles.itemImage
                  }
                  resizeMode="cover"
                />

                <View
                  style={
                    styles.infoSection
                  }>
                  <Text
                    style={
                      styles.itemName
                    }>
                    {currentItem?.name ||
                      '아이템'}
                  </Text>

                  <Text
                    style={
                      styles.itemType
                    }>
                    {currentItem?.type ===
                    'closet'
                      ? '내 옷장'
                      : '추천 상품'}
                  </Text>

                  {currentItem?.tags
                    ?.length > 0 && (
                    <View
                      style={
                        styles.tagContainer
                      }>
                      {currentItem.tags.map(
                        (
                          tag: string,
                        ) => (
                          <View
                            key={
                              tag
                            }
                            style={
                              styles.tag
                            }>
                            <Text
                              style={
                                styles.tagText
                              }>
                              #{tag}
                            </Text>
                          </View>
                        ),
                      )}
                    </View>
                  )}
                </View>
              </View>

              {/* Item Info */}
              <View
                style={
                  styles.section
                }>
                <Text
                  style={
                    styles.sectionTitle
                  }>
                  아이템 정보
                </Text>

                <View
                  style={
                    styles.infoRow
                  }>
                  <Text
                    style={
                      styles.infoLabel
                    }>
                    카테고리
                  </Text>

                  <Text
                    style={
                      styles.infoValue
                    }>
                    하의 {'>'} 팬츠
                  </Text>
                </View>

                <View
                  style={
                    styles.infoRow
                  }>
                  <Text
                    style={
                      styles.infoLabel
                    }>
                    스타일
                  </Text>

                  <Text
                    style={
                      styles.infoValue
                    }>
                    스트릿,
                    캐주얼
                  </Text>
                </View>

                <View
                  style={
                    styles.infoRow
                  }>
                  <Text
                    style={
                      styles.infoLabel
                    }>
                    색상
                  </Text>

                  <Text
                    style={
                      styles.infoValue
                    }>
                    그레이
                  </Text>
                </View>
              </View>
            </ScrollView>

            {/* Bottom Button */}
            <TouchableOpacity
              activeOpacity={
                0.8
              }
              style={
                styles.closeButton
              }
              onPress={() =>
                setSelectedSimilarItem(
                  null,
                )
              }>
              <Text
                style={
                  styles.closeButtonText
                }>
                닫기
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
};

export default ItemDetailModal;