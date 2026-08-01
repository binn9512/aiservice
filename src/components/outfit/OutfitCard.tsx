import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Linking,
} from 'react-native';

import styles from './outfitCard.styles';
import {
  Outfit,
  OutfitItem,
} from '../../data/mockOutfits';

import { useRouter } from 'expo-router';

type ExtendedOutfitItem = OutfitItem & {
  is_shop?: boolean;
  buy_url?: string;
  brand?: string;
  price?: number;
};

type Props = {
  outfit?: Outfit;
  outfits?: Outfit[];
  index?: number;
  onItemPress?: (item: OutfitItem) => void;
};

const OutfitCard = ({
  outfit,
  outfits = [],
  index = 0,
  onItemPress,
}: Props) => {
  const router = useRouter();

  // 🌟 outfit 또는 items가 undefined일 때 튕기지 않도록 방어 처리
  const itemList = outfit?.items || [];

  if (!outfit || itemList.length === 0) {
    return null;
  }

  const navigateToDetail = () => {
    router.push({
      pathname: '/recommend-outfit-detail',
      params: {
        outfits: JSON.stringify(outfits),
        initialIndex: index,
      },
    });
  };

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      style={styles.card}
      onPress={navigateToDetail}>

      {/* Item List */}
      <View style={styles.itemSection}>
        {itemList.map((rawItem) => {
          const item = rawItem as ExtendedOutfitItem;

          // 무신사 상품 여부 판별
          const isShop = item?.is_shop || (typeof item?.id === 'string' && item.id.startsWith('SHOP_'));

          return (
            <TouchableOpacity
              key={item?.id || Math.random().toString()}
              activeOpacity={0.8}
              style={[
                styles.itemButton,
                isShop && { borderColor: '#333333', backgroundColor: '#FAFAFA' }
              ]}
              onPress={() => {
                // 🛍️ 무신사 상품이면 누르는 순간 무신사 구매 페이지로 이동!
                if (isShop && item?.buy_url) {
                  Linking.openURL(item.buy_url);
                } else if (onItemPress) {
                  onItemPress(item);
                }
              }}>

              {/* 옷 이미지 */}
              <Image
                source={
                  typeof item?.image === 'string'
                    ? { uri: item.image }
                    : item?.image
                }
                style={{
                  width: 40,
                  height: 40,
                  marginRight: 10,
                  borderRadius: 6,
                }}
                resizeMode="contain"
              />

              {/* 옷 정보 영역 */}
              <View
                style={{
                  flex: 1,
                  justifyContent: 'center',
                }}>
                <Text
                  numberOfLines={1}
                  style={styles.itemName}>
                  {/* 무신사 옷일 경우 브랜드 강조 */}
                  {isShop && item?.brand ? (
                    <Text style={{ fontWeight: 'bold', color: '#000000' }}>
                      [{item.brand}]{' '}
                    </Text>
                  ) : null}
                  {item?.name || '추천 아이템'}
                </Text>

                {/* 하단 태그 / 가격 영역 */}
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
                  {isShop ? (
                    <Text style={{ fontSize: 11, fontWeight: '700', color: '#FF4D6D' }}>
                      {item?.price ? `${item.price.toLocaleString()}원` : '무신사 특가'}
                      <Text style={{ color: '#666666', fontWeight: '400' }}> | 사러 가기 🔗</Text>
                    </Text>
                  ) : (
                    <View style={styles.tagContainer}>
                      {item?.tags && item.tags.slice(0, 1).map((tag: string) => (
                        <View key={tag} style={styles.tag}>
                          <Text style={styles.tagText}>#{tag}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              </View>

              {/* 🏷️ 내 옷장 vs 무신사 구분 뱃지 */}
              <View
                style={{
                  paddingHorizontal: 8,
                  paddingVertical: 3,
                  borderRadius: 4,
                  backgroundColor: isShop ? '#111111' : '#FFE4E8',
                  marginLeft: 6,
                }}>
                <Text
                  style={{
                    fontSize: 10,
                    fontWeight: 'bold',
                    color: isShop ? '#FFFFFF' : '#FF4D6D',
                  }}>
                  {isShop ? '무신사' : '내 옷장'}
                </Text>
              </View>

            </TouchableOpacity>
          );
        })}
      </View>

      {/* 하단 아바타에 입혀보기 버튼 */}
      <TouchableOpacity
        style={styles.avatarButton}
        onPress={navigateToDetail}>
        <Text style={styles.avatarButtonText}>
          내 아바타에 입혀보기
        </Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

export default OutfitCard;