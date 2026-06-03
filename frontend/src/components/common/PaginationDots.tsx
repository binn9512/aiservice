import React from 'react';

import {
  View,
  StyleSheet,
} from 'react-native';

type Props = {
  total: number;

  activeIndex: number;
};

const PaginationDots = ({
  total,
  activeIndex,
}: Props) => {
  if (total <= 1) {
    return null;
  }

  return (
    <View style={styles.container}>
      {Array.from({
        length: total,
      }).map((_, index) => {
        const isActive =
          activeIndex === index;

        return (
          <View
            key={index}
            style={[
              styles.dot,

              isActive &&
                styles.activeDot,
            ]}
          />
        );
      })}
    </View>
  );
};

export default PaginationDots;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',

    justifyContent:
      'center',

    alignItems: 'center',

    marginTop: 12,
  },

  dot: {
    width: 7,
    height: 7,

    borderRadius: 999,

    backgroundColor: '#DDDDDD',

    marginHorizontal: 4,
  },

  activeDot: {
    width: 8,
    height: 8,

    backgroundColor: '#FF5C8A',
  },
});