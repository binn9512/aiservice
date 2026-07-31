import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';

const dummyLookbooks = [
  {
    id: '1',
    title: '데이트룩',
    date: '2026.07.27',
    memo: '오늘 데이트 갈 때 입었던 코디 💕',
    outfitImage: 'https://picsum.photos/700/1000?1',
    items: [
      {
        name: '화이트 셔츠',
        image: 'https://picsum.photos/100?11',
      },
      {
        name: '데님 팬츠',
        image: 'https://picsum.photos/100?12',
      },
      {
        name: '스니커즈',
        image: 'https://picsum.photos/100?13',
      },
    ],
  },
  {
    id: '2',
    title: '캠퍼스룩',
    date: '2026.07.26',
    memo: '편하게 입은 학교 코디',
    outfitImage: 'https://picsum.photos/700/1000?2',
    items: [
      {
        name: '후드티',
        image: 'https://picsum.photos/100?21',
      },
      {
        name: '조거팬츠',
        image: 'https://picsum.photos/100?22',
      },
    ],
  },
];

export default function LookbookOutfitDetailScreen() {
  const router = useRouter();
  const { outfitId } = useLocalSearchParams();

  const current =
    dummyLookbooks.find(v => v.id === outfitId) ??
    dummyLookbooks[0];

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons
            name="chevron-back"
            size={28}
            color="#111"
          />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>
          {current.title}
        </Text>

        <TouchableOpacity>
          <Ionicons
            name="ellipsis-horizontal"
            size={22}
            color="#111"
          />
        </TouchableOpacity>
      </View>

      <View style={styles.imageSection}>
        <Image
          source={{ uri: current.outfitImage }}
          style={styles.outfitImage}
        />

        <View style={styles.itemCard}>
          <Text style={styles.itemTitle}>
            코디 아이템
          </Text>

          {current.items.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.itemRow}
            >
              <Image
                source={{ uri: item.image }}
                style={styles.itemImage}
              />

              <Text
                numberOfLines={1}
                style={styles.itemName}
              >
                {item.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.infoBox}>
        <Text style={styles.lookbookTitle}>
          {current.title}
        </Text>

        <Text style={styles.date}>
          {current.date}
        </Text>

        <View style={styles.divider} />

        <Text style={styles.memoTitle}>
          메모
        </Text>

        <Text style={styles.memo}>
          {current.memo}
        </Text>

        <TouchableOpacity style={styles.retryButton}>
          <Text style={styles.retryText}>
            이 코디 다시 추천받기
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },

  header: {
    paddingTop: 58,
    paddingHorizontal: 20,
    paddingBottom: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111',
  },

  imageSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
  },

  outfitImage: {
    width: 230,
    height: 340,
    borderRadius: 18,
    backgroundColor: '#F3F3F3',
  },

  itemCard: {
    flex: 1,
    marginLeft: 14,
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ECECEC',
    padding: 12,
  },

  itemTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 12,
    color: '#111',
  },

  itemRow: {
    alignItems: 'center',
    marginBottom: 16,
  },

  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
  },

  itemName: {
    marginTop: 6,
    fontSize: 12,
    color: '#555',
    textAlign: 'center',
  },

  infoBox: {
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 40,
  },

  lookbookTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111',
  },

  date: {
    marginTop: 6,
    fontSize: 14,
    color: '#888',
  },

  divider: {
    height: 1,
    backgroundColor: '#EEEEEE',
    marginVertical: 20,
  },

  memoTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111',
    marginBottom: 10,
  },

  memo: {
    fontSize: 15,
    color: '#555',
    lineHeight: 24,
  },

  retryButton: {
    marginTop: 30,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#FF5C8A',
    justifyContent: 'center',
    alignItems: 'center',
  },

  retryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});