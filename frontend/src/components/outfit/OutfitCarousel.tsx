import React, {
  useRef,
  useState,
} from 'react';

import {
  View,
  StyleSheet,
  FlatList,
  Dimensions,
  ViewToken,
} from 'react-native';

import OutfitCard from './OutfitCard';

import PaginationDots from '../common/PaginationDots';

import mockOutfits, {
  OutfitItem,
} from '../../data/mockOutfits';

const { width } = Dimensions.get(
  'window',
);

const CARD_WIDTH = width * 0.92;

const SPACING = 12;

type Props = {
  recommendedOutfits?: any[];
  onItemPress: (
    item: OutfitItem,
  ) => void;
};

const OutfitCarousel = ({
  recommendedOutfits,
  onItemPress,
}: Props) => {
  const flatListRef =
    useRef<FlatList>(null);

  const [activeIndex, setActiveIndex] =
    useState(0);

  const onViewableItemsChanged =
    useRef(
      ({
        viewableItems,
      }: {
        viewableItems: ViewToken[];
      }) => {
        if (
          viewableItems.length > 0
        ) {
          setActiveIndex(
            viewableItems[0]
              ?.index ?? 0,
          );
        }
      },
    ).current;

  const viewConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={
          recommendedOutfits &&
          recommendedOutfits.length > 0
            ? recommendedOutfits
            : mockOutfits
        }
        horizontal
        bounces={false}
        pagingEnabled
        
      
        showsHorizontalScrollIndicator={
          false
        }
        contentContainerStyle={
          styles.listContent
        }
        keyExtractor={item =>
          item.id
        }
        renderItem={({
          item,
          index,
        }) => (
          <OutfitCard
            outfit={item}
            outfits={
              recommendedOutfits &&
              recommendedOutfits.length > 0
                ? recommendedOutfits
                : mockOutfits
            }
            index={index}
            onItemPress={
              onItemPress
            }
          />
        )}
        viewabilityConfig={
          viewConfig
        }
        onViewableItemsChanged={
          onViewableItemsChanged
        }
      />

      <PaginationDots
        total={
          recommendedOutfits &&
          recommendedOutfits.length > 0
            ? recommendedOutfits.length
            : mockOutfits.length
        }
        activeIndex={activeIndex}
      />
    </View>
  );
};

export default OutfitCarousel;

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
  },

  listContent: {
  paddingTop: 12,

  paddingHorizontal: 4,
},
});