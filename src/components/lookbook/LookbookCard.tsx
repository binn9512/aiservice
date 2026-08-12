import React from 'react';
import {
  View,
  Image,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function LookbookCard({
  item,
  onPress,
  onDelete,
}: any) {  if (item.type === 'add') {
    return (
      <TouchableOpacity activeOpacity={0.8} style={styles.card} onPress={onPress}>
        <View style={styles.addPreview}>
          <View style={styles.addCircle}>
            <Ionicons name="add" size={34} color="#fff" />
          </View>
        </View>

        <View style={styles.addInfo}>
          <Text style={styles.title}>
            새 룩북 만들기
          </Text>

          <Text style={styles.count}>
            취향의 코디를 모아보세요
          </Text>
        </View>
      </TouchableOpacity>
    );
  }

  if (item.type === 'favorite') {
    return (
      <TouchableOpacity
        activeOpacity={0.8}
        style={styles.card}
        onPress={onPress}
      >
        <View style={styles.favoritePreview}>
          <Ionicons
            name="heart-outline"
            size={56}
            color="#FFD7E4"
          />
        </View>

        <Text style={styles.favoriteTitle}>
          즐겨찾기
        </Text>

        <Text style={styles.favoriteCount}>
          좋아요 누른 코디
        </Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      style={styles.card}
      onPress={onPress}
    >
        <View style={styles.previewGrid}>
          {(item.images ?? []).length === 0 ? (
            <View style={styles.emptyPreview}>
              <Ionicons
                name="images-outline"
                size={40}
                color="#C7C7C7"
              />
            </View>
          ) : (
            item.images.slice(0, 2).map((img: string, index: number) => (
              <Image
                key={index}
                source={{ uri: img }}
                style={
                  item.images.length === 1
                    ? styles.previewImageSingle
                    : styles.previewImage
                }
                resizeMode="cover"
              />
            ))
          )}
        </View>

      <View style={styles.info}>
        <View style={styles.textBox}>
          <Text
            style={styles.title}
            numberOfLines={1}
          >
            {item.title}
          </Text>

          <Text style={styles.count}>
            {item.count}개의 코디
          </Text>
        </View>

        <TouchableOpacity
          style={styles.moreButton}
          hitSlop={{
            top: 10,
            bottom: 10,
            left: 10,
            right: 10,
          }}
          onPress={() => {
            Alert.alert(
              '룩북 삭제',
              `"${item.title}" 룩북을 삭제할까요?\n이 룩북에 저장된 코디도 함께 삭제됩니다.`,
              [
                {
                  text: '취소',
                  style: 'cancel',
                },
                {
                  text: '삭제',
                  style: 'destructive',
                  onPress: () => onDelete?.(item),
                },
              ]
            );
          }}
        >
          <Ionicons
            name="ellipsis-horizontal"
            size={22}
            color="#777"
          />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '48%',
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ECECEC',
    marginBottom: 16,
  },

  previewGrid: {
    flexDirection: 'row',
    width: '100%',
    height: 150,
    backgroundColor: '#F8F8F8',
  },

  previewImage: {
    width: '50%',
    height: '100%',
    borderRightWidth: 1,
    borderColor: '#fff',
  },

  previewImageSingle: {
    width: '100%',
    height: '100%',
  },

  emptyPreview: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  info: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
    minHeight: 62,
  },

  textBox: {
    flex: 1,
  },

  title: {
    fontSize: 17,
    fontWeight: '600',
    color: '#111',
  },

  count: {
    marginTop: 4,
    fontSize: 13,
    color: '#8A8A8A',
  },

  addPreview: {
    height: 150,
    backgroundColor: '#FFF9FB',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#FFD7E4',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 1,
    marginTop: 1,
    borderRadius: 20
  },

  addCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#FF5C8A',
    justifyContent: 'center',
    alignItems: 'center',
  },

  addText: {
    marginTop: 14,
    fontSize: 16,
    fontWeight: '600',
    color: '#FF5C8A',
  },

  favoritePreview: {
    height: 150,
    width: '100%',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#FFD7E4',
    backgroundColor: '#FCFCFC',
    justifyContent: 'center',
    alignItems: 'center',
  },

  favoriteTitle: {
    marginTop: 12,
    marginHorizontal: 14,
    fontSize: 17,
    fontWeight: '600',
    color: '#111',
  },

  favoriteCount: {
    marginTop: 5,
    marginHorizontal: 14,
    fontSize: 13,
    color: '#8A8A8A',
  },
  moreButton: {
    width: 30,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },

  addInfo: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 10,
    minHeight: 62,
  },
});