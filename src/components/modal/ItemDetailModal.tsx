import React, { useState } from 'react';

import {
  Modal,
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  Pressable,
  Linking, // 🔗 외부 링크 이동을 위해 추가!
} from 'react-native';

import SimilarItemCard from './SimilarItemCard';
import QuestionChip from './QuestionChip';

import { OutfitItem } from '../../types/outfit';

import styles from './itemDetail.styles';

type Props = {
  visible: boolean;
  item: OutfitItem | null;
  onClose: () => void;

  onRecommendQuestion?: (prompt: string) => void;
};

const ItemDetailModal = ({
  visible,
  item,
  onClose,
  onRecommendQuestion,
}: Props) => {
  const [selectedSimilarItem, setSelectedSimilarItem] = useState<any>(null);

  if (!item) {
    return null;
  }

  const currentItem: any = selectedSimilarItem || item;

  // 1. 내 옷장 vs 무신사 상품 구분 (is_shop, SHOP_ prefix, type으로 확인)
  const isShop =
    currentItem?.is_shop ||
    currentItem?.type === 'shop' ||
    (typeof currentItem?.id === 'string' && currentItem.id.startsWith('SHOP_'));

  const isClosetItem = currentItem?.type === 'closet' || !isShop;

  // 2. 구매 링크 URL 추출 (buy_url 또는 product_url)
  const rawLink = currentItem?.buy_url || currentItem?.product_url;
  const hasValidLink =
    typeof rawLink === 'string' && rawLink !== 'nan' && rawLink.startsWith('http');

  // 3. 🌟 이미지 주소 추출 (no_bg_url 및 image를 1순위로 탐색하도록 보완!)
  const imgUri =
    currentItem?.no_bg_url ||
    (typeof currentItem?.image === 'string' ? currentItem.image : undefined) ||
    currentItem?.img_url ||
    currentItem?.image_url;

  return (
    <>
      {/* 메인 모달 */}
      <Modal
        visible={visible && !selectedSimilarItem}
        animationType="slide"
        transparent>
        <Pressable style={styles.overlay} onPress={onClose}>
          <Pressable style={styles.container} onPress={() => { }}>
            {/* Handle */}
            <View style={styles.handleBar} />

            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.headerTitle}>아이템 상세</Text>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={onClose}>
                <Text style={styles.closeText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Main Item */}
              <View style={styles.mainSection}>
                <Image
                  source={
                    imgUri
                      ? { uri: imgUri }
                      : typeof currentItem?.image === 'object'
                        ? currentItem.image
                        : { uri: 'https://via.placeholder.com/100?text=No+Image' }
                  }
                  style={styles.itemImage}
                  resizeMode="contain"
                />

                <View style={styles.infoSection}>
                  {/* 브랜드명이 있으면 같이 표시 */}
                  <Text style={styles.itemName}>
                    {currentItem?.brand ? `[${currentItem.brand}] ` : ''}
                    {currentItem?.name || '아이템'}
                  </Text>

                  <Text style={styles.itemType}>
                    {isShop ? '무신사 추천 상품' : '내 옷장'}
                  </Text>

                  {currentItem?.tags?.length > 0 && (
                    <View style={styles.tagContainer}>
                      {currentItem.tags.map((tag: string) => (
                        <View key={tag} style={styles.tag}>
                          <Text style={styles.tagText}>#{tag}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              </View>

              {/* 🌟 무신사 상품이고 올바른 링크가 있는 경우 [구매 버튼] */}
              {isShop && hasValidLink && (
                <TouchableOpacity
                  activeOpacity={0.8}
                  style={{
                    backgroundColor: '#111111',
                    paddingVertical: 12,
                    borderRadius: 10,
                    alignItems: 'center',
                    marginBottom: 16,
                  }}
                  onPress={() => Linking.openURL(rawLink)}>
                  <Text style={{ color: '#FFFFFF', fontWeight: 'bold', fontSize: 14 }}>
                    무신사에서 상품 보기 🔗
                  </Text>
                </TouchableOpacity>
              )}

              {/* Similar Items */}
              {item?.similarItems?.length > 0 && (
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>대체 아이템</Text>
                  </View>

                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}>
                    {item.similarItems.map((similar: any) => (
                      <TouchableOpacity
                        key={similar?.id}
                        activeOpacity={0.8}
                        onPress={() => setSelectedSimilarItem(similar)}>
                        <SimilarItemCard item={similar} />
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}

              {/* AI Questions */}
              <View style={styles.section}>
                <Text style={styles.questionTitle}>추천 질문</Text>

                <QuestionChip
                  text="이 아이템으로 다른 코디 추천해줘"
                  onPress={() => {
                    onRecommendQuestion?.(
                      `${item.name} (${item.tags?.join(', ') || ''})으로 다른 코디 추천해줘`,
                    );
                    onClose();
                  }}
                />

                <QuestionChip
                  text="이 아이템 빼고 다시 코디해줘"
                  onPress={() => {
                    onRecommendQuestion?.(
                      `${item.name} (${item.tags?.join(', ') || ''}) 빼고 다시 코디해줘`,
                    );
                    onClose();
                  }}
                />
              </View>
            </ScrollView>

            {/* Bottom Button */}
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.closeButton}
              onPress={onClose}>
              <Text style={styles.closeButtonText}>닫기</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      {/* 대체 아이템 상세 모달 */}
      <Modal
        visible={!!selectedSimilarItem}
        animationType="slide"
        transparent>
        <Pressable
          style={styles.overlay}
          onPress={() => setSelectedSimilarItem(null)}>
          <Pressable style={styles.container} onPress={() => { }}>
            {/* Handle */}
            <View style={styles.handleBar} />

            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setSelectedSimilarItem(null)}>
                <Text style={styles.closeText}>‹</Text>
              </TouchableOpacity>

              <Text style={styles.headerTitle}>대체 아이템 상세</Text>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setSelectedSimilarItem(null)}>
                <Text style={styles.closeText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Similar Item Content */}
            </ScrollView>

            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.closeButton}
              onPress={() => setSelectedSimilarItem(null)}>
              <Text style={styles.closeButtonText}>닫기</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
};

export default ItemDetailModal;