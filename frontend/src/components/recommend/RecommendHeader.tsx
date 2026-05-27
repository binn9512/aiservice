import React from 'react';

import {
  View,
  Text,
  TouchableOpacity,
} from 'react-native';

import styles from '../../styles/recommend.styles';

type Props = {
  onPressMenu: () => void;
};

const RecommendHeader = ({
  onPressMenu,
}: Props) => {
  return (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        <View>
          <Text
            style={
              styles.headerTitle
            }>
            AI 코디 추천
          </Text>

          <Text
            style={
              styles.headerSubtitle
            }>
            원하는 스타일을
            자유롭게 물어보세요
          </Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onPressMenu}>
          <Text
            style={
              styles.menuButton
            }>
            ☰
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default RecommendHeader;