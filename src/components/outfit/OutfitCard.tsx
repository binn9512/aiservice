import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
} from 'react-native';

import styles from './outfitCard.styles';
import {
  Outfit,
  OutfitItem,
} from '../../data/mockOutfits';

// 1️⃣ expo-router에서 useRouter 가져오기
import { useRouter } from 'expo-router';

type Props = {
  outfit: Outfit;
  outfits: Outfit[];
  index: number;
  onItemPress: (item: OutfitItem) => void;
};

const OutfitCard = ({
  outfit,
  outfits,
  index,
  onItemPress,
}: Props) => {
  // 2️⃣ router 사용 선언
  const router = useRouter();

  // 3️⃣ 이동 함수를 router.push로 변경 (JSON 직렬화 필수)
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
        {outfit.items.map(item => {
          return (
            <TouchableOpacity
              key={item.id}
              activeOpacity={0.8}
              style={styles.itemButton}
              onPress={() => onItemPress(item)}>

              <Image
                source={
                  typeof item.image === 'string'
                    ? { uri: item.image }
                    : item.image
                }
                style={{
                  width: 40,
                  height: 40,
                  marginRight: 10,
                }}
                resizeMode="contain"
              />

              <View
                style={{
                  flex: 1,
                  justifyContent: 'center',
                }}>
                <Text
                  numberOfLines={1}
                  style={styles.itemName}>
                  {item.name}
                </Text>

                <View style={styles.tagContainer}>
                  {item.tags.slice(0, 1).map(tag => (
                    <View
                      key={tag}
                      style={styles.tag}>
                      <Text
                        style={styles.tagText}>
                        #{tag}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

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