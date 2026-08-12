import React from 'react';

import {
  View,
  TouchableOpacity,
  Text,
} from 'react-native';

import styles from '../../styles/recommend.styles';

type Props = {
  value: boolean;

  onToggle: () => void;
};

const ClosetToggle = ({
  value,
  onToggle,
}: Props) => {
  return (
    <View
      style={
        styles.closetToggleWrapper
      }>
      <TouchableOpacity
        activeOpacity={0.8}
        style={styles.toggleButton}
        onPress={onToggle}>
        <View
          style={[
            styles.toggleCircle,

            value &&
              styles.toggleCircleActive,
          ]}
        />

        <Text
          style={styles.toggleText}>
          내 옷만 사용
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default ClosetToggle;