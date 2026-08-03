import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import axios from 'axios';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL!;

export default function LookbookOutfitDetailScreen() {
  const router = useRouter();
  const { collectionId, savedId } = useLocalSearchParams();

  const [current, setCurrent] = useState<any>(null);

  useEffect(() => {
    loadOutfit();
  }, []);

  const loadOutfit = async () => {
    try {
      const res = await axios.get(
        `${API_BASE_URL}/collection/${collectionId}`
      );

      if (res.data.success) {
        const found = res.data.outfits.find(
          (item: any) =>
            String(item.saved_id) === String(savedId)
        );

        if (found) {
          setCurrent(found);
        }
      }
    } catch (e) {
      console.log(e);
    }
  };

  const items = useMemo(() => {
    if (!current) return [];

    return Object.values(current.items || {}).filter(Boolean);
  }, [current]);

  if (!current) return null;

  const date = new Date(current.created_at);

  const formattedDate =
    `${date.getFullYear()}.` +
    `${String(date.getMonth() + 1).padStart(2, '0')}.` +
    `${String(date.getDate()).padStart(2, '0')}`;

  const outfitImage =
  items.length > 0 ? (items[0] as any).image : undefined;

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
          source={{ uri: outfitImage }}
          style={styles.outfitImage}
        />

        <View style={styles.itemCard}>
          <Text style={styles.itemTitle}>
            코디 아이템
          </Text>

          {items.map((item: any) => (
            <TouchableOpacity
              key={item.id}
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
                {item.name || item.category}
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
          {formattedDate}
        </Text>

        <View style={styles.divider} />

        <Text style={styles.memoTitle}>
          메모
        </Text>

        <Text style={styles.memo}>
          {current.memo || '메모가 없습니다.'}
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