import React from 'react';
import {
  View,
  Image,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function LookbookCard({ item, onPress }: any) {  if (item.type === 'add') {
    return (
      <TouchableOpacity activeOpacity={0.8} style={styles.card} onPress={onPress}>
        <View style={styles.addPreview}>
          <View style={styles.addCircle}>
            <Ionicons name="add" size={34} color="#fff" />
          </View>
        </View>

        <View style={styles.info}>
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
            color="#D6D6D6"
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
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Ionicons
              name="images-outline"
              size={40}
              color="#C7C7C7"
            />
          </View>
        ) : (
          item.images.map((img: string, index: number) => (
            <Image
              key={index}
              source={{ uri: img }}
              style={styles.previewImage}
            />
          ))
        )}
      </View>

      <View style={styles.info}>
        <View style={styles.textBox}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.count}>{item.count}개의 코디</Text>
        </View>
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
    flexWrap: 'wrap',
    height: 150,
    backgroundColor: '#F8F8F8',
  },

  previewImage: {
    width: '50%',
    height: '50%',
    borderWidth: 1,
    borderColor: '#fff',
  },

  info: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
    minHeight: 50,
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
    borderColor: '#EAEAEA',
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
});