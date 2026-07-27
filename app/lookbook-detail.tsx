import React from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';

const dummyOutfits = [
  {
    id: '1',
    image: 'https://picsum.photos/500/700?1',
    date: '2026.07.27',
  },
  {
    id: '2',
    image: 'https://picsum.photos/500/700?2',
    date: '2026.07.26',
  },
  {
    id: '3',
    image: 'https://picsum.photos/500/700?3',
    date: '2026.07.22',
  },
  {
    id: '4',
    image: 'https://picsum.photos/500/700?4',
    date: '2026.07.20',
  },
  {
    id: '5',
    image: 'https://picsum.photos/500/700?5',
    date: '2026.07.18',
  },
  {
    id: '6',
    image: 'https://picsum.photos/500/700?6',
    date: '2026.07.15',
  },
];

export default function LookbookDetailPage() {
  const router = useRouter();

  const renderItem = ({ item }: any) => (
    <TouchableOpacity
      activeOpacity={0.9}
      style={styles.card}
      onPress={() => {
        // TODO : 코디 상세 페이지 이동
      }}
    >
      <Image
        source={{ uri: item.image }}
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
        16개의 코디
      </Text>

      <FlatList
        data={dummyOutfits}
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