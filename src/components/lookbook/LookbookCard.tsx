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
          <Text style={styles.addTitle}>새 룩북 만들기</Text>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity activeOpacity={0.9} style={styles.card}>
      <View style={styles.previewGrid}>
        {item.images.map((img: string, index: number) => (
          <Image
            key={index}
            source={{ uri: img }}
            style={styles.previewImage}
          />
        ))}
      </View>

      <View style={styles.info}>
        <View style={styles.textBox}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.count}>{item.count}개의 코디</Text>
        </View>

        <Ionicons
          name="ellipsis-horizontal"
          size={18}
          color="#888"
        />
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    minHeight: 50,
  },

  textBox: {
    flex: 1,
  },

  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111',
  },

  count: {
    marginTop: 4,
    fontSize: 14,
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

  addTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#111',
  },
});