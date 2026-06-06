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
  Pressable,
} from 'react-native';

import {
  useNavigation,
  NavigationProp,
} from '@react-navigation/native';

import AsyncStorage from '@react-native-async-storage/async-storage';

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

        <Pressable
          style={styles.overlay}
          onPress={onClose}>

          <Pressable
            style={styles.container}
            onPress={() => {}}>
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
                  resizeMode="contain"
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
                  onPress={async () => {
                    await AsyncStorage.setItem(
                      'PENDING_PROMPT',
                      `${item.name} (${item.tags?.join(', ')})으로 다른 코디 추천해줘`,
                    );

                    onClose();

                    navigation.goBack();
                  }}
                />

                <QuestionChip
                  text="이 아이템 빼고 다시 코디해줘"
                  onPress={async () => {
                    await AsyncStorage.setItem(
                      'PENDING_PROMPT',
                      `${item.name} (${item.tags?.join(', ')}) 빼고 다시 코디해줘`,
                    );

                    onClose();

                    navigation.goBack();
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
          </Pressable>
        </Pressable>
      </Modal>

      {/* 대체 아이템 상세 모달 */}
      <Modal
        visible={
          !!selectedSimilarItem
        }
        animationType="slide"
        transparent>

        <Pressable
          style={styles.overlay}
          onPress={() =>
            setSelectedSimilarItem(
              null,
            )
          }>

          <Pressable
            style={styles.container}
            onPress={() => {}}>

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
                activeOpacity={0.8}
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
                activeOpacity={0.8}
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

              {/* 기존 내용 그대로 */}

            </ScrollView>

            <TouchableOpacity
              activeOpacity={0.8}
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

          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
};

export default ItemDetailModal;