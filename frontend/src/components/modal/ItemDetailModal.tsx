import React from 'react';

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

  if (!item) {
    return null;
  }

  const isClosetItem =
    item.type === 'closet';

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Handle */}
          <View style={styles.handleBar} />

          {/* Header */}
          <View style={styles.header}>
            <Text
              style={
                styles.headerTitle
              }>
              아이템 상세
            </Text>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={onClose}>
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
                source={item.image}
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
                  {item.name}
                </Text>

                <Text
                  style={
                    styles.itemType
                  }>
                  {isClosetItem
                    ? '내 옷장'
                    : '추천 상품'}
                </Text>

                <View
                  style={
                    styles.tagContainer
                  }>
                  {item.tags.map(
                    tag => (
                      <View
                        key={tag}
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
              </View>
            </View>

            {/* Similar Items */}
            <View style={styles.section}>
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

                <TouchableOpacity
                  activeOpacity={0.8}>
                  <Text
                    style={
                      styles.moreText
                    }>
                    더보기 ›
                  </Text>
                </TouchableOpacity>
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={
                  false
                }>
                {item.similarItems.map(
                  similar => (
                    <SimilarItemCard
                      key={
                        similar.id
                      }
                      item={
                        similar
                      }
                    />
                  ),
                )}
              </ScrollView>
            </View>

            {/* AI Questions */}
            <View style={styles.section}>
              <Text
                style={
                  styles.questionTitle
                }>
                AI 추천 질문
              </Text>

              <QuestionChip
                text="이 아이템으로 다른 코디 추천해줘"
                onPress={() => {
                  onClose();

                  navigation.navigate(
                    '코디추천',
                    {
                      prompt:
                        '이 아이템으로 다른 코디 추천해줘',
                    },
                  );
                }}
              />

              <QuestionChip
                text="이 아이템 뺴고 다시 코디해줘"
                onPress={() => {
                  onClose();

                  navigation.navigate(
                    '코디추천',
                    {
                      prompt:
                        '이 아이템 뺴고 다시 코디해줘',
                    },
                  );
                }}
              />
            </View>
          </ScrollView>

          {/* Bottom Button */}
          <TouchableOpacity
            activeOpacity={0.8}
            style={
              styles.closeButton
            }
            onPress={onClose}>
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
  );
};

export default ItemDetailModal;