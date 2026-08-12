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

import {
  OutfitItem,
} from '../../types/outfit';

const { width } = Dimensions.get('window');

type Props = {
  recommendedOutfits?: any[];
  onItemPress: (
    item: OutfitItem,
  ) => void;
};

const OutfitCarousel = ({
  recommendedOutfits = [],
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
        if (viewableItems.length > 0) {
          setActiveIndex(
            viewableItems[0]?.index ?? 0,
          );
        }
      },
    ).current;

  const viewConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  if (recommendedOutfits.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={recommendedOutfits}
        horizontal
        pagingEnabled
        bounces={false}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={
          styles.listContent
        }
        keyExtractor={item => item.id}
        renderItem={({ item, index }) => (
          <OutfitCard
            outfit={item}
            outfits={recommendedOutfits}
            index={index}
            onItemPress={onItemPress}
          />
        )}
        viewabilityConfig={viewConfig}
        onViewableItemsChanged={
          onViewableItemsChanged
        }
      />
    </View>
  );
};

export default OutfitCarousel;

const styles = StyleSheet.create({
  container: {
    marginTop: 2,
  },

  listContent: {
    paddingTop: 12,
    paddingHorizontal: 4,
  },
});