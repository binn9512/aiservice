import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import LookbookCard from './LookbookCard';

const dummyLookbooks = [
  {
    id: 'add',
    type: 'add',
  },
  {
    id: '1',
    title: '데이트룩',
    count: 16,
    images: [
      'https://picsum.photos/200?1',
      'https://picsum.photos/200?2',
      'https://picsum.photos/200?3',
      'https://picsum.photos/200?4',
    ],
  },
  {
    id: '2',
    title: '출근룩',
    count: 12,
    images: [
      'https://picsum.photos/200?5',
      'https://picsum.photos/200?6',
      'https://picsum.photos/200?7',
      'https://picsum.photos/200?8',
    ],
  },
  {
    id: '3',
    title: '캐주얼',
    count: 9,
    images: [
      'https://picsum.photos/200?9',
      'https://picsum.photos/200?10',
      'https://picsum.photos/200?11',
      'https://picsum.photos/200?12',
    ],
  },
];

export default function LookbookGrid() {
  return (
    <View style={styles.container}>
      <FlatList
        data={dummyLookbooks}
        keyExtractor={item => item.id}
        numColumns={2}
        renderItem={({ item }) => <LookbookCard item={item} />}
        columnWrapperStyle={styles.row}
        contentContainerStyle={{ paddingBottom: 120 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 15,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
});