import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Linking,
} from 'react-native';


import styles from './outfitCard.styles';

import { useRouter } from 'expo-router';

import { OutfitItem } from '../../types/outfit';

type Outfit = {
  id: string;
  modelImage: any;
  items: OutfitItem[];
};

type ExtendedOutfitItem = OutfitItem & {
  is_shop?: boolean;
  buy_url?: string;
  product_url?: string;
  brand?: string;
  price?: number;
  img_url?: string;
  image_url?: string;
  no_bg_url?: string;
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

  const rawItemList = outfit?.items || [];

  // 코디 아이템 표시 순서
  const CATEGORY_ORDER = [
    '모자',
    '아우터',
    '코트',
    '패딩',
    '자켓',
    '가디건',
    '집업',
    '원피스',
    '반팔 티셔츠',
    '긴팔 티셔츠',
    '셔츠/블라우스',
    '니트/스웨터',
    '맨투맨/후드',
    '슬리브리스',
    '데님 팬츠',
    '슬랙스',
    '반바지',
    '트레이닝 팬츠',
    '스커트',
    '운동화/스니커즈',
    '구두/로퍼',
    '힐',
    '부츠',
    '샌들/슬리퍼',
    '백팩',
    '숄더백/토트백',
    '크로스백',
    '클러치',
  ];

  // 머리 → 발 순서로 정렬 후 최대 6개
  const itemList = [...rawItemList]
    .filter(item => item)
    .sort((a, b) => {
      const aIndex = CATEGORY_ORDER.indexOf(a?.category);
      const bIndex = CATEGORY_ORDER.indexOf(b?.category);

      return (
        (aIndex === -1 ? 999 : aIndex) -
        (bIndex === -1 ? 999 : bIndex)
      );
    })
    .slice(0, 6);

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
        {itemList.map((rawItem: ExtendedOutfitItem, itemIndex: number) => {
          const item = rawItem;

          // 무신사 상품 여부 판별
          const isShop = item?.is_shop || (typeof item?.id === 'string' && item.id.startsWith('SHOP_'));

          // 고유 Key 생성
          const itemKey = item?.id ? `${item.id}-${itemIndex}` : `item-${itemIndex}`;

          // 구매 링크 추출
          const rawLink = item?.buy_url || item?.product_url;
          const hasValidLink = typeof rawLink === 'string' && rawLink !== 'nan' && rawLink.startsWith('http');

          // 🔍 터미널 이미지 주소 디버깅 확인용
          const debugUri = item?.img_url || item?.image_url || (typeof item?.image === 'string' ? item.image : undefined);
          console.log(`[Item ${itemIndex}] 이름: ${item?.name} | 이미지주소:`, debugUri);

          return (
            <TouchableOpacity
              key={itemKey}
              activeOpacity={0.8}
              style={[
                styles.itemButton,
                isShop && { borderColor: '#333333', backgroundColor: '#FAFAFA' }
              ]}
              onPress={() => {
                if (onItemPress) {
                  onItemPress(item); // 무신사 옷이든 내 옷장 옷이든 기존 모달로 넘겨줌!
                }
              }}>
              {/* 🌟 옷 이미지 렌더링 영역 */}
              <Image
                source={(() => {
                  // 1. 후보 키에서 이미지 주소 추출 (누끼 이미지 no_bg_url을 1순위로 탐색!)
                  let imgUri = item?.no_bg_url || item?.img_url || item?.image_url || (typeof item?.image === 'string' ? item.image : undefined);

                  if (imgUri && typeof imgUri === 'string') {
                    // 역슬래시(\) -> 웹 슬래시(/) 변환
                    imgUri = imgUri.replace(/\\/g, '/').trim();

                    // 무신사 CDN 주소가 //image.msscdn.net... 처럼 스키마 없이 넘어올 경우 대응
                    if (imgUri.startsWith('//')) {
                      imgUri = 'https:' + imgUri;
                    }
                    // http로 시작하는 무신사 주소는 iOS 차단 방지를 위해 https로 변경
                    else if (imgUri.startsWith('http://image.msscdn.net')) {
                      imgUri = imgUri.replace('http://', 'https://');
                    }

                    if (imgUri !== '' && imgUri !== 'nan') {
                      // 💡 무신사 이미지 CDN 403 차단 우회를 위한 Header 추가
                      return {
                        uri: imgUri,
                        headers: {
                          'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)',
                          'Referer': 'https://www.musinsa.com/',
                        },
                      };
                    }
                  }

                  // 2. require() 로컬 객체인 경우
                  if (item?.image && typeof item.image !== 'string') {
                    return item.image;
                  }

                  // 3. 주소가 없거나 로딩 실패 시 기본 이미지
                  return { uri: 'https://via.placeholder.com/100?text=No+Image' };
                })()}
                style={{
                  width: 48,
                  height: 48,
                  marginRight: 8,
                  borderRadius: 6,
                  backgroundColor: '#FFFFFF',
                }}
                resizeMode="contain"
              />

              {/* 옷 정보 영역 */}
              <View style={{ flex: 1, justifyContent: 'center' }}>
                <Text numberOfLines={1} style={styles.itemName}>
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