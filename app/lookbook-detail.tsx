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
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';



export default function LookbookDetailPage() {
  const router = useRouter();
  const [lookbooks, setLookbooks] = useState<any[]>([]);

  const loadLookbooks = async () => {
    try {
        const saved = await AsyncStorage.getItem('LOOKBOOKS');

        if (saved) {
        setLookbooks(JSON.parse(saved));
        } else {
        setLookbooks([]);
        }
    } catch (e) {
        console.log(e);
    }
    };

    useEffect(() => {
    loadLookbooks();
    }, []);

  const renderItem = ({ item }: any) => (
    <TouchableOpacity
      activeOpacity={0.9}
      style={styles.card}
      onPress={() => {
        router.push({
            pathname: '/lookbook-outfit-detail',
            params: {
                outfitId: item.id,
            },
            });
        }}
    >
      <Image
      source={
        typeof item.outfitImage === 'string'
            ? { uri: item.outfitImage }
            : item.outfitImage
        }
      style={styles.image}
      />

      <Text style={styles.date}>
        {item.date}
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
          2026.07.27
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
        {lookbooks.length}개의 코디
      </Text>

      <FlatList
        data={lookbooks}
        keyExtractor={(item) => item.id}
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