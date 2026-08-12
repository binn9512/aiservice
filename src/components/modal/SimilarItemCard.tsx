import React from 'react';

import {
  TouchableOpacity,
  Image,
  Text,
} from 'react-native';

import { SimilarItem } from '../../types/outfit';

import styles from './itemDetail.styles';

type Props = {
  item: SimilarItem;
};

const SimilarItemCard = ({
  item,
}: Props) => {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      style={styles.similarCard}>
      <Image
        source={
          typeof item?.image ===
          'string'
            ? {uri: item.image}
            : item?.image
        }
        style={styles.similarImage}
        resizeMode="cover"
      />

      <Text
        numberOfLines={1}
        style={styles.similarName}>
        {item.name}
      </Text>
    </TouchableOpacity>
  );
};

export default SimilarItemCard;