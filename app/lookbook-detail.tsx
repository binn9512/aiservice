import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
} from 'react-native';

import Ionicons from '@expo/vector-icons/Ionicons';
import axios from 'axios';
import {
  useRouter,
  useLocalSearchParams,
} from 'expo-router';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL!;


export default function LookbookDetailPage() {
  const router = useRouter();

  const { collectionId, title } =
    useLocalSearchParams<{
      collectionId: string;
      title: string;
    }>();

  const [outfits, setOutfits] = useState<any[]>([]);

  const loadOutfits = async () => {
    try {
      const res = await axios.get(
        `${API_BASE_URL}/collection/${collectionId}`
      );

      if (res.data.success) {
        setOutfits(res.data.outfits);
      }
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    if (collectionId) {
      loadOutfits();
    }
  }, [collectionId]);

  const renderItem = ({ item }: any) => (
    <TouchableOpacity
      activeOpacity={0.9}
      style={styles.card}
      onPress={() => {
        router.push('/lookbook-outfit-detail');
      }}
    >
      <View style={styles.image}>
        <Ionicons
          name="shirt-outline"
          size={46}
          color="#BDBDBD"
          style={{ alignSelf: 'center', marginTop: '45%' }}
        />
      </View>

      <Text style={styles.date}>
        저장된 코디
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>

      <View style={styles.header}>

        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons
            name="chevron-back"
            size={28}
            color="#111"
          />
        </TouchableOpacity>

        <Text style={styles.title}>
          {title}
        </Text>

        <TouchableOpacity>
          <Ionicons
            name="ellipsis-horizontal"
            size={24}
            color="#111"
          />
        </TouchableOpacity>

      </View>

      <Text style={styles.count}>
        {outfits.length}개의 코디
      </Text>

      <FlatList
        data={outfits}
        keyExtractor={(item) => String(item.saved_id)}
        renderItem={renderItem}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  header: {
    height: 60,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111111',
  },

  count: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111111',
    marginHorizontal: 20,
    marginBottom: 18,
  },

  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 110,
  },

  row: {
    justifyContent: 'space-between',
    marginBottom: 18,
  },

  card: {
    width: '48%',
  },

  image: {
    width: '100%',
    aspectRatio: 0.72,
    borderRadius: 18,
    backgroundColor: '#F2F2F2',
  },

  date: {
    marginTop: 10,
    fontSize: 15,
    color: '#666666',
    fontWeight: '500',
  },

});