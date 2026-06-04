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

import {
  useNavigation,
  NavigationProp,
} from '@react-navigation/native';

type Props = {
  outfit: Outfit;

  outfits: Outfit[];

  index: number;

  onItemPress: (
    item: OutfitItem,
  ) => void;
};

const OutfitCard = ({
  outfit,
  outfits,
  index,
  onItemPress,
}: Props) => {
  const navigation =
    useNavigation<
      NavigationProp<any>
    >();

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      style={styles.card}
      onPress={() =>
        navigation.navigate(
          'RecommendOutfitDetail',
          {
            outfits,
            initialIndex: index,
          },
        )
      }>

      {/* Model Image */}
      <View style={styles.modelContainer}>
        <Image
          source={outfit.modelImage}
          style={styles.modelImage}
          resizeMode="contain"
        />
      </View>

      {/* Item List */}
      <View style={styles.itemSection}>
        {outfit.items.map(item => {
          console.log(item);

          const isClosetItem =
            item.type ===
            'closet';

          return (
            <TouchableOpacity
              key={item.id}
              activeOpacity={0.8}
              style={styles.itemButton}
              onPress={() =>
                onItemPress(item)
              }>

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

              <View style={{ flex: 1 }}>
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
    </TouchableOpacity>
  );
};

export default OutfitCard;